import { getUltraworkGeminiPrompt } from "@oh-my-opencode/prompts-core"
import { getLocale } from "../../../shared/i18n"

export const ULTRAWORK_GEMINI_MESSAGE = getUltraworkGeminiPrompt()

export function getGeminiUltraworkMessage(): string {
  return getUltraworkGeminiPrompt(getLocale())
}
