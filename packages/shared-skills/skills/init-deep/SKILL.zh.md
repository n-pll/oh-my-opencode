---
name: init-deep
description: "(builtin) 初始化分层式 AGENTS.md 知识库"
---
# /init-deep

生成分层式 AGENTS.md 文件。包含根目录 + 按复杂度评分的子目录。

## 用法

```
/init-deep                      # 更新模式: 修改已有文件 + 在合适位置创建新文件
/init-deep --create-new         # 读取已有 -> 全部删除 -> 从零重新生成
/init-deep --max-depth=2        # 限制目录深度 (默认: 3)
```

---

## 工作流 (高层概览)

1. **发现 + 分析** (并发)
   - 立即启动后台 explore agent
   - 主会话: bash 结构分析 + LSP/codegraph 代码地图 + 读取已有 AGENTS.md
2. **评分与决策** - 根据合并后的发现确定 AGENTS.md 位置
3. **生成** - 先根目录, 再并行生成子目录
4. **审查** - 去重, 精简, 校验

<critical>
**所有阶段都要用 TodoWrite 记录。实时标记 in_progress -> completed。**
```
TodoWrite([
  { id: "discovery", content: "Fire explore agents + LSP/codegraph map + read existing", status: "pending", priority: "high" },
  { id: "scoring", content: "Score directories, determine locations", status: "pending", priority: "high" },
  { id: "generate", content: "Generate AGENTS.md files (root + subdirs)", status: "pending", priority: "high" },
  { id: "review", content: "Deduplicate, validate, trim", status: "pending", priority: "medium" }
])
```
</critical>

---

## 阶段 1: 发现 + 分析 (并发)

**将 "discovery" 标记为 in_progress。**

### 立即启动后台 Explore Agent

不要等待 - 这些在主会话工作时异步运行。**为每个 agent 配备代码图**: 任何涉及结构、入口点、依赖或热点的任务都必须查询 `codegraph_*` (explore/search/callers/callees/impact) 以及 (若存在) `lsp_symbols`, 并基于这些数据得出结论, 而不是凭约定猜测。每个 agent 获得的真实图上下文越丰富, 项目地图就越准确。

```
// 一次性全部启动, 稍后收集结果
task(subagent_type="explore", load_skills=[], description="Explore project structure", run_in_background=true, prompt="Project structure: map real layout via codegraph_explore/codegraph_files → REPORT deviations from standard patterns")
task(subagent_type="explore", load_skills=[], description="Find entry points", run_in_background=true, prompt="Entry points: FIND main files, trace reach via codegraph_callees + lsp_symbols → REPORT non-standard organization")
task(subagent_type="explore", load_skills=[], description="Find conventions", run_in_background=true, prompt="Conventions: FIND config files (.eslintrc, pyproject.toml, .editorconfig) → REPORT project-specific rules")
task(subagent_type="explore", load_skills=[], description="Find anti-patterns", run_in_background=true, prompt="Anti-patterns: FIND 'DO NOT', 'NEVER', 'ALWAYS', 'DEPRECATED' comments → LIST forbidden patterns")
task(subagent_type="explore", load_skills=[], description="Explore build/CI", run_in_background=true, prompt="Build/CI: FIND .github/workflows, Makefile → REPORT non-standard patterns")
task(subagent_type="explore", load_skills=[], description="Find test patterns", run_in_background=true, prompt="Test patterns: FIND test configs/structure; codegraph_callers on core modules to see what is covered → REPORT unique conventions")
```

<dynamic-agents>
**动态派生 Agent**: 在 bash 分析之后, 根据项目规模派生额外的 explore agent:

| 因素 | 阈值 | 额外 Agent |
|--------|-----------|-------------------|
| **文件总数** | >100 | 每 100 个文件 +1 |
| **总行数** | >10k | 每 10k 行 +1 |
| **目录深度** | ≥4 | 深度探索 +2 |
| **大文件 (>500 行)** | >10 个文件 | 复杂度热点 +1 |
| **Monorepo** | 检测到 | 每个 package/workspace +1 |
| **多种语言** | >1 | 每种语言 +1 |

```bash
# 先衡量项目规模
total_files=$(find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' | wc -l)
total_lines=$(find . -type f \( -name "*.ts" -o -name "*.py" -o -name "*.go" \) -not -path '*/node_modules/*' -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
large_files=$(find . -type f \( -name "*.ts" -o -name "*.py" \) -not -path '*/node_modules/*' -exec wc -l {} + 2>/dev/null | awk '$1 > 500 {count++} END {print count+0}')
max_depth=$(find . -type d -not -path '*/node_modules/*' -not -path '*/.git/*' | awk -F/ '{print NF}' | sort -rn | head -1)
```

派生示例:
```
// 500 个文件, 50k 行, 深度 6, 15 个大文件 -> 派生 5+5+2+1 = 13 个额外 agent
task(subagent_type="explore", load_skills=[], description="Analyze large files", run_in_background=true, prompt="Large file analysis: FIND files >500 lines, REPORT complexity hotspots")
task(subagent_type="explore", load_skills=[], description="Explore deep modules", run_in_background=true, prompt="Deep modules at depth 4+: FIND hidden patterns, internal conventions")
task(subagent_type="explore", load_skills=[], description="Find shared utilities", run_in_background=true, prompt="Cross-cutting concerns: FIND shared utilities across directories")
// ... 根据计算结果派生更多
```
</dynamic-agents>

### 主会话: 并发分析

**在后台 agent 运行的同时**, 主会话执行:

#### 1. Bash 结构分析
```bash
# 目录深度 + 文件计数
find . -type d -not -path '*/\.*' -not -path '*/node_modules/*' -not -path '*/venv/*' -not -path '*/dist/*' -not -path '*/build/*' | awk -F/ '{print NF-1}' | sort -n | uniq -c

# 每个目录的文件数 (前 30)
find . -type f -not -path '*/\.*' -not -path '*/node_modules/*' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -30

# 按扩展名的代码集中度
find . -type f \( -name "*.py" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.go" -o -name "*.rs" \) -not -path '*/node_modules/*' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -20

# 已有的 AGENTS.md / CLAUDE.md
find . -type f \( -name "AGENTS.md" -o -name "CLAUDE.md" \) -not -path '*/node_modules/*' 2>/dev/null
```

#### 2. 读取已有 AGENTS.md
```
对找到的每个已有文件:
  Read(filePath=file)
  提取: 关键洞察、约定、反模式
  存入 EXISTING_AGENTS 映射
```

若使用 `--create-new`: 先读取所有已有文件 (保留上下文) -> 再全部删除 -> 重新生成。

#### 3. 代码地图 - 同时驱动 LSP 与 codegraph (不得跳过)

这是 CODE MAP 以及 Symbol/Export/Reference 评分行的最高信号来源。两者互补, 不是二选一 - 当两者都存在时同时运行, 并与 explore agent 并行。

**LSP** - 检查 `lsp_status`; 模型可见名称为 `lsp_status`/`lsp_symbols`/`lsp_find_references`/`lsp_goto_definition` (某些运行环境会去掉 `lsp_` 前缀):
- `lsp_symbols` scope="document" 作用于每个入口点 -> 文件大纲。
- `lsp_symbols` scope="workspace", 按 kind (class/interface/function) 查询 -> 符号清单。
- `lsp_find_references` 作用于顶层导出 (从 symbols 结果取 line/character) -> 引用中心度。

**codegraph** - 当存在 `codegraph_*` 工具时 (检查 `codegraph_status`); 它是 LSP 的一等同伴, 不是最后手段:
- `codegraph_explore` -> 概览; `codegraph_callers`/`codegraph_callees`/`codegraph_impact` -> 用于评分矩阵的中心度 + 影响范围; `codegraph_search`/`codegraph_files` -> 符号/文件清单。

仅当两者都不存在时: 使用 explore agent + ast-grep skill (`sg`), 并在 CODE MAP 中标注中心度未度量。

### 收集后台结果

```
// 主会话分析完成后, 收集所有 task 结果
对每个后台 task ID (`bg_...`): background_output(task_id="bg_...")
```

**合并: bash + LSP/codegraph + 已有文件 + explore 发现。将 "discovery" 标记为 completed。**

---

## 阶段 2: 评分与位置决策

**将 "scoring" 标记为 in_progress。**

### 评分矩阵

| 因素 | 权重 | 高阈值 | 来源 |
|--------|--------|----------------|--------|
| 文件数 | 3x | >20 | bash |
| 子目录数 | 2x | >5 | bash |
| 代码占比 | 2x | >70% | bash |
| 独特模式 | 1x | 有自己的配置 | explore |
| 模块边界 | 2x | 有 index.ts/__init__.py | bash |
| 符号密度 | 2x | >30 个符号 | LSP/cg |
| 导出数 | 2x | >10 个导出 | LSP/cg |
| 引用中心度 | 3x | >20 个引用 | LSP/cg |

### 决策规则

| 分数 | 动作 |
|-------|--------|
| **根目录 (.)** | 总是创建 |
| **>15** | 创建 AGENTS.md |
| **8-15** | 若为独立领域则创建 |
| **<8** | 跳过 (由父级覆盖) |

### 输出
```
AGENTS_LOCATIONS = [
  { path: ".", type: "root" },
  { path: "src/hooks", score: 18, reason: "high complexity" },
  { path: "src/api", score: 12, reason: "distinct domain" }
]
```

**将 "scoring" 标记为 completed。**

---

## 阶段 3: 生成 AGENTS.md

**将 "generate" 标记为 in_progress。**

<critical>
**文件写入规则**: 若目标路径已存在 AGENTS.md -> 使用 `Edit` 工具。若不存在 -> 使用 `Write` 工具。
绝不使用 Write 覆盖已有文件。务必先通过 `Read` 或发现结果确认是否存在。
</critical>

### 根目录 AGENTS.md (完整处理)

```markdown
# PROJECT KNOWLEDGE BASE

**Generated:** {TIMESTAMP}
**Commit:** {SHORT_SHA}
**Branch:** {BRANCH}

## OVERVIEW
{1-2 句: 做什么 + 核心技术栈}

## STRUCTURE
```
{root}/
├── {dir}/    # {仅非显而易见的用途}
└── {entry}
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|

## CODE MAP
{来自 LSP/codegraph - 仅当两者都不存在或项目少于 10 个文件时跳过}

| Symbol | Type | Location | Refs | Role |
|--------|------|----------|------|------|

## CONVENTIONS
{仅记录偏离标准的部分}

## ANTI-PATTERNS (THIS PROJECT)
{本项目明确禁止的内容}

## UNIQUE STYLES
{项目特有}

## COMMANDS
```bash
{dev/test/build}
```

## NOTES
{易踩的坑}
```

**质量门槛**: 50-150 行, 无通用建议, 无显而易见的信息。

### 子目录 AGENTS.md (并行)

为每个位置启动写入任务:

```
for loc in AGENTS_LOCATIONS (除根目录外):
  task(category="writing", load_skills=[], run_in_background=false, description="Generate AGENTS.md", prompt=`
    Generate AGENTS.md for: ${loc.path}
    - Reason: ${loc.reason}
    - 30-80 lines max
    - NEVER repeat parent content
    - Sections: OVERVIEW (1 line), STRUCTURE (if >5 subdirs), WHERE TO LOOK, CONVENTIONS (if different), ANTI-PATTERNS
  `)
```

**等待全部完成。将 "generate" 标记为 completed。**

---

## 阶段 4: 审查与去重

**将 "review" 标记为 in_progress。**

对每个生成的文件:
- 移除通用建议
- 移除与父级重复的内容
- 精简至篇幅限制内
- 校验电报式精炼风格

**将 "review" 标记为 completed。**

---

## 最终报告

```
=== init-deep Complete ===

Mode: {update | create-new}

Files:
  [OK] ./AGENTS.md (root, {N} lines)
  [OK] ./src/hooks/AGENTS.md ({N} lines)

Dirs Analyzed: {N}
AGENTS.md Created: {N}
AGENTS.md Updated: {N}

Hierarchy:
  ./AGENTS.md
  └── src/hooks/AGENTS.md
```

---

## 反模式

- **静态 agent 数量**: 必须根据项目规模/深度调整 agent 数量
- **顺序执行**: 必须并行 (explore + LSP + codegraph 并发)
- **忽视已有文件**: 总是先读取已有文件, 即使使用 --create-new
- **过度文档化**: 并非每个目录都需要 AGENTS.md
- **冗余**: 子级不得重复父级内容
- **通用内容**: 移除任何适用于所有项目的内容
- **啰嗦风格**: 电报式或死
