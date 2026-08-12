---
name: remove-ai-slops
description: "从分支改动或显式文件列表中移除 AI 生成的代码坏味道 (slop)。先用回归测试锁定行为，再通过 `deep` agent 分批并行（每批 5 个）执行分类清理，最后用质量门禁进行校验。涵盖 10 类 slop，包括性能等价改写、过度复杂（object 类型标注、if/elif 变体链），以及超大模块（纯代码 250 行以上需强制模块化重构）。当用户要求 \"remove slop\"、\"clean AI code\"、\"deslop\"、\"cleanup AI generated\"、\"remove AI slop\"、\"clean up AI-generated code\"，或希望清理近期改动中的 AI 生成模式时，必须使用本 skill。触发词 - \"remove ai slops\"、\"clean ai code\"、\"deslop\"、\"cleanup AI generated\"、\"remove AI slop\"、\"clean up AI-generated code\"、\"strip slop\"、\"ai-slop cleanup\"。"
---

# Remove AI Slops Skill

## 输入

- **默认范围**: 分支相对 `merge-base main` 的 diff（无需参数）
- **可选范围**: 调用方传入的显式文件列表（例如某个 Ralph workflow 的 changed-files 集合）

## 本 skill 做什么

在严格保持行为不变的前提下，清理一组有限改动文件中的 AI slop。先用回归测试锁定行为，再执行多轮分类清理，最后用质量门禁和关键评审进行校验。当校验失败时回滚或直接编辑修复。

核心安全不变式：**在删除任何一行代码之前，行为已被绿色测试锁定**。一份清单本身并不构成安全；通过的回归测试才是。

---

## 类别（哪些算作 slop）

agent 会查找以下九个类别。前三个偏风格，中间三个偏结构，再下面两个关注隐藏成本，最后一个关注行为覆盖。

### 风格类
1. **显而易见的注释** - 复述代码的注释、无关紧要的 docstring、分节分隔符、被注释掉的代码、含糊的 TODO/Note。
   - 保留：解释 WHY 的注释（业务逻辑、边界情况、临时变通方案）、工单链接、正则/算法说明。
   - 保留：BDD 标记（`# given`、`# when`、`# then`、`# when/then`）。

2. **过度防御的代码** - 对必然有值的变量做 null 检查、对不会抛异常的代码包 try/except、对静态类型参数做 isinstance 检查、为必填参数加默认值、向后兼容垫片、在多层重复的冗余校验、**宽泛的异常捕获**（Python 中的 `except Exception`/`except BaseException`，TypeScript/JavaScript 中不收窄类型的空 `catch {}` 或 `catch (e) { console.error(e) }`）。
   - 保留：系统边界处的校验（用户输入、外部 API）、I/O 错误处理、可为空的 DB 字段。顶层边界的兜底捕获（CLI 的 `main()`、HTTP handler）只要显式记录日志并重新抛出，可以接受。
   - 重构：`except Exception` → 捕获你预期的那一类具体异常。空 `catch {}` → 加 `instanceof` 收窄或重新抛出。`catch (e) { log(e) }` → 用 `instanceof` 收窄，处理已知情形，未知情形重新抛出。
   - 必须提供证据：在删除信任边界上的任何校验或错误处理之前，Phase 2 必须包含一条**对抗式**回归（畸形或恶意输入），如果移除该防护，测试应当失败。没有对抗测试 → 该防护保留。要移除的冗余防御是指在边界*内部*已经存在的重复检查；无法证明其冗余的防护就是承重的，应予保留。

3. **过度复杂** - 深层嵌套（>3 层）、嵌套三元表达式、复杂布尔表达式（组合 4 个及以上谓词）、长参数列表（>5 个参数且没有 struct/dataclass/object 包装）、上帝函数（超过 50 行且做了很多事）、牺牲可读性的过度精巧单行代码、用于类型/枚举/字面量分派的 `if/elif/else` 链（必须改写为 `match/case` + `assert_never`）、被用作类型标注的 `object`（必须改写为 `Protocol`、`TypeVar` 或显式联合类型）。
   - 保留：本仓库既有的复杂模式、有意采用复杂惯用法的性能关键热路径。用于布尔条件和范围判断的 `if/else`（不是变体分派）。
   - 重构：嵌套 if 链 → 卫语句 / 提前返回。复杂三元 → 显式 if/else。isinstance/enum 的 if/elif 链 → `match/case`，通配分支用 `assert_never`。`object` 类型标注 → `Protocol`（结构化）、`TypeVar`（泛型）或联合类型（已知变体）。

### 结构类
4. **不必要的抽象** - 透传包装、只用一次的 helper、投机性间接层（"以后可能用得上"）、只有一个实现者且接口未带来可测试性收益的接口、仅仅调用构造函数的工厂函数。
   - 保留：提供真实接缝的抽象（可测试性、多个实现者、框架要求的边界）。

5. **边界违例** - 层级错误的导入（UI 导入 DB 驱动）、职责泄漏（handler 做了本应属于 service 的业务逻辑）、隐藏耦合（模块 A 读取模块 B 的私有状态）、纯命名函数里存在副作用。
   - 保留：本仓库已作为既有模式的务实短路。不确定时交由人工判断。

6. **死代码** - 未使用的导入、未使用的私有函数/方法、不可达分支、过期特性开关、调试残留（`console.log`、`print(...)`、`dbg!`）、已被移除但仍被引用的代码。
   - 保留：通过反射、动态分派或字符串查找引用的代码。有意保留为特性开关回滚路径的代码（与用户确认）。

### 隐藏成本
7. **重复** - 只有细微差异的复制粘贴分支、在两处做同一件事的冗余 helper、重复的字面量/魔数序列。
   - 保留：偶然性重复（两段代码看起来相似，但服务于不同意图，未来可能分化）。与其强行抽出一个过早的共享抽象，不如保持它们各自独立。

8. **性能等价改写（保持行为的优化）** - 语义可证明等价但时间/空间成本更低的改动：
   - O(n²) → O(n)，且正确性保持不变（例如集合查找 vs 列表扫描）
   - 循环内的重复计算 → 提到循环外
   - 不必要的中間集合（只迭代一次却用 eager `list(...)` → 改为生成器）
   - 循环内字符串拼接 → `join`
   - 循环内冗余的 DB/API 调用 → 批处理
   - 冗余的深拷贝 / clone
   - 循环内重复计算的 `.length` / `len()` → 缓存

   **硬性规则**: 仅当行为等价非常明确时才应用。不要改动正确性涉及微妙权衡的算法。不要在没有 benchmark 的情况下微优化热路径。存疑时，跳过。

### 行为覆盖
9. **缺失测试** - 改动文件中存在、但未被任何回归测试锁定的行为。修复方式不是删代码，而是新增能钉住该行为的最窄测试。例外：一个 PROSE 文件（prompt、`SKILL.md`、规则、markdown）没有行为接缝 - 不要为它加文本/字数/短语钉子；那守护的是一个 diff，不是行为。只覆盖机器可消费的值（被解析的字段、运行时 grep 的哨兵值、文档中经过真实校验器的 JSON 样例），否则交给评审。

### 结构类
10. **超大模块** - 任何源文件超过 **250 行纯代码**（非空、非注释行）。这是一个架构缺陷，不是风格偏好。测量方式：`awk '!/^[[:space:]]*$/ && !/^[[:space:]]*(#|\/\/)/' <file> | wc -l`。

   **发现时，不要只是标记它，要执行完整的模块化重构：**
   1. 在范围内递归运行 `check-no-excuse-rules.py`，列出所有违规。
   2. 对每个超大文件，识别出不同的职责（单一职责原则）。
   3. 规划拆分：让每个新文件以其承担的概念命名（绝不能用 `utils.py`、`helpers.py`、`common.py`、`part_1.py`）。
   4. 执行前先把拆分方案呈现给用户。
   5. 拆分为干净的模块，并通过显式的 `__init__.py` 重新导出（只做重新导出，`__init__.py` 里不放任何逻辑）。
   6. 校验：再次运行 `check-no-excuse-rules.py` - 每个文件必须 ≤250 行纯代码。运行测试、类型检查、lint。

   **禁止的逃避方式**:
   - 把空行/注释算进预算。
   - 按令牌数拆分（`foo_1.py`、`foo_2.py`）- 要按每个文件*做什么*来拆分。
   - 万能倾倒文件（`utils.py`、`helpers.py`、`service.py`）。
   - "它是生成的" - 仅当文件位于构建输出目录时才成立。
   - "230 行，差不多了" - 一个即将增长的 230 行文件已经超标。现在就拆。

   保留：真正自包含的单一职责脚本（例如独立的 CLI 检查器）。在前 5 行内加 `# noqa: SIZE_OK` 并写明原因即可豁免。

---

## 质量门禁

只有当所有适用门禁都为绿色时，一次通过才算完成。对项目中确实不适用的门禁可以跳过（例如没有配置安全扫描器），但要显式报告 `N/A` - 不要悄悄跳过。

| 门禁 | 工具 | 通过条件 |
|---|---|---|
| 回归测试 | 项目测试运行器 | 全部绿色 |
| Lint | 项目 linter | 零错误（已存在的警告可接受） |
| 类型检查 | 改动文件上的 `lsp_diagnostics` + 项目类型检查器 | 零新增错误 |
| 单元/集成测试 | 项目测试运行器 | 全部绿色（已存在的失败需注明，不是本次引入） |
| 静态/安全扫描 | 项目扫描器 | 零新增发现，或未配置时为 `N/A` |

---

## 流程

### Phase 0: 用 TodoWrite 制定计划

为下面所有阶段创建 todo。一次只把一个标记为 `in_progress`。

### Phase 1: 确定范围

如果参数里传入了文件路径，那就是范围。否则：

```bash
git diff $(git merge-base main HEAD)..HEAD --name-only
```

过滤掉：已删除的文件、二进制文件、生成/第三方文件（`node_modules/`、`dist/`、`target/`、lockfile）。列出最终范围。

### Phase 2: 用回归测试锁定行为（新增 - 不可协商）

对范围内每个源文件：

1. 识别出该文件对外暴露的公共/可观察行为（导出的函数、HTTP handler、CLI 命令、被别处使用的类）。
2. 检查现有测试是否覆盖了这些行为。用 `git grep` / 项目测试约定查找相关测试文件。
3. **如果行为未被覆盖或覆盖较弱，在编辑该文件之前，先写一条钉住当前行为的最窄回归测试。** 测试应钉住可观察输出，而非实现细节。PROSE 文件（prompt/`SKILL.md`/规则/markdown）豁免 - 其措辞不是行为；跳过测试，依赖评审，或只断言机器可消费的值。
4. 运行测试套件（至少是相关测试）。在开始任何清理之前，它们必须是**绿色**的。

如果无法建立绿色基线（例如测试运行器坏了），停下并报告。不要在未经验证的地基上继续清理。

### Phase 3: 清理计划 - 先判断是否该存在，再看坏味道

最大、最安全的删除，是那些本不该存在的代码。**在对坏味道分类之前，先对每个改动单元跑一遍删除阶梯：**

- **整体删除** - 行为不需要（YAGNI、投机、生而即死）。
- **复用** - 仓库里已有的 helper 或模式已经做了这件事；用一次调用替换掉重复实现。
- **平台 / 标准库 / 原生 / 依赖** - 语言标准库、运行时或已安装的依赖已经做了（手写的日期选择器 → `<input type="date">`，自定义 query 解析器 → `URLSearchParams`，自制 debounce → 已经导入的 util）。
- **就地简化** - 它必须存在；让它更小。

只有落到 **就地简化** 上的代码才进入坏味道分类。这样这一轮就从"找坏味道来修剪"变成"先决定代码是否该存在，再修剪幸存者"。一个被平台调用替换的函数，比任何就地清理都是更大、更安全的收益 - 而且它不需要逐行坏味道分析。

对于**修复 bug** 的 diff，要 grep 出它触及的每个共享函数的所有调用方。优先在共享接缝处做一次根因修复，而非在每个调用方重复加防护 - 一个让兄弟调用方仍然报错的逐调用方补丁是部分修复，不是清理。

然后在派发删除 agent **之前**给出一个显式计划：

```
File: src/foo.py
  Ladder: 2 units simplify-in-place; 1 unit delete (native <input> replaces custom picker)
  Categories: dead code, excessive complexity, performance
  Order: dead code → complexity → performance
  Risk: medium (touches caching layer)

File: src/bar.py
  Ladder: all simplify-in-place
  Categories: obvious comments, over-defensive
  Order: comments → defensive
  Risk: low
```

**有意的权宜之计**: 如果计划有意保留某种有限度的简化（在 N 行以内可接受的朴素扫描、一把全局锁、一条 O(n²) 路径），就在代码里用 `debt:` 注释标出上限和升级触发条件（在 omo 中，加 `// @allow` 前缀，让注释检查器视为有意为之），并在报告的 "Remaining Risks / Deferred" 里列出。那一节就是债务账本 - 一个有已知上限但没有标记的简化，与一个 bug 无从区分。

顺序规则（最安全 → 最风险）：comments → dead code → defensive → duplication → complexity → abstraction/boundary → performance → tests → oversized-modules。这样能把任一改动的爆炸半径降到最小。

### Phase 4: 通过 `deep` agent 分批并行清理 slop，每批 5 个

文件由加载了 `$omo:remove-ai-slops` skill 的 `deep` 类别 agent 处理，**每批并行 5 个**。可执行 skill 名为 `remove-ai-slops`。`deep` 类别给 agent 足够的彻底性去正确评估这 9 个类别并遵守 KEEP 规则，避免滑向表面修补；5 个一批是甜点位 - 多于 5 会造成结果合并噪声和上下文争用，少于 5 则浪费并行度。

**分批协议**（严格）：

1. 把范围内文件列表切成每块最多 5 个文件的分片。
2. 对每个分片，在**单条消息**里发起所有 `task` 调用，每个都设 `run_in_background=true`。
3. 结束你的回合。等待系统在每个任务完成时发来的 `<system-reminder>` 通知。
4. 当一批 5 个全部完成后，用 `background_output(task_id=...)` 收集每个结果。
5. 发起下一批 5 个。重复直到所有文件都处理完。
6. 如果文件总数 ≤ 5，就一批全部发起。

文件多于 5 个时**绝不**一次性全部发起；当一批中还剩多个文件时**绝不**串行发起。

**每文件调用**（一批中 5 个之一）：

```
task(
  category="deep",
  load_skills=["remove-ai-slops"],
  run_in_background=true,
  description="Slop removal: {filename}",
  prompt="""
Remove AI slops from: {file_path}

First run the deletion ladder from Phase 3 on this file (delete entirely / reuse existing repo code / platform-stdlib-native / simplify in place); only code that must exist proceeds to smell removal.

Then evaluate EVERY category defined in this skill's "Categories (what counts as slop)" section, applying that section's KEEP and REFACTOR rules verbatim — the Categories section you have loaded is canonical, do not work from a restated subset.

Apply changes in this order (safest → riskiest): comments → dead code → defensive → duplication → complexity → abstraction/boundary → performance → oversized-modules.

Hard constraints:
- Behavior MUST be preserved. When equivalence is not obvious, SKIP.
- Do NOT change public API signatures.
- Do NOT remove type hints.
- Do NOT introduce new abstractions or dependencies.
- Diff stays minimal and scoped to slop removal.

Report changes grouped by category. For each change, give before/after, why-slop, why-safe.
For each skipped issue, give reason.
"""
)
```

**批次失败处理**: `multi_agent_v1.wait_agent` 超时只意味着没有新的邮箱更新，不代表某个 `deep` agent 失败了。长流程中，要求每个子 agent 只在无法推进时才发送 `WORKING: <file> - <current phase>`，以及只在真正卡住时发送 `BLOCKED: <reason>`。把一个还在运行的子 agent 视为存活。只有当子 agent 已完成但没产出交付物、追问后只回了确认、显式 `BLOCKED:`、或已不再运行时，才把该文件标记为待重试。不要阻塞该批里其余 4 个；收集成功的结果，之后对失败文件重试一次。如果重试也失败，在最终报告的 "Issues Found & Fixed" 下升级该文件。

### Phase 5: 用质量门禁 + 关键评审进行校验

运行上面列出的五项质量门禁。然后走一遍关键评审清单：

**安全**:
- [ ] 没有意外删掉任何功能性逻辑
- [ ] 所有错误处理都被保留（尤其是 I/O、网络、外部 API 周边）
- [ ] 类型标注完整且正确
- [ ] 导入仍然有效
- [ ] 对公共 API 没有破坏性改动

**行为**:
- [ ] 返回值未变（由 Phase 2 回归测试验证）
- [ ] 副作用未变
- [ ] 异常行为未变
- [ ] 边界情况处理被保留

**质量**:
- [ ] 移除的改动确实是 slop，不是有意的模式
- [ ] 剩余代码遵循项目约定
- [ ] 没有遗留的孤儿代码或死引用
- [ ] 性能改动的等价性非常明确（没有微妙的算法偏移）
- [ ] 没有引入新的抽象

### Phase 6: 修复问题

如果任一门禁失败，或任一清单项翻车：

1. 找出导致失败的具体改动。
2. 解释它为什么把事情弄坏了。
3. `git checkout` 受影响的文件（或用 `git diff` + 定向 `Edit` 只回滚有问题的那一段）。
4. 如果回滚后仍有真正的 slop，直接亲自编辑该文件 - 按文件并行，通过多个 Edit 调用 - 只应用你能证明安全的改动。
5. 重跑失败的那项门禁，并对受影响文件重走清单。
6. 重复直到所有门禁全绿、清单干净。

如果在同一个文件上失败三次，停下并向用户升级：文件、你试过什么、什么失败了、你的假设。不要继续改。

---

## 输出格式

```text
AI SLOP REMOVAL REPORT
======================

Scope: [branch diff vs merge-base main / explicit file list]
Files: [N files]
  - path/to/file1.ts
  - path/to/file2.py

Behavior Lock:
  - Existing coverage: [N files already covered]
  - Tests added: [M new regression tests at path/to/test_X.py]
  - Baseline status: GREEN

Cleanup Plan:
  - path/to/file1.ts: [ladder: 1 delete (native) + simplify-in-place] → [dead code → complexity → performance]
  - path/to/file2.py: [ladder: all simplify-in-place] → [comments → defensive]

Per-File Results (each cut shows what replaces it):
  path/to/file1.ts
    - Ladder/delete: custom DatePicker (48 lines) → <input type="date"> (native), flatpickr import removed
    - Dead code: 3 removed (lines X-Y, A-B, C) → nothing (unreachable)
    - Excessive complexity: 1 simplified (nested ternary at L42 → if/else)
    - Performance: 1 (line N: list scan → set lookup, O(n²)→O(n), behavior identical)
    - Skipped (preserved): 2 (defensive null check at boundary; commented WHY at L88)

  path/to/file2.py
    - Obvious comments: 5 removed → nothing
    - Over-defensive: 1 simplified (redundant isinstance on typed param)

Quality Gates:
  - Regression tests: PASS (12 tests, 0 failed)
  - Lint: PASS
  - Typecheck (lsp_diagnostics + project): PASS (0 new errors on changed files)
  - Unit/integration tests: PASS (45 tests, 0 failed)
  - Static/security scan: N/A (not configured)

Critical Review:
  - Safety: PASS
  - Behavior: PASS
  - Quality: PASS

Issues Found & Fixed:
  - [None] OR [Issue description → Fix applied]

Net Impact:
  - LOC: -74 (removed 91, added 17)
  - Dependencies: -1 (flatpickr removed; native <input type="date"> used)
  - Files deleted: 1 (src/date-picker-wrapper.ts — platform-native replacement)

Remaining Risks / Deferred (this section is the debt ledger):
  - [None] OR [e.g., "boundary violation in module X flagged but not refactored — needs human judgment"]
  - `debt:` markers kept this pass: [None] OR [file:line — ceiling → upgrade trigger]

Final Status: CLEAN | ISSUES FIXED | REQUIRES ATTENTION
```

---

## 反模式（不要做这些）

- **跳过 Phase 2。** 在未被覆盖的地基上删代码，无论 agent 多小心，都是一颗行为变更的定时炸弹。回归测试*就是*安全机制；清单是它的补充，不是替代。
- **把无关重构打包在一起。** 一个同时包含删死代码 + 删抽象 + 改性能的 "cleanup" 提交，无法评审也无法二分。保持聚焦在 slop 上。
- **把算法变更伪装成性能优化。** 如果等价性需要证明，它就不是 slop 修复 - 它是重构，应放在另一个独立改动里。
- **悄悄跳过。** 如果某项质量门禁是 N/A，说 `N/A` 并说明原因。如果某项检查失败且你修不了，直说。绝不在没有证据的情况下声称 PASS。
- **删掉解释 WHY 的注释。** "从代码就能看出来" 对下一个读者很少成立。只删复述 WHAT 的注释。
- **动范围之外的文件。** 如果一个文件不在分支 diff 或显式列表里，不要编辑它，即使你顺眼看到了 slop。把它报告在 "Remaining Risks" 下。

---

## 工具持久性

- 工具调用失败时，调整参数后重试。
- 绝不悄悄跳过一个失败的工具调用。
- 绝不在运行并阅读输出之前声称某项门禁通过。
- 如果正确性取决于进一步检查，就继续用 `lsp_diagnostics`、测试运行器和直接读文件，直到结果有据可依。

---

## 质量保证

- 绝不删除承担功能职责的代码。
- 总是校验改动能编译/解析并通过类型检查。
- 总是保留测试覆盖；要加测试，而不是删测试。
- 对某个改动不确定时，倾向于保留原始代码。
- 存疑时的默认动作是 SKIP，不是 GUESS。
