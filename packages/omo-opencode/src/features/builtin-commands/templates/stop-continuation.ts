export const STOP_CONTINUATION_TEMPLATE = `Stop all continuation mechanisms for the current session.

This command will:
1. Stop the todo-continuation-enforcer from automatically continuing incomplete tasks
2. Cancel any active Ralph Loop
3. Clear the active Goal for this session
4. Clear the boulder state for the current project

After running this command:
- The session will not auto-continue when idle
- You can manually continue work when ready
- The stop state is per-session and clears when the session ends

Use this when you need to pause automated continuation and take manual control.`

export const STOP_CONTINUATION_TEMPLATE_ZH = `停止当前会话的所有续跑机制。

此命令将：
1. 停止 todo-continuation-enforcer 自动续跑未完成的任务
2. 取消任何进行中的 Ralph Loop
3. 清除当前会话的活动 Goal
4. 清除当前项目的 boulder 状态

运行此命令后：
- 会话在空闲时不会自动续跑
- 你可以随时手动继续工作
- 停止状态按会话生效，会话结束时自动清除

当你需要暂停自动化续跑、转为手动控制时，请使用此命令。`
