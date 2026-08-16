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
    <ul className={twMerge("mt-2 flex items-center justify-end gap-1 lg:mt-5", className)}>
      {links.map((link, i) => {
        const isEdge = i === 0 || i === links.length - 1;

        if (link.url === null) {
          return (
            <li
              key={i}
              className="flex items-center justify-center rounded-md border border-border bg-bg px-2 py-1 text-muted-fg text-sm opacity-50"
            >
              {isEdge ? (
                i === 0 ? (
                  <IconChevronLeft size={20} strokeWidth={1.5} />
                ) : (
                  <IconChevronRight size={20} strokeWidth={1.5} />
                )
              ) : (
                <span dangerouslySetInnerHTML={{ __html: link.label }} />
              )}
            </li>
          );
        }

        return (
          <li key={i} {...(isEdge ? { className: "flex items-center justify-center" } : {})}>
            {isEdge ? (
              <Link
                href={link.url}
                className="rounded-md border px-2 py-1 text-muted-fg text-sm hover:bg-muted"
              >
                {i === 0 ? (
                  <IconChevronLeft size={20} strokeWidth={1.5} />
                ) : (
                  <IconChevronRight size={20} strokeWidth={1.5} />
                )}
              </Link>
            ) : (
              <Link
                href={link.url}
                className={twMerge(
                  "rounded-md border px-2 py-1 text-sm",
                  link.active
                    ? "border-border bg-bg font-semibold text-fg"
                    : "border-border bg-bg text-muted-fg hover:bg-muted",
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
