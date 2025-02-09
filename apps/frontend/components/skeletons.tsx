import { Skeleton } from "@workspace/ui/components/skeleton";

const RunSkeleton = () => {
  return (
    <Skeleton className="w-full bg-zinc-200/40 dark:bg-zinc-800 rounded-xl flex items-center justify-between p-5 gap-3">
      <Skeleton className="h-6 w-40 bg-zinc-300/50 dark:bg-zinc-700 rounded-md" />
      <Skeleton className="h-6 w-32 bg-zinc-300/50 dark:bg-zinc-700 rounded-md" />
      <Skeleton className="h-6 w-32 bg-zinc-300/50 dark:bg-zinc-700 rounded-md" />
      <Skeleton className="h-6 w-24 bg-zinc-300/50 dark:bg-zinc-700 rounded-md" />
    </Skeleton>
  );
};

export { RunSkeleton };
