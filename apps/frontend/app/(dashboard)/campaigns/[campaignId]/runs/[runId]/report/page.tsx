import Breadcrumbs from "@/components/layout/breadcrumbs";
import Header from "@/components/layout/header";
import { Body, Content, Shell } from "@/components/layout/shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { notFound } from "next/navigation";

const demo_campaigns = [
  {
    id: "1",
    name: "Demo Campaign",
    runs: [
      {
        id: "1",
        name: "Demo Run",
        status: "completed",
        startedAt: new Date(),
        interval: { calls: 1, minutes: 1 },
        metadata: {
          totalCalls: 100,
          confirmedCount: 100,
          totalPatients: 100,
          declinedCount: 0,
          unreachableCount: 0,
        },
      },
    ],
  },
];

type PageProps = {
  params: Promise<{ campaignId: string; runId: string }>;
};

export default async function RunPageReport({ params }: PageProps) {
  const { campaignId, runId } = await params;

  const campaign = demo_campaigns.find((c) => c.id === campaignId);
  if (!campaign) return notFound();

  const run = campaign.runs.find((r) => r.id === runId);
  if (!run) return notFound();

  // Calculate call efficiency
  const avgCallsPerParticipant = (
    run.metadata.totalCalls / run.metadata.totalPatients
  ).toFixed(1);

  return (
    <Shell>
      <Breadcrumbs
        breadcrumbs={[
          { title: "Campaigns", href: "/campaigns" },
          { title: campaign.name, href: `/campaigns/${campaignId}` },
          { title: "Runs", href: `/campaigns/${campaignId}/runs` },
          { title: run.name, href: `/campaigns/${campaignId}/runs/${runId}` },
          {
            title: "Report",
            href: `/campaigns/${campaignId}/runs/${runId}/report`,
          },
        ]}
      />
      <Body>
        <Header className="" title={`${run.name} Report`} />
        <Content>
          <div className="space-y-8">
            {/* Run Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="rounded-xl dark:bg-zinc-900/60 border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Participants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {run.metadata.totalPatients}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(
                      (run.metadata.confirmedCount /
                        run.metadata.totalPatients) *
                        100
                    )}
                    % confirmed
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-xl dark:bg-zinc-900/60 border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {run.metadata.totalCalls}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(
                      run.metadata.totalCalls / run.metadata.totalPatients
                    ).toFixed(1)}{" "}
                    avg per participant
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-xl dark:bg-zinc-900/60 border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100%</div>
                  <p className="text-xs text-muted-foreground">
                    {run.metadata.confirmedCount} successful calls
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-xl dark:bg-zinc-900/60 border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Call Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{run.interval.calls}</div>
                  <p className="text-xs text-muted-foreground">
                    calls every {run.interval.minutes} min
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Run Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-xl dark:bg-zinc-900/60 border shadow-sm">
                <CardHeader>
                  <CardTitle>Run Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={cn(
                        "capitalize font-medium",
                        run.status === "running" && "text-green-600",
                        run.status === "paused" && "text-yellow-600",
                        run.status === "completed" && "text-blue-600",
                        run.status === "failed" && "text-red-600"
                      )}
                    >
                      {run.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started:</span>
                    <span>
                      {run.startedAt?.toLocaleString() || "Not started"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>0 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Call Rate:</span>
                    <span>
                      {run.interval.calls} calls / {run.interval.minutes} min
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl dark:bg-zinc-900/60 border shadow-sm">
                <CardHeader>
                  <CardTitle>Call Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Calls Made:
                    </span>
                    <span>{run.metadata.totalCalls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Successful Calls:
                    </span>
                    <span>{run.metadata.confirmedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Failed Calls:</span>
                    <span>
                      {run.metadata.declinedCount +
                        run.metadata.unreachableCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Average Attempts:
                    </span>
                    <span>{avgCallsPerParticipant} per participant</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Content>
      </Body>
    </Shell>
  );
}
