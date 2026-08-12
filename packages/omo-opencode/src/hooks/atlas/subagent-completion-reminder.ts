import type { PluginInput } from "@opencode-ai/plugin"
import { classifyFinalWaveVerdict, shouldPauseForFinalWaveApproval } from "./final-wave-approval-gate"
import { readFinalWavePlanState } from "./final-wave-plan-state"
import type { SessionState } from "./types"
import { t, getLocale } from "../../shared/i18n"
import {
  buildAdvanceDirective,
  buildAdvanceDirectiveZh,
  buildCompletionGate,
  buildCompletionGateZh,
  buildFinalWaveApprovalReminder,
  buildFinalWaveApprovalReminderZh,
  buildMissingVerdictEscalation,
  buildMissingVerdictEscalationZh,
  buildOrchestratorReminder,
  buildOrchestratorReminderZh,
  buildRejectedVerdictEscalation,
  buildRejectedVerdictEscalationZh,
} from "./verification-reminders"

type CurrentTask = {
  readonly key: string
  readonly label: string
} | null

type ReminderDecision = {
  readonly leadReminder: string
  readonly followupReminder: string | null
  readonly isFinalWaveTask: boolean
  readonly isMissingFinalWaveVerdict: boolean
  readonly isRejectedFinalWaveVerdict: boolean
  readonly shouldPauseForApproval: boolean
}

export async function buildSubagentCompletionReminder(input: {
  readonly ctx: PluginInput
  readonly planPath: string
  readonly planName: string
  readonly progress: { readonly total: number; readonly completed: number }
  readonly preferredSessionId: string
  readonly originalResponse: string
  readonly currentTask: CurrentTask
  readonly sessionState: SessionState | undefined
  readonly isAlreadyVerified: boolean
  readonly autoCommit: boolean
}): Promise<ReminderDecision> {
  const zh = getLocale() === "zh"
  const shouldPauseForApproval = input.sessionState
    ? shouldPauseForFinalWaveApproval({
        planPath: input.planPath,
        taskOutput: input.originalResponse,
        sessionState: input.sessionState,
      })
    : false

  const finalWavePlanState = readFinalWavePlanState(input.planPath)
  const isFinalWaveTask = input.currentTask?.key.startsWith("final-wave:") === true
    || ((finalWavePlanState?.pendingImplementationTaskCount ?? 1) === 0
      && (finalWavePlanState?.pendingFinalWaveTaskCount ?? 0) > 0)
  const finalWaveVerdict = isFinalWaveTask
    ? classifyFinalWaveVerdict(input.originalResponse)
    : "missing"
  const isMissingFinalWaveVerdict = isFinalWaveTask && finalWaveVerdict === "missing"
  const isRejectedFinalWaveVerdict = isFinalWaveTask && finalWaveVerdict === "reject"
  const shouldPause = shouldPauseForApproval || isMissingFinalWaveVerdict || isRejectedFinalWaveVerdict

  if (input.sessionState) {
    input.sessionState.waitingForFinalWaveApproval = shouldPause
    if (shouldPause && input.sessionState.pendingRetryTimer) {
      clearTimeout(input.sessionState.pendingRetryTimer)
      input.sessionState.pendingRetryTimer = undefined
    }
  }

  if (isMissingFinalWaveVerdict) {
    await showFinalWaveToast(input.ctx, t("toast.final_review_incomplete_title"), t("toast.final_review_incomplete_message"))
    return {
      leadReminder: (zh ? buildMissingVerdictEscalationZh : buildMissingVerdictEscalation)(
        input.planName,
        input.currentTask?.label ?? "the final-wave task",
        input.preferredSessionId,
      ),
      followupReminder: null,
      isFinalWaveTask,
      isMissingFinalWaveVerdict,
      isRejectedFinalWaveVerdict,
      shouldPauseForApproval,
    }
  }

  if (isRejectedFinalWaveVerdict) {
    await showFinalWaveToast(input.ctx, t("toast.final_review_rejected_title"), t("toast.final_review_rejected_message"))
    return {
      leadReminder: (zh ? buildRejectedVerdictEscalationZh : buildRejectedVerdictEscalation)(
        input.planName,
        input.currentTask?.label ?? "the final-wave task",
        input.preferredSessionId,
      ),
      followupReminder: null,
      isFinalWaveTask,
      isMissingFinalWaveVerdict,
      isRejectedFinalWaveVerdict,
      shouldPauseForApproval,
    }
  }

  if (shouldPauseForApproval) {
    return {
      leadReminder: (zh ? buildFinalWaveApprovalReminderZh : buildFinalWaveApprovalReminder)(input.planName, input.progress, input.preferredSessionId),
      followupReminder: null,
      isFinalWaveTask,
      isMissingFinalWaveVerdict,
      isRejectedFinalWaveVerdict,
      shouldPauseForApproval,
    }
  }

  if (input.isAlreadyVerified) {
    return {
      leadReminder: (zh ? buildAdvanceDirectiveZh : buildAdvanceDirective)(input.planName),
      followupReminder: null,
      isFinalWaveTask,
      isMissingFinalWaveVerdict,
      isRejectedFinalWaveVerdict,
      shouldPauseForApproval,
    }
  }

  if (input.currentTask && input.sessionState && !isFinalWaveTask) {
    input.sessionState.verifiedTaskKeys ??= new Set<string>()
    input.sessionState.verifiedTaskKeys.add(input.currentTask.key)
  }

  return {
    leadReminder: (zh ? buildCompletionGateZh : buildCompletionGate)(input.planName, input.preferredSessionId),
    followupReminder: (zh ? buildOrchestratorReminderZh : buildOrchestratorReminder)(input.planName, input.progress, input.preferredSessionId, input.autoCommit, false),
    isFinalWaveTask,
    isMissingFinalWaveVerdict,
    isRejectedFinalWaveVerdict,
    shouldPauseForApproval,
  }
}

async function showFinalWaveToast(ctx: PluginInput, title: string, message: string): Promise<void> {
  await ctx.client.tui
    .showToast({
      body: {
        title,
        message,
        variant: "warning" as const,
        duration: 10000,
      },
    })
    .catch(() => {})
}
