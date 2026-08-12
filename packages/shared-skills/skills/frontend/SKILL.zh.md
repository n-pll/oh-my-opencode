---
name: frontend
description: "前端/web UI/UX/视觉相关工作必须使用：构建、样式、重设计页面或组件、React 配置、性能审计、视觉 QA、品味与打磨。路由四套规则集：design taste router 与品牌参考；perfection 用于 Playwright/Chromium Lighthouse/Core Web Vitals；ui-ux-db 提供配色/字体/指南；designpowers 提供角色画像/无障碍/评审/交接；外加 curl-only lazyweb 真实应用界面研究，以及 beui.dev 交互目录。触发词：frontend, UI, UX, design, redesign, styling, layout, animation, motion, interaction, micro-interaction, make it feel alive, premium, luxury, minimal, brutalist, Awwwards, DESIGN.md, mockup, React, Lighthouse, accessibility, WCAG, Core Web Vitals, looks generic, make it pretty, like X brand, lazyweb, design research."
---

# Frontend

本文件是路由器，不是规则手册。真正的规则位于 `references/` 下的四套规则集中 - 你的首要任务是加载覆盖该请求的最小文件集合，用一句话说明你加载了哪些，然后在其指导下执行。什么都不加载而即兴发挥，会产出本技能旨在杜绝的千篇一律 AI 流水线输出；全部加载则浪费上下文，还会产生相互矛盾的指令。

**标准不是「干净且正确」 - 而是 Linear、Stripe 或 Supabase 的资深设计师愿意发布的那种作品。** 正确但平庸属于失败，不是完成。像保护构建一样严格地保护界面表层：设计是一等交付物，不是一次性拍板就走的决策。

## Phase 0 - 路由（在任何 UI 工作之前）

| 请求涉及…… | 阅读 |
|---|---|
| 任何 UI 实现、样式、重设计、原型或视觉决策 | 先读 `references/design/README.md`。它强制两道必过关卡 - 设计系统关卡（在编写任何组件之前必须存在一个 `DESIGN.md`）和 React 开发工具关卡（默认安装 react-grab / react-scan / react-doctor）- 随后路由到下方的品味与品牌参考。 |
| 交互或动效工作 - 微交互、动画组件、转场、手势、hover/press/state 反馈、"make it feel alive" | 另读 `references/design/interaction-skill.md`。beui.dev 目录是必用的交互参考：找到最接近的模式，通过该文件中的 curl 方案阅读其真实源码，再将机制适配到 `DESIGN.md` 的 motion token。它叠加在路由出的 style 技能之上 - 永不替换它。 |
| 编写或修改前端代码，或审计性能/SEO/无障碍/质量 | 另读 `references/perfection/README.md`。在真实的 Playwright Chromium 上测量（绝不使用 `lighthouse` CLI），每个类别都达到 Lighthouse 100，通过架构达成 - 绝不是靠砍动画或藏内容。 |
| 查找具体的样式、配色板、字体搭配、图表类型、落地页结构或 UX 指南 - 或根据关键词生成项目设计系统 | `references/ui-ux-db/README.md`。一个带 CLI 的可搜索 CSV 数据库；是查询工具，不是姿态。按需加载；`design` 仍是品味与 `DESIGN.md` 契约的唯一真相来源。 |
| 任何创建或更新 `DESIGN.md` 的实现或重设计 - 加上显式的运营层诉求（角色画像、评审、债务、交接、合成用户测试） | `references/designpowers/README.md` + `references/designpowers/lane-c-review.md`。属于内部前端规则集，不是独立技能：lane-c 是 Phase Final 的扁平化/评审审阅者，其无障碍约束与已接受债务用语填入必需的 `DESIGN.md` 小节。其他 lane 仅在其所处阶段适用时才加载。 |

**对于实现工作，design 与 perfection 一并加载。** 一个 Lighthouse 100 但看起来像 AI 流水线的页面已经失败；一个漂亮但打包 2 MB 的页面也失败了。两者要么都赢，要么都不算赢。

## 设计系统与组件工作流

每个实现在修改 UI 代码之前，必须从以下分支中选择其一：

1. **具体的视觉参考：** 用户提供了参考 - 把它当作视觉契约，再按类型处理：
   - **静态视觉参考**（截图、生成的原型、Stitch/Imagen 输出、Figma 导出、overview 或标注资料包）：加载 `references/design/image-to-code-skill.md` 以及相关 design/perfection 文件，将该参考的精确 token、布局几何、文案、间距、状态与响应式意图抽取到 `DESIGN.md`，然后按该契约实现可复用的基础原语。
   - **在线站点或 URL 参考**（用户点名要克隆某站或给出 URL）：加载 `references/design/clone-from-url.md`。驱动真实浏览器，通过 `getComputedStyle` 抽取运行时真相 - token、布局几何、default/hover/focus/active 状态、转场与 keyframes、以及下载的资源 - 写入 `DESIGN.md`，再按该契约克隆出可复用基础原语。
   两者的最终 QA 都在参考保真模式下运行 `/visual-qa`：把实际 UI 与参考逐像素对比，并验证代码是一个可扩展的设计系统实现，而不是一次性贴图式复刻。
2. **全新或从零搭建：** 如果用户未给出具体视觉参考，设计研究就是一道带具名交付物的构建步骤 - 不是要被砍预算的探索。那种「探索够了就停」的本能（"enough exploration"、两轮上限）在此不适用。在 `DESIGN.md` 写就之前并行启动每条研究 lane，并用一个 `## 0. Research Log` 小节开篇，记录每条 lane 的交付物 - 一条没有 Research Log 记录的 lane 等于没跑。仅当某 lane 的工具或网络确实不可用时才跳过它，并在 `DESIGN.md` 中注明跳过：
   - **内嵌参考：** 用 `references/design/_INDEX.md` 圈定 2-3 个 plausible 的 Layer B 参考，然后完整地读恰好一个 Layer A style 技能与一个 Layer B 参考 - 每一行都要读，不做部分读取（它们有 200-500 行；切片读取会产出这道关卡旨在杜绝的扁平 token 集合）。记录候选清单、选定项及理由。仅当精选集合都不合适时才用 `open-design`；配色/字体/领域问题可追加 `ui-ux-db` 查询。
   - **Lazyweb 真实产品界面：** 先读 `references/design/lazyweb.md` 并逐字执行其方案 - 不要对 lazyweb.com 即兴发起 curl 调用；该方案会自行铸造匿名 token。记录运行的查询、实际查看过的界面数量，以及从中采集到的布局语法 - 绝不是像素拷贝。
   - **Imagen 概念稿：** 生成 2-3 份 imagen 概念稿，每份都以加载的 Layer A + Layer B token（配色、字体、材质）作种；挑出最强者，把选定稿当作参考保真契约。记录稿路径与选定项。
   将每条 lane 综合进 `DESIGN.md`。把来源当作素材，而不是氛围标签：抽取 token、布局语法、组件解剖、交互状态、动效与品味决策，再重组为项目专属的基础原语。在安排各小节之前，先盘点内容块并为每个块指派一项任务 - hook、解释、证明、对比、转化、导航、留存 - 再按访客的决策路径而非视觉对称性来排序。绝不脱离所选参考即兴发挥，绝不复制 logo 或品牌专属文案。然后在任何产品界面之前，运行 Primitive Showcase Gate（`references/design/README.md` Phase 0）。
3. **已有项目且带 `DESIGN.md` 或组件系统：** 先读、遵循，仅在所请求的工作需要新增 token、原语、状态、动效规则、无障碍约束、已接受债务或参考保真要求时，才在实现之前更新它。
4. **已有 UI 但既无 `DESIGN.md` 也无可复用组件层的项目：** 停下并向用户提一个聚焦的问题：是复制就近的样式以保留当前外观，还是在继续之前抽取一份真正的 `DESIGN.md` 与可复用组件？不要默默替用户做选择。

对于创建或更新 `DESIGN.md` 的实现、重设计或设计系统工作，`references/designpowers/README.md` + `lane-c-review.md` 属于默认加载的一部分 - 把其中的角色画像、无障碍、评审、债务、交接与角色参考指引喂入上方分支。最终产出的 `DESIGN.md` 就是实现契约：token、排版、间距、基础原语、动效、响应式行为、无障碍约束与已接受债务，都必须在代码使用之前于其中命名。用真实的视觉 QA 证据核验组件原语、状态与最终界面；对重要的实现工作，把设计系统决策、实现证据与未决债务传入 `/review-work`。

## Ruleset 1 - design（`references/design/`）

参考库有一个架构文件、12 个品味技能（Layer A - *如何执行*）以及 70 个品牌设计系统（Layer B - *该长什么样*）。大多数有分量的任务加载 **一个 Layer A + 一个 Layer B**。`README.md` 承载完整路由流程、叠加规则、反模式以及强制的基于浏览器的 Design QA 阶段；`_INDEX.md` 编目全部 83 个文件并附带氛围到品牌的映射 - 每当下方表格无法直接路由时就读它。

### Layer 0 - 架构

| 文件 | 何时阅读 |
|---|---|
| `design-system-architecture.md` | 项目还没有 `DESIGN.md`（定义你必须先创建的结构 - 8 个小节，外加仅用于全新项目的 `## 0. Research Log`），或你正从既有 UI 代码抽取设计系统时。 |

### Layer A - 品味技能（至多选一个 style 技能；它们编码的是相互对立的哲学）

| 文件 | 当用户说……时阅读 |
|---|---|
| `taste-skill.md` | 中性或运营型 UI，没有界面表层追求 - 内部工具、仪表盘、"just make it usable"。安全的默认项；当 brief 暗示 glossy / premium / startup-grade 工艺时，不要停留在此。 |
| `gpt-tasteskill.md` | "Awwwards-tier"、"wow factor"、"cinematic"、"scroll-triggered" 的营销/落地体验。 |
| `minimalist-skill.md` | "minimal"、"clean"、"Notion-like"、"Linear-like"、"editorial"。 |
| `brutalist-skill.md` | "brutalist"、"raw"、"Swiss"、"experimental"、"anti-design"。 |
| `soft-skill.md` | "premium"、"luxury"、"calm"、"expensive"、"elegant"，以及 glossy / glassy / liquid-glass / startup-grade 的产品界面 - 搭配一个高工艺的 Layer B（`supabase`、`linear.app`、`vercel`、`stripe`）。 |
| `redesign-skill.md` | 改进既有 UI - "this looks bad"、"fix the design"。先审计后动手的工作流；绝不用于全新项目。 |
| `image-to-code-skill.md` | "Generate the design first, then code it." 搭配下方某个 imagegen 文件。 |
| `output-skill.md` | 当输出不完整时叠加到任意 style 技能 - 占位符、`// TODO`、半成品组件。 |
| `stitch-skill.md` | 当需要 Google Stitch 兼容或 `DESIGN.md` 文档导出时叠加到任意 style 技能。一份完整的示例导出以 `stitch-design-example.md` 形式发布。 |
| `interaction-skill.md` | 当工作新增或修改交互/动效时叠加到任意 style 技能。以 beui.dev 为锚：在设计交互前先阅读映射组件的源码；始终支持 reduced motion。 |
| `imagegen-frontend-web.md` / `imagegen-frontend-mobile.md` / `imagegen-brandkit.md` | 仅图像输出（原型、应用界面概念稿、品牌板）。它们绝不写代码 - 如果需要代码就切换到 `image-to-code-skill.md`。 |

### Layer B - 品牌设计系统（与 Layer A 正交；可自由叠加）

当用户点名一个品牌或站点 - "Linear-style"、"like Stripe's landing"、"Aside-style browser agent" - 加载 `references/design/<brand>.md` 作为 token 真相来源（配色、字体比例、组件、do/don't）。覆盖范围包括 `aside` `apple` `stripe` `linear.app` `notion` `vercel` `claude` `figma` `airbnb` `nike` `tesla` `spotify` `raycast` `revolut` 及约 56 个更多品牌；带氛围快捷方式的完整列表在 `_INDEX.md`。抽取 token 并应用到项目自己的内容上 - 绝不复制 logo 或带商标的图像。若点名的品牌缺失，回退到 Layer A 的氛围匹配或 `open-design` 技能。

### React 开发工具

| 文件 | 何时阅读 |
|---|---|
| `react-dev-tooling-skill.md` | 某 React 项目缺少 react-grab / react-scan / react-doctor，或你需要各框架的安装片段以及仅开发期的门控模式（`NODE_ENV === 'development'`）。 |

## Ruleset 2 - perfection（`references/perfection/`）

| 文件 | 何时阅读 |
|---|---|
| `README.md` | 任何编写或审计前端代码时。承载七条原则：仅真实浏览器审计、每类别都 100 的底线、在架构层修复、绝不为分数削弱 UX、设计系统合规检查，以及审计报告的响应格式。 |
| `react-perf-tooling.md` | 在任何 React 审计之前。包含 Playwright + `playwright-lighthouse` + `react-scan/lite` 注入方案、按路由的渲染预算，以及 React 专属的根因清单。Lighthouse 100 但有 30+ 次多余渲染，不算完成。 |

审计 CLI（先构建生产版本；绝不测量 dev server）：

```bash
uv run $SKILL_DIR/scripts/perfection/lighthouse-audit.py https://localhost:3000
```

同时跑移动端与桌面端预设，3-5 次，取中位数，从 JSON 报告中诊断问题。

## Ruleset 3 - ui-ux-db（`references/ui-ux-db/`）

`README.md` 文档化了搜索 CLI 以及 master-plus-overrides 持久化模式。该 CLI（从规则集目录运行以便它能找到 `data/`）：

```bash
python3 $SKILL_DIR/references/ui-ux-db/scripts/search.py "<query>" --design-system -p "Project"   # 完整生成设计系统
python3 $SKILL_DIR/references/ui-ux-db/scripts/search.py "<query>" --domain <domain>             # 定向查询
python3 $SKILL_DIR/references/ui-ux-db/scripts/search.py "<query>" --stack <stack>               # 技术栈最佳实践
```

领域（Domains）：`product` `style` `typography` `color` `landing` `chart` `ux` `react` `web` `prompt`。技术栈（Stacks）：`html-tailwind`（默认）`react` `nextjs` `vue` `svelte` `astro` `swiftui` `react-native` `flutter` `shadcn` `jetpack-compose`。

## Ruleset 4 - designpowers（`references/designpowers/`）

`README.md` 把来自 pinned `Owl-Listener/designpowers` 参考语料库的设计运营层指引路由进既有前端工作流。在每次创建或更新 `DESIGN.md` 的实现或重设计中，以及当某项任务需要显式角色画像、无障碍与认知约束、设计评审、设计债务、交接、合成用户测试、动效指引或角色参考提示时，加载它 - 并连同 `lane-c-review.md`。它不替换本 frontend 技能，也不替换 `/visual-qa`、`/ulw-plan`、`/start-work` 或 `/review-work`；它提供更丰富的设计上下文，这些上下文必须先蒸馏进项目 `DESIGN.md`，再作为实现与核验所用的设计系统契约。

## 快速路由 - 最常见请求

| 请求 | 加载 |
|---|---|
| "做一个落地页"（未给方向） | `design/README.md` + `design/_INDEX.md` 候选清单 → 恰好一个 Layer B 参考 + `design/taste-skill.md` + `perfection/README.md` |
| "Aside 风格 AI 浏览器/浏览器 agent 页面" | `design/README.md` + `design/aside.md` + `design/taste-skill.md` + `perfection/README.md` |
| "Linear 风格落地页" | `design/README.md` + `design/linear.app.md` + `design/taste-skill.md` + `perfection/README.md` |
| "像 Stripe 那样的 premium SaaS hero" | `design/README.md` + `design/stripe.md` + `design/soft-skill.md` + `perfection/README.md` |
| "改进这个现有仪表盘" | `design/README.md` + `design/redesign-skill.md` + `perfection/README.md` |
| "加微交互" / "给它加动画" / "make it feel alive" / "打磨交互" | `design/README.md` + 在当前 style 技能之上叠加 `design/interaction-skill.md` + `perfection/README.md` |
| "把这个截图 / Imagen 稿 / Stitch 输出一比一做出来" | `design/README.md` + `design/image-to-code-skill.md` + `perfection/README.md` + `/visual-qa` 参考保真模式 |
| "审计我的网站" / "让这个页面更快" | `perfection/README.md`（若是 React 则加 `perfection/react-perf-tooling.md`） |
| "做一个金融科技 App 的原型图" - 无代码 | `design/imagegen-frontend-mobile.md`（若点名品牌则加一个 Layer B） |
| "什么配色/字体适合一个健康品牌？" | `ui-ux-db/README.md` → 搜索 CLI |
| "这个领域已上线的 App 长什么样？" / 设计方向研究 | `design/lazyweb.md`（仅 curl）+ `design/_INDEX.md` 候选清单 |
| "配置这个 React 项目" | `design/README.md` + `design/react-dev-tooling-skill.md` |
| "用 designpowers"、"让设计工作流更强"、"加角色画像/无障碍/债务/交接" | `design/README.md` + `designpowers/README.md`（若后续是实现或审计则加 `perfection/README.md`） |

## 共享公理（四套规则集一致同意 - 始终适用）

- **没有设计系统 = 不做 UI 工作。** 组件存在之前 `DESIGN.md` 先存在；每种颜色、字号和间距值都要追溯到其中的一个 token。
- **具体参考 = 契约。** 当存在截图、生成的原型、overview 或标注参考时，实现必须匹配其像素、文案、组件结构与响应式意图，除非用户明确接受偏离。
- **绝不为了刷分而削弱 UX 或压平界面表层。** 不要为了 Lighthouse 分数或死线去砍动画、藏内容、简化交互，或把渲染/光影材质替换成纯色填充与扁平几何原语。既要 100 分，又要保持界面表层的立体感 - 两者兼顾，或都不算。
- **不要用 emoji 当图标。** 只用 SVG 图标集（Lucide、Heroicons、Radix、Phosphor）。
- **仅 GPU 合成动画** - `transform`、`opacity`、`filter`；绝不动画化布局属性。
- **禁止流水线式动画 - 动效必须服务于意义。** 每个动画或 hover 都要映射到真实的交互、状态变化或可供性。一个什么都不改变的 hover、非交互元素上的动效，或没有信息目的的装饰性微动画，都属于流水线式产物 - 不要添加。
- **完成以 `/visual-qa` 的双预言机关卡为准，而非你自己的一瞥。** 前端设计任务通过 `/visual-qa` 验证（在 375 / 768 / 1280px 的真实浏览器上、每个页面、驱动并检查交互状态与动效），直到双预言机完成关卡在新鲜证据上通过为止。

## 何时改为加载其他技能

| 情况 | 加载 |
|---|---|
| 品牌/风格不在 `references/design/` 那 70 个之中，或用户说 "Open Design" | `open-design` 技能 - 本地的 nexu-io/open-design 库（137+ 设计技能、150+ 设计系统） |
| 在 Design QA 阶段驱动浏览器 | `agent-browser` 技能 |
| 没有任何视觉界面的纯 TypeScript/逻辑工作 | 仅 `programming` 技能 - 本技能在此无所增益 |

## 激活

适用于任何前端、web UI、UX、视觉、设计、样式、布局、动画、性能、无障碍或 SEO 工作 - 构建、重设计、审计或生成原型。不适用于后端、CLI 或没有任何视觉界面的纯逻辑任务。
