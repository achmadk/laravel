import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";

const badgeStyles = tv({
  base: "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs",
  variants: {
    variant: {
      success: "bg-success text-success-fg",
      warning: "bg-warning text-warning-fg",
      danger: "bg-danger text-danger-fg",
      info: "bg-info text-info-fg",
      pending: "bg-pending text-pending-fg",
      neutral: "bg-muted text-muted-fg",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

interface StatusBadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "pending" | "neutral";
  label: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  return <span className={twMerge(badgeStyles({ variant }), className)}>{label}</span>;
}
