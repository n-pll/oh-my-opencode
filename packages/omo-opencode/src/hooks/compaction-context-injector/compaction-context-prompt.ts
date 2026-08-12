import {
  createSystemDirective,
  SystemDirectiveTypes,
} from "../../shared/system-directive"
import { getLocale } from "../../shared/i18n"

export const COMPACTION_CONTEXT_PROMPT = `${createSystemDirective(SystemDirectiveTypes.COMPACTION_CONTEXT)}

When summarizing this session, keep the result compact and continuation-focused. Prefer terse bullets over replaying the transcript.

## 1. User Requests
- Summarize the latest unresolved user requests and any earlier request still affecting the work
- Quote exact wording only when a later agent needs the literal phrase

## 2. Final Goal
- What the user ultimately wanted to achieve
- The end result or deliverable expected

## 3. Work Completed
- What has been done so far
- Files created/modified
- Validation already run and its result

## 4. Remaining Tasks
- What still needs to be done
- Pending items from the original request
- Known blockers or risks

## 5. Active Working Context (For Seamless Continuation)
- **Files**: Paths of files currently being edited or frequently referenced
- **Code in Progress**: Function names, data structures, or decisions under active development
- **External References**: Only URLs or docs that are still needed
- **State & Variables**: Important variable names, configuration values, or runtime state relevant to ongoing work

## 6. Explicit Constraints (Verbatim Only)
- Include ONLY active constraints explicitly stated by the user or existing AGENTS.md context
- Quote constraints verbatim when quoting a constraint
- Do NOT invent, add, or modify constraints
- Do not paste full AGENTS.md, system/developer messages, or long policy blocks; cite the source path/name and quote only decisive clauses
- If no explicit constraints exist, write "None"

## 7. Agent Verification State (Critical for Reviewers)
- **Current Agent**: What agent is running (momus, oracle, etc.)
- **Verification Progress**: Files already verified/validated
- **Pending Verifications**: Files still needing verification
- **Previous Rejections**: If reviewer agent, what was rejected and why
- **Acceptance Status**: Current state of review process

This section is CRITICAL for reviewer agents (momus, oracle) to maintain continuity.

## 8. Delegated Agent Sessions
- List active/recent background agent tasks that still matter
- For each: agent name, category, status, short description, and **task_id**
- **RESUME, DON'T RESTART.** Each listed delegated task retains full context. After compaction, use \`task_id\` to continue existing delegated work instead of spawning new tasks. This saves tokens, preserves learned context, and prevents duplicate work.

This context is critical for maintaining continuity after compaction.
`

export const COMPACTION_CONTEXT_PROMPT_ZH = `${createSystemDirective(SystemDirectiveTypes.COMPACTION_CONTEXT)}

总结本会话时，保持结果紧凑且面向续接。优先使用简短的要点，而不是重放对话记录。

## 1. 用户请求
- 总结最新的未解决用户请求，以及任何仍影响工作的早期请求
- 仅当后续 agent 需要字面短语时才逐字引用

## 2. 最终目标
- 用户最终想达成的目标
- 期望的最终结果或交付物

## 3. 已完成工作
- 到目前为止已完成的内容
- 创建/修改的文件
- 已运行的验证及其结果

## 4. 剩余任务
- 还需要做什么
- 原始请求中的待办项
- 已知阻塞项或风险

## 5. 活动工作上下文（用于无缝续接）
- **文件**：当前正在编辑或频繁引用的文件路径
- **进行中的代码**：正在积极开发的函数名、数据结构或决策
- **外部引用**：仅仍需要的 URL 或文档
- **状态与变量**：与进行中工作相关的重要变量名、配置值或运行时状态

## 6. 显式约束（仅逐字）
- 仅包含用户或现有 AGENTS.md 上下文明确陈述的活动约束
- 引用约束时逐字引用
- 不要发明、添加或修改约束
- 不要粘贴完整的 AGENTS.md、系统/开发者消息或长策略块；引用来源路径/名称并仅引用关键条款
- 如果没有显式约束，写 "None"

## 7. Agent 验证状态（对评审者至关重要）
- **当前 Agent**：正在运行哪个 agent（momus、oracle 等）
- **验证进度**：已验证/已确认的文件
- **待验证项**：仍需要验证的文件
- **先前的拒绝**：如果是评审 agent，什么被拒绝了以及原因
- **接受状态**：评审过程的当前状态

本节对评审 agent（momus、oracle）维持连续性至关重要。

## 8. 委托的 Agent 会话
- 列出仍然重要的活动/近期后台 agent 任务
- 对每个任务：agent 名称、category、状态、简短描述和 **task_id**
- **续接，不要重启。** 列出的每个委托任务都保留完整上下文。压缩后使用 \`task_id\` 继续现有的委托工作，而不是生成新任务。这能节省 token、保留已学习的上下文，并防止重复工作。

此上下文对压缩后维持连续性至关重要。
`

export function getCompactionContextPrompt(): string {
	return getLocale() === "zh" ? COMPACTION_CONTEXT_PROMPT_ZH : COMPACTION_CONTEXT_PROMPT
}
