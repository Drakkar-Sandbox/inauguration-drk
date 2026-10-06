import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import i18nextMerger from "@workspace/i18next-merger/vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	server: {
		port: Number(process.env.PORT) ?? undefined,
	},
	plugins: [
		devtools({
			// Piping echoes server logs into the browser console and back: one warning loops forever.
			consolePiping: { enabled: false },
		}),
		tailwindcss(),
		tanstackStart({
			spa: {
				enabled: true,
			},
			router: {
				routeToken: "layout",
				indexToken: "page",
			},
		}),
		viteReact(),
		babel({ presets: [reactCompilerPreset()] }),
		i18nextMerger({
			locales: ["fr"],
			glob: "**/locales/**",
			outputDir: "src/libs/i18n/build",
		}),
	],
});

export default config;
