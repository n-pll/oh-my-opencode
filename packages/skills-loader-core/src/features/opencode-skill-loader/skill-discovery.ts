import { createBuiltinSkills } from "../builtin-skills/skills"
import { builtinToLoadedSkill } from "./merger/builtin-skill-converter"
import { discoverSkills } from "./loader"
import type { LoadedSkill } from "./types"
import type { SkillResolutionOptions } from "./skill-resolution-options"

const cachedSkillsByProvider = new Map<string, LoadedSkill[]>()

function isDisabledAlias(name: string, disabledSkills: ReadonlySet<string>): boolean {
	const normalizedName = name.toLowerCase()
	if (disabledSkills.has(normalizedName)) return true

	for (const disabledSkill of disabledSkills) {
		if (disabledSkill.toLowerCase() === normalizedName) return true
	}

	return false
}

export function isDisabledSkillAlias(skill: LoadedSkill, disabledSkills: ReadonlySet<string>): boolean {
	return isDisabledAlias(skill.name, disabledSkills)
}

export function clearSkillCache(): void {
	cachedSkillsByProvider.clear()
}

export async function getAllSkills(options?: SkillResolutionOptions): Promise<LoadedSkill[]> {
	const browserProvider = options?.browserProvider ?? "playwright"
	const teamModeEnabled = options?.teamModeEnabled ?? false
	const directory = options?.directory ?? ""
	const locale = options?.locale
	const cacheKey = `${directory}:${browserProvider}:${teamModeEnabled ? "team-on" : "team-off"}:${locale ?? "en"}`
	const hasDisabledSkills = options?.disabledSkills && options.disabledSkills.size > 0

	// Skip cache if disabledSkills is provided (varies between calls)
	if (!hasDisabledSkills) {
		const cached = cachedSkillsByProvider.get(cacheKey)
		if (cached) return cached
	}

	const [discoveredSkills, builtinSkillDefinitions] = await Promise.all([
		discoverSkills({ includeClaudeCodePaths: true, directory: options?.directory }),
		createBuiltinSkills({
			browserProvider,
			disabledSkills: options?.disabledSkills,
			teamModeEnabled,
			locale,
		}),
	])

	const builtinSkillsAsLoaded: LoadedSkill[] = builtinSkillDefinitions.map((skill) =>
		builtinToLoadedSkill(skill, locale),
	)

	// Provider-gated skill names that should be filtered based on browserProvider
	const providerGatedSkillNames = new Set(["agent-browser", "playwright"])

	// Filter discovered skills to exclude provider-gated names that don't match the selected provider
	const filteredDiscoveredSkills = discoveredSkills.filter((skill) => {
		if (!providerGatedSkillNames.has(skill.name)) {
			return true
		}
		// For provider-gated skills, only include if it matches the selected provider
		return skill.name === browserProvider
	})

	const discoveredNames = new Set(filteredDiscoveredSkills.map((skill) => skill.name))
	const uniqueBuiltins = builtinSkillsAsLoaded.filter((skill) => !discoveredNames.has(skill.name))

	let allSkills = [...filteredDiscoveredSkills, ...uniqueBuiltins]

	// Filter discovered skills by disabledSkills (builtin skills are already filtered by createBuiltinSkills)
	if (hasDisabledSkills) {
		const disabledSkills = options?.disabledSkills
		if (disabledSkills) {
			allSkills = allSkills.filter((skill) => !isDisabledSkillAlias(skill, disabledSkills))
		}
	} else {
		cachedSkillsByProvider.set(cacheKey, allSkills)
	}

	return allSkills
}
