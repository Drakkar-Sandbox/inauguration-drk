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
			<div className="grid gap-2">
				<h1 className="font-extrabold text-4xl text-neutral-12 leading-tight tracking-[-0.035em]">
					{title}
					<span className="text-primary-9">.</span>
				</h1>
				{description && <p className="font-text text-neutral-11 text-sm">{description}</p>}
			</div>

			{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
		</header>
	);
}
