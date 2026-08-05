import { twMerge } from "tailwind-merge";

interface SummaryCardItem {
  label: string;
  value: string | number;
  helper?: string;
  icon?: React.ReactNode;
}

interface SummaryCardsProps {
  items: SummaryCardItem[];
  className?: string;
}

export function SummaryCards({ items, className }: SummaryCardsProps) {
  return (
    <div className={twMerge("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-1 rounded-lg border border-border bg-bg p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-fg text-sm">{item.label}</span>
            {item.icon && <span className="text-muted-fg">{item.icon}</span>}
          </div>
          <span className="font-semibold text-2xl text-fg">{item.value}</span>
          {item.helper && <span className="text-muted-fg text-xs">{item.helper}</span>}
        </div>
      ))}
    </div>
  );
}
