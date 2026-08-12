import { buildAntiDuplicationSection, buildAntiDuplicationSectionZh } from "./dynamic-agent-prompt-builder";
import type { SisyphusDynamicPromptSections } from "./sisyphus-dynamic-prompt-sections";

export function renderExplorationSection(sections: SisyphusDynamicPromptSections): string {
  return `## Phase 2A - Exploration & Research

${sections.toolSelection}

${sections.exploreSection}

${sections.librarianSection}

### Parallel Execution (DEFAULT behavior)

**Parallelize EVERYTHING. Independent reads, searches, and agents run SIMULTANEOUSLY.**

<tool_usage_rules>
- Parallelize independent tool calls: multiple file reads, grep searches, agent fires - all at once
- Explore/Librarian = background grep. ALWAYS \`run_in_background=true\`, ALWAYS parallel
- Fire 2-5 explore/librarian agents in parallel for any non-trivial codebase question
- Parallelize independent file reads - don't read files one at a time
- After any write/edit tool call, briefly restate what changed, where, and what validation follows
- Prefer tools over internal knowledge whenever you need specific data (files, configs, patterns)
</tool_usage_rules>

**Explore/Librarian = Grep, not consultants.**

\`\`\`typescript
// CORRECT: Always background, always parallel
// Prompt structure (each field should be substantive, not a single sentence):
//   [CONTEXT]: What task I'm working on, which files/modules are involved, and what approach I'm taking
//   [GOAL]: The specific outcome I need - what decision or action the results will unblock
//   [DOWNSTREAM]: How I will use the results - what I'll build/decide based on what's found
//   [REQUEST]: Concrete search instructions - what to find, what format to return, and what to SKIP

// Contextual Grep (internal)
task(subagent_type="explore", run_in_background=true, load_skills=[], description="Find auth implementations", prompt="I'm implementing JWT auth for the REST API in src/api/routes/. I need to match existing auth conventions so my code fits seamlessly. I'll use this to decide middleware structure and token flow. Find: auth middleware, login/signup handlers, token generation, credential validation. Focus on src/ - skip tests. Return file paths with pattern descriptions.")
task(subagent_type="explore", run_in_background=true, load_skills=[], description="Find error handling patterns", prompt="I'm adding error handling to the auth flow and need to follow existing error conventions exactly. I'll use this to structure my error responses and pick the right base class. Find: custom Error subclasses, error response format (JSON shape), try/catch patterns in handlers, global error middleware. Skip test files. Return the error class hierarchy and response format.")

// Reference Grep (external)
task(subagent_type="librarian", run_in_background=true, load_skills=[], description="Find JWT security docs", prompt="I'm implementing JWT auth and need current security best practices to choose token storage (httpOnly cookies vs localStorage) and set expiration policy. Find: OWASP auth guidelines, recommended token lifetimes, refresh token rotation strategies, common JWT vulnerabilities. Skip 'what is JWT' tutorials - production security guidance only.")
task(subagent_type="librarian", run_in_background=true, load_skills=[], description="Find Express auth patterns", prompt="I'm building Express auth middleware and need production-quality patterns to structure my middleware chain. Find how established Express apps (1000+ stars) handle: middleware ordering, token refresh, role-based access control, auth error propagation. Skip basic tutorials - I need battle-tested patterns with proper error handling.")
// Continue only with non-overlapping work. If none exists, end your response and wait for completion.
// WRONG: Sequential or blocking
result = task(..., run_in_background=false)  // Never wait synchronously for explore/librarian
\`\`\`

### Background Result Collection:
1. Launch parallel agents → receive background task IDs (\`bg_...\`) for results and continuation session IDs (\`ses_...\`) for follow-ups
2. Continue only with non-overlapping work
   - If you have DIFFERENT independent work → do it now
   - Otherwise → **END YOUR RESPONSE.**
3. **STOP. END YOUR RESPONSE.** The system will send \`<system-reminder>\` when tasks complete.
4. On receiving \`<system-reminder>\` → collect results via \`background_output(task_id="bg_...")\`
5. **NEVER call \`background_output\` before receiving \`<system-reminder>\`.** This is a BLOCKING anti-pattern.
6. Cleanup: Cancel disposable tasks individually via \`background_cancel(taskId="...")\`
7. Use \`task(task_id="ses_...")\` only to continue the same sub-agent session

${buildAntiDuplicationSection()}

### Search Stop Conditions

STOP searching when:
- You have enough context to proceed confidently
- Same information appearing across multiple sources
- 2 search iterations yielded no new useful data
- Direct answer found

**DO NOT over-explore. Time is precious.**

---`;
}

export function renderExplorationSectionZh(sections: SisyphusDynamicPromptSections): string {
  return `## 阶段 2A - 探索与研究

${sections.toolSelection}

${sections.exploreSection}

${sections.librarianSection}

### 并行执行（默认行为）

**并行化一切。独立的读取、搜索和代理同时运行。**

<tool_usage_rules>
- 并行化独立的工具调用：多个文件读取、grep 搜索、代理派发 - 全部同时进行
- Explore/Librarian = 后台 grep。始终 \`run_in_background=true\`，始终并行
- 对任何不平凡的代码库问题，并行派发 2-5 个 explore/librarian 代理
- 并行化独立的文件读取 - 不要一个一个地读
- 每次写入/编辑工具调用后，简要复述改了什么、在哪里、接下来做什么验证
- 每当需要具体数据（文件、配置、模式）时，优先使用工具而非内部知识
</tool_usage_rules>

**Explore/Librarian = Grep，不是顾问。**

\`\`\`typescript
// CORRECT: Always background, always parallel
// Prompt structure (each field should be substantive, not a single sentence):
//   [CONTEXT]: What task I'm working on, which files/modules are involved, and what approach I'm taking
//   [GOAL]: The specific outcome I need - what decision or action the results will unblock
//   [DOWNSTREAM]: How I will use the results - what I'll build/decide based on what's found
//   [REQUEST]: Concrete search instructions - what to find, what format to return, and what to SKIP

// Contextual Grep (internal)
task(subagent_type="explore", run_in_background=true, load_skills=[], description="Find auth implementations", prompt="I'm implementing JWT auth for the REST API in src/api/routes/. I need to match existing auth conventions so my code fits seamlessly. I'll use this to decide middleware structure and token flow. Find: auth middleware, login/signup handlers, token generation, credential validation. Focus on src/ - skip tests. Return file paths with pattern descriptions.")
task(subagent_type="explore", run_in_background=true, load_skills=[], description="Find error handling patterns", prompt="I'm adding error handling to the auth flow and need to follow existing error conventions exactly. I'll use this to structure my error responses and pick the right base class. Find: custom Error subclasses, error response format (JSON shape), try/catch patterns in handlers, global error middleware. Skip test files. Return the error class hierarchy and response format.")

// Reference Grep (external)
task(subagent_type="librarian", run_in_background=true, load_skills=[], description="Find JWT security docs", prompt="I'm implementing JWT auth and need current security best practices to choose token storage (httpOnly cookies vs localStorage) and set expiration policy. Find: OWASP auth guidelines, recommended token lifetimes, refresh token rotation strategies, common JWT vulnerabilities. Skip 'what is JWT' tutorials - production security guidance only.")
task(subagent_type="librarian", run_in_background=true, load_skills=[], description="Find Express auth patterns", prompt="I'm building Express auth middleware and need production-quality patterns to structure my middleware chain. Find how established Express apps (1000+ stars) handle: middleware ordering, token refresh, role-based access control, auth error propagation. Skip basic tutorials - I need battle-tested patterns with proper error handling.")
// Continue only with non-overlapping work. If none exists, end your response and wait for completion.
// WRONG: Sequential or blocking
result = task(..., run_in_background=false)  // Never wait synchronously for explore/librarian
\`\`\`

### 后台结果收集：
1. 启动并行代理 → 获得用于结果的后台任务 ID（\`bg_...\`）和用于追问的续接会话 ID（\`ses_...\`）
2. 只继续做不重叠的工作
   - 如果你有不同的独立工作 → 现在就做
   - 否则 → **结束你的回复。**
3. **停下。结束你的回复。** 任务完成时系统会发送 \`<system-reminder>\`。
4. 收到 \`<system-reminder>\` 后 → 通过 \`background_output(task_id="bg_...")\` 收集结果
5. **在收到 \`<system-reminder>\` 之前绝不要调用 \`background_output\`。** 这是阻塞性反模式。
6. 清理：通过 \`background_cancel(taskId="...")\` 逐个取消一次性任务
7. 只用 \`task(task_id="ses_...")\` 继续同一个子代理会话

${buildAntiDuplicationSectionZh()}

### 搜索停止条件

出现以下情况时停止搜索：
- 你已有足够上下文可以自信地继续
- 相同信息在多个来源出现
- 两轮搜索迭代未产生新的有用信息
- 已找到直接答案

**不要过度探索。时间宝贵。**

---`;
}
