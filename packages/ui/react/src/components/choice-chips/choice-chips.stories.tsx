import type { Meta, StoryObj } from "@storybook/react-vite";

import { type ChoiceChip, ChoiceChips } from "./index";

const RSVP: ChoiceChip[] = [
	{ value: "yes", label: "Je serai présent", tone: "primary" },
	{ value: "no", label: "Je ne pourrai pas venir" },
	{ value: "info", label: "Infos pratiques" },
];

const meta: Meta<typeof ChoiceChips> = {
	title: "Leif/ChoiceChips",
	component: ChoiceChips,
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
		choices: RSVP,
		size: "md",
		align: "center",
		"aria-label": "Réponses rapides",
	},
	argTypes: {
		size: { control: "inline-radio", options: ["md", "lg"] },
		align: { control: "inline-radio", options: ["start", "center"] },
	},
};

export default meta;
type Story = StoryObj<typeof ChoiceChips>;

export const Default: Story = {};

export const Large: Story = {
	args: { size: "lg" },
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const PartiallyDisabled: Story = {
	args: {
		choices: [
			{ value: "consent", label: "J'accepte", tone: "primary" },
			{ value: "refuse", label: "Je préfère ne pas" },
			{ value: "plus-one", label: "Ajouter un +1", disabled: true },
		],
	},
};
