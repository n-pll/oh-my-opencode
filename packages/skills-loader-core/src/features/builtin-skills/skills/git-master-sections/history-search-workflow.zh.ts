export const GIT_MASTER_HISTORY_SEARCH_WORKFLOW_SECTION_ZH = `## 历史搜索模式（阶段 H1-H3）

## 阶段 H1：确定搜索类型

<history_search_type>
### H1.1 解析用户请求

| 用户请求 | 搜索类型 | 工具 |
|--------------|-------------|------|
| 任何语言的 "X 何时添加"（如 "X什么时候加的"、"Xがいつ追加された"） | PICKAXE | \`git log -S\` |
| "查找改动 X 模式的提交" | REGEX | \`git log -G\` |
| 任何语言的 "谁写了这行"（如 "这行谁写的"、"この行を書いたのは誰"） | BLAME | \`git blame\` |
| 任何语言的 "bug 何时出现"（如 "bug什么时候有的"、"バグはいつ入った"） | BISECT | \`git bisect\` |
| 任何语言的 "文件历史"（如 "文件历史"、"ファイル履歴"） | FILE_LOG | \`git log -- path\` |
| 任何语言的 "查找已删除代码"（如 "查找删除的代码"、"削除されたコードを探す"） | PICKAXE_ALL | \`git log -S --all\` |

### H1.2 提取搜索参数

\`\`\`
从用户请求中识别：
- SEARCH_TERM：要查找的字符串/模式
- FILE_SCOPE：特定文件还是整个仓库
- TIME_RANGE：全部时间还是特定时间段
- BRANCH_SCOPE：当前分支还是 --all 所有分支
\`\`\`
</history_search_type>

---

## 阶段 H2：执行搜索

<history_search_exec>
### H2.1 Pickaxe 搜索（git log -S）

**用途**：查找添加或删除特定字符串的提交

\`\`\`bash
# 基础：查找字符串何时被添加/删除
git log -S "searchString" --oneline

# 带上下文（查看实际改动）：
git log -S "searchString" -p

# 在特定文件中：
git log -S "searchString" -- path/to/file.py

# 跨所有分支（查找已删除代码）：
git log -S "searchString" --all --oneline

# 带日期范围：
git log -S "searchString" --since="2024-01-01" --oneline

# 不区分大小写：
git log -S "searchstring" -i --oneline
\`\`\`

**示例用例：**
\`\`\`bash
# 这个函数何时添加的？
git log -S "def calculate_discount" --oneline

# 这个常量何时删除的？
git log -S "MAX_RETRY_COUNT" --all --oneline

# 查找谁引入了 bug 模式
git log -S "== None" -- "*.py" --oneline  # 应该是 "is None"
\`\`\`

### H2.2 正则搜索（git log -G）

**用途**：查找 diff 匹配正则模式的提交

\`\`\`bash
# 查找触及匹配模式行的提交
git log -G "pattern.*regex" --oneline

# 查找函数定义改动
git log -G "def\\s+my_function" --oneline -p

# 查找 import 改动
git log -G "^import\\s+requests" -- "*.py" --oneline

# 查找 TODO 添加/删除
git log -G "TODO|FIXME|HACK" --oneline
\`\`\`

**-S vs -G 区别：**
\`\`\`
-S "foo"：查找 "foo" 计数发生改动的提交
-G "foo"：查找 diff 中包含 "foo" 的提交

-S 用于："X 何时添加/删除"
-G 用于："哪些提交触及了包含 X 的行"
\`\`\`

### H2.3 Git Blame

**用途**：逐行归因

\`\`\`bash
# 基础 blame
git blame path/to/file.py

# 特定行范围
git blame -L 10,20 path/to/file.py

# 显示原始提交（忽略移动/复制）
git blame -C path/to/file.py

# 忽略空白改动
git blame -w path/to/file.py

# 显示邮箱而非姓名
git blame -e path/to/file.py

# 用于解析的输出格式
git blame --porcelain path/to/file.py
\`\`\`

**阅读 Blame 输出：**
\`\`\`
^abc1234 (Author Name 2024-01-15 10:30:00 +0900 42) code_line_here
|         |            |                       |    +-- 行内容
|         |            |                       +-- 行号
|         |            +-- 时间戳
|         +-- 作者
+-- 提交哈希（^ 表示初始提交）
\`\`\`

### H2.4 Git Bisect（二分查找 bug）

**用途**：找到引入 bug 的确切提交

\`\`\`bash
# 开始 bisect 会话
git bisect start

# 标记当前（坏）状态
git bisect bad

# 标记已知好的提交（如上一个发布）
git bisect good v1.0.0

# Git 检出中间提交。测试它，然后：
git bisect good  # 如果这个提交没问题
git bisect bad   # 如果这个提交有 bug

# 重复直到 git 找到罪魁祸首提交
# Git 会输出："abc1234 is the first bad commit"

# 完成后，返回原始状态
git bisect reset
\`\`\`

**自动化 Bisect（带测试脚本）：**
\`\`\`bash
# 如果你有一个在 bug 时失败的测试：
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
git bisect run pytest tests/test_specific.py

# Git 自动在每个提交上运行测试
# 退出 0 = 好，退出 1-127 = 坏，退出 125 = 跳过
\`\`\`

### H2.5 文件历史追踪

\`\`\`bash
# 文件的完整历史
git log --oneline -- path/to/file.py

# 跨重命名追踪文件
git log --follow --oneline -- path/to/file.py

# 显示实际改动
git log -p -- path/to/file.py

# 不再存在的文件
git log --all --full-history -- "**/deleted_file.py"

# 谁最常改这个文件
git shortlog -sn -- path/to/file.py
\`\`\`
</history_search_exec>

---

## 阶段 H3：呈现结果

<history_results>
### H3.1 格式化搜索结果

\`\`\`
搜索查询："<用户问了什么>"
搜索类型：<PICKAXE | REGEX | BLAME | BISECT | FILE_LOG>
使用的命令：git log -S "..." ...

结果：
  提交          日期           消息
  ---------    ----------     --------------------------------
  abc1234      2024-06-15     feat: add discount calculation
  def5678      2024-05-20     refactor: extract pricing logic

最相关的提交：abc1234
详情：
  作者：John Doe <john@example.com>
  日期：2024-06-15
  变更文件数：3

DIFF 摘录（如适用）：
  + def calculate_discount(price, rate):
  +     return price * (1 - rate)
\`\`\`

### H3.2 提供可操作的上下文

根据搜索结果，提供相关后续操作：

\`\`\`
发现提交 abc1234 引入了此改动。

潜在操作：
- 查看完整提交：git show abc1234
- 回滚此提交：git revert abc1234
- 查看相关提交：git log --ancestry-path abc1234..HEAD
- Cherry-pick 到另一个分支：git cherry-pick abc1234
\`\`\`
</history_results>`
