# 安装指南

## 针对人类

将此内容粘贴到你的 LLM Agent 会话中：

```bash
Install and configure oh-my-opencode by following the instructions here:
https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/refs/heads/master/docs/guide/installation.md
```

**替代方案，不推荐**

运行交互式安装程序：

```bash
bunx oh-my-opencode install # recommended
npx oh-my-opencode install # alternative
```

> **注意**：CLI 自带所有主要平台的独立二进制文件。安装后执行 CLI 不需要运行时（Bun/Node.js）。

根据提示配置你的 Claude、ChatGPT 和 Gemini 订阅。安装后，按照说明认证你的提供商。

安装后，阅读此 [概述指南](./overview.md) 了解更多。

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
bunx oh-my-opencode install --no-tui --claude=<yes|no|max20> --gemini=<yes|no> --copilot=<yes|no> [--openai=<yes|no>] [--opencode-zen=<yes|no>] [--zai-coding-plan=<yes|no>]
```

**示例**：
- 用户拥有所有原生订阅：`bunx oh-my-opencode install --no-tui --claude=max20 --openai=yes --gemini=yes --copilot=no`
- 用户仅拥有 Claude：`bunx oh-my-opencode install --no-tui --claude=yes --gemini=no --copilot=no`
- 用户拥有 Claude + OpenAI：`bunx oh-my-opencode install --no-tui --claude=yes --openai=yes --gemini=no --copilot=no`
- 用户拥有 GitHub Copilot：`bunx oh-my-opencode install --no-tui --claude=no --gemini=no --copilot=yes`
- 用户拥有 Z.ai 供 Librarian 使用：`bunx oh-my-opencode install --no-tui --claude=yes --gemini=no --copilot=no --zai-coding-plan=yes`
- 用户仅拥有 OpenCode Zen：`bunx oh-my-opencode install --no-tui --claude=no --gemini=no --copilot=no --opencode-zen=yes`
- 用户无订阅：`bunx oh-my-opencode install --no-tui --claude=no --gemini=no --copilot=no`

### 步骤 3：配置身份验证

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

请阅读 [opencode-antigravity-auth 文档](https://github.com/NoeFabris/opencode-antigravity-auth)，从 README 复制完整模型配置并小心合并以避免破坏用户现有设置。该插件现在使用**变体系统**（`-low`、`-high` 变体）而非单独的 `-low`/`-high` 模型条目。

**可用模型（Antigravity 配额）**：
- `google/antigravity-gemini-3-pro` — 变体：`low`、`high`
- `google/antigravity-gemini-3-flash` — 变体：`minimal`、`low`、`medium`、`high`
- `google/antigravity-claude-sonnet-4-5` — 无变体
- `google/antigravity-claude-sonnet-4-5-thinking` — 变体：`low`、`max`
- `google/antigravity-claude-opus-4-5-thinking` — 变体：`low`、`max`

> **注意**：旧的层缀名称如 `google/antigravity-gemini-3-pro-high` 仍然有效，但推荐使用基础模型名称配合 `--variant` 标志（例如：`--variant=high`）。详见文档中的模型配置示例。

#### GitHub Copilot（回退提供商）

GitHub Copilot 在原生提供商（Anthropic、OpenAI、Google）不可用时作为**回退提供商**使用。

**优先级**：原生（anthropic/、openai/、google/）> GitHub Copilot > OpenCode Zen > Z.ai Coding Plan

#### Z.ai Coding Plan

当 Z.ai Coding Plan 作为唯一可用提供商时，**Librarian Agent 始终使用 `zai-coding-plan/glm-4.7`**，无论其他提供商配置如何。

### 步骤 4：配置模型设置

你还需要在 `~/.config/opencode/oh-my-opencode.json` 中配置完整的模型设置。

**示例配置**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
  "agents": {
    // 仅覆盖特定 Agent - 其余使用回退链
    "atlas": { "model": "anthropic/claude-sonnet-4-5", "variant": "max" },
    "librarian": { "model": "zai-coding-plan/glm-4.7" },
    "explore": { "model": "opencode/gpt-5-nano" },
    "multimodal-looker": { "model": "zai-coding-plan/glm-4.6v" }
  },
  "categories": {
    // 为成本优化覆盖类别
    "quick": { "model": "opencode/gpt-5-nano" },
    "unspecified-low": { "model": "zai-coding-plan/glm-4.7" }
  },
  "experimental": {
    "aggressive_truncation": true
  }
}
```

**关键要点**：
- 你只需覆盖想要更改的内容
- 未指定的 Agent/类别使用自动回退链
- 可以自由混合提供商（例如：Claude 用于主要工作，Z.ai 用于廉价任务等）

### 步骤 5：验证设置

```bash
opencode --version # 应为 1.0.150 或更高
cat ~/.config/opencode/oh-my-opencode.json # 应包含 "oh-my-opencode"
```

### 步骤 6：配置身份验证

按照每个提供商的说明配置身份验证，请按照以下说明使用交互式终端（如 tmux）执行操作：

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

请阅读 [opencode-antigravity-auth 文档](https://github.com/NoeFabris/opencode-antigravity-auth)，从 README 复制完整模型配置并小心合并以避免破坏用户现有设置。该插件现在使用**变体系统**（`-low`、`-high` 变体）而非单独的 `-low`/`-high` 模型条目。

**可用模型（Antigravity 配额）**：
- `google/antigravity-gemini-3-pro` — 变体：`low`、`high`
- `google/antigravity-gemini-3-flash` — 变体：`minimal`、`low`、`medium`、`high`
- `google/antigravity-claude-sonnet-4-5` — 无变体
- `google/antigravity-claude-sonnet-4-5-thinking` — 变体：`low`、`max`
- `google/antigravity-claude-opus-4-5-thinking` — 变体：`low`、`max`

> **注意**：旧的层缀名称如 `google/antigravity-gemini-3-pro-high` 仍然有效，但推荐使用基础模型名称配合 `--variant` 标志（例如：`--variant=high`）。详见文档中的模型配置示例。

#### GitHub Copilot（回退提供商）

GitHub Copilot 在原生提供商（Anthropic、OpenAI、Google）不可用时作为**回退提供商**使用。

**优先级**：原生（anthropic/、openai/、google/）> GitHub Copilot > OpenCode Zen > Z.ai Coding Plan

#### Z.ai Coding Plan

当 Z.ai Coding Plan 作为唯一可用提供商时，**Librarian Agent 始终使用 `zai-coding-plan/glm-4.7`**，无论其他提供商配置如何。

### 步骤 4：配置模型设置

你还需要在 `~/.config/opencode/oh-my-opencode.json` 中配置完整的模型设置。

**示例配置**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
  "agents": {
    // 仅覆盖特定 Agent - 其余使用回退链
    "atlas": { "model": "anthropic/claude-sonnet-4-5", "variant": "max" },
    "librarian": { "model": "zai-coding-plan/glm-4.7" },
    "explore": { "model": "opencode/gpt-5-nano" },
    "multimodal-looker": { "model": "zai-coding-plan/glm-4.6v" }
  },
  "categories": {
    // 为成本优化覆盖类别
    "quick": { "model": "opencode/gpt-5-nano" },
    "unspecified-low": { "model": "zai-coding-plan/glm-4.7" }
  },
  "experimental": {
    "aggressive_truncation": true
  }
}
```

**关键要点**：
- 你只需覆盖想要更改的内容
- 未指定的 Agent/类别使用自动回退链
- 可以自由混合提供商（例如：Claude 用于主要工作，Z.ai 用于廉价任务等）

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

**⚠️  警告**

**除非用户明确请求，否则不要更改模型设置或禁用功能。**

插件默认工作正常。请勿更改设置或关闭功能，除非有用户明确要求。
