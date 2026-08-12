export const TEAM_MODE_TEMPLATE_ZH = `# Team Mode

Team mode 让 OpenCode 拥有与 Claude Code Agent Teams 对等的能力。它默认关闭。仅在你需要并行多 agent 协调时启用，其中每个团队成员是一个 opencode 子会话。

## 何时使用

- 将大任务拆分给多个 agent。
- 让 lead agent 保持专注，同时成员 agent 并行工作。
- 使用 worktree 模式进行隔离的代码变更，或在需要实时会话布局时使用 tmux 可视化。

## 声明团队

在 \`~/.omo/teams/{name}/config.json\` 创建团队。

你也可以直接将相同对象传给 \`team_create({ inline_spec: ... })\`。

此 TeamSpec 使用 lead 加成员列表。每个规范成员都有一个 \`kind\` 区分器。

示例：

\`\`\`json
{
  "name": "release-squad",
  "lead": {
    "kind": "subagent_type",
    "subagent_type": "sisyphus"
  },
  "members": [
    {
      "kind": "category",
      "category": "quick",
      "prompt": "review small changes and report risks"
    },
    {
      "kind": "subagent_type",
      "subagent_type": "atlas"
    }
  ]
}
\`\`\`

category 成员支持内联简写。如果省略 \`kind\`，\`category\` 暗示 \`kind: "category"\`。如果成员使用自然规划字段如 \`role\`、\`description\`、\`capabilities\` 或未知的 \`kind\`，它会成为使用当前配置第一个启用 category 的 category 工作者。如果 \`kind\` 是一个未知字符串（如 category 名称），该字符串被用作 category。\`systemPrompt\` 被接受为 \`prompt\` 的别名，\`loadSkills\` 被忽略，因为团队成员通过 \`prompt\` 获取其行为。

示例：

\`\`\`json
{
  "name": "project-analysis-team",
  "members": [
    {
      "name": "structure-analyst",
      "category": "quick",
      "systemPrompt": "Analyze directory layouts, module boundaries, and architectural organization."
    },
    {
      "name": "quality-analyst",
      "category": "quick",
      "systemPrompt": "Analyze tests, CI/CD, build scripts, conventions, and anti-patterns."
    },
    {
      "name": "Agent 3: Quality/Process Analyst",
      "role": "Quality/Process Analyst",
      "capabilities": ["tests", "builds", "CI/CD"]
    }
  ]
}
\`\`\`

## 成员 schema

当你想要 category 支持的工作者时使用 \`kind: "category"\`。它必须同时包含 \`category\` 和 \`prompt\`。D-40：category 成员始终通过 \`sisyphus-junior\` 路由。

\`kind: "subagent_type"\` 仅用于合格的 agent。

### 合格的 subagent 类型

- \`sisyphus\`
- \`atlas\`
- \`sisyphus-junior\`
- \`hephaestus\`

### 硬性拒绝

不要在此使用 \`oracle\`、\`prometheus\` 或其他不合格的 agent。对于这些，请改用 \`delegate-task\`。

## 生命周期

团队是**临时的**。没有就地重塑 — 重构是先删除再创建。闲置的团队每分钟都在消耗会话、邮箱配额和成员轮次预算。

一个周期：

1. Lead 生成团队：对声明的团队用 \`team_create({ teamName })\`，对一次性团队用 \`team_create({ inline_spec })\`。永远不要用空参数调用 \`team_create\`。
2. Lead 用 \`team_send_message\` 或 \`team_task_create\` 分配工作。
3. 成员用 \`team_send_message\` 加 \`team_task_update\` 报告进度。
4. Lead 和成员用 \`team_task_list\`、\`team_task_get\` 和 \`team_status\` 跟踪进度。
5. 当下面的**关闭契约**成立时，lead 在同一轮次中运行**关闭序列**。对下一阶段循环到步骤 1。

### 关闭契约

当以下全部成立时，团队**可关闭**（由 \`team_task_list({ teamRunId })\` 和 \`team_status({ teamRunId })\` 观察到）：

- 每个任务都处于终态：\`completed\` 或 \`failed\`。（无 \`pending\`、无 \`claimed\`、无 \`in_progress\`。）
- 没有未决的 \`team_shutdown_request\` 仍在等待批准。
- 用户没有要求你保持团队开启以便跟进。

关闭是 **lead 的责任**，而非用户的。不要等被告知。检查在每次完成或失败任务的 \`team_task_update\` 后运行 — 如果契约成立，在同一轮次中关闭。现在关闭比下一条用户消息后关闭成本更低，因为到那时模型已经把上下文换页出去了。

### 关闭序列

按顺序运行：

1. 对 \`team_status\` 返回的每个活跃成员 \`M\`：
   - \`team_shutdown_request({ teamRunId, memberName: M })\`
   - \`team_approve_shutdown({ teamRunId, memberName: M })\`
2. \`team_delete({ teamRunId })\`

如果步骤 2 因成员仍活跃而报错，重新运行 \`team_status\`。仅在确认剩余成员没有正在写入后使用 \`team_delete({ teamRunId, force: true })\` — 例如，在无法优雅关闭的不可恢复错误路径后。不要用 \`force: true\` 跳过步骤 1。

## 任务归属

任何 agent 都可以通过 \`team_task_update\` 的 \`owner\` 字段设置或更改任务归属。成员通常通过设置 \`owner: "<their-name>"\` 和 \`status: "claimed"\`（或直接 \`"in_progress"\`）来认领工作。Lead 也可以通过创建带 \`owner\` 的任务来预分配工作。

## 自动消息投递

通过 \`team_send_message\` 发送的消息会自动作为新的对话轮次投递给接收者 — 无需手动轮询收件箱。如果接收者正在轮次中，消息会排队并在其轮次结束时注入，包裹在 \`<peer_message ...>\` 信封中。UI 会显示带有发送者名称的简短通知。报告队友消息时，不要引用原文 — 它已经被渲染过了。

## 队友空闲状态

队友在每次轮次后都会变空闲 — 这是正常的、预期的。队友在发送消息后立即空闲并不意味着他们完成了或不可用。空闲只是意味着他们在等待输入。

- 空闲队友仍可接收消息；发送一条会唤醒他们。
- 系统自动发出空闲通知。Lead 不需要对每个空闲事件做出反应 — 仅在分配新工作或跟进时。
- 不要把空闲当作错误。发送了消息并变空闲的队友已经完成了工作，正在等待回复。
- 同事私信在 lead 的空闲通知中包含简短摘要，让 lead 无需完整消息文本即可了解同事协作情况。

## 发现团队成员

成员和 lead 使用 \`team_status({ teamRunId })\` 查看谁活跃、他们的会话 ID、消息积压和 tmux 窗格分配。声明的团队配置也位于 \`~/.omo/teams/{name}/config.json\`。始终用名称（如 \`"lead"\`、\`"researcher"\`）称呼队友 — 永远不要用原始会话 ID。

## 任务列表协调

成员应该：

1. 定期检查 \`team_task_list\`，**特别是在完成每个任务后**，以找到新解锁的工作。
2. 通过 \`team_task_update\` 认领未分配、未阻塞的任务（设置 \`owner\` 和 \`status: "claimed"\` 或 \`"in_progress"\`）。优先按 ID 顺序（最低优先）— 较早的任务通常为较晚的任务建立上下文。
3. 当识别到额外工作时通过 \`team_task_create\` 创建新任务。
4. 通过带 \`status: "completed"\` 的 \`team_task_update\` 标记任务完成，然后重新检查任务列表。
5. 如果所有可用任务都被阻塞，向 lead 发送 \`team_send_message\` 以解决阻塞或分配不同工作。

## 通信规则

- 不要发送结构化 JSON 状态消息，如 \`{"type":"idle",...}\` 或 \`{"type":"task_completed",...}\`。用纯自然语言交流。
- 不要使用终端工具（Bash、文件读取器）检查另一个队友的会话、收件箱或窗格 — 始终通过 \`team_send_message\` 和 \`team_status\`。
- 成员不得调用 \`delegate-task\` — 其预算在团队成员内为零。改用 \`team_send_message\` 与同事协调。

## 仅 Lead 可用的工具

- \`team_create\` - 从声明创建团队。
- \`team_delete\` - 移除团队。
- \`team_shutdown_request\` - 启动关闭流程。

## Lead 或目标成员的关闭工具

- \`team_approve_shutdown\` - 批准目标成员的关闭。
- \`team_reject_shutdown\` - 拒绝目标成员的关闭。

## 通用团队运行工具

- \`team_send_message\` - 发送私信；广播仍仅限 lead。
- \`team_task_create\` - 为成员创建任务。
- \`team_task_list\` - 列出团队任务。
- \`team_task_update\` - 更新任务状态。
- \`team_task_get\` - 检查一个任务。
- \`team_status\` - 显示实时团队状态。

## 全局查询工具

- \`team_list\` - 列出已知团队。

## 限制

- 最多 8 个成员。
- 最多 4 个并行工作者。
- 每条消息最多 32KB。
- 未读收件箱最多 256KB。

## 失败模式

- 广播仅限 lead。
- 无嵌套团队。
- 无同事同步等待；工作异步推进。

## 备注

Team mode 是仅文档技能。team_* 工具在 \`team_mode.enabled=true\` 时全局注册。
使用 \`~/.omo/teams/{name}/config.json\` 加 worktree 或 tmux 可视化来了解团队布局。
`
