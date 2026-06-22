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
        "flex flex-col items-center justify-center py-16 bg-bg rounded-2xl border border-border",
        className,
      )}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon ?? <IconDatabaseOff size={32} className="text-muted-fg" strokeWidth={1.5} />}
      </div>
      <h3 className="text-lg font-medium text-fg mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-fg mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
