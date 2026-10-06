import { createTuyau } from "@tuyau/core/client";
import { createTuyauReactQueryClient } from "@tuyau/react-query";
import { superjson } from "@tuyau/superjson/plugin";

import { registry } from "@workspace/api/registry";

export const client = createTuyau({
	baseUrl: import.meta.env.VITE_API_BASE_URL,
	headers: { Accept: "application/json" },
	registry,
	credentials: "include",
	plugins: [superjson()],
});

const tuyau = createTuyauReactQueryClient({ client });

export const api = tuyau.web;
export const inauguration = tuyau.inauguration;
