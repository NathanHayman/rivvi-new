import Breadcrumbs from "@/components/layout/breadcrumbs";
import Header from "@/components/layout/header";
import { Body, Content, Shell } from "@/components/layout/shell";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview - Rivvi",
  description:
    "Overview of Rivvi's human-like conversational AI for healthcare.",
};

export default async function OverviewPage() {
  return (
    <Shell>
      <Breadcrumbs breadcrumbs={[{ title: "Overview", href: "/" }]} />
      <Body>
        <Header title="Overview" />
        <Content className="h-full">Overview page</Content>
      </Body>
    </Shell>
  );
}
