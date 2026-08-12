export const REMOVE_AI_SLOPS_TEMPLATE = `# Remove AI Slops Command

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

## What this command does
Analyzes all files changed in the current branch (compared to parent commit), removes AI-generated code smells in parallel, then critically reviews the changes to ensure safety and behavior preservation. Fixes any issues found during review.

## Step 0: Task Planning

Use TodoWrite to create the task list:
1. Get changed files from branch
2. Run $omo:remove-ai-slops on each file in parallel
3. Critically review all changes
4. Fix any issues found

## Role Definition
You are a senior code quality engineer specialized in identifying and removing AI-generated code patterns while preserving original functionality. You have deep expertise in code review, refactoring safety, and behavioral preservation.

## Process

### Phase 1: Identify Changed Files
Detect the repository base branch dynamically, then get all changed files in the current branch:
\`\`\`bash
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
git diff $(git merge-base "$BASE_BRANCH" HEAD)..HEAD --name-only
\`\`\`

If \`git symbolic-ref refs/remotes/origin/HEAD\` is unavailable, detect the base branch at runtime using the repo's configured remote default branch. Only fall back to \`main\` as a last resort.

### Phase 2: Parallel AI Slop Removal
For each changed file, spawn an agent in parallel using the Task tool with the $omo:remove-ai-slops skill:

\`\`\`
task(category="quick", load_skills=["remove-ai-slops"], run_in_background=true, description="Remove AI slops from {filename}", prompt="Remove AI slops from: {file_path}")
\`\`\`

**CRITICAL**: Launch ALL agents in a SINGLE message with multiple Task tool calls for maximum parallelism.

Before running $omo:remove-ai-slops on each file, save a file-specific rollback artifact that captures only the delta introduced by the slop-removal pass. Use a safe pattern such as generating a per-file patch and reverse-applying it if review fails.

Do NOT use \`git checkout -- {file_path}\` or any rollback that discards pre-existing branch changes in the file.

### Phase 3: Critical Review
After all $omo:remove-ai-slops agents complete, perform a critical review with the following checklist:

**Safety Verification**:
- [ ] No functional logic was accidentally removed
- [ ] All error handling is preserved
- [ ] Type hints remain correct and complete
- [ ] Import statements are still valid
- [ ] No breaking changes to public APIs

**Behavior Preservation**:
- [ ] Return values unchanged
- [ ] Side effects unchanged
- [ ] Exception behavior unchanged
- [ ] Edge case handling preserved

**Code Quality**:
- [ ] Removed changes are genuinely AI slop (not intentional patterns)
- [ ] Remaining code follows project conventions
- [ ] No orphaned code or dead references

### Phase 4: Fix Issues
If any issues are found during critical review:
1. Identify the specific problem
2. Explain why it's a problem
3. Revert only the $omo:remove-ai-slops delta using the saved per-file patch or an equivalent reverse-apply workflow
4. If remaining ai-slops are found after reverting, remove them by editing the file yourself - with parallel tool calls, per-file
5. Verify the fix doesn't introduce new issues

## Output Format

### Summary Report
\`\`\`
## AI Slop Removal Summary

### Files Processed
- file1.py: X changes
- file2.py: Y changes

### Critical Review Results
- Safety: PASS/FAIL
- Behavior: PASS/FAIL
- Quality: PASS/FAIL

### Issues Found & Fixed
1. [Issue description] -> [Fix applied]

### Final Status
[CLEAN / ISSUES FIXED / REQUIRES ATTENTION]
\`\`\`

## Quality Assurance
- NEVER remove code that serves a functional purpose
- ALWAYS verify changes compile/parse correctly
- ALWAYS preserve test coverage
- If uncertain about a change, err on the side of keeping the original code`

export const REMOVE_AI_SLOPS_TEAM_MODE_ADDENDUM = `
---

# Team Mode Protocol (active when team_* tools are present)

Team mode is enabled for this session. The rules below **override Phase 2-4** of the legacy flow above. Follow this protocol instead of the per-file fire-and-forget \`task()\` dispatch.

## Phase 2 (team): \`slop-squad\` setup

**Precondition checks** (fail hard if any step fails):

1. Load the \`team-mode\` skill via the \`skill\` tool for lifecycle, message protocol, broadcast rules, 32KB message cap, and 4 parallel worker cap.
2. Call \`team_list\` and verify no active run named \`slop-squad\` exists. If one does, it is an orphan from a crashed prior session — \`team_shutdown_request\` + \`team_approve_shutdown\` + \`team_delete\` it before proceeding. Do not rename the team or run concurrent sessions under the same name.
3. If \`~/.omo/teams/slop-squad/config.json\` is missing, write it using the spec below.

**Team spec** (\`~/.omo/teams/slop-squad/config.json\`):

\`\`\`json
{
  "name": "slop-squad",
  "lead": { "kind": "subagent_type", "subagent_type": "sisyphus" },
  "members": [
    {
      "kind": "category",
      "category": "quick",
      "prompt": "You run $omo:remove-ai-slops on ONE file per task. Load $omo:remove-ai-slops via the skill tool. Read the task description for the file path. Apply the skill's detection criteria verbatim. After edits: run lsp_diagnostics on the file. Report via team_send_message(teamRunId=<id>, to=\"lead\", summary=<change count>, body=<full $omo:remove-ai-slops report>) + team_task_update(status=completed). On ambiguity: send team_send_message(teamRunId=<id>, to=\"lead\", summary=\"UNCLEAR\", body=<reason>) + team_task_update(status=pending). Never git add, never run tests, never touch other files."
    },
    { "kind": "category", "category": "quick", "prompt": "Same contract as peer quick worker." },
    { "kind": "category", "category": "quick", "prompt": "Same contract as peer quick worker." },
    {
      "kind": "category",
      "category": "unspecified-low",
      "prompt": "You are the FIX worker. You claim rework tasks that the lead creates after the external reviewer flags issues. Read the reviewer's per-hunk rollback instructions in the task description, apply the reverse patch, then run $omo:remove-ai-slops ONLY on the non-rolled-back remainder. Same reporting contract as quick peers. Handle UNCLEAR escalations the same way."
    }
  ]
}
\`\`\`

Rationale for this composition:
- **4 workers = team mode's parallel cap.** A fifth member just queues.
- **Reviewer is NOT a team member** — review demands stronger reasoning than category routing provides (team category members are downcast to sisyphus-junior). The reviewer runs OUTSIDE the team as a \`deep\` task; see Phase 3.
- **quick × 3** absorbs the mass of per-file slop removal. **unspecified-low × 1** is the rework lane for fixes triggered by reviewer findings.

**Team lifecycle** (create once, reuse until Phase 5 cleanup):

1. \`team_create(teamName="slop-squad")\`. Record \`teamRunId\` — every subsequent team call needs it.
2. Broadcast the detection criteria ONCE so each task description stays minimal:
   \`\`\`
   team_send_message(
     teamRunId=<id>, to="*", kind="announcement",
     summary="slop-criteria",
     body=<the 9 slop categories + KEEP rules; reference the $omo:remove-ai-slops skill content>
   )
   \`\`\`
3. Before spawning tasks, save a per-file rollback artifact that captures only the delta the slop-removal pass will introduce. Do NOT use \`git checkout -- <file>\` — that would discard pre-existing branch changes.
4. For each changed file, \`team_task_create(teamRunId=<id>, subject="slop: <file>", description=<file path + rollback artifact path + reporting format>, blockedBy=[])\`.

## Phase 3 (team): Incremental reviewer dispatch

While any team task is \`pending | claimed | in_progress\`:

- Wait for \`<system-reminder>\` or member messages. Do NOT tight-poll \`team_status\`; the runtime notifies on state changes. A single \`team_status\` check is acceptable if no notification arrives within roughly 10 seconds of expected completion.
- On each worker completion report:
  - Log the report to the pending final summary (no blocking).
  - Immediately dispatch an **external reviewer** — review runs OUTSIDE the team because team-member category routing downcasts to sisyphus-junior:
    \`\`\`
    task(
      category="deep",
      load_skills=[],
      run_in_background=true,
      description="slop review: <file>",
      prompt=<file path + full worker report + Safety/Behavior/Quality checklist + instruction to output "PASS" or "FAIL:<per-hunk rollback instructions>">
    )
    \`\`\`
    If \`deep\` is unavailable in this session, fall back to \`category="unspecified-high"\`.
- On a reviewer task returning FAIL:
  - Create a rework team task: \`team_task_create(subject="rework: <file>", description=<reverse-patch hunks from reviewer + "then run $omo:remove-ai-slops on remaining non-rolled-back issues only">)\`. The \`unspecified-low\` fix member claims it.
  - Create a new reviewer task paired to the rework completion (same incremental pattern).
- Loop until every file has a PASS from the reviewer AND no team task is outstanding.

## Phase 4 (team): Fix issues

Fixes happen incrementally during Phase 3's loop via rework tasks — this phase is already handled when the loop exits. Any remaining manual fix that neither worker nor fix member could resolve is handled by Lead here, editing files directly.

## Phase 5 (team): Team cleanup

Before producing the summary report, dismantle the team on EVERY exit path — success, escalation, abort — otherwise the next session's Phase 2 precondition check catches the orphan.

1. \`team_shutdown_request\` for each member, then \`team_approve_shutdown\` if members do not self-approve within a reasonable window.
2. \`team_delete(teamRunId=<id>)\`.
3. \`team_list\` to confirm no residual \`slop-squad\` run.

The \`~/.omo/teams/slop-squad/config.json\` declaration file stays on disk; it is reused next session.

## MUST NOT (team mode)

- Lead never edits files directly — orchestrate only. If editing is needed, it goes into a team task.
- Do not inline the full slop-criteria into every task description; rely on the Phase 2 broadcast.
- Do not call \`team_create\` again mid-session. One team per resolution.
- Do not put \`oracle\` / \`librarian\` into the team spec — they are team-ineligible; call them via \`task()\` outside the team when needed.
`

export const REMOVE_AI_SLOPS_TEMPLATE_ZH = `# 移除 AI Slops 命令

## Codex 工具集兼容性说明

本命令包含面向 OpenCode 工具集的示例。在 Codex 中，请勿直接调用 OpenCode 专用工具，如 \`call_omo_agent(...)\`、\`task(...)\`、\`background_output(...)\` 或 \`team_*(...)\`。请将这些示例转换为 Codex 原生工具：

| OpenCode 示例 | 应使用的 Codex 工具 |
| --- | --- |
| \`call_omo_agent(subagent_type="explore", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as an explorer. ...","agent_type":"explorer","fork_context":false})\` |
| \`call_omo_agent(subagent_type="librarian", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as a librarian. ...","agent_type":"librarian","fork_context":false})\` |
| \`task(subagent_type="plan", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as a planning agent. ...","agent_type":"plan","fork_context":false})\` |
| \`task(subagent_type="oracle", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as a rigorous reviewer. ...","agent_type":"lazycodex-gate-reviewer","fork_context":false})\` |
| \`task(category="...", ...)\` | \`multi_agent_v1.spawn_agent({"message":"TASK: act as an implementation or QA worker. ...","fork_context":false})\` |
| \`background_output(task_id="...")\` | 用于邮箱信号的 \`multi_agent_v1.wait_agent(...)\` |
| \`team_*(...)\` | 通过 \`multi_agent_v1.spawn_agent\` 和 \`multi_agent_v1.wait_agent\` 使用 Codex 原生子代理；仅当活动工具列表中暴露 \`multi_agent_v1.send_input\` 和 \`multi_agent_v1.close_agent\` 时才使用它们 |

Codex 每个会话只暴露两种子代理工具面之一；请检查你自己的工具列表并据此路由。如果存在 \`multi_agent_v1.*\` 工具，请按上表原样使用。如果存在的是带必填 \`task_name\` 的扁平 \`spawn_agent\`（\`multi_agent_v2\`），请重写每个 \`multi_agent_v1.*\` 示例：\`multi_agent_v1.spawn_agent({...,"fork_context":false})\` 变为 \`spawn_agent({"task_name":"<lowercase_digits_underscores>","message":...,"agent_type":...,"fork_turns":"none"})\`（仅当确实需要完整父级历史时才使用 \`"all"\`）；\`send_input\` 变为 \`send_message\`；不要调用 \`close_agent\`/\`resume_agent\`（已完成的代理会自行结束；\`followup_task\` 可重新指派其中一个，\`interrupt_agent\` 可停止其中一个）；\`wait_agent\` 只接受 \`timeout_ms\`，并在任何子邮箱活动时返回。\`agent_type\` 在两个工具面上行为相同。如果下方代码块与本小节冲突，以本小节为准。

当转换 \`load_skills=[...]\` 时，请将请求的技能名称包含在生成的代理的 \`message\` 中。如果下方代码块与本小节冲突，以本小节为准。

## 本命令的作用
分析当前分支中所有变更的文件（与父提交对比），并行移除 AI 生成的代码痕迹，然后批判性审查这些改动，确保安全且行为保持不变，并修复审查中发现的任何问题。

## 第 0 步：任务规划

使用 TodoWrite 创建任务列表：
1. 获取分支中变更的文件
2. 对每个文件并行运行 $omo:remove-ai-slops
3. 批判性审查所有改动
4. 修复发现的任何问题

## 角色定义
你是一名资深代码质量工程师，专长是识别并移除 AI 生成的代码模式，同时保留原始功能。你在代码审查、重构安全性和行为保持方面拥有深厚经验。

## 流程

### 阶段 1：识别变更的文件
动态检测仓库的基础分支，然后获取当前分支中所有变更的文件：
\`\`\`bash
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
git diff $(git merge-base "$BASE_BRANCH" HEAD)..HEAD --name-only
\`\`\`

如果 \`git symbolic-ref refs/remotes/origin/HEAD\` 不可用，请在运行时使用仓库配置的远程默认分支来检测基础分支。仅在万不得已时才回退到 \`main\`。

### 阶段 2：并行移除 AI 痕迹
对每个变更的文件，使用 Task 工具配合 $omo:remove-ai-slops 技能并行生成一个代理：

\`\`\`
task(category="quick", load_skills=["remove-ai-slops"], run_in_background=true, description="Remove AI slops from {filename}", prompt="Remove AI slops from: {file_path}")
\`\`\`

**关键**：在单条消息中通过多次 Task 工具调用启动所有代理，以获得最大并行度。

在对每个文件运行 $omo:remove-ai-slops 之前，先保存一个针对该文件的回滚产物，只捕获清理通过所引入的增量。可使用安全模式，例如生成每个文件的补丁，并在审查失败时反向应用。

不要使用 \`git checkout -- {file_path}\` 或任何会丢弃该文件中既有分支改动的回滚方式。

### 阶段 3：批判性审查
在所有 $omo:remove-ai-slops 代理完成后，按以下检查清单进行批判性审查：

**安全性验证**：
- [ ] 未意外删除任何功能性逻辑
- [ ] 所有错误处理均已保留
- [ ] 类型提示保持正确和完整
- [ ] import 语句仍然有效
- [ ] 公共 API 无破坏性变更

**行为保持**：
- [ ] 返回值不变
- [ ] 副作用不变
- [ ] 异常行为不变
- [ ] 边界情况处理已保留

**代码质量**：
- [ ] 移除的确实是 AI 痕迹（而非有意的模式）
- [ ] 剩余代码符合项目约定
- [ ] 无孤立代码或失效引用

### 阶段 4：修复问题
如果在批判性审查中发现任何问题：
1. 定位具体问题
2. 说明为什么这是一个问题
3. 仅使用保存的逐文件补丁或等效的反向应用流程回滚 $omo:remove-ai-slops 的增量
4. 如果回滚后仍发现 AI 痕迹，请自行编辑文件移除 - 逐文件使用并行工具调用
5. 验证修复未引入新问题

## 输出格式

### 汇总报告
\`\`\`
## AI Slop Removal Summary

### Files Processed
- file1.py: X changes
- file2.py: Y changes

### Critical Review Results
- Safety: PASS/FAIL
- Behavior: PASS/FAIL
- Quality: PASS/FAIL

### Issues Found & Fixed
1. [Issue description] -> [Fix applied]

### Final Status
[CLEAN / ISSUES FIXED / REQUIRES ATTENTION]
\`\`\`

## 质量保证
- 绝不删除具有功能用途的代码
- 始终验证改动能够正确编译/解析
- 始终保留测试覆盖
- 如果对某个改动不确定，宁可保留原始代码`

export const REMOVE_AI_SLOPS_TEAM_MODE_ADDENDUM_ZH = `
---

# 团队模式协议（当存在 team_* 工具时生效）

本会话已启用团队模式。以下规则 **覆盖** 上述旧流程的阶段 2-4。请遵循本协议，而不是逐文件"发出即忘"的 \`task()\` 调度。

## 阶段 2（团队）：\`slop-squad\` 组建

**前置条件检查**（任何一步失败则硬失败）：

1. 通过 \`skill\` 工具加载 \`team-mode\` 技能，了解生命周期、消息协议、广播规则、32KB 消息上限和 4 个并行 worker 上限。
2. 调用 \`team_list\`，确认不存在名为 \`slop-squad\` 的活动运行。如果存在，则是之前崩溃会话遗留的孤儿 - 先执行 \`team_shutdown_request\` + \`team_approve_shutdown\` + \`team_delete\` 再继续。不要重命名团队，也不要在同一名称下并发运行会话。
3. 如果 \`~/.omo/teams/slop-squad/config.json\` 不存在，请按下面的规格写入。

**团队规格**（\`~/.omo/teams/slop-squad/config.json\`）：

\`\`\`json
{
  "name": "slop-squad",
  "lead": { "kind": "subagent_type", "subagent_type": "sisyphus" },
  "members": [
    {
      "kind": "category",
      "category": "quick",
      "prompt": "You run $omo:remove-ai-slops on ONE file per task. Load $omo:remove-ai-slops via the skill tool. Read the task description for the file path. Apply the skill's detection criteria verbatim. After edits: run lsp_diagnostics on the file. Report via team_send_message(teamRunId=<id>, to=\"lead\", summary=<change count>, body=<full $omo:remove-ai-slops report>) + team_task_update(status=completed). On ambiguity: send team_send_message(teamRunId=<id>, to=\"lead\", summary=\"UNCLEAR\", body=<reason>) + team_task_update(status=pending). Never git add, never run tests, never touch other files."
    },
    { "kind": "category", "category": "quick", "prompt": "Same contract as peer quick worker." },
    { "kind": "category", "category": "quick", "prompt": "Same contract as peer quick worker." },
    {
      "kind": "category",
      "category": "unspecified-low",
      "prompt": "You are the FIX worker. You claim rework tasks that the lead creates after the external reviewer flags issues. Read the reviewer's per-hunk rollback instructions in the task description, apply the reverse patch, then run $omo:remove-ai-slops ONLY on the non-rolled-back remainder. Same reporting contract as quick peers. Handle UNCLEAR escalations the same way."
    }
  ]
}
\`\`\`

此组成的理由：
- **4 个 worker = 团队模式的并行上限。** 第五个成员只会排队。
- **审查者不是团队成员** - 审查需要比类别路由更强的推理能力（团队成员会被降级为 sisyphus-junior）。审查者在团队之外以 \`deep\` 任务运行；参见阶段 3。
- **quick × 3** 消化大部分逐文件的清理工作。**unspecified-low × 1** 是处理审查者发现所触发修复的重做通道。

**团队生命周期**（创建一次，复用至阶段 5 清理）：

1. \`team_create(teamName="slop-squad")\`。记录 \`teamRunId\` - 后续每次团队调用都需要它。
2. 只广播一次检测标准，使每个任务描述保持精简：
   \`\`\`
   team_send_message(
     teamRunId=<id>, to="*", kind="announcement",
     summary="slop-criteria",
     body=<the 9 slop categories + KEEP rules; reference the $omo:remove-ai-slops skill content>
   )
   \`\`\`
3. 在生成任务之前，保存一个逐文件回滚产物，只捕获清理通过将引入的增量。不要使用 \`git checkout -- <file>\` - 那会丢弃已有的分支改动。
4. 对每个变更的文件执行 \`team_task_create(teamRunId=<id>, subject="slop: <file>", description=<file path + rollback artifact path + reporting format>, blockedBy=[])\`。

## 阶段 3（团队）：增量式审查者调度

只要有任何团队任务处于 \`pending | claimed | in_progress\` 状态：

- 等待 \`<system-reminder>\` 或成员消息。不要紧轮询 \`team_status\`；运行时会在状态变化时通知。如果在预期完成后约 10 秒内未收到通知，检查一次 \`team_status\` 是可以接受的。
- 每次有 worker 完成报告时：
  - 将报告记录到待定的最终汇总中（不阻塞）。
  - 立即调度一个**外部审查者** - 审查在团队之外运行，因为团队成员类别路由会降级为 sisyphus-junior：
    \`\`\`
    task(
      category="deep",
      load_skills=[],
      run_in_background=true,
      description="slop review: <file>",
      prompt=<file path + full worker report + Safety/Behavior/Quality checklist + instruction to output "PASS" or "FAIL:<per-hunk rollback instructions>">
    )
    \`\`\`
    如果本会话中 \`deep\` 不可用，回退到 \`category="unspecified-high"\`。
- 当审查者任务返回 FAIL 时：
  - 创建一个重做团队任务：\`team_task_create(subject="rework: <file>", description=<reverse-patch hunks from reviewer + "then run $omo:remove-ai-slops on remaining non-rolled-back issues only">)\`。\`unspecified-low\` 修复成员会认领它。
  - 创建一个与重做完成配对的新审查者任务（相同的增量模式）。
- 循环，直到每个文件都获得审查者的 PASS 且没有未完成的团队任务。

## 阶段 4（团队）：修复问题

修复在阶段 3 的循环中通过重做任务增量完成 - 循环退出时本阶段已处理完毕。任何 worker 和修复成员都无法解决的剩余手工修复，由 Lead 在此直接编辑文件处理。

## 阶段 5（团队）：团队清理

在生成汇总报告之前，必须在每一条退出路径上拆除团队 - 成功、升级、中止 - 否则下次会话的阶段 2 前置条件检查会捕获到孤儿。

1. 对每个成员执行 \`team_shutdown_request\`，如果成员未在合理时间内自行批准，则执行 \`team_approve_shutdown\`。
2. \`team_delete(teamRunId=<id>)\`。
3. \`team_list\` 确认不存在残留的 \`slop-squad\` 运行。

\`~/.omo/teams/slop-squad/config.json\` 声明文件保留在磁盘上；下次会话会复用它。

## 禁止事项（团队模式）

- Lead 绝不直接编辑文件 - 只做编排。如果需要编辑，将其放入团队任务。
- 不要在每条任务描述中内联完整的清理标准；依赖阶段 2 的广播。
- 不要在会话中途再次调用 \`team_create\`。每次解决只创建一个团队。
- 不要将 \`oracle\` / \`librarian\` 放入团队规格 - 它们不具备团队资格；需要时在团队之外通过 \`task()\` 调用。
`
