import { getUltraworkGlmPrompt } from "@oh-my-opencode/prompts-core"
import { getLocale } from "../../../shared/i18n"

export const ULTRAWORK_GLM_MESSAGE = getUltraworkGlmPrompt()

export function getGlmUltraworkMessage(): string {
  return getUltraworkGlmPrompt(getLocale())
}
