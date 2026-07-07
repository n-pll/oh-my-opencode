import { isTaskSystemEnabled } from "../../shared";
import { BLOCKED_TOOLS } from "./constants";
import { t } from "../../shared/i18n";

export interface TasksTodowriteDisablerConfig {
  experimental?: {
    task_system?: boolean;
  };
}

export function createTasksTodowriteDisablerHook(
  config: TasksTodowriteDisablerConfig,
) {
  const taskSystemEnabled = isTaskSystemEnabled(config);

  return {
    "tool.execute.before": async (
      input: { tool: string; sessionID: string; callID: string },
      _output: { args: Record<string, unknown> },
    ) => {
      if (!taskSystemEnabled) {
        return;
      }

      const toolName = input.tool as string;
      if (
        BLOCKED_TOOLS.some(
          (blocked) => blocked.toLowerCase() === toolName.toLowerCase(),
        )
      ) {
        throw new Error(t("hooks.tasksTodoDisabler.message"));
      }
    },
  };
}
