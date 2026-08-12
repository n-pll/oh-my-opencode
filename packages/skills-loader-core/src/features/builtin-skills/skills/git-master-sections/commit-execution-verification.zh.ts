export const GIT_MASTER_COMMIT_EXECUTION_VERIFICATION_SECTION_ZH = `## 阶段 4：提交策略决策

<strategy_decision>
### 4.1 对每个提交组，决定：

\`\`\`
FIXUP 如果：
  - 改动是对已有提交意图的补充
  - 同一功能，修复 bug 或添加缺失部分
  - 纳入评审反馈
  - 目标提交存在于本地历史

新提交（NEW COMMIT）如果：
  - 新功能或能力
  - 独立的逻辑单元
  - 不同的 issue/ticket
  - 无合适的目标提交
\`\`\`

### 4.2 历史重建决策（激进选项）

\`\`\`
在以下情况考虑 RESET & REBUILD：
  - 历史混乱（已有许多小 fixup）
  - 提交不原子（混合关注点）
  - 依赖顺序错误

RESET 工作流：
  1. git reset --soft $(git merge-base HEAD main)
  2. 所有改动现在已暂存
  3. 以正确的原子单元重新提交
  4. 从头清理历史

仅当：
  - 所有提交都是本地的（未推送）
  - 用户明确允许或分支明显是 WIP
\`\`\`

### 4.3 最终计划摘要

\`\`\`yaml
EXECUTION_PLAN:
  strategy: FIXUP_THEN_NEW | NEW_ONLY | RESET_REBUILD
  fixup_commits:
    - files: [...]
      target: <哈希>
  new_commits:
    - files: [...]
      message: "..."
      level: N
  requires_force_push: true | false
\`\`\`
</strategy_decision>

---

## 阶段 5：提交执行

<execution>
### 5.1 注册 TODO 项

使用 TodoWrite 将每次提交注册为可跟踪项：
\`\`\`
- [ ] Fixup：<描述> -> <目标哈希>
- [ ] 新提交：<描述>
- [ ] Rebase autosquash
- [ ] 最终验证
\`\`\`

### 5.2 Fixup 提交（如有）

\`\`\`bash
# 为每个 fixup 暂存文件
git add <文件>
git commit --fixup=<目标哈希>

# 对所有 fixup 重复...

# 最后单次 autosquash rebase
MERGE_BASE=$(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)
GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash $MERGE_BASE
\`\`\`

### 5.3 新提交（在 fixup 之后）

对每个新提交组，按依赖顺序：

\`\`\`bash
# 暂存文件
git add <file1> <file2> ...

# 验证暂存
git diff --staged --stat

# 以检测到的风格提交
git commit -m "<匹配 COMMIT_CONFIG 的消息>"

# 验证
git log -1 --oneline
\`\`\`

### 5.4 提交消息生成

**基于阶段 1 的 COMMIT_CONFIG：**

\`\`\`
如果 style == SEMANTIC：
  -> 使用 semantic 前缀 + 仓库语言消息
  -> 示例：
     - "feat: add login feature"
     - "feat: ログイン機能を追加"
     - "feat: 로그인 기능 추가"

如果 style == PLAIN：
  -> 使用不带 semantic 前缀的纯仓库语言消息
  -> 示例：
     - "Add login feature"
     - "ログイン機能を追加"
     - "로그인 기능 추가"

如果 style == SHORT：
  -> "format" / "type fix" / "lint"
\`\`\`

**每次提交前验证：**
1. 消息是否匹配检测到的风格？
2. 消息是否使用仓库的主导语言/脚本特征（来自阶段 1.1）？
3. 是否与 git log 中的示例相似？

如果任何检查失败 -> 重写消息。
\`\`\`
</execution>

---

## 阶段 6：验证与清理

<verification>
### 6.1 提交后验证

\`\`\`bash
# 检查工作目录是否干净
git status

# 查看新历史
git log --oneline $(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)..HEAD

# 验证每次提交是原子的
# （心里检查：每次都能独立回滚吗？）
\`\`\`

### 6.2 Force Push 决策

\`\`\`
如果使用了 fixup 且分支有上游：
  -> 需要：git push --force-with-lease
  -> 警告用户 force push 的影响

如果只有新提交：
  -> 常规：git push
\`\`\`

### 6.3 最终报告

\`\`\`
提交摘要：
  策略：<做了什么>
  创建的提交数：N
  合并的 fixup 数：M

历史：
  <hash1> <message1>
  <hash2> <message2>
  ...

后续步骤：
  - git push [--force-with-lease]
  - 如果准备好了，创建 PR
\`\`\`
</verification>`
