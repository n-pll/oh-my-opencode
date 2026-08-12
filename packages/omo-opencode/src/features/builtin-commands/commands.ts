import type { CommandDefinition } from "../claude-code-command-loader"
import { isAgentRegistered } from "../claude-code-session-state"
import type { BuiltinCommandName, BuiltinCommands } from "./types"
import { getLocale } from "../../shared/i18n"
import { GOAL_TEMPLATE, GOAL_TEMPLATE_ZH } from "./templates/goal"
import { STOP_CONTINUATION_TEMPLATE, STOP_CONTINUATION_TEMPLATE_ZH } from "./templates/stop-continuation"
import { REFACTOR_TEMPLATE, REFACTOR_TEAM_MODE_ADDENDUM, REFACTOR_TEMPLATE_ZH, REFACTOR_TEAM_MODE_ADDENDUM_ZH } from "./templates/refactor"
import { START_WORK_TEMPLATE, START_WORK_TEMPLATE_ZH } from "./templates/start-work"
import { HANDOFF_TEMPLATE, HANDOFF_TEMPLATE_ZH } from "./templates/handoff"
import { REMOVE_AI_SLOPS_TEMPLATE, REMOVE_AI_SLOPS_TEAM_MODE_ADDENDUM, REMOVE_AI_SLOPS_TEMPLATE_ZH, REMOVE_AI_SLOPS_TEAM_MODE_ADDENDUM_ZH } from "./templates/remove-ai-slops"
import { HYPERPLAN_TEMPLATE, HYPERPLAN_TEMPLATE_ZH } from "./templates/hyperplan"

interface LoadBuiltinCommandsOptions {
  useRegisteredAgents?: boolean
  teamModeEnabled?: boolean
}

function resolveStartWorkAgent(options?: LoadBuiltinCommandsOptions): "atlas" | "sisyphus" {
  if (options?.useRegisteredAgents) {
    return isAgentRegistered("atlas") ? "atlas" : "sisyphus"
  }

  return "atlas"
}

function withTeamModeAddendum(baseTemplate: string, addendum: string, teamModeEnabled: boolean): string {
  return teamModeEnabled ? `${baseTemplate}\n${addendum}` : baseTemplate
}

function createBuiltinCommandDefinitions(
  options?: LoadBuiltinCommandsOptions,
): Record<BuiltinCommandName, Omit<CommandDefinition, "name">> {
  const teamModeEnabled = options?.teamModeEnabled ?? false
  const zh = getLocale() === "zh"
  const goalTemplate = zh ? GOAL_TEMPLATE_ZH : GOAL_TEMPLATE
  const refactorBase = zh ? REFACTOR_TEMPLATE_ZH : REFACTOR_TEMPLATE
  const refactorAddendum = zh ? REFACTOR_TEAM_MODE_ADDENDUM_ZH : REFACTOR_TEAM_MODE_ADDENDUM
  const removeAiSlopsBase = zh ? REMOVE_AI_SLOPS_TEMPLATE_ZH : REMOVE_AI_SLOPS_TEMPLATE
  const removeAiSlopsAddendum = zh ? REMOVE_AI_SLOPS_TEAM_MODE_ADDENDUM_ZH : REMOVE_AI_SLOPS_TEAM_MODE_ADDENDUM
  const startWorkTemplate = zh ? START_WORK_TEMPLATE_ZH : START_WORK_TEMPLATE
  const handoffTemplate = zh ? HANDOFF_TEMPLATE_ZH : HANDOFF_TEMPLATE
  const hyperplanTemplate = zh ? HYPERPLAN_TEMPLATE_ZH : HYPERPLAN_TEMPLATE
  const stopContinuationTemplate = zh ? STOP_CONTINUATION_TEMPLATE_ZH : STOP_CONTINUATION_TEMPLATE

  const refactorContent = withTeamModeAddendum(refactorBase, refactorAddendum, teamModeEnabled)
  const removeAiSlopsContent = withTeamModeAddendum(
    removeAiSlopsBase,
    removeAiSlopsAddendum,
    teamModeEnabled,
  )

  const goalDescription = zh
    ? "(内置) 设置、查看、暂停、恢复或清除当前线程目标"
    : "(builtin) Set, show, pause, resume, or clear the active thread goal"
  const refactorDescription = zh
    ? "(内置) 智能重构命令，集成 LSP、AST-grep、架构分析、代码地图和 TDD 验证。"
    : "(builtin) Intelligent refactoring command with LSP, AST-grep, architecture analysis, codemap, and TDD verification."
  const startWorkDescription = zh
    ? "(内置) 从 Prometheus 计划启动 Atlas 工作会话"
    : "(builtin) Start Atlas work session from Prometheus plan"
  const stopContinuationDescription = zh
    ? "(内置) 停止本会话的所有续接机制（ralph loop、todo 续接、boulder）"
    : "(builtin) Stop all continuation mechanisms (ralph loop, todo continuation, boulder) for this session"
  const removeAiSlopsDescription = zh
    ? "(内置) 从分支改动中移除 AI 生成的代码坏味道，并批判性评审结果"
    : "(builtin) Remove AI-generated code smells from branch changes and critically review the results"
  const handoffDescription = zh
    ? "(内置) 创建详细的上下文摘要，以便在新会话中继续工作"
    : "(builtin) Create a detailed context summary for continuing work in a new session"
  const hyperplanDescription = zh
    ? "(内置) 通过 team-mode 进行对抗性多 agent 规划（5 个敌意 category 成员交叉批判，lead 综合）"
    : "(builtin) Adversarial multi-agent planning via team-mode (5 hostile category members cross-critique, lead synthesizes)"

  return {
    goal: {
      description: goalDescription,
      template: `<command-instruction>
${goalTemplate}
</command-instruction>

<user-task>
$ARGUMENTS
</user-task>`,
      argumentHint: "<objective> | pause | resume | clear",
    },
    refactor: {
      description: refactorDescription,
      template: `<command-instruction>
${refactorContent}
</command-instruction>`,
      argumentHint: "<refactoring-target> [--scope=<file|module|project>] [--strategy=<safe|aggressive>]",
    },
    "start-work": {
      description: startWorkDescription,
      agent: resolveStartWorkAgent(options),
      template: `<command-instruction>
${startWorkTemplate}
</command-instruction>

<session-context>
Session ID: $SESSION_ID
Timestamp: $TIMESTAMP
</session-context>

<user-request>
$ARGUMENTS
</user-request>`,
      argumentHint: "[plan-name] [--worktree <path>] [--make-pr] [--ship]",
    },
    "stop-continuation": {
      description: stopContinuationDescription,
      template: `<command-instruction>
${stopContinuationTemplate}
</command-instruction>`,
    },
    "remove-ai-slops": {
      description: removeAiSlopsDescription,
      template: `<command-instruction>
${removeAiSlopsContent}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    },
    handoff: {
      description: handoffDescription,
      template: `<command-instruction>
${handoffTemplate}
</command-instruction>

<session-context>
Session ID: $SESSION_ID
Timestamp: $TIMESTAMP
</session-context>

<user-request>
$ARGUMENTS
</user-request>`,
      argumentHint: "[goal]",
    },
    hyperplan: {
      description: hyperplanDescription,
      template: `<command-instruction>
${hyperplanTemplate}
</command-instruction>`,
      argumentHint: "[planning-request]",
    },
  }
}

export function loadBuiltinCommands(
  disabledCommands?: BuiltinCommandName[],
  options?: LoadBuiltinCommandsOptions,
): BuiltinCommands {
  const builtinCommandDefinitions = createBuiltinCommandDefinitions(options)
  const disabled = new Set(disabledCommands ?? [])
  const commands: BuiltinCommands = {}

  for (const [name, definition] of Object.entries(builtinCommandDefinitions)) {
    if (!disabled.has(name as BuiltinCommandName)) {
      const { argumentHint: _argumentHint, ...openCodeCompatible } = definition
      commands[name] = { ...openCodeCompatible, name } as CommandDefinition
    }
  }

  return commands
}
