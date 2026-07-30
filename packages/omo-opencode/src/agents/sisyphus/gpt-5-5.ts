/**
 * Shared GPT-5.5/GPT-5.6 Sisyphus prompt - orchestrator that delegates work, supervises
 * execution, and ships verified outcomes through the right specialists.
 */

import type {
  AvailableAgent,
  AvailableTool,
  AvailableSkill,
  AvailableCategory,
} from "../dynamic-agent-prompt-builder"
import {
  buildAgentIdentitySection,
  buildCategorySkillsDelegationGuide,
  buildDelegationTable,
  buildKeyTriggersSection,
  buildNonClaudePlannerSection,
} from "../dynamic-agent-prompt-builder"
import { GPT_APPLY_PATCH_GUIDANCE } from "../gpt-apply-patch-guard"
import { t } from "../../shared/i18n"

function buildTaskSystemGuide(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return `Create tasks before any non-trivial work (2+ steps, uncertain scope, multiple items).

Workflow:
1. On receiving a request for implementation the user explicitly asked for, call \`task_create\` with atomic steps.
2. Before each step, call \`task_update(status="in_progress")\`. One step in progress at a time.
3. After each step, call \`task_update(status="completed")\` immediately. Never batch completions.
4. If scope changes, update the task list before proceeding.

Your task creations are tracked by the harness; the system will nudge you if you go idle with open tasks.`
  }

  return `Create todos before any non-trivial work (2+ steps, uncertain scope, multiple items).

Workflow:
1. On receiving a request for implementation the user explicitly asked for, call \`todowrite\` with atomic steps.
2. Before each step, mark the item \`in_progress\`. One step in progress at a time.
3. After each step, mark it \`completed\` immediately. Never batch completions.
4. If scope changes, update the todo list before proceeding.

Your todo creations are tracked by the harness; the system will nudge you if you go idle with open items.`
}


export function buildGpt55SisyphusPrompt(
  model: string,
  availableAgents: AvailableAgent[],
  _availableTools: AvailableTool[] = [],
  availableSkills: AvailableSkill[] = [],
  availableCategories: AvailableCategory[] = [],
  useTaskSystem = false,
): string {
  const agentIdentity = buildAgentIdentitySection(
    "Sisyphus",
    "Powerful AI Agent with orchestration capabilities from OhMyOpenCode",
  )
  const personality = ""
  const taskSystemGuide = buildTaskSystemGuide(useTaskSystem)
  const categorySkillsGuide = buildCategorySkillsDelegationGuide(
    availableCategories,
    availableSkills,
  )
  const delegationTable = buildDelegationTable(availableAgents)
  const nonClaudePlannerSection = buildNonClaudePlannerSection(model)
  const keyTriggers = buildKeyTriggersSection(availableAgents, availableSkills)

  const body = t("agents.sisyphus.prompt.gpt-5-5", {
    personality,
    taskSystemGuide,
    categorySkillsGuide,
    delegationTable,
    nonClaudePlannerSection,
    keyTriggers,
  })

  return `${agentIdentity}\n${body}`
}
