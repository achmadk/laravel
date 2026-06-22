import { Heading } from "@/components/ui/heading";
import { ReactNode } from "react";
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
        "mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="hidden sm:flex items-center justify-center size-10 rounded-xl bg-primary-subtle text-primary">
            {icon}
          </div>
        )}
        <div>
          <Heading level={1}>{title}</Heading>
          {description && <p className="text-sm text-muted-fg mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
