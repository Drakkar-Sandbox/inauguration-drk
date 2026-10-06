export default class CsvService {
	/**
	 * Parses RFC 4180 CSV content. The delimiter (`,` or `;`) is detected from the
	 * first line so that spreadsheets exported with a French locale are accepted.
	 */
	parse(content: string) {
		const text = content.replace(/^﻿/, "");
		const delimiter = this.#detectDelimiter(text);

		const rows: string[][] = [];
		let row: string[] = [];
		let field = "";
		let inQuotes = false;

		for (let index = 0; index < text.length; index++) {
			const char = text[index];

			if (inQuotes) {
				if (char === '"' && text[index + 1] === '"') {
					field += '"';
					index++;
				} else if (char === '"') {
					inQuotes = false;
				} else {
					field += char;
				}
				continue;
			}

			if (char === '"') {
				inQuotes = true;
			} else if (char === delimiter) {
				row.push(field);
				field = "";
			} else if (char === "\n" || char === "\r") {
				if (char === "\r" && text[index + 1] === "\n") index++;
				row.push(field);
				rows.push(row);
				row = [];
				field = "";
			} else {
				field += char;
			}
		}

		if (field !== "" || row.length > 0) {
			row.push(field);
			rows.push(row);
		}

		return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
	}

	/**
	 * Parses CSV content into objects keyed by the normalized (trimmed, lowercased) header.
	 */
	parseWithHeader(content: string) {
		const [header = [], ...rows] = this.parse(content);
		const keys = header.map((key) => key.trim().toLowerCase());

		return rows.map((cells) => {
			const record: Record<string, string> = {};
			keys.forEach((key, index) => {
				record[key] = (cells[index] ?? "").trim();
			});
			return record;
		});
	}

	stringify(rows: (string | number | boolean | null | undefined)[][]) {
		return `${rows.map((cells) => cells.map((cell) => this.#escape(cell)).join(",")).join("\r\n")}\r\n`;
	}

	#escape(value: string | number | boolean | null | undefined) {
		if (value === null || value === undefined) return "";

		let text = String(value);
		// Neutralize spreadsheet formulas (CSV injection), guest names come from public input.
		if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
		if (/[",\r\n;]/.test(text)) return `"${text.replace(/"/g, '""')}"`;

		return text;
	}

	#detectDelimiter(text: string) {
		const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
		const semicolons = firstLine.split(";").length;
		const commas = firstLine.split(",").length;

		return semicolons > commas ? ";" : ",";
	}
}
