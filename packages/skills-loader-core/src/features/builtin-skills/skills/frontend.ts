import { loadSharedSkillTemplate } from "../skill-file-loader"
import type { BuiltinSkill } from "../types"

const FRONTEND_DESCRIPTION = "MUST USE for frontend/web UI/UX/visual work: building, styling, redesigning pages/components, React setup, performance audits, visual QA, taste, and polish. Routes four rulesets: design taste router and brand references; perfection for Playwright/Chromium Lighthouse/Core Web Vitals; ui-ux-db palettes/fonts/guidelines; designpowers personas/accessibility/critique/handoff; plus curl-only lazyweb real-app-screen research and the beui.dev interaction catalog. Triggers: frontend, UI, UX, design, redesign, styling, layout, animation, motion, interaction, micro-interaction, make it feel alive, premium, luxury, minimal, brutalist, Awwwards, DESIGN.md, mockup, React, Lighthouse, accessibility, WCAG, Core Web Vitals, looks generic, make it pretty, like X brand, lazyweb, design research."

const FRONTEND_DESCRIPTION_ZH = "前端/Web UI/UX/视觉相关的工作都必须使用：构建、样式、重新设计页面/组件、React 搭建、性能审计、视觉 QA、品味与打磨。路由四个规则集：设计品味路由器与品牌参考；perfection 用于 Playwright/Chromium Lighthouse/Core Web Vitals；ui-ux-db 调色板/字体/指南；designpowers 人设/无障碍/评审/交付；外加 curl-only lazyweb 真实应用截图研究和 beui.dev 交互目录。触发词：前端、UI、UX、设计、重新设计、样式、布局、动画、动效、交互、微交互、让它有生命力、高端、奢华、极简、粗野主义、Awwwards、DESIGN.md、模型、React、Lighthouse、无障碍、WCAG、Core Web Vitals、看起来很普通、弄得好看点、像 X 品牌、lazyweb、设计研究。"

export function createFrontendSkill(locale?: string): BuiltinSkill {
	return {
		name: "frontend",
		description: FRONTEND_DESCRIPTION,
		descriptionByLocale: { zh: FRONTEND_DESCRIPTION_ZH },
		template: loadSharedSkillTemplate("frontend", locale),
	}
}

/** Backward-compatible English-default singleton. */
export const frontendSkill: BuiltinSkill = createFrontendSkill()
