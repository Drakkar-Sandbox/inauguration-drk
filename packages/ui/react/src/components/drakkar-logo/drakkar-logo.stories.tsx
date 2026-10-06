import type { Meta, StoryObj } from "@storybook/react-vite";

import { DrakkarLogo } from "./index";

const meta: Meta<typeof DrakkarLogo> = {
	title: "Leif/DrakkarLogo",
	component: DrakkarLogo,
	args: {
		size: "md",
		tone: "ink",
		accent: true,
	},
	argTypes: {
		size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
		tone: { control: "inline-radio", options: ["ink", "paper", "current"] },
	},
};

export default meta;
type Story = StoryObj<typeof DrakkarLogo>;

export const Default: Story = {};

export const OnInk: Story = {
	args: { size: "xl" },
	decorators: [
		(Story) => (
			<div data-theme="dark" className="flex flex-col items-start gap-6 bg-neutral-1 p-16">
				<span className="font-bold text-neutral-10 text-xs uppercase tracking-[0.24em]">
					Inauguration · 3 décembre 2026
				</span>
				<Story />
			</div>
		),
	],
};

export const Sizes: Story = {
	render: (args) => (
		<div className="flex flex-col items-start gap-6">
			<DrakkarLogo {...args} size="sm" />
			<DrakkarLogo {...args} size="md" />
			<DrakkarLogo {...args} size="lg" />
			<DrakkarLogo {...args} size="xl" />
		</div>
	),
};
