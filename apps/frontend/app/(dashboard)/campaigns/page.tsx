import Breadcrumbs from "@/components/layout/breadcrumbs";
import Header from "@/components/layout/header";
import { Body, Content, Shell } from "@/components/layout/shell";
import { CreateCampaignButton } from "@/components/modals/create-campaign-button";
import CampaignsTable from "@/components/tables/campaigns-table";
import { api } from "@/lib/api";
import { Campaign } from "@/types/campaign";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Campaigns - Rivvi",
  description:
    "Campaigns for Rivvi's human-like conversational AI for healthcare.",
};

async function getCampaigns(orgId: string): Promise<Campaign[]> {
  try {
    return await api.campaigns.list();
  } catch (error) {
    console.warn("Failed to fetch campaigns, using demo data:", error);
    return [
      {
        id: "1",
        organizationId: orgId,
        name: "Demo Campaign",
        description: "A demo campaign for testing",
        type: "Appointment Confirmation",
        agentId: "demo-agent",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        runs: [
          {
            id: "1",
            campaignId: "1",
            status: "in_progress",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            totalCalls: 100,
            completedCalls: 45,
            failedCalls: 5,
          },
        ],
      },
    ];
  }
}

export default async function CampaignsPage() {
  const { orgId } = await auth();

  if (!orgId) {
    return redirect("/");
  }

  const campaigns = await getCampaigns(orgId);

  return (
    <Shell>
      <Breadcrumbs breadcrumbs={[{ title: "Campaigns", href: "/campaigns" }]} />
      <Body maxWidth="max-w-screen-xl">
        <Header
          title="Campaigns"
          subtitle="Create and manage your outbound call campaigns."
          buttons={<CreateCampaignButton />}
        />
        <Content className="mt-8">
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No campaigns
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new campaign.
              </p>
              <div className="mt-6">
                <CreateCampaignButton />
              </div>
            </div>
          ) : (
            <CampaignsTable campaigns={campaigns} />
          )}
        </Content>
      </Body>
    </Shell>
  );
}
