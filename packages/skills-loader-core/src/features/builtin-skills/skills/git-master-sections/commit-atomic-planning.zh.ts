export const GIT_MASTER_COMMIT_ATOMIC_PLANNING_SECTION_ZH = `## 阶段 3：原子单元规划（阻塞 - 必须在进入阶段 4 前输出）

<atomic_planning>
**此阶段有强制输出** - 你必须在进入阶段 4 前打印提交计划。

### 3.0 先计算最小提交数

\`\`\`
公式：min_commits = ceil(file_count / 3)

 3 个文件 -> 最少 1 次提交
 5 个文件 -> 最少 2 次提交
 9 个文件 -> 最少 3 次提交
15 个文件 -> 最少 5 次提交
\`\`\`

**如果你计划的提交数 < min_commits -> 错了。继续拆分。**

### 3.1 先按目录/模块拆分（主要拆分）

**规则：不同目录 = 不同提交（几乎总是）**

\`\`\`
示例：8 个变更文件
  - app/[locale]/page.tsx
  - app/[locale]/layout.tsx
  - components/demo/browser-frame.tsx
  - components/demo/shopify-full-site.tsx
  - components/pricing/pricing-table.tsx
  - e2e/navbar.spec.ts
  - messages/en.json
  - messages/ko.json

错误：1 次提交 "Update landing page"（偷懒，错误）
错误：2 次提交（仍然太少）

正确：按目录/关注点拆分：
  - 提交 1：app/[locale]/page.tsx + layout.tsx（app 层）
  - 提交 2：components/demo/*（demo 组件）
  - 提交 3：components/pricing/*（定价组件）
  - 提交 4：e2e/*（测试）
  - 提交 5：messages/*（i18n）
  = 8 个文件 5 次提交（正确）
\`\`\`

### 3.2 再按关注点拆分（次要拆分）

**在同一目录内，按逻辑关注点拆分：**

\`\`\`
示例：components/demo/ 有 4 个文件
  - browser-frame.tsx（UI 框架）
  - shopify-full-site.tsx（特定 demo）
  - review-dashboard.tsx（新 - 特定 demo）
  - tone-settings.tsx（新 - 特定 demo）

选项 A（可接受）：如果全部紧密耦合，1 次提交
选项 B（首选）：2 次提交
  - 提交："更新现有 demo 组件"（browser-frame、shopify）
  - 提交："添加新 demo 组件"（review-dashboard、tone-settings）
\`\`\`

### 3.3 永远不要这样做（反模式示例）

\`\`\`
错误："重构整个落地页" - 1 次提交 15 个文件
错误："更新组件和测试" - 1 次提交混合关注点
错误："大更新" - 任何触及 5+ 无关文件的提交

正确：多个聚焦的提交，每个最多 1-4 个文件
正确：每条提交消息描述一个具体改动
正确：评审者能在 30 秒内理解每次提交
\`\`\`

### 3.4 实现 + 测试配对（强制）

\`\`\`
规则：测试文件必须与实现在同一次提交中

要匹配的测试模式：
- test_*.py <-> *.py
- *_test.py <-> *.py
- *.test.ts <-> *.ts
- *.spec.ts <-> *.ts
- __tests__/*.ts <-> *.ts
- tests/*.py <-> src/*.py
\`\`\`

### 3.5 强制理由（创建提交计划前）

**不可协商：在最终确定提交计划前，你必须：**

\`\`\`
对每个含 3+ 文件的计划提交：
  1. 列出此提交中的所有文件
  2. 用一句话解释它们为什么必须在一起
  3. 如果写不出这句话 -> 拆分

模板：
"提交 N 包含 [文件]，因为 [它们不可分割的具体原因]。"

有效理由：
  有效："实现文件 + 其直接测试文件"
  有效："类型定义 + 唯一使用它的文件"
  有效："迁移 + 模型变更（缺少任一个都会失败）"

无效理由（必须拆分）：
  无效："都与功能 X 相关"（太模糊）
  无效："属于同一个 PR"（不是理由）
  无效："它们一起被改了"（不是理由）
  无效："分组合理"（不是理由）
\`\`\`

**在执行提交前的分析中输出此理由。**

### 3.7 依赖排序

\`\`\`
级别 0：工具、常量、类型定义
级别 1：模型、schema、接口
级别 2：服务、业务逻辑
级别 3：API 端点、控制器
级别 4：配置、基础设施

提交顺序：级别 0 -> 级别 1 -> 级别 2 -> 级别 3 -> 级别 4
\`\`\`

### 3.8 创建提交组

对每个逻辑功能/变更：
\`\`\`yaml
- group_id: 1
  feature: "添加 Shopify 折扣删除"
  files:
    - errors/shopify_error.py
    - types/delete_input.py
    - mutations/update_contract.py
    - tests/test_update_contract.py
  dependency_level: 2
  target_commit: null | <existing-hash>  # null = 新提交，hash = fixup
\`\`\`

### 3.9 强制输出（阻塞）

**你必须在进入阶段 4 前输出此块。无例外。**

\`\`\`
提交计划
===========
变更文件数：N
最少需要的提交数：ceil(N/3) = M
计划提交数：K
状态：K >= M（通过）| K < M（失败 - 必须继续拆分）

提交 1：[检测到的风格的消息]
  - path/to/file1.py
  - path/to/file1_test.py
  理由：实现 + 其测试

提交 2：[检测到的风格的消息]
  - path/to/file2.py
  理由：独立的工具函数

提交 3：[检测到的风格的消息]
  - config/settings.py
  - config/constants.py
  理由：紧密耦合的配置变更

执行顺序：提交 1 -> 提交 2 -> 提交 3
（遵循依赖：级别 0 -> 级别 1 -> 级别 2 -> ...）
\`\`\`

**执行前验证：**
- 每次提交 <=4 个文件（或有理由）
- 每条提交消息匹配检测到的风格 + 语言
- 测试文件与实现配对
- 不同目录 = 不同提交（或有理由）
- 总提交数 >= min_commits

**如果任何检查失败，不要继续。重新规划。**
</atomic_planning>`
