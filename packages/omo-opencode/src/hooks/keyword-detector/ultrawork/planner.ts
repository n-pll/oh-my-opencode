import { getUltraworkPlannerPrompt } from "@oh-my-opencode/prompts-core"
import { getLocale } from "../../../shared/i18n"

export const ULTRAWORK_PLANNER_SECTION = getUltraworkPlannerPrompt()

export function getPlannerUltraworkMessage(): string {
  return `<ultrawork-mode>

**MANDATORY**: You MUST say "ULTRAWORK MODE ENABLED!" to the user as your first response when this mode activates. This is non-negotiable.

${getUltraworkPlannerPrompt(getLocale())}

</ultrawork-mode>

`
}
