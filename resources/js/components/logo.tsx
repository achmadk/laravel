import { Avatar } from "@/components/ui/avatar";
import { twMerge } from "tailwind-merge";

export function Logo({ className = "", ...props }: React.ComponentProps<typeof Avatar>) {
  return (
    <Avatar
      size="sm"
      src="https://design.intentui.com/logo"
      className={twMerge("outline-hidden", className)}
      isSquare
      alt="Intent UI"
      {...props}
    />
  );
}
