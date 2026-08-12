export const REFACTOR_TEAM_MODE_ADDENDUM = `
---

# Team Mode Protocol (active when team_* tools are present)

Team mode is enabled for this session. The rules below **override Phase 4-6** above. Follow this protocol instead of the in-session step-by-step execution.

## Phase 4 override: Plan agent staffing requirement

When invoking the Plan agent in Phase 4.1, append this additional requirement to the prompt:

\`\`\`
7. (REQUIRED when team mode is active) Output a Team Staffing Recommendation section with these fields — missing fields fail Phase 5.0:
   - total_atomic_steps: integer
   - file_independent_steps: integer (parallelizable, no cross-file blocker)
   - cross_file_dependent_steps: integer (has blockers)
   - per_step_assignment: [{step_id, assigned_to: 'quick' | 'unspecified-low', blockedBy: [step_ids], rationale}]
   - dispatch_path_recommendation: 'team' | 'legacy' with reason
   - rationale for the composition
\`\`\`

**Classification rules** the plan agent must apply to each step:
- \`quick\`: mechanical edits — LSP rename, extract variable, inline, simple move, signature change without call-site logic.
- \`unspecified-low\`: logic-preserving refactors that need reasoning — extract function, restructure conditional, pattern transformation, cross-file API change.
- Recommend \`team\` path when \`file_independent_steps >= 3\`; recommend \`legacy\` otherwise.

## Phase 5 override: Dispatch path selection

Read the Team Staffing Recommendation from Phase 4. If any required field is missing, fail here and re-request the plan with the exact missing field names. Do not proceed with a partial plan.

Then choose the path:

- **Team path (5.1-T)**: when the plan recommends \`team\` AND \`file_independent_steps >= 3\`. Members execute in parallel, Lead orchestrates, a \`deep\` verifier lives outside the team.
- **Legacy path (5.1-L)**: otherwise. Use the original 5.1 / 5.2 / 5.3 flow from above.

Record the chosen path in the TodoWrite list.

## Phase 5.1-T: \`refactor-squad\` team execution

**Precondition checks** (fail hard if any step fails):

1. Load the \`team-mode\` skill via the \`skill\` tool for lifecycle, message protocol, and limits.
2. Call \`team_list\` and verify no active \`refactor-squad\` run exists; if one does, shutdown + delete the orphan before proceeding.
3. If \`~/.omo/teams/refactor-squad/config.json\` is missing, write it using the spec below.

**Team spec** (\`~/.omo/teams/refactor-squad/config.json\`):

\`\`\`json
{
  "name": "refactor-squad",
  "lead": { "kind": "subagent_type", "subagent_type": "sisyphus" },
  "members": [
    {
      "kind": "category",
      "category": "quick",
      "prompt": "You handle mechanical refactoring steps (LSP rename, extract variable, inline, simple move, signature change). Use LSP tools for correctness. Apply the task description's per-step instructions verbatim — no scope expansion. After edits, run lsp_diagnostics on touched files. Report via team_send_message(teamRunId=<id>, to=\"lead\", summary=<files touched>, body=<lsp status + diff summary>) + team_task_update(status=completed). Never run tests — the external verifier handles that. Never git add, never --continue."
    },
    { "kind": "category", "category": "quick", "prompt": "Same contract as peer quick worker." },
    {
      "kind": "category",
      "category": "unspecified-low",
      "prompt": "You handle logic-preserving refactors that need reasoning (extract function, restructure conditional, pattern transformation, cross-file API change). Read the task description's plan step carefully. Use the ast-grep skill helper or sg CLI to preview structural rewrites first, review the preview, then execute. If the step is ambiguous or would require out-of-scope changes, STOP and send team_send_message(teamRunId=<id>, to=\"lead\", summary=\"UNCLEAR\", body=<reason>) + team_task_update(status=pending). Same reporting contract as peer quick workers. Never run tests."
    },
    { "kind": "category", "category": "unspecified-low", "prompt": "Same contract as peer unspecified-low worker." }
  ]
}
\`\`\`

Rationale for this composition:
- **4 workers = team mode's parallel cap.** 5+ just queues.
- **No verifier team member.** Verification needs \`deep\` reasoning (or \`unspecified-high\` fallback). In-team category routing downcasts to sisyphus-junior, which is weaker than required — the verifier runs OUTSIDE the team as a \`task(category="deep")\`.
- **quick × 2** for mechanical edits, **unspecified-low × 2** for reasoning edits — mirrors the plan's split.

**Team lifecycle** (one team, reused until Phase 6 cleanup):

1. \`team_create(teamName="refactor-squad")\`. Record \`teamRunId\`.
2. Broadcast the refactor Intent Card ONCE (keep task descriptions slim):
   \`\`\`
   team_send_message(
     teamRunId=<id>, to="*", kind="announcement",
     summary="refactor-intent",
     body=<codemap summary + constraints + established patterns from Phase 2>
   )
   \`\`\`
3. Broadcast the verification spec ONCE:
   \`\`\`
   team_send_message(
     teamRunId=<id>, to="*", kind="announcement",
     summary="verify-spec",
     body=<exact test/typecheck/lint commands + expected pass counts + regression indicators from Phase 3.4>
   )
   \`\`\`
4. For each plan step, \`team_task_create(teamRunId=<id>, subject="refactor step <N>: <short>", description=<per-step instructions from plan, including target files and line ranges, rollback strategy>, blockedBy=<from plan's per_step_assignment>)\`.

**Lead monitoring loop**:

While any team task is \`pending | claimed | in_progress\`:

- Wait for \`<system-reminder>\` or member messages. Avoid tight polling; a single \`team_status\` check is acceptable if no notification arrives within roughly 10 seconds of expected completion.
- On a worker completion report, immediately dispatch an **external verifier** — verification runs OUTSIDE the team because team-member category routing downcasts to sisyphus-junior:
  \`\`\`
  task(
    category="deep",
    load_skills=[],
    run_in_background=true,
    description="verify step <N>",
    prompt=<files touched + verify-spec commands + instruction to return "PASS" or "FAIL:<failing test + specific error + suggested revert hunks>">
  )
  \`\`\`
  If \`deep\` is unavailable, fall back to \`category="unspecified-high"\`. Do not create a commit checkpoint until the verifier returns PASS.
- On a verifier PASS: make the commit checkpoint for that step (see original 5.3). Proceed.
- On a verifier FAIL: Lead decides:
  - **Retry with fix hint**: \`team_task_update(status=pending)\` on the original step + \`team_send_message(teamRunId=<id>, to=<original member>, summary="retry", body=<specific failure from verifier>)\`. Runtime reassigns.
  - **Escalate**: after three FAIL cycles on the same step, STOP and consult the user with full evidence.
- On a member UNCLEAR message: re-harvest context via a targeted \`task()\` outside the team, broadcast an updated Intent Card fragment, then reassign.

Proceed to Phase 6 only when every team task is \`completed\` AND every paired verifier task returned PASS.

## Phase 6 override: Team cleanup before summary

If Phase 5 used the team path, dismantle \`refactor-squad\` BEFORE producing the 6.6 summary. Every exit path — success, escalation, abort — must cleanup; orphan teams poison the next session's precondition check.

1. \`team_shutdown_request\` for each member, then \`team_approve_shutdown\` if members do not self-approve within a reasonable window.
2. \`team_delete(teamRunId=<id>)\`.
3. \`team_list\` to confirm no residual \`refactor-squad\` run.

The \`~/.omo/teams/refactor-squad/config.json\` declaration stays on disk; next session reuses it.

Append to the 6.6 summary a "Dispatch path" line and, when team path was used, team metrics (teamRunId, tasks created, verifier runs, team lifetime).

## MUST NOT (team mode)

- Lead never edits files directly — orchestrate only.
- Do not inline the Intent Card or verify-spec into task descriptions — rely on the broadcasts.
- Do not recreate the team mid-session.
- Do not run tests from Lead — the external verifier owns that lane.
- Do not put \`oracle\` / \`librarian\` / \`deep\` into the team spec — oracle/librarian are team-ineligible, and \`deep\` under category routing downcasts to sisyphus-junior. Use them via \`task()\` outside the team when needed.
`

export const REFACTOR_TEAM_MODE_ADDENDUM_ZH = `
---

# 团队模式协议（当存在 team_* 工具时生效）

本会话已启用团队模式。以下规则**覆盖上文第 4-6 阶段**。请遵循本协议，而不是会话内的逐步执行流程。

## 第 4 阶段覆盖：Plan agent 人员配置要求

在第 4.1 阶段调用 Plan agent 时，请将以下附加要求追加到提示中：

\`\`\`
7. (REQUIRED when team mode is active) Output a Team Staffing Recommendation section with these fields — missing fields fail Phase 5.0:
   - total_atomic_steps: integer
   - file_independent_steps: integer (parallelizable, no cross-file blocker)
   - cross_file_dependent_steps: integer (has blockers)
   - per_step_assignment: [{step_id, assigned_to: 'quick' | 'unspecified-low', blockedBy: [step_ids], rationale}]
   - dispatch_path_recommendation: 'team' | 'legacy' with reason
   - rationale for the composition
\`\`\`

Plan agent 必须对每个步骤应用的**分类规则**：
- \`quick\`：机械性编辑 - LSP 重命名、提取变量、内联、简单移动、不含调用点逻辑的签名更改。
- \`unspecified-low\`：需要推理且保持逻辑的重构 - 提取函数、重构条件语句、模式转换、跨文件 API 更改。
- 当 \`file_independent_steps >= 3\` 时推荐 \`team\` 路径；否则推荐 \`legacy\`。

## 第 5 阶段覆盖：派发路径选择

阅读第 4 阶段生成的团队人员配置建议。如果缺少任何必填字段，请在此处失败，并携带缺失字段的确切名称重新请求计划。不要使用不完整的计划继续执行。

然后选择路径：

- **团队路径（5.1-T）**：当计划推荐 \`team\` 且 \`file_independent_steps >= 3\` 时。成员并行执行，Lead 负责编排，\`deep\` 验证器位于团队之外。
- **传统路径（5.1-L）**：其他情况。使用上文原始的 5.1 / 5.2 / 5.3 流程。

将所选路径记录在 TodoWrite 列表中。

## 阶段 5.1-T: \`refactor-squad\` 团队执行

**前置条件检查**（任何一步失败都立即终止）：

1. 通过 \`skill\` 工具加载 \`team-mode\` 技能，以了解生命周期、消息协议和限制。
2. 调用 \`team_list\` 并确认不存在活动的 \`refactor-squad\` 运行；如果存在，先关闭并删除该孤儿团队再继续。
3. 如果 \`~/.omo/teams/refactor-squad/config.json\` 不存在，请使用下面的规范写入它。

**团队规范**（\`~/.omo/teams/refactor-squad/config.json\`）：

\`\`\`json
{
  "name": "refactor-squad",
  "lead": { "kind": "subagent_type", "subagent_type": "sisyphus" },
  "members": [
    {
      "kind": "category",
      "category": "quick",
      "prompt": "You handle mechanical refactoring steps (LSP rename, extract variable, inline, simple move, signature change). Use LSP tools for correctness. Apply the task description's per-step instructions verbatim — no scope expansion. After edits, run lsp_diagnostics on touched files. Report via team_send_message(teamRunId=<id>, to=\"lead\", summary=<files touched>, body=<lsp status + diff summary>) + team_task_update(status=completed). Never run tests — the external verifier handles that. Never git add, never --continue."
    },
    { "kind": "category", "category": "quick", "prompt": "Same contract as peer quick worker." },
    {
      "kind": "category",
      "category": "unspecified-low",
      "prompt": "You handle logic-preserving refactors that need reasoning (extract function, restructure conditional, pattern transformation, cross-file API change). Read the task description's plan step carefully. Use the ast-grep skill helper or sg CLI to preview structural rewrites first, review the preview, then execute. If the step is ambiguous or would require out-of-scope changes, STOP and send team_send_message(teamRunId=<id>, to=\"lead\", summary=\"UNCLEAR\", body=<reason>) + team_task_update(status=pending). Same reporting contract as peer quick workers. Never run tests."
    },
    { "kind": "category", "category": "unspecified-low", "prompt": "Same contract as peer unspecified-low worker." }
  ]
}
\`\`\`

该配置的考量：
- **4 个 worker 是团队模式的并行上限。** 5 个以上只会排队。
- **团队内没有验证器成员。** 验证需要 \`deep\` 推理（或 \`unspecified-high\` 回退）。团队内类别路由会降级为 sisyphus-junior，其能力低于要求 - 验证器以 \`task(category="deep")\` 的形式在团队**外部**运行。
- **quick × 2** 用于机械性编辑，**unspecified-low × 2** 用于需要推理的编辑 - 与计划的分工保持一致。

**团队生命周期**（一个团队，复用到第 6 阶段清理为止）：

1. 调用 \`team_create(teamName="refactor-squad")\`。记录 \`teamRunId\`。
2. 广播重构意图卡片一次（保持任务描述精简）：
   \`\`\`
   team_send_message(
     teamRunId=<id>, to="*", kind="announcement",
     summary="refactor-intent",
     body=<codemap summary + constraints + established patterns from Phase 2>
   )
   \`\`\`
3. 广播验证规范一次：
   \`\`\`
   team_send_message(
     teamRunId=<id>, to="*", kind="announcement",
     summary="verify-spec",
     body=<exact test/typecheck/lint commands + expected pass counts + regression indicators from Phase 3.4>
   )
   \`\`\`
4. 对于计划中的每一步，调用 \`team_task_create(teamRunId=<id>, subject="refactor step <N>: <short>", description=<per-step instructions from plan, including target files and line ranges, rollback strategy>, blockedBy=<from plan's per_step_assignment>)\`。

**Lead 监控循环**：

只要存在状态为 \`pending | claimed | in_progress\` 的团队任务：

- 等待 \`<system-reminder>\` 或成员消息。避免密集轮询；如果在预期完成时间后约 10 秒内没有收到通知，进行单次 \`team_status\` 检查是可以接受的。
- 收到 worker 完成报告后，立即派发一个**外部验证器** - 验证在团队外部运行，因为团队成员类别路由会降级为 sisyphus-junior：
  \`\`\`
  task(
    category="deep",
    load_skills=[],
    run_in_background=true,
    description="verify step <N>",
    prompt=<files touched + verify-spec commands + instruction to return "PASS" or "FAIL:<failing test + specific error + suggested revert hunks>">
  )
  \`\`\`
  如果 \`deep\` 不可用，回退到 \`category="unspecified-high"\`。在验证器返回 PASS 之前，不要创建提交检查点。
- 验证器返回 PASS：为该步骤创建提交检查点（参见原始 5.3）。继续。
- 验证器返回 FAIL：由 Lead 决定：
  - **携带修复提示重试**：对原步骤调用 \`team_task_update(status=pending)\`，并调用 \`team_send_message(teamRunId=<id>, to=<original member>, summary="retry", body=<specific failure from verifier>)\`。运行时重新分配。
  - **升级**：同一步骤连续三轮 FAIL 后，停止并向用户咨询，附上完整证据。
- 收到成员 UNCLEAR 消息：通过团队外部的定向 \`task()\` 重新收集上下文，广播更新后的意图卡片片段，然后重新分配。

只有当每个团队任务都是 \`completed\` 且每个配对的验证器任务都返回 PASS 时，才进入第 6 阶段。

## 第 6 阶段覆盖：生成摘要前的团队清理

如果第 5 阶段使用了团队路径，请在生成 6.6 摘要**之前**拆除 \`refactor-squad\`。所有退出路径 - 成功、升级、中止 - 都必须清理；孤儿团队会污染下一个会话的前置条件检查。

1. 对每个成员调用 \`team_shutdown_request\`，如果成员未在合理时间窗口内自行批准，则调用 \`team_approve_shutdown\`。
2. 调用 \`team_delete(teamRunId=<id>)\`。
3. 调用 \`team_list\` 确认没有残留的 \`refactor-squad\` 运行。

\`~/.omo/teams/refactor-squad/config.json\` 的声明保留在磁盘上；下一个会话会复用它。

在 6.6 摘要中追加一行"派发路径"，并在使用了团队路径时追加团队指标（teamRunId、创建的任务数、验证器运行次数、团队存活时长）。

## 禁止事项（团队模式）

- Lead 绝不直接编辑文件 - 只负责编排。
- 不要将意图卡片或验证规范内联到任务描述中 - 依赖广播。
- 不要在会话中途重新创建团队。
- Lead 不要运行测试 - 这条职责属于外部验证器。
- 不要将 \`oracle\` / \`librarian\` / \`deep\` 放入团队规范 - oracle/librarian 不具备团队成员资格，且 \`deep\` 在类别路由下会降级为 sisyphus-junior。需要时通过团队外的 \`task()\` 使用它们。
`
