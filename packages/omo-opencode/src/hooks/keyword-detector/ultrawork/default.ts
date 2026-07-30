import { getUltraworkDefaultPrompt } from "@oh-my-opencode/prompts-core"
import { getLocale } from "../../../shared/i18n"

export const ULTRAWORK_DEFAULT_MESSAGE = () => getUltraworkDefaultPrompt(getLocale())

export function getDefaultUltraworkMessage(): string {
  return getUltraworkDefaultPrompt(getLocale())
}
