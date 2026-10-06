import type { KioskTurn } from "#features/inauguration/leif/kiosk/services/kiosk_leif.service";

/**
 * One turn at the "Défiez" kiosk. Never includes the angle sheet nor the transcript.
 */
export default class LeifKioskTurnPresenter {
	toJSON(turn: KioskTurn) {
		const referentFirstName = turn.guest.referent?.name.trim().split(/\s+/)[0] || null;

		return {
			sessionId: turn.session.id,
			guest: {
				firstName: turn.guest.firstName,
				lastName: turn.guest.lastName,
				company: turn.guest.company,
			},
			reply: { text: turn.text },
			offerHandoff: turn.offerHandoff,
			handoffRequested: turn.session.handoffId !== null,
			referentFirstName,
			choices: turn.offerHandoff
				? [{ value: "handoff", label: `Parler à ${referentFirstName ?? "un membre de l'équipe"}` }]
				: [],
		};
	}
}
