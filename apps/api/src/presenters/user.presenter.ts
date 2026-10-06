import type User from "#models/user";

export default class UserPresenter {
	toJSON(user: User) {
		return {
			id: user.id,

			name: user.name,
			email: user.email,
			role: user.role,

			createdAt: user.createdAt.toJSDate(),
			updatedAt: user.updatedAt.toJSDate(),
		};
	}
}
