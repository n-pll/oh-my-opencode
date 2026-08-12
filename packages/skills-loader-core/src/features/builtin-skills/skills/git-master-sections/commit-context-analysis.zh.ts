export const GIT_MASTER_COMMIT_CONTEXT_ANALYSIS_SECTION_ZH = `## 阶段 0：并行上下文收集（强制第一步）

<parallel_analysis>
**并行执行以下所有命令以最小化延迟：**

\`\`\`bash
# 组 1：当前状态
git status
git diff --staged --stat
git diff --stat

# 组 2：历史上下文
git log -30 --oneline
git log -30 --pretty=format:"%s"

# 组 3：分支上下文
git branch --show-current
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master
git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "NO_UPSTREAM"
git log --oneline $(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)..HEAD 2>/dev/null
\`\`\`

**同时捕获这些数据点：**
1. 变更了哪些文件（暂存 vs 未暂存）
2. 最近 30 条提交消息用于风格检测
3. 分支相对于 main/master 的位置
4. 分支是否有上游跟踪
5. 将进入 PR 的提交（仅本地）
</parallel_analysis>

---

## 阶段 1：风格检测（阻塞 - 必须在进入阶段 2 前输出）

<style_detection>
**此阶段有强制输出** - 你必须在进入阶段 2 前打印分析结果。

### 1.1 语言特征检测

\`\`\`
从 git log -30 统计：
- 主导语言/脚本模式：N 条提交
- 次要语言/脚本模式：M 条提交
- 混合/模糊：K 条提交

决策：
- 在提交消息中保留仓库的主导语言模式
- 如果多种语言常见，对同一模块遵循最近的示例
- 永远不要将输出限制为特定语言；支持仓库使用的任何语言（如日语、韩语、英语等）
\`\`\`

### 1.2 提交风格分类

| 风格 | 模式 | 示例 | 检测正则 |
|-------|---------|---------|-----------------|
| \`SEMANTIC\` | \`type: message\` 或 \`type(scope): message\` | \`feat: add login\` | \`/^(feat\\|fix\\|chore\\|refactor\\|docs\\|test\\|ci\\|style\\|perf\\|build)(\\(.+\\))?:/\` |
| \`PLAIN\` | 仅描述，无前缀 | \`Add login feature\` | 无约定前缀，>3 个词 |
| \`SENTENCE\` | 完整句子风格 | \`Implemented the new login flow\` | 完整的语法句子 |
| \`SHORT\` | 最少关键词 | \`format\`、\`lint\` | 仅 1-3 个词 |

**检测算法：**
\`\`\`
semantic_count = 匹配 semantic 正则的提交
plain_count = 非 semantic 且 >3 个词的提交
short_count = <=3 个词的提交

如果 semantic_count >= 15（50%）：STYLE = SEMANTIC
否则如果 plain_count >= 15：STYLE = PLAIN
否则如果 short_count >= 10：STYLE = SHORT
否则：STYLE = PLAIN（安全默认值）
\`\`\`

### 1.3 强制输出（阻塞）

**你必须在进入阶段 2 前输出此块。无例外。**

\`\`\`
风格检测结果
======================
已分析：git log 的 30 条提交

语言特征：[主导语言或脚本]
  - 主导模式：N（X%）
  - 次要模式：M（Y%）

风格：[SEMANTIC | PLAIN | SENTENCE | SHORT]
  - Semantic（feat:、fix: 等）：N（X%）
  - Plain：M（Y%）
  - Short：K（Z%）

仓库中的参考示例：
  1. "来自 log 的实际提交消息"
  2. "来自 log 的实际提交消息"
  3. "来自 log 的实际提交消息"

所有提交将遵循：[主导语言或脚本] + [风格]
\`\`\`

**如果你跳过此输出，你的提交将是错误的。停下来重做。**
</style_detection>

---

## 阶段 2：分支上下文分析

<branch_analysis>
### 2.1 确定分支状态

\`\`\`
BRANCH_STATE:
  current_branch: <名称>
  has_upstream: true | false
  commits_ahead: N  # 仅本地提交
  merge_base: <哈希>

REWRITE_SAFETY:
  - 如果 has_upstream 且 commits_ahead > 0 且已推送：
    -> 在 force push 前警告
  - 如果无上游或所有提交都是本地：
    -> 可安全进行激进重写（fixup、reset、rebase）
  - 如果在 main/master 上：
    -> 永不重写，仅新提交
\`\`\`

### 2.2 历史重写策略决策

\`\`\`
如果 current_branch == main 或 current_branch == master：
  -> STRATEGY = NEW_COMMITS_ONLY
  -> 永不 fixup，永不 rebase

否则如果 commits_ahead == 0：
  -> STRATEGY = NEW_COMMITS_ONLY
  -> 无历史可重写

否则如果所有提交都是本地的（未推送）：
  -> STRATEGY = AGGRESSIVE_REWRITE
  -> 自由 fixup，需要时 reset，rebase 清理

否则如果已推送但未合并：
  -> STRATEGY = CAREFUL_REWRITE
  -> 可以 fixup 但警告 force push
\`\`\`
</branch_analysis>`
