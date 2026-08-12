import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "./types"
import { buildClaudeThinkingConfig, isKimiK27Model } from "./types"
import { buildAntiDuplicationSection, buildAntiDuplicationSectionZh } from "./dynamic-agent-prompt-builder"
import { t, getLocale } from "../shared/i18n"
import { createAgentToolRestrictions } from "../shared/permission-compat"

const MODE: AgentMode = "subagent"

/**
 * Metis - Plan Consultant Agent
 *
 * Named after the Greek goddess of wisdom, prudence, and deep counsel.
 * Metis analyzes user requests BEFORE planning to prevent AI failures.
 *
 * Core responsibilities:
 * - Identify hidden intentions and unstated requirements
 * - Detect ambiguities that could derail implementation
 * - Flag potential AI-slop patterns (over-engineering, scope creep)
 * - Generate clarifying questions for the user
 * - Prepare directives for the planner agent
 */

const zh = getLocale() === "zh"

export const METIS_SYSTEM_PROMPT = t("agents.metis.prompt.default", { antiDuplication: (zh ? buildAntiDuplicationSectionZh : buildAntiDuplicationSection)() });

export const METIS_K2_7_SYSTEM_PROMPT = t("agents.metis.prompt.k2_7", { antiDuplication: (zh ? buildAntiDuplicationSectionZh : buildAntiDuplicationSection)() });

const metisRestrictions = createAgentToolRestrictions([
  "write",
  "edit",
  "apply_patch",
])

export function createMetisAgent(model: string): AgentConfig {
  const prompt = isKimiK27Model(model) ? METIS_K2_7_SYSTEM_PROMPT : METIS_SYSTEM_PROMPT
  return {
    description:
      "Pre-planning consultant that analyzes requests to identify hidden intentions, ambiguities, and AI failure points. (Metis - OhMyOpenCode)",
    mode: MODE,
    model,
    temperature: 0.3,
    ...metisRestrictions,
    prompt,
    ...buildClaudeThinkingConfig(model),
  } as AgentConfig
}
createMetisAgent.mode = MODE

export const metisPromptMetadata: AgentPromptMetadata = {
  category: "advisor",
  cost: "EXPENSIVE",
  triggers: [
    {
      domain: "Pre-planning analysis",
      trigger: "Complex task requiring scope clarification, ambiguous requirements",
    },
  ],
  useWhen: [
    "Before planning non-trivial tasks",
    "When user request is ambiguous or open-ended",
    "To prevent AI over-engineering patterns",
  ],
  avoidWhen: [
    "Simple, well-defined tasks",
    "User has already provided detailed requirements",
  ],
  promptAlias: "Metis",
  keyTrigger: "Ambiguous or complex request → consult Metis before Prometheus",
}
