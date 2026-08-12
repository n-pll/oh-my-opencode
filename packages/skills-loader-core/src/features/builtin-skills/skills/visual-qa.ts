import { loadSharedSkillTemplate } from "../skill-file-loader"
import type { BuiltinSkill } from "../types"

const VISUAL_QA_DESCRIPTION = "MUST USE after building/changing any UI or when asked whether a page, component, or TUI looks right. Rigorous visual QA across web/page and terminal UIs. Prefer browser:control-in-app-browser for unauthenticated browser/page QA in Codex, then Playwright/agent-browser/dev-browser. Captures screenshot/TUI evidence with bundled diff scripts, runs design-system/functional and visual-fidelity/CJK reviewer passes, then synthesizes a good/bad verdict. Triggers: visual QA, screenshot/pixel diff, UI looks wrong, reference fidelity, design system check, responsive check, CJK text clipping, TUI alignment, box-drawing drift."

const VISUAL_QA_DESCRIPTION_ZH = "在构建/更改任何 UI 后，或被问及页面、组件或 TUI 看起来是否正确时必须使用。对 Web/页面和终端 UI 进行严格的视觉 QA。在 Codex 中优先使用 browser:control-in-app-browser 进行未认证的浏览器/页面 QA，然后是 Playwright/agent-browser/dev-browser。用内置 diff 脚本捕获截图/TUI 证据，运行设计系统/功能评审和视觉保真度/CJK 评审，最后综合出好/坏判定。触发词：视觉 QA、截图/像素 diff、UI 看起来不对、参考保真度、设计系统检查、响应式检查、CJK 文本裁剪、TUI 对齐、box-drawing 偏移。"

export function createVisualQaSkill(locale?: string): BuiltinSkill {
	return {
		name: "visual-qa",
		description: VISUAL_QA_DESCRIPTION,
		descriptionByLocale: { zh: VISUAL_QA_DESCRIPTION_ZH },
		template: loadSharedSkillTemplate("visual-qa", locale),
	}
}

/** Backward-compatible English-default singleton. */
export const visualQaSkill: BuiltinSkill = createVisualQaSkill()
