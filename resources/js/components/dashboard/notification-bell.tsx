import { router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import {
  IconBell,
  IconCircleCheck,
  IconCurrencyDollar,
  IconPackage,
  IconReceipt,
} from "@tabler/icons-react";
import { Link } from "@/components/ui/link";
import notifications from "@/routes/notifications";
import type {
  BellNotification,
  LowStockNotificationItem,
  NotificationsProps,
  PayableNotificationItem,
  ReceivableNotificationItem,
} from "@/types/notifications";

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

function buildItem(type: BellNotification["type"]) {
  if (type === "receivable") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
        <IconReceipt size={18} />
      </span>
    );
  }
  if (type === "payable") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
        <IconCurrencyDollar size={18} />
      </span>
    );
  }
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
      <IconPackage size={18} />
    </span>
  );
}

function mergeData(
  notifications: NotificationsProps["notifications"]
): BellNotification[] {
  const { low_stock = [], receivables = [], payables = [] } = notifications ?? {};

  const stockItems: BellNotification[] = low_stock.map((item: LowStockNotificationItem) => ({
    ...item,
    id: `stock-${item.id}`,
    originalId: item.id,
    title: `Stok habis: ${item.title}`,
    subtitle: `Stok: ${item.stock}`,
    type: "stock",
  }));

  const receivableItems: BellNotification[] = receivables.map(
    (item: ReceivableNotificationItem) => ({
      ...item,
      id: `receivable-${item.id}`,
      subtitle: `Sisa ${formatNumber(item.remaining)}`,
      type: "receivable",
    })
  );

  const payableItems: BellNotification[] = payables.map(
    (item: PayableNotificationItem) => ({
      ...item,
      id: `payable-${item.id}`,
      subtitle: `Sisa ${formatNumber(item.remaining)}`,
      type: "payable",
    })
  );

  return [...stockItems, ...receivableItems, ...payableItems];
}

export function NotificationBell() {
  const { notifications: pageNotifications } = usePage<NotificationsProps>().props;
  const [data, setData] = useState<BellNotification[]>(() => mergeData(pageNotifications));
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync when the shared props change (e.g. restocked items disappear after a reload)
  useEffect(() => {
    setData(mergeData(pageNotifications));
  }, [pageNotifications]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const badgeCount = data.length;

  const handleMarkRead = (item: BellNotification) => {
    setData((prev) => prev.filter((entry) => entry.id !== item.id));
    if (item.type === "stock") {
      router.post(
        notifications.stock.read.url(),
        { product_id: item.originalId },
        { preserveScroll: true, preserveState: true }
      );
    }
  };

  const handleMarkAllRead = () => {
    setData([]);
    router.post(notifications.stock.readAll.url(), {}, { preserveScroll: true, preserveState: true });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative flex rounded-xl p-2.5 text-muted-fg transition-colors hover:bg-muted hover:text-fg"
      >
        <IconBell className="size-5" />
        {badgeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-danger font-bold text-[10px] text-white">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[100] mt-2 w-[400px] max-w-[90vw] origin-top-right rounded-xl border border-border bg-bg shadow-lg shadow-fg/10">
          <div className="flex items-center justify-between border-border border-b px-4 py-3">
            <div className="font-semibold text-sm text-fg">Notifikasi</div>
            {badgeCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="rounded-lg bg-muted px-2.5 py-1 font-medium text-muted-fg text-xs hover:bg-muted/80"
              >
                Tandai dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {badgeCount === 0 && (
              <div className="px-3 py-8 text-center text-sm text-muted-fg">
                Tidak ada notifikasi
              </div>
            )}
            {data.map((item) => (
              <div
                key={item.id}
                className="flex w-full items-center justify-between gap-3 px-2 py-2.5 rounded-lg transition-colors hover:bg-muted/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {buildItem(item.type)}
                  <div className="min-w-0">
                    <div className="truncate font-medium text-sm text-fg">{item.title}</div>
                    <div className="truncate text-xs text-muted-fg">
                      {item.subtitle}
                      {item.time ? ` • ${item.time}` : ""}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleMarkRead(item)}
                  aria-label={`Tandai dibaca ${item.title}`}
                  className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-fg transition-colors hover:bg-muted hover:text-fg"
                >
                  <IconCircleCheck size={15} />
                  Dibaca
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-1.5">
            <Link
              href={notifications.index.url()}
              className="flex justify-center rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted/50"
            >
              Lihat semua
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}