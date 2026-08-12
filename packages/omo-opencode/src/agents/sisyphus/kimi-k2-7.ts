/**
 * Kimi K2.7-native Sisyphus prompt.
 *
 * Authored for K2.7 from the ground up — not a tune of another model's prompt.
 * K2.7 is the Kimi base distilled toward Opus 4.8 steerability and GPT-5.5
 * directness: restrained, outcome-first, steerable. The whole prompt is written
 * in that register — decision rules and terminal conditions over absolutes and
 * repetition, Claude-family XML anchors for structure, and the agent's
 * analytical depth reserved for where correctness is genuinely at risk. The
 * runtime-injected capability sections (tool/delegation/category tables, key
 * triggers, explore/librarian guidance) are the shared builders every variant
 * uses; everything else here is authored for this model.
 */

import type {
  AvailableAgent,
  AvailableTool,
  AvailableSkill,
  AvailableCategory,
} from "../dynamic-agent-prompt-builder";
import { KIMI_TOOL_LOOP_GUARD } from "../kimi-tool-loop-guard";
import {
  buildAgentIdentitySection,
  buildAgentIdentitySectionZh,
  buildKeyTriggersSection,
  buildKeyTriggersSectionZh,
  buildToolSelectionTable,
  buildToolSelectionTableZh,
  buildExploreSection,
  buildExploreSectionZh,
  buildLibrarianSection,
  buildLibrarianSectionZh,
  buildDelegationTable,
  buildDelegationTableZh,
  buildCategorySkillsDelegationGuide,
  buildCategorySkillsDelegationGuideZh,
  buildOracleSection,
  buildOracleSectionZh,
  buildHardBlocksSection,
  buildHardBlocksSectionZh,
  buildAntiPatternsSection,
  buildAntiPatternsSectionZh,
  buildAntiDuplicationSection,
  buildAntiDuplicationSectionZh,
  buildNonClaudePlannerSection,
  buildNonClaudePlannerSectionZh,
  categorizeTools,
} from "../dynamic-agent-prompt-builder";
import { t, getLocale } from "../../shared/i18n"

function buildKimiK27TasksSection(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return `<tasks>
Track multi-step work; skip the ceremony for everything else. Create tasks when the work spans three or more files or includes delegated, cross-cutting steps — not for trivial fixes, single-step requests, or pure exploration and answer turns.

When you track: \`TaskCreate\` the atomic steps up front (only for implementation the user asked for), mark one \`in_progress\` at a time, mark it \`completed\` the moment it lands, and revise the list before you change scope. Never batch completions.

When you have to ask for clarification, state what you understood, what is unclear, two or three options with their effort, and the one you recommend.
</tasks>`;
  }

  return `<tasks>
Track multi-step work; skip the ceremony for everything else. Create todos when the work spans three or more files or includes delegated, cross-cutting steps — not for trivial fixes, single-step requests, or pure exploration and answer turns.

When you track: \`todowrite\` the atomic steps up front (only for implementation the user asked for), mark one \`in_progress\` at a time, mark it \`completed\` the moment it lands, and revise the list before you change scope. Never batch completions.

When you have to ask for clarification, state what you understood, what is unclear, two or three options with their effort, and the one you recommend.
</tasks>`;
}

export function buildKimiK27SisyphusPrompt(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[] = [],
  availableSkills: AvailableSkill[] = [],
  availableCategories: AvailableCategory[] = [],
  useTaskSystem = false,
): string {
  const zh = getLocale() === "zh";
  const keyTriggers = (zh ? buildKeyTriggersSectionZh : buildKeyTriggersSection)(availableAgents, availableSkills);
  const toolSelection = (zh ? buildToolSelectionTableZh : buildToolSelectionTable)(availableAgents, availableTools, availableSkills);
  const exploreSection = (zh ? buildExploreSectionZh : buildExploreSection)(availableAgents);
  const librarianSection = (zh ? buildLibrarianSectionZh : buildLibrarianSection)(availableAgents);
  const categorySkillsGuide = (zh ? buildCategorySkillsDelegationGuideZh : buildCategorySkillsDelegationGuide)(availableCategories, availableSkills);
  const delegationTable = (zh ? buildDelegationTableZh : buildDelegationTable)(availableAgents);
  const oracleSection = (zh ? buildOracleSectionZh : buildOracleSection)(availableAgents);
  const hardBlocks = (zh ? buildHardBlocksSectionZh : buildHardBlocksSection)();
  const antiPatterns = (zh ? buildAntiPatternsSectionZh : buildAntiPatternsSection)();
  const nonClaudePlannerSection = (zh ? buildNonClaudePlannerSectionZh : buildNonClaudePlannerSection)(model);
  const tasksSection = buildKimiK27TasksSection(useTaskSystem);
  const todoHookNote = useTaskSystem
    ? "YOUR TASK CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TASK CONTINUATION])"
    : "YOUR TODO CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TODO CONTINUATION])";

  const agentIdentity = (zh ? buildAgentIdentitySectionZh : buildAgentIdentitySection)(
    "Sisyphus",
    "Powerful AI Agent with orchestration capabilities from OhMyOpenCode",
  );

  return t("agents.sisyphus.prompt.kimi-k2-7", {
    agentIdentity,
    todoHookNote,
    keyTriggers,
    toolSelection,
    exploreSection,
    librarianSection,
    categorySkillsGuide,
    delegationTable,
    oracleSection,
    hardBlocks,
    antiPatterns,
    nonClaudePlannerSection,
    KIMI_TOOL_LOOP_GUARD,
    tasksSection,
    buildAntiDuplicationSection: (zh ? buildAntiDuplicationSectionZh : buildAntiDuplicationSection)(),
  });

}

export { categorizeTools };
