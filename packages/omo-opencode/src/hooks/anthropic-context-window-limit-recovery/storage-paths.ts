import { t } from "../../shared/i18n"
import { MESSAGE_STORAGE, PART_STORAGE } from "../../shared"

export { MESSAGE_STORAGE as MESSAGE_STORAGE_DIR, PART_STORAGE as PART_STORAGE_DIR }

export function getTruncationMessage(): string {
	return t("hooks.contextWindowLimit.truncationMessage")
}
