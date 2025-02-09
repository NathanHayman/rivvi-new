import { cn } from "@workspace/ui/lib/utils";

const Header = ({
  title,
  subtitle,
  buttons,
  className,
}: {
  title: string;
  subtitle?: string;
  buttons?: React.ReactNode | React.ReactNode[] | React.ReactNode[][];
  className?: string;
}) => {
  return (
    <>
      <div
        className={cn(
          "lg:flex lg:items-center lg:justify-between py-4 relative",
          className
        )}
      >
        <div className="min-w-0 flex-1">
          {title && (
            <h1 className="text-2xl tracking-tight leading-7 sm:truncate font-bold">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm sm:text-base mt-2 text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className="mt-5 flex lg:ml-4 lg:mt-0 gap-2">
          {buttons && buttons}
        </div>
      </div>
    </>
  );
};

export default Header;
