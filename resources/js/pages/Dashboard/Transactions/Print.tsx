import { useMemo, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  IconArrowLeft,
  IconPrinter,
  IconExternalLink,
  IconReceipt,
  IconFileInvoice,
  IconTruck,
  IconBuildingBank,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useAuthorization } from "@/lib/auth";
import transactions from "@/routes/transactions";

const formatPrice = (price = 0) =>
  Number(price || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface TransactionDetail {
  id: number;
  qty: number;
  price: number;
  unit_price?: number;
  base_unit_price?: number;
  discount_total?: number;
  pricing_group_label?: string;
  pricing_rule_name?: string;
  product?: {
    title: string;
    barcode?: string | null;
  } | null;
}

interface Transaction {
  id: number;
  invoice: string;
  created_at: string;
  grand_total: number;
  discount: number;
  shipping_cost: number;
  cash: number;
  change: number;
  payment_method: string;
  payment_status: string;
  payment_url?: string | null;
  loyalty_discount_total?: number;
  customer_voucher_discount?: number;
  details?: TransactionDetail[];
  customer?: {
    name: string;
    address?: string | null;
    phone?: string | null;
  } | null;
  cashier?: { name: string } | null;
  bank_account?: {
    bank_name: string;
    account_number: string;
    account_name: string;
  } | null;
  receivable?: { due_date?: string } | null;
}

interface PrintProps {
  transaction: Transaction;
}

function SimpleBarcode({ value }: { value: string }) {
  const bars = useMemo(() => {
    const data = value || "";
    return data.split("").map((char, idx) => {
      const weight = (char.charCodeAt(0) + idx * 17) % 5;
      return 2 + weight;
    });
  }, [value]);
  const totalWidth = bars.reduce((acc, w) => acc + w, 0);
  const targetWidth = 180;
  const scale = totalWidth ? Math.min(2.2, targetWidth / totalWidth) : 1;

  return (
    <div className="mt-4 flex items-end gap-[2px]">
      {bars.map((w, i) => (
        <span key={i} style={{ width: `${w * scale}px` }} className="block h-10 bg-fg sm:h-14" />
      ))}
    </div>
  );
}

export default function Print({ transaction }: PrintProps) {
  const { props } = usePage();
  const storeProfile = (props as Record<string, unknown>).storeProfile as
    | Record<string, unknown>
    | undefined;
  const { can } = useAuthorization();
  const [printMode, setPrintMode] = useState("invoice");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const canConfirmPayment = can("transactions-confirm-payment");

  const items = transaction?.details ?? [];
  const promoDiscountTotal = useMemo(
    () =>
      items.reduce(
        (sum: number, item: TransactionDetail) => sum + Number(item.discount_total || 0),
        0,
      ),
    [items],
  );
  const loyaltyDiscountTotal = Number(transaction?.loyalty_discount_total || 0);
  const voucherDiscountTotal = Number(transaction?.customer_voucher_discount || 0);
  const baseSubtotal =
    (transaction?.grand_total || 0) +
    (transaction?.discount || 0) -
    (transaction?.shipping_cost || 0) +
    promoDiscountTotal +
    loyaltyDiscountTotal +
    voucherDiscountTotal;

  const store = useMemo(
    () => ({
      name: (storeProfile?.name as string) || "Toko Anda",
      address: (storeProfile?.address as string) || "",
      phone: (storeProfile?.phone as string) || "",
      email: (storeProfile?.email as string) || "",
      website: (storeProfile?.website as string) || "",
    }),
    [storeProfile],
  );

  const paymentLabels: Record<string, string> = {
    cash: "Tunai",
    bank_transfer: "Transfer Bank",
    midtrans: "Midtrans",
    xendit: "Xendit",
    pay_later: "Piutang",
  };
  const paymentMethodKey = (transaction?.payment_method || "cash").toLowerCase();
  const paymentMethodLabel = paymentLabels[paymentMethodKey] ?? "Tunai";

  const paymentStatuses: Record<string, string> = {
    paid: "Lunas",
    pending: transaction?.payment_method === "pay_later" ? "Belum Lunas" : "Menunggu",
    failed: "Gagal",
    expired: "Kedaluwarsa",
    unpaid: "Belum Lunas",
    partial: "Parsial",
  };
  const paymentStatusKey = (transaction?.payment_status || "").toLowerCase();
  const paymentStatusLabel =
    paymentStatuses[paymentStatusKey] ?? (paymentMethodKey === "cash" ? "Lunas" : "Menunggu");

  const statusColors: Record<string, string> = {
    paid: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    unpaid: "bg-warning/10 text-warning",
    partial: "bg-primary/10 text-primary",
    failed: "bg-danger/10 text-danger",
    expired: "bg-muted text-muted-fg",
  };
  const paymentStatusColor = statusColors[paymentStatusKey] ?? statusColors.paid;

  const isNonCash = paymentMethodKey !== "cash";
  const showPaymentLink = isNonCash && !!transaction.payment_url;

  // oxlint-disable-next-line no-unused-vars
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head title="Invoice Penjualan" />

      <div className="min-h-screen bg-muted px-4 py-8 print:bg-bg print:p-0">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
            <Link
              href={transactions.index.url()}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg px-4 py-2.5 font-medium text-muted-fg text-sm transition-colors hover:bg-muted"
            >
              <IconArrowLeft size={18} />
              Kembali ke kasir
            </Link>

            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="flex w-full rounded-xl bg-muted p-1 sm:w-auto">
                <button
                  onClick={() => setPrintMode("invoice")}
                  className={`rounded-lg px-3 py-2 font-medium text-xs transition-all ${
                    printMode === "invoice"
                      ? "bg-bg text-fg shadow-sm"
                      : "text-muted-fg hover:text-fg"
                  }`}
                >
                  <IconFileInvoice size={16} className="mr-1 inline" />
                  Invoice
                </button>
                <button
                  onClick={() => setPrintMode("thermal80")}
                  className={`rounded-lg px-3 py-2 font-medium text-xs transition-all ${
                    printMode === "thermal80"
                      ? "bg-bg text-fg shadow-sm"
                      : "text-muted-fg hover:text-fg"
                  }`}
                >
                  <IconReceipt size={16} className="mr-1 inline" />
                  Struk 80mm
                </button>
                <button
                  onClick={() => setPrintMode("thermal58")}
                  className={`rounded-lg px-3 py-2 font-medium text-xs transition-all ${
                    printMode === "thermal58"
                      ? "bg-bg text-fg shadow-sm"
                      : "text-muted-fg hover:text-fg"
                  }`}
                >
                  <IconReceipt size={16} className="mr-1 inline" />
                  Struk 58mm
                </button>
                <button
                  onClick={() => setPrintMode("shipping")}
                  className={`rounded-lg px-3 py-2 font-medium text-xs transition-all ${
                    printMode === "shipping"
                      ? "bg-bg text-fg shadow-sm"
                      : "text-muted-fg hover:text-fg"
                  }`}
                >
                  <IconTruck size={16} className="mr-1 inline" />
                  Resi
                </button>
              </div>

              {showPaymentLink && (
                <a
                  href={transaction.payment_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 px-4 py-2.5 font-semibold text-primary text-sm transition-colors hover:bg-primary/5 sm:w-auto"
                >
                  <IconExternalLink size={18} />
                  Pembayaran
                </a>
              )}

              {paymentMethodKey === "bank_transfer" &&
                paymentStatusKey === "pending" &&
                canConfirmPayment && (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-success/90 sm:w-auto"
                  >
                    <IconCheck size={18} />
                    Konfirmasi Bayar
                  </button>
                )}

              {printMode === "invoice" && (
                <a
                  href={`/pdf/transactions/invoice/${transaction.invoice}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-sm text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90 sm:w-auto"
                >
                  <IconPrinter size={18} />
                  PDF Invoice
                </a>
              )}

              {(printMode === "thermal80" || printMode === "thermal58") && (
                <a
                  href={`/pdf/transactions/receipt/${transaction.invoice}?size=${printMode === "thermal58" ? "58" : "80"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fg px-4 py-2.5 font-semibold text-bg text-sm transition-colors hover:bg-fg/90 sm:w-auto"
                >
                  <IconPrinter size={18} />
                  PDF Struk {printMode === "thermal58" ? "58mm" : "80mm"}
                </a>
              )}

              {printMode === "shipping" && (
                <a
                  href={`/pdf/transactions/shipping/${transaction.invoice}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-success/90 sm:w-auto"
                >
                  <IconPrinter size={18} />
                  PDF Resi
                </a>
              )}
            </div>
          </div>

          {/* Invoice View */}
          {printMode === "invoice" && (
            <div className="overflow-hidden rounded-2xl border border-border bg-bg shadow-xl print:border-border print:shadow-none">
              <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-5 text-white sm:px-6 sm:py-6 print:bg-muted print:text-fg">
                <div className="flex flex-col items-center gap-4 text-center sm:grid sm:grid-cols-[1.4fr,1fr] sm:items-start sm:gap-5 sm:text-left">
                  <div className="flex min-w-0 flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center p-1 sm:h-14 sm:w-14">
                      <span className="font-bold text-lg text-white print:text-fg">
                        {store.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 space-y-1 text-center text-white sm:text-left print:text-fg">
                      <p className="font-bold text-base leading-tight sm:text-lg">{store.name}</p>
                      {store.address && (
                        <p className="break-words text-[11px] leading-snug opacity-90 sm:text-xs">
                          {store.address}
                        </p>
                      )}
                      {(store.phone || store.email || store.website) && (
                        <p className="flex flex-wrap justify-center gap-x-2 gap-y-1 space-x-2 text-[11px] leading-snug opacity-90 sm:justify-start sm:text-xs">
                          {store.phone && <span>Telp: {store.phone}</span>}
                          {store.email && <span>Email: {store.email}</span>}
                          {store.website && <span>{store.website}</span>}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="inline-flex min-w-[180px] flex-col items-center rounded-xl bg-white/10 px-3 py-2 sm:min-w-[200px] sm:items-end sm:px-4 sm:py-3 print:bg-transparent">
                      <div className="mb-1 flex items-center justify-center gap-2 sm:justify-end">
                        <IconReceipt size={20} className="sm:h-6 sm:w-6" />
                        <span className="font-medium text-xs opacity-90 sm:text-sm print:opacity-100">
                          INVOICE
                        </span>
                      </div>
                      <p className="font-bold text-lg leading-tight sm:text-2xl">
                        {transaction.invoice}
                      </p>
                      <p className="mt-1 text-xs opacity-80 sm:text-sm print:opacity-100">
                        {formatDateTime(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 border-border border-b px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 md:grid-cols-2">
                <div className="rounded-xl bg-muted/60 p-3 sm:p-4">
                  <p className="mb-2 font-semibold text-muted-fg text-xs uppercase tracking-wider">
                    Pelanggan
                  </p>
                  <p className="font-semibold text-base text-fg">
                    {transaction.customer?.name ?? "Umum"}
                  </p>
                  {transaction.customer?.address && (
                    <p className="text-muted-fg text-sm">{transaction.customer.address}</p>
                  )}
                </div>
                <div className="rounded-xl bg-muted/60 p-3 sm:p-4">
                  <p className="mb-2 font-semibold text-muted-fg text-xs uppercase tracking-wider">
                    Kasir
                  </p>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-base text-fg">
                      {transaction.cashier?.name ?? "-"}
                    </p>
                    <div className="flex flex-wrap justify-end gap-2">
                      <span
                        className={`inline-block rounded-full px-3 py-1 font-semibold text-xs ${paymentStatusColor}`}
                      >
                        {paymentStatusLabel}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 font-semibold text-muted-fg text-xs">
                        {paymentMethodLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethodKey === "bank_transfer" && transaction.bank_account && (
                <div className="mx-6 mb-6 rounded-xl border border-border bg-muted p-4">
                  <p className="mb-2 font-semibold text-muted-fg text-xs uppercase tracking-wider">
                    Silakan Transfer ke Rekening
                  </p>
                  <p className="font-bold text-fg text-lg">{transaction.bank_account.bank_name}</p>
                  <p className="font-semibold text-base text-primary">
                    {transaction.bank_account.account_number}
                  </p>
                  <p className="text-muted-fg text-sm">
                    a.n. {transaction.bank_account.account_name}
                  </p>
                </div>
              )}

              <div className="px-4 py-6 sm:px-6">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[620px] text-sm">
                    <thead>
                      <tr className="border-border border-b">
                        <th className="pb-3 text-left font-semibold text-muted-fg text-xs uppercase tracking-wider">
                          Produk
                        </th>
                        <th className="pb-3 text-right font-semibold text-muted-fg text-xs uppercase tracking-wider">
                          Harga
                        </th>
                        <th className="pb-3 text-center font-semibold text-muted-fg text-xs uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="pb-3 text-right font-semibold text-muted-fg text-xs uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.map((item: TransactionDetail, index: number) => {
                        const quantity = Number(item.qty) || 1;
                        const subtotal = Number(item.price) || 0;
                        const unitPrice = Number(item.unit_price || 0) || subtotal / quantity;
                        const baseUnitPrice = Number(item.base_unit_price || 0) || unitPrice;
                        const hasPromo =
                          Number(item.discount_total || 0) > 0 && baseUnitPrice > unitPrice;

                        return (
                          <tr
                            key={item.id ?? index}
                            className={index % 2 === 0 ? "bg-muted/30" : ""}
                          >
                            <td className="py-3">
                              <p className="font-medium text-fg">{item.product?.title}</p>
                              {hasPromo && (
                                <p className="font-medium text-danger text-xs">
                                  {item.pricing_group_label ||
                                    item.pricing_rule_name ||
                                    "Promo aktif"}
                                </p>
                              )}
                            </td>
                            <td className="py-3 text-right text-muted-fg">
                              <div>
                                {hasPromo && (
                                  <p className="text-muted-fg text-xs line-through">
                                    {formatPrice(baseUnitPrice)}
                                  </p>
                                )}
                                <p>{formatPrice(unitPrice)}</p>
                              </div>
                            </td>
                            <td className="py-3 text-center text-muted-fg">{quantity}</td>
                            <td className="py-3 text-right font-semibold text-fg">
                              {formatPrice(subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-muted/50 px-6 py-6">
                <div className="ml-auto max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between text-muted-fg">
                    <span>Subtotal</span>
                    <span>{formatPrice(baseSubtotal)}</span>
                  </div>
                  {promoDiscountTotal > 0 && (
                    <div className="flex justify-between text-muted-fg">
                      <span>Promo Otomatis</span>
                      <span>- {formatPrice(promoDiscountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-fg">
                    <span>Diskon Manual</span>
                    <span>- {formatPrice(transaction.discount)}</span>
                  </div>
                  {transaction.shipping_cost > 0 && (
                    <div className="flex justify-between text-muted-fg">
                      <span>Ongkos Kirim</span>
                      <span>+ {formatPrice(transaction.shipping_cost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-border border-t pt-2 font-bold text-fg text-lg">
                    <span>Total</span>
                    <span>{formatPrice(transaction.grand_total)}</span>
                  </div>
                  {paymentMethodKey === "cash" && (
                    <>
                      <div className="flex justify-between pt-2 text-muted-fg">
                        <span>Tunai</span>
                        <span>{formatPrice(transaction.cash)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-success">
                        <span>Kembali</span>
                        <span>{formatPrice(transaction.change)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-border border-t px-6 py-4">
                <p className="text-muted-fg text-xs">Invoice: {transaction.invoice}</p>
                <SimpleBarcode value={transaction.invoice} />
                <div className="mt-4 text-center">
                  <p className="text-muted-fg text-xs uppercase tracking-widest">
                    Terima kasih telah berbelanja
                  </p>
                </div>
              </div>
            </div>
          )}

          {printMode === "thermal80" && (
            <div className="flex justify-center print:block">
              <div className="rounded-2xl border border-border bg-bg p-4 shadow-xl print:rounded-none print:border-0 print:p-0 print:shadow-none">
                <div className="mx-auto max-w-[80mm] space-y-2 p-2 font-mono text-sm">
                  <div className="mb-3 border-border border-b border-dashed pb-3 text-center">
                    <p className="font-bold text-base text-fg">{store.name}</p>
                    {store.address && <p className="text-muted-fg text-xs">{store.address}</p>}
                    {store.phone && <p className="text-muted-fg text-xs">Telp: {store.phone}</p>}
                  </div>
                  <div className="flex justify-between text-muted-fg text-xs">
                    <span>{transaction.invoice}</span>
                    <span>{formatDateTime(transaction.created_at)}</span>
                  </div>
                  <div className="mt-2 border-border border-t border-dashed pt-2" />
                  {items.map((item: TransactionDetail) => (
                    <div key={item.id} className="text-fg text-xs">
                      <p className="font-medium">{item.product?.title}</p>
                      <div className="flex justify-between">
                        <span>
                          {item.qty} x{" "}
                          {formatPrice(
                            Number(item.unit_price || 0) ||
                              Number(item.price || 0) / Number(item.qty || 1),
                          )}
                        </span>
                        <span>{formatPrice(Number(item.price || 0))}</span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 border-border border-t border-dashed pt-2" />
                  <div className="flex justify-between font-bold text-fg text-sm">
                    <span>Total</span>
                    <span>{formatPrice(transaction.grand_total)}</span>
                  </div>
                  {Number(transaction.cash) > 0 && (
                    <>
                      <div className="flex justify-between text-muted-fg text-xs">
                        <span>Tunai</span>
                        <span>{formatPrice(transaction.cash)}</span>
                      </div>
                      <div className="flex justify-between text-success text-xs">
                        <span>Kembali</span>
                        <span>{formatPrice(transaction.change)}</span>
                      </div>
                    </>
                  )}
                  <div className="mt-4 border-border border-t border-dashed pt-3 text-center text-muted-fg text-xs">
                    <p>Terima kasih telah berbelanja</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {printMode === "thermal58" && (
            <div className="flex justify-center print:block">
              <div className="rounded-2xl border border-border bg-bg p-4 shadow-xl print:rounded-none print:border-0 print:p-0 print:shadow-none">
                <div className="mx-auto max-w-[58mm] space-y-1.5 p-1 font-mono text-xs">
                  <div className="mb-2 border-border border-b border-dashed pb-2 text-center">
                    <p className="font-bold text-fg text-sm">{store.name}</p>
                    {store.address && <p className="text-[10px] text-muted-fg">{store.address}</p>}
                    {store.phone && (
                      <p className="text-[10px] text-muted-fg">Telp: {store.phone}</p>
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-fg">
                    <span>{transaction.invoice}</span>
                    <span>{formatDateTime(transaction.created_at)}</span>
                  </div>
                  <div className="mt-1.5 border-border border-t border-dashed pt-1.5" />
                  {items.map((item: TransactionDetail) => (
                    <div key={item.id} className="text-[10px] text-fg">
                      <p className="font-medium">{item.product?.title}</p>
                      <div className="flex justify-between">
                        <span>
                          {item.qty} x{" "}
                          {formatPrice(
                            Number(item.unit_price || 0) ||
                              Number(item.price || 0) / Number(item.qty || 1),
                          )}
                        </span>
                        <span>{formatPrice(Number(item.price || 0))}</span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-1.5 border-border border-t border-dashed pt-1.5" />
                  <div className="flex justify-between font-bold text-fg text-xs">
                    <span>Total</span>
                    <span>{formatPrice(transaction.grand_total)}</span>
                  </div>
                  {Number(transaction.cash) > 0 && (
                    <>
                      <div className="flex justify-between text-[10px] text-muted-fg">
                        <span>Tunai</span>
                        <span>{formatPrice(transaction.cash)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-success">
                        <span>Kembali</span>
                        <span>{formatPrice(transaction.change)}</span>
                      </div>
                    </>
                  )}
                  <div className="mt-3 border-border border-t border-dashed pt-2 text-center text-[10px] text-muted-fg">
                    <p>Terima kasih</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {printMode === "shipping" && (
            <div className="flex items-center justify-center py-10 print:block print:py-0">
              <div className="mx-auto w-full max-w-[150mm] rounded-2xl border border-border bg-bg p-6 shadow-xl print:border-0 print:shadow-none">
                <div className="mb-4 border-border border-b pb-4 text-center">
                  <p className="font-bold text-fg text-lg">{store.name}</p>
                  {store.address && <p className="text-muted-fg text-xs">{store.address}</p>}
                  {store.phone && <p className="text-muted-fg text-xs">Telp: {store.phone}</p>}
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-fg text-xs">Pengirim</p>
                    <p className="font-medium text-fg">{store.name}</p>
                    {store.address && <p className="text-muted-fg text-xs">{store.address}</p>}
                    {store.phone && <p className="text-muted-fg text-xs">{store.phone}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-muted-fg text-xs">Penerima</p>
                    <p className="font-medium text-fg">{transaction.customer?.name || "-"}</p>
                    {transaction.customer?.address && (
                      <p className="text-muted-fg text-xs">{transaction.customer.address}</p>
                    )}
                  </div>
                </div>

                <div className="border-border border-t pt-4">
                  <div className="flex justify-between font-bold text-fg text-sm">
                    <span>{transaction.invoice}</span>
                    <span>{formatPrice(transaction.grand_total)}</span>
                  </div>
                  <p className="mt-1 text-muted-fg text-xs">
                    {formatDateTime(transaction.created_at)}
                  </p>
                </div>

                <div className="mt-4 border-border border-t pt-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-border border-b">
                        <th className="pb-1 text-left text-muted-fg">Produk</th>
                        <th className="pb-1 text-center text-muted-fg">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: TransactionDetail) => (
                        <tr key={item.id}>
                          <td className="py-1 text-fg">{item.product?.title}</td>
                          <td className="text-center text-muted-fg">{item.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 border-border border-t pt-4 text-center text-muted-fg text-xs">
                  <SimpleBarcode value={transaction.invoice} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && canConfirmPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isConfirming && setShowConfirmModal(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-bg shadow-2xl">
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-white">
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
            <div className="space-y-4 p-6">
              <div className="rounded-xl bg-muted p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-muted-fg text-sm">Invoice</span>
                  <span className="font-bold text-fg text-sm">{transaction.invoice}</span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-muted-fg text-sm">Pelanggan</span>
                  <span className="font-medium text-muted-fg text-sm">
                    {transaction.customer?.name ?? "Umum"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-fg text-sm">Total</span>
                  <span className="font-bold text-lg text-primary">
                    {formatPrice(transaction.grand_total ?? 0)}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
                <IconAlertCircle size={20} className="mt-0.5 flex-shrink-0 text-warning" />
                <p className="text-sm text-warning">
                  Pastikan dana sudah diterima sebelum mengkonfirmasi pembayaran ini.
                </p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isConfirming}
                className="flex-1 rounded-xl border border-border px-4 py-3 font-medium text-muted-fg hover:bg-muted disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsConfirming(true);
                  router.patch(
                    transactions.confirmPayment.url(transaction.id),
                    {},
                    {
                      onSuccess: () => {
                        setShowConfirmModal(false);
                        setIsConfirming(false);
                      },
                      onError: () => {
                        setIsConfirming(false);
                      },
                    },
                  );
                }}
                disabled={isConfirming}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 font-medium text-white hover:bg-success/90 disabled:opacity-50"
              >
                {isConfirming ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{" "}
                    Memproses...
                  </>
                ) : (
                  <>
                    <IconCheck size={18} /> Konfirmasi Lunas
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
