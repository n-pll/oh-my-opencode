# Oh My OpenCode 配置

高度可定制，但可调整口味。

## 快速开始

**大多数用户无需手动配置。** 运行交互式安装器：
```bash
bunx oh-my-opencode install
```

它会根据你的订阅自动配置。就是这样。

---

## 配置文件位置

优先级顺序（从高到低）：
1. `.opencode/oh-my-opencode.json`（项目级）
2. `~/.config/opencode/oh-my-opencode.json`（用户级）

项目级配置会覆盖用户级配置。

---

## 快速概览

- **代理**：覆写每个代理的模型、温度、提示词和权限
- **内置技能**：覆写 `playwright`（浏览器自动化）和 `git-master`（原子提交）
- **分类**：按任务类型分配不同模型到不同类别（快速、视觉、业务逻辑等）
- **后台任务**：为每个提供商/模型配置并发限制
- **钩子**：禁用不需要的生命周期钩子
- **实验性**：启用激进截断、自动恢复等高级功能
- **LSP 和 MCP**：配置内置和内置 MCP
- **环境变量**：自定义配置文件路径

---

## 配置文件结构

配置文件使用 JSONC（支持注释和尾随逗号）。

项目级配置示例：
```jsonc
{
  // 代理配置
  "agents": {
    "sisyphus": {
      "model": "anthropic/claude-sonnet-4-5",
      "temperature": 0.1
    },
    "oracle": {
      "model": "openai/gpt-5.2",
      "temperature": 0.1
    }
  },

  // 内置技能
  "skills": {
    "playwright": {
      "enabled": true,
      "model": "google/gemini-3-pro"
    },
    "git-master": {
      "enabled": true,
      "model": "opencode/gpt-5-nano"
    }
  },

  // 分类配置
  "categories": {
    "quick": { "model": "opencode/gpt-5-nano" },
    "business-logic": { "model": "openai/gpt-5.2" },
    "visual": { "model": "google/gemini-3-pro" }
  },

  // 后台任务
  "background_tasks": {
    "concurrency_limits": {
      "openai/claude": 5,
      "google/gemini": 10,
      "opencode/gpt-5-nano": 20
    }
  },

  // 钩子
  "disabled_hooks": [],

  // 实验性
  "experimental": {
    "aggressive_truncation": true,
    "auto_resume": false
  }
}
```

---

## 配置选项

### 代理配置

每个代理都可以单独配置。示例：
```bash
# 为 Oracle 设置较低温度（更精确）
echo '{"agents": {"oracle": {"temperature": 0.0}}}' > ~/.config/opencode/oh-my-opencode.json

# 禁用 Multimodal Looker（节省成本）
echo '{"agents": {"multimodal-looker": {"disabled": true}}}' > ~/.config/opencode/oh-my-opencode.json
```

### 技能配置

使用内置技能模型：
- **playwright**（浏览器自动化）：`google/gemini-3-pro`
- **git-master**（原子提交）：`opencode/gpt-5-nano`

### 分类配置

为不同任务类型使用不同模型：
- `quick`：快速/低成本任务 → `opencode/gpt-5-nano`
- `business-logic`：复杂逻辑 → `openai/gpt-5.2`
- `visual`：UI/前端工作 → `google/gemini-3-pro`

---

## JSONC 支持

配置文件完全支持 JSONC（带注释和尾随逗号）：
```jsonc
// 这是注释
/* 多行注释
```

---

## 覆盖模型

`opencode/oh-my-opencode.schema.json` 定义了完整的配置 schema。

你可以通过查看该文件来了解所有可用的配置选项。

---

## 故障排除

如果配置无效，OpenCode 将自动回退到内置值。

**常见问题**：
- 配置文件格式错误 → 检查 JSON 语法
- 模型名称拼写错误 → 参考 schema 文件
- 温度或并发限制超出范围 → 系统会使用默认值

---

## 详细文档

查看 [Configuration Guide](../configurations.md) 获取完整的配置选项、示例和最佳实践。
