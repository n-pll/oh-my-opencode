export const GIT_MASTER_REBASE_WORKFLOW_SECTION_ZH = `## REBASE 模式（阶段 R1-R4）

## 阶段 R1：Rebase 上下文分析

<rebase_context>
### R1.1 并行信息收集

\`\`\`bash
# 并行执行全部
git branch --show-current
git log --oneline -20
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master
git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "NO_UPSTREAM"
git status --porcelain
git stash list
\`\`\`

### R1.2 安全评估

| 条件 | 风险等级 | 操作 |
|-----------|------------|--------|
| 在 main/master 上 | 严重 | **中止** - 永不 rebase main |
| 脏工作目录 | 警告 | 先暂存：\`git stash push -m "pre-rebase"\` |
| 存在已推送提交 | 警告 | 将需要 force-push；与用户确认 |
| 所有提交都是本地 | 安全 | 自由进行 |
| 上游已分叉 | 警告 | 可能需要 \`--onto\` 策略 |

### R1.3 确定 Rebase 策略

\`\`\`
用户请求 -> 策略：

任何语言的 "squash commits" 意图（如 "cleanup"、"整理"、"履歴整理"）
  -> INTERACTIVE_SQUASH

任何语言的 "rebase on main" 意图（如 "update branch"、"变基到主分支"、"mainにリベース"）
  -> REBASE_ONTO_BASE

"autosquash" / "apply fixups"
  -> AUTOSQUASH

任何语言的 "reorder commits" 意图（如 "提交顺序"、"コミット順を並べ替え"）
  -> INTERACTIVE_REORDER

任何语言的 "split commit" 意图（如 "拆分提交"、"コミット分割"）
  -> INTERACTIVE_EDIT
\`\`\`
</rebase_context>

---

## 阶段 R2：Rebase 执行

<rebase_execution>
### R2.1 交互式 Rebase（Squash/重排）

\`\`\`bash
# 找到 merge-base
MERGE_BASE=$(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)

# 开始交互式 rebase
# 注意：不能交互式使用 -i。用 GIT_SEQUENCE_EDITOR 自动化。

# 对于 SQUASH（全部合并为一个）：
git reset --soft $MERGE_BASE
git commit -m "Combined: <概括所有改动>"

# 对于选择性 SQUASH（保留一些，压缩另一些）：
# 使用 fixup 方法 - 标记要压缩的提交，然后 autosquash
\`\`\`

### R2.2 Autosquash 工作流

\`\`\`bash
# 当你有 fixup! 或 squash! 提交时：
MERGE_BASE=$(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)
GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash $MERGE_BASE

# GIT_SEQUENCE_EDITOR=: 技巧自动接受 rebase todo
# Fixup 提交自动合并到其目标
\`\`\`

### R2.3 Rebase Onto（分支更新）

\`\`\`bash
# 场景：你的分支落后于 main，需要更新

# 简单 rebase 到 main：
git fetch origin
git rebase origin/main

# 复杂：将提交移到不同的基
# git rebase --onto <newbase> <oldbase> <branch>
git rebase --onto origin/main $(git merge-base HEAD origin/main) HEAD
\`\`\`

### R2.4 处理冲突

\`\`\`
检测到冲突 -> 工作流：

1. 识别冲突文件：
   git status | grep "both modified"

2. 对每个冲突：
   - 读取文件
   - 理解两个版本（HEAD vs incoming）
   - 通过编辑文件解决
   - 移除冲突标记（<<<<、====、>>>>）

3. 暂存已解决的文件：
   git add <已解决文件>

4. 继续 rebase：
   git rebase --continue

5. 如果卡住或困惑：
   git rebase --abort  # 安全回滚
\`\`\`

### R2.5 恢复程序

| 情况 | 命令 | 说明 |
|-----------|---------|-------|
| Rebase 出错 | \`git rebase --abort\` | 返回 rebase 前状态 |
| 需要原始提交 | \`git reflog\` -> \`git reset --hard <hash>\` | Reflog 保留 90 天 |
| 不小心 force-push 了 | \`git reflog\` -> 与团队协调 | 可能需要通知他人 |
| Rebase 后丢失提交 | \`git fsck --lost-found\` | 核弹级选项 |
</rebase_execution>

---

## 阶段 R3：Rebase 后验证

<rebase_verify>
\`\`\`bash
# 验证干净状态
git status

# 检查新历史
git log --oneline $(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)..HEAD

# 验证代码仍然可用（如果存在测试）
# 运行项目特定的测试命令

# 如需要，与 rebase 前比较
git diff ORIG_HEAD..HEAD --stat
\`\`\`

### Push 策略

\`\`\`
如果分支从未推送：
  -> git push -u origin <branch>

如果分支已推送：
  -> git push --force-with-lease origin <branch>
  -> 始终使用 --force-with-lease（而非 --force）
  -> 防止覆盖他人的工作
\`\`\`
</rebase_verify>

---

## 阶段 R4：Rebase 报告

\`\`\`
REBASE 摘要：
  策略：<SQUASH | AUTOSQUASH | ONTO | REORDER>
  提交数（前）：N
  提交数（后）：M
  解决的冲突数：K

历史（rebase 后）：
  <hash1> <message1>
  <hash2> <message2>

后续步骤：
  - git push --force-with-lease origin <branch>
  - 合并前评审改动
\`\`\``
