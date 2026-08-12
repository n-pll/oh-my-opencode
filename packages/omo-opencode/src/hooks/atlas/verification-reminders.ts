import { getVerificationReminder } from "./system-reminder-templates"

function buildReuseHint(sessionId: string): string {
  return `
**PREFERRED REUSE SESSION FOR THE CURRENT TOP-LEVEL PLAN TASK**

- Reuse \`${sessionId}\` first if verification fails or the result needs follow-up.
- Start a fresh subagent session only when reuse is unavailable or would cross task boundaries.
`
}

export function buildCompletionGate(planName: string, sessionId: string): string {
  return `
**COMPLETION GATE - DO NOT PROCEED UNTIL THIS IS DONE**

Your completion will NOT be recorded until you complete ALL of the following:

1. **Edit** the plan file \`.omo/plans/${planName}.md\`:
   - Change \`- [ ]\` to \`- [x]\` for the completed task
   - Use \`Edit\` tool to modify the checkbox

2. **Read** the plan file AGAIN:
   \`\`\`
   Read(".omo/plans/${planName}.md")
   \`\`\`
   - Verify the checkbox count changed (more \`- [x]\` than before)

3. **DO NOT call \`task()\` again** until you have completed steps 1 and 2 above.

If anything fails while closing this out, resume the same session immediately:
\`\`\`typescript
task(task_id="${sessionId}", load_skills=[], prompt="fix: checkbox not recorded correctly")
\`\`\`

**Your completion is NOT tracked until the checkbox is marked in the plan file.**

**VERIFICATION_REMINDER**
${buildReuseHint(sessionId)}`
}

function buildVerificationReminder(sessionId: string): string {
  return `**VERIFICATION_REMINDER**

${getVerificationReminder()}

---

**If ANY verification fails, use this immediately:**
\`\`\`
task(task_id="${sessionId}", load_skills=[], prompt="fix: [describe the specific failure]")
\`\`\`

${buildReuseHint(sessionId)}`
}

export function buildOrchestratorReminder(
  planName: string,
  progress: { total: number; completed: number },
  sessionId: string,
  autoCommit: boolean = true,
  includeCompletionGate: boolean = true
): string {
  const remaining = progress.total - progress.completed

  const commitStep = autoCommit
    ? `
**STEP 7: COMMIT ATOMIC UNIT**

- Stage ONLY the verified changes
- Commit with clear message describing what was done
`
    : ""

  const nextStepNumber = autoCommit ? 8 : 7

  return `
---

**BOULDER STATE:** Plan: \`${planName}\` | ${progress.completed}/${progress.total} done | ${remaining} remaining

---

${includeCompletionGate ? `${buildCompletionGate(planName, sessionId)}

` : ""}${buildVerificationReminder(sessionId)}

**STEP 5: READ SUBAGENT NOTEPAD (LEARNINGS, ISSUES, PROBLEMS)**

The subagent was instructed to record findings in notepad files. Read them NOW:
\`\`\`
Glob(".omo/notepads/${planName}/*.md")
\`\`\`
Then \`Read\` each file found - especially:
- **learnings.md**: Patterns, conventions, successful approaches discovered
- **issues.md**: Problems, blockers, gotchas encountered during work
- **problems.md**: Unresolved issues, technical debt flagged

**USE this information to:**
- Inform your next delegation (avoid known pitfalls)
- Adjust your plan if blockers were discovered
- Propagate learnings to subsequent subagents

**STEP 6: CHECK BOULDER STATE DIRECTLY (EVERY TIME - NO EXCEPTIONS)**

Do NOT rely on cached progress. Read the plan file NOW:
\`\`\`
Read(".omo/plans/${planName}.md")
\`\`\`
Count exactly: how many \`- [ ]\` remain? How many \`- [x]\` completed?
This is YOUR ground truth. Use it to decide what comes next.

${commitStep}
**STEP ${nextStepNumber}: PROCEED TO NEXT TASK**

- Read the plan file AGAIN to identify the next \`- [ ]\` task
- Start immediately - DO NOT STOP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**${remaining} tasks remain. Keep bouldering.**`
}

export function buildFinalWaveApprovalReminder(
  planName: string,
  progress: { total: number; completed: number },
  sessionId: string
): string {
  const remaining = progress.total - progress.completed

  return `
---

**BOULDER STATE:** Plan: \
\`${planName}\` | ${progress.completed}/${progress.total} done | ${remaining} remaining

---

${buildVerificationReminder(sessionId)}

**FINAL WAVE APPROVAL GATE**

The last Final Verification Wave result just passed.
This is the ONLY point where approval-style user interaction is required.

1. Read \
\`.omo/plans/${planName}.md\` again and confirm every remaining unchecked **top-level** task belongs to F1-F4.
   Ignore nested checkboxes under Acceptance Criteria, Evidence, or Final Checklist sections.
2. Consolidate the F1-F4 verdicts into a short summary for the user.
3. Tell the user all final reviewers approved.
4. Ask for explicit user approval before editing any remaining final-wave checkboxes or marking the plan complete.
5. Wait for the user's explicit approval. Do NOT auto-continue. Do NOT call \
\`task()\` again unless the user rejects and requests fixes.

If the user rejects or requests changes:
- delegate the required fix
- re-run the affected final-wave reviewer
- present the updated results again
- wait again for explicit user approval

**DO NOT mark the final-wave checkbox complete until the user explicitly says okay.**`
}

export function buildStandaloneVerificationReminder(sessionId: string): string {
  return `
---

${buildVerificationReminder(sessionId)}

**STEP 5: CHECK YOUR PROGRESS DIRECTLY (EVERY TIME - NO EXCEPTIONS)**

Do NOT rely on memory or cached state. Run \`todoread\` NOW to see exact current state.
Count pending vs completed tasks. This is your ground truth for what comes next.

**STEP 6: UPDATE TODO STATUS (IMMEDIATELY)**

RIGHT NOW - Do not delay. Verification passed → Mark IMMEDIATELY.

1. Run \`todoread\` to see your todo list
2. Mark the completed task as \`completed\` using \`todowrite\`

**DO THIS BEFORE ANYTHING ELSE. Unmarked = Untracked = Lost progress.**

**STEP 7: EXECUTE QA TASKS (IF ANY)**

If QA tasks exist in your todo list:
- Execute them BEFORE proceeding
- Mark each QA task complete after successful verification

**STEP 8: PROCEED TO NEXT PENDING TASK**

- Run \`todoread\` AGAIN to identify the next \`pending\` task
- Start immediately - DO NOT STOP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**NO TODO = NO TRACKING = INCOMPLETE WORK. Use todowrite aggressively.**`
}

export function buildMissingVerdictEscalation(planName: string, taskLabel: string, sessionId: string): string {
  return `
**FINAL REVIEW INCOMPLETE - BOULDER PAUSED**

A reviewer for task \`${taskLabel}\` in plan \`${planName}\` returned no clear VERDICT: APPROVE or VERDICT: REJECT.

The boulder has paused. Please either:
1. Confirm the work is acceptable and manually mark the task complete
2. Re-run the review: \`task(task_id="${sessionId}", prompt="Re-run the final review and emit VERDICT: APPROVE or VERDICT: REJECT")\`

Do NOT auto-continue until you have a clear verdict.`
}

export function buildRejectedVerdictEscalation(planName: string, taskLabel: string, sessionId: string): string {
  return `
**FINAL REVIEW REJECTED - BOULDER PAUSED**

A reviewer for task \`${taskLabel}\` in plan \`${planName}\` returned VERDICT: REJECT. Boulder paused.

The boulder has paused. Please either:
1. Delegate the required fix: \`task(task_id="${sessionId}", prompt="Fix the final review rejection and preserve the reviewer evidence")\`
2. Ask the user how to proceed if the rejection requires a product or scope decision
3. Re-run the affected final-wave reviewer after fixes

Do NOT mark any final-wave checkbox complete and do NOT auto-continue until the rejection is resolved.`
}

export function buildAdvanceDirective(planName: string): string {
  return `
**TASK ALREADY COMPLETE - ADVANCE TO NEXT**

This task is already verified and marked complete in \`.omo/plans/${planName}.md\`.
Do NOT re-verify finished work.

Read the plan file now and proceed to the next unchecked \`- [ ]\` task.
If no unchecked tasks remain, the plan is complete - run the Final Verification Wave.`
}

// ============ ZH (Chinese) variants ============

function buildReuseHintZh(sessionId: string): string {
  return `
**当前顶层计划任务的首选复用会话**

- 如果验证失败或结果需要跟进，优先复用 \`${sessionId}\`。
- 仅当复用不可用或复用会跨越任务边界时，才开启新的子代理会话。
`
}

export function buildCompletionGateZh(planName: string, sessionId: string): string {
  return `
**完成门禁 - 未完成以下操作前不要继续**

在完成以下所有操作之前，你的完成将不会被记录：

1. **编辑**计划文件 \`.omo/plans/${planName}.md\`：
   - 将已完成任务的 \`- [ ]\` 改为 \`- [x]\`
   - 使用 \`Edit\` 工具修改复选框

2. **再次读取**计划文件：
   \`\`\`
   Read(".omo/plans/${planName}.md")
   \`\`\`
   - 确认复选框数量已变化（\`- [x]\` 比之前更多）

3. 在完成上述步骤 1 和 2 之前，**不要再调用 \`task()\`**。

如果在收尾过程中出现任何失败，立即恢复同一会话：
\`\`\`typescript
task(task_id="${sessionId}", load_skills=[], prompt="fix: checkbox not recorded correctly")
\`\`\`

**在计划文件中的复选框被标记之前，你的完成不会被跟踪。**

**VERIFICATION_REMINDER**
${buildReuseHintZh(sessionId)}`
}

function buildVerificationReminderZh(sessionId: string): string {
  return `**VERIFICATION_REMINDER**

${getVerificationReminder()}

---

**如果任何验证失败，请立即使用以下命令：**
\`\`\`
task(task_id="${sessionId}", load_skills=[], prompt="fix: [describe the specific failure]")
\`\`\`

${buildReuseHintZh(sessionId)}`
}

export function buildOrchestratorReminderZh(
  planName: string,
  progress: { total: number; completed: number },
  sessionId: string,
  autoCommit: boolean = true,
  includeCompletionGate: boolean = true
): string {
  const remaining = progress.total - progress.completed

  const commitStep = autoCommit
    ? `
**第 7 步：提交原子单元**

- 只暂存已验证的更改
- 使用清晰描述所做工作的消息提交
`
    : ""

  const nextStepNumber = autoCommit ? 8 : 7

  return `
---

**抱石状态：** 计划：\`${planName}\` | 已完成 ${progress.completed}/${progress.total} | 剩余 ${remaining}

---

${includeCompletionGate ? `${buildCompletionGateZh(planName, sessionId)}

` : ""}${buildVerificationReminderZh(sessionId)}

**第 5 步：读取子代理便签（经验、问题、阻塞项）**

子代理已被指示将发现记录在便签文件中。立即读取它们：
\`\`\`
Glob(".omo/notepads/${planName}/*.md")
\`\`\`
然后 \`Read\` 找到的每个文件 - 特别是：
- **learnings.md**：发现的经验、约定、成功做法
- **issues.md**：工作中遇到的问题、阻塞项、踩过的坑
- **problems.md**：未解决的问题、被标记的技术债

**利用这些信息来：**
- 为你的下一次委派提供参考（避免已知的坑）
- 如果发现阻塞项，调整你的计划
- 将经验传递给后续的子代理

**第 6 步：直接检查抱石状态（每次都做 - 无例外）**

不要依赖缓存的进度。立即读取计划文件：
\`\`\`
Read(".omo/plans/${planName}.md")
\`\`\`
精确统计：还剩多少个 \`- [ ]\`？已完成多少个 \`- [x]\`？
这是你的真实依据。用它来决定接下来做什么。

${commitStep}
**第 ${nextStepNumber} 步：继续下一个任务**

- 再次读取计划文件，找出下一个 \`- [ ]\` 任务
- 立即开始 - 不要停止

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**还剩 ${remaining} 个任务。继续抱石。**`
}

export function buildFinalWaveApprovalReminderZh(
  planName: string,
  progress: { total: number; completed: number },
  sessionId: string
): string {
  const remaining = progress.total - progress.completed

  return `
---

**抱石状态：** 计划：\`${planName}\` | 已完成 ${progress.completed}/${progress.total} | 剩余 ${remaining}

---

${buildVerificationReminderZh(sessionId)}

**最后一波审批门禁**

最后一次最终验证波的结果刚刚通过。
这是唯一需要用户以审批方式交互的点。

1. 再次读取 \`.omo/plans/${planName}.md\`，确认所有剩余的未勾选**顶层**任务都属于 F1-F4。
   忽略验收标准、证据或最终检查清单部分下的嵌套复选框。
2. 将 F1-F4 的结论汇总成一段简短摘要呈现给用户。
3. 告诉用户所有最终评审者都已批准。
4. 在编辑任何剩余的最终波复选框或标记计划完成之前，先征求用户的明确批准。
5. 等待用户的明确批准。不要自动继续。除非用户拒绝并要求修复，否则不要再调用 \`task()\`。

如果用户拒绝或要求更改：
- 委派所需的修复
- 重新运行受影响的最终波评审者
- 再次呈现更新后的结果
- 再次等待用户的明确批准

**在用户明确同意之前，不要将最终波复选框标记为完成。**`
}

export function buildStandaloneVerificationReminderZh(sessionId: string): string {
  return `
---

${buildVerificationReminderZh(sessionId)}

**第 5 步：直接检查你的进度（每次都做 - 无例外）**

不要依赖记忆或缓存状态。立即运行 \`todoread\` 查看准确的当前状态。
统计待处理与已完成的任务。这是你决定下一步的真实依据。

**第 6 步：更新待办状态（立即执行）**

现在就做 - 不要拖延。验证通过 → 立即标记。

1. 运行 \`todoread\` 查看你的待办列表
2. 使用 \`todowrite\` 将已完成的任务标记为 \`completed\`

**在任何其他事情之前完成以上操作。未标记 = 未跟踪 = 进度丢失。**

**第 7 步：执行 QA 任务（如果有）**

如果待办列表中存在 QA 任务：
- 在继续之前先执行它们
- 每个 QA 任务验证成功后标记为完成

**第 8 步：继续下一个待处理任务**

- 再次运行 \`todoread\` 找出下一个 \`pending\` 任务
- 立即开始 - 不要停止

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**没有待办 = 没有跟踪 = 未完成的工作。积极使用 todowrite。**`
}

export function buildMissingVerdictEscalationZh(planName: string, taskLabel: string, sessionId: string): string {
  return `
**最终评审未完成 - 抱石已暂停**

计划 \`${planName}\` 中任务 \`${taskLabel}\` 的评审者没有返回明确的 VERDICT: APPROVE 或 VERDICT: REJECT。

抱石已暂停。请选择：
1. 确认工作可接受，并手动将任务标记为完成
2. 重新运行评审：\`task(task_id="${sessionId}", prompt="Re-run the final review and emit VERDICT: APPROVE or VERDICT: REJECT")\`

在获得明确结论之前，不要自动继续。`
}

export function buildRejectedVerdictEscalationZh(planName: string, taskLabel: string, sessionId: string): string {
  return `
**最终评审被拒 - 抱石已暂停**

计划 \`${planName}\` 中任务 \`${taskLabel}\` 的评审者返回 VERDICT: REJECT。抱石已暂停。

抱石已暂停。请选择：
1. 委派所需的修复：\`task(task_id="${sessionId}", prompt="Fix the final review rejection and preserve the reviewer evidence")\`
2. 如果拒绝涉及产品或范围决策，询问用户如何继续
3. 修复完成后重新运行受影响的最终波评审者

在拒绝得到解决之前，不要将任何最终波复选框标记为完成，也不要自动继续。`
}

export function buildAdvanceDirectiveZh(planName: string): string {
  return `
**任务已完成 - 继续下一个**

该任务已验证并在 \`.omo/plans/${planName}.md\` 中标记为完成。
不要重新验证已完成的工作。

立即读取计划文件，继续处理下一个未勾选的 \`- [ ]\` 任务。
如果没有剩余未勾选的任务，说明计划已完成 - 运行最终验证波。`
}
