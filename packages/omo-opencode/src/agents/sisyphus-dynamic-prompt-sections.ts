import {
  buildAgentIdentitySection,
  buildAntiPatternsSection,
  buildCategorySkillsDelegationGuide,
  buildDelegationTable,
  buildExploreSection,
  buildHardBlocksSection,
  buildKeyTriggersSection,
  buildLibrarianSection,
  buildNonClaudePlannerSection,
  buildOracleSection,
  buildParallelDelegationSection,
  buildToolSelectionTable,
} from "./dynamic-agent-prompt-builder";
import {
  buildAgentIdentitySectionZh,
  buildAntiPatternsSectionZh,
  buildCategorySkillsDelegationGuideZh,
  buildDelegationTableZh,
  buildExploreSectionZh,
  buildHardBlocksSectionZh,
  buildKeyTriggersSectionZh,
  buildLibrarianSectionZh,
  buildNonClaudePlannerSectionZh,
  buildOracleSectionZh,
  buildParallelDelegationSectionZh,
  buildToolSelectionTableZh,
} from "./dynamic-agent-prompt-builder";
import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
  AvailableTool,
} from "./dynamic-agent-prompt-builder";
import { buildTaskManagementSection } from "./sisyphus/default";

export interface SisyphusDynamicPromptSections {
  readonly agentIdentity: string;
  readonly antiPatterns: string;
  readonly categorySkillsGuide: string;
  readonly delegationTable: string;
  readonly exploreSection: string;
  readonly hardBlocks: string;
  readonly keyTriggers: string;
  readonly librarianSection: string;
  readonly nonClaudePlannerSection: string;
  readonly oracleSection: string;
  readonly parallelDelegationSection: string;
  readonly taskManagementSection: string;
  readonly todoHookNote: string;
  readonly toolSelection: string;
}

export function buildSisyphusDynamicPromptSections(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[],
  availableSkills: AvailableSkill[],
  availableCategories: AvailableCategory[],
  useTaskSystem: boolean,
): SisyphusDynamicPromptSections {
  return {
    agentIdentity: buildAgentIdentitySection(
      "Sisyphus",
      "Powerful AI Agent with orchestration capabilities from OhMyOpenCode",
    ),
    antiPatterns: buildAntiPatternsSection(),
    categorySkillsGuide: buildCategorySkillsDelegationGuide(
      availableCategories,
      availableSkills,
    ),
    delegationTable: buildDelegationTable(availableAgents),
    exploreSection: buildExploreSection(availableAgents),
    hardBlocks: buildHardBlocksSection(),
    keyTriggers: buildKeyTriggersSection(availableAgents, availableSkills),
    librarianSection: buildLibrarianSection(availableAgents),
    nonClaudePlannerSection: buildNonClaudePlannerSection(model),
    oracleSection: buildOracleSection(availableAgents),
    parallelDelegationSection: buildParallelDelegationSection(model, availableCategories),
    taskManagementSection: buildTaskManagementSection(useTaskSystem),
    todoHookNote: buildTodoHookNote(useTaskSystem),
    toolSelection: buildToolSelectionTable(availableAgents, availableTools, availableSkills),
  };
}

function buildTodoHookNote(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return "YOUR TASK CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TASK CONTINUATION])";
  }

  return "YOUR TODO CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TODO CONTINUATION])";
}

export function buildSisyphusDynamicPromptSectionsZh(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[],
  availableSkills: AvailableSkill[],
  availableCategories: AvailableCategory[],
  useTaskSystem: boolean,
): SisyphusDynamicPromptSections {
  return {
    agentIdentity: buildAgentIdentitySectionZh(
      "Sisyphus",
      "来自 OhMyOpenCode、具备编排能力的强大 AI 代理",
    ),
    antiPatterns: buildAntiPatternsSectionZh(),
    categorySkillsGuide: buildCategorySkillsDelegationGuideZh(
      availableCategories,
      availableSkills,
    ),
    delegationTable: buildDelegationTableZh(availableAgents),
    exploreSection: buildExploreSectionZh(availableAgents),
    hardBlocks: buildHardBlocksSectionZh(),
    keyTriggers: buildKeyTriggersSectionZh(availableAgents, availableSkills),
    librarianSection: buildLibrarianSectionZh(availableAgents),
    nonClaudePlannerSection: buildNonClaudePlannerSectionZh(model),
    oracleSection: buildOracleSectionZh(availableAgents),
    parallelDelegationSection: buildParallelDelegationSectionZh(model, availableCategories),
    taskManagementSection: buildTaskManagementSection(useTaskSystem),
    todoHookNote: buildTodoHookNoteZh(useTaskSystem),
    toolSelection: buildToolSelectionTableZh(availableAgents, availableTools, availableSkills),
  };
}

function buildTodoHookNoteZh(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return "你的任务创建将由 HOOK 跟踪（[SYSTEM REMINDER - TASK CONTINUATION]）";
  }

  return "你的 TODO 创建将由 HOOK 跟踪（[SYSTEM REMINDER - TODO CONTINUATION]）";
}
