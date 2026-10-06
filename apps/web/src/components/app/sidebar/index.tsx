import { DrakkarLogo } from "@workspace/ui-react/components/drakkar-logo";
import { Sidebar as UiSidebar } from "@workspace/ui-react/components/sidebar";

import { SidebarNav } from "#/components/app/sidebar/nav";
import { SidebarUserMenu } from "#/components/app/sidebar/user-menu";

export function Sidebar() {
	return (
		<UiSidebar className="print:hidden">
			<UiSidebar.Header className="px-4 pt-5 pb-3">
				<DrakkarLogo size="md" />
			</UiSidebar.Header>

			<UiSidebar.Body>
				<SidebarNav />
			</UiSidebar.Body>

			<UiSidebar.Footer>
				<SidebarUserMenu />
			</UiSidebar.Footer>
		</UiSidebar>
	);
}
