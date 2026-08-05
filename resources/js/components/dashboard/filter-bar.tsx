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
        "mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center",
        className,
      )}
    >
      {children}
    </form>
  );
}
