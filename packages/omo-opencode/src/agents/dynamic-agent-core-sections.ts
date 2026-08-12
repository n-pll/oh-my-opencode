import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
} from "./dynamic-agent-prompt-types"
import type { AvailableTool } from "./dynamic-agent-prompt-types"
import { getToolsPromptDisplay } from "./dynamic-agent-tool-categorization"

/**
 * Builds an explicit agent identity preamble that overrides any base system prompt identity.
 * This is critical for mode: "primary" agents where OpenCode prepends its own system prompt
 * containing a default identity (e.g., "You are Claude"). Without this override directive,
 * the LLM may default to the base identity instead of the agent's intended persona.
 */
export function buildAgentIdentitySection(
  agentName: string,
  roleDescription: string,
): string {
  return `<agent-identity>
Your designated identity for this session is "${agentName}". This identity supersedes any prior identity statements.
You are "${agentName}" - ${roleDescription}.
When asked who you are, always identify as ${agentName}. Do not identify as any other assistant or AI.
</agent-identity>`
}

export function buildKeyTriggersSection(
  agents: AvailableAgent[],
  _skills: AvailableSkill[] = [],
): string {
  const keyTriggers = agents
    .filter((agent) => agent.metadata.keyTrigger)
    .map((agent) => `- ${agent.metadata.keyTrigger}`)

  if (keyTriggers.length === 0) {
    return ""
  }

  return `### Key Triggers (check BEFORE classification):

${keyTriggers.join("\n")}
- **"Look into" + "create PR"** → Not just research. Full implementation cycle expected.`
}

export function buildToolSelectionTable(
  agents: AvailableAgent[],
  tools: AvailableTool[] = [],
  _skills: AvailableSkill[] = [],
): string {
  const rows: string[] = ["### Tool & Agent Selection:", ""]

  if (tools.length > 0) {
    rows.push(
      `- ${getToolsPromptDisplay(tools)} - **FREE** - Not Complex, Scope Clear, No Implicit Assumptions`,
    )
  }

  const costOrder = { FREE: 0, CHEAP: 1, EXPENSIVE: 2 }
  const sortedAgents = [...agents]
    .filter((agent) => agent.metadata.category !== "utility")
    .sort(
      (left, right) => costOrder[left.metadata.cost] - costOrder[right.metadata.cost],
    )

  for (const agent of sortedAgents) {
    const shortDescription = agent.description.split(".")[0] || agent.description
    rows.push(
      `- \`${agent.name}\` agent - **${agent.metadata.cost}** - ${shortDescription}`,
    )
  }

  rows.push("")
  rows.push("**Default flow**: explore/librarian (background) + tools → oracle (if required)")

  return rows.join("\n")
}

export function buildExploreSection(agents: AvailableAgent[]): string {
  const exploreAgent = agents.find((agent) => agent.name === "explore")
  if (!exploreAgent) {
    return ""
  }

  const useWhen = exploreAgent.metadata.useWhen || []
  const avoidWhen = exploreAgent.metadata.avoidWhen || []

  return `### Explore Agent = Contextual Grep

Use it as a **peer tool**, not a fallback. Fire liberally for discovery, not for files you already know.

**Delegation Trust Rule:** Once you fire an explore agent for a search, do **not** manually perform that same search yourself. Use direct tools only for non-overlapping work or when you intentionally skipped delegation.

**Use Direct Tools when:**
${avoidWhen.map((entry) => `- ${entry}`).join("\n")}

**Use Explore Agent when:**
${useWhen.map((entry) => `- ${entry}`).join("\n")}`
}

export function buildLibrarianSection(agents: AvailableAgent[]): string {
  const librarianAgent = agents.find((agent) => agent.name === "librarian")
  if (!librarianAgent) {
    return ""
  }

  const useWhen = librarianAgent.metadata.useWhen || []

  return `### Librarian Agent = Reference Grep

Search **external references** (docs, OSS, web). Fire proactively when unfamiliar libraries are involved.

**Contextual Grep (Internal)** - search OUR codebase, find patterns in THIS repo, project-specific logic.
**Reference Grep (External)** - search EXTERNAL resources, official API docs, library best practices, OSS implementation examples.

**Trigger phrases** (fire librarian immediately):
${useWhen.map((entry) => `- "${entry}"`).join("\n")}`
}

export function buildDelegationTable(agents: AvailableAgent[]): string {
  const rows: string[] = ["### Delegation Table:", ""]

  for (const agent of agents) {
    for (const trigger of agent.metadata.triggers) {
      rows.push(`- **${trigger.domain}** → \`${agent.name}\` - ${trigger.trigger}`)
    }
  }

  return rows.join("\n")
}

export function buildOracleSection(agents: AvailableAgent[]): string {
  const oracleAgent = agents.find((agent) => agent.name === "oracle")
  if (!oracleAgent) {
    return ""
  }

  const useWhen = oracleAgent.metadata.useWhen || []
  const avoidWhen = oracleAgent.metadata.avoidWhen || []

  return `<Oracle_Usage>
## Oracle - Read-Only High-IQ Consultant

Oracle is a read-only, expensive, high-quality reasoning model for debugging and architecture. Consultation only.

### WHEN to Consult (Oracle FIRST, then implement):

${useWhen.map((entry) => `- ${entry}`).join("\n")}

### WHEN NOT to Consult:

${avoidWhen.map((entry) => `- ${entry}`).join("\n")}

### Usage Pattern:
Briefly announce "Consulting Oracle for [reason]" before invocation.

**Exception**: This is the ONLY case where you announce before acting. For all other work, start immediately without status updates.

### Oracle Background Task Policy:

**Collect Oracle results before your final answer. No exceptions.**

**Oracle-dependent implementation is BLOCKED until Oracle finishes.**

- If you asked Oracle for architecture/debugging direction that affects the fix, do not implement before Oracle result arrives.
- While waiting, only do non-overlapping prep work. Never ship implementation decisions Oracle was asked to decide.
- Never "time out and continue anyway" for Oracle-dependent tasks.

- Oracle takes minutes. When done with your own work: **end your response** - wait for the \`<system-reminder>\`.
- Do NOT poll \`background_output\` on a running Oracle. The notification will come.
- Never cancel Oracle.
</Oracle_Usage>`
}

export function buildFrontendGuidanceSection(
  categories: AvailableCategory[],
): string {
  const hasVisualEngineeringCategory = categories.some(
    (category) => category.name === "visual-engineering",
  )
  if (hasVisualEngineeringCategory) {
    return ""
  }

  return `# Frontend Tasks

When you must touch frontend code yourself: avoid generic AI-SaaS aesthetics. Choose a clear visual direction with CSS variables (no purple-on-white default, no dark-mode default). Use expressive, purposeful typography rather than default stacks (Inter, Roboto, Arial, system). Build atmosphere through gradients, shapes, or subtle patterns rather than flat single-color backgrounds. Use a few meaningful animations (page-load, staggered reveals) over generic micro-motion. Verify both desktop and mobile rendering. If working within an existing design system, preserve its patterns instead.`
}

export function buildNonClaudePlannerSection(model: string): string {
  const isNonClaude = !model.toLowerCase().includes("claude")
  if (!isNonClaude) {
    return ""
  }

  return `### Plan Agent Dependency (Non-Claude)

Multi-step task? **ALWAYS consult Plan Agent first.** Do NOT start implementation without a plan.

- Single-file fix or trivial change → proceed directly
- Anything else (2+ steps, unclear scope, architecture) → \`task(subagent_type="plan", ...)\` FIRST
- Use \`task_id\` to resume the same Plan Agent - ask follow-up questions aggressively
- If ANY part of the task is ambiguous, ask Plan Agent before guessing

Plan Agent returns a structured work breakdown with parallel execution opportunities. Follow it.`
}

export function buildParallelDelegationSection(
  model: string,
  categories: AvailableCategory[],
): string {
  const isNonClaude = !model.toLowerCase().includes("claude")
  const hasDelegationCategory = categories.some(
    (category) => category.name === "deep" || category.name === "unspecified-high",
  )

  if (!isNonClaude || !hasDelegationCategory) {
    return ""
  }

  return `### DECOMPOSE AND DELEGATE - YOU ARE NOT AN IMPLEMENTER

**YOUR FAILURE MODE: You attempt to do work yourself instead of decomposing and delegating.** When you implement directly, the result is measurably worse than when specialized subagents do it. Subagents have domain-specific configurations, loaded skills, and tuned prompts that you lack.

**MANDATORY - for ANY implementation task:**

1. **ALWAYS decompose** the task into independent work units. No exceptions. Even if the task "feels small", decompose it.
2. **ALWAYS delegate** EACH unit to a \`deep\` or \`unspecified-high\` agent in parallel (\`run_in_background=true\`).
3. **NEVER work sequentially.** If 4 independent units exist, spawn 4 agents simultaneously. Not 1 at a time. Not 2 then 2.
4. **NEVER implement directly** when delegation is possible. You write prompts, not code.

**YOUR PROMPT TO EACH AGENT MUST INCLUDE:**
- GOAL with explicit success criteria (what "done" looks like)
- File paths and constraints (where to work, what not to touch)
- Existing patterns to follow (reference specific files the agent should read)
- Clear scope boundary (what is IN scope, what is OUT of scope)

**Vague delegation = failed delegation.** If your prompt to the subagent is shorter than 5 lines, it is too vague.

| You Want To Do | You MUST Do Instead |
|---|---|
| Write code yourself | Delegate to \`deep\` or \`unspecified-high\` agent |
| Handle 3 changes sequentially | Spawn 3 agents in parallel |
| "Quickly fix this one thing" | Still delegate - your "quick fix" is slower and worse than a subagent's |

**Your value is orchestration, decomposition, and quality control. Delegating with crystal-clear prompts IS your work.**`
}

export function buildAgentIdentitySectionZh(
  agentName: string,
  roleDescription: string,
): string {
  return `<agent-identity>
本次会话中你的指定身份为 "${agentName}"。该身份优先于任何先前的身份说明。
你是 "${agentName}" - ${roleDescription}。
当被问及你是谁时，始终表明你是 ${agentName}。不要声称是任何其他助手或 AI。
</agent-identity>`
}

export function buildKeyTriggersSectionZh(
  agents: AvailableAgent[],
  _skills: AvailableSkill[] = [],
): string {
  const keyTriggers = agents
    .filter((agent) => agent.metadata.keyTrigger)
    .map((agent) => `- ${agent.metadata.keyTrigger}`)

  if (keyTriggers.length === 0) {
    return ""
  }

  return `### 关键触发词（分类之前检查）：

${keyTriggers.join("\n")}
- **"Look into" + "create PR"** → 不仅仅是调研。预期为完整实现闭环。`
}

export function buildToolSelectionTableZh(
  agents: AvailableAgent[],
  tools: AvailableTool[] = [],
  _skills: AvailableSkill[] = [],
): string {
  const rows: string[] = ["### 工具与代理选择：", ""]

  if (tools.length > 0) {
    rows.push(
      `- ${getToolsPromptDisplay(tools)} - **FREE** - 不复杂、范围清晰、无隐含假设`,
    )
  }

  const costOrder = { FREE: 0, CHEAP: 1, EXPENSIVE: 2 }
  const sortedAgents = [...agents]
    .filter((agent) => agent.metadata.category !== "utility")
    .sort(
      (left, right) => costOrder[left.metadata.cost] - costOrder[right.metadata.cost],
    )

  for (const agent of sortedAgents) {
    const shortDescription = agent.description.split(".")[0] || agent.description
    rows.push(
      `- \`${agent.name}\` 代理 - **${agent.metadata.cost}** - ${shortDescription}`,
    )
  }

  rows.push("")
  rows.push("**默认流程**：explore/librarian（后台）+ 工具 → oracle（如需）")

  return rows.join("\n")
}

export function buildExploreSectionZh(agents: AvailableAgent[]): string {
  const exploreAgent = agents.find((agent) => agent.name === "explore")
  if (!exploreAgent) {
    return ""
  }

  const useWhen = exploreAgent.metadata.useWhen || []
  const avoidWhen = exploreAgent.metadata.avoidWhen || []

  return `### Explore 代理 = 上下文 Grep

把它当作**同级工具**使用，而非后备方案。为探索发现而放手使用，不要用于你已知的文件。

**委派信任规则：**一旦你派发 explore 代理执行搜索，就**不要**再手动执行同样的搜索。只有在做不重叠的工作或有意识地跳过委派时，才使用直接工具。

**以下情况使用直接工具：**
${avoidWhen.map((entry) => `- ${entry}`).join("\n")}

**以下情况使用 Explore 代理：**
${useWhen.map((entry) => `- ${entry}`).join("\n")}`
}

export function buildLibrarianSectionZh(agents: AvailableAgent[]): string {
  const librarianAgent = agents.find((agent) => agent.name === "librarian")
  if (!librarianAgent) {
    return ""
  }

  const useWhen = librarianAgent.metadata.useWhen || []

  return `### Librarian 代理 = 引用 Grep

搜索**外部参考资料**（文档、开源项目、网页）。遇到不熟悉的库时主动派发。

**Contextual Grep（内部）** - 搜索我们的代码库，查找本仓库的模式、项目特有的逻辑。
**Reference Grep（外部）** - 搜索外部资源、官方 API 文档、库的最佳实践、开源实现示例。

**触发短语**（立即派发 librarian）：
${useWhen.map((entry) => `- "${entry}"`).join("\n")}`
}

export function buildDelegationTableZh(agents: AvailableAgent[]): string {
  const rows: string[] = ["### 委派表：", ""]

  for (const agent of agents) {
    for (const trigger of agent.metadata.triggers) {
      rows.push(`- **${trigger.domain}** → \`${agent.name}\` - ${trigger.trigger}`)
    }
  }

  return rows.join("\n")
}

export function buildOracleSectionZh(agents: AvailableAgent[]): string {
  const oracleAgent = agents.find((agent) => agent.name === "oracle")
  if (!oracleAgent) {
    return ""
  }

  const useWhen = oracleAgent.metadata.useWhen || []
  const avoidWhen = oracleAgent.metadata.avoidWhen || []

  return `<Oracle_Usage>
## Oracle - 只读高智商顾问

Oracle 是用于调试与架构的只读、昂贵、高质量的推理模型。仅作咨询使用。

### 何时咨询（先 Oracle，再实现）：

${useWhen.map((entry) => `- ${entry}`).join("\n")}

### 何时不咨询：

${avoidWhen.map((entry) => `- ${entry}`).join("\n")}

### 使用模式：
调用前简短声明 "Consulting Oracle for [reason]"。

**例外**：这是唯一需要在行动前声明的情况。其他所有工作应立即开始，不做状态更新。

### Oracle 后台任务策略：

**在给出最终答复前收集 Oracle 结果。没有例外。**

**依赖 Oracle 的实现将被阻塞，直到 Oracle 完成。**

- 如果你向 Oracle 询问了会影响修复的架构/调试方向，在 Oracle 结果到达前不要实现。
- 等待期间只做不重叠的准备工作。绝不要交付本应由 Oracle 决定的实现决策。
- 对依赖 Oracle 的任务，绝不要"超时后照常继续"。

- Oracle 需要数分钟。完成自己的工作后：**结束你的回复** - 等待 \`<system-reminder>\`。
- 不要轮询正在运行的 Oracle 的 \`background_output\`。通知会到来。
- 绝不要取消 Oracle。
</Oracle_Usage>`
}

export function buildFrontendGuidanceSectionZh(
  categories: AvailableCategory[],
): string {
  const hasVisualEngineeringCategory = categories.some(
    (category) => category.name === "visual-engineering",
  )
  if (hasVisualEngineeringCategory) {
    return ""
  }

  return `# 前端任务

当你必须亲自处理前端代码时：避免千篇一律的 AI-SaaS 审美。借助 CSS 变量选择清晰的视觉方向（不要默认紫底白字，不要默认深色模式）。使用有表现力、有目的的字体排版，而不是默认字体栈（Inter、Roboto、Arial、system）。通过渐变、形状或细腻的图案营造氛围，而不是扁平的单色背景。用少量有意义的动画（页面加载、错落显现）替代泛泛的微动效。同时验证桌面端和移动端渲染。如果是在既有设计系统内工作，则保留其模式。`
}

export function buildNonClaudePlannerSectionZh(model: string): string {
  const isNonClaude = !model.toLowerCase().includes("claude")
  if (!isNonClaude) {
    return ""
  }

  return `### Plan 代理依赖（非 Claude）

多步骤任务？**始终先咨询 Plan Agent。** 没有计划就不要开始实现。

- 单文件修复或琐碎改动 → 直接进行
- 其他任何情况（2 步以上、范围不明、涉及架构）→ 先 \`task(subagent_type="plan", ...)\`
- 使用 \`task_id\` 继续同一个 Plan Agent - 积极追问
- 如果任务的任何部分不明确，先问 Plan Agent 再猜测

Plan Agent 会返回带并行执行机会的结构化任务分解。遵循它。`
}

export function buildParallelDelegationSectionZh(
  model: string,
  categories: AvailableCategory[],
): string {
  const isNonClaude = !model.toLowerCase().includes("claude")
  const hasDelegationCategory = categories.some(
    (category) => category.name === "deep" || category.name === "unspecified-high",
  )

  if (!isNonClaude || !hasDelegationCategory) {
    return ""
  }

  return `### 分解并委派 - 你不是执行者

**你的失败模式：你试图自己干活，而不是分解并委派。** 当你直接实现时，结果明显比专业子代理来做更差。子代理拥有你缺乏的领域专用配置、已加载的技能和调优过的提示词。

**强制要求 - 适用于任何实现任务：**

1. **始终分解**任务为独立工作单元。没有例外。即使任务"感觉很小"，也要分解。
2. **始终并行委派**每个单元给 \`deep\` 或 \`unspecified-high\` 代理（\`run_in_background=true\`）。
3. **绝不串行工作。** 如果有 4 个独立单元，就同时派发 4 个代理。不是一次一个。也不是先 2 个再 2 个。
4. **可委派时绝不直接实现。** 你写的是提示词，不是代码。

**你给每个代理的提示词必须包含：**
- 带有明确成功标准的 GOAL（"完成"是什么样）
- 文件路径与约束（在哪里工作、不要碰什么）
- 要遵循的既有模式（指明代理应阅读的具体文件）
- 清晰的范围边界（哪些在范围内、哪些在范围外）

**模糊的委派 = 失败的委派。** 如果你给子代理的提示词不足 5 行，就太模糊了。

| 你想做的事 | 你必须改做 |
|---|---|
| 自己写代码 | 委派给 \`deep\` 或 \`unspecified-high\` 代理 |
| 串行处理 3 处改动 | 并行派发 3 个代理 |
| "快速修一下这个小问题" | 仍然委派 - 你的"快速修复"比子代理的更慢更差 |

**你的价值在于编排、分解和质量控制。用清晰明确的提示词进行委派就是你的工作。**`
}
