import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
  IconCash,
  IconCreditCard,
  IconBuildingBank,
  IconQrcode,
  IconWallet,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import transactions from "@/routes/transactions";
import type {
  POSCartItem,
  POSCustomer,
  BankAccount,
  PaymentGateway,
  PricingPreview,
} from "@/types/pos";

const formatPrice = (value = 0) =>
  Number(value || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

interface PaymentPanelProps {
  items: POSCartItem[];
  customer: POSCustomer | null;
  pricingPreview?: PricingPreview | null;
  onOpenNumpad: (options: {
    title: string;
    initialValue: number;
    onConfirm: (value: number) => void;
    minValue: number;
    maxValue: number;
    isCurrency?: boolean;
  }) => void;
  onRemoveCustomer: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (val: boolean) => void;
  bankAccounts?: BankAccount[];
  paymentGateways?: PaymentGateway[];
  hasActiveShift?: boolean;
}

type PaymentMethod = "cash" | "qris" | "transfer" | "gateway";

export default function PaymentPanel({
  items,
  customer,
  pricingPreview = null,
  onOpenNumpad,
  onRemoveCustomer,
  isSubmitting,
  setIsSubmitting,
  bankAccounts = [],
  paymentGateways = [],
  hasActiveShift = true,
}: PaymentPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [amountPaid, setAmountPaid] = useState(0);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Totals come from the server-computed pricing preview so the displayed grand
  // total always matches what the store endpoint charges (promo, voucher,
  // loyalty, shipping). Fall back to a plain subtotal only if no preview yet.
  const summary = pricingPreview?.summary;
  const totalItems = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const fallbackSubtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const pricing = {
    subtotal: summary?.base_subtotal ?? fallbackSubtotal,
    promoDiscount: summary?.promo_discount_total ?? 0,
    voucherDiscount: summary?.voucher_discount_total ?? 0,
    loyaltyDiscount: summary?.loyalty_discount_total ?? 0,
    manualDiscount: summary?.manual_discount_total ?? 0,
    shipping: summary?.shipping_cost ?? 0,
    grand_total: summary?.grand_total ?? fallbackSubtotal,
    total_items: totalItems,
  };

  const change = Math.max(0, amountPaid - pricing.grand_total);
  const isShort = amountPaid < pricing.grand_total;

  // Non-cash methods are paid in full; reset the paid amount when totals change.
  useEffect(() => {
    if (paymentMethod && paymentMethod !== "cash") {
      setAmountPaid(pricing.grand_total);
    }
  }, [paymentMethod, pricing.grand_total]);

  const handlePaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === "cash") {
      onOpenNumpad({
        title: "Jumlah Bayar",
        initialValue: pricing.grand_total,
        minValue: pricing.grand_total,
        maxValue: 999999999,
        isCurrency: true,
        onConfirm: (value) => setAmountPaid(value),
      });
    } else {
      setAmountPaid(pricing.grand_total);
    }
  };

  const handleSubmit = () => {
    if (!hasActiveShift) {
      toast.error("Buka shift kasir terlebih dahulu");
      return;
    }
    if (!paymentMethod || items.length === 0) return;
    if (paymentMethod === "cash" && isShort) {
      toast.error("Jumlah bayar kurang");
      return;
    }
    if (paymentMethod === "transfer" && !selectedBank) {
      toast.error("Pilih rekening bank tujuan");
      return;
    }
    if (paymentMethod === "gateway" && !selectedGateway) {
      toast.error("Pilih gateway pembayaran");
      return;
    }

    const isCash = paymentMethod === "cash";
    let paymentGateway: string | null = null;
    if (paymentMethod === "transfer") {
      paymentGateway = "bank_transfer";
    } else if (paymentMethod === "qris") {
      paymentGateway = "qris";
    } else if (paymentMethod === "gateway") {
      paymentGateway = selectedGateway;
    }

    setIsSubmitting(true);

    router.post(
      transactions.store.url(),
      {
        customer_id: customer?.id ?? null,
        payment_gateway: paymentGateway,
        cash: isCash ? amountPaid : 0,
        bank_account_id: paymentMethod === "transfer" ? selectedBank : null,
        pay_later: false,
        discount: 0,
        shipping_cost: 0,
        redeem_points: 0,
        customer_voucher_id: null,
      },
      {
        onSuccess: () => {
          toast.success("Transaksi berhasil!");
          setPaymentMethod(null);
          setAmountPaid(0);
          setSelectedBank(null);
          setSelectedGateway(null);
        },
        onError: () => toast.error("Transaksi gagal"),
        onFinish: () => setIsSubmitting(false),
      },
    );
  };

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <IconWallet size={40} className="mb-4 text-slate-300 dark:text-slate-600" />
        <p className="text-slate-500 text-sm dark:text-slate-400">
          Tambahkan produk terlebih dahulu
        </p>
      </div>
    );
  }

  const canSubmit =
    hasActiveShift &&
    paymentMethod &&
    (paymentMethod !== "cash" || !isShort) &&
    (paymentMethod !== "transfer" || selectedBank) &&
    (paymentMethod !== "gateway" || selectedGateway) &&
    !isSubmitting;

  return (
    <div className="flex h-full flex-col">
      <div className="border-slate-200 border-b p-4 dark:border-slate-800">
        <h2 className="font-semibold text-base text-slate-800 dark:text-white">Pembayaran</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {customer && (
          <div className="rounded-xl border border-primary-subtle bg-primary-subtle p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary text-xs">Pelanggan</p>
                <p className="font-medium text-primary text-sm">{customer.name}</p>
              </div>
              <button
                onClick={onRemoveCustomer}
                className="rounded-lg p-1.5 text-primary hover:bg-primary-subtle"
              >
                <IconX size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <div className="flex justify-between text-slate-600 text-sm dark:text-slate-400">
            <span>Total Barang</span>
            <span>{pricing.total_items} item</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600 text-sm dark:text-slate-400">Subtotal</span>
            <span className="font-semibold text-slate-700 text-sm dark:text-slate-300">
              {formatPrice(pricing.subtotal)}
            </span>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-center gap-1 py-1 text-slate-400 text-xs hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showDetails ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            {showDetails ? "Sembunyikan" : "Detail"} potongan & biaya
          </button>

          {showDetails && (
            <div className="space-y-1.5 pt-1">
              {pricing.promoDiscount > 0 && (
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Promo</span>
                  <span className="text-success">-{formatPrice(pricing.promoDiscount)}</span>
                </div>
              )}
              {pricing.voucherDiscount > 0 && (
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Voucher</span>
                  <span className="text-success">-{formatPrice(pricing.voucherDiscount)}</span>
                </div>
              )}
              {pricing.loyaltyDiscount > 0 && (
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Loyalti</span>
                  <span className="text-success">-{formatPrice(pricing.loyaltyDiscount)}</span>
                </div>
              )}
              {pricing.manualDiscount > 0 && (
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Diskon</span>
                  <span className="text-success">-{formatPrice(pricing.manualDiscount)}</span>
                </div>
              )}
              {pricing.shipping > 0 && (
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Ongkir</span>
                  <span>{formatPrice(pricing.shipping)}</span>
                </div>
              )}
            </div>
          )}

          <div className="border-slate-200 border-t pt-2 dark:border-slate-700">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-800 text-sm dark:text-slate-200">
                Total
              </span>
              <span className="font-bold text-lg text-primary">
                {formatPrice(pricing.grand_total)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-slate-500 text-xs uppercase tracking-wider dark:text-slate-400">
            Metode Pembayaran
          </p>
          <div className="grid grid-cols-2 gap-2">
            <PaymentMethodButton
              icon={<IconCash size={20} />}
              label="Tunai"
              isActive={paymentMethod === "cash"}
              onClick={() => handlePaymentMethod("cash")}
            />
            <PaymentMethodButton
              icon={<IconQrcode size={20} />}
              label="QRIS"
              isActive={paymentMethod === "qris"}
              onClick={() => handlePaymentMethod("qris")}
            />
            <PaymentMethodButton
              icon={<IconBuildingBank size={20} />}
              label="Transfer"
              isActive={paymentMethod === "transfer"}
              onClick={() => handlePaymentMethod("transfer")}
            />
            <PaymentMethodButton
              icon={<IconCreditCard size={20} />}
              label="Gateway"
              isActive={paymentMethod === "gateway"}
              onClick={() => handlePaymentMethod("gateway")}
            />
          </div>
        </div>

        {paymentMethod === "transfer" && bankAccounts.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium text-slate-500 text-xs uppercase tracking-wider dark:text-slate-400">
              Pilih Bank
            </p>
            <div className="grid grid-cols-2 gap-2">
              {bankAccounts.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank.id)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    selectedBank === bank.id
                      ? "border-primary bg-primary-subtle"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  <p className="font-medium text-slate-800 text-sm dark:text-slate-200">
                    {bank.bank_name}
                  </p>
                  <p className="text-slate-500 text-xs dark:text-slate-400">
                    {bank.account_number}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {paymentMethod === "gateway" && paymentGateways.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium text-slate-500 text-xs uppercase tracking-wider dark:text-slate-400">
              Pilih Gateway
            </p>
            <div className="grid grid-cols-2 gap-2">
              {paymentGateways.map((gw) => (
                <button
                  key={gw.value}
                  onClick={() => setSelectedGateway(gw.value)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    selectedGateway === gw.value
                      ? "border-primary bg-primary-subtle"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  <p className="font-medium text-slate-800 text-sm dark:text-slate-200">
                    {gw.label}
                  </p>
                  <p className="text-slate-500 text-xs dark:text-slate-400">
                    {gw.description || gw.value}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {paymentMethod === "cash" && amountPaid > 0 && (
          <div className="rounded-xl border border-success-subtle bg-success-subtle p-4">
            <div className="flex justify-between text-sm">
              <span className="text-success">Kembalian</span>
              <span className="font-bold text-lg text-success">{formatPrice(change)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-slate-200 border-t p-4 dark:border-slate-800">
        {!hasActiveShift && (
          <p className="mb-2 text-center text-danger text-xs">
            Buka shift kasir untuk memproses pembayaran
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-lg transition-all ${
            canSubmit
              ? "bg-primary text-primary-fg shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98]"
              : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700"
          }`}
        >
          {isSubmitting ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <IconCheck size={22} />
          )}
          {isSubmitting
            ? "Memproses..."
            : paymentMethod === "cash"
              ? `Bayar ${formatPrice(amountPaid || pricing.grand_total)}`
              : `Bayar ${formatPrice(pricing.grand_total)}`}
        </button>
      </div>
    </div>
  );
}

function PaymentMethodButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border-2 p-3 transition-all ${
        isActive
          ? "border-primary bg-primary-subtle text-primary"
          : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600"
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}
