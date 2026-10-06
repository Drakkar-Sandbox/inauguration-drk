import factory from "@adonisjs/lucid/factories";

import Guest from "#models/guest";

export const GuestFactory = factory
	.define(Guest, ({ faker }) => {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();

		return {
			firstName,
			lastName,
			email: faker.internet.exampleEmail({ firstName, lastName }).toLowerCase(),
			company: faker.company.name(),
			kind: "primary" as const,
			status: "invited" as const,
			meetingStatus: "none" as const,
		};
	})
	.state("confirmed", (guest) => {
		guest.status = "confirmed";
	})
	.build();
