import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Link } from "next-view-transitions";
import React from "react";

const Breadcrumbs: React.FC<{
  breadcrumbs: {
    title: string;
    href: string;
  }[];
  children?: React.ReactNode;
}> = ({ breadcrumbs, children }) => {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 justify-between">
      <div className="flex items-center gap-2 px-4 sm:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, idx) => (
              <React.Fragment key={breadcrumb.href}>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={breadcrumb.href}
                    asChild
                    className="text-zinc-500 dark:text-zinc-400"
                  >
                    <Link prefetch={false} href={breadcrumb.href}>
                      {breadcrumb.title}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {idx < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 px-4 sm:px-6">{children}</div>
    </header>
  );
};

export default Breadcrumbs;
