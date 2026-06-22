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
    <div className="flex items-end gap-[2px] mt-4">
      {bars.map((w, i) => (
        <span key={i} style={{ width: `${w * scale}px` }} className="h-10 sm:h-14 bg-fg block" />
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head title="Invoice Penjualan" />

      <div className="min-h-screen bg-muted print:bg-bg print:p-0 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
            <Link
              href="/apps/transactions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-medium text-muted-fg hover:bg-muted transition-colors"
            >
              <IconArrowLeft size={18} />
              Kembali ke kasir
            </Link>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex bg-muted rounded-xl p-1 w-full sm:w-auto">
                <button
                  onClick={() => setPrintMode("invoice")}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    printMode === "invoice"
                      ? "bg-bg text-fg shadow-sm"
                      : "text-muted-fg hover:text-fg"
                  }`}
                >
                  <IconFileInvoice size={16} className="inline mr-1" />
                  Invoice
                </button>
                <button
                  onClick={() => setPrintMode("thermal80")}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    printMode === "thermal80"
                      ? "bg-bg text-fg shadow-sm"
                      : "text-muted-fg hover:text-fg"
                  }`}
                >
                  <IconReceipt size={16} className="inline mr-1" />
                  Struk 80mm
                </button>
                <button
                  onClick={() => setPrintMode("thermal58")}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    printMode === "thermal58"
                      ? "bg-bg text-fg shadow-sm"
                      : "text-muted-fg hover:text-fg"
                  }`}
                >
                  <IconReceipt size={16} className="inline mr-1" />
                  Struk 58mm
                </button>
                <button
                  onClick={() => setPrintMode("shipping")}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    printMode === "shipping"
                      ? "bg-bg text-fg shadow-sm"
                      : "text-muted-fg hover:text-fg"
                  }`}
                >
                  <IconTruck size={16} className="inline mr-1" />
                  Resi
                </button>
              </div>

              {showPaymentLink && (
                <a
                  href={transaction.payment_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors w-full sm:w-auto"
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
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success hover:bg-success/90 text-sm font-semibold text-white transition-colors w-full sm:w-auto"
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
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors w-full sm:w-auto"
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
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-fg hover:bg-fg/90 text-sm font-semibold text-bg transition-colors w-full sm:w-auto"
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
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success hover:bg-success/90 text-sm font-semibold text-white transition-colors w-full sm:w-auto"
                >
                  <IconPrinter size={18} />
                  PDF Resi
                </a>
              )}
            </div>
          </div>

          {/* Invoice View */}
          {printMode === "invoice" && (
            <div className="bg-bg rounded-2xl border border-border overflow-hidden shadow-xl print:shadow-none print:border-border">
              <div className="bg-gradient-to-r from-primary to-primary/80 px-4 sm:px-6 py-5 sm:py-6 text-white print:bg-muted print:text-fg">
                <div className="flex flex-col items-center text-center gap-4 sm:gap-5 sm:grid sm:grid-cols-[1.4fr,1fr] sm:text-left sm:items-start">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center p-1 flex-shrink-0">
                      <span className="text-lg font-bold text-white print:text-fg">
                        {store.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-white print:text-fg space-y-1 min-w-0 text-center sm:text-left">
                      <p className="text-base sm:text-lg font-bold leading-tight">{store.name}</p>
                      {store.address && (
                        <p className="text-[11px] sm:text-xs opacity-90 leading-snug break-words">
                          {store.address}
                        </p>
                      )}
                      {(store.phone || store.email || store.website) && (
                        <p className="text-[11px] sm:text-xs opacity-90 space-x-2 leading-snug flex flex-wrap justify-center sm:justify-start gap-x-2 gap-y-1">
                          {store.phone && <span>Telp: {store.phone}</span>}
                          {store.email && <span>Email: {store.email}</span>}
                          {store.website && <span>{store.website}</span>}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="inline-flex flex-col items-center sm:items-end bg-white/10 print:bg-transparent rounded-xl px-3 py-2 sm:px-4 sm:py-3 min-w-[180px] sm:min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1 justify-center sm:justify-end">
                        <IconReceipt size={20} className="sm:w-6 sm:h-6" />
                        <span className="text-xs sm:text-sm font-medium opacity-90 print:opacity-100">
                          INVOICE
                        </span>
                      </div>
                      <p className="text-lg sm:text-2xl font-bold leading-tight">
                        {transaction.invoice}
                      </p>
                      <p className="text-xs sm:text-sm opacity-80 print:opacity-100 mt-1">
                        {formatDateTime(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 py-4 sm:py-6 border-b border-border">
                <div className="bg-muted/60 rounded-xl p-3 sm:p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-2">
                    Pelanggan
                  </p>
                  <p className="text-base font-semibold text-fg">
                    {transaction.customer?.name ?? "Umum"}
                  </p>
                  {transaction.customer?.address && (
                    <p className="text-sm text-muted-fg">{transaction.customer.address}</p>
                  )}
                </div>
                <div className="bg-muted/60 rounded-xl p-3 sm:p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-2">
                    Kasir
                  </p>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base font-semibold text-fg">
                      {transaction.cashier?.name ?? "-"}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${paymentStatusColor}`}
                      >
                        {paymentStatusLabel}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-muted text-muted-fg">
                        {paymentMethodLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethodKey === "bank_transfer" && transaction.bank_account && (
                <div className="mx-6 mb-6 p-4 rounded-xl bg-muted border border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-2">
                    Silakan Transfer ke Rekening
                  </p>
                  <p className="text-lg font-bold text-fg">{transaction.bank_account.bank_name}</p>
                  <p className="text-base font-semibold text-primary">
                    {transaction.bank_account.account_number}
                  </p>
                  <p className="text-sm text-muted-fg">
                    a.n. {transaction.bank_account.account_name}
                  </p>
                </div>
              )}

              <div className="px-4 sm:px-6 py-6">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[620px] text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-fg">
                          Produk
                        </th>
                        <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-fg">
                          Harga
                        </th>
                        <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-fg">
                          Qty
                        </th>
                        <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-fg">
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
                                <p className="text-xs font-medium text-danger">
                                  {item.pricing_group_label ||
                                    item.pricing_rule_name ||
                                    "Promo aktif"}
                                </p>
                              )}
                            </td>
                            <td className="py-3 text-right text-muted-fg">
                              <div>
                                {hasPromo && (
                                  <p className="text-xs text-muted-fg line-through">
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
                <div className="max-w-xs ml-auto space-y-2 text-sm">
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
                  <div className="flex justify-between text-lg font-bold text-fg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{formatPrice(transaction.grand_total)}</span>
                  </div>
                  {paymentMethodKey === "cash" && (
                    <>
                      <div className="flex justify-between text-muted-fg pt-2">
                        <span>Tunai</span>
                        <span>{formatPrice(transaction.cash)}</span>
                      </div>
                      <div className="flex justify-between text-success font-medium">
                        <span>Kembali</span>
                        <span>{formatPrice(transaction.change)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border">
                <p className="text-xs text-muted-fg">Invoice: {transaction.invoice}</p>
                <SimpleBarcode value={transaction.invoice} />
                <div className="text-center mt-4">
                  <p className="text-xs text-muted-fg uppercase tracking-widest">
                    Terima kasih telah berbelanja
                  </p>
                </div>
              </div>
            </div>
          )}

          {printMode === "thermal80" && (
            <div className="flex justify-center print:block">
              <div className="bg-bg rounded-2xl border border-border shadow-xl p-4 print:shadow-none print:border-0 print:p-0 print:rounded-none">
                <div className="max-w-[80mm] mx-auto text-sm space-y-2 p-2 font-mono">
                  <div className="text-center border-b border-dashed border-border pb-3 mb-3">
                    <p className="text-base font-bold text-fg">{store.name}</p>
                    {store.address && <p className="text-xs text-muted-fg">{store.address}</p>}
                    {store.phone && <p className="text-xs text-muted-fg">Telp: {store.phone}</p>}
                  </div>
                  <div className="flex justify-between text-xs text-muted-fg">
                    <span>{transaction.invoice}</span>
                    <span>{formatDateTime(transaction.created_at)}</span>
                  </div>
                  <div className="border-t border-dashed border-border pt-2 mt-2" />
                  {items.map((item: TransactionDetail) => (
                    <div key={item.id} className="text-xs text-fg">
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
                  <div className="border-t border-dashed border-border pt-2 mt-2" />
                  <div className="flex justify-between text-sm font-bold text-fg">
                    <span>Total</span>
                    <span>{formatPrice(transaction.grand_total)}</span>
                  </div>
                  {Number(transaction.cash) > 0 && (
                    <>
                      <div className="flex justify-between text-xs text-muted-fg">
                        <span>Tunai</span>
                        <span>{formatPrice(transaction.cash)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-success">
                        <span>Kembali</span>
                        <span>{formatPrice(transaction.change)}</span>
                      </div>
                    </>
                  )}
                  <div className="text-center text-xs text-muted-fg mt-4 pt-3 border-t border-dashed border-border">
                    <p>Terima kasih telah berbelanja</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {printMode === "thermal58" && (
            <div className="flex justify-center print:block">
              <div className="bg-bg rounded-2xl border border-border shadow-xl p-4 print:shadow-none print:border-0 print:p-0 print:rounded-none">
                <div className="max-w-[58mm] mx-auto text-xs space-y-1.5 p-1 font-mono">
                  <div className="text-center border-b border-dashed border-border pb-2 mb-2">
                    <p className="text-sm font-bold text-fg">{store.name}</p>
                    {store.address && <p className="text-[10px] text-muted-fg">{store.address}</p>}
                    {store.phone && (
                      <p className="text-[10px] text-muted-fg">Telp: {store.phone}</p>
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-fg">
                    <span>{transaction.invoice}</span>
                    <span>{formatDateTime(transaction.created_at)}</span>
                  </div>
                  <div className="border-t border-dashed border-border pt-1.5 mt-1.5" />
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
                  <div className="border-t border-dashed border-border pt-1.5 mt-1.5" />
                  <div className="flex justify-between text-xs font-bold text-fg">
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
                  <div className="text-center text-[10px] text-muted-fg mt-3 pt-2 border-t border-dashed border-border">
                    <p>Terima kasih</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {printMode === "shipping" && (
            <div className="flex justify-center items-center py-10 print:py-0 print:block">
              <div className="w-full max-w-[150mm] mx-auto bg-bg rounded-2xl border border-border shadow-xl p-6 print:shadow-none print:border-0">
                <div className="text-center border-b border-border pb-4 mb-4">
                  <p className="text-lg font-bold text-fg">{store.name}</p>
                  {store.address && <p className="text-xs text-muted-fg">{store.address}</p>}
                  {store.phone && <p className="text-xs text-muted-fg">Telp: {store.phone}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-xs text-muted-fg">Pengirim</p>
                    <p className="font-medium text-fg">{store.name}</p>
                    {store.address && <p className="text-xs text-muted-fg">{store.address}</p>}
                    {store.phone && <p className="text-xs text-muted-fg">{store.phone}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-fg">Penerima</p>
                    <p className="font-medium text-fg">{transaction.customer?.name || "-"}</p>
                    {transaction.customer?.address && (
                      <p className="text-xs text-muted-fg">{transaction.customer.address}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-sm font-bold text-fg">
                    <span>{transaction.invoice}</span>
                    <span>{formatPrice(transaction.grand_total)}</span>
                  </div>
                  <p className="text-xs text-muted-fg mt-1">
                    {formatDateTime(transaction.created_at)}
                  </p>
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left pb-1 text-muted-fg">Produk</th>
                        <th className="text-center pb-1 text-muted-fg">Qty</th>
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

                <div className="text-center text-xs text-muted-fg mt-6 pt-4 border-t border-border">
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
          <div className="relative bg-bg rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-white">
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
            <div className="p-6 space-y-4">
              <div className="bg-muted rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-fg">Invoice</span>
                  <span className="text-sm font-bold text-fg">{transaction.invoice}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-fg">Pelanggan</span>
                  <span className="text-sm font-medium text-muted-fg">
                    {transaction.customer?.name ?? "Umum"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-fg">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(transaction.grand_total ?? 0)}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-xl border border-warning/30">
                <IconAlertCircle size={20} className="text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm text-warning">
                  Pastikan dana sudah diterima sebelum mengkonfirmasi pembayaran ini.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isConfirming}
                className="flex-1 px-4 py-3 rounded-xl border border-border text-muted-fg font-medium hover:bg-muted disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsConfirming(true);
                  router.patch(
                    `/apps/transactions/confirm-payment/${transaction.id}`,
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
                className="flex-1 px-4 py-3 rounded-xl bg-success hover:bg-success/90 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isConfirming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
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
