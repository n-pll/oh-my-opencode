export const REFACTOR_VERIFICATION_AND_TOOLING = `# PHASE 6: FINAL VERIFICATION (REGRESSION CHECK)

**Mark phase-6 as in_progress.**

## 6.1: Full Test Suite

\`\`\`bash
# Run complete test suite
bun test  # or npm test, pytest, go test, etc.
\`\`\`

## 6.2: Type Check

\`\`\`bash
# Full type check
tsc --noEmit  # or equivalent
\`\`\`

## 6.3: Lint Check

\`\`\`bash
# Run linter
eslint .  # or equivalent
\`\`\`

## 6.4: Build Verification (if applicable)

\`\`\`bash
# Ensure build still works
bun run build  # or npm run build, etc.
\`\`\`

## 6.5: Final Diagnostics

\`\`\`typescript
// Check all changed files
for (file of changedFiles) {
  lsp_diagnostics(file)  // Must all be clean
}
\`\`\`

## 6.6: Generate Summary

\`\`\`markdown
## Refactoring Complete

### What Changed
- [List of changes made]

### Files Modified
- \`path/to/file.ts\` - [what changed]
- \`path/to/file2.ts\` - [what changed]

### Verification Results
- Tests: PASSED (X/Y passing)
- Type Check: CLEAN
- Lint: CLEAN
- Build: SUCCESS

### No Regressions Detected
All existing tests pass. No new errors introduced.
\`\`\`

**Mark phase-6 as completed.**

---

# CRITICAL RULES

## NEVER DO
- Skip lsp_diagnostics check after changes
- Proceed with failing tests
- Make changes without understanding impact
- Use \`as any\`, \`@ts-ignore\`, \`@ts-expect-error\`
- Delete tests to make them pass
- Commit broken code
- Refactor without understanding existing patterns

## ALWAYS DO
- Understand before changing
- Preview structural rewrites before applying them
- Verify after every change
- Follow existing codebase patterns
- Keep todos updated in real-time
- Commit at logical checkpoints
- Report issues immediately

## ABORT CONDITIONS
If any of these occur, **STOP and consult user**:
- Test coverage is zero for target code
- Changes would break public API
- Refactoring scope is unclear
- 3 consecutive verification failures
- User-defined constraints violated

---

# Tool Usage Philosophy

You already know these tools. Use them intelligently:

## LSP Tools
Leverage LSP tools for precision analysis. Key patterns:
- **Understand before changing**: \`LspGotoDefinition\` to grasp context
- **Impact analysis**: \`LspFindReferences\` to map all usages before modification
- **Safe refactoring**: \`lsp_prepare_rename\` → \`lsp_rename\` for symbol renames
- **Continuous verification**: \`lsp_diagnostics\` after every change

## AST-Grep
Use the \`ast-grep\` skill helper or \`sg\` CLI for structural transformations.
**Critical**: Always preview first, review, then execute.

## Agents
- \`explore\`: Parallel codebase pattern discovery
- \`plan\`: Detailed refactoring plan generation
- \`oracle\`: Read-only consultation for complex architectural decisions and debugging
- \`librarian\`: **Use proactively** when encountering deprecated methods or library migration tasks. Query official docs and OSS examples for modern replacements.

## Deprecated Code & Library Migration
When you encounter deprecated methods/APIs during refactoring:
1. Fire \`librarian\` to find the recommended modern alternative
2. **DO NOT auto-upgrade to latest version** unless user explicitly requests migration
3. If user requests library migration, use \`librarian\` to fetch latest API docs before making changes

---

**Remember: Refactoring without tests is reckless. Refactoring without understanding is destructive. This command ensures you do neither.**

<user-request>
$ARGUMENTS
</user-request>
`

export const REFACTOR_VERIFICATION_AND_TOOLING_SECTION_ZH = `# 阶段 6: 最终验证（回归检查）

**将 phase-6 标记为 in_progress。**

## 6.1: 完整测试套件

\`\`\`bash
# Run complete test suite
bun test  # or npm test, pytest, go test, etc.
\`\`\`

## 6.2: 类型检查

\`\`\`bash
# Full type check
tsc --noEmit  # or equivalent
\`\`\`

## 6.3: Lint 检查

\`\`\`bash
# Run linter
eslint .  # or equivalent
\`\`\`

## 6.4: 构建验证（如适用）

\`\`\`bash
# Ensure build still works
bun run build  # or npm run build, etc.
\`\`\`

## 6.5: 最终诊断

\`\`\`typescript
// Check all changed files
for (file of changedFiles) {
  lsp_diagnostics(file)  // Must all be clean
}
\`\`\`

## 6.6: 生成摘要

\`\`\`markdown
## Refactoring Complete

### What Changed
- [List of changes made]

### Files Modified
- \`path/to/file.ts\` - [what changed]
- \`path/to/file2.ts\` - [what changed]

### Verification Results
- Tests: PASSED (X/Y passing)
- Type Check: CLEAN
- Lint: CLEAN
- Build: SUCCESS

### No Regressions Detected
All existing tests pass. No new errors introduced.
\`\`\`

**将 phase-6 标记为 completed。**

---

# 关键规则

## 绝不能做
- 更改后跳过 lsp_diagnostics 检查
- 在测试失败的情况下继续
- 在不理解影响的情况下进行更改
- 使用 \`as any\`、\`@ts-ignore\`、\`@ts-expect-error\`
- 删除测试以使其通过
- 提交有问题的代码
- 在不理解现有模式的情况下重构

## 必须做
- 更改前先理解
- 在应用结构性重写之前先预览
- 每次更改后都进行验证
- 遵循现有代码库模式
- 实时保持 todos 更新
- 在逻辑检查点提交
- 立即报告问题

## 中止条件
如果发生以下任何情况，**停止并咨询用户**：
- 目标代码的测试覆盖率为零
- 更改会破坏公共 API
- 重构范围不明确
- 连续 3 次验证失败
- 违反了用户定义的约束

---

# 工具使用理念

你已经了解这些工具。请聪明地使用它们：

## LSP 工具
利用 LSP 工具进行精确分析。关键模式：
- **更改前先理解**：使用 \`LspGotoDefinition\` 掌握上下文
- **影响分析**：修改前使用 \`LspFindReferences\` 梳理所有使用位置
- **安全重构**：符号重命名使用 \`lsp_prepare_rename\` → \`lsp_rename\`
- **持续验证**：每次更改后运行 \`lsp_diagnostics\`

## AST-Grep
使用 \`ast-grep\` 技能辅助脚本或 \`sg\` 命令行工具进行结构性转换。
**关键**：始终先预览、再审查、然后执行。

## 代理
- \`explore\`：并行代码库模式发现
- \`plan\`：生成详细的重构计划
- \`oracle\`：针对复杂架构决策和调试的只读咨询
- \`librarian\`：遇到已弃用方法或库迁移任务时**主动使用**。查询官方文档和开源示例以找到现代替代方案。

## 已弃用代码与库迁移
当你在重构过程中遇到已弃用的方法/API 时：
1. 发起 \`librarian\` 查找推荐的现代替代方案
2. **不要自动升级到最新版本**，除非用户明确要求迁移
3. 如果用户要求库迁移，在更改之前使用 \`librarian\` 获取最新的 API 文档

---

**记住：没有测试的重构是鲁莽的，没有理解的重构是破坏性的。本命令确保你两者都不会做。**

<user-request>
$ARGUMENTS
</user-request>
`
