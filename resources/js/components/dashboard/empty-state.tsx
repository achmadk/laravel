import { IconDatabaseOff } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={twMerge(
        "flex flex-col items-center justify-center rounded-2xl border border-border bg-bg py-16",
        className,
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon ?? <IconDatabaseOff size={32} className="text-muted-fg" strokeWidth={1.5} />}
      </div>
      <h3 className="mb-1 font-medium text-fg text-lg">{title}</h3>
      {description && <p className="mb-4 text-muted-fg text-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
