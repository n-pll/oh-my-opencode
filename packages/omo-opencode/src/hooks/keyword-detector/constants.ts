export const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g
export const INLINE_CODE_PATTERN = /`[^`]+`/g

import type { KeywordType } from "../../config/schema/keyword-detector"
import { getUltraworkMessage, isPlannerAgent, isNonOmoAgent } from "./ultrawork"
import { TEAM_PATTERN, TEAM_MESSAGE } from "./team"
import { HYPERPLAN_PATTERN, HYPERPLAN_MESSAGE } from "./hyperplan"
import { getLocale } from "../../shared/i18n"

export { isPlannerAgent, isNonOmoAgent, getUltraworkMessage }
export { TEAM_PATTERN, TEAM_MESSAGE }
export { HYPERPLAN_PATTERN, HYPERPLAN_MESSAGE }

// Hyperplan-ultrawork combo: strict adjacency, both word orders
export const HYPERPLAN_ULTRAWORK_PATTERN =
  /\b(?:hpp|hyperplan)\s+(?:ulw|ultrawork)\b|\b(?:ulw|ultrawork)\s+(?:hpp|hyperplan)\b/i

const HYPERPLAN_ULTRAWORK_BANNER = `<hyperplan-ultrawork-mode>
**MANDATORY**: Say "HYPERPLAN ULTRAWORK MODE ENABLED!" exactly once as your first response. Do NOT say the standalone "ULTRAWORK MODE ENABLED!" or "HYPERPLAN MODE ENABLED!" banners.

Apply the ultrawork protocol below as your execution framework. You MUST ALSO load the hyperplan skill immediately via \`skill(name="hyperplan")\` and follow its full adversarial workflow — do NOT improvise, do NOT skip rounds, do NOT write the plan yourself.
</hyperplan-ultrawork-mode>`

const HYPERPLAN_ULTRAWORK_BANNER_ZH = `<hyperplan-ultrawork-mode>
**强制**：在第一条回复中准确说出 "HYPERPLAN ULTRAWORK MODE ENABLED!" 一次。不要说出单独的 "ULTRAWORK MODE ENABLED!" 或 "HYPERPLAN MODE ENABLED!" banner。

将下面的 ultrawork 协议作为你的执行框架。你还必须立即通过 \`skill(name="hyperplan")\` 加载 hyperplan 技能，并遵循其完整的对抗性工作流 —— 不要即兴发挥，不要跳过轮次，不要自己编写计划。
</hyperplan-ultrawork-mode>`

export function getHyperplanUltraworkMessage(agentName?: string, modelID?: string): string {
  const banner = getLocale() === "zh" ? HYPERPLAN_ULTRAWORK_BANNER_ZH : HYPERPLAN_ULTRAWORK_BANNER
  return `${banner}\n\n${getUltraworkMessage(agentName, modelID)}`
}

export type KeywordDetector = {
  type: KeywordType
  pattern: RegExp
  message: string | ((agentName?: string, modelID?: string) => string)
}

export const KEYWORD_DETECTORS: KeywordDetector[] = [
  {
    type: "ultrawork",
    pattern: /\b(ultrawork|ulw)\b/i,
    message: getUltraworkMessage,
  },
  {
    type: "team",
    pattern: TEAM_PATTERN,
    message: TEAM_MESSAGE,
  },
  {
    type: "hyperplan",
    pattern: HYPERPLAN_PATTERN,
    message: HYPERPLAN_MESSAGE,
  },
  {
    type: "hyperplan-ultrawork",
    pattern: HYPERPLAN_ULTRAWORK_PATTERN,
    message: getHyperplanUltraworkMessage,
  },
]
