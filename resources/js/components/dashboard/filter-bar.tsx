import { twMerge } from "tailwind-merge";

interface FilterBarProps {
  onSubmit?: (e: React.FormEvent) => void;
  children?: React.ReactNode;
  className?: string;
}

export function FilterBar({ onSubmit, children, className }: FilterBarProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={twMerge(
        "mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3",
        className,
      )}
    >
      {children}
    </form>
  );
}
