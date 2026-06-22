import { useEffect, useState } from "react";
import { Head, router, Link, usePage } from "@inertiajs/react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalClose,
} from "@/components/ui/modal";

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
    router.get("/apps/transactions/history", filterData, {
      preserveScroll: true,
      preserveState: true,
    });
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilterData(defaultFilters);
    router.get("/apps/transactions/history", defaultFilters, {
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
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-bg" />}
              </Button>
              <Link href="/apps/transactions">
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
            <CardContent className="p-5 animate-slide-up">
              <form onSubmit={applyFilters}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-fg mb-2">
                      Nomor Invoice
                    </label>
                    <input
                      type="text"
                      placeholder="TRX-..."
                      value={filterData.invoice}
                      onChange={(e) => handleChange("invoice", e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-muted text-fg placeholder:text-muted-fg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-fg mb-2">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={filterData.start_date}
                      onChange={(e) => handleChange("start_date", e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-muted text-fg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-fg mb-2">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={filterData.end_date}
                      onChange={(e) => handleChange("end_date", e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-muted text-fg"
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
              <div className="overflow-x-auto hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-4 text-left text-xs font-semibold text-muted-fg uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-muted-fg uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-muted-fg uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-muted-fg uppercase tracking-wider">
                        Kasir
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-muted-fg uppercase tracking-wider">
                        Pelanggan
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-muted-fg uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-4 text-right text-xs font-semibold text-muted-fg uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-muted-fg uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-muted-fg uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((transaction, index) => (
                      <tr key={transaction.id} className="hover:bg-muted transition-colors">
                        <td className="px-4 py-4 text-sm text-muted-fg">
                          {index + 1 + (currentPage - 1) * perPage}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-fg">
                            {transaction.invoice}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-fg">
                          {transaction.created_at}
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-fg">
                          {transaction.cashier?.name ?? "-"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-fg rounded-md">
                            {transaction.customer?.name ?? "Umum"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            {transaction.total_items ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-fg">
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
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full hover:bg-warning/20 transition-colors"
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
                              <Link href={`/apps/sales-returns/create/${transaction.id}`}>
                                <Button intent="warning" size="sq-sm">
                                  Retur
                                </Button>
                              </Link>
                            ) : canCreateSalesReturn ? (
                              <span className="inline-flex items-center justify-center rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-muted-fg">
                                Retur selesai
                              </span>
                            ) : null}
                            <Link
                              href={`/apps/transactions/print/${transaction.invoice}`}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-fg hover:text-primary hover:bg-primary/10 transition-colors"
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

              <div className="sm:hidden flex flex-col gap-3 px-1">
                {rows.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="p-4 space-y-3 bg-bg border border-border rounded-xl shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-fg">
                          No {index + 1 + (currentPage - 1) * perPage}
                        </p>
                        <p className="text-base font-semibold text-fg">{transaction.invoice}</p>
                        <p className="text-xs text-muted-fg">{transaction.created_at}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex flex-wrap gap-2 justify-end">
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
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full"
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
                        <p className="text-sm font-semibold text-fg">
                          {formatPrice(transaction.grand_total ?? 0)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-fg">
                      <div>
                        <p className="text-xs text-muted-fg">Kasir</p>
                        <p className="font-medium text-fg">{transaction.cashier?.name ?? "-"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-fg">Pelanggan</p>
                        <p className="font-medium text-fg">
                          {transaction.customer?.name ?? "Umum"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-fg">Item</p>
                        <p className="font-medium text-fg">{transaction.total_items ?? 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-fg">Pembayaran</p>
                        <p className="font-medium capitalize text-fg">
                          {transaction.payment_method?.replace("_", " ") ?? "-"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {canCreateSalesReturn && transaction.can_create_sales_return ? (
                        <Link href={`/apps/sales-returns/create/${transaction.id}`}>
                          <Button intent="warning" size="sq-sm" className="w-full">
                            Retur
                          </Button>
                        </Link>
                      ) : canCreateSalesReturn ? (
                        <div className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-muted text-muted-fg">
                          Retur selesai
                        </div>
                      ) : null}
                      <Link
                        href={`/apps/transactions/print/${transaction.invoice}`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
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
          <div className="flex flex-col items-center justify-center py-16 bg-bg rounded-2xl border border-border">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <IconDatabaseOff size={32} className="text-muted-fg" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-medium text-fg mb-1">Belum Ada Transaksi</h3>
            <p className="text-sm text-muted-fg">
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
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <IconBuildingBank size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Konfirmasi Pembayaran</h3>
                <p className="text-sm opacity-90">Transfer Bank</p>
              </div>
            </div>
          </div>

          <ModalBody className="space-y-4">
            <div className="bg-muted rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-fg">Invoice</span>
                <span className="text-sm font-bold text-fg">
                  {confirmModal.transaction?.invoice}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-fg">Pelanggan</span>
                <span className="text-sm font-medium text-fg">
                  {confirmModal.transaction?.customer?.name ?? "Umum"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-fg">Total</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(confirmModal.transaction?.grand_total ?? 0)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-xl border border-warning/30">
              <IconAlertCircle size={20} className="text-warning flex-shrink-0 mt-0.5" />
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
                  `/apps/transactions/confirm-payment/${confirmModal.transaction!.id}`,
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
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
