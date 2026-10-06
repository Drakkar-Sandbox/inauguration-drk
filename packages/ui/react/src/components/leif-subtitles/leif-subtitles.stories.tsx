import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ComponentProps, useEffect, useState } from "react";

import { LeifSubtitles, type LeifSubtitleWord } from "./index";

const TEXT = "Bonsoir, et bienvenue chez Drakkar. Je suis ravi de vous compter parmi nous.";

/** Evenly spaced fake timings, ~300 ms per word. */
const ALIGNMENT: LeifSubtitleWord[] = TEXT.split(" ").map((text, index) => ({
	text,
	startMs: index * 320,
	endMs: index * 320 + 280,
}));

const DURATION_MS = ALIGNMENT.length * 320 + 800;

function usePlayback() {
	const [time, setTime] = useState(0);

	useEffect(() => {
		let frame = 0;
		const start = performance.now();
		const tick = (now: number) => {
			setTime((now - start) % DURATION_MS);
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, []);

	return time;
}

const meta: Meta<typeof LeifSubtitles> = {
	title: "Leif/LeifSubtitles",
	component: LeifSubtitles,
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
		text: TEXT,
		speaker: "Leif",
		size: "lg",
		align: "center",
	},
	argTypes: {
		size: { control: "inline-radio", options: ["md", "lg", "xl"] },
		align: { control: "inline-radio", options: ["start", "center"] },
		currentTimeMs: { control: { type: "range", min: 0, max: DURATION_MS, step: 10 } },
	},
};

export default meta;
type Story = StoryObj<typeof LeifSubtitles>;

export const PlainText: Story = {};

export const WordByWord: Story = {
	args: { alignment: ALIGNMENT, currentTimeMs: 1500 },
};

function LivePlayback(props: ComponentProps<typeof LeifSubtitles>) {
	const time = usePlayback();

	return <LeifSubtitles {...props} alignment={ALIGNMENT} currentTimeMs={time} />;
}

export const Playing: Story = {
	render: (args) => <LivePlayback {...args} />,
};

export const KioskXL: Story = {
	args: { size: "xl" },
	render: (args) => <LivePlayback {...args} />,
};
