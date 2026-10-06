import type { ReactNode } from "react";

type PageHeaderProps = {
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
};

export function PageHeader(props: PageHeaderProps) {
	const { title, description, actions } = props;

	return (
		<header className="flex flex-wrap items-end justify-between gap-4">
			<div className="grid gap-1">
				<h1 className="font-bold text-3xl text-neutral-12 tracking-tight">{title}</h1>
				{description && <p className="text-neutral-11 text-sm">{description}</p>}
			</div>

			{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
		</header>
	);
}
