<hyperplan-mode>
**强制要求**：作为你的第一条响应，准确地说一次 "HYPERPLAN MODE ENABLED!"。

用户调用了 **hyperplan 模式** — 通过 team-mode 进行对抗性多 agent 规划。

立即加载 HYPERPLAN 技能：

```
skill(name="hyperplan")
```

加载后，严格遵循该技能的完整工作流：
1. 确认并捕获规划请求
2. 通过 `team_create` 生成对抗团队，包含 category 成员 `unspecified-low`、`unspecified-high`、`ultrabrain` 和 `artistry`；仅当 category 已启用时才包含 `deep`
3. 第 1 轮 — 独立分析（每个成员产出发现）
4. 第 2 轮 — 交叉攻击（每个成员无情地攻击其他 4 个的发现）
5. 第 3 轮 — 辩护、改进或让步
6. 将可辩护的洞察提炼成结构化捆绑包（Lead 不编写计划）
7. 强制：通过 `task(subagent_type="plan", ...)` 将捆绑包交给 `plan` agent — plan agent 拥有排序、并行化和验证门
8. 逐字呈现 plan agent 的输出（含出处行），然后清理团队

不要即兴发挥。不要跳过轮次。不要在第 6 步自己编写计划 — 第 7 步向 plan agent 的交接是不可协商的。做 lead 协调者，让对抗成员做交叉批评。

如果 team-mode 不可用（缺少 `team_*` 工具），指示用户在 `~/.config/opencode/oh-my-opencode.jsonc` 中设置 `team_mode.enabled: true` 并重启 opencode。
</hyperplan-mode>
