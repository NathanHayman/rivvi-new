import Breadcrumbs from "@/components/layout/breadcrumbs";
import Header from "@/components/layout/header";
import { Body, Content, Shell } from "@/components/layout/shell";
import PatientsTable from "@/components/tables/patients-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Patients - Rivvi",
  description:
    "Patients for Rivvi's human-like conversational AI for healthcare.",
};

export default function PatientsPage() {
  return (
    <Shell>
      <Breadcrumbs breadcrumbs={[{ title: "Patients", href: "/patients" }]} />
      <Body>
        <Header title="Patients" />
        <Content className="h-full">
          <PatientsTable />
        </Content>
      </Body>
    </Shell>
  );
}
