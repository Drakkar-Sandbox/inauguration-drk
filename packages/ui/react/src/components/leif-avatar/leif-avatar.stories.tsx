import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import { LeifAvatar, type LeifAvatarProps, type LeifAvatarRendererProps } from "./index";

const STATES: LeifAvatarProps["state"][] = ["idle", "listening", "thinking", "speaking"];

/** Fake voice envelope so `speaking` can be previewed without audio. */
function useSimulatedMouth(enabled: boolean) {
	const [value, setValue] = useState(0);

	useEffect(() => {
		if (!enabled) {
			setValue(0);
			return;
		}
		let frame = 0;
		const start = performance.now();
		const tick = (now: number) => {
			const t = (now - start) / 1000;
			const syllables = Math.max(0, Math.sin(t * 11) * 0.6 + Math.sin(t * 4.3) * 0.4);
			const phrase = Math.sin(t * 0.9) > -0.6 ? 1 : 0.1;
			setValue(syllables * phrase);
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [enabled]);

	return value;
}

function LiveAvatar(props: LeifAvatarProps) {
	const mouthOpenness = useSimulatedMouth(props.state === "speaking");

	return <LeifAvatar {...props} mouthOpenness={props.mouthOpenness ?? mouthOpenness} />;
}

/** Inline placeholder image so stories never depend on a generated asset. */
const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 640"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f49"/><stop offset="1" stop-color="#16181d"/></linearGradient></defs><rect width="360" height="640" fill="#0b0c0f"/><circle cx="180" cy="130" r="56" fill="#4a4f59"/><path d="M90 260q90-60 180 0v380H90z" fill="url(#g)"/><circle cx="180" cy="290" r="4" fill="#ff4a48"/></svg>`,
)}`;

const meta: Meta<typeof LeifAvatar> = {
	title: "Leif/LeifAvatar",
	component: LeifAvatar,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Abstraction over Leif's visual. The provisional renderer is replaced by passing `renderer` (Three.js GLB, talking-image stream…) — consumers never change.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div
				data-theme="dark"
				className="flex min-h-screen items-center justify-center bg-neutral-1 p-10"
			>
				<Story />
			</div>
		),
	],
	args: {
		name: "Leif",
		state: "idle",
		framing: "portrait",
		size: "md",
	},
	argTypes: {
		state: { control: "inline-radio", options: STATES },
		framing: { control: "inline-radio", options: ["portrait", "fullbody"] },
		size: { control: "inline-radio", options: ["sm", "md", "lg", "fill"] },
		mouthOpenness: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
		renderer: { control: false },
	},
	render: (args) => <LiveAvatar {...args} />,
};

export default meta;
type Story = StoryObj<typeof LeifAvatar>;

export const Default: Story = {};

export const PortraitStates: Story = {
	render: (args) => (
		<div className="grid grid-cols-2 gap-12 md:grid-cols-4">
			{STATES.map((state) => (
				<div key={state} className="flex flex-col items-center gap-4">
					<LiveAvatar {...args} state={state} />
					<span className="font-bold text-neutral-10 text-xs uppercase tracking-[0.2em]">
						{state}
					</span>
				</div>
			))}
		</div>
	),
};

export const FullbodyKiosk: Story = {
	args: { framing: "fullbody", size: "lg", state: "speaking" },
	decorators: [
		(Story) => (
			<div data-theme="dark" className="flex min-h-screen items-end justify-center bg-black">
				<Story />
			</div>
		),
	],
};

export const FullbodyStates: Story = {
	args: { framing: "fullbody", size: "sm" },
	render: (args) => (
		<div className="flex flex-wrap items-end gap-12">
			{STATES.map((state) => (
				<div key={state} className="flex flex-col items-center gap-4">
					<LiveAvatar {...args} state={state} />
					<span className="font-bold text-neutral-10 text-xs uppercase tracking-[0.2em]">
						{state}
					</span>
				</div>
			))}
		</div>
	),
};

export const WithImage: Story = {
	args: { imageSrc: PLACEHOLDER_IMAGE },
	render: (args) => (
		<div className="flex flex-wrap items-end gap-12">
			<LiveAvatar {...args} framing="portrait" state="speaking" />
			<LiveAvatar {...args} framing="portrait" state="listening" />
			<LiveAvatar {...args} framing="fullbody" size="sm" state="speaking" />
			<LiveAvatar {...args} framing="fullbody" size="sm" state="thinking" />
		</div>
	),
};

function DebugRenderer(props: LeifAvatarRendererProps) {
	return (
		<div className="flex size-full flex-col items-center justify-center gap-2 rounded-xl border border-neutral-6 border-dashed font-mono text-neutral-11 text-xs">
			<span>custom renderer</span>
			<span>{props.state}</span>
			<span>mouth {props.mouthOpenness.toFixed(2)}</span>
		</div>
	);
}

export const CustomRenderer: Story = {
	args: { renderer: DebugRenderer, state: "speaking" },
};
