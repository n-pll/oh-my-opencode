import hyperplanModePrompt from "../prompts/mode/hyperplan.md" with { type: "text" }
import hyperplanModePromptZh from "../prompts/mode/hyperplan.zh.md" with { type: "text" }
import teamModePrompt from "../prompts/mode/team.md" with { type: "text" }
import teamModePromptZh from "../prompts/mode/team.zh.md" with { type: "text" }

export const HYPERPLAN_MODE_PROMPT = stripFinalLineFeed(hyperplanModePrompt)
export const TEAM_MODE_PROMPT = stripFinalLineFeed(teamModePrompt)

const HYPERPLAN_MODE_PROMPT_BY_LOCALE: Record<string, string> = {
  zh: stripFinalLineFeed(hyperplanModePromptZh),
}

const TEAM_MODE_PROMPT_BY_LOCALE: Record<string, string> = {
  zh: stripFinalLineFeed(teamModePromptZh),
}

/**
 * Locale-aware mode-prompt getter. Returns the localized prompt when the
 * locale has a translation, otherwise the English default. Keeps the
 * existing HYPERPLAN_MODE_PROMPT / TEAM_MODE_PROMPT constants for
 * backwards compatibility.
 */
export function getHyperplanModePrompt(locale?: string): string {
  if (locale !== undefined) {
    const localized = HYPERPLAN_MODE_PROMPT_BY_LOCALE[locale]
    if (localized !== undefined) return localized
  }
  return HYPERPLAN_MODE_PROMPT
}

export function getTeamModePrompt(locale?: string): string {
  if (locale !== undefined) {
    const localized = TEAM_MODE_PROMPT_BY_LOCALE[locale]
    if (localized !== undefined) return localized
  }
  return TEAM_MODE_PROMPT
}

function stripFinalLineFeed(prompt: string): string {
  return prompt.endsWith("\n") ? prompt.slice(0, -1) : prompt
}
