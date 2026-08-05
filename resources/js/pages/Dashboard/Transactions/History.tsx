import { useEffect, useState } from "react";
import { Head, router, Link } from "@inertiajs/react";
import DashboardLayout from "@/layouts/dashboard-layout";
import {
  IconDatabaseOff,
  IconSearch,
  IconHistory,
  IconFilter,
  IconX,
  IconCheck,
  IconPrinter,
  IconAlertCircle,
  IconBuildingBank,
  IconReceipt,
} from "@tabler/icons-react";
import { useAuthorization } from "@/lib/auth";
import transactionRoutes from "@/routes/transactions";
import salesReturns from "@/routes/sales-returns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalClose } from "@/components/ui/modal";

const defaultFilters = {
  invoice: "",
  start_date: "",
  end_date: "",
};

const formatPrice = (value = 0) =>
  Number(value || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

interface TransactionRow {
  id: number;
  invoice: string;
  created_at: string;
  grand_total: number;
  total_items: number;
  payment_method: string;
  payment_status: string;
  cashier?: { name: string } | null;
  customer?: { name: string } | null;
  can_create_sales_return?: boolean;
}

interface HistoryProps {
  transactions: {
    data: TransactionRow[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    per_page: number;
    total: number;
  };
  filters: typeof defaultFilters;
}

export default function History(serverProps: HistoryProps) {
  const { transactions, filters } = serverProps;
  const { can } = useAuthorization();
  const canCreateSalesReturn = can("sales-returns-create");
  const canConfirmPayment = can("transactions-confirm-payment");
  const [filterData, setFilterData] = useState({
    ...defaultFilters,
    ...filters,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    transaction: TransactionRow | null;
  }>({ open: false, transaction: null });
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setFilterData({ ...defaultFilters, ...filters });
  }, [filters]);

  const handleChange = (field: string, value: string) => {
    setFilterData((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    router.get(transactionRoutes.history.url(), filterData, {
      preserveScroll: true,
      preserveState: true,
    });
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilterData(defaultFilters);
    router.get(transactionRoutes.history.url(), defaultFilters, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
    });
  };

  const rows = transactions?.data ?? [];
  const links = transactions?.links ?? [];
  const currentPage = transactions?.current_page ?? 1;
  const perPage = transactions?.per_page ? Number(transactions?.per_page) : rows.length || 1;

  const hasActiveFilters = filterData.invoice || filterData.start_date || filterData.end_date;

  return (
    <>
      <Head title="Riwayat Transaksi" />

      <div className="space-y-6">
        <PageHeader
          title="Riwayat Transaksi"
          description={`${transactions?.total || 0} transaksi tercatat`}
          icon={<IconHistory size={20} />}
          actions={
            <div className="flex gap-2">
              <Button
                intent={showFilters || hasActiveFilters ? "primary" : "outline"}
                onPress={() => setShowFilters(!showFilters)}
              >
                <IconFilter size={18} />
                Filter
                {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-bg" />}
              </Button>
              <Link href={transactionRoutes.index.url()}>
                <Button intent="primary">
                  <IconReceipt size={18} />
                  Transaksi Baru
                </Button>
              </Link>
            </div>
          }
        />

        {showFilters && (
          <Card>
            <CardContent className="animate-slide-up p-5">
              <form onSubmit={applyFilters}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-2 block font-medium text-muted-fg text-sm">
                      Nomor Invoice
                    </label>
                    <input
                      type="text"
                      placeholder="TRX-..."
                      value={filterData.invoice}
                      onChange={(e) => handleChange("invoice", e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg placeholder:text-muted-fg"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-muted-fg text-sm">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={filterData.start_date}
                      onChange={(e) => handleChange("start_date", e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-muted-fg text-sm">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={filterData.end_date}
                      onChange={(e) => handleChange("end_date", e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button type="submit" intent="primary" className="flex-1">
                      <IconSearch size={18} />
                      Cari
                    </Button>
                    {hasActiveFilters && (
                      <Button intent="outline" onPress={resetFilters}>
                        <IconX size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {rows.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="px-4 py-4 text-left font-semibold text-muted-fg text-xs uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-muted-fg text-xs uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-muted-fg text-xs uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-muted-fg text-xs uppercase tracking-wider">
                        Kasir
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-muted-fg text-xs uppercase tracking-wider">
                        Pelanggan
                      </th>
                      <th className="px-4 py-4 text-center font-semibold text-muted-fg text-xs uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-4 text-right font-semibold text-muted-fg text-xs uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-4 text-center font-semibold text-muted-fg text-xs uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-4 text-center font-semibold text-muted-fg text-xs uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((transaction, index) => (
                      <tr key={transaction.id} className="transition-colors hover:bg-muted">
                        <td className="px-4 py-4 text-muted-fg text-sm">
                          {index + 1 + (currentPage - 1) * perPage}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-fg text-sm">
                            {transaction.invoice}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-muted-fg text-sm">
                          {transaction.created_at}
                        </td>
                        <td className="px-4 py-4 text-muted-fg text-sm">
                          {transaction.cashier?.name ?? "-"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-md bg-muted px-2 py-1 font-medium text-muted-fg text-xs">
                            {transaction.customer?.name ?? "Umum"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
                            {transaction.total_items ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-fg text-sm">
                          {formatPrice(transaction.grand_total ?? 0)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {transaction.payment_method === "pay_later" &&
                          transaction.payment_status !== "paid" ? (
                            <StatusBadge variant="warning" label="Piutang" />
                          ) : transaction.payment_status === "paid" ? (
                            <StatusBadge variant="success" label="Lunas" />
                          ) : transaction.payment_status === "pending" && canConfirmPayment ? (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  open: true,
                                  transaction,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 font-medium text-warning text-xs transition-colors hover:bg-warning/20"
                            >
                              Pending - Konfirmasi
                            </button>
                          ) : (
                            <StatusBadge
                              variant="danger"
                              label={transaction.payment_status ?? "-"}
                            />
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {canCreateSalesReturn && transaction.can_create_sales_return ? (
                              <Link href={salesReturns.create.url(transaction.id)}>
                                <Button intent="warning" size="sq-sm">
                                  Retur
                                </Button>
                              </Link>
                            ) : canCreateSalesReturn ? (
                              <span className="inline-flex items-center justify-center rounded-lg bg-muted px-3 py-2 font-semibold text-muted-fg text-xs">
                                Retur selesai
                              </span>
                            ) : null}
                            <Link
                              href={transactionRoutes.print.url(transaction.invoice)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-fg transition-colors hover:bg-primary/10 hover:text-primary"
                              title="Cetak Struk"
                            >
                              <IconPrinter size={18} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 px-1 sm:hidden">
                {rows.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="space-y-3 rounded-xl border border-border bg-bg p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-muted-fg text-xs">
                          No {index + 1 + (currentPage - 1) * perPage}
                        </p>
                        <p className="font-semibold text-base text-fg">{transaction.invoice}</p>
                        <p className="text-muted-fg text-xs">{transaction.created_at}</p>
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {transaction.payment_method === "pay_later" &&
                          transaction.payment_status !== "paid" ? (
                            <StatusBadge variant="warning" label="Piutang" />
                          ) : transaction.payment_status === "paid" ? (
                            <StatusBadge variant="success" label="Lunas" />
                          ) : transaction.payment_status === "pending" && canConfirmPayment ? (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  open: true,
                                  transaction,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 font-medium text-warning text-xs"
                            >
                              Pending
                            </button>
                          ) : (
                            <StatusBadge
                              variant="danger"
                              label={transaction.payment_status ?? "-"}
                            />
                          )}
                        </div>
                        <p className="font-semibold text-fg text-sm">
                          {formatPrice(transaction.grand_total ?? 0)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-muted-fg text-sm">
                      <div>
                        <p className="text-muted-fg text-xs">Kasir</p>
                        <p className="font-medium text-fg">{transaction.cashier?.name ?? "-"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-fg text-xs">Pelanggan</p>
                        <p className="font-medium text-fg">
                          {transaction.customer?.name ?? "Umum"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-fg text-xs">Item</p>
                        <p className="font-medium text-fg">{transaction.total_items ?? 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-fg text-xs">Pembayaran</p>
                        <p className="font-medium text-fg capitalize">
                          {transaction.payment_method?.replace("_", " ") ?? "-"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {canCreateSalesReturn && transaction.can_create_sales_return ? (
                        <Link href={salesReturns.create.url(transaction.id)}>
                          <Button intent="warning" size="sq-sm" className="w-full">
                            Retur
                          </Button>
                        </Link>
                      ) : canCreateSalesReturn ? (
                        <div className="inline-flex items-center justify-center gap-1 rounded-lg bg-muted px-3 py-2 font-semibold text-muted-fg text-xs">
                          Retur selesai
                        </div>
                      ) : null}
                      <Link
                        href={transactionRoutes.print.url(transaction.invoice)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary/10 px-3 py-2 font-semibold text-primary text-xs transition-colors hover:bg-primary/20"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-bg py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <IconDatabaseOff size={32} className="text-muted-fg" strokeWidth={1.5} />
            </div>
            <h3 className="mb-1 font-medium text-fg text-lg">Belum Ada Transaksi</h3>
            <p className="text-muted-fg text-sm">
              {hasActiveFilters
                ? "Tidak ada transaksi sesuai filter."
                : "Transaksi akan muncul di sini."}
            </p>
          </div>
        )}

        {links.length > 3 && <Pagination links={links} />}
      </div>

      <Modal
        isOpen={confirmModal.open}
        onOpenChange={(open) =>
          !isConfirming && !open && setConfirmModal({ open: false, transaction: null })
        }
      >
        <ModalContent>
          <div className="bg-gradient-to-r from-primary to-primary px-6 py-5 text-primary-fg">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <IconBuildingBank size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Konfirmasi Pembayaran</h3>
                <p className="text-sm opacity-90">Transfer Bank</p>
              </div>
            </div>
          </div>

          <ModalBody className="space-y-4">
            <div className="rounded-xl bg-muted p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-fg text-sm">Invoice</span>
                <span className="font-bold text-fg text-sm">
                  {confirmModal.transaction?.invoice}
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-fg text-sm">Pelanggan</span>
                <span className="font-medium text-fg text-sm">
                  {confirmModal.transaction?.customer?.name ?? "Umum"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-fg text-sm">Total</span>
                <span className="font-bold text-lg text-primary">
                  {formatPrice(confirmModal.transaction?.grand_total ?? 0)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
              <IconAlertCircle size={20} className="mt-0.5 flex-shrink-0 text-warning" />
              <p className="text-sm text-warning">
                Pastikan dana sudah diterima sebelum mengkonfirmasi pembayaran ini. Tindakan ini
                tidak dapat dibatalkan.
              </p>
            </div>
          </ModalBody>

          <ModalFooter>
            <ModalClose isDisabled={isConfirming}>Batal</ModalClose>
            <Button
              intent="success"
              isDisabled={isConfirming}
              onPress={() => {
                setIsConfirming(true);
                router.patch(
                  transactionRoutes.confirmPayment.url(confirmModal.transaction!.id),
                  {},
                  {
                    onSuccess: () => {
                      setConfirmModal({ open: false, transaction: null });
                      setIsConfirming(false);
                    },
                    onError: () => {
                      setIsConfirming(false);
                    },
                  },
                );
              }}
            >
              {isConfirming ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Memproses...
                </>
              ) : (
                <>
                  <IconCheck size={18} />
                  Konfirmasi Lunas
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

History.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
