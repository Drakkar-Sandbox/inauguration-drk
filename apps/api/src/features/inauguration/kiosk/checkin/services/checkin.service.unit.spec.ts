import { test } from "@japa/runner";

import CheckinService from "#features/inauguration/kiosk/checkin/services/checkin.service";

test.group("Features / Inauguration / Kiosk / Checkin / Services / Checkin Service", () => {
	test("it should extract the token from a scanned value", ({ assert }) => {
		const service = new CheckinService();

		assert.equal(service.extractToken("  abc-DEF_123 "), "abc-DEF_123");
		assert.equal(service.extractToken("https://web.example.test/i/abc-DEF_123"), "abc-DEF_123");
		assert.equal(
			service.extractToken("https://web.example.test/i/abc-DEF_123?utm=x"),
			"abc-DEF_123",
		);
	});
});
