import type { BuiltinSkill } from "../types"
import {
  createAgentBrowserTemplate,
  agentBrowserTemplate,
} from "./agent-browser-template"
import agentBrowserTemplateZhRaw from "../agent-browser/SKILL.zh.md" with { type: "text" }

const AGENT_BROWSER_DESCRIPTION = "MUST USE for any browser-related tasks. Browser automation via agent-browser CLI - verification, browsing, information gathering, web scraping, testing, screenshots, and all browser interactions."

const AGENT_BROWSER_DESCRIPTION_ZH = "任何浏览器相关任务都必须使用。通过 agent-browser CLI 进行浏览器自动化 - 验证、浏览、信息收集、网页抓取、测试、截图和所有浏览器交互。"

const agentBrowserTemplateZh = createAgentBrowserTemplate(agentBrowserTemplateZhRaw)

export function createAgentBrowserSkill(locale?: string): BuiltinSkill {
  return {
    name: "agent-browser",
    description: AGENT_BROWSER_DESCRIPTION,
    descriptionByLocale: { zh: AGENT_BROWSER_DESCRIPTION_ZH },
    template: agentBrowserTemplate,
    templateByLocale: { zh: agentBrowserTemplateZh },
    allowedTools: ["Bash(agent-browser:*)"],
  }
}

/** Backward-compatible English-default singleton. */
export const agentBrowserSkill: BuiltinSkill = createAgentBrowserSkill()
