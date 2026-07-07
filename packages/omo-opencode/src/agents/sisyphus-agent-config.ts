import type { AgentConfig } from "@opencode-ai/sdk";
import { getFrontierToolSchemaPermission } from "./frontier-tool-schema-guard";
import { buildClaudeThinkingConfig } from "./types";
import type { AgentMode } from "./types";
import { t } from "../shared/i18n";

function sisyphusDescription(): string {
  return t("agents.sisyphus.description");
}

function buildSisyphusPermission(model: string): AgentConfig["permission"] {
  return {
    question: "allow",
    call_omo_agent: "deny",
    ...getFrontierToolSchemaPermission(model),
  } as AgentConfig["permission"];
}

function buildBaseSisyphusAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return {
    description: sisyphusDescription(),
    mode,
    model,
    maxTokens: 64000,
    prompt,
    color: "#00CED1",
    permission: buildSisyphusPermission(model),
  };
}

export function buildGptSisyphusAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return {
    ...buildBaseSisyphusAgentConfig(mode, model, prompt),
    reasoningEffort: "medium",
  };
}

export function buildGlmSisyphusAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return buildBaseSisyphusAgentConfig(mode, model, prompt);
}

export function buildClaudeSisyphusAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return {
    ...buildBaseSisyphusAgentConfig(mode, model, prompt),
    ...buildClaudeThinkingConfig(model),
  };
}
