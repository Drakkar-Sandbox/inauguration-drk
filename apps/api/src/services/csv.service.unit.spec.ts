import { test } from "@japa/runner";

import CsvService from "#services/csv.service";

test.group("Services / Csv Service", () => {
	test("it should parse quoted fields, escaped quotes and CRLF", ({ assert }) => {
		const rows = new CsvService().parse('a,b\r\n"x, y","say ""hi"""\r\n"multi\nline",z\r\n');

		assert.deepEqual(rows, [
			["a", "b"],
			["x, y", 'say "hi"'],
			["multi\nline", "z"],
		]);
	});

	test("it should detect semicolon delimiter and strip BOM", ({ assert }) => {
		const rows = new CsvService().parse("﻿first_name;last_name\nAda;Lovelace");

		assert.deepEqual(rows, [
			["first_name", "last_name"],
			["Ada", "Lovelace"],
		]);
	});

	test("it should skip blank lines and key records by normalized header", ({ assert }) => {
		const records = new CsvService().parseWithHeader(
			" First_Name ,last_name\n\nAda , Lovelace\n,\n",
		);

		assert.deepEqual(records, [{ first_name: "Ada", last_name: "Lovelace" }]);
	});

	test("it should stringify with escaping and neutralize formulas", ({ assert }) => {
		const csv = new CsvService().stringify([
			["a", 'b "c"', null, "=HYPERLINK()"],
			[1, "x,y", undefined, "ok"],
		]);

		assert.equal(csv, `a,"b ""c""",,'=HYPERLINK()\r\n1,"x,y",,ok\r\n`);
	});
});
