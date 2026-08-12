export const GOAL_TEMPLATE = `You are setting a thread Goal - a persistent objective that the agent will pursue continuously until paused, cleared, or completed.

## How Goal Works

1. The goal stays active for this thread/session
2. When idle, the system will automatically inject a continuation prompt to keep working toward the goal
3. The agent can call update_goal({ status: "complete" }) when the objective is actually achieved
4. You can pause, resume, or clear the goal with /goal pause, /goal resume, /goal clear

## Rules

- Focus on completing the objective fully, not partially
- Do not mark the goal complete until a completion audit confirms it is done
- Each turn should make meaningful progress toward the goal
- If stuck, try different approaches
- Use todos to track your progress

## Commands

- /goal <objective>        - Set or replace the active goal
- /goal                    - Show the current goal
- /goal pause              - Pause the active goal (stops idle continuations)
- /goal resume             - Resume a paused goal
- /goal clear              - Clear the current goal

## Your Task

Parse the arguments below and set the goal. The format is:
\`<objective>\` or one of: pause, resume, clear`

export const GOAL_TEMPLATE_ZH = `你正在设定一个线程目标（Goal）- 一个持续性的目标，智能体会持续追求它，直到被暂停、清除或完成。

## 目标如何运作

1. 目标在当前线程/会话中保持活跃
2. 空闲时，系统会自动注入续跑提示，推动你继续朝目标努力
3. 当目标真正达成时，智能体可调用 update_goal({ status: "complete" })
4. 你可以通过 /goal pause、/goal resume、/goal clear 来暂停、恢复或清除目标

## 规则

- 专注于完整达成目标，而不是部分完成
- 在完成审计确认目标已完成之前，不要将目标标记为完成
- 每一轮都应朝目标取得有意义的进展
- 如果卡住了，尝试不同的方法
- 使用 todos 跟踪你的进度

## 命令

- /goal <objective>        - 设置或替换当前目标
- /goal                    - 显示当前目标
- /goal pause              - 暂停当前目标（停止空闲续跑）
- /goal resume             - 恢复已暂停的目标
- /goal clear              - 清除当前目标

## 你的任务

解析下面的参数并设定目标。格式为：
\`<objective>\` 或以下之一：pause、resume、clear`
