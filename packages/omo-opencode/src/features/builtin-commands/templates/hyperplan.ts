export const HYPERPLAN_TEMPLATE = `You are running the \`/hyperplan\` command — adversarial multi-agent planning via team-mode.

LOAD THE HYPERPLAN SKILL IMMEDIATELY:

\`\`\`
skill(name="hyperplan")
\`\`\`

After loading the skill, follow its 7-phase workflow EXACTLY using this user request.

Roster contract: call \`team_create\` with category members \`unspecified-low\`, \`unspecified-high\`, \`ultrabrain\`, and \`artistry\`. Include \`deep\` only if the category is enabled; if \`deep\` is disabled or unavailable, retry without only that member and state the degraded roster.

<user-request>
$ARGUMENTS
</user-request>

If team-mode is unavailable (\`team_*\` tools missing), instruct the user to set \`team_mode.enabled: true\` in \`~/.omo/omo.jsonc\` and restart opencode.`

export const HYPERPLAN_TEMPLATE_ZH = `你正在运行 \`/hyperplan\` 命令 - 通过 team-mode 进行对抗式多智能体规划。

立即加载 HYPERPLAN 技能：

\`\`\`
skill(name="hyperplan")
\`\`\`

加载技能后，严格按照其 7 阶段工作流执行，并使用下面的用户请求。

Roster 契约：调用 \`team_create\`，成员分类为 \`unspecified-low\`、\`unspecified-high\`、\`ultrabrain\` 和 \`artistry\`。仅当该分类启用时才包含 \`deep\`；如果 \`deep\` 被禁用或不可用，则仅重试不包含该成员的方案，并说明降级后的 roster。

<user-request>
$ARGUMENTS
</user-request>

如果 team-mode 不可用（缺少 \`team_*\` 工具），请指导用户在 \`~/.omo/omo.jsonc\` 中设置 \`team_mode.enabled: true\`，然后重启 opencode。`
