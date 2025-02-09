import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

const SummaryCard = ({ title, value }: { title: string; value: string }) => {
  return (
    <Card className="rounded-xl bg-card dark:bg-zinc-900/60 border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{value}</p>
      </CardContent>
    </Card>
  );
};

const SummaryCards = ({
  cards,
}: {
  cards: { title: string; value: string }[];
}) => {
  return (
    <div
      className={cn(
        "grid auto-rows-min gap-4 md:grid-cols-4 h-full",
        cards.length === 1 && "md:grid-cols-1",
        cards.length === 2 && "md:grid-cols-2",
        cards.length === 3 && "md:grid-cols-3",
        cards.length === 4 && "md:grid-cols-4"
      )}
    >
      {cards.map((card, index) => (
        <SummaryCard key={index} title={card.title} value={card.value} />
      ))}
    </div>
  );
};

export { SummaryCard, SummaryCards };
