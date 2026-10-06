import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button } from "@workspace/ui-react/components/button";
import { Card } from "@workspace/ui-react/components/card";
import { Skeleton } from "@workspace/ui-react/components/skeleton";
import { toast } from "@workspace/ui-react/components/toast";
import { CopyIcon, DownloadIcon } from "@workspace/ui-react/icons";

import { backofficeFileUrl } from "#/features/inauguration/backoffice/utils/api";
import { inauguration } from "#/libs/tuyau";

type GuestQrCardProps = {
	guestId: number;
	invitationUrl: string;
};

export function GuestQrCard(props: GuestQrCardProps) {
	const { guestId, invitationUrl } = props;

	const { t } = useTranslation("features.inauguration.backoffice.guests.components.guest-qr-card");

	const { data: svg } = useQuery(
		inauguration.backoffice.guests.qrSvg.queryOptions(
			{ params: { id: guestId } },
			{ staleTime: Number.POSITIVE_INFINITY },
		),
	);

	const copyUrl = async () => {
		await navigator.clipboard.writeText(invitationUrl);
		toast.success(t("copied"));
	};

	return (
		<Card>
			<Card.Header className="grid gap-0.5">
				<h2 className="font-semibold text-md text-neutral-12">{t("title")}</h2>
				<p className="font-text text-neutral-11 text-xs">{t("description")}</p>
			</Card.Header>
			<Card.Content className="grid gap-4">
				<div className="mx-auto aspect-square w-full max-w-56 rounded-lg border border-neutral-6 bg-white p-2">
					{typeof svg === "string" ? (
						<img
							src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
							alt={t("alt")}
							className="size-full"
						/>
					) : (
						<Skeleton className="block size-full rounded-md" />
					)}
				</div>

				<p className="truncate rounded-md bg-neutral-3 px-2 py-1 font-mono text-neutral-11 text-xs">
					{invitationUrl}
				</p>

				<div className="grid grid-cols-2 gap-2">
					<Button
						nativeButton={false}
						render={
							<a
								href={backofficeFileUrl("inauguration.backoffice.guests.qr_png", { id: guestId })}
								download
							/>
						}
					>
						<DownloadIcon />
						PNG
					</Button>
					<Button
						nativeButton={false}
						render={
							<a
								href={backofficeFileUrl("inauguration.backoffice.guests.qr_svg", { id: guestId })}
								download
							/>
						}
					>
						<DownloadIcon />
						SVG
					</Button>
					<Button className="col-span-2" onClick={copyUrl}>
						<CopyIcon />
						{t("copy")}
					</Button>
				</div>
			</Card.Content>
		</Card>
	);
}
