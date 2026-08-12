/**
 * Claude Opus 4.8-native Sisyphus prompt - tuned for Opus 4.8 behaviors.
 *
 * Design principles (Anthropic Opus 4.8 migration guidance + 4.7 distillation):
 * - SILENCE DEFAULT: 4.8 narrates more than 4.7 (interim updates, long wrap-ups).
 *   Explicit silence-between-tool-calls instruction restores terse behavior.
 * - SMALL-DECISION AUTONOMY: 4.8 is more deliberate and asks more often on minor
 *   choices. Explicit don't-ask guidance for naming/defaults/equivalent approaches.
 * - EXPLICIT CAPABILITY TRIGGERS: 4.8 under-reaches for subagents and tools that
 *   need a decide-to-use step; triggers fire delegation, but exploration stays
 *   bounded (one pass, sufficient > complete) like the 4.7 variant.
 * - LITERAL instruction following inherited from 4.7: state scope explicitly.
 * - XML-tagged anchors, Phase 0/1/2A/2B/2C/3 mental model, and shared dynamic
 *   helpers identical to the 4.7 variant so content stays in sync.
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

export function buildClaudeOpus48SisyphusPrompt(
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

  return t("agents.sisyphus.prompt.claude-opus-4-8", {
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
