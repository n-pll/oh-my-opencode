import color from "picocolors"

import type { BoulderWorkStatus } from "../../features/boulder-state"
import type { BoulderCliResult, BoulderCliWork } from "./types"
import { t } from "../../shared/i18n"

function statusLabel(status: BoulderWorkStatus): string {
  if (status === "active") {
    return t("cli.boulder.status.active")
  }

  if (status === "completed") {
    return t("cli.boulder.status.completed")
  }

  if (status === "paused") {
    return t("cli.boulder.status.paused")
  }

  return t("cli.boulder.status.unknown")
}

function colorizeStatus(status: BoulderWorkStatus): string {
  const label = statusLabel(status)
  if (status === "active") {
    return color.cyan(label)
  }

  if (status === "completed") {
    return color.green(label)
  }

  if (status === "paused") {
    return color.yellow(label)
  }

  return color.red(label)
}

function formatCurrentTask(work: BoulderCliWork): string {
  if (!work.current_task) {
    return "-"
  }

  const elapsed = work.current_task.elapsed_human
    ? ` (${work.current_task.elapsed_human})`
    : ""
  return `${work.current_task.task_title}${elapsed}`
}

function formatWorkBlock(work: BoulderCliWork): string {
  const elapsed = work.elapsed_human ?? "-"
  const progress = `${work.percentage}% (${work.completed_tasks}/${work.total_tasks})`

  return [
    t("cli.boulder.plan", { name: work.plan_name }),
    t("cli.boulder.status", { status: colorizeStatus(work.status) }),
    t("cli.boulder.progress", { progress }),
    t("cli.boulder.elapsed", { elapsed }),
    t("cli.boulder.sessions", { count: work.session_count }),
    t("cli.boulder.currentTask", { task: formatCurrentTask(work) }),
  ].join("\n")
}

export function formatTextOutput(result: BoulderCliResult): string {
  const separator = color.dim("----------------------------------------")
  const blocks = result.works.map((work) => formatWorkBlock(work))
  return [t("cli.boulder.header"), ...blocks].join(`\n${separator}\n`)
}

export function formatJsonOutput(result: BoulderCliResult): string {
  return JSON.stringify(result, null, 2)
}

export function formatNoBoulderMessage(isJson: boolean | undefined): string {
  const message = t("cli.boulder.noState")
  if (isJson) {
    return JSON.stringify({
      error: message,
    })
  }

  return message
}

export function formatReadErrorMessage(isJson: boolean | undefined): string {
  const message = t("cli.boulder.readFailed")
  if (isJson) {
    return JSON.stringify({
      error: message,
    })
  }

  return message
}
