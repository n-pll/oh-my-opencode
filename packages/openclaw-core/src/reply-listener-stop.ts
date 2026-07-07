import { logReplyListenerMessage } from "./reply-listener-log"
import {
  isReplyListenerDaemonProcess,
  isReplyListenerProcessRunning,
} from "./reply-listener-process"
import {
  markReplyListenerStopped,
  readReplyListenerDaemonState,
  readReplyListenerPid,
  removeReplyListenerPid,
  type ReplyListenerDaemonState,
  writeReplyListenerDaemonState,
} from "./reply-listener-state"
import { t } from "./i18n"

export async function stopReplyListener(): Promise<{
  success: boolean
  message: string
  state?: ReplyListenerDaemonState
  error?: string
}> {
  const pid = readReplyListenerPid()
  if (pid === null) {
    return {
      success: true,
      message: t("replyListener.stop.notRunning"),
    }
  }

  if (!isReplyListenerProcessRunning(pid)) {
    removeReplyListenerPid()
    return {
      success: true,
      message: t("replyListener.stop.cleanedStalePid"),
    }
  }

  if (!(await isReplyListenerDaemonProcess(pid))) {
    removeReplyListenerPid()
    return {
      success: false,
      message: t("replyListener.stop.refusingKill", { pid }),
    }
  }

  try {
    process.kill(pid, "SIGTERM")
    removeReplyListenerPid()
    const state = markReplyListenerStopped(readReplyListenerDaemonState())
    writeReplyListenerDaemonState(state)
    logReplyListenerMessage(t("replyListener.stop.stopped", { pid }))
    return {
      success: true,
      message: t("replyListener.stop.stopped", { pid }),
      state,
    }
  } catch (error) {
    return {
      success: false,
      message: t("replyListener.stop.failed"),
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
