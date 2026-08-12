import type { BrowserAutomationProvider, GitMasterConfig } from "../../types"

export interface SkillResolutionOptions {
	gitMasterConfig?: GitMasterConfig
	browserProvider?: BrowserAutomationProvider
	disabledSkills?: Set<string>
	teamModeEnabled?: boolean
	/** Project directory to discover project-level skills from. Falls back to process.cwd() if not provided. */
	directory?: string
	/**
	 * Locale code (e.g. "en", "zh"). When set, built-in skill templates and
	 * descriptions resolve to their locale-specific override, gracefully
	 * falling back to English when a translation is missing.
	 */
	locale?: string
}
