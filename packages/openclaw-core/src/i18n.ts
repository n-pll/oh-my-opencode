import { createMutableTranslator, type MutableTranslator } from "@oh-my-opencode/i18n-core"

const en = {
  "dispatcher.error.invalidUrl": "Invalid URL (HTTPS required)",
  "dispatcher.error.unknown": "Unknown error",
  "dispatcher.error.noCommand": "No command configured",
  "dispatcher.error.commandExited": "Command exited with code {{code}}",

  "replyListener.start.noPlatforms": "No enabled reply listener platforms configured (missing bot tokens/channels)",
  "replyListener.start.alreadyRunning": "Reply listener daemon is already running",
  "replyListener.start.failedRestart": "Failed to restart reply listener daemon",
  "replyListener.start.timeoutRestart": "Timed out waiting for reply listener daemon to stop before restart",
  "replyListener.start.tmuxUnavailable": "tmux not available - reply injection requires tmux",
  "replyListener.start.failedDaemonProcess": "Failed to start daemon process",
  "replyListener.start.failed": "Failed to start daemon",

  "replyListener.stop.notRunning": "Reply listener daemon is not running",
  "replyListener.stop.cleanedStalePid": "Reply listener daemon was not running (cleaned up stale PID file)",
  "replyListener.stop.refusingKill": "Refusing to kill PID {{pid}}: process identity does not match the reply listener daemon (stale or reused PID - removed PID file)",
  "replyListener.stop.stopped": "Reply listener daemon stopped (PID {{pid}})",
  "replyListener.stop.failed": "Failed to stop daemon",
} as const

export type OpenClawTranslationKey = keyof typeof en

const zh: Partial<Record<OpenClawTranslationKey, string>> = {
  "dispatcher.error.invalidUrl": "URL 无效（要求 HTTPS）",
  "dispatcher.error.unknown": "未知错误",
  "dispatcher.error.noCommand": "未配置命令",
  "dispatcher.error.commandExited": "命令以退出码 {{code}} 退出",

  "replyListener.start.noPlatforms": "未配置已启用的回复监听平台（缺少 bot token/频道）",
  "replyListener.start.alreadyRunning": "回复监听守护进程已在运行",
  "replyListener.start.failedRestart": "重启回复监听守护进程失败",
  "replyListener.start.timeoutRestart": "等待回复监听守护进程在重启前停止超时",
  "replyListener.start.tmuxUnavailable": "tmux 不可用 — 回复注入需要 tmux",
  "replyListener.start.failedDaemonProcess": "启动守护进程失败",
  "replyListener.start.failed": "启动守护进程失败",

  "replyListener.stop.notRunning": "回复监听守护进程未运行",
  "replyListener.stop.cleanedStalePid": "回复监听守护进程未运行（已清理过期的 PID 文件）",
  "replyListener.stop.refusingKill": "拒绝杀死 PID {{pid}}：进程身份与回复监听守护进程不匹配（过期或复用的 PID — 已移除 PID 文件）",
  "replyListener.stop.stopped": "回复监听守护进程已停止（PID {{pid}}）",
  "replyListener.stop.failed": "停止守护进程失败",
}

const translator: MutableTranslator<OpenClawTranslationKey> = createMutableTranslator({
  locales: { en, zh: { ...en, ...zh } },
})

export function t(key: OpenClawTranslationKey, params?: Record<string, string | number | null | undefined>): string {
  return translator.t(key, params)
}

export function setOpenClawLocale(locale: "en" | "zh"): void {
  translator.setLocale(locale)
}
