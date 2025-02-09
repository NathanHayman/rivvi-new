import { Badge } from "@workspace/ui/components/badge";
import { buttonVariants } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";

const RecentRunsList = ({
  runs,
  className,
}: {
  runs: {
    id: string;
    campaignId: string;
    name: string;
    status: string;
    createdAt: Date;
    metadata: {
      totalCalls: number;
      totalPatients: number;
    };
  }[];
  className?: string;
}) => {
  if (runs.length === 0) {
    return <div>No runs found</div>;
  }

  const sortedRuns = runs
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 2);

  return (
    <div className={cn("space-y-4 flex flex-col", className)}>
      <h3 className="text-xl tracking-tight font-semibold">Recent Runs</h3>
      <div className="flex flex-col gap-4">
        {sortedRuns.map((run) => (
          <Link
            prefetch={false}
            href={`/campaigns/${run.campaignId}/runs/${run.id}`}
            key={run.id}
          >
            <Card className="rounded-xl bg-card dark:bg-zinc-900/60 border shadow-none relative">
              <Badge
                variant={
                  run.status === "completed"
                    ? "neutral_solid"
                    : run.status === "running"
                      ? "success_solid"
                      : run.status === "failed"
                        ? "failure_solid"
                        : "neutral_outline"
                }
                className="absolute top-2 right-2"
              >
                {run.status}
              </Badge>
              <CardHeader>
                <CardTitle>{run.name}</CardTitle>
                <CardDescription>
                  Created at {run.createdAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Progress Bar */}
                <Progress
                  value={
                    (run.metadata.totalCalls / run.metadata.totalPatients) * 100
                  }
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground">
                  {run.metadata.totalCalls} calls / {run.metadata.totalPatients}{" "}
                  patients
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {runs.length > 2 && (
          <Link
            prefetch={false}
            href={`/campaigns/${runs[0]?.campaignId}/runs`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            View all runs
          </Link>
        )}
      </div>
    </div>
  );
};

export default RecentRunsList;
