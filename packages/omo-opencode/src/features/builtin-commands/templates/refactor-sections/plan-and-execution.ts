export const REFACTOR_PLAN_AND_EXECUTION = `# PHASE 4: PLAN GENERATION (PLAN AGENT)

**Mark phase-4 as in_progress.**

## 4.1: Invoke Plan Agent

\`\`\`
Task(
  subagent_type="plan",
  prompt="Create a detailed refactoring plan:

  ## Refactoring Goal
  [User's original request]

  ## Codemap (from Phase 2)
  [Insert codemap here]

  ## Test Coverage (from Phase 3)
  [Insert verification plan here]

  ## Constraints
  - MUST follow existing patterns: [list]
  - MUST NOT break: [critical paths]
  - MUST run tests after each step

  ## Requirements
  1. Break down into atomic refactoring steps
  2. Each step must be independently verifiable
  3. Order steps by dependency (what must happen first)
  4. Specify exact files and line ranges for each step
  5. Include rollback strategy for each step
  6. Define commit checkpoints"
)
\`\`\`

## 4.2: Review and Validate Plan

After receiving plan from Plan agent:

1. **Verify completeness**: All identified files addressed?
2. **Verify safety**: Each step reversible?
3. **Verify order**: Dependencies respected?
4. **Verify verification**: Test commands specified?

## 4.3: Register Detailed Todos

Convert Plan agent output into granular todos:

\`\`\`
TodoWrite([
  // Each step from the plan becomes a todo
  {"id": "refactor-1", "content": "Step 1: [description]", "status": "pending", "priority": "high"},
  {"id": "verify-1", "content": "Verify Step 1: run tests", "status": "pending", "priority": "high"},
  {"id": "refactor-2", "content": "Step 2: [description]", "status": "pending", "priority": "medium"},
  {"id": "verify-2", "content": "Verify Step 2: run tests", "status": "pending", "priority": "medium"},
  // ... continue for all steps
])
\`\`\`

**Mark phase-4 as completed.**

---

# PHASE 5: EXECUTE REFACTORING (DETERMINISTIC EXECUTION)

**Mark phase-5 as in_progress.**

## 5.1: Execution Protocol

For EACH refactoring step:

### Pre-Step
1. Mark step todo as \`in_progress\`
2. Read current file state
3. Verify lsp_diagnostics is baseline

### Execute Step
Use appropriate tool:

**For Symbol Renames:**
\`\`\`typescript
lsp_prepare_rename(filePath, line, character)  // Validate rename is possible
lsp_rename(filePath, line, character, newName)  // Execute rename
\`\`\`

**For Pattern Transformations:**
\`\`\`bash
// Preview first
sg --pattern '[pattern]' --rewrite '[rewrite]' --lang ts path/to/file.ts

// If preview looks good, execute
python3 scripts/ast_grep_helper.py replace '[pattern]' '[rewrite]' --lang ts path/to/file.ts --apply
\`\`\`

**For Structural Changes:**
\`\`\`typescript
// Use Edit tool for precise changes
edit(filePath, oldString, newString)
\`\`\`

### Post-Step Verification (MANDATORY)

\`\`\`typescript
// 1. Check diagnostics
lsp_diagnostics(filePath)  // Must be clean or same as baseline

// 2. Run tests
bash("bun test")  // Or appropriate test command

// 3. Type check
bash("tsc --noEmit")  // Or appropriate type check
\`\`\`

### Step Completion
1. If verification passes → Mark step todo as \`completed\`
2. If verification fails → **STOP AND FIX**

## 5.2: Failure Recovery Protocol

If ANY verification fails:

1. **STOP** immediately
2. **REVERT** the failed change
3. **DIAGNOSE** what went wrong
4. **OPTIONS**:
   - Fix the issue and retry
   - Skip this step (if optional)
   - Consult oracle agent for help
   - Ask user for guidance

**NEVER proceed to next step with broken tests.**

## 5.3: Commit Checkpoints

After each logical group of changes:

\`\`\`bash
git add [changed-files]
git commit -m "refactor(scope): description

[details of what was changed and why]"
\`\`\`

**Mark phase-5 as completed when all refactoring steps done.**

---

`

export const REFACTOR_PLAN_AND_EXECUTION_SECTION_ZH = `# 阶段 4: 计划生成（Plan Agent）

**将 phase-4 标记为 in_progress。**

## 4.1: 调用 Plan Agent

\`\`\`
Task(
  subagent_type="plan",
  prompt="Create a detailed refactoring plan:

  ## Refactoring Goal
  [User's original request]

  ## Codemap (from Phase 2)
  [Insert codemap here]

  ## Test Coverage (from Phase 3)
  [Insert verification plan here]

  ## Constraints
  - MUST follow existing patterns: [list]
  - MUST NOT break: [critical paths]
  - MUST run tests after each step

  ## Requirements
  1. Break down into atomic refactoring steps
  2. Each step must be independently verifiable
  3. Order steps by dependency (what must happen first)
  4. Specify exact files and line ranges for each step
  5. Include rollback strategy for each step
  6. Define commit checkpoints"
)
\`\`\`

## 4.2: 审查并验证计划

收到 Plan agent 的计划后：

1. **验证完整性**：所有已识别的文件都已处理？
2. **验证安全性**：每一步都可回退？
3. **验证顺序**：依赖关系得到遵循？
4. **验证验证方案**：测试命令是否已明确？

## 4.3: 登记详细的 Todos

将 Plan agent 的输出转换为细粒度的 todos：

\`\`\`
TodoWrite([
  // Each step from the plan becomes a todo
  {"id": "refactor-1", "content": "Step 1: [description]", "status": "pending", "priority": "high"},
  {"id": "verify-1", "content": "Verify Step 1: run tests", "status": "pending", "priority": "high"},
  {"id": "refactor-2", "content": "Step 2: [description]", "status": "pending", "priority": "medium"},
  {"id": "verify-2", "content": "Verify Step 2: run tests", "status": "pending", "priority": "medium"},
  // ... continue for all steps
])
\`\`\`

**将 phase-4 标记为 completed。**

---

# 阶段 5: 执行重构（确定性执行）

**将 phase-5 标记为 in_progress。**

## 5.1: 执行协议

对于每一个重构步骤：

### 步骤前
1. 将步骤 todo 标记为 \`in_progress\`
2. 读取当前文件状态
3. 确认 lsp_diagnostics 处于基线状态

### 执行步骤
使用合适的工具：

**符号重命名：**
\`\`\`typescript
lsp_prepare_rename(filePath, line, character)  // Validate rename is possible
lsp_rename(filePath, line, character, newName)  // Execute rename
\`\`\`

**模式转换：**
\`\`\`bash
// Preview first
sg --pattern '[pattern]' --rewrite '[rewrite]' --lang ts path/to/file.ts

// If preview looks good, execute
python3 scripts/ast_grep_helper.py replace '[pattern]' '[rewrite]' --lang ts path/to/file.ts --apply
\`\`\`

**结构性变更：**
\`\`\`typescript
// Use Edit tool for precise changes
edit(filePath, oldString, newString)
\`\`\`

### 步骤后验证（强制）

\`\`\`typescript
// 1. Check diagnostics
lsp_diagnostics(filePath)  // Must be clean or same as baseline

// 2. Run tests
bash("bun test")  // Or appropriate test command

// 3. Type check
bash("tsc --noEmit")  // Or appropriate type check
\`\`\`

### 步骤完成
1. 如果验证通过 → 将步骤 todo 标记为 \`completed\`
2. 如果验证失败 → **停止并修复**

## 5.2: 失败恢复协议

如果任何验证失败：

1. **立即停止**
2. **回退**失败的更改
3. **诊断**问题原因
4. **选项**：
   - 修复问题并重试
   - 跳过此步骤（如果可选）
   - 咨询 oracle agent 寻求帮助
   - 向用户寻求指导

**绝不在测试失败的情况下进入下一步。**

## 5.3: 提交检查点

在每一组逻辑相关的更改之后：

\`\`\`bash
git add [changed-files]
git commit -m "refactor(scope): description

[details of what was changed and why]"
\`\`\`

**当所有重构步骤完成时，将 phase-5 标记为 completed。**

---

`
