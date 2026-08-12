import type {
  AvailableCategory,
  AvailableSkill,
} from "./dynamic-agent-prompt-types"

function buildSkillsSection(skills: AvailableSkill[]): string {
  const builtinSkills = skills.filter((skill) => skill.location === "plugin")
  const customSkills = skills.filter((skill) => skill.location !== "plugin")

  const builtinNames = builtinSkills.map((skill) => skill.name).join(", ")
  const customNames = customSkills
    .map((skill) => {
      const source = skill.location === "project" ? "project" : "user"
      return `${skill.name} (${source})`
    })
    .join(", ")

  if (customSkills.length > 0 && builtinSkills.length > 0) {
    return `#### Available Skills (via \`skill\` tool)

**Built-in**: ${builtinNames}
**⚡ YOUR SKILLS (PRIORITY)**: ${customNames}

> User-installed skills OVERRIDE built-in defaults. ALWAYS prefer YOUR SKILLS when domain matches.
> Full skill descriptions → use the \`skill\` tool to check before EVERY delegation.`
  }

  if (customSkills.length > 0) {
    return `#### Available Skills (via \`skill\` tool)

**⚡ YOUR SKILLS (PRIORITY)**: ${customNames}

> User-installed skills OVERRIDE built-in defaults. ALWAYS prefer YOUR SKILLS when domain matches.
> Full skill descriptions → use the \`skill\` tool to check before EVERY delegation.`
  }

  if (builtinSkills.length > 0) {
    return `#### Available Skills (via \`skill\` tool)

**Built-in**: ${builtinNames}

> Full skill descriptions → use the \`skill\` tool to check before EVERY delegation.`
  }

  return ""
}

export function buildCategorySkillsDelegationGuide(
  categories: AvailableCategory[],
  skills: AvailableSkill[],
): string {
  if (categories.length === 0 && skills.length === 0) {
    return ""
  }

  const categoryRows = categories.map((category) => {
    const description = category.description || category.name
    return `- \`${category.name}\` - ${description}`
  })

  const customSkills = skills.filter((skill) => skill.location !== "plugin")
  const skillsSection = buildSkillsSection(skills)
  const customPriorityNote =
    customSkills.length > 0
      ? `
> **User-installed skills get PRIORITY.** When in doubt, INCLUDE rather than omit.`
      : ""

  return `### Category + Skills Delegation System

**task() combines categories and skills for optimal task execution.**

#### Available Categories (Domain-Optimized Models)

Each category is configured with a model optimized for that domain. Read the description to understand when to use it.

${categoryRows.join("\n")}

${skillsSection}

---

### MANDATORY: Category + Skill Selection Protocol

**STEP 1: Select Category**
- Read each category's description
- Match task requirements to category domain
- Select the category whose domain BEST fits the task

**STEP 2: Evaluate ALL Skills**
Check the \`skill\` tool for available skills and their descriptions. For EVERY skill, ask:
> "Does this skill's expertise domain overlap with my task?"

- If YES → INCLUDE in \`load_skills=[...]\`
- If NO → OMIT (no justification needed)${customPriorityNote}

---

### Delegation Pattern

\`\`\`typescript
task(
  category="[selected-category]",
  load_skills=["skill-1", "skill-2"],  // Include ALL relevant skills - ESPECIALLY user-installed ones
  run_in_background=false,
  prompt="..."
)
\`\`\`

**ANTI-PATTERN (will produce poor results):**
\`\`\`typescript
task(category="...", load_skills=[], run_in_background=false, prompt="...")  // Empty load_skills without justification
\`\`\`

---

### Category Domain Matching (ZERO TOLERANCE)

Every delegation MUST use the category that matches the task's domain. Mismatched categories produce measurably worse output because each category runs on a model optimized for that specific domain.

**VISUAL WORK = ALWAYS \`visual-engineering\`. NO EXCEPTIONS.**

Any task involving UI, UX, CSS, styling, layout, animation, design, or frontend components MUST go to \`visual-engineering\`. Never delegate visual work to \`quick\`, \`unspecified-*\`, or any other category.

\`\`\`typescript
// CORRECT: Visual work → visual-engineering category
task(category="visual-engineering", load_skills=["frontend"], run_in_background=false, prompt="Redesign the sidebar layout with new spacing...")

// WRONG: Visual work in wrong category - WILL PRODUCE INFERIOR RESULTS
task(category="quick", load_skills=[], run_in_background=false, prompt="Redesign the sidebar layout with new spacing...")
\`\`\`

| Task Domain | MUST Use Category |
|---|---|
| UI, styling, animations, layout, design | \`visual-engineering\` |
| Hard logic, architecture decisions, algorithms | \`ultrabrain\` |
| Autonomous research + end-to-end implementation | \`deep\` |
| Single-file typo, trivial config change | \`quick\` |

**When in doubt about category, it is almost never \`quick\` or \`unspecified-*\`. Match the domain.**`
}

function buildSkillsSectionZh(skills: AvailableSkill[]): string {
  const builtinSkills = skills.filter((skill) => skill.location === "plugin")
  const customSkills = skills.filter((skill) => skill.location !== "plugin")

  const builtinNames = builtinSkills.map((skill) => skill.name).join(", ")
  const customNames = customSkills
    .map((skill) => {
      const source = skill.location === "project" ? "project" : "user"
      return `${skill.name} (${source})`
    })
    .join(", ")

  if (customSkills.length > 0 && builtinSkills.length > 0) {
    return `#### 可用技能（通过 \`skill\` 工具）

**内置**：${builtinNames}
**⚡ 你的技能（优先）**：${customNames}

> 用户安装的技能会覆盖内置默认技能。领域匹配时始终优先使用你的技能。
> 完整技能描述 → 每次委派前使用 \`skill\` 工具查看。`
  }

  if (customSkills.length > 0) {
    return `#### 可用技能（通过 \`skill\` 工具）

**⚡ 你的技能（优先）**：${customNames}

> 用户安装的技能会覆盖内置默认技能。领域匹配时始终优先使用你的技能。
> 完整技能描述 → 每次委派前使用 \`skill\` 工具查看。`
  }

  if (builtinSkills.length > 0) {
    return `#### 可用技能（通过 \`skill\` 工具）

**内置**：${builtinNames}

> 完整技能描述 → 每次委派前使用 \`skill\` 工具查看。`
  }

  return ""
}

export function buildCategorySkillsDelegationGuideZh(
  categories: AvailableCategory[],
  skills: AvailableSkill[],
): string {
  if (categories.length === 0 && skills.length === 0) {
    return ""
  }

  const categoryRows = categories.map((category) => {
    const description = category.description || category.name
    return `- \`${category.name}\` - ${description}`
  })

  const customSkills = skills.filter((skill) => skill.location !== "plugin")
  const skillsSection = buildSkillsSectionZh(skills)
  const customPriorityNote =
    customSkills.length > 0
      ? `
> **用户安装的技能拥有优先权。** 拿不准时，宁可包含也不要省略。`
      : ""

  return `### 类别 + 技能委派系统

**task() 结合类别与技能，以实现最优的任务执行。**

#### 可用类别（领域优化模型）

每个类别都配置了针对该领域优化的模型。阅读描述以了解何时使用它。

${categoryRows.join("\n")}

${skillsSection}

---

### 强制要求：类别 + 技能选择协议

**第一步：选择类别**
- 阅读每个类别的描述
- 将任务需求与类别领域匹配
- 选择领域最契合任务的类别

**第二步：评估所有技能**
查看 \`skill\` 工具中的可用技能及其描述。对每个技能都问：
> "这个技能的专业领域与我的任务有重叠吗？"

- 如果是 → 包含进 \`load_skills=[...]\`
- 如果否 → 省略（无需说明理由）${customPriorityNote}

---

### 委派模式

\`\`\`typescript
task(
  category="[selected-category]",
  load_skills=["skill-1", "skill-2"],  // Include ALL relevant skills - ESPECIALLY user-installed ones
  run_in_background=false,
  prompt="..."
)
\`\`\`

**反模式（会产生糟糕结果）：**
\`\`\`typescript
task(category="...", load_skills=[], run_in_background=false, prompt="...")  // Empty load_skills without justification
\`\`\`

---

### 类别领域匹配（零容忍）

每次委派都必须使用与任务领域匹配的类别。类别不匹配会产生明显更差的输出，因为每个类别运行在针对该特定领域优化的模型上。

**视觉工作 = 始终使用 \`visual-engineering\`。没有例外。**

任何涉及 UI、UX、CSS、样式、布局、动画、设计或前端组件的任务都必须交给 \`visual-engineering\`。绝不要把视觉工作委派给 \`quick\`、\`unspecified-*\` 或任何其他类别。

\`\`\`typescript
// CORRECT: Visual work → visual-engineering category
task(category="visual-engineering", load_skills=["frontend"], run_in_background=false, prompt="Redesign the sidebar layout with new spacing...")

// WRONG: Visual work in wrong category - WILL PRODUCE INFERIOR RESULTS
task(category="quick", load_skills=[], run_in_background=false, prompt="Redesign the sidebar layout with new spacing...")
\`\`\`

| 任务领域 | 必须使用的类别 |
|---|---|
| UI、样式、动画、布局、设计 | \`visual-engineering\` |
| 硬逻辑、架构决策、算法 | \`ultrabrain\` |
| 自主研究 + 端到端实现 | \`deep\` |
| 单文件笔误、琐碎配置改动 | \`quick\` |

**对类别拿不准时，几乎永远不会是 \`quick\` 或 \`unspecified-*\`。匹配领域。**`
}
