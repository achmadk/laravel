import { useState, useMemo } from "react";
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
import type { POSCartItem, POSCustomer, BankAccount, PaymentGateway } from "@/types/pos";

const formatPrice = (value = 0) =>
  Number(value || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

interface PaymentPanelProps {
  items: POSCartItem[];
  customer: POSCustomer | null;
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
}

export default function PaymentPanel({
  items,
  customer,
  onOpenNumpad,
  onRemoveCustomer,
  isSubmitting,
  setIsSubmitting,
  bankAccounts = [],
  paymentGateways = [],
}: PaymentPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "qris" | "transfer" | "gateway" | null
  >(null);
  const [amountPaid, setAmountPaid] = useState(0);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const pricing = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const totalItems = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);

    return {
      subtotal,
      discount: 0,
      tax: 0,
      service_charge: 0,
      grand_total: subtotal,
      total_items: totalItems,
    };
  }, [items]);

  const change = Math.max(0, amountPaid - pricing.grand_total);
  const isShort = amountPaid < pricing.grand_total;

  const handlePaymentMethod = (method: "cash" | "qris" | "transfer" | "gateway") => {
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
    } else if (method === "qris") {
      setAmountPaid(pricing.grand_total);
    } else if (method === "transfer") {
      setAmountPaid(pricing.grand_total);
    } else if (method === "gateway") {
      setAmountPaid(pricing.grand_total);
    }
  };

  const handleSubmit = () => {
    if (!paymentMethod || items.length === 0) return;
    if (paymentMethod === "cash" && isShort) {
      toast.error("Jumlah bayar kurang");
      return;
    }

    setIsSubmitting(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      items: items.map((item) => ({
        product_id: item.product?.id || item.id,
        qty: item.qty,
        price: item.price,
      })),
      payment_method: paymentMethod,
      amount_paid: paymentMethod === "cash" ? amountPaid : pricing.grand_total,
      customer_id: customer?.id || null,
    };

    if (paymentMethod === "gateway" && selectedGateway) {
      payload.payment_gateway = selectedGateway;
    }
    if (paymentMethod === "transfer" && selectedBank) {
      payload.bank_account = selectedBank;
    }

    router.post("/apps/transactions", payload, {
      preserveScroll: true,
      onSuccess: (page) => {
        toast.success("Transaksi berhasil!");
        setIsSubmitting(false);
        const flash = (page.props as Record<string, unknown>).flash as
          | Record<string, unknown>
          | undefined;
        const receipt = flash?.receipt_url as string | undefined;
        if (receipt) {
          window.open(receipt, "_blank");
        }
      },
      onError: () => {
        toast.error("Transaksi gagal");
        setIsSubmitting(false);
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <IconWallet size={40} className="text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tambahkan produk terlebih dahulu
        </p>
      </div>
    );
  }

  const canSubmit =
    paymentMethod &&
    (paymentMethod !== "cash" || !isShort) &&
    (paymentMethod !== "transfer" || selectedBank) &&
    (paymentMethod !== "gateway" || selectedGateway) &&
    !isSubmitting;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white">Pembayaran</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {customer && (
          <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-primary-600 dark:text-primary-400">Pelanggan</p>
                <p className="text-sm font-medium text-primary-800 dark:text-primary-200">
                  {customer.name}
                </p>
              </div>
              <button
                onClick={onRemoveCustomer}
                className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-500"
              >
                <IconX size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Total Barang</span>
            <span>{pricing.total_items} item</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Subtotal</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {formatPrice(pricing.subtotal)}
            </span>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-1"
          >
            {showDetails ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            {showDetails ? "Sembunyikan" : "Detail"} potongan & biaya
          </button>

          {showDetails && (
            <div className="space-y-1.5 pt-1">
              {pricing.discount > 0 && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Diskon</span>
                  <span className="text-success-600">-{formatPrice(pricing.discount)}</span>
                </div>
              )}
              {pricing.tax > 0 && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Pajak</span>
                  <span>{formatPrice(pricing.tax)}</span>
                </div>
              )}
              {pricing.service_charge > 0 && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Biaya Layanan</span>
                  <span>{formatPrice(pricing.service_charge)}</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Total
              </span>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {formatPrice(pricing.grand_total)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
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
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pilih Bank
            </p>
            <div className="grid grid-cols-2 gap-2">
              {bankAccounts.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedBank === bank.id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {bank.bank_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {bank.account_number}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {paymentMethod === "gateway" && paymentGateways.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pilih Gateway
            </p>
            <div className="grid grid-cols-2 gap-2">
              {paymentGateways.map((gw) => (
                <button
                  key={gw.value}
                  onClick={() => setSelectedGateway(gw.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedGateway === gw.value
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {gw.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {gw.description || gw.value}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {paymentMethod === "cash" && amountPaid > 0 && (
          <div className="p-4 rounded-xl bg-success-50 dark:bg-success-950/30 border border-success-200 dark:border-success-800/50">
            <div className="flex justify-between text-sm">
              <span className="text-success-700 dark:text-success-300">Kembalian</span>
              <span className="text-lg font-bold text-success-600 dark:text-success-400">
                {formatPrice(change)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full h-14 flex items-center justify-center gap-2 text-lg font-semibold rounded-2xl transition-all ${
            canSubmit
              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl active:scale-[0.98]"
              : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
        isActive
          ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300"
          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
