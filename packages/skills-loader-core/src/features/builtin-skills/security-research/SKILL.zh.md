# 安全研究 - Team Mode 漏洞审计

使用此技能运行并行安全审计，将真实可利用性与泛泛的关切区分开来。团队包含 3 个漏洞猎手和 2 个 PoC 工程师。

## 硬性前置条件

开始之前，验证：
1. `team_*` 工具可用。如果不可用，停止并告知用户：
   `security-research 需要 team-mode。在 oh-my-openagent 配置中设置 team_mode.enabled: true，重启 opencode，然后重试。`
2. 你在主会话中，而非后台子 agent。
3. 你有具体目标：仓库、diff 范围、PR、发布候选、路径列表或威胁面。

如果用户未提供目标，审计当前仓库和当前分支相对于其上游或合并基的 diff。如果没有 diff，审计工作树中的安全敏感面。

## 严重程度标准

使用以下参考作为评分框架：
- CWE 用于根因弱点分类：https://cwe.mitre.org/
- OWASP WSTG 用于测试方法论：https://devguide.owasp.org/en/06-verification/01-guides/01-wstg/
- OWASP ASVS 用于控制验证：https://owasp.org/www-project-application-security-verification-standard/
- CVSS v4.0 用于可利用性和影响评分：https://www.first.org/cvss/v4.0/specification-document

规则：
- 没有攻击路径就没有严重程度。
- 没有具体利用前置条件和影响就没有 critical 或 high 发现。
- 保持 CWE 类别与严重程度分开。
- 相比理论性描述，优先选择小而可复现的 PoC。
- 永远不要对真实服务或第三方系统运行破坏性利用。
- 当真实执行不安全时，使用本地 fixture、玩具 payload、干运行或静态证明。

## 团队名册

创建一个包含以下 5 名成员的 Team Mode 运行：

| 成员 | Kind | Category | 角色 |
|--------|------|----------|------|
| `surface-hunter` | category | `deep` | 映射入口点、信任边界和可达攻击面。 |
| `auth-data-hunter` | category | `ultrabrain` | 猎取认证、授权、数据隔离、注入和密钥处理缺陷。 |
| `runtime-supply-hunter` | category | `unspecified-high` | 猎取文件系统、子进程、归档、依赖、钩子、MCP 和配置风险。 |
| `poc-engineer-a` | category | `unspecified-high` | 为最强候选发现构建最小 PoC。 |
| `poc-engineer-b` | category | `deep` | 独立复现、证伪或降级候选发现。 |

使用 inline spec 调用 `team_create`：

```typescript
team_create({
  inline_spec: {
    name: "security-research",
    description: "并行可利用性驱动的安全研究团队。",
    members: [
      {
        name: "surface-hunter",
        kind: "category",
        category: "deep",
        prompt: "你负责映射攻击面。枚举入口点、信任边界、攻击者可控输入、数据汇点、权限转换和敏感资产。返回带文件路径和精确函数的证据。除非你能指出攻击路径，否则不要评定严重程度。"
      },
      {
        name: "auth-data-hunter",
        kind: "category",
        category: "ultrabrain",
        prompt: "你负责猎取认证、授权、租户/数据隔离、注入、SSRF、凭据暴露和混淆代理缺陷。从攻击者能力推理到影响。只返回有具体利用前置条件、CWE 候选和验证步骤的发现。"
      },
      {
        name: "runtime-supply-hunter",
        kind: "category",
        category: "unspecified-high",
        prompt: "你负责猎取文件系统、子进程、归档解压、依赖、钩子执行、MCP、配置和环境变量风险。检查路径遍历、命令注入、不安全下载、权限边界和供应链假设。引用使用的文件路径和命令。"
      },
      {
        name: "poc-engineer-a",
        kind: "category",
        category: "unspecified-high",
        prompt: "你负责为候选发现构建最小的安全 PoC。使用玩具输入和仅本地执行。你的工作是证明或证伪可利用性，而非扩大范围。报告精确的复现步骤和预期输出。"
      },
      {
        name: "poc-engineer-b",
        kind: "category",
        category: "deep",
        prompt: "你独立复现候选发现并尝试证伪它们。对任何没有可行路径的发现进行降级。如果 PoC 不安全无法运行，设计安全的静态或干运行证明并解释限制。"
      }
    ]
  }
})
```

如果某个 category 不可用，仅将该 category 替换为 `unspecified-high` 重试一次。不要将团队减少到 5 人以下。

## 工作流

### 阶段 0：范围与基线

收集：
- 目标范围和审计原因。
- 如果是变更评审：分支、基线 ref、diff 和变更文件。
- 如果是全仓库审计：安全敏感目录和文件。
- 执行相关面的现有测试和命令。
- 任何用户声明的约束，例如不调用网络或不做破坏性测试。

在分配工作前使用 `rg`、`git diff`、`git log`、LSP 和现有测试。

### 阶段 1：独立猎手轮次

向 3 个猎手各发送一个提示：

```text
审计目标：
{目标摘要}

上下文：
{diff、文件列表、安全敏感路径、已知约束}

任务：
在你分配的角色中查找候选漏洞。每个候选包括：
- 标题
- 受影响文件/函数
- 攻击者能力
- 攻击路径
- 影响
- CWE 候选
- 精确证据
- 安全验证思路

拒绝泛泛的加固建议。只返回有合理路径的候选。
```

等待所有猎手完成。

### 阶段 2：PoC 轮次

对猎手候选去重。将最强候选发送给两个 PoC 工程师。

每个 PoC 工程师必须返回：
- 已复现、已证伪或不安全无法运行。
- 精确的命令、fixture 或静态证明。
- 观察到的输出或失败原因。
- 基于可利用性和影响的严重程度建议。
- 对任何未复现发现的降级理由。

### 阶段 3：交叉检查

将 PoC 结果发回给全部 5 名成员。

询问每位成员：
- 哪些发现存活？
- 哪些发现应降级或移除？
- 最小且具体的修复方案是什么？
- 什么回归测试能防止复发？

### 阶段 4：最终报告

生成此报告：

```markdown
## 安全研究结果

### 结论
PASS | PASS WITH FINDINGS | BLOCK

### 范围
- 目标：
- 基线/diff：
- 执行的命令：

### 发现
| 严重程度 | 标题 | CWE | 可利用性 | 影响 | PoC | 修复 |
|----------|-------|-----|----------------|--------|-----|-----|

### 发现详情
每个发现：
- 证据：
- 攻击路径：
- PoC：
- 严重程度理由：
- 最小修复：
- 回归检查：

### 降级或拒绝的候选
| 候选 | 原因 |
|-----------|--------|

### 残余风险
- 未测试的内容及原因。
```

## 输出规则

- 以结论开头。
- 不要埋没阻塞性问题。
- 不要将推测性发现报告为漏洞。
- 除非你实际评分了指标，否则不要声称 CVSS 精度。
- 每个存活发现都要包含精确的文件路径和命令。
- 如果没有发现通过 PoC，明确说明并列出残余风险。
