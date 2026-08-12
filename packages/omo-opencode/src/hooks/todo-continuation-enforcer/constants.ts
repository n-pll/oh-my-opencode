import { createSystemDirective, SystemDirectiveTypes } from "../../shared/system-directive"
import { getLocale } from "../../shared/i18n"

export const HOOK_NAME = "todo-continuation-enforcer"

export const DEFAULT_SKIP_AGENTS = ["prometheus", "compaction", "plan"]

export const CONTINUATION_PROMPT = `${createSystemDirective(SystemDirectiveTypes.TODO_CONTINUATION)}

Incomplete tasks remain in your todo list. Continue working on the next pending task.

- Proceed without asking for permission
- Mark each task complete when finished
- Do not stop until all tasks are done
- If you believe all work is already complete, the system is questioning your completion claim. Critically re-examine each todo item from a skeptical perspective, verify the work was actually done correctly, and update the todo list accordingly.`

export const CONTINUATION_PROMPT_ZH = `${createSystemDirective(SystemDirectiveTypes.TODO_CONTINUATION)}

你的待办列表中还有未完成的任务。继续处理下一个待办任务。

- 直接继续，无需征求许可
- 每完成一个任务就标记为完成
- 在所有任务完成前不要停止
- 如果你认为所有工作都已完成，系统正在质疑你的完成声明。以怀疑的视角重新审视每个待办项，验证工作确实正确完成，并相应更新待办列表。`

export function getContinuationPrompt(): string {
	return getLocale() === "zh" ? CONTINUATION_PROMPT_ZH : CONTINUATION_PROMPT
}

export const COUNTDOWN_SECONDS = 2
export const TOAST_DURATION_MS = 900
export const COUNTDOWN_GRACE_PERIOD_MS = 500

export const ABORT_WINDOW_MS = 3000
export const COMPACTION_GUARD_MS = 60_000
export const CONTINUATION_COOLDOWN_MS = 5_000
export const MAX_STAGNATION_COUNT = 3
export const MAX_CONSECUTIVE_FAILURES = 5
export const FAILURE_RESET_WINDOW_MS = 5 * 60 * 1000
