import { checkAstGrepCli, checkCommentChecker } from "./dependencies"
import { getGhCliInfo } from "./tools-gh"
import { getInstalledLspServers } from "./tools-lsp"
import { getBuiltinMcpInfo, getUserMcpInfo } from "./tools-mcp"
import { CHECK_IDS, CHECK_NAMES } from "../framework/constants"
import type { CheckResult, DoctorIssue, ToolsSummary } from "../framework/types"
import { t } from "../../../shared/i18n"

export async function gatherToolsSummary(): Promise<ToolsSummary> {
  const [astGrepCliInfo, commentCheckerInfo, ghInfo] = await Promise.all([
    checkAstGrepCli(),
    checkCommentChecker(),
    getGhCliInfo(),
  ])

  const lspServers = getInstalledLspServers()
  const builtinMcp = getBuiltinMcpInfo()
  const userMcp = getUserMcpInfo()

  return {
    lspServers,
    astGrepCli: astGrepCliInfo.installed,
    commentChecker: commentCheckerInfo.installed,
    ghCli: {
      installed: ghInfo.installed,
      authenticated: ghInfo.authenticated,
      username: ghInfo.username,
    },
    mcpBuiltin: builtinMcp.map((server) => server.id),
    mcpUser: userMcp.map((server) => server.id),
  }
}

export function buildToolIssues(summary: ToolsSummary): DoctorIssue[] {
  const issues: DoctorIssue[] = []

  if (!summary.astGrepCli) {
    issues.push({
      title: t("cli.doctor.tools.astGrep.title"),
      description: t("cli.doctor.tools.astGrep.description"),
      fix: t("cli.doctor.tools.astGrep.fix"),
      severity: "warning",
      affects: ["ast-grep skill"],
    })
  }

  if (!summary.commentChecker) {
    issues.push({
      title: t("cli.doctor.tools.commentChecker.title"),
      description: t("cli.doctor.tools.commentChecker.description"),
      fix: t("cli.doctor.tools.commentChecker.fix"),
      severity: "warning",
      affects: ["comment-checker hook"],
    })
  }

  if (summary.lspServers.length === 0) {
    issues.push({
      title: t("cli.doctor.tools.lsp.title"),
      description: t("cli.doctor.tools.lsp.description"),
      severity: "warning",
      affects: ["lsp diagnostics", "rename", "references"],
    })
  }

  if (!summary.ghCli.installed) {
    issues.push({
      title: t("cli.doctor.tools.ghMissing.title"),
      description: t("cli.doctor.tools.ghMissing.description"),
      fix: t("cli.doctor.tools.ghMissing.fix"),
      severity: "warning",
      affects: ["GitHub automation"],
    })
  } else if (!summary.ghCli.authenticated) {
    issues.push({
      title: t("cli.doctor.tools.ghNotAuth.title"),
      description: t("cli.doctor.tools.ghNotAuth.description"),
      fix: t("cli.doctor.tools.ghNotAuth.fix"),
      severity: "warning",
      affects: ["GitHub automation"],
    })
  }

  return issues
}

export async function checkTools(): Promise<CheckResult> {
  const summary = await gatherToolsSummary()
  const userMcpServers = getUserMcpInfo()
  const invalidUserMcpServers = userMcpServers.filter((server) => !server.valid)
  const issues = buildToolIssues(summary)

  if (invalidUserMcpServers.length > 0) {
    issues.push({
      title: t("cli.doctor.tools.invalidMcp.title"),
      description: t("cli.doctor.tools.invalidMcp.description", { count: invalidUserMcpServers.length }),
      severity: "warning",
      affects: ["custom MCP tools"],
    })
  }

  return {
    name: CHECK_NAMES[CHECK_IDS.TOOLS],
    status: issues.length === 0 ? "pass" : "warn",
    message: issues.length === 0 ? t("cli.doctor.tools.passed") : t("cli.doctor.tools.issueDetected", { count: issues.length }),
    details: [
      t("cli.doctor.tools.detail.astGrep", { value: summary.astGrepCli ? t("common.yes") : t("common.no") }),
      t("cli.doctor.tools.detail.commentChecker", { value: summary.commentChecker ? t("common.yes") : t("common.no") }),
      t("cli.doctor.tools.detail.lsp", { value: summary.lspServers.length > 0 ? t("cli.doctor.tools.detail.lspServers", { count: summary.lspServers.length }) : t("common.none") }),
      t("cli.doctor.tools.detail.gh", { status: summary.ghCli.installed ? t("cli.doctor.tools.detail.ghInstalled") : t("cli.doctor.tools.detail.ghMissing"), suffix: summary.ghCli.authenticated ? t("cli.doctor.tools.detail.ghAuthenticated") : "" }),
      t("cli.doctor.tools.detail.mcp", { builtin: summary.mcpBuiltin.length, user: summary.mcpUser.length }),
    ],
    issues,
  }
}
