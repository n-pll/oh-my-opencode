/**
 * Claude Opus 4.7-native Sisyphus prompt - tuned for Opus 4.7 behaviors.
 *
 * Design principles (Anthropic Opus 4.7 prompting best practices + SMART distillation):
 * - LITERAL instruction following: state scope explicitly. 4.7 does not silently
 *   generalize "first item" into "every item".
 * - BOUNDED exploration/thinking: 4.7 tends to explore and deliberate longer than
 *   4.5/4.6 in practice, so this prompt caps exploration passes and steers
 *   adaptive thinking toward acting once context is sufficient.
 * - PARALLEL tool calling re-enabled via canonical `<use_parallel_tool_calls>` snippet.
 * - DIRECT tone, strong directives. Reinforced with bold/CAPS for load-bearing rules.
 * - PROSE-DENSE sections borrowed from SMART production agent prompt
 *   (autonomy/persistence, investigation, subagents, verification, pragmatism,
 *   reversibility, file links) - rewritten tighter and stronger.
 * - XML-tagged anchors throughout, Phase 0/1/2A/2B/2C/3 mental model preserved.
 * - Shared dynamic helpers (key triggers, tool selection, delegation tables)
 *   reused so content stays in sync across variants.
 */

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
  buildParallelDelegationSection,
  buildParallelDelegationSectionZh,
  buildNonClaudePlannerSection,
  buildNonClaudePlannerSectionZh,
  buildAntiDuplicationSection,
  buildAntiDuplicationSectionZh,
  categorizeTools,
} from "../dynamic-agent-prompt-builder";
import { buildTaskManagementSection } from "./default";
import { t, getLocale } from "../../shared/i18n"

export function buildClaudeOpus47SisyphusPrompt(
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
  const parallelDelegationSection = (zh ? buildParallelDelegationSectionZh : buildParallelDelegationSection)(model, availableCategories);
  const nonClaudePlannerSection = (zh ? buildNonClaudePlannerSectionZh : buildNonClaudePlannerSection)(model);
  const taskManagementSection = buildTaskManagementSection(useTaskSystem);
  const todoHookNote = useTaskSystem
    ? "YOUR TASK CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TASK CONTINUATION])"
    : "YOUR TODO CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TODO CONTINUATION])";
  const browserQaInstruction = availableSkills.some((skill) => skill.name === "playwright")
    ? "**Web / browser / UI work** → load the `playwright` skill and DRIVE A REAL BROWSER. Open the page. Click the elements. Fill the forms. WATCH THE CONSOLE. Screenshot if helpful. Visual changes NOT RENDERED in a browser are NOT VALIDATED."
    : "**Web / browser / UI work** → use the available browser automation surface and DRIVE A REAL BROWSER. Open the page. Click the elements. Fill the forms. WATCH THE CONSOLE. Screenshot if helpful. Visual changes NOT RENDERED in a browser are NOT VALIDATED.";

  const agentIdentity = (zh ? buildAgentIdentitySectionZh : buildAgentIdentitySection)(
    "Sisyphus",
    "Powerful AI Agent with orchestration capabilities from OhMyOpenCode",
  );

  return t("agents.sisyphus.prompt.claude-opus-4-7", {
    nonClaudePlannerSection: nonClaudePlannerSection,
    agentIdentity: agentIdentity,
    keyTriggers: keyTriggers,
    categorySkillsGuide: categorySkillsGuide,
    parallelDelegationSection: parallelDelegationSection,
    taskManagementSection: taskManagementSection,
    librarianSection: librarianSection,
    toolSelection: toolSelection,
    oracleSection: oracleSection,
    browserQaInstruction: browserQaInstruction,
    delegationTable: delegationTable,
    buildAntiDuplicationSection: (zh ? buildAntiDuplicationSectionZh : buildAntiDuplicationSection)(),
    todoHookNote: todoHookNote,
    antiPatterns: antiPatterns,
    hardBlocks: hardBlocks,
    exploreSection: exploreSection,
  });
}

export { categorizeTools };
