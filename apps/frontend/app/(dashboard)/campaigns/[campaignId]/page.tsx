import CampaignOverview from "@/components/campaign-overview";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import Header from "@/components/layout/header";
import { Body, Content, Shell } from "@/components/layout/shell";
import { CreateRunModalButton } from "@/components/modals/create-run-modal-button";
import RecentRunsList from "@/components/recent-runs-list";
import { SummaryCards } from "@/components/summary-cards";
import { api } from "@/lib/api";
import { Campaign } from "@/types/campaign";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Campaign Details - Rivvi",
  description:
    "Campaign details for Rivvi's human-like conversational AI for healthcare.",
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

export default async function CampaignPage({ params }: PageProps) {
  const { campaignId } = await params;
  const campaign = await getCampaign(campaignId);

  if (!campaign) {
    return notFound();
  }

  // Calculate campaign statistics
  const totalCalls = campaign.runs.reduce(
    (acc, run) => acc + run.totalCalls,
    0
  );
  const totalConfirmed = campaign.runs.reduce(
    (acc, run) => acc + run.completedCalls,
    0
  );
  const successRate =
    totalCalls > 0 ? Math.round((totalConfirmed / totalCalls) * 100) : 0;

  return (
    <Shell>
      <Breadcrumbs
        breadcrumbs={[
          { title: "Campaigns", href: "/campaigns" },
          { title: campaign.name, href: `/campaigns/${campaignId}` },
        ]}
      />
      <Body maxWidth="max-w-screen-xl">
        <Header
          title={campaign.name}
          subtitle={campaign.description}
          buttons={
            <>
              <Link
                prefetch={false}
                href={`/campaigns/${campaignId}/runs`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                View Runs
              </Link>
              <CreateRunModalButton campaignId={campaignId} />
            </>
          }
        />
        <Content className="space-y-10">
          {/* Campaign Statistics */}
          <SummaryCards
            cards={[
              {
                title: "Total Confirmed",
                value: totalConfirmed.toString(),
              },
              { title: "Total Calls", value: totalCalls.toString() },
              { title: "Success Rate", value: `${successRate}%` },
              {
                title: "Total Runs",
                value: campaign.runs.length.toString(),
              },
            ]}
          />
          <div className="grid lg:grid-cols-5 gap-4 lg:gap-8">
            {/* Recent Runs */}
            <RecentRunsList
              runs={campaign.runs.map((run) => ({
                ...run,
                campaignId: campaign.id,
                name: campaign.name,
                createdAt: new Date(run.createdAt),
                metadata: {
                  totalCalls: run.totalCalls,
                  totalPatients: run.totalCalls,
                },
              }))}
              className="col-span-3 order-2"
            />
            {/* Campaign Description */}
            <CampaignOverview
              campaign={campaign}
              className="col-span-2 sm:mt-11"
            >
              <p className="text-sm text-muted-foreground">
                {campaign.description}
              </p>
            </CampaignOverview>
          </div>
        </Content>
      </Body>
    </Shell>
  );
}
