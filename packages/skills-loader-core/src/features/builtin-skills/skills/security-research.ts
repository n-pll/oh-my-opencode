import type { BuiltinSkill } from "../types"
import securityResearchTemplate from "../security-research/SKILL.md" with { type: "text" }
import securityResearchTemplateZh from "../security-research/SKILL.zh.md" with { type: "text" }

const SECURITY_RESEARCH_DESCRIPTION = "Team Mode security research skill. Orchestrates 3 vulnerability hunters and 2 PoC engineers to audit a codebase in parallel, prove exploitability, classify root causes, and calibrate severity by actual exploitability. Use for security review, vulnerability research, exploitability audit, pre-release security check, threat model validation, and `/security-research`. Triggers: 'security-research', 'security research', 'security review', 'vulnerability audit', 'exploitability audit', '보안 리뷰', '취약점 감사'."

const SECURITY_RESEARCH_DESCRIPTION_ZH = "Team Mode 安全研究技能。编排 3 个漏洞猎手和 2 个 PoC 工程师并行审计代码库，证明可利用性，分类根因，并按实际可利用性校准严重程度。用于安全评审、漏洞研究、可利用性审计、发布前安全检查、威胁模型验证和 `/security-research`。触发词：'security-research'、'安全研究'、'security review'、'安全评审'、'vulnerability audit'、'漏洞审计'、'exploitability audit'、'可利用性审计'、'보안 리뷰'、'취약점 감사'。"

export function createSecurityResearchSkill(locale?: string): BuiltinSkill {
	return {
		name: "security-research",
		description: SECURITY_RESEARCH_DESCRIPTION,
		descriptionByLocale: { zh: SECURITY_RESEARCH_DESCRIPTION_ZH },
		template: securityResearchTemplate,
		templateByLocale: { zh: securityResearchTemplateZh },
	}
}

/** Backward-compatible English-default singleton. */
export const securityResearchSkill: BuiltinSkill = createSecurityResearchSkill()
