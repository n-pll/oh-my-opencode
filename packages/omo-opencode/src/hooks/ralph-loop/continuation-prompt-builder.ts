import { SYSTEM_DIRECTIVE_PREFIX } from "../../shared/system-directive"
import { getLocale } from "../../shared/i18n"
import type { RalphLoopState } from "./types"

function getMaxIterationsLabel(state: RalphLoopState): string {
	return typeof state.max_iterations === "number" ? String(state.max_iterations) : "unbounded"
}

const CONTINUATION_PROMPT = `${SYSTEM_DIRECTIVE_PREFIX} - RALPH LOOP {{ITERATION}}/{{MAX}}]
Continue. Output <promise>{{PROMISE}}</promise> when done.
{{PROMPT}}`

const CONTINUATION_PROMPT_ZH = `${SYSTEM_DIRECTIVE_PREFIX} - RALPH LOOP {{ITERATION}}/{{MAX}}]
继续。完成时输出 <promise>{{PROMISE}}</promise>。
{{PROMPT}}`

const ULTRAWORK_VERIFICATION_PROMPT = `${SYSTEM_DIRECTIVE_PREFIX} - ULTRAWORK LOOP VERIFICATION {{ITERATION}}/{{MAX}}]

You already emitted <promise>{{INITIAL_PROMISE}}</promise>. This does NOT finish the loop yet.

REQUIRED NOW:
- Call Oracle using task(subagent_type="oracle", load_skills=[], run_in_background=false, ...)
- Ask Oracle to verify whether the original task is actually complete
- Include the original task in the Oracle request
- Explicitly tell Oracle to review skeptically and critically, and to look for reasons the task may still be incomplete or wrong
- The system will inspect the Oracle session directly for the verification result
- If Oracle does not verify, continue fixing the task and do not consider it complete

Original task:
{{PROMPT}}`

const ULTRAWORK_VERIFICATION_PROMPT_ZH = `${SYSTEM_DIRECTIVE_PREFIX} - ULTRAWORK LOOP VERIFICATION {{ITERATION}}/{{MAX}}]

你已经输出了 <promise>{{INITIAL_PROMISE}}</promise>。这还没有结束循环。

现在必须：
- 使用 task(subagent_type="oracle", load_skills=[], run_in_background=false, ...) 调用 Oracle
- 让 Oracle 验证原始任务是否真正完成
- 在 Oracle 请求中包含原始任务
- 明确告诉 Oracle 以怀疑和批判的态度评审，寻找任务可能仍未完成或出错的原因
- 系统将直接检查 Oracle 会话中的验证结果
- 如果 Oracle 未验证通过，继续修复任务，不要认为它已完成

原始任务：
{{PROMPT}}`

const ULTRAWORK_VERIFICATION_FAILED_PROMPT = `${SYSTEM_DIRECTIVE_PREFIX} - ULTRAWORK LOOP VERIFICATION FAILED {{ITERATION}}/{{MAX}}]

Oracle did not emit <promise>VERIFIED</promise>. Verification failed.

REQUIRED NOW:
- Verification failed. Fix the task until Oracle's review is satisfied
- Oracle does not lie. Treat the verification result as ground truth
- Do not claim completion early or argue with the failed verification
- After fixing the remaining issues, request Oracle review again using task(subagent_type="oracle", load_skills=[], run_in_background=false, ...)
- Include the original task in the Oracle request and tell Oracle to review skeptically and critically
- Only when the work is ready for review again, output: <promise>{{PROMISE}}</promise>

Original task:
{{PROMPT}}`

const ULTRAWORK_VERIFICATION_FAILED_PROMPT_ZH = `${SYSTEM_DIRECTIVE_PREFIX} - ULTRAWORK LOOP VERIFICATION FAILED {{ITERATION}}/{{MAX}}]

Oracle 未输出 <promise>VERIFIED</promise>。验证失败。

现在必须：
- 验证失败。修复任务直到 Oracle 的评审满意
- Oracle 不会撒谎。将验证结果视为事实依据
- 不要过早声称完成，也不要与失败的验证争辩
- 修复剩余问题后，再次使用 task(subagent_type="oracle", load_skills=[], run_in_background=false, ...) 请求 Oracle 评审
- 在 Oracle 请求中包含原始任务，并告诉 Oracle 以怀疑和批判的态度评审
- 只有当工作准备好再次评审时，才输出：<promise>{{PROMISE}}</promise>

原始任务：
{{PROMPT}}`

export function buildContinuationPrompt(state: RalphLoopState): string {
	const zh = getLocale() === "zh"
	const template = state.verification_pending
		? (zh ? ULTRAWORK_VERIFICATION_PROMPT_ZH : ULTRAWORK_VERIFICATION_PROMPT)
		: (zh ? CONTINUATION_PROMPT_ZH : CONTINUATION_PROMPT)
	const continuationPrompt = template.replace(
		"{{ITERATION}}",
		String(state.iteration),
	)
		.replace("{{MAX}}", getMaxIterationsLabel(state))
		.replace("{{INITIAL_PROMISE}}", state.initial_completion_promise ?? state.completion_promise)
		.replace("{{PROMISE}}", state.completion_promise)
		.replace("{{PROMPT}}", state.prompt)

	return state.ultrawork ? `ultrawork ${continuationPrompt}` : continuationPrompt
}

export function buildVerificationFailurePrompt(state: RalphLoopState): string {
	const template = getLocale() === "zh"
		? ULTRAWORK_VERIFICATION_FAILED_PROMPT_ZH
		: ULTRAWORK_VERIFICATION_FAILED_PROMPT
	const continuationPrompt = template.replace(
		"{{ITERATION}}",
		String(state.iteration),
	)
		.replace("{{MAX}}", getMaxIterationsLabel(state))
		.replace("{{PROMISE}}", state.completion_promise)
		.replace("{{PROMPT}}", state.prompt)

	return state.ultrawork ? `ultrawork ${continuationPrompt}` : continuationPrompt
}
