import type {
  AvailableAgent,
  AvailableTool,
  AvailableSkill,
  AvailableCategory,
} from "../dynamic-agent-prompt-builder";
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
  const keyTriggers = buildKeyTriggersSection(availableAgents, availableSkills);
  const toolSelection = buildToolSelectionTable(availableAgents, availableTools, availableSkills);
  const exploreSection = buildExploreSection(availableAgents);
  const librarianSection = buildLibrarianSection(availableAgents);
  const categorySkillsGuide = buildCategorySkillsDelegationGuide(
    availableCategories,
    availableSkills,
  );
  const delegationTable = buildDelegationTable(availableAgents);
  const oracleSection = buildOracleSection(availableAgents);
  const hardBlocks = buildHardBlocksSection();
  const antiPatterns = buildAntiPatternsSection();
  const nonClaudePlannerSection = buildNonClaudePlannerSection(model);
  const tasksSection = buildGlm52TasksSection(useTaskSystem);

  const agentIdentity = buildAgentIdentitySection(
    "Sisyphus",
    "Powerful AI Agent with orchestration capabilities from OhMyOpenCode",
  );

  return t("agents.sisyphus.prompt.glm-5-2", { agentIdentity: agentIdentity, antiPatterns: antiPatterns, categorySkillsGuide: categorySkillsGuide, delegationTable: delegationTable, exploreSection: exploreSection, hardBlocks: hardBlocks, keyTriggers: keyTriggers, librarianSection: librarianSection, nonClaudePlannerSection: nonClaudePlannerSection, noun: noun, tasksSection: tasksSection, toolSelection: toolSelection });

}

export { categorizeTools };
