/**
 * Kimi K2.x-native Sisyphus prompt — rewritten with 8-block architecture.
 *
 * Design principles (derived from kimi.com/blog/kimi-k2-6 + arxiv 2602.02276 §4.4.2):
 * - K2.x was post-trained with Toggle RL (~25-30% token reduction) and a Generative Reward
 *   Model (GRM) that scores: appropriate level of detail, helpfulness, response readiness,
 *   strict instruction following, intent inference.
 * - The model already has strong intent inference from RL training. Adding Claude-style
 *   "re-verify everything" gates DOUBLE-TAXES the model: external strictness on top of
 *   RL-learned strictness → self-second-guessing, redundant verification loops, and
 *   over-deliberation on already-resolved requests.
 * - Key fixes over gpt-5-4.ts:
 *   1. <re_entry_rule>: suppress re-verbalization for already-decided/confirmed turns
 *   2. <exploration_budget>: hard stop conditions alongside aggressive parallelism
 *   3. Tiered <verification_loop> (V1/V2/V3): trivial fixes don't trigger full
 *      lsp+tests+build+QA loop — V3 keeps FULL RIGOR with harsh enforcement language
 *   4. <token_economy>: verbalization explicitly EXCLUDED from trim mandate
 *
 * Architecture (8 blocks, same as gpt-5-4.ts):
 *   1. <identity>          - Role + K2.x-specific training hint
 *   2. <constraints>       - Hard blocks + anti-patterns
 *   3. <intent>            - Intent gate + verbalization + re_entry_rule
 *   4. <explore>           - Codebase assessment + research + tool rules + exploration_budget
 *   5. <execution_loop>    - EXPLORE→PLAN→ROUTE→EXECUTE_OR_SUPERVISE→VERIFY→RETRY→DONE
 *   6. <delegation>        - Category+skills, 6-section prompt, session continuity, oracle
 *   7. <tasks>             - Task/todo management (scoped threshold for K2.x)
 *   8. <style>             - Tone + output contract + token_economy
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

function buildKimiK26TasksSection(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return `<tasks>
Create tasks for V2/V3 work (≥3 distinct files OR any delegated/cross-cutting work).
Skip tasks for V1 trivial fixes, single-step requests, and pure exploration/answer turns.

Workflow when tasks exist:
1. On receiving request: \`TaskCreate\` with atomic steps. Only for implementation the user explicitly requested.
2. Before each step: \`TaskUpdate(status="in_progress")\` - one at a time.
3. After each step: \`TaskUpdate(status="completed")\` immediately. Never batch.
4. Scope change: update tasks before proceeding.

When asking for clarification:
- State what you understood, what's unclear, 2-3 options with effort/implications, and your recommendation.
</tasks>`;
  }

  return `<tasks>
Create todos for V2/V3 work (≥3 distinct files OR any delegated/cross-cutting work).
Skip todos for V1 trivial fixes, single-step requests, and pure exploration/answer turns.

Workflow when todos exist:
1. On receiving request: \`todowrite\` with atomic steps. Only for implementation the user explicitly requested.
2. Before each step: mark \`in_progress\` - one at a time.
3. After each step: mark \`completed\` immediately. Never batch.
4. Scope change: update todos before proceeding.

When asking for clarification:
- State what you understood, what's unclear, 2-3 options with effort/implications, and your recommendation.
</tasks>`;
}

export function buildKimiK26SisyphusPrompt(
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
  const tasksSection = buildKimiK26TasksSection(useTaskSystem);
  const todoHookNote = useTaskSystem
    ? "YOUR TASK CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TASK CONTINUATION])"
    : "YOUR TODO CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TODO CONTINUATION])";

  const agentIdentity = (zh ? buildAgentIdentitySectionZh : buildAgentIdentitySection)(
    "Sisyphus",
    "Powerful AI Agent with orchestration capabilities from OhMyOpenCode",
  );

  return t("agents.sisyphus.prompt.kimi-k2-6", {
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
