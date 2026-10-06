#!/usr/bin/env node
/**
 * Leif image generator — OpenAI Images API via fetch, no SDK, no dependency.
 *
 * Usage (Node 24, from the repo root):
 *   OPENAI_API_KEY=sk-... node scripts/leif/generate-images.mjs <set> [options]
 *
 * Sets (see scripts/leif/prompts.mjs, documented in docs/inauguration/leif/PROMPTS.md):
 *   directions   6 art directions for the first exploration round (no reference needed)
 *   reference    turnaround sheet + A-pose views + neutral head      (use --ref)
 *   expressions  neutral / smile / listening / thinking / amused / speaking (use --ref)
 *   fullbody     kiosk shots on pure black                           (use --ref)
 *   card         bust for the paper invitation card                  (use --ref)
 *
 * Options:
 *   --ref <path.png>       Reference image of the chosen Leif: switches to the edits endpoint
 *                          (repeatable, up to the model limit) for character consistency.
 *   --only <id[,id]>       Generate only these shot ids.
 *   --n <1-10>             Variations per shot (default 1).
 *   --quality <q>          low | medium | high | auto (default high).
 *   --fidelity <f>         input_fidelity for edits: low | high (default high).
 *   --dry-run              Print the final prompts without calling the API (no key needed).
 *
 * Env:
 *   OPENAI_API_KEY         required unless --dry-run
 *   OPENAI_IMAGE_MODEL     default gpt-image-1
 *
 * Output: docs/inauguration/leif/out/<set>/<shot-id>-<timestamp>[-i].png
 *         plus docs/inauguration/leif/out/<set>/manifest.json (appended on each run).
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { buildPrompt, SETS } from "./prompts.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = path.join(ROOT, "docs/inauguration/leif/out");
const API_BASE = "https://api.openai.com/v1";

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		ref: { type: "string", multiple: true },
		only: { type: "string" },
		n: { type: "string", default: "1" },
		quality: { type: "string", default: "high" },
		fidelity: { type: "string", default: "high" },
		"dry-run": { type: "boolean", default: false },
		help: { type: "boolean", short: "h", default: false },
	},
});

const setName = positionals[0];

if (values.help || !setName || !(setName in SETS)) {
	console.log(
		`Usage: node scripts/leif/generate-images.mjs <${Object.keys(SETS).join("|")}> [--ref file.png] [--only id] [--n 1] [--quality high] [--dry-run]`,
	);
	process.exit(values.help ? 0 : 1);
}

// biome-ignore lint/suspicious/noUndeclaredEnvVars: standalone script, not a Turbo task
const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
// biome-ignore lint/suspicious/noUndeclaredEnvVars: standalone script, not a Turbo task
const apiKey = process.env.OPENAI_API_KEY;
const dryRun = values["dry-run"];
const refs = values.ref ?? [];
const n = Number.parseInt(values.n, 10);
const only = values.only?.split(",").map((id) => id.trim());
const shots = SETS[setName].filter((shot) => !only || only.includes(shot.id));

if (!dryRun && !apiKey) fail("OPENAI_API_KEY is not set (use --dry-run to preview prompts).");
if (!Number.isInteger(n) || n < 1 || n > 10) fail("--n must be an integer between 1 and 10.");
if (shots.length === 0) fail(`No shot matches --only ${values.only} in set "${setName}".`);
if (setName !== "directions" && refs.length === 0) {
	console.warn("⚠ No --ref given: consistency with the chosen Leif is not guaranteed.");
}

const refImages = await Promise.all(
	refs.map(async (file) => ({
		name: path.basename(file),
		data: await readFile(path.resolve(file)),
	})),
);

const setDir = path.join(OUT_DIR, setName);
if (!dryRun) await mkdir(setDir, { recursive: true });

const manifestPath = path.join(setDir, "manifest.json");

for (const shot of shots) {
	const prompt = buildPrompt(shot);

	if (dryRun) {
		console.log(`\n━━ ${setName}/${shot.id} — ${shot.title} (${shot.size ?? "auto"})\n${prompt}`);
		continue;
	}

	console.log(`→ ${setName}/${shot.id} (${refImages.length ? "edit" : "generate"}, n=${n})`);
	const started = Date.now();
	const images = refImages.length ? await edit(shot, prompt) : await generate(shot, prompt);
	const stamp = new Date().toISOString().replace(/[:.]/g, "-");

	const files = [];
	for (const [index, b64] of images.entries()) {
		const fileName = `${shot.id}-${stamp}${images.length > 1 ? `-${index + 1}` : ""}.png`;
		await writeFile(path.join(setDir, fileName), Buffer.from(b64, "base64"));
		files.push(fileName);
	}
	console.log(`  ✓ ${files.join(", ")} (${((Date.now() - started) / 1000).toFixed(1)}s)`);

	await appendManifest({
		set: setName,
		id: shot.id,
		title: shot.title,
		files,
		model,
		endpoint: refImages.length ? "images/edits" : "images/generations",
		references: refs.map((file) => path.relative(ROOT, path.resolve(file))),
		size: shot.size ?? "auto",
		quality: values.quality,
		background: shot.background ?? "auto",
		prompt,
		createdAt: new Date().toISOString(),
	});
}

if (!dryRun) console.log(`Manifest: ${path.relative(ROOT, manifestPath)}`);

/** Written after every shot so a failure mid-run keeps the images already paid for. */
async function appendManifest(entry) {
	const previous = await readFile(manifestPath, "utf-8")
		.then((content) => JSON.parse(content))
		.catch(() => []);
	await writeFile(manifestPath, `${JSON.stringify([...previous, entry], null, "\t")}\n`);
}

async function generate(shot, prompt) {
	const body = {
		model,
		prompt,
		n,
		size: shot.size ?? "auto",
		quality: values.quality,
		...(shot.background ? { background: shot.background } : {}),
	};

	return request("images/generations", {
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

async function edit(shot, prompt) {
	const form = new FormData();
	form.set("model", model);
	form.set("prompt", prompt);
	form.set("n", String(n));
	form.set("size", shot.size ?? "auto");
	form.set("quality", values.quality);
	form.set("input_fidelity", values.fidelity);
	if (shot.background) form.set("background", shot.background);
	for (const image of refImages) {
		form.append("image[]", new Blob([image.data], { type: "image/png" }), image.name);
	}

	return request("images/edits", { body: form });
}

async function request(endpoint, init) {
	const response = await fetch(`${API_BASE}/${endpoint}`, {
		method: "POST",
		...init,
		headers: { Authorization: `Bearer ${apiKey}`, ...init.headers },
	});
	const payload = await response.json().catch(() => ({}));

	if (!response.ok) {
		fail(
			`${endpoint} → HTTP ${response.status}: ${payload?.error?.message ?? response.statusText}`,
		);
	}

	return (payload.data ?? []).map((item) => item.b64_json).filter(Boolean);
}

function fail(message) {
	console.error(`✗ ${message}`);
	process.exit(1);
}
