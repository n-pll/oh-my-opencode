import type { BuiltinSkill } from "../types"

/**
 * Extra CLI arguments appended to the default `@playwright/mcp@latest` invocation.
 *
 * By default the Playwright MCP server assumes it can launch the `chrome` channel
 * from a system-wide Chrome installation. In sandboxed environments (containers,
 * dev containers, CI runners, remote coding sandboxes) that binary is often
 * absent, and Playwright's bundled Chromium at `PLAYWRIGHT_BROWSERS_PATH` must be
 * used instead. `mcp_args` lets users pass `--executable-path`, `--headless`,
 * `--no-sandbox`, or any other MCP flag without forking the skill definition.
 *
 * See https://github.com/microsoft/playwright-mcp for supported flags.
 */
export interface PlaywrightSkillOptions {
  readonly mcp_args?: readonly string[]
}

const BASE_MCP_ARGS = ["@playwright/mcp@latest"] as const

const PLAYWRIGHT_MCP_DESCRIPTION =
  "MUST USE for any browser-related tasks. Browser automation via Playwright MCP - verification, browsing, information gathering, web scraping, testing, screenshots, and all browser interactions."

const PLAYWRIGHT_MCP_DESCRIPTION_ZH =
  "任何浏览器相关任务都必须使用。通过 Playwright MCP 进行浏览器自动化 - 验证、浏览、信息收集、网页抓取、测试、截图和所有浏览器交互。"

const PLAYWRIGHT_MCP_TEMPLATE = `# Playwright Browser Automation

This skill provides browser automation capabilities via the Playwright MCP server.`

const PLAYWRIGHT_MCP_TEMPLATE_ZH = `# Playwright 浏览器自动化

此技能通过 Playwright MCP 服务器提供浏览器自动化能力。`

/**
 * Factory returning the `playwright` built-in skill. When `options.mcp_args` is
 * provided the values are appended after `@playwright/mcp@latest`, so the
 * default invocation stays byte-identical to the legacy const-export when
 * called with no options.
 */
export function createPlaywrightSkill(options: PlaywrightSkillOptions = {}): BuiltinSkill {
  const extraArgs = options.mcp_args ?? []
  return {
    name: "playwright",
    description: PLAYWRIGHT_MCP_DESCRIPTION,
    descriptionByLocale: { zh: PLAYWRIGHT_MCP_DESCRIPTION_ZH },
    template: PLAYWRIGHT_MCP_TEMPLATE,
    templateByLocale: { zh: PLAYWRIGHT_MCP_TEMPLATE_ZH },
    mcpConfig: {
      playwright: {
        command: "npx",
        args: [...BASE_MCP_ARGS, ...extraArgs],
      },
    },
  }
}

/**
 * Backward-compatible singleton export. New callers should prefer
 * `createPlaywrightSkill()` so environment-specific MCP args can flow through
 * from user config without re-declaring the skill.
 */
export const playwrightSkill: BuiltinSkill = createPlaywrightSkill()
