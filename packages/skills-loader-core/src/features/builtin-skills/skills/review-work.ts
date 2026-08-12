import { loadSharedSkillTemplate } from "../skill-file-loader"
import type { BuiltinSkill } from "../types"

const REVIEW_WORK_DESCRIPTION = "Post-implementation review orchestrator. Launches 5 parallel background sub-agents: Oracle (goal/constraint verification), Oracle (code quality), Oracle (security), unspecified-high (hands-on QA execution), unspecified-high (context mining from GitHub/git/Slack/Notion). All must pass for review to pass. MUST USE before a PR handoff or when the user explicitly asks to review completed work. Triggers: 'review work', 'review my work', 'review changes', 'QA my work', 'verify implementation', 'check my work', 'validate changes', 'post-implementation review'."

const REVIEW_WORK_DESCRIPTION_ZH = "实现后评审编排器。启动 5 个并行后台子 agent：Oracle（目标/约束验证）、Oracle（代码质量）、Oracle（安全）、unspecified-high（实际 QA 执行）、unspecified-high（从 GitHub/git/Slack/Notion 挖掘上下文）。全部通过才算评审通过。在 PR 交付前或用户明确要求评审已完成工作时必须使用。触发词：'评审工作'、'review work'、'评审我的工作'、'review changes'、'QA 我的工作'、'验证实现'、'检查我的工作'、'验证改动'、'实现后评审'。"

export function createReviewWorkSkill(locale?: string): BuiltinSkill {
	return {
		name: "review-work",
		description: REVIEW_WORK_DESCRIPTION,
		descriptionByLocale: { zh: REVIEW_WORK_DESCRIPTION_ZH },
		template: loadSharedSkillTemplate("review-work", locale),
	}
}

/** Backward-compatible English-default singleton. */
export const reviewWorkSkill: BuiltinSkill = createReviewWorkSkill()
