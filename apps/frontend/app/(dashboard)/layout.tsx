import { AppSidebar } from "@/components/layout/sidebar";

import { OrganizationSwitcher } from "@clerk/nextjs";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar>
        <Suspense fallback={<div className="text-sm">Loading...</div>}>
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox:
                  "relative flex flex-col items-center justify-center w-full",
                avatarBox: "w-8 h-8",
                organizationSwitcherTriggerIcon:
                  "group-data-[collapsible=icon]:flex",
                organizationSwitcherTrigger:
                  "group-data-[collapsible=icon]:w-12 h-12 overflow-hidden py-4 w-[13.5rem] text-left text-sm text-accent-foreground dark:text-white dark:hover:bg-accent-foreground/5 dark:focus:bg-accent-foreground/5",
              },
            }}
            hidePersonal
          />
        </Suspense>
      </AppSidebar>
      <SidebarInset>
        <main style={{ viewTransitionName: "page" }}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
