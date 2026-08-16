import { router, usePage } from "@inertiajs/react";
import {
  IconBell,
  IconCircleCheck,
  IconCurrencyDollar,
  IconPackage,
  IconReceipt,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import DashboardLayout from "@/layouts/dashboard-layout";
import notifications from "@/routes/notifications";
import type { NotificationsProps } from "@/types/notifications";

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

interface SectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}

function Section({ title, description, icon, color, children }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className={`flex size-9 items-center justify-center rounded-full ${color}`}>
            {icon}
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Row({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="min-w-0">
        <div className="truncate font-medium text-sm text-fg">{title}</div>
        <div className="truncate text-xs text-muted-fg">{subtitle}</div>
      </div>
      {action}
    </div>
  );
}

export default function NotificationsIndex() {
  const { notifications: pageNotifications } = usePage<NotificationsProps>().props;
  const { low_stock = [], receivables = [], payables = [] } = pageNotifications ?? {};
  const total = low_stock.length + receivables.length + payables.length;

  const markLowStockRead = (id: number) => {
    router.post(
      notifications.stock.read.url(),
      { product_id: id },
      { preserveScroll: true, preserveState: true }
    );
  };

  const markAllLowStockRead = () => {
    router.post(
      notifications.stock.readAll.url(),
      {},
      { preserveScroll: true, preserveState: true }
    );
  };

  return (
    <>
      <PageHeader
        title="Notifikasi"
        description={`${total} notifikasi menunggu`}
        icon={<IconBell size={20} />}
      />

      <div className="space-y-6">
        <Section
          title="Stok Habis"
          description="Produk dengan stok habis"
          color="bg-rose-500/10 text-rose-600"
          icon={<IconPackage size={18} />}
        >
          {low_stock.length === 0 ? (
            <EmptyState title="Tidak ada stok habis" description="Semua produk punya stok tersedia" />
          ) : (
            <div>
              <div className="mb-2 flex justify-end">
                <Button intent="plain" size="sm" onPress={markAllLowStockRead}>
                  <IconCircleCheck className="size-4" />
                  Tandai semua dibaca
                </Button>
              </div>
              {low_stock.map((item) => (
                <Row
                  key={item.id}
                  title={item.title}
                  subtitle={`Stok: ${item.stock}${item.time ? ` • ${item.time}` : ""}`}
                  action={
                    <Button
                      intent="plain"
                      size="sm"
                      onPress={() => markLowStockRead(item.id)}
                      className="shrink-0 text-muted-fg hover:text-fg"
                    >
                      <IconCircleCheck className="size-4" />
                      Baca
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Piutang"
          description="Piutang jatuh tempo 3 hari ke depan"
          color="bg-amber-500/10 text-amber-600"
          icon={<IconReceipt size={18} />}
        >
          {receivables.length === 0 ? (
            <EmptyState title="Tidak ada piutang" description="Tidak ada piutang jatuh tempo" />
          ) : (
            receivables.map((item) => (
              <Row
                key={item.id}
                title={item.title}
                subtitle={`Sisa ${formatNumber(item.remaining)}${item.time ? ` • ${item.time}` : ""}`}
              />
            ))
          )}
        </Section>

        <Section
          title="Hutang"
          description="Hutang jatuh tempo 3 hari ke depan"
          color="bg-emerald-500/10 text-emerald-600"
          icon={<IconCurrencyDollar size={18} />}
        >
          {payables.length === 0 ? (
            <EmptyState title="Tidak ada hutang" description="Tidak ada hutang jatuh tempo" />
          ) : (
            payables.map((item) => (
              <Row
                key={item.id}
                title={item.title}
                subtitle={`Sisa ${formatNumber(item.remaining)}${item.time ? ` • ${item.time}` : ""}`}
              />
            ))
          )}
        </Section>
      </div>
    </>
  );
}

NotificationsIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;