import { test } from "@japa/runner";

import Guest from "#models/guest";

test.group("Models / Guest", () => {
	test("it should generate unique url-safe tokens of at least 24 characters", ({ assert }) => {
		const tokens = new Set(Array.from({ length: 1000 }, () => Guest.generateToken()));

		assert.equal(tokens.size, 1000);
		for (const token of tokens) {
			assert.match(token, /^[A-Za-z0-9_-]{24,}$/);
		}
	});

	test("it should build the QR url from the frontend url and token", ({ assert }) => {
		const guest = new Guest();
		guest.token = "abc_DEF-123";

		assert.match(guest.qrUrl, /\/i\/abc_DEF-123$/);
	});
});
