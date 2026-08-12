import {
  TRUNCATION_NOTICE_PREFIX,
  TRUNCATION_NOTICE_PREFIX_ZH,
  TRUNCATION_NOTICE_SUFFIX,
} from "./constants";

export function formatAgentsMdContextBlock(input: {
  readonly agentsPath: string;
  readonly content: string;
  readonly truncated: boolean;
  /** Locale code (e.g. "en", "zh"). When set, labels render in that locale. */
  readonly locale?: string;
}): string {
  const zh = input.locale === "zh";
  const truncationPrefix = zh ? TRUNCATION_NOTICE_PREFIX_ZH : TRUNCATION_NOTICE_PREFIX;
  const directoryLabel = zh ? "目录上下文" : "Directory Context";
  const truncationNotice = input.truncated
    ? `${truncationPrefix}${input.agentsPath}${TRUNCATION_NOTICE_SUFFIX}`
    : "";
  return `\n\n[${directoryLabel}: ${input.agentsPath}]\n${input.content}${truncationNotice}`;
}
