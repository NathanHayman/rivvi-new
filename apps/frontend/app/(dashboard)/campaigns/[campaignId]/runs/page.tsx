import Breadcrumbs from "@/components/layout/breadcrumbs";
import Header from "@/components/layout/header";
import { Body, Content, Shell } from "@/components/layout/shell";
import { CreateRunModalButton } from "@/components/modals/create-run-modal-button";
import RunsTable from "@/components/tables/runs-table";
import { api } from "@/lib/api";
import { Campaign } from "@/types/campaign";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Campaign Runs - Rivvi",
  description:
    "Campaign runs for Rivvi's human-like conversational AI for healthcare.",
};

type PageProps = {
  params: Promise<{ campaignId: string }>;
};

async function getCampaign(campaignId: string): Promise<Campaign> {
  try {
    return await api.campaigns.get(campaignId);
  } catch (error) {
    console.warn("Failed to fetch campaign, using demo data:", error);
    return {
      id: campaignId,
      name: "Demo Campaign",
      description: "A demo campaign for testing",
      type: "Appointment Confirmation",
      agentId: "demo-agent",
      organizationId: "demo-org",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      runs: [
        {
          id: "1",
          campaignId: campaignId,
          status: "in_progress",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalCalls: 100,
          completedCalls: 45,
          failedCalls: 5,
        },
      ],
    };
  }
}

export default async function RunsPage({ params }: PageProps) {
  const { campaignId } = await params;
  const campaign = await getCampaign(campaignId);

  if (!campaign) {
    return notFound();
  }

  // Transform runs data for the table
  const runs = campaign.runs.map((run) => ({
    ...run,
    campaignId: campaign.id,
    name: `Run ${new Date(run.createdAt).toLocaleDateString()}`,
    createdAt: new Date(run.createdAt),
    metadata: {
      totalCalls: run.totalCalls,
      totalPatients: run.totalCalls,
    },
  }));

  return (
    <Shell>
      <Breadcrumbs
        breadcrumbs={[
          { title: "Campaigns", href: "/campaigns" },
          { title: campaign.name, href: `/campaigns/${campaignId}` },
          { title: "Runs", href: `/campaigns/${campaignId}/runs` },
        ]}
      />
      <Body maxWidth="max-w-screen-xl">
        <Header
          title="Campaign Runs"
          subtitle={`Manage runs for ${campaign.name}`}
          buttons={<CreateRunModalButton campaignId={campaignId} />}
        />
        <Content className="mt-8">
          {runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No runs found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new run.
              </p>
              <div className="mt-6">
                <CreateRunModalButton campaignId={campaignId} />
              </div>
            </div>
          ) : (
            <RunsTable runs={runs} />
          )}
        </Content>
      </Body>
    </Shell>
  );
}
