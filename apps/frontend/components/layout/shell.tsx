import { cn } from "@workspace/ui/lib/utils";

const Shell = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("grid items-start gap-8", className)} {...props}>
      {children}
    </div>
  );
};

const Body = ({
  children,
  className,
  maxWidth = "max-w-screen-xl",
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-4 p-4 sm:p-6 max-w-screen-xl w-full mx-auto",
        maxWidth,
        className
      )}
    >
      {children}
    </div>
  );
};

const Content = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex-1 w-full", className)}>{children}</div>;
};

export { Body, Content, Shell };
