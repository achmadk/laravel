import { IconTrash, IconMinus, IconPlus, IconShoppingCart } from "@tabler/icons-react";
import { imageUrl } from "@/lib/image-url";

const formatPrice = (value = 0) =>
  Number(value || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

interface CartItemProduct {
  id: number;
  title: string;
  image: string | null;
  sell_price: number;
}

interface CartItem {
  id: number;
  qty: number;
  price: number;
  product?: CartItemProduct | null;
}

interface CartPanelProps {
  items?: CartItem[];
  onUpdateQty: (cartId: number, newQty: number) => void;
  onRemove: (cartId: number) => void;
  removingItemId?: number | null;
  className?: string;
}

function CartItemComponent({
  item,
  onUpdateQty,
  onRemove,
  isRemoving,
}: {
  item: CartItem;
  onUpdateQty: (cartId: number, newQty: number) => void;
  onRemove: (cartId: number) => void;
  isRemoving: boolean;
}) {
  const quantity = Number(item?.qty ?? 0);
  const itemPrice = Number(item?.price ?? 0);
  const unitPrice = Number(item?.product?.sell_price ?? 0) || itemPrice / quantity || 0;
  const subtotal = itemPrice;

  return (
    <div
      className={`group flex animate-slide-up gap-3 rounded-xl border border-transparent bg-slate-50 p-3 transition-all duration-200 hover:border-slate-200 dark:bg-slate-800/50 dark:hover:border-slate-700 ${isRemoving ? "scale-95 opacity-50" : ""}`}
    >
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
        {item.product?.image ? (
          <img
            src={imageUrl(item.product.image) || ""}
            alt={item.product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <IconShoppingCart size={20} className="text-slate-400" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-slate-800 text-sm dark:text-slate-200">
          {item.product?.title || "Produk"}
        </h4>
        <p className="mt-0.5 text-slate-500 text-xs dark:text-slate-400">
          {formatPrice(unitPrice)} × {item.qty}
        </p>
        <p className="mt-1 font-semibold text-primary text-sm">{formatPrice(subtotal)}</p>
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove(item.id)}
          disabled={isRemoving}
          className="cursor-pointer rounded-lg p-1.5 text-slate-400 opacity-0 transition-colors hover:bg-danger-subtle hover:text-danger group-hover:opacity-100"
        >
          <IconTrash size={16} />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
            disabled={item.qty <= 1}
            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            <IconMinus size={14} />
          </button>
          <span className="w-8 text-center font-medium text-slate-700 text-sm dark:text-slate-300">
            {item.qty}
          </span>
          <button
            onClick={() => onUpdateQty(item.id, item.qty + 1)}
            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            <IconPlus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <IconShoppingCart size={32} className="text-slate-400 dark:text-slate-600" />
      </div>
      <h3 className="font-medium text-base text-slate-600 dark:text-slate-400">Keranjang Kosong</h3>
      <p className="mt-1 text-slate-400 text-sm dark:text-slate-500">
        Klik produk untuk menambahkan
      </p>
    </div>
  );
}

export default function CartPanel({
  items = [],
  onUpdateQty,
  onRemove,
  removingItemId,
  className = "",
}: CartPanelProps) {
  const totalItems = items.reduce((sum, item) => sum + Number(item?.qty ?? 0), 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item?.price ?? 0), 0);

  return (
    <div className={`flex h-full flex-col ${className}`}>
      <div className="flex items-center justify-between border-slate-200 border-b p-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <IconShoppingCart size={20} className="text-slate-600 dark:text-slate-400" />
          <h2 className="font-semibold text-base text-slate-800 dark:text-white">Keranjang</h2>
        </div>
        {totalItems > 0 && (
          <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 font-bold text-primary text-xs">
            {totalItems} item
          </span>
        )}
      </div>

      {items.length > 0 ? (
        <div
          className="flex-1 space-y-2 overflow-y-auto p-3"
          style={{ maxHeight: "300px", minHeight: "150px" }}
        >
          {items.map((item) => (
            <CartItemComponent
              key={item.id}
              item={item}
              onUpdateQty={onUpdateQty}
              onRemove={onRemove}
              isRemoving={removingItemId === item.id}
            />
          ))}
        </div>
      ) : (
        <EmptyCart />
      )}

      {items.length > 0 && (
        <div className="border-slate-200 border-t bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 text-sm dark:text-slate-400">Subtotal</span>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

CartPanel.Item = CartItemComponent;
CartPanel.Empty = EmptyCart;
