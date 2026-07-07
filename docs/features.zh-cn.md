# OhMyOpenCode 功能

## AI Agent 团队

OhMyOpenCode 提供了 11 个专业化 AI Agent。每个都有独特的专业知识、优化模型和工具权限。

### 核心 Agent

| Agent | 模型 | 目的 |
|--------|--------|------|
| **Sisyphus** | `anthropic/claude-opus-4-5` | **默认编排器。** 制定计划、委托和执行复杂任务，使用具有激进并行执行的专业子代理。Todo 驱动的工作流程，扩展思考（32k 预算）。回退链：kimi-k2.5 → glm-4.7 → gpt-5.2-codex → gemini-3-pro。 |
| **Hephaestus** | `openai/gpt-5.2-codex` | **合法的工匠。** 受 AmpCode 深度模式启发的自主深度工作者。面向目标的执行，在行动前进行彻底研究。探索代码库模式，端到端完成任务而不过早停止。以希腊锻造和工艺之神 Hephaestus 命名。需要 gpt-5.2-codex（无回退 - 仅在该模型可用时激活）。 |
| **oracle** | `openai/gpt-5.2` | 架构决策、代码审查、调试。只读咨询 - 卓越的逻辑推理和深度分析。受 AmpCode 启发。用于复杂的架构设计、审查实现和调试困难问题。 |
| **librarian** | `zai-coding-plan/glm-4.7` | 多代码库分析、文档查找、OSS 实现示例。深度代码库理解，基于证据的答案。回退链：glm-4.7-free → claude-sonnet-4-5。 |
| **explore** | `anthropic/claude-haiku-4-5` | 快速代码库探索和上下文 grep。回退链：gpt-5-mini → gpt-5-nano。 |
| **multimodal-looker** | `google/gemini-3-flash` | 视觉内容专家。分析 PDF、图像、图表以提取信息。回退链：gpt-5.2 → glm-4.6v → kimi-k2.5 → claude-haiku-4-5 → gpt-5-nano。 |

### 规划 Agent

| Agent | 模型 | 目的 |
|--------|--------|------|
| **Prometheus** | `anthropic/claude-opus-4-5` | 具有采访模式的战略规划师。通过迭代问答创建详细的工作计划，包含任务、验收标准和护栏。可选择由 Momus（计划审查员）进行高准确性验证。回退链：kimi-k2.5 → gpt-5.2 → gemini-3-pro。 |
| **Metis** | `anthropic/claude-opus-4-5` | 计划顾问 - 预规划分析。识别隐藏意图、歧义和 AI 失败点。回退链：kimi-k2.5 → gpt-5.2 → gemini-3-pro。 |
| **Momus** | `openai/gpt-5.2` | 计划审查员 - 根据清晰度、可验证性和完整性标准验证计划。回退链：gpt-5.2 → claude-opus-4-5 → gemini-3-pro。 |

### 调用 Agent

主代理会自动调用这些，但你可以显式调用：

```
让 @oracle 审查此设计并建议架构
让 @librarian 解释此功能的实现方式 - 为什么行为会一直改变？
让 @explore 查看此功能的策略
```

### 工具限制

| Agent | 限制 |
|--------|--------|
| oracle | 只读：无法写入、编辑或委托 |
| librarian | 无法写入、编辑或委托 |
| explore | 无法写入、编辑或委托 |
| multimodal-looker | 仅允许读取、glob、grep |

### 后台 Agent

在后台运行代理并继续工作：

- 让 GPT 在 Claude 尝试不同方法时进行调试
- Gemini 在 Claude 处理后端时编写前端
- 启动大规模并行搜索，继续实现，在就绪时使用结果
```

# 启动后台
delegate_task(subagent_type="explore", load_skills=[], prompt="查找身份验证实现", run_in_background=true)

# 继续工作...
# 系统在完成时通知

# 检索结果（需要时）
background_output(task_id="bg_abc123")
```

#### 使用 Tmux 的视觉多 Agent

启用 `tmux.enabled` 以在单独的 tmux 窗格中查看后台代理：

```jsonc
{
  "tmux": {
    "enabled": true,
    "layout": "main-vertical"
  }
}
```

在 tmux 中运行时：
- 后台代理在新的窗口格中生成
- 多个代理工作时实时查看多个代理的输出
- 代理完成后自动清理

详见 [Tmux 集成](configurations.md#tmux-integration) 完整配置选项。

在 `oh-my-opencode.json` 中自定义代理模型、提示词和权限。详见 [配置](configurations.md)。

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
