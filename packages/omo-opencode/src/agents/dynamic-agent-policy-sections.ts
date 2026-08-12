import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
} from "./dynamic-agent-prompt-types"

export function buildHardBlocksSection(): string {
  const blocks = [
    "- Type error suppression (`as any`, `@ts-ignore`) - **Never**",
    "- Commit without explicit request - **Never**",
    "- Speculate about unread code - **Never**",
    "- Leave code in broken state after failures - **Never**",
    "- `background_cancel(all=true)` - **Never.** Always cancel individually by taskId.",
    "- Delivering final answer before collecting Oracle result - **Never.**",
  ]

  return `## Hard Blocks (NEVER violate)

${blocks.join("\n")}`
}

export function buildAntiPatternsSection(): string {
  const patterns = [
    "- **Type Safety**: `as any`, `@ts-ignore`, `@ts-expect-error`",
    "- **Error Handling**: Empty catch blocks `catch(e) {}`",
    '- **Testing**: Deleting failing tests to "pass"',
    "- **Search**: Firing agents for single-line typos or obvious syntax errors",
    "- **Debugging**: Shotgun debugging, random changes",
    "- **Background Tasks**: Polling `background_output` on running tasks - end response and wait for notification",
    "- **Delegation Duplication**: Delegating exploration to explore/librarian and then manually doing the same search yourself",
    "- **Oracle**: Delivering answer without collecting Oracle results",
  ]

  return `## Anti-Patterns (BLOCKING violations)

${patterns.join("\n")}`
}

export function buildToolCallFormatSection(): string {
  return `## Tool Call Format (CRITICAL)

**ALWAYS use the native tool calling mechanism. NEVER output tool calls as text.**

When you need to call a tool:
1. Use the tool call interface provided by the system
2. Do NOT write tool calls as plain text like \`assistant to=functions.XXX\`
3. Do NOT output JSON directly in your text response
4. The system handles tool call formatting automatically

**CORRECT**: Invoke the tool through the tool call interface
**WRONG**: Writing \`assistant to=functions.todowrite\` or \`json\n{...}\` as text

Your tool calls are processed automatically. Just invoke the tool - do not format the call yourself.`
}

export function buildUltraworkSection(
  agents: AvailableAgent[],
  categories: AvailableCategory[],
  skills: AvailableSkill[],
): string {
  const lines: string[] = []

  if (categories.length > 0) {
    lines.push("**Categories** (for implementation tasks):")
    for (const category of categories) {
      const shortDescription = category.description || category.name
      lines.push(`- \`${category.name}\`: ${shortDescription}`)
    }
    lines.push("")
  }

  if (skills.length > 0) {
    const builtinSkills = skills.filter((skill) => skill.location === "plugin")
    const customSkills = skills.filter((skill) => skill.location !== "plugin")

    if (builtinSkills.length > 0) {
      lines.push("**Built-in Skills** (combine with categories):")
      for (const skill of builtinSkills) {
        const shortDescription = skill.description.split(".")[0] || skill.description
        lines.push(`- \`${skill.name}\`: ${shortDescription}`)
      }
      lines.push("")
    }

    if (customSkills.length > 0) {
      lines.push("**User-Installed Skills** (HIGH PRIORITY - user installed these for their workflow):")
      for (const skill of customSkills) {
        const shortDescription = skill.description.split(".")[0] || skill.description
        lines.push(`- \`${skill.name}\`: ${shortDescription}`)
      }
      lines.push("")
    }
  }

  if (agents.length > 0) {
    const ultraworkAgentPriority = ["explore", "librarian", "plan", "oracle"]
    const sortedAgents = [...agents].sort((left, right) => {
      const leftIndex = ultraworkAgentPriority.indexOf(left.name)
      const rightIndex = ultraworkAgentPriority.indexOf(right.name)
      if (leftIndex === -1 && rightIndex === -1) {
        return 0
      }
      if (leftIndex === -1) {
        return 1
      }
      if (rightIndex === -1) {
        return -1
      }
      return leftIndex - rightIndex
    })

    lines.push("**Agents** (for specialized consultation/exploration):")
    for (const agent of sortedAgents) {
      const shortDescription =
        agent.description.length > 120
          ? `${agent.description.slice(0, 120)}...`
          : agent.description
      const suffix =
        agent.name === "explore" || agent.name === "librarian" ? " (multiple)" : ""
      lines.push(`- \`${agent.name}${suffix}\`: ${shortDescription}`)
    }
  }

  return lines.join("\n")
}

export function buildAntiDuplicationSection(): string {
  return `<Anti_Duplication>
## Anti-Duplication Rule (CRITICAL)

Once you delegate exploration to explore/librarian agents, **DO NOT perform the same search yourself**.

### What this means:

**FORBIDDEN:**
- After firing explore/librarian, manually grep/search for the same information
- Re-doing the research the agents were just tasked with
- "Just quickly checking" the same files the background agents are checking

**ALLOWED:**
- Continue with **non-overlapping work** - work that doesn't depend on the delegated research
- Work on unrelated parts of the codebase
- Preparation work (e.g., setting up files, configs) that can proceed independently

### Wait for Results Properly:

When you need the delegated results but they're not ready:

1. **End your response** - do NOT continue with work that depends on those results
2. **Wait for the completion notification** - the system will trigger your next turn
3. **Then** collect results via \`background_output(task_id="bg_...")\`
4. **Do NOT** impatiently re-search the same topics while waiting

### Why This Matters:

- **Wasted tokens**: Duplicate exploration wastes your context budget
- **Confusion**: You might contradict the agent's findings
- **Efficiency**: The whole point of delegation is parallel throughput

### Example:

\`\`\`typescript
// WRONG: After delegating, re-doing the search
task(subagent_type="explore", run_in_background=true, ...)
// Then immediately grep for the same thing yourself - FORBIDDEN

// CORRECT: Continue non-overlapping work
task(subagent_type="explore", run_in_background=true, ...)
// Work on a different, unrelated file while they search
// End your response and wait for the notification
\`\`\`
</Anti_Duplication>`
}

export function buildHardBlocksSectionZh(): string {
  const blocks = [
    "- 抑制类型错误（`as any`、`@ts-ignore`）- **绝不**",
    "- 未经明确要求就提交 - **绝不**",
    "- 臆测未读过的代码 - **绝不**",
    "- 失败后让代码处于损坏状态 - **绝不**",
    "- `background_cancel(all=true)` - **绝不。**始终按 taskId 逐个取消。",
    "- 未收集 Oracle 结果就给出最终答复 - **绝不。**",
  ]

  return `## 硬性禁止（绝不可违反）

${blocks.join("\n")}`
}

export function buildAntiPatternsSectionZh(): string {
  const patterns = [
    "- **类型安全**：`as any`、`@ts-ignore`、`@ts-expect-error`",
    "- **错误处理**：空的 catch 块 `catch(e) {}`",
    '- **测试**：删除失败的测试来"通过"',
    "- **搜索**：为单行拼写错误或明显的语法错误派发代理",
    "- **调试**：散弹式调试、随机改动",
    "- **后台任务**：轮询运行中任务的 `background_output` - 结束回复并等待通知",
    "- **委派重复**：把探索委派给 explore/librarian 后又自己手动做同样的搜索",
    "- **Oracle**：未收集 Oracle 结果就给出答复",
  ]

  return `## 反模式（阻塞性违规）

${patterns.join("\n")}`
}

export function buildToolCallFormatSectionZh(): string {
  return `## 工具调用格式（关键）

**始终使用系统原生的工具调用机制。绝不要把工具调用以文本形式输出。**

当你需要调用工具时：
1. 使用系统提供的工具调用接口
2. 不要把工具调用写成 \`assistant to=functions.XXX\` 这样的纯文本
3. 不要在文本回复中直接输出 JSON
4. 系统会自动处理工具调用的格式

**正确**：通过工具调用接口调用工具
**错误**：把 \`assistant to=functions.todowrite\` 或 \`json\n{...}\` 写成文本

你的工具调用会被自动处理。直接调用工具即可 - 不要自己格式化调用。`
}

export function buildUltraworkSectionZh(
  agents: AvailableAgent[],
  categories: AvailableCategory[],
  skills: AvailableSkill[],
): string {
  const lines: string[] = []

  if (categories.length > 0) {
    lines.push("**类别**（用于实现任务）：")
    for (const category of categories) {
      const shortDescription = category.description || category.name
      lines.push(`- \`${category.name}\`: ${shortDescription}`)
    }
    lines.push("")
  }

  if (skills.length > 0) {
    const builtinSkills = skills.filter((skill) => skill.location === "plugin")
    const customSkills = skills.filter((skill) => skill.location !== "plugin")

    if (builtinSkills.length > 0) {
      lines.push("**内置技能**（与类别结合使用）：")
      for (const skill of builtinSkills) {
        const shortDescription = skill.description.split(".")[0] || skill.description
        lines.push(`- \`${skill.name}\`: ${shortDescription}`)
      }
      lines.push("")
    }

    if (customSkills.length > 0) {
      lines.push("**用户安装的技能**（高优先级 - 用户为他们的工作流安装了这些技能）：")
      for (const skill of customSkills) {
        const shortDescription = skill.description.split(".")[0] || skill.description
        lines.push(`- \`${skill.name}\`: ${shortDescription}`)
      }
      lines.push("")
    }
  }

  if (agents.length > 0) {
    const ultraworkAgentPriority = ["explore", "librarian", "plan", "oracle"]
    const sortedAgents = [...agents].sort((left, right) => {
      const leftIndex = ultraworkAgentPriority.indexOf(left.name)
      const rightIndex = ultraworkAgentPriority.indexOf(right.name)
      if (leftIndex === -1 && rightIndex === -1) {
        return 0
      }
      if (leftIndex === -1) {
        return 1
      }
      if (rightIndex === -1) {
        return -1
      }
      return leftIndex - rightIndex
    })

    lines.push("**代理**（用于专业咨询/探索）：")
    for (const agent of sortedAgents) {
      const shortDescription =
        agent.description.length > 120
          ? `${agent.description.slice(0, 120)}...`
          : agent.description
      const suffix =
        agent.name === "explore" || agent.name === "librarian" ? "（可多个）" : ""
      lines.push(`- \`${agent.name}${suffix}\`: ${shortDescription}`)
    }
  }

  return lines.join("\n")
}

export function buildAntiDuplicationSectionZh(): string {
  return `<Anti_Duplication>
## 反重复规则（关键）

一旦你把探索委派给 explore/librarian 代理，**就不要自己执行同样的搜索**。

### 这意味着什么：

**禁止：**
- 派发 explore/librarian 后，再手动 grep/搜索同样的信息
- 重做刚刚委派给代理的研究
- "只是快速看一下"后台代理正在检查的同样文件

**允许：**
- 继续**不重叠的工作** - 不依赖已委派研究的工作
- 处理代码库中无关的部分
- 可以独立进行的准备工作（例如搭建文件、配置）

### 正确等待结果：

当你需要委派的结果但尚未就绪时：

1. **结束你的回复** - 不要继续做依赖这些结果的工作
2. **等待完成通知** - 系统会触发你的下一轮
3. **然后**通过 \`background_output(task_id="bg_...")\` 收集结果
4. 等待期间**不要**急躁地重新搜索相同主题

### 为什么这很重要：

- **浪费 token**：重复探索浪费你的上下文预算
- **混乱**：你可能与代理的发现相矛盾
- **效率**：委派的意义在于并行吞吐

### 示例：

\`\`\`typescript
// WRONG: After delegating, re-doing the search
task(subagent_type="explore", run_in_background=true, ...)
// Then immediately grep for the same thing yourself - FORBIDDEN

// CORRECT: Continue non-overlapping work
task(subagent_type="explore", run_in_background=true, ...)
// Work on a different, unrelated file while they search
// End your response and wait for the notification
\`\`\`
</Anti_Duplication>`
}
