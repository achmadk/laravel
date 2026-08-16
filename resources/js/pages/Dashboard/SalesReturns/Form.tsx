import { useEffect, useMemo } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { IconArrowLeft, IconCheck, IconDeviceFloppy } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import transactions from "@/routes/transactions";
import salesReturns from "@/routes/sales-returns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";

function formatCurrency(value: number = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(value),
      )
    : "-";
}

interface TransactionDetail {
  id: number;
  product: { title: string; barcode?: string; sku?: string } | null;
  qty: number;
  price: number;
  returned_completed_qty: number;
  remaining_returnable_qty: number;
  draft_item?: { qty_return: number; return_reason: string; restock_to_inventory: boolean } | null;
}

interface Transaction {
  id: number;
  invoice: string;
  created_at: string;
  grand_total: number;
  payment_method: string;
  payment_status: string;
  customer: { name: string } | null;
  receivable: { total: number; paid: number } | null;
  details: TransactionDetail[];
}

interface SalesReturn {
  id: number;
  code: string;
  status: string;
  completed_at: string | null;
  return_type: string;
  notes: string;
}

interface FormItem {
  transaction_detail_id: number;
  qty_return: number;
  return_reason: string;
  restock_to_inventory: boolean;
}

interface FormProps {
  title: string;
  transaction: Transaction;
  salesReturn?: SalesReturn | null;
  submitRoute: string;
  submitMethod?: "post" | "patch";
  canEdit?: boolean;
  canComplete?: boolean;
  completeRoute?: string | null;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="font-medium text-muted-fg text-xs uppercase tracking-wide">{label}</p>
        <p className="mt-2 font-semibold text-fg text-lg">{value}</p>
      </CardContent>
    </Card>
  );
}

function PreviewRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-fg">{label}</span>
      <span className={strong ? "font-semibold text-fg" : "font-medium text-fg"}>{value}</span>
    </div>
  );
}

export default function SalesReturnForm({
  title,
  transaction,
  salesReturn = null,
  submitRoute,
  submitMethod = "post",
  canEdit = true,
  canComplete = false,
  completeRoute = null,
}: FormProps) {
  const itemDefaults = useMemo(
    () =>
      transaction.details.map((detail) => ({
        transaction_detail_id: detail.id,
        qty_return: detail.draft_item?.qty_return ?? 0,
        return_reason: detail.draft_item?.return_reason ?? "",
        restock_to_inventory: detail.draft_item?.restock_to_inventory ?? true,
      })),
    [transaction.details],
  );

  const form = useForm({
    return_type:
      salesReturn?.return_type && transaction.customer
        ? salesReturn.return_type
        : ("refund_cash" as string),
    notes: salesReturn?.notes ?? "",
    items: itemDefaults,
  });

  useEffect(() => {
    form.setData({
      return_type:
        salesReturn?.return_type && transaction.customer ? salesReturn.return_type : "refund_cash",
      notes: salesReturn?.notes ?? "",
      items: itemDefaults,
    });
  }, [salesReturn, itemDefaults]);

  interface ItemState {
    id: number;
    product: { title: string; barcode?: string; sku?: string } | null;
    qty: number;
    price: number;
    returned_completed_qty: number;
    remaining_returnable_qty: number;
    qty_return: number;
    return_reason: string;
    restock_to_inventory: boolean;
    subtotal: number;
  }

  const itemStates: ItemState[] = useMemo(() => {
    const itemMap = new Map(form.data.items.map((item) => [item.transaction_detail_id, item]));

    return transaction.details.map((detail) => {
      const current = itemMap.get(detail.id) ?? {
        qty_return: 0,
        return_reason: "",
        restock_to_inventory: true,
      };
      const qtyReturn = Number(current.qty_return || 0);
      const subtotal = qtyReturn * Number(detail.price || 0);

      return {
        ...detail,
        qty_return: qtyReturn,
        return_reason: current.return_reason || "",
        restock_to_inventory: Boolean(current.restock_to_inventory),
        subtotal,
      };
    });
  }, [form.data.items, transaction.details]);

  const summary = useMemo(() => {
    const selectedItems = itemStates.filter((item) => item.qty_return > 0);
    const totalItems = selectedItems.reduce((carry, item) => carry + item.qty_return, 0);
    const totalAmount = selectedItems.reduce((carry, item) => carry + item.subtotal, 0);
    const restockQty = selectedItems.reduce(
      (carry, item) => carry + (item.restock_to_inventory ? item.qty_return : 0),
      0,
    );

    let receivableAfter: number | null = null;
    let settlementAmount = 0;

    if (transaction.payment_method === "pay_later" && transaction.receivable) {
      receivableAfter = Math.max(0, Number(transaction.receivable.total || 0) - totalAmount);
      settlementAmount = Math.max(0, Number(transaction.receivable.paid || 0) - receivableAfter);
    } else if (transaction.payment_status === "paid") {
      settlementAmount = totalAmount;
    }

    const effectiveReturnType =
      !transaction.customer && form.data.return_type === "store_credit"
        ? "refund_cash"
        : form.data.return_type;

    return {
      selectedItemsCount: selectedItems.length,
      totalItems,
      totalAmount,
      restockQty,
      receivableAfter,
      refundAmount: effectiveReturnType === "refund_cash" ? settlementAmount : 0,
      creditedAmount: effectiveReturnType === "store_credit" ? settlementAmount : 0,
      hasSelectedItems: selectedItems.length > 0,
    };
  }, [
    itemStates,
    form.data.return_type,
    transaction.customer,
    transaction.payment_method,
    transaction.payment_status,
    transaction.receivable,
  ]);

  function updateItem(
    transactionDetailId: number,
    key: keyof FormItem,
    value: number | string | boolean,
  ) {
    form.setData(
      "items",
      form.data.items.map((item) =>
        item.transaction_detail_id === transactionDetailId ? { ...item, [key]: value } : item,
      ),
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    form[submitMethod](submitRoute, {
      preserveScroll: true,
      onSuccess: () => toast.success(salesReturn ? "Draft retur diperbarui" : "Draft retur dibuat"),
      onError: () => toast.error("Gagal menyimpan draft retur"),
    });
  }

  function complete() {
    if (!completeRoute) return;
    router.post(
      completeRoute,
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Retur penjualan diselesaikan"),
        onError: () => toast.error("Gagal menyelesaikan retur"),
      },
    );
  }

  return (
    <>
      <Head title={title} />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href={salesReturn ? salesReturns.index.url() : transactions.history.url()}
              className="mb-3 inline-flex items-center gap-2 text-muted-fg text-sm hover:text-primary"
            >
              <IconArrowLeft size={16} />
              {salesReturn ? "Kembali ke daftar retur" : "Kembali ke riwayat transaksi"}
            </Link>
            <h1 className="font-bold text-2xl text-fg">{title}</h1>
            <p className="mt-1 text-muted-fg text-sm">
              Invoice {transaction.invoice} &bull; {formatDateTime(transaction.created_at)}
            </p>
          </div>

          {salesReturn && (
            <div className="flex items-center gap-2">
              <StatusBadge
                variant={salesReturn.status === "completed" ? "success" : "warning"}
                label={salesReturn.status === "completed" ? "Completed" : "Draft"}
              />
              {salesReturn.completed_at && (
                <span className="text-muted-fg text-xs">
                  {formatDateTime(salesReturn.completed_at)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Pelanggan" value={transaction.customer?.name || "Umum"} />
          <InfoCard
            label="Metode Bayar"
            value={transaction.payment_method?.replaceAll("_", " ").toUpperCase()}
          />
          <InfoCard label="Total Transaksi" value={formatCurrency(transaction.grand_total)} />
          <InfoCard label="Nominal Retur" value={formatCurrency(summary.totalAmount)} />
        </div>

        <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-fg text-lg">Item Retur</h2>
                {canEdit && (
                  <Button type="submit" isDisabled={form.processing} intent="primary">
                    <IconDeviceFloppy size={18} />
                    {salesReturn ? "Simpan Draft" : "Buat Draft"}
                  </Button>
                )}
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="h-12 min-w-[180px] px-4 text-left align-middle font-medium text-muted-fg">
                        Produk
                      </th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-muted-fg">
                        Qty Beli
                      </th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-muted-fg">
                        Sudah Retur
                      </th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-muted-fg">
                        Sisa
                      </th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-muted-fg">
                        Qty Retur
                      </th>
                      <th className="h-12 min-w-[160px] px-4 text-left align-middle font-medium text-muted-fg">
                        Alasan
                      </th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-muted-fg">
                        Restock
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-fg">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-bg">
                    {itemStates.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-muted">
                        <td className="whitespace-nowrap p-4 align-middle">
                          <div>
                            <p className="font-medium text-fg">{item.product?.title || "-"}</p>
                            <p className="text-muted-fg text-xs">
                              {item.product?.barcode || item.product?.sku || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-4 text-center align-middle text-muted-fg">
                          {item.qty}
                        </td>
                        <td className="whitespace-nowrap p-4 text-center align-middle text-muted-fg">
                          {item.returned_completed_qty}
                        </td>
                        <td className="whitespace-nowrap p-4 text-center align-middle text-muted-fg">
                          {item.remaining_returnable_qty}
                        </td>
                        <td className="whitespace-nowrap p-4 text-center align-middle">
                          <input
                            type="number"
                            min="0"
                            max={item.remaining_returnable_qty}
                            value={item.qty_return}
                            disabled={!canEdit}
                            onChange={(e) => updateItem(item.id, "qty_return", e.target.value)}
                            className="h-10 w-24 rounded-lg border border-input bg-muted px-3 text-fg text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle">
                          <input
                            type="text"
                            value={item.return_reason}
                            disabled={!canEdit}
                            onChange={(e) => updateItem(item.id, "return_reason", e.target.value)}
                            placeholder="Alasan retur"
                            className="h-10 min-w-48 rounded-lg border border-input bg-muted px-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </td>
                        <td className="whitespace-nowrap p-4 text-center align-middle">
                          <input
                            type="checkbox"
                            checked={item.restock_to_inventory}
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateItem(item.id, "restock_to_inventory", e.target.checked)
                            }
                            className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                          />
                        </td>
                        <td className="whitespace-nowrap p-4 text-right align-middle text-muted-fg">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {form.errors.items && (
                <p className="mt-3 text-danger text-sm">{form.errors.items as string}</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 font-semibold text-fg text-lg">Penyelesaian Retur</h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block font-medium text-fg text-sm">
                      Metode Penyelesaian
                    </label>
                    <select
                      value={form.data.return_type}
                      disabled={!canEdit || !transaction.customer}
                      onChange={(e) => form.setData("return_type", e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="refund_cash">Refund Tunai</option>
                      {transaction.customer && (
                        <option value="store_credit">Saldo Toko / Credit</option>
                      )}
                    </select>
                    {!transaction.customer && (
                      <p className="mt-2 text-muted-fg text-xs">
                        Transaksi tanpa pelanggan hanya dapat memakai refund tunai.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-fg text-sm">Catatan</label>
                    <textarea
                      rows={4}
                      value={form.data.notes}
                      disabled={!canEdit}
                      onChange={(e) => form.setData("notes", e.target.value)}
                      className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Catatan retur"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 font-semibold text-fg text-lg">Preview Dampak</h2>

                <div className="space-y-3 text-muted-fg text-sm">
                  <PreviewRow label="Item dipilih" value={`${summary.selectedItemsCount} produk`} />
                  <PreviewRow label="Total qty retur" value={`${summary.totalItems} item`} />
                  <PreviewRow label="Stok kembali" value={`${summary.restockQty} item`} />
                  <PreviewRow label="Refund" value={formatCurrency(summary.refundAmount)} />
                  <PreviewRow label="Saldo toko" value={formatCurrency(summary.creditedAmount)} />
                  {transaction.receivable && (
                    <>
                      <PreviewRow
                        label="Piutang saat ini"
                        value={formatCurrency(transaction.receivable.total)}
                      />
                      <PreviewRow
                        label="Piutang setelah retur"
                        value={formatCurrency(summary.receivableAfter ?? 0)}
                      />
                    </>
                  )}
                  <PreviewRow
                    label="Nominal retur"
                    value={formatCurrency(summary.totalAmount)}
                    strong
                  />
                </div>

                {canComplete && (
                  <div className="mt-5">
                    <Button
                      type="button"
                      isDisabled={!summary.hasSelectedItems || form.processing || form.isDirty}
                      intent="success"
                      className="w-full"
                      onPress={complete}
                    >
                      <IconCheck size={18} />
                      Selesaikan Retur
                    </Button>
                    {form.isDirty && (
                      <p className="mt-2 text-warning text-xs">
                        Simpan draft terlebih dulu sebelum menyelesaikan retur.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </>
  );
}

// eslint-disable-next-line react/display-name
SalesReturnForm.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
