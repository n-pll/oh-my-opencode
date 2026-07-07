# 项目知识库

**生成时间：** 2026-02-01T17:25:00+09:00
**提交：** ab54e6cc
**分支：** feat/hephaestus-agent

---

## **重要：拉取请求目标分支**

> **所有拉取请求必须针对 `dev` 分支。**
>
> **不要创建针对 `master` 分支的拉取请求。**
>
> CI 将自动拒绝针对 `master` 分支的 PR。

---

## 概述

OpenCode 插件：多模型代理编排系统（Claude Opus 4.5、GPT-5.2、Gemini 3 Flash）。34 个生命周期钩子、20+ 工具（LSP、AST-Grep、委托）、11 个专用代理，完全兼容 Claude Code。OpenCode 的 "oh-my-zsh"。

## 结构

```
oh-my-opencode/
├── src/
│   ├── agents/        # 11 个 AI 代理 - 参见 src/agents/AGENTS.md
│   ├── hooks/         # 34 个生命周期钩子 - 参见 src/hooks/AGENTS.md
│   ├── tools/         # 20+ 工具 - 参见 src/tools/AGENTS.md
│   ├── features/      # 后台代理、Claude Code 兼容 - 参见 src/features/AGENTS.md
│   ├── shared/        # 55 个横切工具 - 参见 src/shared/AGENTS.md
│   ├── cli/           # CLI 安装器、诊断器 - 参见 src/cli/AGENTS.md
│   ├── mcp/           # 内置 MCP - 参见 src/mcp/AGENTS.md
│   ├── config/        # Zod schema、TypeScript 类型
│   └── index.ts       # 主插件入口（740 行）
├── script/            # build-schema.ts、build-binaries.ts
├── packages/          # 11 个平台特定二进制文件
└── dist/              # 构建输出（ESM + .d.ts）
```

## 去哪里查看

| 任务 | 位置 | 说明 |
|------|----------|-------|
| 添加代理 | `src/agents/` | 创建带工厂函数的 .ts 文件，添加到 `agentSources` |
| 添加钩子 | `src/hooks/` | 创建带 `createXXXHook()` 的目录，在 index.ts 中注册 |
| 添加工具 | `src/tools/` | 目录包含 index/types/constants/tools.ts |
| 添加 MCP | `src/mcp/` | 创建配置，添加到 index.ts |
| 添加技能 | `src/features/builtin-skills/` | 创建带 SKILL.md 的目录 |
| 添加命令 | `src/features/builtin-commands/` | 添加模板并在 commands.ts 中注册 |
| 配置 schema | `src/config/schema.ts` | Zod schema，运行 `bun run build:schema` |
| 后台代理 | `src/features/background-agent/` | manager.ts（1418 行）|
| 编排器 | `src/hooks/atlas/` | 主编排钩子（757 行）|

## TDD（测试驱动开发）

**强制要求。** RED-GREEN-REFACTOR：
1. **RED**：编写测试 → `bun test` → 失败
2. **GREEN**：实现最小功能 → 通过
3. **REFACTOR**：清理代码 → 保持通过

**规则：**
- 绝不在测试之前编写实现
- 绝不删除失败的测试 - 修复代码
- 测试文件：`*.test.ts` 与源文件并列（100 个测试文件）
- BDD 注释：`//#given`、`//#when`、`//#then`

## 约定

- **包管理器**：仅 Bun（`bun run`、`bun build`、`bunx`）
- **类型**：bun-types（绝不使用 @types/node）
- **构建**：`bun build`（ESM）+ `tsc --emitDeclarationOnly`
- **导出**：通过 index.ts 使用桶模式
- **命名**：kebab-case 目录，`createXXXHook`/`createXXXTool` 工厂函数
- **测试**：BDD 注释，100 个测试文件
- **温度**：代码代理 0.1，最高 0.3

## 反模式

| 类别 | 禁止行为 |
|------|----------|
| 包管理器 | npm、yarn - 仅使用 Bun |
| 类型 | @types/node - 使用 bun-types |
| 文件操作 | 代码中使用 mkdir/touch/rm/cp/mv - 使用 bash 工具 |
| 发布 | 直接 `bun publish` - 仅限 GitHub Actions |
| 版本管理 | 本地版本号递增 - 由 CI 管理 |
| 类型安全 | `as any`、`@ts-ignore`、`@ts-expect-error` |
| 错误处理 | 空的 catch 块 |
| 测试 | 删除失败的测试 |
| 代理调用 | 顺序执行 - 使用 `delegate_task` 并行 |
| 钩子逻辑 | 沉重的 PreToolUse - 减慢每次调用 |
| 提交 | 巨大提交（3+ 文件），测试与实现分离 |
| 温度 | 代码代理 > 0.3 |
| 信任 | 代理自报告 - 始终验证 |

## 代理模型

| 代理 | 模型 | 用途 |
|-------|-------|---------|
| Sisyphus | anthropic/claude-opus-4-5 | 主编排器（回退：kimi-k2.5 → glm-4.7 → gpt-5.2-codex → gemini-3-pro）|
| Hephaestus | openai/gpt-5.2-codex | 自主深度工作者，"合法工匠"（需要 gpt-5.2-codex，无回退）|
| Atlas | anthropic/claude-sonnet-4-5 | 主编排器（回退：kimi-k2.5 → gpt-5.2）|
| oracle | openai/gpt-5.2 | 咨询、调试 |
| librarian | zai-coding-plan/glm-4.7 | 文档、GitHub 搜索（回退：glm-4.7-free）|
| explore | anthropic/claude-haiku-4-5 | 快速代码库 grep（回退：gpt-5-mini → gpt-5-nano）|
| multimodal-looker | google/gemini-3-flash | PDF/图像分析 |
| Prometheus | anthropic/claude-opus-4-5 | 战略规划（回退：kimi-k2.5 → gpt-5.2）|

## 命令

```bash
bun run typecheck      # 类型检查
bun run build          # ESM + 声明文件 + schema
bun run rebuild        # 清理 + 构建
bun test               # 100 个测试文件
```

## 部署

**仅限 GitHub Actions workflow_dispatch**
1. 提交并推送更改
2. 触发：`gh workflow run publish -f bump=patch`
3. 绝不直接 `bun publish`，绝不本地递增版本号

## 复杂度热点

| 文件 | 行数 | 说明 |
|------|-------|-------------|
| `src/features/builtin-skills/skills.ts` | 1729 | 技能定义 |
| `src/features/background-agent/manager.ts` | 1440 | 任务生命周期、并发 |
| `src/agents/prometheus-prompt.ts` | 1283 | 规划代理提示词 |
| `src/tools/delegate-task/tools.ts` | 1135 | 基于类别的委托 |
| `src/hooks/atlas/index.ts` | 757 | 编排器钩子 |
| `src/index.ts` | 788 | 主插件入口 |
| `src/cli/config-manager.ts` | 667 | JSONC 配置解析 |
| `src/features/builtin-commands/templates/refactor.ts` | 619 | 重构命令模板 |

## MCP 架构

三层系统：
1. **内置**：websearch (Exa)、context7 (docs)、grep_app (GitHub)
2. **Claude Code 兼容**：.mcp.json 支持 `${VAR}` 展开
3. **技能嵌入**：技能中的 YAML frontmatter

## 配置系统

- **Zod 验证**：`src/config/schema.ts`
- **JSONC 支持**：注释、尾随逗号
- **多级**：项目 (`.opencode/`) → 用户 (`~/.config/opencode/`)

## 注意事项

- **OpenCode**：要求 >= 1.0.150
- **不稳定测试**：ralph-loop（CI 超时）、session-state（并行污染）
- **可信依赖**：@ast-grep/cli、@ast-grep/napi、@code-yeongyu/comment-checker
