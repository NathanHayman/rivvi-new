import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

const CampaignOverview = ({
  campaign,
  children,
  className,
}: {
  campaign: {
    id: string;
    name: string;
    description: string;
    type: string;
    runs: { id: string; status: string }[];
  };
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Card
      className={cn(
        "shadow-sm rounded-xl bg-card dark:bg-zinc-900/60 border h-fit lg:sticky top-20",
        className
      )}
    >
      <CardHeader>
        <CardTitle>Campaign Overview</CardTitle>
        <CardDescription>{campaign.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
};

export default CampaignOverview;
