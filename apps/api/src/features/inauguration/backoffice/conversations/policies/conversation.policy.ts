import { BasePolicy } from "@adonisjs/bouncer";

/**
 * Conversation transcripts and summaries are staff-only and never shown on public screens.
 */
export default class ConversationPolicy extends BasePolicy {
	list() {
		return true;
	}

	view() {
		return true;
	}
}
