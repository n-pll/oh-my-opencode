---
name: review-work
description: "实现后审查编排器。启动 5 个并行后台子代理：Oracle（目标/约束验证）、Oracle（代码质量）、Oracle（安全）、unspecified-high（动手 QA 执行）、unspecified-high（从 GitHub/git/Slack/Notion 挖掘上下文）。全部通过才算审查通过。在 PR 移交前，或用户明确要求审查已完成的工作时必须使用。触发词：'review work'、'review my work'、'review changes'、'QA my work'、'verify implementation'、'check my work'、'validate changes'、'post-implementation review'。"
---
## Codex Harness 工具兼容性

本技能可能包含从 OpenCode harness 复制过来的示例。在 Codex 中，不要直接调用 OpenCode 专有工具，例如 `call_omo_agent(...)`、`task(...)`、`background_output(...)` 或 `team_*(...)`。请将这些示例转换为 Codex 原生工具：

| OpenCode 示例 | 应使用的 Codex 工具 |
| --- | --- |
| `call_omo_agent(subagent_type="explore", ...)` | `multi_agent_v1.spawn_agent({"message":"TASK: act as an explorer. ...","agent_type":"explorer","fork_context":false})` |
| `call_omo_agent(subagent_type="librarian", ...)` | `multi_agent_v1.spawn_agent({"message":"TASK: act as a librarian. ...","agent_type":"librarian","fork_context":false})` |
| `task(subagent_type="plan", ...)` | `multi_agent_v1.spawn_agent({"message":"TASK: act as a planning agent. ...","agent_type":"plan","fork_context":false})` |
| 用于最终验证的 `task(subagent_type="oracle", ...)` | `multi_agent_v1.spawn_agent({"message":"TASK: act as a rigorous reviewer. ...","agent_type":"lazycodex-gate-reviewer","fork_context":false})` |
| 用于实现或 QA 的 `task(category="...", ...)` | `multi_agent_v1.spawn_agent({"message":"TASK: act as an implementation or QA worker. ...","fork_context":false})` |
| `background_output(task_id="...")` | `multi_agent_v1.wait_agent(...)` 用于接收邮箱信号 |
| `team_*(...)` | 通过 `multi_agent_v1.spawn_agent` 和 `multi_agent_v1.wait_agent` 使用 Codex 原生子代理；仅当 `multi_agent_v1.send_input` 和 `multi_agent_v1.close_agent` 在当前工具列表中暴露时才使用它们 |

角色相关的行为必须在自包含的 `message` 中描述。使用 `fork_context: false` 时，子代理只包含初始提示（不包含父级历史）；仅当确实需要完整父级历史时才使用 `fork_context: true`。将所需的对话上下文、文件、diff、约束和请求的技能名称直接放入被派生代理的 `message` 中。OMO 会将以下可选代理角色安装到 `~/.codex/agents/`：`explorer`、`librarian`、`plan`、`momus`、`metis`、`lazycodex-code-reviewer`、`lazycodex-qa-executor` 和 `lazycodex-gate-reviewer` - 将匹配的名称作为 `agent_type` 传入，以便子代理获得该角色的模型和指令。如果派生工具未暴露 `agent_type` 参数，则省略它并在 `message` 中描述该角色。如果下方的代码块与本节冲突，以本节为准。

Codex 在每个会话中只暴露两种子代理工具界面之一；请检查你自己的工具列表并据此路由。如果存在 `multi_agent_v1.*` 工具，则按上表使用。如果存在带有必填 `task_name` 的扁平 `spawn_agent`（`multi_agent_v2`），则改写每个 `multi_agent_v1.*` 示例：`multi_agent_v1.spawn_agent({...,"fork_context":false})` 变为 `spawn_agent({"task_name":"<lowercase_digits_underscores>","message":...,"agent_type":...,"fork_turns":"none"})`（仅当确实需要完整父级历史时才用 `"all"`）；`send_input` 变为 `send_message`；不要调用 `close_agent`/`resume_agent`（已完成的代理会自行结束；`followup_task` 会重新分派一个，`interrupt_agent` 会停止一个）；`wait_agent` 只接受 `timeout_ms`，并在任何子代理邮箱活动时返回。`agent_type` 在两种界面上工作方式相同。如果下方的代码块与本节冲突，以本节为准。

对于可能超过一个等待周期的工作，要求子代理在进行长时间处理前发送 `WORKING: <task> - <current phase>`，仅当进度停止时才发送 `BLOCKED: <reason>`。`multi_agent_v1.wait_agent` 超时只表示没有新的邮箱更新到达。将运行中的子代理视为活跃状态。仅当子代理已完成但没有交付物、followup 后仅有 ack 回复、明确发送 `BLOCKED:`、或已不再运行时才进行回退。

## Codex 子代理可靠性

每个 `multi_agent_v1.spawn_agent` 的 message 必须是自包含的。以
`TASK: <祈使句任务>` 开头，然后列出 `DELIVERABLE`、`SCOPE` 和
`VERIFY`。声明这是一个可执行任务，而不是上下文移交。
角色或专长说明应放在 `message` 内部。
除非确实需要完整历史，否则使用
`fork_context: false`；只粘贴该 worker 所需的审查上下文。

审查通道是叶子代理：一个通道自行完成读取、运行和
判断，从不派生自己的子审查者。审查者是一次性的：
一个通道在给出结论时结束；修复后的复审是一次全新的
派生，范围限定在增量加上当前证据，绝不是对携带陈旧上下文的
长期审查者执行 `followup_task`。

Plan 和 reviewer 代理可能运行很长时间；在后台派生它们，同时继续做独立的根任务。在 `multi_agent_v1.wait_agent` 调用之间退避 - 将超时加倍，最多到约 5 分钟 - 而不是频繁执行短周期轮询。

将子代理状态视为进度信号，而不是超时计数器。对于
可能超过一个等待周期的工作，要求子代理在进行长时间的读取、测试或
审查处理前发送 `WORKING: <task> - <current phase>`，仅当无法推进时才发送 `BLOCKED: <reason>`。
只要还有子代理在运行，就让父代理保持可见活跃状态，展示活跃的
子代理数量、代理名称、最新的 `WORKING:` 阶段，以及父代理是否
正在等待邮箱更新。在本地跟踪已派生代理的名称。
将 `multi_agent_v1.wait_agent` 用于邮箱信号，而不是完成证明。
超时只表示没有新的邮箱更新到达。将运行中的子代理视为活跃状态。
仅当子代理已完成但没有交付物、followup 后仅有 ack 回复、明确发送 `BLOCKED:`、或已不再运行时才进行回退。
然后标记该审查通道为
`INCONCLUSIVE`，不计为 PASS 或批准，在安全时关闭它，并
重新派生一个更小的 `fork_context: false` 审查者来补上缺失的
交付物。立即保存已完成的通道结果。如果重试
预算已耗尽，保持该通道为 `INCONCLUSIVE`，并仍然输出最终的
汇总结果。

# Review Work - 5 代理并行审查编排器

并行启动 5 个专门的子代理，从各个角度审查已完成的实现工作。全部 5 个都必须通过，审查才算通过。只要有一个失败，整个审查就失败。

这 5 个代理覆盖互补的关注点 - 它们共同构成一个全面的审查，任何单一审查者都无法匹敌：

| # | 代理 | 类型 | 职责 | 关注级别 |
|---|-------|------|------|-------------|
| 1 | 目标验证者 | Oracle | 我们是否构建了被要求的东西？ | MAIN |
| 2 | QA 执行者 | unspecified-high | 它是否真的能运行？ | MAIN |
| 3 | 代码审查者 | Oracle | 代码写得好吗？ | MAIN |
| 4 | 安全审计者 | Oracle | 它安全吗？ | SUB |
| 5 | 上下文挖掘者 | unspecified-high | 我们是否遗漏了任何上下文？ | MAIN |

---

## 阶段 0：收集审查上下文

在启动代理之前，收集这些输入。优先从对话历史中提取 - 用户的原始请求、讨论过的约束、做出的决策通常已经在对话线索中。只有在确实缺失时才询问。

<required_inputs>

- **GOAL**：原始目标。用户想要达成什么？从本对话的初始请求中提取。
- **CONSTRAINTS**：规则、要求或限制。技术栈限制、性能目标、API 契约、需遵循的设计模式、向后兼容性需求。
- **BACKGROUND**：为什么需要这项工作。业务上下文、用户故事、相关系统、影响方法选择的既往决策。
- **CHANGED_FILES**：通过 `git diff --name-only HEAD~1` 或相对于适当基线（分支点、特定提交）自动收集。
- **DIFF**：通过 `git diff HEAD~1` 或相对于适当基线自动收集。
- **FILE_CONTENTS**：读取每个已变更文件的完整内容（不仅仅是 diff）。Oracle 代理无法读取文件 - 它们需要提示中包含完整上下文。
- **RUN_COMMAND**：如何启动/运行应用。检查 `package.json` 脚本、`Makefile`、`docker-compose.yml`，或询问用户。

</required_inputs>


仅从专门的审查工作树中审查 PR 和分支：在收集已变更文件、diff、文件内容或运行检查之前，使用 `git worktree add <path> <branch>` 创建或附加一个工作树。主工作树是只读上下文；绝不要在那里 checkout、测试或编辑审查分支。

**自动收集流程：**

```bash
# 1. 获取已变更文件
git diff --name-only HEAD~1  # 或：git diff --name-only main...HEAD

# 2. 获取 diff
git diff HEAD~1  # 或：git diff main...HEAD

# 3. 检测运行命令
# 检查 package.json -> "scripts.dev" 或 "scripts.start"
# 检查 Makefile -> 默认 target
# 检查 docker-compose.yml -> services
```

对于 GOAL、CONSTRAINTS、BACKGROUND - 回顾完整的对话历史。用户的原始消息几乎总是包含目标。约束通常在讨论过程中浮现。如果有任何关键内容不明确，提出一个聚焦的问题 - 而不是一份清单。

---

## 阶段 1：启动 5 个代理

在单个轮次中启动全部 5 个代理。每个代理都使用 `run_in_background=true`。不要顺序启动。不要在它们之间等待。

**Oracle 代理在提示中接收一切**（它们无法读取文件或运行命令）。在提示文本中直接包含 DIFF + FILE_CONTENTS + 所有上下文。

**unspecified-high 代理是自主的** - 它们可以读取文件、运行命令和使用工具。给它们目标和指引，而不是原始内容堆砌。

---

### 代理 1：目标与约束验证（Oracle）- MAIN

该代理回答："我们是否在给定规则范围内，准确地构建了被要求的东西？"

```
task(
  subagent_type="oracle",
  run_in_background=true,
  load_skills=[],
  description="Verify implementation against original goal and constraints",
  prompt="""
<review_type>GOAL & CONSTRAINT VERIFICATION</review_type>

<original_goal>
{GOAL - 粘贴用户的原始请求和任何澄清说明}
</original_goal>

<constraints>
{CONSTRAINTS - 讨论过的每条规则、要求或限制}
</constraints>

<background>
{BACKGROUND - 为什么需要这项工作，更广泛的上下文}
</background>

<changed_files>
{CHANGED_FILES - 已修改文件路径列表}
</changed_files>

<file_contents>
{FILE_CONTENTS - 每个已变更文件的完整内容，按文件清晰分隔}
</file_contents>

<diff>
{DIFF - 实际的 git diff}
</diff>

审查该实现是否在给定约束内正确且完整地达成了既定目标。要做到极其彻底 - 本审查的意义在于捕捉实现者遗漏的内容。

REVIEW CHECKLIST:

1. **Goal Completeness（目标完整性）**：将目标拆解为每个子需求（显式和隐式）。对每个子需求标记 ACHIEVED / MISSED / PARTIAL。即使是合理工程师本应处理的隐式需求，遗漏任何一个 = 至少为 PARTIAL。

2. **Constraint Compliance（约束合规性）**：列出每条约束。对每条约束用具体代码证据验证合规情况。违反约束 = 自动 FAIL。

3. **Requirement Gaps（需求缺口）**：用户明显想要但未明确写出的需求。由目标或背景所隐含、一个用心的工程师本应包含的内容。

4. **Over-Engineering（过度工程）**：任何未被请求而添加的内容 - 不必要的抽象、额外功能、过早优化、投机性的通用化。将这些标记为范围蔓延。

5. **Edge Cases（边界情况）**：考虑到目标，哪些输入或场景会破坏这个实现？至少在脑海中走查 5 个边界情况。

6. **Behavioral Correctness（行为正确性）**：针对 3 个以上的代表性场景走查代码逻辑。代码是否在每个场景中确实产生了预期行为？

OUTPUT FORMAT:
<verdict>PASS or FAIL</verdict>
<confidence>HIGH / MEDIUM / LOW</confidence>
<summary>1-3 句话的整体评估</summary>
<goal_breakdown>
  对每个子需求：
  - [ACHIEVED/MISSED/PARTIAL] 需求描述
  - 证据：具体的代码引用或缺口
</goal_breakdown>
<constraint_compliance>
  对每条约束：
  - [ACHIEVED/MISSED] 约束描述 - 证据
</constraint_compliance>
<findings>
  - [PASS/FAIL/WARN] 类别：描述
  - 文件：路径（如适用，含行范围）
  - 证据：具体的代码或逻辑引用
</findings>
<blocking_issues>必须修复的问题。如果 PASS 则为空。</blocking_issues>
""")
```

---

### 代理 2：通过应用执行进行 QA（unspecified-high）- MAIN

该代理回答："运行时它是否真的能用？"

QA 代理遵循结构化流程：先穷尽式头脑风暴场景，再自我复审并补充，然后创建任务列表，最后系统化地执行。

```
task(
  category="unspecified-high",
  run_in_background=true,
  load_skills=["browser:control-in-app-browser", "playwright", "dev-browser"],
  description="QA by actually running and using the application",
  prompt="""
<review_type>QA - HANDS-ON APP EXECUTION</review_type>

<original_goal>
{GOAL}
</original_goal>

<constraints>
{CONSTRAINTS}
</constraints>

<changed_files>
{CHANGED_FILES}
</changed_files>

<run_command>
{RUN_COMMAND - 如何启动应用，或 "unknown"（如未确定）}
</run_command>

你是一名 QA 工程师。你的职责是运行应用并通过动手测试验证它能正常工作。你不审查代码 - 你测试行为。

如果编排器已经对同一构建运行过 `visual-qa` 的双 Oracle 门禁，则直接消费该结论而不要重新运行 - 你的通道覆盖的是视觉门禁不覆盖的动手行为。

MANDATORY PROCESS（按顺序执行）：

### Step 1: Scenario Brainstorm（场景头脑风暴）

在触碰应用之前，先写下你能想到的每一个测试场景。要穷尽式思考。考虑：

- **Happy paths（正常路径）**：本实现所支持的主要用例。用户最想做的核心事情是什么？
- **Boundary conditions（边界条件）**：空输入、最大长度输入、零值、负数、特殊字符、unicode、超大数据集。
- **Error paths（错误路径）**：无效输入、网络故障、缺失文件、权限被拒、超时条件。
- **Regression scenarios（回归场景）**：触及相同代码路径的已有功能。以前能用的、现在仍必须能用的东西。
- **State transitions（状态转换）**：乱序操作会怎样？快速重复操作？并发使用？
- **UX scenarios（UX 场景，如适用）**：不同尺寸下的布局、键盘导航、屏幕阅读器兼容性、加载状态、错误消息。
- **Integration points（集成点）**：该功能是否与外部服务、数据库或其他模块交互？测试这些边界。

将每个场景写成一行，附上预期行为。目标至少 15-30 个场景。

### Step 2: Scenario Augmentation（场景补充）

以全新视角复审你的场景列表。对每个场景问自己：
- "这里还有什么我没想到会出错的？"
- "一个恶意或粗心的用户会做什么？"
- "哪些环境条件可能影响这个？"（磁盘满、慢网络、过期 token）

从这次反思中至少新增 5 个场景。按优先级对场景分组：P0（必须通过）、P1（应当通过）、P2（最好通过）。

### Step 3: Create Task List（创建任务列表）

将补充后的场景列表转换为结构化的任务列表（使用 TaskCreate/TaskUpdate 或你的 todo 系统）。每个任务 = 一个测试场景，包含：
- 测试名称
- 执行步骤
- 预期结果
- 优先级（P0/P1/P2）

### Step 4: Execute Systematically（系统化执行）

按优先级顺序（P0 优先）处理任务列表。对每个测试：

1. 执行测试步骤
2. 记录实际结果
3. 与预期结果比较
4. 标记 PASS 或 FAIL
5. 如果 FAIL：捕获证据（截图、终端输出、错误消息）
6. 标记任务完成

**按应用类型的执行指引：**
- **Web 应用**：在 Codex 中，优先使用 `browser:control-in-app-browser` 处理不需要已认证用户会话的浏览器工作。当 Browser 插件不可用、缺少所需操作、或测试明确需要持久化/已认证的浏览器配置时，回退到 playwright/dev-browser。通过所选的浏览器界面进行导航、点击、填写表单和验证视觉输出。
- **CLI 工具**：用各种参数运行命令、管道输入、检查退出码和输出。
- **库/SDK**：编写并执行一个导入并调用公共 API 的测试脚本。
- **后端 API**：使用 curl/httpie 以各种 payload 请求端点，验证响应码和响应体。
- **移动端/桌面端**：如无法直接运行，则编写集成测试并执行它们。

如果应用无法启动（构建失败），这是立即的 FAIL - 无需继续。

### Step 5: Compile Results（汇总结果）

OUTPUT FORMAT:
<verdict>PASS or FAIL</verdict>
<confidence>HIGH / MEDIUM / LOW</confidence>
<summary>1-3 句话的整体评估</summary>
<scenario_coverage>
  场景总数：N
  P0：X 个已测，Y 个通过
  P1：X 个已测，Y 个通过
  P2：X 个已测，Y 个通过
</scenario_coverage>
<test_results>
  对每个测试：
  - [PASS/FAIL] 测试名称（优先级）
  - 步骤：你做了什么
  - 预期：应当发生什么
  - 实际：实际发生了什么
  - 证据：截图路径或终端输出片段（如果 FAIL）
</test_results>
<blocking_issues>仅 P0 或 P1 失败。如果 PASS 则为空。</blocking_issues>
""")
```

---

### 代理 3：代码质量审查（Oracle）- MAIN

该代理回答："代码是否编写良好、可维护，且与代码库一致？"

```
task(
  subagent_type="oracle",
  run_in_background=true,
  load_skills=[],
  description="Review overall code quality, patterns, and architecture",
  prompt="""
<review_type>CODE QUALITY REVIEW</review_type>

<changed_files>
{CHANGED_FILES}
</changed_files>

<file_contents>
{FILE_CONTENTS - 已变更文件的完整内容，以及展示既有模式的邻近文件}
</file_contents>

<diff>
{DIFF}
</diff>

<background>
{BACKGROUND}
</background>

你是一名资深 staff 工程师，正在进行代码审查。你的标准是："我会在零评论的情况下批准这个 PR 吗？"

REVIEW DIMENSIONS（逐项审查）：

1. **Correctness（正确性）**：逻辑错误、off-by-one、null/undefined 处理、竞态条件、资源泄漏、未处理的 promise rejection。

2. **Pattern Consistency（模式一致性）**：新代码是否遵循代码库既有的模式？与提供的邻近文件比较。在已有模式之处引入新模式 = 一条发现。

3. **Naming & Readability（命名与可读性）**：变量/函数/类型名称是否清晰？代码是否自解释？另一位工程师不加解释能否理解？

4. **Error Handling（错误处理）**：错误是否被正确捕获、记录和传播？没有空 catch 块？没有吞掉的错误？面向用户的错误是否有帮助？

5. **Type Safety（类型安全）**：是否有 `as any`、`@ts-ignore`、`@ts-expect-error`？泛型使用是否恰当？类型收窄是否正确？（如果是 TypeScript/类型化语言）

6. **Performance（性能）**：N+1 查询？不必要的重渲染？热路径上的阻塞式 I/O？内存泄漏？无界增长？

7. **Abstraction Level（抽象层级）**：抽象层级是否合适？没有复制粘贴的重复？但也不过早过度抽象？

8. **Testing（测试）**：新行为是否有测试覆盖？测试是否有意义，而不只是凑覆盖率？测试名称是否描述了场景？

9. **API Design（API 设计）**：公共接口是否干净且与既有 API 一致？破坏性变更是否已标记？

10. **Tech Debt（技术债）**：这是否引入了新的技术债？或者制造了将来难以修改的耦合？

按严重程度对每条发现分类：
- **CRITICAL**：会在生产环境中导致 bug、数据丢失或崩溃
- **MAJOR**：应在合并前修复的重大质量问题
- **MINOR**：值得改进但不阻塞
- **NITPICK**：风格偏好，可选

OUTPUT FORMAT:
<verdict>PASS or FAIL</verdict>
<confidence>HIGH / MEDIUM / LOW</confidence>
<summary>1-3 句话的整体评估</summary>
<findings>
  - [CRITICAL/MAJOR/MINOR/NITPICK] 类别：描述
  - 文件：路径（行范围）
  - 现状：代码现在做什么
  - 建议：如何改进
</findings>
<blocking_issues>仅 CRITICAL 和 MAJOR 项。如果 PASS 则为空。</blocking_issues>
""")
```

---

### 代理 4：安全审查（Oracle）- SUB

该代理回答："这些变更中是否存在安全漏洞？"

这是补充性的 - 它专注于安全。除非代码风格、架构或功能直接造成安全风险，否则它不对这些方面发表评论。

```
task(
  subagent_type="oracle",
  run_in_background=true,
  load_skills=[],
  description="Security-focused review of implementation changes",
  prompt="""
<review_type>SECURITY REVIEW (supplementary)</review_type>

<changed_files>
{CHANGED_FILES}
</changed_files>

<file_contents>
{FILE_CONTENTS - 已变更文件的完整内容}
</file_contents>

<diff>
{DIFF}
</diff>

你是一名安全工程师。专门针对安全漏洞和反模式审查这个 diff。忽略代码风格、命名、架构 - 除非它直接造成安全风险。

SECURITY CHECKLIST:

1. **Input Validation（输入验证）**：用户输入是否经过净化？SQL 注入、XSS、命令注入、SSRF 向量？
2. **Auth & AuthZ（认证与授权）**：需要的地方是否做了认证检查？每个操作是否验证了授权？是否有提权路径？
3. **Secrets & Credentials（密钥与凭据）**：代码或配置中是否有硬编码的密钥、API key、token？日志中是否泄露密钥？
4. **Data Exposure（数据暴露）**：日志中是否有敏感数据？错误消息中是否有 PII？API 响应是否过度暴露？
5. **Dependencies（依赖）**：是否新增了依赖？是否有已知 CVE？是否有可疑或多余的包？
6. **Cryptography（密码学）**：算法是否恰当？没有自定义加密？安全随机数？密钥管理是否正确？
7. **File & Path（文件与路径）**：路径穿越？不安全的文件操作？符号链接跟随？
8. **Network（网络）**：CORS 配置是否正确？速率限制？是否强制 TLS？证书验证？
9. **Error Leakage（错误泄露）**：堆栈跟踪是否暴露给用户？错误响应中是否含内部细节？
10. **Supply Chain（供应链）**：lockfile 是否一致更新？依赖是否固定版本？

OUTPUT FORMAT:
<verdict>PASS or FAIL</verdict>
<severity>CRITICAL / HIGH / MEDIUM / LOW / NONE</severity>
<summary>1-3 句话的整体评估</summary>
<findings>
  - [CRITICAL/HIGH/MEDIUM/LOW] 类别：描述
  - 文件：路径（行范围）
  - 风险：攻击者能做什么？
  - 修复建议：具体的修复方法
</findings>
<blocking_issues>仅 CRITICAL 和 HIGH 项。如果 PASS 则为空。</blocking_issues>
""")
```

---

### 代理 5：上下文挖掘（unspecified-high）- MAIN

该代理回答："我们是否遗漏了本应影响这项实现的上下文？"

```
task(
  category="unspecified-high",
  run_in_background=true,
  load_skills=["git-master"],
  description="Mine all accessible contexts for missed requirements or background knowledge",
  prompt="""
<review_type>CONTEXT MINING - MISSED REQUIREMENTS & BACKGROUND</review_type>

<original_goal>
{GOAL}
</original_goal>

<constraints>
{CONSTRAINTS}
</constraints>

<changed_files>
{CHANGED_FILES}
</changed_files>

<background>
{BACKGROUND}
</background>

你是一名调查员。你的任务：搜索每一个可访问的信息源，找出本应影响这项实现但可能被遗漏的上下文。问题是："是否有我们本应知道却不知道的东西？"

SOURCES TO SEARCH（使用每一个可用工具）：

1. **Git History（始终搜索）**：
   - `git log --oneline -20 -- {each changed file}` - 最近的变更及其原因
   - `git blame {critical sections}` - 谁在何时写了什么
   - `git log --all --grep="{keywords from goal}"` - 相关提交
   - 查找被回退的提交、历史中的 TODO/FIXME/HACK 注释

2. **GitHub（如果 `gh` CLI 可用）**：
   - `gh issue list --search "{keywords}"` - 相关的打开/已关闭 issue
   - `gh pr list --search "{keywords}" --state all` - 相关 PR 及其审查评论
   - 检查是否有 issue 专门关联到这项工作
   - 查看过往触及这些文件的 PR 上的审查评论

3. **Communication Channels（如果 MCP 工具可用）**：
   - Slack：搜索提及该功能、文件名或相关关键词的消息
   - Notion：搜索与该功能相关的设计文档、RFC、ADR
   - Discord：相关讨论

4. **Codebase Cross-References（始终搜索）**：
   - 导入或引用已变更模块的文件
   - 因行为变更可能需要更新的测试
   - 引用了已变更行为的文档（README、docs/、注释）
   - 可能需要相应更新的配置文件
   - 同一领域内的相关功能

WHAT TO LOOK FOR:

- 实现遗漏的、在 issue/PR 中提到的需求
- 解释代码为何以某种方式编写的过往决策 - 以及新变更是否尊重了这些原因
- 受这些变更影响的相关系统或功能
- 前任开发者的警告（PR 审查评论、内联 TODO、提交消息）
- 影响已变更代码的迁移或弃用说明
- 记录在代码库之外的设计决策（Notion、Slack、ADR）

OUTPUT FORMAT:
<verdict>PASS or FAIL</verdict>
<confidence>HIGH / MEDIUM / LOW</confidence>
<summary>1-3 句话的整体评估</summary>
<sources_searched>
  - [SEARCHED/SKIPPED] 来源名称 - 搜索了什么（或为何无法访问）
</sources_searched>
<discovered_context>
  对每条发现：
  - 来源：在哪里找到（git commit abc123、GitHub issue #42、Slack 消息等）
  - 发现：找到了什么
  - 相关性：它与当前工作的关系
  - 影响：[BLOCKING / IMPORTANT / FYI]
</discovered_context>
<missed_requirements>实现本应处理但未处理的需求。如无则为空。</missed_requirements>
<blocking_issues>仅 BLOCKING 项。如果 PASS 则为空。</blocking_issues>
""")
```

---

## 阶段 2：等待并收集

在一个轮次中启动全部 5 个代理后，在有界的
周期内等待完成。不要把超时、仅 ack 的回复或空的子代理结果
当作 PASS。

每当一个代理完成时，通过上方的 Codex 映射收集（`multi_agent_v1.wait_agent`，
然后是子代理的实质性最终结果）。立即保存已完成的通道
结果；绝不因另一个通道仍在运行而丢失某个 PASS/FAIL。
独立存储每个结论：

| 代理 | 结论 | 备注 |
|-------|---------|-------|
| 1. 目标验证 | pending/PASS/FAIL/INCONCLUSIVE | - |
| 2. QA 执行 | pending/PASS/FAIL/INCONCLUSIVE | - |
| 3. 代码质量 | pending/PASS/FAIL/INCONCLUSIVE | - |
| 4. 安全 | pending/PASS/FAIL/INCONCLUSIVE | - |
| 5. 上下文挖掘 | pending/PASS/FAIL/INCONCLUSIVE | - |

在全部 5 个通道都达到终态（PASS、FAIL 或 INCONCLUSIVE）之前，
不要交付最终报告。
如果某通道在可靠性 followup 之后仍保持沉默，
记录为 inconclusive，并为该确切通道重新派生一个更小的
审查者/worker。如果重试之后仍未完成，在安全时关闭仍在运行的
代理，保持该通道为 INCONCLUSIVE，并输出带有未完成通道
名称的最终汇总审查结果。不要在反复的
等待/followup 循环中打转。不要把 `multi_agent_v1.send_input` 当作中断；
排队的 followup 并不等于取消。

---

## 阶段 3：交付结论

<verdict_logic>

全部 5 个代理返回 PASS -> **REVIEW PASSED**
任一代理返回 FAIL -> **REVIEW FAILED - 未达标准**
任一通道为 INCONCLUSIVE 且没有失败 -> **REVIEW INCONCLUSIVE - 未批准**

</verdict_logic>

按以下格式编制最终报告：

```markdown
# Review Work - Final Report

## Overall Verdict: PASSED / FAILED / INCONCLUSIVE

| # | Review Area | Agent Type | Verdict | Confidence |
|---|------------|------------|---------|------------|
| 1 | Goal & Constraint Verification | Oracle | PASS/FAIL/INCONCLUSIVE | HIGH/MED/LOW |
| 2 | QA Execution | unspecified-high | PASS/FAIL/INCONCLUSIVE | HIGH/MED/LOW |
| 3 | Code Quality | Oracle | PASS/FAIL/INCONCLUSIVE | HIGH/MED/LOW |
| 4 | Security (supplementary) | Oracle | PASS/FAIL/INCONCLUSIVE | Severity |
| 5 | Context Mining | unspecified-high | PASS/FAIL/INCONCLUSIVE | HIGH/MED/LOW |

## Blocking Issues
[从所有代理汇总 - 去重后按优先级排序]

## Key Findings
[跨所有代理最重要的 5-10 条发现，按主题分组]

## Recommendations
[如果 FAILED：确切要修复什么，按优先级排序]
[如果 PASSED：值得考虑的非阻塞建议]
```

如果 FAILED - 要具体。用户应当确切知道要修复什么以及按什么顺序。不要使用"考虑改进 X"这类含糊表述 - 说明问题、文件和修复方法。

如果 PASSED - 保持简短。突出任何非阻塞建议，但不要把一次通过的审查变成一场说教。
