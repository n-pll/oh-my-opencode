/// <reference path="../../../../../bun-test.d.ts" />

import { describe, expect, test } from "bun:test"
import { resolveSkillContent } from "./skill-template-resolver"

describe("resolveSkillContent locale", () => {
	test("#given locale zh #when resolving git-master #then the zh template override is returned", () => {
		// given - git-master has inline zh template overrides
		const locale = "zh"

		// when
		const enContent = resolveSkillContent("git-master", {})
		const zhContent = resolveSkillContent("git-master", { locale })

		// then - both resolve (not null) and differ when locale is set
		expect(enContent).not.toBeNull()
		expect(zhContent).not.toBeNull()
		expect(zhContent).not.toBe(enContent)
	})

	test("#given locale zh #when resolving debugging #then the zh template is returned when present on disk", () => {
		// given - debugging loads from SKILL.md; zh falls back to SKILL.md if no SKILL.zh.md
		const locale = "zh"

		// when
		const content = resolveSkillContent("debugging", { locale })

		// then - resolves without error (graceful fallback to en if no zh file)
		expect(content).not.toBeNull()
		expect(content!.length).toBeGreaterThan(0)
	})

	test("#given no locale #when resolving a builtin skill #then returns the English template", () => {
		// given - default options
		// when
		const content = resolveSkillContent("review-work", {})

		// then
		expect(content).not.toBeNull()
		expect(content!.length).toBeGreaterThan(0)
	})

	test("#given locale fr with no translation #when resolving #then falls back to English", () => {
		// given - a locale with no translations at all
		const locale = "fr"

		// when
		const content = resolveSkillContent("git-master", { locale })

		// then - English fallback works
		expect(content).not.toBeNull()
	})
})
