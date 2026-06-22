import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Link } from "@inertiajs/react";
import { twMerge } from "tailwind-merge";

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationProps {
  links: PaginationLink[];
  className?: string;
}

export function Pagination({ links, className }: PaginationProps) {
  if (!links || links.length <= 1) {
    return null;
  }

  return (
    <ul className={twMerge("mt-2 lg:mt-5 flex items-center justify-end gap-1", className)}>
      {links.map((link, i) => {
        if (link.url == null) {
          return (
            <li
              key={i}
              className="px-2 py-1 text-sm text-muted-fg opacity-50"
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          );
        }

        const isPrevious = link.label.includes("Previous");
        const isNext = link.label.includes("Next");

        return (
          <li key={i}>
            {isPrevious || isNext ? (
              <Link
                href={link.url}
                className="p-1 text-sm border rounded-md bg-bg text-muted-fg hover:bg-muted border-border"
              >
                {isPrevious ? (
                  <IconChevronLeft size={20} strokeWidth={1.5} />
                ) : (
                  <IconChevronRight size={20} strokeWidth={1.5} />
                )}
              </Link>
            ) : (
              <Link
                href={link.url}
                className={twMerge(
                  "px-2 py-1 text-sm border rounded-md",
                  link.active
                    ? "bg-bg text-fg font-semibold border-border"
                    : "bg-bg text-muted-fg hover:bg-muted border-border",
                )}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
