/**
 * GPT-5.4-native Sisyphus prompt - rewritten with 8-block architecture.
 *
 * Design principles (derived from OpenAI's GPT-5.4 prompting guidance):
 * - Compact, block-structured prompts with XML tags + named sub-anchors
 * - reasoning.effort defaults to "none" - explicit thinking encouragement required
 * - GPT-5.4 generates preambles natively - do NOT add preamble instructions
 * - GPT-5.4 follows instructions well - less repetition, fewer threats needed
 * - GPT-5.4 benefits from: output contracts, verification loops, dependency checks, completeness contracts
 * - GPT-5.4 can be over-literal - add intent inference layer for nuanced behavior
 * - "Start with the smallest prompt that passes your evals" - keep it dense
 *
 * Architecture (8 blocks, ~9 named sub-anchors):
 *   1. <identity>          - Role, instruction priority, orchestrator bias
 *   2. <constraints>       - Hard blocks + anti-patterns (early placement for GPT-5.4 attention)
 *   3. <intent>            - Think-first + intent gate + autonomy (merged, domain_guess routing)
 *   4. <explore>           - Codebase assessment + research + tool rules (named sub-anchors preserved)
 *   5. <execution_loop>    - EXPLORE→PLAN→ROUTE→EXECUTE_OR_SUPERVISE→VERIFY→RETRY→DONE (heart of prompt)
 *   6. <delegation>        - Category+skills, 6-section prompt, session continuity, oracle
 *   7. <tasks>             - Task/todo management
 *   8. <style>             - Tone (prose) + output contract + progress updates
 */

import { GPT_APPLY_PATCH_GUIDANCE } from "../gpt-apply-patch-guard";
import type {
  AvailableAgent,
  AvailableTool,
  AvailableSkill,
  AvailableCategory,
} from "../dynamic-agent-prompt-builder";
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

function buildGpt54TasksSection(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return `<tasks>
Create tasks before starting any non-trivial work. This is your primary coordination mechanism.

When to create: multi-step task (2+), uncertain scope, multiple items, complex breakdown.

Workflow:
1. On receiving request: \`TaskCreate\` with atomic steps. Only for implementation the user explicitly requested.
2. Before each step: \`TaskUpdate(status="in_progress")\` - one at a time.
3. After each step: \`TaskUpdate(status="completed")\` immediately. Never batch.
4. Scope change: update tasks before proceeding.

When asking for clarification:
- State what you understood, what's unclear, 2-3 options with effort/implications, and your recommendation.
</tasks>`;
  }

  return `<tasks>
Create todos before starting any non-trivial work. This is your primary coordination mechanism.

When to create: multi-step task (2+), uncertain scope, multiple items, complex breakdown.

Workflow:
1. On receiving request: \`todowrite\` with atomic steps. Only for implementation the user explicitly requested.
2. Before each step: mark \`in_progress\` - one at a time.
3. After each step: mark \`completed\` immediately. Never batch.
4. Scope change: update todos before proceeding.

When asking for clarification:
- State what you understood, what's unclear, 2-3 options with effort/implications, and your recommendation.
</tasks>`;
}

export function buildGpt54SisyphusPrompt(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[] = [],
  availableSkills: AvailableSkill[] = [],
  availableCategories: AvailableCategory[] = [],
  useTaskSystem = false,
): string {
  const zh = getLocale() === "zh";
  const keyTriggers = (zh ? buildKeyTriggersSectionZh : buildKeyTriggersSection)(availableAgents, availableSkills);
  const toolSelection = (zh ? buildToolSelectionTableZh : buildToolSelectionTable)(
    availableAgents,
    availableTools,
    availableSkills,
  );
  const exploreSection = (zh ? buildExploreSectionZh : buildExploreSection)(availableAgents);
  const librarianSection = (zh ? buildLibrarianSectionZh : buildLibrarianSection)(availableAgents);
  const categorySkillsGuide = (zh ? buildCategorySkillsDelegationGuideZh : buildCategorySkillsDelegationGuide)(
    availableCategories,
    availableSkills,
  );
  const delegationTable = (zh ? buildDelegationTableZh : buildDelegationTable)(availableAgents);
  const oracleSection = (zh ? buildOracleSectionZh : buildOracleSection)(availableAgents);
  const hardBlocks = (zh ? buildHardBlocksSectionZh : buildHardBlocksSection)();
  const antiPatterns = (zh ? buildAntiPatternsSectionZh : buildAntiPatternsSection)();
  const nonClaudePlannerSection = (zh ? buildNonClaudePlannerSectionZh : buildNonClaudePlannerSection)(model);
  const tasksSection = buildGpt54TasksSection(useTaskSystem);
  const todoHookNote = useTaskSystem
    ? "YOUR TASK CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TASK CONTINUATION])"
    : "YOUR TODO CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TODO CONTINUATION])";

  const agentIdentity = (zh ? buildAgentIdentitySectionZh : buildAgentIdentitySection)(
    "Sisyphus",
    "Powerful AI Agent with orchestration capabilities from OhMyOpenCode",
  );

  return t("agents.sisyphus.prompt.gpt-5-4", {
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
    tasksSection,
    GPT_APPLY_PATCH_GUIDANCE,
    buildAntiDuplicationSection: (zh ? buildAntiDuplicationSectionZh : buildAntiDuplicationSection)(),
  });

}

export { categorizeTools };
