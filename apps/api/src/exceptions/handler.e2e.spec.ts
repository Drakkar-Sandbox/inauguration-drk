import testUtils from "@adonisjs/core/services/test_utils";
import { test } from "@japa/runner";
import vine from "@vinejs/vine";

import GuestNotFoundException from "#exceptions/guest_not_found.exception";
import HttpExceptionHandler from "#exceptions/handler";

/**
 * The handler as configured in production (debug off).
 */
class ProductionExceptionHandler extends HttpExceptionHandler {
	protected debug = false;
}

const jsonContext = async () => {
	const ctx = await testUtils.createHttpContext();
	ctx.request.request.headers.accept = "application/json";

	return ctx;
};

test.group("Exceptions / Handler", () => {
	test("it should send the error code without stack trace when debug is off", async ({
		assert,
	}) => {
		const ctx = await jsonContext();

		await new ProductionExceptionHandler().handle(new GuestNotFoundException(), ctx);

		assert.equal(ctx.response.getStatus(), 404);
		assert.deepEqual(ctx.response.getBody(), {
			message: "Invitation introuvable.",
			code: "E_GUEST_NOT_FOUND",
		});
	});

	test("it should hide unexpected server errors when debug is off", async ({ assert }) => {
		const ctx = await jsonContext();
		const error = Object.assign(new Error('duplicate key value violates "guests_token_unique"'), {
			code: "23505",
		});

		await new ProductionExceptionHandler().handle(error, ctx);

		assert.equal(ctx.response.getStatus(), 500);
		assert.deepEqual(ctx.response.getBody(), { message: "Internal server error", code: null });
	});

	test("it should keep validation messages next to the code", async ({ assert }) => {
		const ctx = await jsonContext();
		const [error] = await vine.create({ email: vine.string().email() }).tryValidate({});

		await new ProductionExceptionHandler().handle(error, ctx);

		assert.equal(ctx.response.getStatus(), 422);
		const body = ctx.response.getBody() as { code: string; errors: { field: string }[] };
		assert.equal(body.code, "E_VALIDATION_ERROR");
		assert.equal(body.errors[0].field, "email");
		assert.notProperty(body, "stack");
	});

	test("it should send the code over HTTP", async ({ client }) => {
		const response = await client.visit("inauguration.invitations.view", { token: "unknown" });

		response.assertNotFound();
		response.assertBodyContains({ code: "E_GUEST_NOT_FOUND", message: "Invitation introuvable." });
	});
});
