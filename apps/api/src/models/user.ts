import { withAuthFinder } from "@adonisjs/auth/mixins/lucid";
import { compose } from "@adonisjs/core/helpers";
import hash from "@adonisjs/core/services/hash";

import { UserSchema } from "#database/schema";

const authFinder = withAuthFinder(() => hash.use("scrypt"), {
	uids: ["email"],
	passwordColumnName: "password",
});

/**
 * `admin`: Drakkar staff (back-office). `kiosk`: day-J screen devices, restricted to the
 * kiosk and avatar routes.
 */
export const USER_ROLES = ["admin", "kiosk"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export default class User extends compose(UserSchema, authFinder) {
	declare role: UserRole;
}
