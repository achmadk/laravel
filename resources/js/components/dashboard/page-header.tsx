import { Heading } from "@/components/ui/heading";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <div
      className={twMerge(
        "mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="hidden size-10 items-center justify-center rounded-xl bg-primary-subtle text-primary sm:flex">
            {icon}
          </div>
        )}
        <div>
          <Heading level={1}>{title}</Heading>
          {description && <p className="mt-0.5 text-muted-fg text-sm">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
