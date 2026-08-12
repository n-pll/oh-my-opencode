import { loadSharedSkillTemplate } from "../skill-file-loader"
import type { BuiltinSkill } from "../types"

const INIT_DEEP_DESCRIPTION = "(builtin) Initialize hierarchical AGENTS.md knowledge base"

const INIT_DEEP_DESCRIPTION_ZH = "(内置) 初始化分层 AGENTS.md 知识库"

export function createInitDeepSkill(locale?: string): BuiltinSkill {
	return {
		name: "init-deep",
		description: INIT_DEEP_DESCRIPTION,
		descriptionByLocale: { zh: INIT_DEEP_DESCRIPTION_ZH },
		template: loadSharedSkillTemplate("init-deep", locale),
		argumentHint: "[--create-new] [--max-depth=N]",
	}
}

/** Backward-compatible English-default singleton. */
export const initDeepSkill: BuiltinSkill = createInitDeepSkill()
