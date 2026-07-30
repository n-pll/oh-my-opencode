/**
 * GPT-5.4 optimized Hephaestus prompt - entropy-reduced rewrite.
 *
 * Design principles (aligned with OpenAI GPT-5.4 prompting guidance):
 * - Personality/tone at position 1 for strong tonal priming
 * - Prose-based instructions; no FORBIDDEN/MUST/NEVER rhetoric
 * - 3 targeted prompt blocks: tool_persistence, dig_deeper, dependency_checks
 * - GPT-5.4 follows instructions well - trust it, fewer threats needed
 * - Conflicts eliminated: no "every 30s" + "be concise" contradiction
 * - Each concern appears in exactly one section
 *
 * Architecture (XML-tagged blocks, consistent with Sisyphus GPT-5.4):
 *   1. <identity>       - Role, personality/tone, autonomy, scope
 *   2. <intent>         - Intent mapping, complexity classification, ambiguity protocol
 *   3. <explore>        - Tool selection, tool_persistence, dig_deeper, dependency_checks, parallelism
 *   4. <constraints>    - Hard blocks + anti-patterns (after explore, before execution)
 *   5. <execution>      - 5-step workflow, verification, failure recovery, completion check
 *   6. <tracking>       - Todo/task discipline
 *   7. <progress>       - Update style with examples
 *   8. <delegation>     - Category+skills, prompt structure, session continuity, oracle
 *   9. <communication>  - Output format, tone guidance
 */

import { GPT_APPLY_PATCH_GUIDANCE } from "../gpt-apply-patch-guard";
import type {
  AvailableAgent,
  AvailableTool,
  AvailableSkill,
  AvailableCategory,
} from "../dynamic-agent-prompt-builder";
import {
  buildKeyTriggersSection,
  buildToolSelectionTable,
  buildExploreSection,
  buildLibrarianSection,
  buildCategorySkillsDelegationGuide,
  buildDelegationTable,
  buildHardBlocksSection,
  buildAntiPatternsSection,
  buildAntiDuplicationSection,
} from "../dynamic-agent-prompt-builder";
import { t } from "../../shared/i18n"

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
  const keyTriggers = buildKeyTriggersSection(availableAgents, availableSkills);
  const toolSelection = buildToolSelectionTable(
    availableAgents,
    availableTools,
    availableSkills,
  );
  const exploreSection = buildExploreSection(availableAgents);
  const librarianSection = buildLibrarianSection(availableAgents);
  const categorySkillsGuide = buildCategorySkillsDelegationGuide(
    availableCategories,
    availableSkills,
  );
  const delegationTable = buildDelegationTable(availableAgents);
  const hasOracle = availableAgents.some((agent) => agent.name === "oracle");
  const hardBlocks = buildHardBlocksSection();
  const antiPatterns = buildAntiPatternsSection();
  const antiDuplication = buildAntiDuplicationSection();
  const todoDiscipline = buildTodoDisciplineSection(useTaskSystem);

  return t("agents.hephaestus.prompt.gpt-5-4", { GPT_APPLY_PATCH_GUIDANCE: GPT_APPLY_PATCH_GUIDANCE, antiPatterns: antiPatterns, categorySkillsGuide: categorySkillsGuide, exploreSection: exploreSection, hardBlocks: hardBlocks, keyTriggers: keyTriggers, librarianSection: librarianSection, todoDiscipline: todoDiscipline, toolSelection: toolSelection });

}
