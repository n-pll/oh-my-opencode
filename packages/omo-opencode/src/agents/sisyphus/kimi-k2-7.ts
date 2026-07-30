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
  buildKeyTriggersSection,
  buildToolSelectionTable,
  buildExploreSection,
  buildLibrarianSection,
  buildDelegationTable,
  buildCategorySkillsDelegationGuide,
  buildOracleSection,
  buildHardBlocksSection,
  buildAntiPatternsSection,
  buildAntiDuplicationSection,
  buildNonClaudePlannerSection,
  categorizeTools,
} from "../dynamic-agent-prompt-builder";
import { t } from "../../shared/i18n"

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
  const keyTriggers = buildKeyTriggersSection(availableAgents, availableSkills);
  const toolSelection = buildToolSelectionTable(availableAgents, availableTools, availableSkills);
  const exploreSection = buildExploreSection(availableAgents);
  const librarianSection = buildLibrarianSection(availableAgents);
  const categorySkillsGuide = buildCategorySkillsDelegationGuide(availableCategories, availableSkills);
  const delegationTable = buildDelegationTable(availableAgents);
  const oracleSection = buildOracleSection(availableAgents);
  const hardBlocks = buildHardBlocksSection();
  const antiPatterns = buildAntiPatternsSection();
  const nonClaudePlannerSection = buildNonClaudePlannerSection(model);
  return t("agents.sisyphus.prompt.kimi-k2-7", { agentIdentity: agentIdentity, constraintsBlock: constraintsBlock, delegationBlock: delegationBlock, executionBlock: executionBlock, explorationBlock: explorationBlock, intentBlock: intentBlock, operatingRulesBlock: operatingRulesBlock, roleBlock: roleBlock, styleBlock: styleBlock, tasksSection: tasksSection });

}

export { categorizeTools };
