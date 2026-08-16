import SimpleBarcode from "./SimpleBarcode";

const line58 = "----------------------------";

const formatPrice = (price = 0) =>
  "Rp " + Number(price || 0).toLocaleString("id-ID");

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

interface ThermalItem {
  id: number;
  qty: number;
  price: number;
  unit_price?: number;
  discount_total?: number;
  product?: { title: string; barcode?: string | null } | null;
}

interface ThermalTransaction {
  invoice: string;
  created_at: string;
  grand_total: number;
  discount: number;
  shipping_cost: number;
  tax_rate: number;
  tax_total: number;
  loyalty_discount_total?: number;
  customer_voucher_discount?: number;
  cash: number;
  change: number;
  payment_method: string;
  cashier?: { name?: string } | null;
  customer?: { name?: string } | null;
  details?: ThermalItem[];
}

interface ThermalReceipt58mmProps {
  transaction: ThermalTransaction;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  storeWebsite?: string;
}

export default function ThermalReceipt58mm({
  transaction,
  storeName = "TOKO ANDA",
  storeAddress = "",
  storePhone = "",
}: ThermalReceipt58mmProps) {
  const items = transaction?.details ?? [];
  const promoDiscount = items.reduce(
    (sum, item) => sum + Number(item.discount_total || 0),
    0,
  );
  const loyaltyDiscount = Number(transaction?.loyalty_discount_total || 0);
  const voucherDiscount = Number(transaction?.customer_voucher_discount || 0);

  const subtotal =
    (transaction?.grand_total || 0) +
    (transaction?.discount || 0) -
    (transaction?.shipping_cost || 0) -
    (transaction?.tax_total || 0) +
    promoDiscount +
    loyaltyDiscount +
    voucherDiscount;
  const discount = Number(transaction?.discount || 0);
  const shipping = Number(transaction?.shipping_cost || 0);
  const tax = Number(transaction?.tax_total || 0);
  const taxRate = Number(transaction?.tax_rate || 0);
  const total = Number(transaction?.grand_total || 0);
  const cash = Number(transaction?.cash || 0);
  const change = Number(transaction?.change || 0);
  const paymentMethod = String(transaction?.payment_method || "cash").toUpperCase();

  return (
    <div
      className="font-mono text-[11px] leading-tight text-black"
      style={{ width: "58mm", padding: "2mm" }}
    >
      <style>
        {`
          @media print {
            .thermal-receipt { width: 58mm !important; padding: 0; margin: 0; }
          }
          @page { size: 58mm auto; margin: 0; }
        `}
      </style>
      {/* Store Header */}
      <div className="mb-2 text-center">
        <p className="text-xs font-bold">{storeName}</p>
        {storeAddress && <p className="text-[10px]">{storeAddress}</p>}
        {storePhone && <p className="text-[10px]">Telp: {storePhone}</p>}
      </div>

      <pre className="whitespace-pre-wrap">{line58}</pre>

      {/* Invoice Info */}
      <div className="my-1">
        <div className="flex justify-between">
          <span>No:</span>
          <span>{transaction?.invoice}</span>
        </div>
        <div className="flex justify-between">
          <span>Tgl:</span>
          <span>{formatDate(transaction?.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          <span>{transaction?.cashier?.name || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span>Pelanggan:</span>
          <span>{transaction?.customer?.name || "Umum"}</span>
        </div>
      </div>

      <pre className="whitespace-pre-wrap">{line58}</pre>

      {/* Items */}
      <div className="my-1">
        {items.map((item) => (
          <div key={item.id}>
            <p>{item.product?.title || "Produk"}</p>
            <div className="flex justify-between">
              <span className="whitespace-pre">
                {item.qty} x{" "}
                {formatPrice(
                  Number(item.unit_price || 0) ||
                    Number(item.price || 0) / Number(item.qty || 1),
                )}
              </span>
              <span>{formatPrice(item.price)}</span>
            </div>
          </div>
        ))}
      </div>

      <pre className="whitespace-pre-wrap">{line58}</pre>

      {/* Totals */}
      <div className="my-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="flex justify-between">
            <span>Promo</span>
            <span>-{formatPrice(promoDiscount)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between">
            <span>Diskon</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        {voucherDiscount > 0 && (
          <div className="flex justify-between">
            <span>Voucher</span>
            <span>-{formatPrice(voucherDiscount)}</span>
          </div>
        )}
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between">
            <span>Loyalty</span>
            <span>-{formatPrice(loyaltyDiscount)}</span>
          </div>
        )}
        {shipping > 0 && (
          <div className="flex justify-between">
            <span>Ongkir</span>
            <span>{formatPrice(shipping)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between">
            <span>PPN {taxRate}%</span>
            <span>{formatPrice(tax)}</span>
          </div>
        )}
      </div>

      <pre className="whitespace-pre-wrap">{line58}</pre>

      {/* Grand Total */}
      <div className="my-1">
        <div className="flex justify-between text-xs font-bold">
          <span>TOTAL</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Bayar ({paymentMethod})</span>
          <span>{formatPrice(cash)}</span>
        </div>
        {change > 0 && (
          <div className="flex justify-between">
            <span>Kembali</span>
            <span>{formatPrice(change)}</span>
          </div>
        )}
      </div>

      {/* Barcode */}
      <SimpleBarcode value={transaction?.invoice} />

      {/* Footer */}
      <div className="mt-3 text-center">
        <p>Terima kasih</p>
        <p>Barang yang sudah dibeli tidak</p>
        <p>dapat ditukar/dikembalikan</p>
      </div>
    </div>
  );
}