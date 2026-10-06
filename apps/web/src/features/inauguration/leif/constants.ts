/**
 * Avatar name for the day-J screens: kiosk endpoints do not expose the event config, so this
 * is the single place it is defined on the web side (the public invitation uses the API value).
 * Keep it in sync with the API `EVENT_AVATAR_NAME`.
 */
export const KIOSK_AVATAR_NAME = import.meta.env.VITE_AVATAR_NAME || "Leif";

/**
 * Optional generated reference images of the avatar (portrait / full body). Without them the
 * provisional renderer draws its abstract presence.
 */
export const LEIF_PORTRAIT_SRC: string | undefined =
	import.meta.env.VITE_LEIF_PORTRAIT_URL || undefined;
export const LEIF_FULLBODY_SRC: string | undefined =
	import.meta.env.VITE_LEIF_FULLBODY_URL || undefined;
