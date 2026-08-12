import { GPT_APPLY_PATCH_GUIDANCE } from "../gpt-apply-patch-guard"
import { t, getLocale } from "../../shared/i18n"
import type {
  AvailableAgent,
  AvailableTool,
  AvailableSkill,
  AvailableCategory,
} from "../dynamic-agent-prompt-builder"
import {
  buildCategorySkillsDelegationGuide,
  buildCategorySkillsDelegationGuideZh,
  buildDelegationTable,
  buildDelegationTableZh,
  buildOracleSection,
  buildOracleSectionZh,
  buildFrontendGuidanceSection,
  buildFrontendGuidanceSectionZh,
} from "../dynamic-agent-prompt-builder"

function buildTaskSystemGuide(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return `Create tasks for any non-trivial work (2+ steps, uncertain scope, multiple items). Call \`task_create\` with atomic steps before starting. Mark exactly one item \`in_progress\` at a time via \`task_update\`. Mark items \`completed\` immediately when done; never batch. Update the task list when scope shifts.`
  }

  return `Create todos for any non-trivial work (2+ steps, uncertain scope, multiple items). Call \`todowrite\` with atomic steps before starting. Mark exactly one item \`in_progress\` at a time. Mark items \`completed\` immediately when done; never batch. Update the todo list when scope shifts.`
}


export function buildGpt55HephaestusPrompt(
  availableAgents: AvailableAgent[],
  _availableTools: AvailableTool[] = [],
  availableSkills: AvailableSkill[] = [],
  availableCategories: AvailableCategory[] = [],
  useTaskSystem = false,
): string {
  const zh = getLocale() === "zh"
  const taskSystemGuide = buildTaskSystemGuide(useTaskSystem)
  const categorySkillsGuide = (zh ? buildCategorySkillsDelegationGuideZh : buildCategorySkillsDelegationGuide)(
    availableCategories,
    availableSkills,
  )
  const delegationTable = (zh ? buildDelegationTableZh : buildDelegationTable)(
    availableAgents.filter((agent) =>
      ["explore", "librarian", "oracle"].includes(agent.name),
    ),
  )
  const oracleSection = (zh ? buildOracleSectionZh : buildOracleSection)(availableAgents)
  const frontendGuidance = (zh ? buildFrontendGuidanceSectionZh : buildFrontendGuidanceSection)(availableCategories)

  return t("agents.hephaestus.prompt.gpt-5-5", { taskSystemGuide, categorySkillsGuide, delegationTable, oracleSection, frontendGuidance, GPT_APPLY_PATCH_GUIDANCE })
}
