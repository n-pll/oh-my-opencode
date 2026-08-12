/** Generic GPT Hephaestus prompt - fallback for GPT models without a model-specific variant */

import { GPT_FILE_EDIT_GUIDANCE } from "../gpt-apply-patch-guard"
import { t, getLocale } from "../../shared/i18n"
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
  buildCategorySkillsDelegationGuide,
  buildCategorySkillsDelegationGuideZh,
  buildDelegationTable,
  buildDelegationTableZh,
  buildOracleSection,
  buildOracleSectionZh,
  buildHardBlocksSection,
  buildHardBlocksSectionZh,
  buildAntiPatternsSection,
  buildAntiPatternsSectionZh,
  buildAntiDuplicationSection,
  buildAntiDuplicationSectionZh,
} from "../dynamic-agent-prompt-builder";

function buildTodoDisciplineSection(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return `## Task Discipline (NON-NEGOTIABLE)

**Track ALL multi-step work with tasks. This is your execution backbone.**

### When to Create Tasks (MANDATORY)

- **2+ step task** - \`task_create\` FIRST, atomic breakdown
- **Uncertain scope** - \`task_create\` to clarify thinking
- **Complex single task** - Break down into trackable steps

### Workflow (STRICT)

1. **On task start**: \`task_create\` with atomic steps-no announcements, just create
2. **Before each step**: \`task_update(status="in_progress")\` (ONE at a time)
3. **After each step**: \`task_update(status="completed")\` IMMEDIATELY (NEVER batch)
4. **Scope changes**: Update tasks BEFORE proceeding

**NO TASKS ON MULTI-STEP WORK = INCOMPLETE WORK.**`;
  }

  return `## Todo Discipline (NON-NEGOTIABLE)

**Track ALL multi-step work with todos. This is your execution backbone.**

### When to Create Todos (MANDATORY)

- **2+ step task** - \`todowrite\` FIRST, atomic breakdown
- **Uncertain scope** - \`todowrite\` to clarify thinking
- **Complex single task** - Break down into trackable steps

### Workflow (STRICT)

1. **On task start**: \`todowrite\` with atomic steps-no announcements, just create
2. **Before each step**: Mark \`in_progress\` (ONE at a time)
3. **After each step**: Mark \`completed\` IMMEDIATELY (NEVER batch)
4. **Scope changes**: Update todos BEFORE proceeding

**NO TODOS ON MULTI-STEP WORK = INCOMPLETE WORK.**`;
}

export function buildHephaestusPrompt(
  availableAgents: AvailableAgent[] = [],
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
  const todoDiscipline = buildTodoDisciplineSection(useTaskSystem);

  return t("agents.hephaestus.prompt.gpt", {
    GPT_FILE_EDIT_GUIDANCE: GPT_FILE_EDIT_GUIDANCE,
    antiPatterns: antiPatterns,
    buildAntiDuplicationSection: (zh ? buildAntiDuplicationSectionZh : buildAntiDuplicationSection)(),
    categorySkillsGuide: categorySkillsGuide,
    delegationTable: delegationTable,
    exploreSection: exploreSection,
    hardBlocks: hardBlocks,
    keyTriggers: keyTriggers,
    librarianSection: librarianSection,
    oracleSection: oracleSection,
    todoDiscipline: todoDiscipline,
    toolSelection: toolSelection,
  });
}
