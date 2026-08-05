import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";

const badgeStyles = tv({
  base: "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs",
  variants: {
    variant: {
      success: "bg-success-subtle text-success",
      warning: "bg-warning-subtle text-warning",
      danger: "bg-danger-subtle text-danger",
      info: "bg-primary-subtle text-primary",
      neutral: "bg-muted text-muted-fg",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

interface StatusBadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  label: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  return <span className={twMerge(badgeStyles({ variant }), className)}>{label}</span>;
}
