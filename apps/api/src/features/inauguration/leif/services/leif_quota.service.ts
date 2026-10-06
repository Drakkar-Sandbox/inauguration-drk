import redis from "@adonisjs/redis/services/main";
import { DateTime } from "luxon";

import LeifTurnLimitException from "#features/inauguration/leif/exceptions/leif_turn_limit.exception";

/**
 * Caps conversation turns per subject (guest token, kiosk session) and per day, so a
 * leaked invitation link can not be used as a free chatbot.
 */
export default class LeifQuotaService {
	async consume(scope: string, subject: string, limit: number) {
		const day = DateTime.now().toISODate();
		const key = `inauguration:leif:turns:${scope}:${subject}:${day}`;

		const count = await redis.incr(key);
		if (count === 1) await redis.expire(key, 60 * 60 * 24);
		if (count > limit) throw new LeifTurnLimitException();
	}
}
