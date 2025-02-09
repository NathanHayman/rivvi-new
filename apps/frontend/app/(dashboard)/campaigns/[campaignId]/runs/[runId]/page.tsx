import Breadcrumbs from "@/components/layout/breadcrumbs";
import Header from "@/components/layout/header";
import { Body, Content, Shell } from "@/components/layout/shell";
import RunProgress from "@/components/run-progress";
import PauseResumeRun from "@/components/utility/pause-resume-run";
import { api } from "@/lib/api";
import { Campaign, Run } from "@/types/campaign";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ campaignId: string; runId: string }>;
};

async function getCampaignAndRun(
  campaignId: string,
  runId: string
): Promise<{ campaign: Campaign; run: Run }> {
  try {
    const campaign = await api.campaigns.get(campaignId);
    const run = campaign.runs.find((r) => r.id === runId);
    if (!run) throw new Error("Run not found");
    return { campaign, run };
  } catch (error) {
    console.warn("Failed to fetch campaign/run, using demo data:", error);
    return {
      campaign: {
        id: campaignId,
        name: "Demo Campaign",
        description: "A demo campaign for testing",
        type: "Appointment Confirmation",
        agentId: "demo-agent",
        organizationId: "demo-org",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        runs: [],
      },
      run: {
        id: runId,
        campaignId: campaignId,
        status: "in_progress",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalCalls: 100,
        completedCalls: 45,
        failedCalls: 5,
      },
    };
  }
}

export default async function RunPage({ params }: PageProps) {
  const { campaignId, runId } = await params;
  const { campaign, run } = await getCampaignAndRun(campaignId, runId);

  if (!campaign || !run) {
    return notFound();
  }

  const runName = `Run ${new Date(run.createdAt).toLocaleDateString()}`;

  return (
    <Shell>
      <Breadcrumbs
        breadcrumbs={[
          { title: "Campaigns", href: "/campaigns" },
          { title: campaign.name, href: `/campaigns/${campaignId}` },
          { title: "Runs", href: `/campaigns/${campaignId}/runs` },
          {
            title: runName,
            href: `/campaigns/${campaignId}/runs/${runId}`,
          },
        ]}
      />
      <Body maxWidth="max-w-screen-xl">
        <Header
          title={runName}
          subtitle={`Run details for ${campaign.name}`}
          buttons={
            <>
              <Link
                prefetch={false}
                href={`/campaigns/${campaignId}/runs/${runId}/report`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                View Report
              </Link>
              <PauseResumeRun />
            </>
          }
        />
        <Content className="mt-8">
          <div className="grid gap-8">
            {/* Run Progress Card */}
            <RunProgress />

            {/* Additional sections like call logs, etc. can be added here */}
          </div>
        </Content>
      </Body>
    </Shell>
  );
}
