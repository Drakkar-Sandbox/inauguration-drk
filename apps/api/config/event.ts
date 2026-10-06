import env from "#start/env";

/**
 * Inauguration event content. Every text, date or name shown to guests, sent by
 * email or spoken by the avatar must be read from this object.
 *
 * Values marked TODO(contenu) are placeholders to be replaced by Drakkar.
 */

export type EventProgrammeItem = {
	time: string;
	label: string;
};

export type EventFaqEntry = {
	question: string;
	answer: string;
};

export type EventSpeechCue = {
	id: string;
	label: string;
	text: string;
};

export type EventConfig = {
	avatarName: string;
	title: string;
	organizer: string;
	timezone: string;
	date: string;
	startTime: string;
	endTime: string;
	address: {
		label: string;
		street: string;
		postalCode: string;
		city: string;
	};
	access: string;
	parking: string;
	dressCode: string;
	programme: EventProgrammeItem[];
	hostName: string;
	plusOneDeadlineDaysBefore: number;
	faq: EventFaqEntry[];
	dataPolicy: string;
	dataRetentionMonths: number;
	speechCues: EventSpeechCue[];
};

const eventConfig: EventConfig = {
	avatarName: env.get("EVENT_AVATAR_NAME", "Leif"),
	title: "Inauguration des nouveaux bureaux Drakkar",
	organizer: "Drakkar",
	timezone: "Europe/Paris",
	date: "2026-12-03",
	startTime: "18:30", // TODO(contenu)
	endTime: "22:30", // TODO(contenu)
	address: {
		label: "Drakkar", // TODO(contenu)
		street: "TODO(contenu) adresse",
		postalCode: "TODO(contenu)",
		city: "TODO(contenu)",
	},
	access: "TODO(contenu) accès (transports en commun, étage, digicode)",
	parking: "TODO(contenu) parking",
	dressCode: "TODO(contenu) dress code",
	programme: [
		{ time: "18:30", label: "TODO(contenu) Accueil des invités" },
		{ time: "19:30", label: "TODO(contenu) Discours" },
		{ time: "20:00", label: "TODO(contenu) Cocktail & borne « Défiez Leif »" },
		{ time: "22:30", label: "TODO(contenu) Fin de soirée" },
	],
	hostName: "TODO(contenu) nom du dirigeant",
	plusOneDeadlineDaysBefore: 3,
	faq: [
		{ question: "Où se déroule l'événement ?", answer: "TODO(contenu) adresse complète" },
		{ question: "À quelle heure arriver ?", answer: "TODO(contenu) horaires" },
		{ question: "Comment venir ?", answer: "TODO(contenu) accès" },
		{ question: "Puis-je me garer sur place ?", answer: "TODO(contenu) parking" },
		{ question: "Quelle tenue prévoir ?", answer: "TODO(contenu) dress code" },
		{ question: "Puis-je venir accompagné ?", answer: "TODO(contenu) règle du +1" },
	],
	dataPolicy:
		"TODO(contenu) Vos données servent uniquement à organiser l'événement et à poursuivre nos échanges. Aucun enregistrement audio n'est conservé ; seules les transcriptions et résumés le sont, avec votre accord. Elles sont accessibles uniquement à l'équipe Drakkar et supprimées au bout de 6 mois.",
	dataRetentionMonths: 6,
	speechCues: [
		{ id: "intro", label: "Introduction", text: "TODO(contenu) réplique d'introduction" },
		{ id: "welcome", label: "Bienvenue", text: "TODO(contenu) réplique de bienvenue" },
		{ id: "story", label: "Histoire", text: "TODO(contenu) réplique sur l'histoire de Drakkar" },
		{ id: "challenge", label: "Défi", text: "TODO(contenu) réplique « Défiez Leif »" },
		{ id: "closing", label: "Conclusion", text: "TODO(contenu) réplique de conclusion" },
	],
};

export default eventConfig;
