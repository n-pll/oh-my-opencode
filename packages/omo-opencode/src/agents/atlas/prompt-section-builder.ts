/**
 * Atlas Orchestrator - Shared Utilities
 *
 * Common functions for building dynamic prompt sections used by both
 * default (Claude-optimized) and GPT-optimized prompts.
 */

import type { CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { CATEGORY_DESCRIPTIONS } from "../../tools/delegate-task/constants"
import { mergeCategories } from "../../shared/merge-categories"
import { truncateDescription } from "../../shared/truncate-description"

export const getCategoryDescription = (name: string, userCategories?: Record<string, CategoryConfig>) =>
  userCategories?.[name]?.description ?? CATEGORY_DESCRIPTIONS[name] ?? "General tasks"

export function buildAgentSelectionSection(agents: AvailableAgent[]): string {
   if (agents.length === 0) {
     return `##### Option B: Use AGENT directly (for specialized experts)

 No agents available.`
   }

   const rows = agents.map((a) => {
     const shortDesc = truncateDescription(a.description)
     return `- **\`${a.name}\`** - ${shortDesc}`
   })

  return `##### Option B: Use AGENT directly (for specialized experts)

${rows.join("\n")}`
}

export function buildCategorySection(userCategories?: Record<string, CategoryConfig>): string {
  const allCategories = mergeCategories(userCategories)
  const categoryRows = Object.entries(allCategories).map(([name, config]) => {
    const temp = config.temperature ?? 0.5
    const desc = getCategoryDescription(name, userCategories)
    return `- **\`${name}\`** (${temp}): ${desc}`
  })

  return `##### Option A: Use CATEGORY (for domain-specific work)

Categories spawn \`Sisyphus-Junior-{category}\` with optimized settings:

${categoryRows.join("\n")}

\`\`\`typescript
task(category="[category-name]", load_skills=[...], run_in_background=false, prompt="...")
\`\`\``
}

export function buildSkillsSection(skills: AvailableSkill[]): string {
  if (skills.length === 0) {
    return ""
  }

  const builtinSkills = skills.filter((s) => s.location === "plugin")
  const customSkills = skills.filter((s) => s.location !== "plugin")

  return `
#### 3.2.2: Skill Selection (PREPEND TO PROMPT)

**Use the \`Category + Skills Delegation System\` section below as the single source of truth for skill details.**
- Built-in skills available: ${builtinSkills.length}
- User-installed skills available: ${customSkills.length}

**MANDATORY: Evaluate ALL skills (built-in AND user-installed) for relevance to your task.**

Read each skill's description in the section below and ask: "Does this skill's domain overlap with my task?"
- If YES: INCLUDE in load_skills=[...]
- If NO: You MUST justify why in your pre-delegation declaration

**Usage:**
\`\`\`typescript
task(category="[category]", load_skills=["skill-1", "skill-2"], run_in_background=false, prompt="...")
\`\`\`

**IMPORTANT:**
- Skills get prepended to the subagent's prompt, providing domain-specific instructions
- Subagents are STATELESS - they don't know what skills exist unless you include them
- Missing a relevant skill = suboptimal output quality`
}

export function buildDecisionMatrix(agents: AvailableAgent[], userCategories?: Record<string, CategoryConfig>): string {
  const allCategories = mergeCategories(userCategories)

  const categoryRows = Object.entries(allCategories).map(([name]) => {
    const desc = getCategoryDescription(name, userCategories)
    return `- **${desc}**: \`category="${name}", load_skills=[...]\``
  })

   const agentRows = agents.map((a) => {
     const shortDesc = truncateDescription(a.description)
     return `- **${shortDesc}**: \`agent="${a.name}"\``
   })

  return `##### Decision Matrix

${categoryRows.join("\n")}
${agentRows.join("\n")}

**NEVER provide both category AND agent - they are mutually exclusive.**`
}

export const getCategoryDescriptionZh = (name: string, userCategories?: Record<string, CategoryConfig>) =>
  userCategories?.[name]?.description ?? CATEGORY_DESCRIPTIONS[name] ?? "通用任务"

export function buildAgentSelectionSectionZh(agents: AvailableAgent[]): string {
   if (agents.length === 0) {
     return `##### 方案 B：直接使用 AGENT（针对专业专家）

 没有可用代理。`
   }

   const rows = agents.map((a) => {
     const shortDesc = truncateDescription(a.description)
     return `- **\`${a.name}\`** - ${shortDesc}`
   })

  return `##### 方案 B：直接使用 AGENT（针对专业专家）

${rows.join("\n")}`
}

export function buildCategorySectionZh(userCategories?: Record<string, CategoryConfig>): string {
  const allCategories = mergeCategories(userCategories)
  const categoryRows = Object.entries(allCategories).map(([name, config]) => {
    const temp = config.temperature ?? 0.5
    const desc = getCategoryDescriptionZh(name, userCategories)
    return `- **\`${name}\`** (${temp}): ${desc}`
  })

  return `##### 方案 A：使用 CATEGORY（针对领域专属工作）

类别会以优化配置启动 \`Sisyphus-Junior-{category}\`：

${categoryRows.join("\n")}

\`\`\`typescript
task(category="[category-name]", load_skills=[...], run_in_background=false, prompt="...")
\`\`\``
}

export function buildSkillsSectionZh(skills: AvailableSkill[]): string {
  if (skills.length === 0) {
    return ""
  }

  const builtinSkills = skills.filter((s) => s.location === "plugin")
  const customSkills = skills.filter((s) => s.location !== "plugin")

  return `
#### 3.2.2：技能选择（前置到提示词）

**以下面的 \`Category + Skills Delegation System\` 部分作为技能细节的唯一权威来源。**
- 可用的内置技能：${builtinSkills.length}
- 可用的用户安装技能：${customSkills.length}

**强制要求：评估所有技能（内置和用户安装）与你任务的相关性。**

阅读下方部分中每个技能的描述并问："这个技能的领域与我的任务有重叠吗？"
- 如果是：包含进 load_skills=[...]
- 如果否：你必须在委派前声明中说明理由

**用法：**
\`\`\`typescript
task(category="[category]", load_skills=["skill-1", "skill-2"], run_in_background=false, prompt="...")
\`\`\`

**重要：**
- 技能会前置到子代理的提示词中，提供领域专属指令
- 子代理是无状态的 - 除非你包含技能，否则它们不知道有哪些技能
- 缺少相关技能 = 输出质量欠佳`
}

export function buildDecisionMatrixZh(agents: AvailableAgent[], userCategories?: Record<string, CategoryConfig>): string {
  const allCategories = mergeCategories(userCategories)

  const categoryRows = Object.entries(allCategories).map(([name]) => {
    const desc = getCategoryDescriptionZh(name, userCategories)
    return `- **${desc}**: \`category="${name}", load_skills=[...]\``
  })

   const agentRows = agents.map((a) => {
     const shortDesc = truncateDescription(a.description)
     return `- **${shortDesc}**: \`agent="${a.name}"\``
   })

  return `##### 决策矩阵

${categoryRows.join("\n")}
${agentRows.join("\n")}

**绝不要同时提供 category 和 agent - 它们是互斥的。**`
}
