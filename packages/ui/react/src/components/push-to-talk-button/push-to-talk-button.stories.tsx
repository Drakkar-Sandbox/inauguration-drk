import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import { PushToTalkButton, type PushToTalkButtonProps, type PushToTalkState } from "./index";

const STATES: PushToTalkState[] = ["idle", "recording", "processing", "disabled"];

const meta: Meta<typeof PushToTalkButton> = {
	title: "Leif/PushToTalkButton",
	component: PushToTalkButton,
	parameters: { layout: "fullscreen" },
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
		state: "idle",
		level: 0.5,
		size: "lg",
	},
	argTypes: {
		state: { control: "inline-radio", options: STATES },
		size: { control: "inline-radio", options: ["md", "lg", "xl"] },
		level: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
	},
};

export default meta;
type Story = StoryObj<typeof PushToTalkButton>;

export const Default: Story = {};

export const States: Story = {
	render: (args) => (
		<div className="flex flex-wrap items-start gap-16">
			{STATES.map((state) => (
				<PushToTalkButton key={state} {...args} state={state} />
			))}
		</div>
	),
};

/** Hold the button (or Space anywhere): recording with a fake level, then a short processing phase. */
function Interactive(props: PushToTalkButtonProps) {
	const [state, setState] = useState<PushToTalkState>("idle");
	const [level, setLevel] = useState(0);

	useEffect(() => {
		if (state !== "recording") return;
		const interval = setInterval(() => setLevel(0.2 + Math.random() * 0.8), 90);
		return () => clearInterval(interval);
	}, [state]);

	useEffect(() => {
		if (state !== "processing") return;
		const timeout = setTimeout(() => setState("idle"), 1400);
		return () => clearTimeout(timeout);
	}, [state]);

	return (
		<PushToTalkButton
			{...props}
			globalHotkey
			state={state}
			level={level}
			onPressStart={() => setState("recording")}
			onPressEnd={() => setState("processing")}
			onPressCancel={() => setState("idle")}
		/>
	);
}

export const Playground: Story = {
	args: { size: "xl" },
	render: (args) => <Interactive {...args} />,
};
