# OhMyOpenCode 配置

## 快速开始

大多数用户不需要手动配置任何内容。运行交互式安装程序：

```bash
bunx oh-my-opencode install # recommended
npx oh-my-opencode install # alternative
```

> **注意**：CLI 自带所有主要平台的独立二进制文件。安装后执行 CLI 不需要运行时（Bun/Node.js）。

根据提示配置你的 Claude、ChatGPT 和 Gemini 订阅。安装后，按照说明认证你的提供商。

---

## 针对 LLM Agent

如果你是帮助用户设置 oh-my-opencode 的 LLM Agent，欢迎！你现在将帮助用户安装最佳 AI Agent 插件，OhMyOpenCode。用问候语测试 'oMoMoMoMo...'

按照以下步骤：

### 步骤 0：询问用户关于订阅

向用户询问以下问题以确定 CLI 选项：

**1. 你有 Claude Pro/Max 订阅吗？**
   - 如果 **是**：`--claude=max20`
   - 如果 **否**：`--claude=no`

**2. 你有 OpenAI/ChatGPT Plus 订阅吗？**
   - 如果 **是**：`--openai=yes`（Oracle Agent 使用 GPT-5.2）
   - 如果 **否**：`--openai=no`（默认）

**3. 你要集成 Gemini 模型吗？**
   - 如果 **是**：`--gemini=yes`
   - 如果 **否**：`--gemini=no`

**4. 你有 GitHub Copilot 订阅吗？**
   - 如果 **是**：`--copilot=yes`
   - 如果 **否**：`--copilot=no`

**5. 你有权访问 OpenCode Zen (opencode/ 模型)吗？**
   - 如果 **是**：`--opencode-zen=yes`
   - 如果 **否**：`--opencode-zen=no`（默认）

**6. 你有 Z.ai Coding Plan 订阅吗？**
   - 如果 **是**：`--zai-coding-plan=yes`
   - 如果 **否**：`--zai-coding-plan=no`（默认）

**提供商优先级**：原生（anthropic/、openai/、google/）> GitHub Copilot > OpenCode Zen > Z.ai Coding Plan

### 步骤 1：安装 OpenCode（如果未安装）

```bash
if command -v opencode &> /dev/null; then
    echo "OpenCode $(opencode --version) is installed"
else
    echo "OpenCode is not installed. Please install it first."
    echo "Ref: https://opencode.ai/docs"
    fi
```

如果 OpenCode 未安装，检查 [OpenCode 安装指南](https://opencode.ai/docs)。

### 步骤 2：运行安装程序

根据用户答案，使用适当的标志运行 CLI 安装程序：

```bash
bunx oh-my-opencode install --no-tui --claude=<yes|no|max20> --gemini=<yes|no> --copilot=<yes|no> [--opencode-zen=<yes|no>] [--zai-coding-plan=<yes|no>]
```

**示例**：
- 用户拥有所有原生订阅：`bunx oh-my-opencode install --no-tui --claude=max20 --openai=yes --gemini=yes --copilot=no --opencode-zen=yes`
- 用户仅拥有 Claude：`bunx oh-my-opencode install --no-tui --claude=yes --openai=yes --gemini=no --copilot=no`
- 用户拥有 Claude + OpenAI：`bunx oh-my-opencode install --no-tui --claude=yes --openai=yes --gemini=no --copilot=no`
- 用户拥有 Z.ai 供 Librarian 使用：`bunx oh-my-opencode install --no-tui --claude=no --openai=no --gemini=yes --copilot=no --zai-coding-plan=yes`
- 用户仅拥有 OpenCode Zen：`bunx oh-my-opencode install --no-tui --claude=no --openai=no --gemini=no --copilot=no`
- 用户无订阅：`bunx oh-my-opencode install --no-tui --claude=no --openai=no --gemini=no --copilot=no`

### 步骤 3：配置身份验证

按照每个提供商的说明配置身份验证，请按照每个提供商的说明使用交互式终端（如 tmux）执行操作：

#### Anthropic (Claude)

```bash
opencode auth login
# 交互式终端：找到提供商：选择 Anthropic
# 交互式终端：登录方式：选择 Claude Pro/Max
# 在浏览器中完成 OAuth 流程
# 等待完成
# 确认成功
```

#### Google Gemini (Antigravity OAuth)

首先添加 opencode-antigravity-auth 插件：

```jsonc
{
  "plugin": [
    "oh-my-opencode",
    "opencode-antigravity-auth@latest"
  ]
}
```

然后配置 Gemini 模型：

请阅读 [opencode-antigravity-auth 文档](https://github.com/NoeFabris/opencode-antigravity-auth)，从 README 复制完整模型配置并小心合并以避免破坏用户现有设置。该插件现在使用**变体系统**（`low`/`high` 变体）而非单独的 `-low`/`-high` 模型条目。

**可用模型（Antigravity 配额）**：
- `google/antigravity-gemini-3-pro` — 变体：`minimal`、`low`、`medium`、`high`
- `google/antigravity-claude-sonnet-4-5` — 无变体
- `google/antigravity-claude-sonnet-4-5-thinking` — 变体：`low`、`max`
- `google/antigravity-claude-opus-4-5-thinking` — 变体：`low`、`max`

> **注意**：旧的层缀名称如 `google/antigravity-gemini-3-pro-high` 仍然有效，但推荐使用基础模型名称配合 `--variant=high` 标志（例如：`--variant=high`）。详见文档中的模型配置示例。

然后认证：

#### GitHub Copilot（回退提供商）

GitHub Copilot 在原生提供商（Anthropic、OpenAI、Google）不可用时作为**回退提供商**使用。

**优先级**：原生（anthropic/、openai/、google/）> GitHub Copilot > OpenCode Zen > Z.ai Coding Plan

**模型映射**：
当 GitHub Copilot 作为最佳可用提供商时，oh-my-opencode 使用这些模型分配：
| Sisyphus → `github-copilot/claude-opus-4.5`
- Oracle → `github-copilot/gpt-5.2`
- Explore → `opencode/gpt-5-nano`
- Librarian → `zai-coding-plan/glm-4.7`（如果 Z.ai 可用）

#### Z.ai Coding Plan

当 Z.ai Coding Plan 作为唯一可用提供商时，**Librarian Agent 始终使用 `zai-coding-plan/glm-4.7`**，无论其他提供商配置如何。

### 步骤 4：配置模型设置

你还需要在 `~/.config/opencode/oh-my-opencode.json` 中配置完整的模型设置。

**示例配置**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // 仅覆盖特定 Agent - 其余使用回退链
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },
     "librarian": { "model": "zai-coding-plan/glm-4.7" },
     "explore": { "model": "opencode/gpt-5-nano" }
   },
   
   // 为成本优化覆盖类别
   "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },
     "visual-engineering": { "model": "google/gemini-3-pro" }
   }
}
```

**关键要点**：
- 你只需覆盖想要更改的内容
- 未指定的 Agent/类别使用自动回退链
- 可以自由混合提供商（例如：Claude 用于主要工作，Z.ai 用于廉价任务等）

#### Ollama 提供商

**重要**：使用 Ollama 时，你**必须**禁用流式以避免 JSON 解析错误。

**原因**：Ollama 返回 NDJSON（newline-delimited JSON），但 Claude Code SDK 期望单一 JSON 对象。这会导致 `JSON Parse error: Unexpected EOF` 当代理尝试工具调用时。

### 步骤 5：验证设置

```bash
opencode --version # 应为 1.0.150 或更高
cat ~/.config/opencode/oh-my-opencode.json # 应包含 "oh-my-opencode"
```

### 步骤 6：配置身份验证

按照你的待办事项配置身份验证，请按照每个提供商的说明使用交互式终端（如 tmux）执行操作：

#### Anthropic (Claude)

```bash
opencode auth login
# 交互式终端：找到提供商：选择 Anthropic
# 交互式终端：登录方式：选择 Claude Pro/Max
# 在浏览器中完成 OAuth 流程
# 等待完成
# 确认成功
```

#### Google Gemini (Antigravity OAuth)

首先添加 opencode-antigravity-auth 插件：

```jsonc
{
  "plugin": [
    "oh-my-opencode",
    "opencode-antigravity-auth@latest"
  ]
}
```

然后配置 Gemini 模型：

请阅读 [opencode-antigravity-auth 文档](https://github.com/NoeFabris/opencode-antigravity-auth)，从 README 复制完整模型配置并小心合并以避免破坏用户现有设置。该插件现在使用**变体系统**（`low`/`/`high` 变体）而非单独的 `-low`/`-high` 模型条目。

**可用模型（Antigravity 配额）**：
- `google/antigravity-gemini-3-pro` — 变体：`minimal`、`low`、`medium`、`high`
- `google/antigravity-claude-sonnet-4-5` — 无变体
- `google/antigravity-claude-sonnet-4-5-thinking` — 变体：`low`、`max`
- `google/antigravity-claude-opus-4-5-thinking` — 变体：`low`、`max`

> **注意**：旧的层缀名称如 `google/antigravity-gemini-3-pro-high` 仍然有效，但推荐使用基础模型名称配合 `--variant=high` 标志（例如：`--variant=high`）。详见文档中的模型配置示例。

然后认证：

#### GitHub Copilot（回退提供商）

GitHub Copilot 在原生提供商（Anthropic、OpenAI、Google）不可用时作为**回退提供商**使用。

**优先级**：原生（anthropic/、openai/、google/）> GitHub Copilot > OpenCode Zen > Z.ai Coding Plan

**模型映射**：
当 GitHub Copilot 作为最佳可用提供商时，oh-my-opencode 使用这些模型分配：
- Sisyphus → `github-copilot/claude-opus-4.5`
- Oracle → `github-copilot/gpt-5.2`
- Explore → `opencode/gpt-5-nano`
- Librarian → `zai-coding-plan/glm-4.7`（如果 Z.ai 可用）

#### Z.ai Coding Plan

当 Z.ai Coding Plan 作为唯一可用提供商时，**Librarian Agent 始终使用 `zai-coding-plan/glm-4.7`**，无论其他提供商配置如何。

## JSONC 支持

**`oh-my-opencode` 配置文件支持 JSONC（JSON with Comments）：**

- **行注释**：`// comment`
- **块注释**：`/* comment */`
- **尾随逗号**：`{ "key": "value", }`

**示例配置**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // 仅覆盖特定 Agent - 其余使用回退链
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },
     "librarian": { "model": "zai-coding-plan/glm-4.7" },
     "explore": { "model": "opencode/gpt-5-nano" }
   },
   
   // 为成本优化覆盖类别
   "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },
     "visual-engineering": { "model": "google/gemini-3-pro" }
   }
}
```

## 技能：专业化知识体系

技能提供了具有嵌入式 MCP 服务器和详细指令的专业化工作流程。

### 内置技能

| 技能 | 触发器 | 描述 |
|--------|--------|------|
| **playwright** | 浏览器任务、测试、截图 | 通过 Playwright MCP 进行浏览器自动化。**任何浏览器相关任务都必须使用 - 验证、浏览、网页抓取、测试、截图。** |
| **frontend-ui-ux** | UI/UX 任务、样式 | 设计师转开发者人设。在没有设计模型的情况下也能制作出色的 UI/UX。强调大胆的美学方向、独特的排版、协调的调色板。 |

### 技能触发器

在提示中包含特定技能名称以激活其嵌入的 MCP 服务器和详细指令：

```
# 使用 @playwright-skill 截图并验证响应
```

技能是专业化的工作流程，包含：
- 集成的 MCP 服务器连接
- 详细的任务执行指令
- 针对特定用例的示例

详见技能配置。
