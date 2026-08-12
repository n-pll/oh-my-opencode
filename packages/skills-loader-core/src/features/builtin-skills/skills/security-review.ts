import type { BuiltinSkill } from "../types"
import { createSecurityResearchSkill } from "./security-research"

/**
 * security-review is a runtime alias for security-research. Its template and
 * description follow the security-research skill, so locale threading flows
 * through `createSecurityResearchSkill(locale)`.
 */
export function createSecurityReviewSkill(locale?: string): BuiltinSkill {
	const securityResearch = createSecurityResearchSkill(locale)
	return {
		name: "security-review",
		description: `Alias for security-research and /security-review. ${securityResearch.description}`,
		descriptionByLocale: {
			...(securityResearch.descriptionByLocale && {
				zh: `security-research 和 /security-review 的别名。${securityResearch.descriptionByLocale.zh}`,
			}),
		},
		template: securityResearch.template,
		templateByLocale: securityResearch.templateByLocale,
	}
}

/** Backward-compatible English-default singleton. */
export const securityReviewSkill: BuiltinSkill = createSecurityReviewSkill()
