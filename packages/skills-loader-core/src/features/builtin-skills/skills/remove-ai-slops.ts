import { loadSharedSkillTemplate } from "../skill-file-loader"
import type { BuiltinSkill } from "../types"

const REMOVE_AI_SLOPS_DESCRIPTION = 'Remove AI-generated code smells (slop) from branch changes or an explicit file list. Locks behavior with regression tests FIRST, then runs categorized cleanup via parallel `deep` agents in batches of 5, then verifies with quality gates. Covers 10 slop categories including performance equivalences, excessive complexity (object annotations, if/elif variant chains), and oversized modules (250+ pure LOC with mandatory modular refactoring). MUST USE when the user asks to "remove slop", "clean AI code", "deslop", "clean up AI-generated code", "remove AI slop", or wants to clean up AI-generated patterns from recent changes. Triggers - "remove ai slops", "clean ai code", "deslop", "cleanup AI generated", "remove AI slop", "clean up AI-generated code", "strip slop", "ai-slop cleanup".'

const REMOVE_AI_SLOPS_DESCRIPTION_ZH = '从分支改动或显式文件列表中移除 AI 生成的代码坏味道（slop）。先用回归测试锁定行为，然后通过并行 `deep` agent 分批（每批 5 个）执行分类清理，最后用质量门禁验证。覆盖 10 类 slop，包括性能等价物、过度复杂（对象注解、if/elif 变体链）和超大模块（250+ 纯代码行，强制模块化重构）。当用户要求"移除 slop"、"清理 AI 代码"、"deslop"、"清理 AI 生成的代码"、"移除 AI slop"或想清理近期改动中的 AI 生成模式时必须使用。触发词 - "remove ai slops"、"clean ai code"、"deslop"、"cleanup AI generated"、"remove AI slop"、"clean up AI-generated code"、"strip slop"、"ai-slop cleanup"。'

export function createRemoveAiSlopsSkill(locale?: string): BuiltinSkill {
	return {
		name: "remove-ai-slops",
		description: REMOVE_AI_SLOPS_DESCRIPTION,
		descriptionByLocale: { zh: REMOVE_AI_SLOPS_DESCRIPTION_ZH },
		template: loadSharedSkillTemplate("remove-ai-slops", locale),
	}
}

/** Backward-compatible English-default singleton. */
export const removeAiSlopsSkill: BuiltinSkill = createRemoveAiSlopsSkill()
