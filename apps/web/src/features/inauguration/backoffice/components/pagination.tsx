import { useTranslation } from "react-i18next";

import { Button } from "@workspace/ui-react/components/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@workspace/ui-react/icons";

type PaginationProps = {
	meta: { currentPage: number; lastPage: number; total: number };
	onPageChange: (page: number) => void;
};

export function Pagination(props: PaginationProps) {
	const { meta, onPageChange } = props;

	const { t } = useTranslation("features.inauguration.backoffice.components.pagination");

	return (
		<div className="flex items-center justify-between gap-4 text-neutral-11 text-sm">
			<p>{t("summary", { page: meta.currentPage, last: meta.lastPage, count: meta.total })}</p>

			{meta.lastPage > 1 && (
				<div className="flex items-center gap-2">
					<Button
						size="icon-md"
						aria-label={t("previous")}
						disabled={meta.currentPage <= 1}
						onClick={() => onPageChange(meta.currentPage - 1)}
					>
						<ChevronLeftIcon />
					</Button>
					<Button
						size="icon-md"
						aria-label={t("next")}
						disabled={meta.currentPage >= meta.lastPage}
						onClick={() => onPageChange(meta.currentPage + 1)}
					>
						<ChevronRightIcon />
					</Button>
				</div>
			)}
		</div>
	);
}
