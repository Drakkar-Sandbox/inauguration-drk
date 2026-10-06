/**
 * Leif image prompts — source used by `generate-images.mjs`.
 * Mirrored (with French explanations) in `docs/inauguration/leif/PROMPTS.md`: edit both together.
 *
 * Every final prompt = CHARACTER + STYLE + the shot-specific prompt + AVOID.
 */

export const CHARACTER = [
	"Leif, a distinguished Viking gentleman in his late forties, acting as the host of a premium tech consultancy's office inauguration.",
	"Tall, broad-shouldered, upright and calm posture; weathered yet well-groomed face, warm intelligent grey-blue eyes, the hint of a wry smile.",
	"Full, neatly groomed ash-blond beard with two small braids bound by plain brushed-silver rings; hair swept back with a tidy side braid, temples slightly greying.",
	"Wears an impeccably tailored modern suit in deep ink charcoal (#16181d), crisp white shirt, slim ink tie, and a small coral-red (#FF4A48) pocket square — the only touch of colour.",
	"Subtle Nordic details: brushed-silver tie pin and cufflinks with a minimalist longship-prow motif.",
].join(" ");

export const STYLE = [
	"Stylized 3D character with the finish of a high-end animated feature film or a premium video-game cinematic:",
	"physically based materials, fine fabric weave, soft cinematic studio lighting, subtle subsurface scattering on skin,",
	"refined, slightly stylized but anatomically credible adult proportions, clean readable silhouette. Sober, premium, corporate mood.",
].join(" ");

export const AVOID =
	"Avoid: horned helmet, fur cape, armour, weapons, axes, shields, cartoon or chibi proportions, childish look, photorealistic uncanny skin, exaggerated muscles, text, logos, watermarks.";

/** Applied to every image-to-3D / reference shot so geometry reads cleanly. */
const NEUTRAL_REFERENCE =
	"Plain flat light-grey background (#d9dadd), even soft lighting without harsh shadows, orthographic-like camera at chest height, full figure visible from head to toe, no props.";

const A_POSE =
	"Relaxed A-pose: arms about 30 degrees away from the body, palms facing the thighs, feet shoulder-width apart, neutral closed-mouth expression.";

const HEAD_SHOT =
	"Head-and-shoulders close-up, centred, facing the camera, plain mid-grey background (#8a909b), soft even key light, high facial detail, no hands in frame.";

/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   prompt: string;
 *   size?: "1024x1024" | "1024x1536" | "1536x1024" | "auto";
 *   background?: "opaque" | "transparent" | "auto";
 * }} LeifShot
 */

/** @type {Record<"directions" | "reference" | "expressions" | "fullbody" | "card", LeifShot[]>} */
export const SETS = {
	// (a) First exploration round: six distinct art directions, same character, same framing.
	directions: [
		{
			id: "d1-feature-film",
			title: "Feature film, warm and refined",
			size: "1024x1536",
			prompt:
				"Art direction: premium animated feature film, soft painterly texturing, gentle warm key light and cool rim light, expressive but restrained face. Full body, standing, slight three-quarter view, hands loosely clasped in front, neutral dark-grey studio backdrop.",
		},
		{
			id: "d2-game-cinematic",
			title: "Game cinematic, semi-realistic",
			size: "1024x1536",
			prompt:
				"Art direction: semi-realistic AAA game cinematic, detailed skin pores and beard strands, dramatic but elegant three-point lighting, shallow depth of field. Full body, standing, slight three-quarter view, one hand adjusting a cufflink, dark ink backdrop.",
		},
		{
			id: "d3-sculpted-porcelain",
			title: "Sculpted, gallery-object minimalism",
			size: "1024x1536",
			prompt:
				"Art direction: sculpted collectible-art look, matte porcelain-like skin and fabric with very fine surface detail, restrained palette of ink, bone white and a single coral accent, museum lighting. Full body, standing, slight three-quarter view, calm welcoming pose, seamless warm-grey backdrop.",
		},
		{
			id: "d4-illustrated-editorial",
			title: "2.5D editorial illustration",
			size: "1024x1536",
			prompt:
				"Art direction: high-end 2.5D editorial illustration with painted 3D volumes, crisp graphic shapes and subtle brush texture, magazine-cover quality. Full body, standing, slight three-quarter view, one hand in trouser pocket, plain off-white backdrop with soft shadow.",
		},
		{
			id: "d5-faceted-realtime",
			title: "Faceted, real-time friendly",
			size: "1024x1536",
			prompt:
				"Art direction: elegant faceted low-poly stylization with smooth gradients on each plane, clean geometry suitable for a real-time 3D engine, ink and silver palette with coral accent. Full body, standing, slight three-quarter view, welcoming open-palm gesture, dark graphite backdrop.",
		},
		{
			id: "d6-noir-stage",
			title: "Noir stage, kiosk mood",
			size: "1024x1536",
			prompt:
				"Art direction: theatrical noir stage portrait, figure emerging from pure black, strong cool rim light and a thin coral-red rim light on one side, polished cinematic finish. Full body, standing, facing camera, hands clasped, pure black background (#000000).",
		},
	],

	// (b) Consistency set — run with --ref <chosen direction PNG>.
	reference: [
		{
			id: "turnaround-sheet",
			title: "Turnaround sheet (front / 3/4 / profile / back)",
			size: "1536x1024",
			prompt: `Character turnaround reference sheet of exactly the same character as the input image: four full-body views side by side at identical scale — front, three-quarter, side profile, back. ${A_POSE} ${NEUTRAL_REFERENCE} No labels, no text.`,
		},
		{
			id: "front-a-pose",
			title: "Front, A-pose (image-to-3D input)",
			size: "1024x1536",
			prompt: `Exactly the same character as the input image, seen strictly from the front. ${A_POSE} ${NEUTRAL_REFERENCE}`,
		},
		{
			id: "three-quarter-a-pose",
			title: "Three-quarter, A-pose",
			size: "1024x1536",
			prompt: `Exactly the same character as the input image, three-quarter front view turned 45 degrees to his left. ${A_POSE} ${NEUTRAL_REFERENCE}`,
		},
		{
			id: "profile-a-pose",
			title: "Profile, A-pose",
			size: "1024x1536",
			prompt: `Exactly the same character as the input image, strict side profile facing left. ${A_POSE} ${NEUTRAL_REFERENCE}`,
		},
		{
			id: "back-a-pose",
			title: "Back, A-pose",
			size: "1024x1536",
			prompt: `Exactly the same character as the input image, seen strictly from the back, showing hair braid and suit cut. ${A_POSE} ${NEUTRAL_REFERENCE}`,
		},
		{
			id: "head-neutral",
			title: "Neutral head close-up (talking-head pipeline)",
			size: "1024x1024",
			prompt: `Exactly the same character as the input image. ${HEAD_SHOT} Looking straight into the lens, neutral relaxed expression, lips gently closed, eyes fully open, beard not covering the mouth.`,
		},
	],

	expressions: [
		{
			id: "expr-neutral",
			title: "Neutral",
			size: "1024x1024",
			prompt: `Exactly the same character as the input image. ${HEAD_SHOT} Calm neutral expression, attentive gaze into the lens.`,
		},
		{
			id: "expr-smile",
			title: "Smile",
			size: "1024x1024",
			prompt: `Exactly the same character as the input image. ${HEAD_SHOT} Warm, genuine closed-mouth smile, eyes slightly creased.`,
		},
		{
			id: "expr-listening",
			title: "Listening",
			size: "1024x1024",
			prompt: `Exactly the same character as the input image. ${HEAD_SHOT} Listening attentively, head tilted a few degrees, eyebrows slightly raised, lips relaxed.`,
		},
		{
			id: "expr-thinking",
			title: "Thinking",
			size: "1024x1024",
			prompt: `Exactly the same character as the input image. ${HEAD_SHOT} Thoughtful, gaze drifting up and to the side, one eyebrow subtly lowered.`,
		},
		{
			id: "expr-amused",
			title: "Amused (dry wit)",
			size: "1024x1024",
			prompt: `Exactly the same character as the input image. ${HEAD_SHOT} Dry, understated amusement: half smile on one side, knowing look, one eyebrow raised.`,
		},
		{
			id: "expr-speaking",
			title: "Speaking",
			size: "1024x1024",
			prompt: `Exactly the same character as the input image. ${HEAD_SHOT} Mid-sentence, mouth naturally open as if pronouncing an "a" vowel, engaged friendly eyes.`,
		},
	],

	fullbody: [
		{
			id: "kiosk-idle",
			title: "Kiosk, standing idle on black",
			size: "1024x1536",
			background: "opaque",
			prompt:
				"Exactly the same character as the input image, full body head to toe, standing facing the camera, hands loosely clasped in front, subtle cool rim light separating him from a pure black background (#000000), feet grounded with a faint floor reflection, generous headroom.",
		},
		{
			id: "kiosk-welcome",
			title: "Kiosk, welcoming gesture on black",
			size: "1024x1536",
			background: "opaque",
			prompt:
				"Exactly the same character as the input image, full body head to toe, welcoming open-palm gesture with the right hand, slight bow of the head, pure black background (#000000), cool rim light with a thin coral-red accent rim on one side.",
		},
		{
			id: "kiosk-presenting",
			title: "Kiosk, presenting on black",
			size: "1024x1536",
			background: "opaque",
			prompt:
				"Exactly the same character as the input image, full body head to toe, three-quarter view, presenting something off-frame with an elegant open hand, confident half smile, pure black background (#000000), cinematic rim light.",
		},
	],

	card: [
		{
			id: "card-bust-white",
			title: "Invitation card bust, paper white",
			size: "1536x1024",
			background: "opaque",
			prompt:
				"Exactly the same character as the input image, waist-up bust, slight three-quarter turn, looking at the viewer with a warm wry smile, placed in the left third of the frame with generous empty paper-white space (#ffffff) on the right for typography, soft studio light, print quality.",
		},
		{
			id: "card-bust-transparent",
			title: "Invitation card bust, transparent cut-out",
			size: "1024x1536",
			background: "transparent",
			prompt:
				"Exactly the same character as the input image, waist-up bust, slight three-quarter turn, looking at the viewer with a warm wry smile, isolated on a transparent background with clean edges around hair and beard, soft studio light, print quality.",
		},
	],
};

/** Builds the final prompt sent to the API for a shot. */
export function buildPrompt(shot) {
	return `${CHARACTER}\n\n${STYLE}\n\n${shot.prompt}\n\n${AVOID}`;
}
