import { getUltraworkGptPrompt } from "@oh-my-opencode/prompts-core"
import { getLocale } from "../../../shared/i18n"

export const ULTRAWORK_GPT_MESSAGE = getUltraworkGptPrompt()

export function getGptUltraworkMessage(): string {
  return getUltraworkGptPrompt(getLocale())
}
