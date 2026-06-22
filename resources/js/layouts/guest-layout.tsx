import { Flash } from "@/components/flash";
import { Link } from "@/components/ui/link";
import type { PropsWithChildren, ReactNode } from "react";

interface GuestLayoutProps {
  header?: string | null;
  description?: string | ReactNode | null;
  hero?: ReactNode | null;
}

export default function GuestLayout({
  description = null,
  header = null,
  hero = null,
  children,
}: PropsWithChildren<GuestLayoutProps>) {
  return (
    <div className="flex min-h-screen bg-[oklch(0.981_0.003_285)] dark:bg-[var(--bg)]">
      <Flash />

      {/* Left — Form Panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Brand */}
          <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-[oklch(0.48_0.24_264)] text-xs font-bold text-white">
              R
            </div>
            <span className="text-[0.9375rem] font-semibold tracking-tight text-[var(--fg)]">
              Nightday RTOS
            </span>
          </Link>

          {/* Title */}
          {header && (
            <h1 className="animate-fade-up stagger-1 text-[1.375rem] font-semibold tracking-tight text-[var(--fg)]">
              {header}
            </h1>
          )}

          {/* Description */}
          {description && (
            <p className="animate-fade-up stagger-2 mt-1 text-sm text-[var(--muted-fg)]">
              {description}
            </p>
          )}

          {/* Card */}
          <div
            className={
              header || description
                ? "mt-7 rounded-[20px] border border-[var(--border)] bg-white p-9 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:bg-[var(--overlay)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
                : "rounded-[20px] border border-[var(--border)] bg-white p-9 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:bg-[var(--overlay)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
            }
          >
            {children}
          </div>
        </div>
      </div>

      {/* Right — Hero Panel */}
      {hero && (
        <div className="hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-950 p-12 lg:flex">
          {/* Grid pattern */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              WebkitMaskImage: "radial-gradient(ellipse at 60% 40%, black 30%, transparent 70%)",
              maskImage: "radial-gradient(ellipse at 60% 40%, black 30%, transparent 70%)",
            }}
          />
          {/* Glow orbs */}
          <div className="absolute right-10 top-10 size-[480px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.15),transparent_70%)] blur-[60px]" />
          <div className="absolute bottom-20 left-20 size-[360px] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.1),transparent_70%)] blur-[80px]" />
          {/* Content */}
          <div className="relative z-10 max-w-md">{hero}</div>
        </div>
      )}
    </div>
  );
}
