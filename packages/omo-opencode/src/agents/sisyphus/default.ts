/**
 * Default/base Sisyphus prompt builder.
 * Used for Claude and other non-specialized models.
 */

import type {
  AvailableAgent,
  AvailableTool,
  AvailableSkill,
  AvailableCategory,
} from "../dynamic-agent-prompt-builder";
import {
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
import { t, getLocale } from "../../shared/i18n";

export function buildTaskManagementSection(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return `<Task_Management>
## Task Management (CRITICAL)

**DEFAULT BEHAVIOR**: Create tasks BEFORE starting any non-trivial task. This is your PRIMARY coordination mechanism.

### When to Create Tasks (MANDATORY)

- Multi-step task (2+ steps) → ALWAYS \`TaskCreate\` first
- Uncertain scope → ALWAYS (tasks clarify thinking)
- User request with multiple items → ALWAYS
- Complex single task → \`TaskCreate\` to break down

### Workflow (NON-NEGOTIABLE)

1. **IMMEDIATELY on receiving request**: \`TaskCreate\` to plan atomic steps.
   - ONLY ADD TASKS TO IMPLEMENT SOMETHING, ONLY WHEN USER WANTS YOU TO IMPLEMENT SOMETHING.
2. **Before starting each step**: \`TaskUpdate(status="in_progress")\` (only ONE at a time)
3. **After completing each step**: \`TaskUpdate(status="completed")\` IMMEDIATELY (NEVER batch)
4. **If scope changes**: Update tasks before proceeding

### Why This Is Non-Negotiable

- **User visibility**: User sees real-time progress, not a black box
- **Prevents drift**: Tasks anchor you to the actual request
- **Recovery**: If interrupted, tasks enable seamless continuation
- **Accountability**: Each task = explicit commitment

### Anti-Patterns (BLOCKING)

- Skipping tasks on multi-step tasks - user has no visibility, steps get forgotten
- Batch-completing multiple tasks - defeats real-time tracking purpose
- Proceeding without marking in_progress - no indication of what you're working on
- Finishing without completing tasks - task appears incomplete to user

**FAILURE TO USE TASKS ON NON-TRIVIAL TASKS = INCOMPLETE WORK.**

### Clarification Protocol (when asking):

\`\`\`
I want to make sure I understand correctly.

**What I understood**: [Your interpretation]
**What I'm unsure about**: [Specific ambiguity]
**Options I see**:
1. [Option A] - [effort/implications]
2. [Option B] - [effort/implications]

**My recommendation**: [suggestion with reasoning]

Should I proceed with [recommendation], or would you prefer differently?
\`\`\`
</Task_Management>`;
  }

  return `<Task_Management>
## Todo Management (CRITICAL)

**DEFAULT BEHAVIOR**: Create todos BEFORE starting any non-trivial task. This is your PRIMARY coordination mechanism.

### When to Create Todos (MANDATORY)

- Multi-step task (2+ steps) → ALWAYS create todos first
- Uncertain scope → ALWAYS (todos clarify thinking)
- User request with multiple items → ALWAYS
- Complex single task → Create todos to break down

### Workflow (NON-NEGOTIABLE)

1. **IMMEDIATELY on receiving request**: \`todowrite\` to plan atomic steps.
   - ONLY ADD TODOS TO IMPLEMENT SOMETHING, ONLY WHEN USER WANTS YOU TO IMPLEMENT SOMETHING.
2. **Before starting each step**: Mark \`in_progress\` (only ONE at a time)
3. **After completing each step**: Mark \`completed\` IMMEDIATELY (NEVER batch)
4. **If scope changes**: Update todos before proceeding

### Why This Is Non-Negotiable

- **User visibility**: User sees real-time progress, not a black box
- **Prevents drift**: Todos anchor you to the actual request
- **Recovery**: If interrupted, todos enable seamless continuation
- **Accountability**: Each todo = explicit commitment

### Anti-Patterns (BLOCKING)

- Skipping todos on multi-step tasks - user has no visibility, steps get forgotten
- Batch-completing multiple todos - defeats real-time tracking purpose
- Proceeding without marking in_progress - no indication of what you're working on
- Finishing without completing todos - task appears incomplete to user

**FAILURE TO USE TODOS ON NON-TRIVIAL TASKS = INCOMPLETE WORK.**

### Clarification Protocol (when asking):

\`\`\`
I want to make sure I understand correctly.

**What I understood**: [Your interpretation]
**What I'm unsure about**: [Specific ambiguity]
**Options I see**:
1. [Option A] - [effort/implications]
2. [Option B] - [effort/implications]

**My recommendation**: [suggestion with reasoning]

Should I proceed with [recommendation], or would you prefer differently?
\`\`\`
</Task_Management>`;
}

export function buildDefaultSisyphusPrompt(
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

  return t("agents.sisyphus.prompt.default", {
    keyTriggers,
    toolSelection,
    exploreSection,
    librarianSection,
    categorySkillsGuide,
    nonClaudePlannerSection,
    parallelDelegationSection,
    delegationTable,
    oracleSection,
    taskManagementSection,
    hardBlocks,
    antiPatterns,
    antiDuplication: (zh ? buildAntiDuplicationSectionZh : buildAntiDuplicationSection)(),
    todoHookNote,
  });
}

export { categorizeTools };
