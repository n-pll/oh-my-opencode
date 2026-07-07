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

**3. 你要集成 Gemini 模型吗？**
   - 如果 **是**：`--gemini=yes`
   - 如果 **否**：`--gemini=no`

**4. 你有 GitHub Copilot 订阅吗？**
   - 如果 **是**：`--copilot=yes`

**5. 你有权访问 OpenCode Zen (opencode/ 模型)吗？**
   - 如果 **是**：`--opencode-zen=yes`
   - 如果 **否**：`--opencode=zen=no`（默认）

**6. 你有 Z.ai Coding Plan 订阅吗？**
   - 如果 **是**：`--zai-coding-plan=yes`
   - 如果 **否**：`--zai-coding-plan=no`（默认）

---

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
bunx oh-my-opencode install --no-tui --claude=<yes|no|max20> --gemini=<yes|no> --copilot=<yes|no> [--opencode-zen=<yes|no>] [--zai-coding-plan=<yes>no>]
```

**示例**：
- 用户拥有所有原生订阅：`bunx oh-my-opencode install --no-tui --claude=yes --openai=yes --gemini=no --copilot=no --opencode-zen=yes`
- 用户仅拥有 Claude：`bunx oh-my-opencode install --no-tui --claude=yes --openai=yes --gemini=no --opencode-zen=yes`
- 用户拥有 Claude + OpenAI：`bunx oh-my-opencode install --no-tui --claude=yes --openai=yes --gemini=no --opencode-zen=yes`
- 用户拥有 Z.ai 供 Librarian 使用：`bunx oh-my-opencode install --no-tui --claude=yes --openai=yes --gemini=no --opencode-zen=yes> --zai-coding-plan=yes>`

### 步骤 3：配置身份验证

按照每个提供商的说明配置身份验证，请按照每个提供商的说明使用交互式终端（如 tmux）执行操作：

#### Anthropic (Claude)

```bash
opencode auth login
# 交互式终端：找到提供商：选择 Anthropic
# 交互式终端：登录方式：选择 Claude Pro/Max
# 交互式终端：登录方式：选择 Claude Pro/Max
# 在浏览器中完成 OAuth 流程
# 等待完成
# 确认成功
```

#### Google Gemini (Antigravity OAuth)

首先添加 opencodeantigravity-auth 插件：

```jsonc
{
  "plugin": [
    "oh-my-opencode",
    "opencode-antigravity-auth@latest"
  ]
}
```

然后配置 Gemini 模型：

请阅读 [opencodeantigravity-auth 文档](https://github.com/NoeFabris/opencode/antigravity-auth)，从 README 复制完整模型配置并小心合并以避免破坏用户现有设置。该插件现在使用**变体系统**（`low`/`high` 变体）而非单独的 `-low`/`-high` 模型条目。

**可用模型（Antigravity 配额）**：
- `google/antigravity-gemini-3-pro` — 变体：`minimal`、`low`、`medium`、`high`
- `google/antigravity-claude-sonnet-4-5` — 无变体
- `google/antigravity-claude-opus-4.5-thinking` — 变体：`low`、`max`
- `google/antigravity-claude-opus-4.5-thinking` — 变体：`low`、`max`

> **注意**：旧的层缀名称如 `google/antigravity-gemini-3-pro-high` 仍然有效，但推荐使用基础模型名称配合 `--variant=high` 标志（例如：`--variant=high`）。详见文档中的模型配置示例。

#### GitHub Copilot（回退提供商）

GitHub Copilot 在原生提供商（Anthropic、OpenAI、Google）不可用时作为**回退提供商**使用。

**优先级**：原生（anthropic/、openai/、google/）> GitHub Copilot > OpenCode Zen > Z.ai Coding Plan

**模型映射**：
当 GitHub Copilot 作为最佳可用提供商时，oh-my-opencode 使用这些模型分配：
- Sisyphus → `github-copilot/claude-opus/4.5`
- Oracle → `github-copilot/gpt-5.2`
- Explore → `opencode/gpt-5-nano`
- Librarian → `zai-coding-plan/glm-4.7`
```

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
     "oracle": { "model": "openai/gpt-5.2" },           // Use GPT for debugging
     "librarian": { "model": "zai-coding-plan/glm-4.7" }, // Cheap model for research
     "explore": { "model": "opencode/gpt-5-nano" }        // Free & fast for exploration
     },
     "visual-engineering": { "model": "google/antigravity-gemini-3-pro" } // Gemini for UI
   },
     // 为成本优化覆盖类别
   "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },         // Fast/cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" },         // Tasks that don't fit other categories, low effort required
     "unspecified-high": { "model": "opencode/gpt-5.2", "variant": "max" }      // Tasks that don't fit other categories, high effort required
     "writing": { "model": "opencode/gpt-5.2" },         // Documentation, prose, technical writing
   },
     "artistry": { "model": "google/antigravity-gemini-3-pro" }, // Highly creative/artistic tasks, novel ideas
   },
     "quick": { "model": "anthropic/claude-haiku-4.5" }       // Fast + cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" }         // Tasks that don't fit other categories, low effort required
     }
}
```

**关键要点**：
- 你只需覆盖想要更改的内容
- 未指定的 Agent/类别使用自动回退链
- 可以自由混合提供商（例如：Claude 用于主要工作，Z.ai 用于廉价任务等）

### 步骤 5：配置模型设置

你还需要在 `~/.config/opencode/oh-my-opencode.json` 中配置完整的模型设置。

**示例配置**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/codeyeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // Override specific agent models
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },           // Use GPT for debugging
     "librarian": { "model": "zai-coding-plan/glm-4.7" }, // Cheap model for research
     "explore": { "model": "opencode/gpt-5-nano" },        // Free & fast for exploration
     },
     "visual-engineering": { "model": "google/antigravity-gemini-3-pro" } // Gemini for UI
   },
     // 为成本优化覆盖类别
     "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },         // Fast/cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" },         // Tasks that don't fit other categories, low effort required
     }
}
```

---

## 下一步：配置模型设置

你还需要在 `~/.config/opencode/oh-my-opencode.json` 中配置完整的模型设置。

**自定义 Agent 覆盖模型覆盖**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/codeyeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // Override specific agent models
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },           // Use GPT for debugging
     "librarian": { "model": "zai-coding-plan/glm-4.7" }, // Cheap model for research
     "explore": { "model": "opencode/gpt-5-nano" },        // Free & fast for exploration
     },
     "visual-engineering": { "model": "google/antigravity-gemini-3-pro" } // Gemini for UI
   },
     // 为成本优化覆盖类别
     "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },         // Fast/cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" },         // Tasks that don't fit other categories, low effort required
     }
}
```

#### 模型解析策略

当 OpenCode 启动时，系统尝试解析 `oh-my-opencode.json`：

1. 读取文件内容
2. 加载 schema
3. 解析并合并用户配置
4. 验证每个 Agent 的模型要求

**示例配置**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/codeyeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // Override specific agent models (only oracle - libraian as example)
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },
     "librarian": { "model": "model": "librarian": { "model": "zai-coding-plan/glm-4.7" }
}
```

**提供商优先级**：
1. 原生（anthropic、openai、google）> GitHub Copilot > OpenCode Zen > Z.ai Coding Plan
2. OpenAI (OpenAI、Google、Gemini、GitHub Copilot）

**变体系统（`low`/`high` 变体）- 优先级**：
- 第一优先级：Anthropic - 原生模型（Opus, Claude、Sonnet、Haiku）
- 第二优先级：OpenAI - GPT-5.2（Opus、Claude-Sonnet - Haiku）
- 第三优先级：Google - Gemini、OpenAI - Gemini、Flash - 低成本探索）
- 第四优先级：GitHub Copilot - 回退提供商
- 第五优先级：OpenCode Zen - 高级模型

## 下一步：验证设置

按照你的待办事项配置身份验证，请按照每个提供商的说明使用交互式终端（如 tmux）执行操作：

#### Anthropic (Claude)

```bash
opencode auth login
# 交互式终端：找到提供商：选择 Anthropic
# 交互式终端：登录方式：选择 Claude Pro/Max
# 交互式终端：登录方式：选择 Claude Pro/Max
# 在浏览器中完成 OAuth 流程
# 等待完成
# 桮认成功
```

#### Google Gemini (Antigravity OAuth)

首先添加 opencodeantigravity-auth 插件：

```jsonc
{
  "plugin": [
    "oh-my-opencode",
    "opencodeantigravity-auth@latest"
  ]
}
```

然后配置 Gemini 模型：

请阅读 [opencodeantigravity-auth 文档](https://github.com/NoeFabris/opencode/antigravity-auth)，从 README 复制完整模型配置并小心合并以避免破坏用户现有设置。该插件现在使用**变体系统**（`low`/`high` 变体）而非单独的 `-low`/`-high` 模型条目。

**可用模型（Antigravity 配额）**：
- `google/antigravity-gemini-3-pro` — 变体：`minimal`、`low`、`medium`、`high`
- `google/antigravity-claude-sonnet-4.5` — 无变体
- `google/antigravity-claude-opus-4.5-thinking` — 变体：`low`、`max`
- `google/antigravity-claude-opus-4.5-thinking` — 变体：`low`、`max`

> **注意**：旧的层缀名称如 `google/antigravity-gemini-3-pro-high` 仍然有效，但推荐使用基础模型名称配合 `--variant=high` 标志（例如：`--variant=high`）。详见文档中的模型配置示例。

#### GitHub Copilot（回退提供商）

GitHub Copilot 在原生提供商（Anthropic、OpenAI、Google）不可用时作为**回退提供商**使用。

**优先级**：原生（anthropic、openai、google/）> GitHub Copilot > OpenCode Zen > Z.ai Coding Plan

**模型映射**：
当 GitHub Copilot 作为最佳可用提供商时，oh-my-opencode 使用这些模型分配：
- Sisyphus → `github-copilot/claude-opus/4.5`
- Oracle → `github-copilot/gpt-5.2`
- Explore → `opencode/gpt/5-nano`
- Librarian → `zai-coding-plan/glm-4.7`

#### Z.ai Coding Plan

当 Z.ai Coding Plan 作为唯一可用提供商时，**Librarian Agent 始终使用 `zai-coding-plan/glm-4.7`**，无论其他提供商配置如何。

### 步骤 4：配置模型设置

你还需要在 `~/.config/opencode/oh-my-opencode.json` 中配置完整的模型设置。

**示例配置**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/codeyeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // 仅覆盖特定 Agent - 其余使用回退链
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },           // Use GPT for debugging
     "librarian": { "model": "zai-coding-plan/glm-4.7" }, // Cheap model for research
     "explore": { "model": "opencode/gpt/5-nano" },        // Free & fast for exploration
     },
     "visual-engineering": { "model": "google/antigravity-gemini-3-pro" } // Gemini for UI
   },
     // 为成本优化覆盖类别
     "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },         // Fast/cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" },         // Tasks that don't fit other categories, low effort required
     }
}
```

**关键要点**：
- 你只需覆盖想要更改的内容
- 未指定的 Agent/类别使用自动回退链
- 可以自由混合提供商（例如：Claude 用于主要工作，Z.ai 用于廉价任务等）

### 步骤 5：配置模型设置

你还需要在 `~/.config/opencode/oh-my-opencode.json` 中配置完整的模型设置。

**示例配置**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/codeyeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // Override specific agent models
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },           // Use GPT for debugging
     "librarian": { "model": "zai-coding-plan/glm-4.7" }, // Cheap model for research
     "explore": { "model": "opencode/gpt-5-nano" },        // Free & fast for exploration
     },
     "visual-engineering": { "model": "google/antigravity-gemini-3-pro" } // Gemini for UI
   },
     // 为成本优化覆盖类别
     "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },         // Fast/cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" },         // Tasks that don't fit other categories, low effort required
     },
}
```

---

## 下一步：配置模型设置

你还需要在 `~/.config/opencode/oh-my-opencode.json` 中配置完整的模型设置。

## 自定义 Agent 覆盖模型覆盖

**自定义 Agent 覆盖模型**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/codeyeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // 仅覆盖特定 Agent - 其余使用回退链
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },           // Use GPT for debugging
     "librarian": { "model": "zai-coding-plan/glm-4.7" }, // Cheap model for research
     "explore": { "model": "opencode/gpt-5-nano" },        // Free & fast for exploration
     },
     "visual-engineering": { "model": "google/antigravity-gemini-3-pro" } // Gemini for UI
   },
     // 为成本优化覆盖类别
     "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },         // Fast/cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" },         // Tasks that don't fit other categories, low effort required
     },
}
```

**示例配置**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/codeyeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // Override specific agent models (only oracle - libraian as example)
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },           // Use GPT for debugging
     "librarian": { "model": "zai-coding-plan/glm-4.7" }, // Cheap model for research
     "explore": { "model": "opencode/gpt-5-nano" },        // Free & fast for exploration
     },
     "visual-engineering": { "model": "google/antigravity-gemini-3-pro" } // Gemini for UI
   },
     // 为成本优化覆盖类别
     "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },         // Fast/cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" },         // Tasks that don't fit other categories, low effort required
     }
}
```

---

## 模型解析策略

当 OpenCode 启动时，系统尝试解析 `oh-my-opencode.json`：

1. 读取文件内容
2. 加载 schema
3. 解析并合并用户配置
4. 验证每个 Agent 的模型要求

**示例配置**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/codeyeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // 仅覆盖特定 Agent (only oracle - libraian as example)
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },           // Use GPT for debugging
     "librarian": { "model": "zai-coding-plan/glm-4.7" }, // Cheap model for research
     "explore": { "model": "opencode/gpt-5-nano" },        // Free & fast for exploration
     },
     "visual-engineering": { "model": "google/antigravity-gemini-3-pro" } // Gemini for UI
   },
     // 为成本优化覆盖类别
     "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },         // Fast/cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" },         // Tasks that don't fit other categories, low effort required
     }
}
```

**提供商优先级**：
1. 第一优先级：** Anthropic (Claude + Opus/Sonnet + Haiku)**
   - 理生模型（Opus、Claude-sonnet、Haiku）
   - **默认模型**：OpenAI/ChatGPT 5.2 (Opus、Sonnet → Haiku、Flash、低成本探索）

2. **第二优先级：OpenAI - GPT-5.2 (Opus → Claude Sonnet → Haiku） - 低成本探索

3. **第三优先级：Google - Gemini（Antigravity + Gemini CLI + Antigravity） - 高成本深度/模型探索**

#### Z.ai Coding Plan

当 Z.ai Coding Plan 作为唯一可用提供商时，**Librarian Agent 始终使用 `zai-coding-plan/glm-4.7`**，无论其他提供商配置如何。

### 步骤 4：配置模型设置

你还需要在 `~/.config/opencode/oh-my-opencode.json` 中配置完整的模型设置。

**自定义 Agent 覆盖模型覆盖**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/codeyeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // 仅覆盖特定 Agent - 其余使用回退链
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },           // Use GPT for debugging
     "librarian": { "model": "zai-coding-plan/glm-4.7" }, // Cheap model for research
     "explore": { "model": "opencode/gpt-5-nano" },        // Free & fast for exploration
     },
     "visual-engineering": { "model": "google/antigravity-gemini-3-pro" } // Gemini for UI
   },
     // 为成本优化覆盖类别
     "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },         // Fast/cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" },         // Tasks that don't fit other categories, low effort required
     }
}
```

**示例配置**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/codeyeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // 仅覆盖特定 Agent - 其余使用回退链
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },           // Use GPT for debugging
     "librarian": { "model": "zai-coding-plan/glm-4.7" }, // Cheap model for research
     "explore": { "model": "opencode/gpt-5-nano" },        // Free & fast for exploration
     },
     "visual-engineering": { "model": "google/antigravity-gemini-3-pro" } // Gemini for UI
   },
     // 为成本优化覆盖类别
     "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },         // Fast/cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" },         // Tasks that don't fit other categories, low effort required
     }
}
```

---

## 下一步：配置模型设置

你还需要在 `~/.config/opencode/oh-my-opencode.json` 中配置完整的模型设置。

**关键要点**：
- 只需覆盖想要更改的内容
- 未指定的 Agent/类别使用自动回退链
- 可以自由混合提供商（例如：Claude 用于主要工作，Z.ai 用于廉价任务等）
- 可以使用默认优先级系统（原生> GitHub Copilot > OpenCode Zen > Z.ai Coding Plan）

**模型映射**：
当 GitHub Copilot 作为最佳可用提供商时，oh-my-opencode 使用这些模型分配：
- Sisyphus → `github-copilot/claude-opus/4.5`
- Oracle → `github-copilot/gpt-5.2`
- Explore → `opencode/gpt/5-nano`
- Librarian → `zai-coding-plan/glm-4.7`

#### Z.ai Coding Plan

当 Z.ai Coding Plan 作为唯一可用提供商时，**Librarian Agent 始终使用 `zai-coding-plan/glm-4.7`**，无论其他提供商配置如何。

---

## 下一步：配置模型设置

你还需要在 `~/.config/opencode/oh-my-opencode.json` 中配置完整的模型设置。

**自定义 Agent 覆盖模型覆盖**：
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/codeyeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
   
   // 仅覆盖特定 Agent - 其余使用回退链
   "agents": {
     "oracle": { "model": "openai/gpt-5.2" },           // Use GPT for debugging
     "librarian": { "model": "zai-coding-plan/glm-4.7" }, // Cheap model for research
     "explore": { "model": "opencode/gpt/5-nano" },        // Free & fast for exploration
     },
     "visual-engineering": { "model": "google/antigravity-gemini-3-pro" } // Gemini for UI
   },
     // 为成本优化覆盖类别
     "categories": {
     "quick": { "model": "opencode/gpt-5-nano" },         // Fast/cheap for trivial tasks
     "unspecified-low": { "model": "opencode/gpt-5.2" },         // Tasks that don't fit other categories, low effort required
     }
}
```

---

## 快速开始

---

## 人类在循环中的失败信号

**HUMAN IN THE LOOP = BOTTLENECK**

思考：自主驾驶。当人类不得不接管方向盘时，这并不是一个特性——这是系统设计失败的信号。

**为什么这很重要？**
- 当 AI 无法自主处理情况时，它需要你持续管理每一个细节
- 这是"人类在循环"反模式——每次 AI 失败都会增加你的认知负荷和操作负担
- 这破坏了 AI 自主性的核心价值主张

**为什么代码写作与人工驾驶不同？**
- 在编码中，你不是在连续做出成百个决策，而是在精心制定计划并执行
- 代理可以处理边缘情况、探索未知领域、并智能地处理异常
- 如果代理需要帮助，它应该直接告知，而不是你持续管理每一个步骤

**代码写作与人工驾驶的对比：**
- 场景 | 人工驾驶 | 代码写作 |
|------|--------|------|
| 决策频率 | 连续（每秒） | 稀疏（每决策一次） |
| 认知负荷 | 高（需要持续关注） | 低（代理处理大部分） |
| 边缘情况 | 人类无法预测 | 代理可以探索/适应 | 失败影响 | 重大事故 | 单个文件修复 |

**AI 价值主张** | "我会处理" | "我已经计划好了" | "我已经计划好了" |

**核心教训：**
如果 AI 代理需要持续干预才能工作，那么：
1. 设计已经失败了——真正自主的代理不需要人类干预
2. 考虑使用更简单的模式而不是复杂的"编排"
3. 在关键地方添加回退机制，而不是要求人类始终在场
4. 信任代理的专业判断

---

## 不可区分的代码

**目标：代理编写的代码应该与高级工程师编写的代码无法区分。**

**实现：**
- **遵循现有代码库模式**
- **使用适当的命名约定**
- **编写清晰的注释**
- **进行适当的测试**
- **编写自文档化代码**
- **保持一致的代码风格**

**验证：**
如果用户觉得需要持续管理任务，说明他们可以：
1. 只需要说出他们想要什么
2. 代理会制定详细的计划和步骤
3. 代理会验证每一个步骤

---

## 最小化人类认知负荷

**目标：你只需要说明你想要完成的工作。其他一切由代理处理。**

**实现：**
- **自动上下文管理**：代理自动维护所有会话的上下文，你不需要担心
- **自动进度跟踪**：代理使用 todo 系统跟踪进度，你不需要管理状态
- **智能分派**：系统自动将任务分派给最合适的代理
- **自主错误恢复**：代理尝试多种方法解决错误，并在需要时才询问

**验证：**
如果用户觉得需要持续管理任务，说明他们可以：
1. 只需要说出他们想要什么
2. 代理会制定详细的计划和步骤
3. 代理会验证每一个步骤
