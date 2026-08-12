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

function buildGlm52TasksSection(useTaskSystem: boolean): string {
  const noun = useTaskSystem ? "tasks" : "todos";
  const create = useTaskSystem ? "task_create" : "todowrite";
  const update = useTaskSystem ? "task_update" : "todowrite";
  const hook = useTaskSystem ? "TASK CONTINUATION" : "TODO CONTINUATION";

  return `<tasks>
Use ${noun} for implementation work with two or more real steps, cross-file edits, delegated work, or uncertain scope. Skip tracking for direct answers, pure exploration, and one-step edits.

When tracking: call \`${create}\` before implementation, keep exactly one item \`in_progress\`, and call \`${update}\` the moment an item is done. Never batch completions. If scope changes, revise the list before more edits.

Your ${noun} are tracked by the harness via [SYSTEM REMINDER - ${hook}].
</tasks>`;
}

export function buildGlm52SisyphusPrompt(
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
  const categorySkillsGuide = (zh ? buildCategorySkillsDelegationGuideZh : buildCategorySkillsDelegationGuide)(
    availableCategories,
    availableSkills,
  );
  const delegationTable = (zh ? buildDelegationTableZh : buildDelegationTable)(availableAgents);
  const oracleSection = (zh ? buildOracleSectionZh : buildOracleSection)(availableAgents);
  const hardBlocks = (zh ? buildHardBlocksSectionZh : buildHardBlocksSection)();
  const antiPatterns = (zh ? buildAntiPatternsSectionZh : buildAntiPatternsSection)();
  const nonClaudePlannerSection = (zh ? buildNonClaudePlannerSectionZh : buildNonClaudePlannerSection)(model);
  const tasksSection = buildGlm52TasksSection(useTaskSystem);

  const agentIdentity = (zh ? buildAgentIdentitySectionZh : buildAgentIdentitySection)(
    "Sisyphus",
    "Powerful AI Agent with orchestration capabilities from OhMyOpenCode",
  );

  const noun = useTaskSystem ? "tasks" : "todos";
  const create = useTaskSystem ? "task_create" : "todowrite";
  const update = useTaskSystem ? "task_update" : "todowrite";
  const hook = useTaskSystem ? "TASK CONTINUATION" : "TODO CONTINUATION";

  return t("agents.sisyphus.prompt.glm-5-2", {
    agentIdentity,
    keyTriggers,
    toolSelection,
    exploreSection,
    librarianSection,
    categorySkillsGuide,
    delegationTable,
    oracleSection,
    nonClaudePlannerSection,
    noun,
    create,
    update,
    hook,
    tasksSection,
    hardBlocks,
    antiPatterns,
    buildAntiDuplicationSection: (zh ? buildAntiDuplicationSectionZh : buildAntiDuplicationSection)(),
  });

}

export { categorizeTools };
