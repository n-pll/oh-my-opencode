export const HANDOFF_TEMPLATE = `# Handoff Command

## Purpose

Use /handoff when:
- The current session context is getting too long and quality is degrading
- You want to start fresh while preserving essential context from this session
- The context window is approaching capacity

This creates a detailed context summary that can be used to continue work in a new session.

---

# PHASE 0: VALIDATE REQUEST

Before proceeding, confirm:
- [ ] There is meaningful work or context in this session to preserve
- [ ] The user wants to create a handoff summary (not just asking about it)

If the session is nearly empty or has no meaningful context, inform the user there is nothing substantial to hand off.

---

# PHASE 0.5: SESSION READ FIRST (MANDATORY FIRST DATA STEP)

Call session_read({ session_id: "$SESSION_ID" }) BEFORE any other context gathering step. The output of session_read is the only authoritative source for what the user originally asked. Do not reconstruct memory of the first request; long sessions and post-compact sessions truncate or summarize early messages, so in-context memory is unreliable.

From the session_read output:

1. Find the first user message in the returned session history (the earliest entry with role "user").
2. Copy the text of that first user message verbatim into a working note. You will later place it into the USER REQUESTS (AS-IS) section unchanged.
3. If the user has sent multiple distinct top-level requests in the session, also collect each subsequent verbatim user message that is a new top-level ask (not a follow-up clarification).

Rules:
- Do not reconstruct user requests from memory. Always quote from session_read output.
- Do not paraphrase, summarize, or "tidy up" the user's wording.
- Do not skip session_read even if you feel you remember the first user message.
- If session_read fails or returns no user messages, state that explicitly in the USER REQUESTS (AS-IS) section rather than guessing.

---

# PHASE 1: GATHER PROGRAMMATIC CONTEXT

Execute these tools to gather concrete data:

1. session_read({ session_id: "$SESSION_ID" }) - full session history (already executed in PHASE 0.5; reuse its output here)
2. todoread() - current task progress
3. Bash({ command: "git diff --stat HEAD~10..HEAD" }) - recent file changes
4. Bash({ command: "git status --porcelain" }) - uncommitted changes

Suggested execution order:

\`\`\`
session_read({ session_id: "$SESSION_ID" })  # already called in PHASE 0.5
todoread()
Bash({ command: "git diff --stat HEAD~10..HEAD" })
Bash({ command: "git status --porcelain" })
\`\`\`

Analyze the gathered outputs to understand:
- What work was completed
- What tasks remain incomplete (include todo state)
- What decisions were made
- What files were modified or discussed (include git diff/stat + status)
- What patterns, constraints, or preferences were established

USER REQUESTS were already captured verbatim from session_read in PHASE 0.5; do not re-derive them here.

---

# PHASE 2: EXTRACT CONTEXT

Write the context summary from first person perspective ("I did...", "I told you...").

Focus on:
- Capabilities and behavior, not file-by-file implementation details
- What matters for continuing the work
- Avoiding excessive implementation details (variable names, storage keys, constants) unless critical
- USER REQUESTS (AS-IS) must come from the PHASE 0.5 session_read extraction, copied verbatim (do not paraphrase, do not reconstruct from memory)
- EXPLICIT CONSTRAINTS must be verbatim only (do not invent)

Questions to consider when extracting:
- What did I just do or implement?
- What instructions did I already give which are still relevant (e.g. follow patterns in the codebase)?
- What files did I tell you are important or that I am working on?
- Did I provide a plan or spec that should be included?
- What did I already tell you that is important (libraries, patterns, constraints, preferences)?
- What important technical details did I discover (APIs, methods, patterns)?
- What caveats, limitations, or open questions did I find?

---

# PHASE 3: FORMAT OUTPUT

Generate a handoff summary using this exact format:

\`\`\`
HANDOFF CONTEXT
===============

USER REQUESTS (AS-IS)
---------------------
- [Exact verbatim user requests - NOT paraphrased]

GOAL
----
[One sentence describing what should be done next]

WORK COMPLETED
--------------
- [First person bullet points of what was done]
- [Include specific file paths when relevant]
- [Note key implementation decisions]

CURRENT STATE
-------------
- [Current state of the codebase or task]
- [Build/test status if applicable]
- [Any environment or configuration state]

PENDING TASKS
-------------
- [Tasks that were planned but not completed]
- [Next logical steps to take]
- [Any blockers or issues encountered]
- [Include current todo state from todoread()]

KEY FILES
---------
- [path/to/file1] - [brief role description]
- [path/to/file2] - [brief role description]
(Maximum 10 files, prioritized by importance)
- (Include files from git diff/stat and git status)

IMPORTANT DECISIONS
-------------------
- [Technical decisions that were made and why]
- [Trade-offs that were considered]
- [Patterns or conventions established]

EXPLICIT CONSTRAINTS
--------------------
- [Verbatim constraints only - from user or existing AGENTS.md]
- If none, write: None

CONTEXT FOR CONTINUATION
------------------------
- [What the next session needs to know to continue]
- [Warnings or gotchas to be aware of]
- [References to documentation if relevant]
\`\`\`

Rules for the summary:
- Plain text with bullets
- No markdown headers with # (use the format above with dashes)
- No bold, italic, or code fences within content
- Use workspace-relative paths for files
- Keep it focused - only include what matters for continuation
- Pick an appropriate length based on complexity
- USER REQUESTS (AS-IS) and EXPLICIT CONSTRAINTS must be verbatim only

---

# PHASE 4: PROVIDE INSTRUCTIONS

After generating the summary, instruct the user:

\`\`\`
---

TO CONTINUE IN A NEW SESSION:

1. Press 'n' in OpenCode TUI to open a new session, or run 'opencode' in a new terminal
2. Paste the HANDOFF CONTEXT above as your first message
3. Add your request: "Continue from the handoff context above. [Your next task]"

The new session will have all context needed to continue seamlessly.
\`\`\`

---

# IMPORTANT CONSTRAINTS

- DO NOT attempt to programmatically create new sessions (no API available to agents)
- DO provide a self-contained summary that works without access to this session
- DO include workspace-relative file paths
- DO NOT include sensitive information (API keys, credentials, secrets)
- DO NOT exceed 10 files in the KEY FILES section
- DO keep the GOAL section to a single sentence or short paragraph

---

# EXECUTE NOW

Begin by gathering programmatic context, then synthesize the handoff summary.
`

export const HANDOFF_TEMPLATE_ZH = `# Handoff 命令

## 用途

在以下情况下使用 /handoff:
- 当前会话上下文过长，质量正在下降
- 你希望重新开始，同时保留本会话中的关键上下文
- 上下文窗口接近容量上限

这会生成一份详细的上下文摘要，可用于在新会话中继续工作。

---

# 阶段 0: 校验请求

开始之前，请确认:
- [ ] 本会话中存在值得保留的有意义的工作或上下文
- [ ] 用户确实希望创建交接摘要（而不只是在询问此事）

如果会话几乎为空或没有有意义的上下文，请告知用户没有实质内容可交接。

---

# 阶段 0.5: 先读取会话（强制性的第一步数据操作）

在任何其他上下文收集步骤之前，先调用 session_read({ session_id: "$SESSION_ID" })。session_read 的输出是用户最初请求的唯一权威来源。不要凭记忆重建最初的请求；长会话和压缩后的会话会截断或摘要化早期消息，因此上下文内存并不可靠。

根据 session_read 的输出:

1. 在返回的会话历史中找到第一条用户消息（role 为 "user" 的最早条目）。
2. 将该第一条用户消息的文本逐字复制到工作笔记中。稍后你将把它原样放入 USER REQUESTS (AS-IS) 部分。
3. 如果用户在本会话中发送了多个不同的顶层请求，也请收集后续每条属于新顶层请求（而非追问澄清）的用户消息原文。

规则:
- 不要凭记忆重建用户请求。始终引用 session_read 的输出。
- 不要改写、总结或"整理"用户的措辞。
- 即使你觉得记得第一条用户消息，也不要跳过 session_read。
- 如果 session_read 失败或没有返回任何用户消息，请在 USER REQUESTS (AS-IS) 部分明确说明这一点，而不是猜测。

---

# 阶段 1: 收集程序化上下文

执行以下工具以收集具体数据:

1. session_read({ session_id: "$SESSION_ID" }) - 完整会话历史（已在阶段 0.5 中执行；此处复用其输出）
2. todoread() - 当前任务进度
3. Bash({ command: "git diff --stat HEAD~10..HEAD" }) - 最近的文件变更
4. Bash({ command: "git status --porcelain" }) - 未提交的变更

建议的执行顺序:

\`\`\`
session_read({ session_id: "$SESSION_ID" })  # already called in PHASE 0.5
todoread()
Bash({ command: "git diff --stat HEAD~10..HEAD" })
Bash({ command: "git status --porcelain" })
\`\`\`

分析收集到的输出，以了解:
- 完成了哪些工作
- 还有哪些任务未完成（包括 todo 状态）
- 做出了哪些决策
- 修改或讨论过哪些文件（包括 git diff/stat 和 git status）
- 建立了哪些模式、约束或偏好

USER REQUESTS 已在阶段 0.5 中从 session_read 逐字捕获；不要在此处重新推导。

---

# 阶段 2: 提取上下文

以第一人称视角编写上下文摘要（"我做了..."、"我告诉过你..."）。

重点关注:
- 能力与行为，而非逐文件的实现细节
- 对继续工作重要的内容
- 避免过多的实现细节（变量名、存储键、常量），除非至关重要
- USER REQUESTS (AS-IS) 必须来自阶段 0.5 的 session_read 提取结果，逐字复制（不要改写，不要凭记忆重建）
- EXPLICIT CONSTRAINTS 只能逐字引用（不要凭空编造）

提取时需要考虑的问题:
- 我刚刚做了什么或实现了什么？
- 我已经给出过哪些仍然相关的指示（例如遵循代码库中的模式）？
- 我告诉过你哪些文件很重要或我正在处理？
- 我是否提供了应包含在内的计划或规格说明？
- 我已经告诉过你哪些重要信息（库、模式、约束、偏好）？
- 我发现了哪些重要的技术细节（API、方法、模式）？
- 我发现了哪些注意事项、限制或未解决的问题？

---

# 阶段 3: 格式化输出

使用以下精确格式生成交接摘要:

\`\`\`
HANDOFF CONTEXT
===============

USER REQUESTS (AS-IS)
---------------------
- [Exact verbatim user requests - NOT paraphrased]

GOAL
----
[One sentence describing what should be done next]

WORK COMPLETED
--------------
- [First person bullet points of what was done]
- [Include specific file paths when relevant]
- [Note key implementation decisions]

CURRENT STATE
-------------
- [Current state of the codebase or task]
- [Build/test status if applicable]
- [Any environment or configuration state]

PENDING TASKS
-------------
- [Tasks that were planned but not completed]
- [Next logical steps to take]
- [Any blockers or issues encountered]
- [Include current todo state from todoread()]

KEY FILES
---------
- [path/to/file1] - [brief role description]
- [path/to/file2] - [brief role description]
(Maximum 10 files, prioritized by importance)
- (Include files from git diff/stat and git status)

IMPORTANT DECISIONS
-------------------
- [Technical decisions that were made and why]
- [Trade-offs that were considered]
- [Patterns or conventions established]

EXPLICIT CONSTRAINTS
--------------------
- [Verbatim constraints only - from user or existing AGENTS.md]
- If none, write: None

CONTEXT FOR CONTINUATION
------------------------
- [What the next session needs to know to continue]
- [Warnings or gotchas to be aware of]
- [References to documentation if relevant]
\`\`\`

摘要规则:
- 纯文本加项目符号
- 不使用 # 开头的 markdown 标题（使用上方带连字符的格式）
- 内容中不使用粗体、斜体或代码围栏
- 文件使用相对于工作区的路径
- 保持聚焦 - 只包含对继续工作重要的内容
- 根据复杂度选择适当的篇幅
- USER REQUESTS (AS-IS) 和 EXPLICIT CONSTRAINTS 必须逐字引用

---

# 阶段 4: 提供指示

生成摘要后，向用户给出如下指示:

\`\`\`
---

TO CONTINUE IN A NEW SESSION:

1. Press 'n' in OpenCode TUI to open a new session, or run 'opencode' in a new terminal
2. Paste the HANDOFF CONTEXT above as your first message
3. Add your request: "Continue from the handoff context above. [Your next task]"

The new session will have all context needed to continue seamlessly.
\`\`\`

---

# 重要约束

- 不要尝试以编程方式创建新会话（对代理没有可用的 API）
- 一定要提供一份不依赖本会话即可工作的自包含摘要
- 一定要包含相对于工作区的文件路径
- 不要包含敏感信息（API 密钥、凭据、机密）
- KEY FILES 部分不要超过 10 个文件
- GOAL 部分保持为单句或短段落

---

# 立即执行

首先收集程序化上下文，然后综合生成交接摘要。
`
