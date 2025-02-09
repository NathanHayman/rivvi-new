"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";
import { Clock } from "lucide-react";

const run = {
  status: "running",
  startedAt: new Date(),
  endedAt: new Date(),
  metadata: {
    totalCalls: 20,
  },
};

const RunProgress: React.FC = () => {
  return (
    <Card className="rounded-xl bg-card dark:bg-zinc-900/60 border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between relative">
          <div>
            <CardTitle>Run Progress</CardTitle>
            <CardDescription>
              {run.status === "running" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Clock className="h-4 w-4" />
                  <span>Estimated time remaining: 1 hour</span>
                </div>
              )}
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "capitalize",
              run.status === "running" &&
                "bg-green-600/20 text-green-600 hover:bg-green-600/30",
              run.status === "paused" &&
                "bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30",
              run.status === "completed" &&
                "bg-blue-600/20 text-blue-600 hover:bg-blue-600/30",
              run.status === "failed" &&
                "bg-red-600/20 text-red-600 hover:bg-red-600/30"
            )}
          >
            {run.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">50%</span>
          </div>
          <Progress value={50} className="h-2" />
          <div className="flex justify-end text-sm text-muted-foreground">
            <span>10 / 20 participants</span>
          </div>
        </div>

        {/* Run Details */}
        <div className="grid gap-4 md:grid-cols-4 bg-card border dark:bg-zinc-900/60 rounded-2xl p-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Started
            </div>
            <div className="mt-1">
              {run.startedAt?.toLocaleString() || "Not started"}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Duration
            </div>
            <div className="mt-1">
              {run.startedAt && run.endedAt
                ? `${Math.round(
                    (run.endedAt.getTime() - run.startedAt.getTime()) /
                      (1000 * 60)
                  )} minutes`
                : "In progress"}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Total Calls
            </div>
            <div className="mt-1">{run.metadata.totalCalls}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RunProgress;
