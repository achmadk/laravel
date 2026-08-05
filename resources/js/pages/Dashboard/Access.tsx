import { Head, Link } from "@inertiajs/react";
import {
  IconShoppingCart,
  IconUsers,
  IconFileInvoice,
  IconCurrencyDollar,
  IconBuildingWarehouse,
  IconChartArrowsVertical,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { hasAnyPermission } from "@/components/permission";
import transactions from "@/routes/transactions";
import customers from "@/routes/customers";
import receivables from "@/routes/receivables";
import payables from "@/routes/payables";
import suppliers from "@/routes/suppliers";
import reports from "@/routes/reports";

const cards = [
  {
    title: "Transaksi",
    desc: "Mulai transaksi kasir",
    icon: <IconShoppingCart size={22} />,
    href: transactions.index.url(),
    perms: ["transactions-access"],
  },
  {
    title: "Pelanggan",
    desc: "Kelola data pelanggan",
    icon: <IconUsers size={22} />,
    href: customers.index.url(),
    perms: ["customers-access"],
  },
  {
    title: "Piutang",
    desc: "Nota barang pelanggan",
    icon: <IconFileInvoice size={22} />,
    href: receivables.index.url(),
    perms: ["receivables-access"],
  },
  {
    title: "Hutang",
    desc: "Catat hutang supplier",
    icon: <IconCurrencyDollar size={22} />,
    href: payables.index.url(),
    perms: ["payables-access"],
  },
  {
    title: "Supplier",
    desc: "Kelola data supplier",
    icon: <IconBuildingWarehouse size={22} />,
    href: suppliers.index.url(),
    perms: ["suppliers-access"],
  },
  {
    title: "Laporan",
    desc: "Lihat laporan penjualan",
    icon: <IconChartArrowsVertical size={22} />,
    href: reports.sales.index.url(),
    perms: ["reports-access"],
  },
];

function AccessPage() {
  const visibleCards = cards.filter((card) => hasAnyPermission(card.perms));

  return (
    <>
      <Head title="Akses" />
      <div className="space-y-6">
        <div>
          <h1 className="font-bold text-2xl text-fg">Pilih Akses</h1>
          <p className="text-muted-fg text-sm">
            Halaman ini muncul ketika Anda tidak memiliki akses dashboard.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCards.length ? (
            visibleCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group flex items-start gap-3 rounded-2xl border border-border bg-bg p-4 shadow-sm transition-colors hover:border-primary"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {card.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-fg">{card.title}</h3>
                  <p className="text-muted-fg text-sm">{card.desc}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-muted-fg">
              Tidak ada akses tersedia. Hubungi admin.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

AccessPage.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default AccessPage;
