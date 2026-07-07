import en, { type TranslationKey } from "./en"

const overrides: Partial<Record<TranslationKey, string>> = {
  // --- toast (background task notifications) ---
  "toast.new_background_task": "新后台任务",
  "toast.new_task_executed": "新任务已执行",
  "toast.task_completed": "任务完成",
  "toast.task_completion_message": "\"{{description}}\" 完成，耗时 {{duration}}",
  "toast.task_completion_remaining": "仍在运行: {{running}} | 排队中: {{queued}}",
  "toast.status_queued": "排队中",
  "toast.task_list_running": "运行中 ({{count}}):",
  "toast.task_list_queued": "排队中 ({{count}}):",
  "toast.task_list_new": " ← 新任务",
  "toast.fallback_prefix": "[回退] 模型: {{model}}{{suffix}}",
  "toast.fallback_inherited": " (继承自父级)",
  "toast.fallback_system_default": " (系统默认回退)",
  "toast.fallback_runtime": " (运行时回退)",
  "toast.concurrency_info": " [{{total}}/{{limit}}]",

  // --- agents (UI metadata: description shown in TUI agent selector) ---
  // Values mirror the full description strings used by each agent factory.
  // The "(Name - OhMyOpenCode)" brand suffix stays English (product identity).
  "agents.sisyphus.description": "强大的 AI 协调器。用 todo 痴迷于规划，探索前评估搜索复杂度，通过 category+skills 组合策略性地委派。内部代码用 explore（可并行），外部文档用 librarian。(Sisyphus - OhMyOpenCode)",
  "agents.oracle.description": "只读咨询 agent。高智商推理专家，擅长调试难题和高难度架构设计。(Oracle - OhMyOpenCode)",
  "agents.librarian.description": "文档，GitHub 搜索，开源示例",
  "agents.explore.description": "快速上下文 grep",
  "agents.frontend.description": "UI 生成，视觉设计",
  "agents.document-writer.description": "技术文档",
  "agents.multimodal-looker.description": "PDF/图像分析",
  "agents.prometheus.description": "战略规划者 - 执行前通过访谈构建严谨的计划",
  "agents.metis.description": "预规划差距分析",
  "agents.momus.description": "专家审查员，以严苛的清晰度、可验证性和完整性标准评估工作计划。(Momus - OhMyOpenCode)",
  "agents.sisyphus-junior.description": "专注任务执行者。同等纪律，不委派。(Sisyphus-Junior - OhMyOpenCode)",
  "agents.atlas.description": "通过 task() 编排工作，完成 todo 列表中的所有任务直到全部结束。(Atlas - OhMyOpenCode)",
  "agents.hephaestus.description": "自主深度工作者 - 使用 GPT Codex 进行目标导向的执行。行动前彻底探索，用 explore/librarian agent 获取全面上下文，端到端完成任务。灵感来自 AmpCode deep 模式。(Hephaestus - OhMyOpenCode)",

  // --- common (generic UI words) ---
  "common.loading": "加载中...",
  "common.done": "完成",
  "common.error": "错误",
  "common.warning": "警告",

  // --- config (language/locale UX) ---
  "config.language": "语言",
  "config.languageSet": "语言已设置为 {{language}}",
  "config.reloadRequired": "语言更改需要重启后生效",

  // --- errors (user-facing error messages) ---
  "errors.config.invalid": "配置无效",
  "errors.config.missing": "配置缺失",
  "errors.config.parseError": "配置文件解析失败",
  "errors.doctor.checkFailed": "检查失败",
  "errors.doctor.allPassed": "所有检查通过",
  "errors.common.notFound": "未找到",
  "errors.common.permissionDenied": "权限拒绝",
  "errors.common.unknown": "未知错误",

  // --- cli (installer, doctor, version, run) ---
  "cli.main.description": "终极 OpenCode 插件 - 多模型编排、LSP 工具以及更多功能",

  "cli.install.success": "安装完成",
  "cli.install.config.summary": "配置摘要",
  "cli.install.config.provider.claude": "Claude",
  "cli.install.config.provider.chatgpt": "ChatGPT",
  "cli.install.config.provider.gemini": "Gemini",
  "cli.install.config.provider.copilot": "GitHub Copilot",
  "cli.install.openai.question": "你是否拥有 OpenAI/ChatGPT Plus 订阅？",
  "cli.install.openai.options.no": "否",
  "cli.install.openai.options.yes": "是",
  "cli.install.openai.hints.no": "Oracle 将使用回退模型",
  "cli.install.openai.hints.yes": "Oracle 使用 GPT-5.2（高智商调试）",
  "cli.install.gemini.question": "是否集成 Google Gemini？",
  "cli.install.gemini.options.no": "否",
  "cli.install.gemini.options.yes": "是",
  "cli.install.gemini.hints.no": "前端/文档代理将使用回退选项",
  "cli.install.gemini.hints.yes": "使用 Gemini 3 Pro 生成精美的 UI",
  "cli.install.copilot.question": "你是否拥有 GitHub Copilot 订阅？",
  "cli.install.copilot.options.no": "否",
  "cli.install.copilot.options.yes": "是",
  "cli.install.copilot.hints.no": "仅使用原生提供商",
  "cli.install.copilot.hints.yes": "原生提供商不可用时的回退选项",
  "cli.install.opencodeZen.question": "你是否拥有 OpenCode Zen 访问权限（opencode/ 模型）？",
  "cli.install.opencodeZen.options.no": "否",
  "cli.install.opencodeZen.options.yes": "是",
  "cli.install.opencodeZen.hints.no": "将使用其他已配置的提供商",
  "cli.install.opencodeZen.hints.yes": "opencode/claude-opus-4-5, opencode/gpt-5.2 等",
  "cli.install.zaiCodingPlan.question": "你是否拥有 Z.ai Coding Plan 订阅？",
  "cli.install.zaiCodingPlan.options.no": "否",
  "cli.install.zaiCodingPlan.options.yes": "是",
  "cli.install.zaiCodingPlan.hints.no": "将使用其他已配置的提供商",
  "cli.install.zaiCodingPlan.hints.yes": "Librarian 和多模态观察者的回退选项",
  "cli.install.kimiForCoding.question": "你是否拥有 Kimi For Coding 订阅？",
  "cli.install.kimiForCoding.options.no": "否",
  "cli.install.kimiForCoding.options.yes": "是",
  "cli.install.kimiForCoding.hints.no": "将使用其他已配置的提供商",
  "cli.install.kimiForCoding.hints.yes": "Sisyphus/Prometheus 的回退选项：Kimi K2.5",
  "cli.install.cancelled": "安装已取消。",
  "cli.install.modelAssignment": "模型分配",
  "cli.install.modelsAutoConfigured": "基于提供商优先级自动配置模型",

  "cli.doctor.summary": "摘要",
  "cli.doctor.passed": "{{count}} 通过",
  "cli.doctor.failed": "{{count}} 失败",
  "cli.doctor.warnings": "{{count}} 警告",
  "cli.doctor.skipped": "{{count}} 跳过",
  "cli.doctor.total": "总计: {{count}} 项检查 ({{duration}}秒)",
  "cli.doctor.issuesDetected": "发现问题 - 请查看上方详情",
  "cli.doctor.allSystemsWithWarnings": "所有系统运行正常，但有警告",
  "cli.doctor.allSystemsOperational": "所有系统运行正常",

  "cli.version.header": "oh-my-opencode 版本信息",
  "cli.version.currentVersion": "当前版本: {{version}}",
  "cli.version.currentVersionUnknown": "当前版本: 未知",
  "cli.version.latestVersion": "最新版本: {{version}}",
  "cli.version.upToDate": "您已经是最新版本！",
  "cli.version.updateAvailable": "有更新可用",
  "cli.version.runUpdate": "运行: cd ~/.config/opencode && bun update oh-my-opencode",
  "cli.version.localDev": "正在本地开发模式下运行",
  "cli.version.usingFileProtocol": "使用配置中的 file:// 协议",
  "cli.version.versionPinned": "版本已固定到 {{version}}",
  "cli.version.updateCheckSkipped": "已跳过固定版本的更新检查",
  "cli.version.unableToCheckUpdates": "无法检查更新",
  "cli.version.networkError": "网络错误或 npm 注册表不可用",
  "cli.version.versionInfoUnavailable": "版本信息不可用",

  "cli.run.message": "运行 OpenCode 并强制完成 todo/后台任务",
}

const locales = {
  ...en,
  ...overrides,
} satisfies Record<TranslationKey, string>

export default locales
