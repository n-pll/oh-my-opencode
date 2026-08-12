import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
  AvailableTool,
} from "./dynamic-agent-prompt-builder";
import { buildSisyphusDynamicPromptContent, buildSisyphusDynamicPromptContentZh } from "./sisyphus-dynamic-prompt-builder";
import { applyGeminiFallbackOverrides } from "./sisyphus-gemini-fallback-overrides";

export function buildDynamicSisyphusPrompt(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[] = [],
  availableSkills: AvailableSkill[] = [],
  availableCategories: AvailableCategory[] = [],
  useTaskSystem = false,
): string {
  return buildSisyphusDynamicPromptContent(
    model,
    availableAgents,
    availableTools,
    availableSkills,
    availableCategories,
    useTaskSystem,
  );
}

export function buildFallbackSisyphusPrompt(
  model: string,
  agents: AvailableAgent[],
  tools: AvailableTool[],
  skills: AvailableSkill[],
  categories: AvailableCategory[],
  useTaskSystem = false,
): string {
  return applyGeminiFallbackOverrides(
    model,
    buildDynamicSisyphusPrompt(model, agents, tools, skills, categories, useTaskSystem),
  );
}

export function buildDynamicSisyphusPromptZh(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[] = [],
  availableSkills: AvailableSkill[] = [],
  availableCategories: AvailableCategory[] = [],
  useTaskSystem = false,
): string {
  return buildSisyphusDynamicPromptContentZh(
    model,
    availableAgents,
    availableTools,
    availableSkills,
    availableCategories,
    useTaskSystem,
  );
}

export function buildFallbackSisyphusPromptZh(
  model: string,
  agents: AvailableAgent[],
  tools: AvailableTool[],
  skills: AvailableSkill[],
  categories: AvailableCategory[],
  useTaskSystem = false,
): string {
  return applyGeminiFallbackOverrides(
    model,
    buildDynamicSisyphusPromptZh(model, agents, tools, skills, categories, useTaskSystem),
  );
}
