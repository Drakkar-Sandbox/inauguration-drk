import { inject } from "@adonisjs/core";

import eventConfig from "#config/event";
import type Guest from "#models/guest";
import EventService from "#services/event.service";

/**
 * Scripted lines of the avatar (French, formal "vous", short sentences). They are the
 * source of every closed question and the whole dialogue in degraded mode. Names and
 * event facts always come from `config/event.ts`.
 */
@inject()
export default class LeifLinesService {
	constructor(protected eventService: EventService) {}

	get avatarName() {
		return eventConfig.avatarName;
	}

	/**
	 * A plus-one's name was typed by their host: it is shown, never voiced on the public site
	 * (`voiced` variants only contain staff-entered or scripted text).
	 */
	#name(guest: Guest, voiced: boolean, prefix = " ") {
		return voiced && guest.kind === "plus_one" ? "" : `${prefix}${guest.firstName}`;
	}

	signupWelcome(guest: Guest, returning: boolean, voiced = false) {
		if (returning) return `Ravi de vous retrouver${this.#name(guest, voiced, ", ")}.`;

		const info = this.eventService.publicInfo();
		if (guest.kind === "plus_one" && guest.host) {
			return `Bonjour${this.#name(guest, voiced)}. Je suis ${this.avatarName}, l'hôte de la soirée « ${info.title} ». ${guest.host.firstName} ${guest.host.lastName} vous a convié : vous êtes attendu le ${info.dateLabel}.`;
		}

		return `Bonjour${this.#name(guest, voiced)}. Je suis ${this.avatarName}, votre hôte pour la soirée « ${info.title} », le ${info.dateLabel}.`;
	}

	consentQuestion() {
		return `Une formalité d'abord : acceptez-vous que l'équipe ${eventConfig.organizer} conserve le texte de nos échanges ? Aucun enregistrement audio n'est gardé, et tout est effacé après ${eventConfig.dataRetentionMonths} mois. Refuser ne change rien à la soirée.`;
	}

	consentGiven() {
		return "Merci de votre confiance.";
	}

	consentRefused() {
		return "C'est noté : rien de notre échange ne sera conservé.";
	}

	rsvpQuestion() {
		const info = this.eventService.publicInfo();

		return `Serez-vous des nôtres le ${info.dateLabel}, ${info.timeLabel} ?`;
	}

	rsvpConfirmed() {
		return "Splendide, votre place est réservée.";
	}

	plusOneQuestion(guest: Guest, voiced = false) {
		const plusOne = guest.plusOne;
		if (plusOne && voiced) return "Vous venez accompagné. Souhaitez-vous changer quelque chose ?";
		if (plusOne) {
			return `Vous venez avec ${plusOne.firstName} ${plusOne.lastName}. Souhaitez-vous changer quelque chose ?`;
		}

		return "Souhaitez-vous venir accompagné ? Votre invité recevra sa propre invitation par email.";
	}

	plusOneDetailsQuestion() {
		return "Avec plaisir. Donnez-moi son prénom, son nom et son adresse email.";
	}

	plusOneMissing(missing: string[]) {
		return `Il me manque encore ${new Intl.ListFormat("fr", { type: "conjunction" }).format(missing)}.`;
	}

	plusOneInvalidEmail() {
		return "Cette adresse email me semble incomplète. Pourriez-vous la vérifier ?";
	}

	plusOneConfirmQuestion(plusOne: { firstName: string; lastName: string; email: string }) {
		return `Je récapitule : ${plusOne.firstName} ${plusOne.lastName}, ${plusOne.email}. Est-ce exact ?`;
	}

	/** Voiced recap: never reads the names or email typed by the guest. */
	plusOneConfirmSpoken() {
		return "Je récapitule, est-ce bien exact ?";
	}

	plusOneSaved(firstName: string) {
		return `C'est fait : ${firstName} recevra son invitation par email.`;
	}

	plusOneSavedSpoken() {
		return "C'est fait : votre invité recevra son invitation par email.";
	}

	plusOneLimit() {
		return `Vous avez déjà modifié votre accompagnant plusieurs fois : l'équipe ${eventConfig.organizer} se fera un plaisir de vous aider par email.`;
	}

	plusOneRemoved() {
		return "Entendu, vous viendrez seul.";
	}

	plusOneClosed() {
		return "Les ajouts d'accompagnants sont désormais clos, je le regrette.";
	}

	practicalInfo() {
		const info = this.eventService.publicInfo();

		return `Notez bien : le ${info.dateLabel}, ${info.timeLabel}, ${info.address.full}. Tenue : ${info.dressCode}. Une question pratique ?`;
	}

	anotherQuestion() {
		return "Une autre question ?";
	}

	faqAnswer(index: number) {
		return eventConfig.faq[index]?.answer ?? null;
	}

	farewell(guest: Guest, voiced = false) {
		if (guest.status === "declined") {
			return `C'est noté, et c'est bien dommage. Si vos plans changent, cette page reste ouverte. Au plaisir${this.#name(guest, voiced, ", ")}.`;
		}

		return `Votre QR code personnel vous attend sur cette page et dans vos emails : il vous ouvrira les portes. À très bientôt${this.#name(guest, voiced, ", ")}.`;
	}

	offTopic() {
		return "Sujet passionnant, mais je ne suis que le maître de cérémonie : je m'en tiens à la soirée.";
	}

	notUnderstood() {
		return "Pardonnez-moi, je n'ai pas bien saisi.";
	}

	/**
	 * Reception screen welcome, spoken in 10–15 seconds. A plus-one is greeted with their host.
	 */
	receptionGreeting(guest: Guest) {
		if (guest.kind === "plus_one" && guest.host) {
			return `Bienvenue, ${guest.firstName} ! ${guest.host.firstName} nous a parlé de vous : faites comme chez vous, la soirée ${eventConfig.organizer} commence.`;
		}

		return `Bienvenue, ${guest.firstName} ${guest.lastName} ! Toute l'équipe ${eventConfig.organizer} est ravie de vous accueillir dans ses nouveaux bureaux.`;
	}

	kioskWelcome(guest: Guest, consentGiven: boolean) {
		const company = guest.company ? ` chez ${guest.company}` : "";
		const privacy = consentGiven
			? "Comme convenu, je garde une trace écrite de notre échange pour l'équipe."
			: "Rien de notre échange ne sera conservé.";

		return `Bonjour ${guest.firstName} ! Parlez-moi de votre métier${company} : en une minute, je vous propose une piste d'intelligence artificielle taillée pour vous. ${privacy}`;
	}

	kioskIdea() {
		return "Passionnant. Une piste à creuser : un assistant qui prend en charge les tâches répétitives de vos équipes, comme le tri des demandes ou la synthèse de documents. Qu'en pensez-vous ?";
	}

	kioskHandoffOffer(referentFirstName: string | null) {
		const who = referentFirstName ?? "Un membre de l'équipe";

		return `${who} connaît très bien ces sujets et serait ravi d'en parler avec vous. Voulez-vous que je vous mette en relation ?`;
	}

	kioskHandoffDone(referentFirstName: string | null) {
		const who = referentFirstName ?? "un membre de l'équipe";

		return `C'est transmis : ${who} vous rejoint très vite. Merci pour ce bel échange !`;
	}

	/**
	 * Replaces an AI reply that touched money or the private angle sheet.
	 */
	kioskSafeLine(referentFirstName: string | null) {
		const who = referentFirstName ?? "un membre de l'équipe";

		return `Voilà une question à laquelle ${who} répondra bien mieux que moi. Voulez-vous que je vous mette en relation ?`;
	}

	kioskWaiting() {
		return "Laissez-moi réfléchir un instant… Pourriez-vous me redire cela autrement ?";
	}
}
