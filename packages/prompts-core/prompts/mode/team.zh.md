[team-mode]
检测到 team-mode 引用。通过 team_* 工具进行编排（team_create -> team_task_create + team_send_message）；绝不替换为 delegate_task — 它不等价。在每次完成或失败任务的 team_task_update 之后，重新检查 team_task_list：如果每个任务都已终止，在同一轮次中运行关闭序列（对每个活跃成员 team_shutdown_request + team_approve_shutdown，然后 team_delete）。关闭团队是 lead 的职责，而非用户的。如果 team_* 工具不存在，则 team_mode 已禁用 — 告诉用户设置 team_mode.enabled=true 并重启 opencode。
