import { LeifAvatarProvisionalRenderer, LeifAvatarRoot } from "./leif-avatar";

export const LeifAvatar = Object.assign(LeifAvatarRoot, {
	ProvisionalRenderer: LeifAvatarProvisionalRenderer,
});

export type {
	LeifAvatarFraming,
	LeifAvatarRenderer,
	LeifAvatarRendererProps,
	LeifAvatarRootProps as LeifAvatarProps,
	LeifAvatarState,
} from "./leif-avatar";
