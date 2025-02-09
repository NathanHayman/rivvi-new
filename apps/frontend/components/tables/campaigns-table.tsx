import { Badge } from "@workspace/ui/components/badge";

import { Button, buttonVariants } from "@workspace/ui/components/button";
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

const CampaignsTable: React.FC<{
  campaigns: {
    id: string;
    name: string;
    type: string;
    runs: { id: string; status: string }[];
  }[];
}> = ({ campaigns }) => {
  if (campaigns.length === 0) {
    return <div>No campaigns found</div>;
  }

  return (
    <Table className="w-full">
      <TableHeader className="px-4">
        <TableRow className="px-4">
          <TableHead className="px-4">Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Most Recent Run</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="">
        {campaigns.map((campaign) => {
          const mostRecentRun = campaign.runs[0];
          return (
            <TableRow key={campaign.id} className="[&>td]:py-4">
              <TableCell>{campaign.name}</TableCell>
              <TableCell>
                <Badge variant="neutral_outline">{campaign.type}</Badge>
              </TableCell>
              <TableCell>
                {mostRecentRun ? (
                  <Badge
                    variant={
                      mostRecentRun?.status === "running"
                        ? "success_solid_outline"
                        : "neutral_solid"
                    }
                  >
                    {mostRecentRun?.status === "running"
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                ) : (
                  <Badge variant="neutral_outline">No runs yet</Badge>
                )}
              </TableCell>
              <TableCell>
                {mostRecentRun ? (
                  <Link
                    prefetch={false}
                    href={`/campaigns/${campaign.id}/runs/${mostRecentRun.id}`}
                    className={cn(
                      buttonVariants({ variant: "link", size: "sm" })
                    )}
                  >
                    {mostRecentRun.status === "running"
                      ? "View Active Run"
                      : "View Most Recent Run"}
                  </Link>
                ) : (
                  <Button variant="link" size="sm" disabled>
                    You haven&apos;t run this campaign yet
                  </Button>
                )}
              </TableCell>
              <TableCell className="max-w-36">
                <Link
                  prefetch={false}
                  href={`/campaigns/${campaign.id}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" })
                  )}
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default CampaignsTable;
