import { loadSharedSkillTemplate } from "../skill-file-loader"
import type { BuiltinSkill } from "../types"

const DEBUGGING_DESCRIPTION = "MUST USE for any real runtime debugging across ANY language or binary — crashes, silent failures, wrong responses, stuck processes, memory leaks, async misbehavior, unexplained timing, reverse engineering. Runs a hypothesis-driven loop: form ≥3 hypotheses, investigate in parallel, after 2 failed rounds spawn Oracles from orthogonal angles, confirm root cause, lock with a failing test, fix minimally, QA by actually USING the system, scrub artifacts. The actual HOW lives in `references/` — READ THEM. Triggers: 'debug this', 'why is X not working', 'hanging', 'attach a debugger', 'reverse engineer', 'pwndbg', 'gdb', 'lldb', 'node inspect', 'tsx debug', 'pdb', 'dlv', 'delve', 'rust-gdb', 'set a breakpoint', 'context window exploded', 'why is the response empty', 'why is this happening', 'trace this bug', 'reproduce and fix', 'silent failure', 'HTTP 200 but empty', 'why did it stop', 'inspect the binary', 'playwright', 'flaky test', 'fails intermittently', 'passes in isolation', 'only fails in CI'."

const DEBUGGING_DESCRIPTION_ZH = "任何语言或二进制的真实运行时调试都必须使用：崩溃、静默失败、错误响应、进程卡死、内存泄漏、异步行为异常、无法解释的时序问题、逆向工程。执行假设驱动循环：形成 ≥3 个假设、并行调查、2 轮失败后从正交角度召唤 Oracle、确认根因、用失败测试锁定、最小化修复、通过实际使用系统来 QA、清理痕迹。具体的 HOW 在 `references/` 中——务必阅读。触发词：'调试这个'、'为什么 X 不工作'、'卡住'、'附加调试器'、'逆向工程'、'pwndbg'、'gdb'、'lldb'、'node inspect'、'tsx debug'、'pdb'、'dlv'、'delve'、'rust-gdb'、'设置断点'、'上下文爆炸'、'为什么响应为空'、'为什么会这样'、'追踪这个 bug'、'复现并修复'、'静默失败'、'HTTP 200 但为空'、'为什么它停了'、'检查二进制'、'playwright'、'flaky test'、'间歇性失败'、'单独运行通过'、'仅 CI 失败'。"

export function createDebuggingSkill(locale?: string): BuiltinSkill {
	return {
		name: "debugging",
		description: DEBUGGING_DESCRIPTION,
		descriptionByLocale: { zh: DEBUGGING_DESCRIPTION_ZH },
		template: loadSharedSkillTemplate("debugging", locale),
	}
}

/** Backward-compatible English-default singleton. */
export const debuggingSkill: BuiltinSkill = createDebuggingSkill()
