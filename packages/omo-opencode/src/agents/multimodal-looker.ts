import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "./types"
import { createAgentToolAllowlist } from "../shared/permission-compat"
import { t } from "../shared/i18n"

const MODE: AgentMode = "subagent"

export const MULTIMODAL_LOOKER_PROMPT_METADATA: AgentPromptMetadata = {
  category: "utility",
  cost: "CHEAP",
  promptAlias: "Multimodal Looker",
  triggers: [],
}

export function createMultimodalLookerAgent(model: string): AgentConfig {
  const restrictions = createAgentToolAllowlist(["read"])

  return {
    description:
      t("agents.multimodal-looker.description"),
    mode: MODE,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: t("agents.multimodal-looker.prompt"),
  }
}
createMultimodalLookerAgent.mode = MODE
