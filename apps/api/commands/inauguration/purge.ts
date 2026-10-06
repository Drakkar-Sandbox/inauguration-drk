import { BaseCommand, flags } from "@adonisjs/core/ace";
import type { CommandOptions } from "@adonisjs/core/types/ace";
import { DateTime } from "luxon";

import eventConfig from "#config/event";
import Conversation from "#models/conversation";
import Handoff from "#models/handoff";

const PURGED_REASON = "Supprimé (durée de conservation dépassée).";

/**
 * Enforces the data retention policy: conversations (transcripts and summaries) older
 * than `dataRetentionMonths` are deleted and old handoff reasons are anonymized.
 * Meant to run daily (see the inauguration AGENTS.md).
 */
export default class InaugurationPurge extends BaseCommand {
	static commandName = "inauguration:purge";
	static description = "Delete conversations older than the event data retention period";

	static options: CommandOptions = {
		startApp: true,
	};

	@flags.boolean({ description: "Only count what would be deleted" })
	declare dryRun: boolean;

	async run() {
		const cutoff = DateTime.now().minus({ months: eventConfig.dataRetentionMonths });
		const conversations = Conversation.query().where("created_at", "<", cutoff.toSQL()!);
		const handoffs = Handoff.query()
			.where("created_at", "<", cutoff.toSQL()!)
			.whereNot("reason", PURGED_REASON);

		if (this.dryRun) {
			const [conversationCount, handoffCount] = await Promise.all([
				conversations.clone().count("* as total"),
				handoffs.clone().count("* as total"),
			]);
			this.logger.info(
				`Would delete ${conversationCount[0].$extras.total} conversation(s) and anonymize ${handoffCount[0].$extras.total} handoff(s) older than ${cutoff.toISODate()}.`,
			);
			return;
		}

		const deleted = await conversations.delete();
		const anonymized = await handoffs.update({ reason: PURGED_REASON });

		this.logger.success(
			`Deleted ${Number(deleted)} conversation(s) and anonymized ${Number(anonymized)} handoff(s) older than ${cutoff.toISODate()}.`,
		);
	}
}
