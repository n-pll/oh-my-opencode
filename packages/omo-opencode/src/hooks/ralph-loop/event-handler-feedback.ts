import type { PluginInput } from "@opencode-ai/plugin"
import { t } from "../../shared/i18n"
import type { RalphLoopState } from "./types"

export function showToastBestEffort(
	ctx: PluginInput,
	body: { title: string; message: string; variant: "warning" | "info"; duration: number },
): void {
	try {
		void Promise.resolve(ctx.client.tui?.showToast?.({ body })).catch((error: unknown) => {
			if (error instanceof Error) {
				return
			}
			return
		})
	} catch (error) {
		if (error instanceof Error) {
			return
		}
		return
	}
}

export function showMaxIterationsToast(
	ctx: PluginInput,
	state: RalphLoopState,
): void {
	showToastBestEffort(ctx, {
		title: t("hooks.ralphLoop.title.ralphLoopStopped"),
		message: t("hooks.ralphLoop.maxIterationsReached", {
			maxIterations: state.max_iterations,
		}),
		variant: "warning",
		duration: 5000,
	})
}

export function showIterationToast(
	ctx: PluginInput,
	state: RalphLoopState,
): void {
	const message = typeof state.max_iterations === "number"
		? t("hooks.ralphLoop.iterationProgress", {
				iteration: state.iteration,
				maxIterations: state.max_iterations,
			})
		: t("hooks.ralphLoop.iterationProgressUnbounded", { iteration: state.iteration })
	showToastBestEffort(ctx, {
		title: t("hooks.ralphLoop.title.ralphLoop"),
		message,
		variant: "info",
		duration: 2000,
	})
}

export function showNoProgressToast(
	ctx: PluginInput,
): void {
	showToastBestEffort(ctx, {
		title: t("hooks.ralphLoop.title.ralphLoopStopped"),
		message: t("hooks.ralphLoop.noModelProgress"),
		variant: "warning",
		duration: 5000,
	})
}

export function showIterationCommitFailureToast(ctx: PluginInput): void {
	showToastBestEffort(ctx, {
		title: t("hooks.ralphLoop.title.ralphLoopFailed"),
		message: t("hooks.ralphLoop.dispatchSucceededCommitFailed"),
		variant: "warning",
		duration: 5000,
	})
}

export function showDispatchFailureToast(
	ctx: PluginInput,
	result: { readonly status: string; readonly error?: unknown },
): void {
	const message = result.status === "dispatch_rejected"
		? t("hooks.ralphLoop.dispatchStatusWithError", {
				status: result.status,
				error: String(result.error),
			})
		: t("hooks.ralphLoop.dispatchStatus", { status: result.status })
	showToastBestEffort(ctx, {
		title: t("hooks.ralphLoop.title.ralphLoopFailed"),
		message,
		variant: "warning",
		duration: 5000,
	})
}
