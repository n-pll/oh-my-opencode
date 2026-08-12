import type { BuiltinSkill } from "./types"
import type { BrowserAutomationProvider } from "../../types"

import {
  createAgentBrowserSkill,
  createPlaywrightSkill,
  playwrightSkill,
  createPlaywrightCliSkill,
  createFrontendSkill,
  createGitMasterSkill,
  createDevBrowserSkill,
  createReviewWorkSkill,
  createRemoveAiSlopsSkill,
  createInitDeepSkill,
  createDebuggingSkill,
  createSecurityResearchSkill,
  createSecurityReviewSkill,
  createVisualQaSkill,
  createTeamModeSkill,
} from "./skills/index"

export interface CreateBuiltinSkillsOptions {
  browserProvider?: BrowserAutomationProvider
  disabledSkills?: Set<string>
  teamModeEnabled?: boolean
  /**
   * Extra CLI arguments appended to the default `@playwright/mcp@latest`
   * invocation when `browserProvider` resolves to the `playwright` MCP variant.
   *
   * Only threaded through to `createPlaywrightSkill`; other browser providers
   * ignore this option.
   */
  playwrightMcpArgs?: readonly string[]
  /**
   * Locale code (e.g. "en", "zh"). When set, built-in skills whose templates
   * or descriptions have locale overrides will use them, gracefully falling
   * back to English when a translation is missing. Mirrors the `locale`
   * parameter on prompts-core's `loadPrompt`.
   */
  locale?: string
}

export function createBuiltinSkills(options: CreateBuiltinSkillsOptions = {}): BuiltinSkill[] {
  const {
    browserProvider = "playwright",
    disabledSkills,
    teamModeEnabled = false,
    playwrightMcpArgs,
    locale,
  } = options

	let browserSkill: BuiltinSkill
	if (browserProvider === "agent-browser") {
		browserSkill = createAgentBrowserSkill(locale)
	} else if (browserProvider === "dev-browser") {
		browserSkill = createDevBrowserSkill(locale)
	} else if (browserProvider === "playwright-cli") {
		browserSkill = createPlaywrightCliSkill(locale)
	} else {
		browserSkill = playwrightMcpArgs?.length
			? createPlaywrightSkill({ mcp_args: playwrightMcpArgs })
			: locale
				? createPlaywrightSkill()
				: playwrightSkill
	}

	const skills = [
		browserSkill,
		createFrontendSkill(locale),
		createGitMasterSkill(locale),
		createReviewWorkSkill(locale),
		createRemoveAiSlopsSkill(locale),
		createInitDeepSkill(locale),
		createDebuggingSkill(locale),
		createSecurityResearchSkill(locale),
		createSecurityReviewSkill(locale),
		createVisualQaSkill(locale),
	]

  if (teamModeEnabled && !disabledSkills?.has("team-mode")) {
    skills.push(createTeamModeSkill(locale))
  }

  if (!disabledSkills) {
    return skills
  }

  return skills.filter((skill) => !disabledSkills.has(skill.name))
}

export interface ResolveActiveBuiltinSkillsOptions extends CreateBuiltinSkillsOptions {
  systemMcpNames: Set<string>
}

export function resolveActiveBuiltinSkills(options: ResolveActiveBuiltinSkillsOptions): BuiltinSkill[] {
  const { systemMcpNames, ...createOptions } = options

  return createBuiltinSkills(createOptions).filter((skill) => {
    if (!skill.mcpConfig) return true
    return !Object.keys(skill.mcpConfig).some((mcpName) => systemMcpNames.has(mcpName))
  })
}
