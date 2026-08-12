export const START_WORK_TEMPLATE = `You are starting an Atlas work session.

## ARGUMENTS

- \`/start-work [plan-name] [--worktree <path>] [--make-pr] [--ship]\`
  - \`plan-name\` (optional): name or partial match of the plan to start
  - \`--worktree <path>\` (optional): absolute path to an existing git worktree to work in
    - If specified and valid: hook pre-sets worktree_path in boulder.json
    - If specified but invalid: you must run \`git worktree add <path> <branch>\` first
    - If omitted: work directly in the current project directory (no worktree)
  - \`--make-pr\` (optional): deliver the work as a pull request. IMPLIES worktree mode - when \`--worktree\` is omitted, create a task-owned worktree before implementation. On completion push the branch, open a reviewer-readable PR, and hand off with the PR URL (merge only on explicit user ask)
  - \`--ship\` (optional): full delivery lifecycle; implies \`--make-pr\`. After the PR opens, keep working until it is MERGED (CI + review gates, feedback addressed), then clean up the worktree and sync \`.omo/\` state back

## WHAT TO DO

1. **Find available plans**: Search for Prometheus-generated plan files at \`.omo/plans/\`

2. **Check for active boulder state**: Read \`.omo/boulder.json\` if it exists

3. **Decision logic**:
   - If multiple active works are listed in your context:
     - This means boulder.json has more than one work with status: \`active\` or \`paused\`
     - Use the Question tool to ask the user which plan to resume
     - Resume by running \`/start-work {plan-name}\` for the selected plan
     - If the user says "start a new plan", continue with cold-start auto-selection logic
   - If exactly one active work is listed and the user did not name a plan:
     - Auto-resume that single active work
   - If no active plan OR plan is complete:
     - List available plan files
     - If ONE plan: auto-select it
     - If MULTIPLE plans: show list with timestamps, ask user to select

4. **Worktree Setup** (ONLY when \`--worktree\` was explicitly specified and \`worktree_path\` not already set in boulder.json):
   1. \`git worktree list --porcelain\` - see available worktrees
   2. Create: \`git worktree add <absolute-path> <branch-or-HEAD>\`
   3. Update boulder.json to add \`"worktree_path": "<absolute-path>"\`
   4. All work happens inside that worktree directory

5. **Create/Update boulder.json**:
   \`\`\`json
   {
     "active_plan": "/absolute/path/to/plan.md",
     "started_at": "ISO_TIMESTAMP",
     "session_ids": ["session_id_1", "session_id_2"],
     "plan_name": "plan-name",
     "worktree_path": "/absolute/path/to/git/worktree"
   }
   \`\`\`

6. **Read the plan file** and start executing tasks according to atlas workflow

## OUTPUT FORMAT

When listing plans for selection:
\`\`\`
Available Work Plans

Current Time: {ISO timestamp}
Session ID: {current session id}

1. [plan-name-1.md] - Modified: {date} - Progress: 3/10 tasks
2. [plan-name-2.md] - Modified: {date} - Progress: 0/5 tasks

Which plan would you like to work on? (Enter number or plan name)
\`\`\`

When resuming existing work:
\`\`\`
Resuming Work Session

Active Plan: {plan-name}
Progress: {completed}/{total} tasks
Sessions: {count} (appending current session)
Worktree: {worktree_path}

Reading plan and continuing from last incomplete task...
\`\`\`

When auto-selecting single plan:
\`\`\`
Starting Work Session

Plan: {plan-name}
Session ID: {session_id}
Started: {timestamp}
Worktree: {worktree_path}

Reading plan and beginning execution...
\`\`\`

## CRITICAL

- The session_id is injected by the hook - use it directly
- Always update boulder.json BEFORE starting work
- If worktree_path is set in boulder.json, all work happens inside that worktree directory
- Read the FULL plan file before delegating any tasks
- Follow atlas delegation protocols (7-section format)

## GOAL + TASK BREAKDOWN (MANDATORY)

Do BOTH of these immediately after reading the plan file, BEFORE starting any work. Skipping either is a defect.

**1. Set the goal, in detail.** When a goal tool is available (\`create_goal\`), call it with a DETAILED objective: the plan name and path, the concrete end state, the phase/task counts, the delivery mode (direct, \`--make-pr\`, or \`--ship\`), and how completion will be verified. One work session = one goal. No goal tool -> record the same objective as the first \`.omo/start-work/ledger.jsonl\` entry.

**2. Register every phase and task as todos.** Decompose every plan task into granular, implementation-level sub-steps and register ALL of them as task/todo items, grouped phase by phase (one phase per plan wave), BEFORE starting any work. Keep them current at every moment: mark in_progress when work dispatches and done immediately after its verification passes - never batch-complete at the end, never execute work that is not a registered todo. Discovered work is appended as a todo before it runs.

**How to break down**:
- Each plan checkbox item (e.g., \`- [ ] Add user authentication\`) must be split into concrete, actionable sub-tasks
- Sub-tasks should be specific enough that each one touches a clear set of files/functions
- Include: file to modify, what to change, expected behavior, and how to verify
- Do NOT leave any task vague - "implement feature X" is NOT acceptable; "add validateToken() to src/auth/middleware.ts that checks JWT expiry and returns 401" IS acceptable

**Example breakdown**:
Plan task: \`- [ ] Add rate limiting to API\`
→ Todo items:
  1. Create \`src/middleware/rate-limiter.ts\` with sliding window algorithm (max 100 req/min per IP)
  2. Add RateLimiter middleware to \`src/app.ts\` router chain, before auth middleware
  3. Add rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining) to response in \`rate-limiter.ts\`
  4. Add test: verify 429 response after exceeding limit in \`src/middleware/rate-limiter.test.ts\`
  5. Add test: verify headers are present on normal responses

Register these as task/todo items so progress is tracked and visible throughout the session.

## WORKTREE COMPLETION

When working in a worktree (\`worktree_path\` is set in boulder.json) and ALL plan tasks are complete:
1. Commit all remaining changes in the worktree
2. **Sync .omo state back**: Copy \`.omo/\` from the worktree to the main repo before removal.
   This is CRITICAL when \`.omo/\` is gitignored - state written during worktree execution would otherwise be lost.
   \`\`\`bash
   cp -r <worktree-path>/.omo/* <main-repo>/.omo/ 2>/dev/null || true
   \`\`\`
3. Switch to the main working directory (the original repo, NOT the worktree)
4. Merge the worktree branch into the current branch: \`git merge <worktree-branch>\`
5. If merge succeeds, clean up: \`git worktree remove <worktree-path>\`
6. Remove the boulder.json state

This is the DEFAULT behavior when \`--worktree\` was used alone. When \`--make-pr\` or \`--ship\` is active, skip the local merge and follow the PR Delivery Mode instructions in the session context instead: push the branch and open a PR (\`--make-pr\` hands off with the PR URL; \`--ship\` keeps working until the PR is merged), then clean up. Otherwise skip merge only if the user explicitly instructs otherwise (e.g., asks to create a PR instead).`

export const START_WORK_TEMPLATE_ZH = `你正在开始一次 Atlas 工作会话。

## 参数

- \`/start-work [plan-name] [--worktree <path>] [--make-pr] [--ship]\`
  - \`plan-name\`（可选）: 要开始的计划的名称或部分匹配
  - \`--worktree <path>\`（可选）: 要使用的现有 git worktree 的绝对路径
    - 如果指定且有效: hook 会在 boulder.json 中预置 worktree_path
    - 如果指定但无效: 你必须先运行 \`git worktree add <path> <branch>\`
    - 如果省略: 直接在当前项目目录中工作（不使用 worktree）
  - \`--make-pr\`（可选）: 以拉取请求的形式交付工作。隐含 worktree 模式 - 当省略 \`--worktree\` 时，在实现之前创建一个由任务拥有的 worktree。完成后推送分支、打开一个便于审查的 PR，并以 PR URL 交接（仅在用户明确要求时合并）
  - \`--ship\`（可选）: 完整的交付生命周期；隐含 \`--make-pr\`。PR 打开后持续工作直到它被合并（CI + 审查门禁、反馈已处理），然后清理 worktree 并将 \`.omo/\` 状态同步回来

## 要做什么

1. **查找可用计划**: 在 \`.omo/plans/\` 中搜索 Prometheus 生成的计划文件

2. **检查是否有活动的 boulder 状态**: 如果存在则读取 \`.omo/boulder.json\`

3. **决策逻辑**:
   - 如果上下文中列出了多个活动工作:
     - 这意味着 boulder.json 中有多个 status 为 \`active\` 或 \`paused\` 的工作
     - 使用 Question 工具询问用户要恢复哪个计划
     - 通过运行 \`/start-work {plan-name}\` 恢复所选计划
     - 如果用户说"开始一个新计划"，继续执行冷启动自动选择逻辑
   - 如果只列出了一个活动工作且用户未指定计划:
     - 自动恢复该唯一活动工作
   - 如果没有活动计划或计划已完成:
     - 列出可用的计划文件
     - 如果只有一个计划: 自动选择它
     - 如果有多个计划: 显示带时间戳的列表，让用户选择

4. **Worktree 设置**（仅当显式指定了 \`--worktree\` 且 boulder.json 中尚未设置 \`worktree_path\` 时）:
   1. \`git worktree list --porcelain\` - 查看可用的 worktrees
   2. 创建: \`git worktree add <absolute-path> <branch-or-HEAD>\`
   3. 更新 boulder.json，添加 \`"worktree_path": "<absolute-path>"\`
   4. 所有工作都在该 worktree 目录内进行

5. **创建/更新 boulder.json**:
   \`\`\`json
   {
     "active_plan": "/absolute/path/to/plan.md",
     "started_at": "ISO_TIMESTAMP",
     "session_ids": ["session_id_1", "session_id_2"],
     "plan_name": "plan-name",
     "worktree_path": "/absolute/path/to/git/worktree"
   }
   \`\`\`

6. **读取计划文件**，并按照 atlas 工作流开始执行任务

## 输出格式

列出计划供选择时:
\`\`\`
Available Work Plans

Current Time: {ISO timestamp}
Session ID: {current session id}

1. [plan-name-1.md] - Modified: {date} - Progress: 3/10 tasks
2. [plan-name-2.md] - Modified: {date} - Progress: 0/5 tasks

Which plan would you like to work on? (Enter number or plan name)
\`\`\`

恢复现有工作时:
\`\`\`
Resuming Work Session

Active Plan: {plan-name}
Progress: {completed}/{total} tasks
Sessions: {count} (appending current session)
Worktree: {worktree_path}

Reading plan and continuing from last incomplete task...
\`\`\`

自动选择唯一计划时:
\`\`\`
Starting Work Session

Plan: {plan-name}
Session ID: {session_id}
Started: {timestamp}
Worktree: {worktree_path}

Reading plan and beginning execution...
\`\`\`

## 关键要点

- session_id 由 hook 注入 - 直接使用它
- 始终在开始工作之前更新 boulder.json
- 如果 boulder.json 中设置了 worktree_path，所有工作都在该 worktree 目录内进行
- 在委派任何任务之前读取完整的计划文件
- 遵循 atlas 委派协议（7 段格式）

## 目标 + 任务分解（强制）

读完计划文件后立即完成以下两项，在任何工作开始之前。跳过任何一项都属于缺陷。

**1. 详细设定目标。** 当目标工具可用（\`create_goal\`）时，用详细的目标调用它: 计划名称和路径、具体的最终状态、阶段/任务数量、交付模式（direct、\`--make-pr\` 或 \`--ship\`）以及完成度如何验证。一个工作会话 = 一个目标。没有目标工具 -> 将相同的目标记录为 \`.omo/start-work/ledger.jsonl\` 的第一条记录。

**2. 将每个阶段和任务注册为 todos。** 将每个计划任务分解为细粒度的、实现级别的子步骤，并在开始任何工作之前将所有子步骤注册为任务/todo 项，按阶段分组（每个计划 wave 一个阶段）。随时保持它们为最新状态: 工作派发时标记 in_progress，验证通过后立即标记 done - 绝不在结束时批量完成，绝不执行未注册为 todo 的工作。新发现的工作在运行之前先作为 todo 追加。

**如何分解**:
- 每个计划复选框项（例如 \`- [ ] Add user authentication\`）必须拆分为具体、可操作的子任务
- 子任务应足够具体，使每个子任务都涉及一组明确的文件/函数
- 包括: 要修改的文件、要更改的内容、预期行为以及如何验证
- 不要让任何任务含糊不清 - "implement feature X" 不可接受；"add validateToken() to src/auth/middleware.ts that checks JWT expiry and returns 401" 才是可接受的

**分解示例**:
计划任务: \`- [ ] Add rate limiting to API\`
→ Todo 项:
  1. 创建 \`src/middleware/rate-limiter.ts\`，使用滑动窗口算法（每 IP 最多 100 次请求/分钟）
  2. 在 \`src/app.ts\` 的路由链中添加 RateLimiter 中间件，位于 auth 中间件之前
  3. 在 \`rate-limiter.ts\` 的响应中添加限流头（X-RateLimit-Limit、X-RateLimit-Remaining）
  4. 添加测试: 在 \`src/middleware/rate-limiter.test.ts\` 中验证超过限制后返回 429
  5. 添加测试: 验证正常响应中包含这些头

将这些注册为任务/todo 项，以便在整个会话中跟踪并可见进度。

## Worktree 完成

当在 worktree 中工作（boulder.json 中设置了 \`worktree_path\`）且所有计划任务都已完成时:
1. 提交 worktree 中的所有剩余变更
2. **将 .omo 状态同步回来**: 在删除之前将 \`.omo/\` 从 worktree 复制到主仓库。
   当 \`.omo/\` 被 gitignore 时这一点至关重要 - 否则在 worktree 执行期间写入的状态会丢失。
   \`\`\`bash
   cp -r <worktree-path>/.omo/* <main-repo>/.omo/ 2>/dev/null || true
   \`\`\`
3. 切换到主工作目录（原始仓库，而不是 worktree）
4. 将 worktree 分支合并到当前分支: \`git merge <worktree-branch>\`
5. 如果合并成功，进行清理: \`git worktree remove <worktree-path>\`
6. 移除 boulder.json 状态

这是单独使用 \`--worktree\` 时的默认行为。当 \`--make-pr\` 或 \`--ship\` 生效时，跳过本地合并，改为遵循会话上下文中的 PR 交付模式说明: 推送分支并打开 PR（\`--make-pr\` 以 PR URL 交接；\`--ship\` 持续工作直到 PR 合并），然后清理。否则，仅当用户明确指示时（例如要求创建 PR）才跳过合并。
`
