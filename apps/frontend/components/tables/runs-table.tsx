import { Badge } from "@workspace/ui/components/badge";
import { buttonVariants } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";

const RunsTable = ({
  runs,
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
}) => {
  if (runs.length === 0) {
    return <div>No runs found</div>;
  }

  return (
    <Table className="w-full mx-auto">
      <TableHeader className="">
        <TableRow className="px-4">
          <TableHead className="px-4">Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total Patients</TableHead>
          <TableHead>Total Calls</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="w-full">
        {runs.map((run) => {
          return (
            <TableRow key={run.id} className="[&>td]:py-4">
              <TableCell>{run.name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    run.status === "running"
                      ? "success_solid_outline"
                      : "neutral_solid"
                  }
                >
                  {run.status}
                </Badge>
              </TableCell>
              <TableCell>{run.metadata.totalPatients}</TableCell>
              <TableCell>{run.metadata.totalCalls}</TableCell>
              <TableCell>
                <Link
                  prefetch={false}
                  href={`/campaigns/${run.campaignId}/runs/${run.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" })
                  )}
                >
                  View Run
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default RunsTable;
