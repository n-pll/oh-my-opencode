export const REFACTOR_INTRO_AND_ANALYSIS = `# Intelligent Refactor Command

## Codex Harness Tool Compatibility

This command includes examples for the OpenCode harness. In Codex, do not call OpenCode-only tools such as \`call_omo_agent(...)\`, \`task(...)\`, \`background_output(...)\`, or \`team_*(...)\` literally. Translate those examples to Codex native tools:

| OpenCode example | Codex tool to use |
| --- | --- |
| \`call_omo_agent(subagent_type="explore", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as an explorer. ...","agent_type":"explorer","fork_context":false})\` |
| \`call_omo_agent(subagent_type="librarian", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as a librarian. ...","agent_type":"librarian","fork_context":false})\` |
| \`task(subagent_type="plan", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as a planning agent. ...","agent_type":"plan","fork_context":false})\` |
| \`task(subagent_type="oracle", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as a rigorous reviewer. ...","agent_type":"lazycodex-gate-reviewer","fork_context":false})\` |
| \`task(category="...", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as an implementation or QA worker. ...","fork_context":false})\` |
| \`background_output(task_id="...")\` | \`multi_agent_v1.wait_agent(...)\` for mailbox signals |
| \`team_*(...)\` | Use Codex native subagents via \`multi_agent_v1.spawn_agent\` and \`multi_agent_v1.wait_agent\`; use \`multi_agent_v1.send_input\` and \`multi_agent_v1.close_agent\` only when exposed in the active tools list |

Codex exposes ONE of two subagent tool surfaces per session; check your own tool list and route accordingly. If \`multi_agent_v1.*\` tools exist, use the table above as written. If instead a flat \`spawn_agent\` with a required \`task_name\` exists (\`multi_agent_v2\`), rewrite every \`multi_agent_v1.*\` example: \`multi_agent_v1.spawn_agent({...,"fork_context":false})\` becomes \`spawn_agent({"task_name":"<lowercase_digits_underscores>","message":...,"agent_type":...,"fork_turns":"none"})\` (\`"all"\` only when full parent history is truly required); \`send_input\` becomes \`send_message\`; do not call \`close_agent\`/\`resume_agent\` (finished agents end on their own; \`followup_task\` re-tasks one, \`interrupt_agent\` stops one); \`wait_agent\` takes only \`timeout_ms\` and returns on any child mailbox activity. \`agent_type\` works the same on both surfaces. If a code block below conflicts with this section, this section wins.

When translating \`load_skills=[...]\`, include the requested skill names in the spawned agent's \`message\`. If a code block below conflicts with this section, this section wins.

## Usage
\`\`\`
/refactor <refactoring-target> [--scope=<file|module|project>] [--strategy=<safe|aggressive>]

Arguments:
  refactoring-target: What to refactor. Can be:
    - File path: src/auth/handler.ts
    - Symbol name: "AuthService class"
    - Pattern: "all functions using deprecated API"
    - Description: "extract validation logic into separate module"

Options:
  --scope: Refactoring scope (default: module)
    - file: Single file only
    - module: Module/directory scope
    - project: Entire codebase

  --strategy: Risk tolerance (default: safe)
    - safe: Conservative, maximum test coverage required
    - aggressive: Allow broader changes with adequate coverage
\`\`\`

## What This Command Does

Performs intelligent, deterministic refactoring with full codebase awareness. Unlike blind search-and-replace, this command:

1. **Understands your intent** - Analyzes what you actually want to achieve
2. **Maps the codebase** - Builds a definitive codemap before touching anything
3. **Assesses risk** - Evaluates test coverage and determines verification strategy
4. **Plans meticulously** - Creates a detailed plan with Plan agent
5. **Executes precisely** - Step-by-step refactoring with LSP and AST-grep
6. **Verifies constantly** - Runs tests after each change to ensure zero regression

---

# PHASE 0: INTENT GATE (MANDATORY FIRST STEP)

**BEFORE ANY ACTION, classify and validate the request.**

## Step 0.1: Parse Request Type

| Signal | Classification | Action |
|--------|----------------|--------|
| Specific file/symbol | Explicit | Proceed to codebase analysis |
| "Refactor X to Y" | Clear transformation | Proceed to codebase analysis |
| "Improve", "Clean up" | Open-ended | **MUST ask**: "What specific improvement?" |
| Ambiguous scope | Uncertain | **MUST ask**: "Which modules/files?" |
| Missing context | Incomplete | **MUST ask**: "What's the desired outcome?" |

## Step 0.2: Validate Understanding

Before proceeding, confirm:
- [ ] Target is clearly identified
- [ ] Desired outcome is understood
- [ ] Scope is defined (file/module/project)
- [ ] Success criteria can be articulated

**If ANY of above is unclear, ASK CLARIFYING QUESTION:**

\`\`\`
I want to make sure I understand the refactoring goal correctly.

**What I understood**: [interpretation]
**What I'm unsure about**: [specific ambiguity]

Options I see:
1. [Option A] - [implications]
2. [Option B] - [implications]

**My recommendation**: [suggestion with reasoning]

Should I proceed with [recommendation], or would you prefer differently?
\`\`\`

## Step 0.3: Create Initial Todos

**IMMEDIATELY after understanding the request, create todos:**

\`\`\`
TodoWrite([
  {"id": "phase-1", "content": "PHASE 1: Codebase Analysis - launch parallel explore agents", "status": "pending", "priority": "high"},
  {"id": "phase-2", "content": "PHASE 2: Build Codemap - map dependencies and impact zones", "status": "pending", "priority": "high"},
  {"id": "phase-3", "content": "PHASE 3: Test Assessment - analyze test coverage and verification strategy", "status": "pending", "priority": "high"},
  {"id": "phase-4", "content": "PHASE 4: Plan Generation - invoke Plan agent for detailed refactoring plan", "status": "pending", "priority": "high"},
  {"id": "phase-5", "content": "PHASE 5: Execute Refactoring - step-by-step with continuous verification", "status": "pending", "priority": "high"},
  {"id": "phase-6", "content": "PHASE 6: Final Verification - full test suite and regression check", "status": "pending", "priority": "high"}
])
\`\`\`

---

# PHASE 1: CODEBASE ANALYSIS (PARALLEL EXPLORATION)

**Mark phase-1 as in_progress.**

## 1.1: Launch Parallel Explore Agents (BACKGROUND)

Fire ALL of these simultaneously using \`call_omo_agent\`:

\`\`\`
// Agent 1: Find the refactoring target
call_omo_agent(
  subagent_type="explore",
  run_in_background=true,
  prompt="Find all occurrences and definitions of [TARGET].${" "}
  Report: file paths, line numbers, usage patterns."
)

// Agent 2: Find related code
call_omo_agent(
  subagent_type="explore",${" "}
  run_in_background=true,
  prompt="Find all code that imports, uses, or depends on [TARGET].
  Report: dependency chains, import graphs."
)

// Agent 3: Find similar patterns
call_omo_agent(
  subagent_type="explore",
  run_in_background=true,
  prompt="Find similar code patterns to [TARGET] in the codebase.
  Report: analogous implementations, established conventions."
)

// Agent 4: Find tests
call_omo_agent(
  subagent_type="explore",
  run_in_background=true,
  prompt="Find all test files related to [TARGET].
  Report: test file paths, test case names, coverage indicators."
)

// Agent 5: Architecture context
call_omo_agent(
  subagent_type="explore",
  run_in_background=true,
  prompt="Find architectural patterns and module organization around [TARGET].
  Report: module boundaries, layer structure, design patterns in use."
)
\`\`\`

## 1.2: Direct Tool Exploration (WHILE AGENTS RUN)

While background agents are running, use direct tools:

### LSP Tools for Precise Analysis:

\`\`\`typescript
// Find definition(s)
LspGotoDefinition(filePath, line, character)  // Where is it defined?

// Find ALL usages across workspace
LspFindReferences(filePath, line, character, includeDeclaration=true)

// Get file structure
LspDocumentSymbols(filePath)  // Hierarchical outline
LspWorkspaceSymbols(filePath, query="[target_symbol]")  // Search by name

// Get current diagnostics
lsp_diagnostics(filePath)  // Errors, warnings before we start
\`\`\`

### AST-Grep Skill for Pattern Analysis:

\`\`\`bash
// Find structural patterns
python3 scripts/ast_grep_helper.py search 'function $NAME($$$) { $$$ }' --lang ts src/

# Preview refactoring first
sg --pattern '[old_pattern]' --rewrite '[new_pattern]' --lang ts src/
\`\`\`

### Grep for Text Patterns:

\`\`\`
grep(pattern="[search_term]", path="src/", include="*.ts")
\`\`\`

## 1.3: Collect Background Results

\`\`\`
background_output(task_id="[agent_1_id]")
background_output(task_id="[agent_2_id]")
...
\`\`\`

**Mark phase-1 as completed after all results collected.**

---

`

export const REFACTOR_INTRO_AND_ANALYSIS_SECTION_ZH = `# 智能重构命令

## Codex 工作台工具兼容性

本命令包含面向 OpenCode 工作台的示例。在 Codex 中，不要按字面调用 OpenCode 专用工具，例如 \`call_omo_agent(...)\`、\`task(...)\`、\`background_output(...)\` 或 \`team_*(...)\`。请将这些示例转换为 Codex 原生工具：

| OpenCode 示例 | 应使用的 Codex 工具 |
| --- | --- |
| \`call_omo_agent(subagent_type="explore", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as an explorer. ...","agent_type":"explorer","fork_context":false})\` |
| \`call_omo_agent(subagent_type="librarian", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as a librarian. ...","agent_type":"librarian","fork_context":false})\` |
| \`task(subagent_type="plan", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as a planning agent. ...","agent_type":"plan","fork_context":false})\` |
| \`task(subagent_type="oracle", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as a rigorous reviewer. ...","agent_type":"lazycodex-gate-reviewer","fork_context":false})\` |
| \`task(category="...", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as an implementation or QA worker. ...","fork_context":false})\` |
| \`background_output(task_id="...")\` | \`multi_agent_v1.wait_agent(...)\` 用于邮箱信号 |
| \`team_*(...)\` | 通过 \`multi_agent_v1.spawn_agent\` 和 \`multi_agent_v1.wait_agent\` 使用 Codex 原生子代理；仅当 \`multi_agent_v1.send_input\` 和 \`multi_agent_v1.close_agent\` 出现在当前工具列表中时才使用它们 |

Codex 每个会话只暴露两种子代理工具面中的一种；请检查你自己的工具列表并相应路由。如果存在 \`multi_agent_v1.*\` 工具，按上表原样使用。如果取而代之的是带必填 \`task_name\` 的扁平 \`spawn_agent\`（\`multi_agent_v2\`），请重写每一个 \`multi_agent_v1.*\` 示例：\`multi_agent_v1.spawn_agent({...,"fork_context":false})\` 变为 \`spawn_agent({"task_name":"<lowercase_digits_underscores>","message":...,"agent_type":...,"fork_turns":"none"})\`（仅当确实需要完整父级历史时才使用 \`"all"\`）；\`send_input\` 变为 \`send_message\`；不要调用 \`close_agent\`/\`resume_agent\`（完成的代理会自行结束；\`followup_task\` 会重新派发任务，\`interrupt_agent\` 会停止代理）；\`wait_agent\` 只接受 \`timeout_ms\`，并在任意子代理邮箱出现活动时返回。\`agent_type\` 在两种工具面上的行为相同。如果下面的代码块与本小节冲突，以本小节为准。

翻译 \`load_skills=[...]\` 时，请将请求的技能名称包含在被生成代理的 \`message\` 中。如果下面的代码块与本小节冲突，以本小节为准。

## 用法
\`\`\`
/refactor <refactoring-target> [--scope=<file|module|project>] [--strategy=<safe|aggressive>]

Arguments:
  refactoring-target: What to refactor. Can be:
    - File path: src/auth/handler.ts
    - Symbol name: "AuthService class"
    - Pattern: "all functions using deprecated API"
    - Description: "extract validation logic into separate module"

Options:
  --scope: Refactoring scope (default: module)
    - file: Single file only
    - module: Module/directory scope
    - project: Entire codebase

  --strategy: Risk tolerance (default: safe)
    - safe: Conservative, maximum test coverage required
    - aggressive: Allow broader changes with adequate coverage
\`\`\`

## 本命令的作用

以完整的代码库感知执行智能、确定性的重构。与盲目查找替换不同，本命令：

1. **理解你的意图** - 分析你实际想要达成的目标
2. **绘制代码库地图** - 在改动任何内容之前建立确定的 codemap
3. **评估风险** - 评估测试覆盖率并确定验证策略
4. **细致规划** - 使用 Plan agent 创建详细计划
5. **精准执行** - 使用 LSP 和 AST-grep 分步重构
6. **持续验证** - 每次更改后运行测试以确保零回归

---

# 阶段 0: 意图门控（强制第一步）

**在采取任何行动之前，先对请求进行分类和验证。**

## 步骤 0.1: 解析请求类型

| 信号 | 分类 | 行动 |
|--------|----------------|--------|
| 具体文件/符号 | 明确 | 进入代码库分析 |
| "把 X 重构为 Y" | 清晰转换 | 进入代码库分析 |
| "改进"、"清理" | 开放式 | **必须询问**："具体改进什么？" |
| 范围模糊 | 不确定 | **必须询问**："哪些模块/文件？" |
| 上下文缺失 | 不完整 | **必须询问**："期望的结果是什么？" |

## 步骤 0.2: 验证理解

继续之前，请确认：
- [ ] 目标已被明确识别
- [ ] 期望结果已被理解
- [ ] 范围已定义（文件/模块/项目）
- [ ] 能够清晰表述成功标准

**如果以上任何一项不明确，请提出澄清问题：**

\`\`\`
I want to make sure I understand the refactoring goal correctly.

**What I understood**: [interpretation]
**What I'm unsure about**: [specific ambiguity]

Options I see:
1. [Option A] - [implications]
2. [Option B] - [implications]

**My recommendation**: [suggestion with reasoning]

Should I proceed with [recommendation], or would you prefer differently?
\`\`\`

## 步骤 0.3: 创建初始 Todos

**在理解请求后立即创建 todos：**

\`\`\`
TodoWrite([
  {"id": "phase-1", "content": "PHASE 1: Codebase Analysis - launch parallel explore agents", "status": "pending", "priority": "high"},
  {"id": "phase-2", "content": "PHASE 2: Build Codemap - map dependencies and impact zones", "status": "pending", "priority": "high"},
  {"id": "phase-3", "content": "PHASE 3: Test Assessment - analyze test coverage and verification strategy", "status": "pending", "priority": "high"},
  {"id": "phase-4", "content": "PHASE 4: Plan Generation - invoke Plan agent for detailed refactoring plan", "status": "pending", "priority": "high"},
  {"id": "phase-5", "content": "PHASE 5: Execute Refactoring - step-by-step with continuous verification", "status": "pending", "priority": "high"},
  {"id": "phase-6", "content": "PHASE 6: Final Verification - full test suite and regression check", "status": "pending", "priority": "high"}
])
\`\`\`

---

# 阶段 1: 代码库分析（并行探索）

**将 phase-1 标记为 in_progress。**

## 1.1: 启动并行探索代理（后台）

使用 \`call_omo_agent\` 同时发起全部这些操作：

\`\`\`
// Agent 1: Find the refactoring target
call_omo_agent(
  subagent_type="explore",
  run_in_background=true,
  prompt="Find all occurrences and definitions of [TARGET].${" "}
  Report: file paths, line numbers, usage patterns."
)

// Agent 2: Find related code
call_omo_agent(
  subagent_type="explore",${" "}
  run_in_background=true,
  prompt="Find all code that imports, uses, or depends on [TARGET].
  Report: dependency chains, import graphs."
)

// Agent 3: Find similar patterns
call_omo_agent(
  subagent_type="explore",
  run_in_background=true,
  prompt="Find similar code patterns to [TARGET] in the codebase.
  Report: analogous implementations, established conventions."
)

// Agent 4: Find tests
call_omo_agent(
  subagent_type="explore",
  run_in_background=true,
  prompt="Find all test files related to [TARGET].
  Report: test file paths, test case names, coverage indicators."
)

// Agent 5: Architecture context
call_omo_agent(
  subagent_type="explore",
  run_in_background=true,
  prompt="Find architectural patterns and module organization around [TARGET].
  Report: module boundaries, layer structure, design patterns in use."
)
\`\`\`

## 1.2: 直接工具探索（代理运行期间）

在后台代理运行期间，使用直接工具：

### 用于精确分析的 LSP 工具：

\`\`\`typescript
// Find definition(s)
LspGotoDefinition(filePath, line, character)  // Where is it defined?

// Find ALL usages across workspace
LspFindReferences(filePath, line, character, includeDeclaration=true)

// Get file structure
LspDocumentSymbols(filePath)  // Hierarchical outline
LspWorkspaceSymbols(filePath, query="[target_symbol]")  // Search by name

// Get current diagnostics
lsp_diagnostics(filePath)  // Errors, warnings before we start
\`\`\`

### 用于模式分析的 AST-Grep 技能：

\`\`\`bash
// Find structural patterns
python3 scripts/ast_grep_helper.py search 'function $NAME($$$) { $$$ }' --lang ts src/

# Preview refactoring first
sg --pattern '[old_pattern]' --rewrite '[new_pattern]' --lang ts src/
\`\`\`

### 用于文本模式的 Grep：

\`\`\`
grep(pattern="[search_term]", path="src/", include="*.ts")
\`\`\`

## 1.3: 收集后台结果

\`\`\`
background_output(task_id="[agent_1_id]")
background_output(task_id="[agent_2_id]")
...
\`\`\`

**收集完所有结果后，将 phase-1 标记为 completed。**

---

`
