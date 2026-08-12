import type { PluginInput } from "@opencode-ai/plugin"
import { isGptModel } from "../../agents/types"
import {
  getSessionAgent,
  resolveRegisteredAgentName,
  updateSessionAgent,
} from "../../features/claude-code-session-state"
import { log } from "../../shared"
import { getAgentConfigKey } from "../../shared/agent-display-names"
import { t } from "../../shared/i18n"

type NoHephaestusNonGptHookOptions = {
  allowNonGptModel?: boolean
}

function showToast(ctx: PluginInput, sessionID: string, variant: "error" | "warning"): void {
  ctx.client.tui.showToast({
    body: {
      title: t("toast.no_hephaestus_non_gpt_title"),
      message: t("toast.no_hephaestus_non_gpt_message"),
      variant,
      duration: 10000,
    },
  }).catch((error) => {
    log("[no-hephaestus-non-gpt] Failed to show toast", {
      sessionID,
      error,
    })
  })
}

export function createNoHephaestusNonGptHook(
  ctx: PluginInput,
  options?: NoHephaestusNonGptHookOptions,
) {
  return {
    "chat.message": async (input: {
      sessionID: string
      agent?: string
      model?: { providerID: string; modelID: string }
    }, output?: {
      message?: { agent?: string; [key: string]: unknown }
    }): Promise<void> => {
      const rawAgent = input.agent ?? getSessionAgent(input.sessionID) ?? ""
      const agentKey = getAgentConfigKey(rawAgent)
      const modelID = input.model?.modelID
      const allowNonGptModel = options?.allowNonGptModel === true

      if (agentKey === "hephaestus" && modelID && !isGptModel(modelID)) {
        showToast(ctx, input.sessionID, allowNonGptModel ? "warning" : "error")
        if (allowNonGptModel) {
          return
        }
        input.agent = resolveRegisteredAgentName("sisyphus") ?? "sisyphus"
        if (output?.message) {
          output.message.agent = resolveRegisteredAgentName("sisyphus") ?? "sisyphus"
        }
        updateSessionAgent(input.sessionID, "sisyphus")
      }
    },
  }
}
