import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "./types"
import { createAgentToolRestrictions } from "../shared/permission-compat"

import { t } from "../shared/i18n"
const MODE: AgentMode = "subagent"

export const LIBRARIAN_PROMPT_METADATA: AgentPromptMetadata = {
  category: "exploration",
  cost: "CHEAP",
  promptAlias: "Librarian",
  keyTrigger: "External library/source mentioned → fire `librarian` background",
  triggers: [
    { domain: "Librarian", trigger: "Unfamiliar packages / libraries, struggles at weird behaviour (to find existing implementation of opensource)" },
  ],
  useWhen: [
    "How do I use [library]?",
    "What's the best practice for [framework feature]?",
    "Why does [external dependency] behave this way?",
    "Find examples of [library] usage",
    "Working with unfamiliar npm/pip/cargo packages",
  ],
}

export function createLibrarianAgent(model: string): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "write",
    "edit",
    "apply_patch",
    "task",
    "call_omo_agent",
  ])

  return {
    description:
      t("agents.librarian.description"),
    mode: MODE,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: t("agents.librarian.prompt", { currentYear: new Date().getFullYear(), lastYear: new Date().getFullYear() - 1 }),
  }
}
createLibrarianAgent.mode = MODE
