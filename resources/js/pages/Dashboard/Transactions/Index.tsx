import { useState, useCallback, useMemo, useEffect } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import toast from "react-hot-toast";

import transactions from "@/routes/transactions";
import POSLayout from "@/layouts/pos-layout";
import ProductGrid from "@/components/pos/ProductGrid";
import CartPanel from "@/components/pos/CartPanel";
import PaymentPanel from "@/components/pos/PaymentPanel";
import SearchBar from "@/components/pos/SearchBar";
import CustomerSelect from "@/components/pos/CustomerSelect";
import NumpadModal from "@/components/pos/NumpadModal";
import { HoldButton } from "@/components/pos/HeldTransactions";
import HeldTransactions from "@/components/pos/HeldTransactions";

import type {
  POSProduct,
  POSCategory,
  POSCartItem,
  POSCustomer,
  HeldCart,
  BankAccount,
  PaymentGateway,
  PricingPreview,
} from "@/types/pos";

interface ShiftSummary {
  id: number;
  status: string;
  [key: string]: unknown;
}

interface TransactionsPageProps {
  products?: POSProduct[];
  categories?: POSCategory[];
  carts?: POSCartItem[];
  carts_total?: number;
  heldCarts?: HeldCart[];
  bankAccounts?: BankAccount[];
  paymentGateways?: PaymentGateway[];
  initialPricingPreview?: PricingPreview | null;
  shiftSummary?: ShiftSummary | null;
}

export default function TransactionsIndex(props: TransactionsPageProps) {
  const {
    products: initialProducts = [],
    categories = [],
    carts = [],
    bankAccounts = [],
    paymentGateways = [],
    initialPricingPreview = null,
    shiftSummary = null,
  } = props;

  const hasActiveShift = Boolean(shiftSummary && shiftSummary.status === "open");

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [customer, setCustomer] = useState<POSCustomer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(
    initialPricingPreview,
  );

  const [numpadOpen, setNumpadOpen] = useState(false);
  const [numpadConfig, setNumpadConfig] = useState<{
    title: string;
    initialValue: number;
    onConfirm: (value: number) => void;
    minValue: number;
    maxValue: number;
    isCurrency?: boolean;
  } | null>(null);

  // Keep the product grid in sync with server-provided products (e.g. after a
  // stock change) while no client-side search is active.
  useEffect(() => {
    if (!searchQuery) {
      setProducts(initialProducts);
    }
  }, [initialProducts, searchQuery]);

  // A stable signature of the cart contents so pricing refreshes only when the
  // cart actually changes.
  const cartSignature = useMemo(
    () => carts.map((item) => `${item.id}:${item.qty}`).join("|"),
    [carts],
  );

  const refreshPricing = useCallback(
    async (customerId: number | null) => {
      if (carts.length === 0) {
        setPricingPreview(initialPricingPreview);
        return;
      }

      try {
        const response = await axios.post(transactions.pricingPreview.url(), {
          customer_id: customerId,
        });
        if (response.data?.success && response.data.data) {
          setPricingPreview(response.data.data);
        }
      } catch {
        // Keep the last known preview on failure.
      }
    },
    [carts.length, initialPricingPreview],
  );

  // Refresh the server pricing preview whenever the cart or selected customer
  // changes so displayed totals match what checkout will charge.
  useEffect(() => {
    void refreshPricing(customer?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSignature, customer?.id]);

  const guardShift = useCallback((): boolean => {
    if (!hasActiveShift) {
      toast.error("Buka shift kasir terlebih dahulu");
      return false;
    }
    return true;
  }, [hasActiveShift]);

  const handleAddToCart = useCallback(
    async (product: POSProduct) => {
      if (!guardShift()) return;

      router.post(
        transactions.addToCart.url(),
        {
          product_id: product.id,
          sell_price: product.sell_price,
          qty: 1,
        },
        {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => toast.success(`${product.title} ditambahkan`),
          onError: () => toast.error("Gagal menambahkan produk"),
        },
      );
    },
    [guardShift],
  );

  const handleSearch = useCallback(async () => {
    if (!searchQuery) return;
    if (!guardShift()) return;

    setIsSearching(true);
    try {
      const response = await axios.post(transactions.searchProduct.url(), {
        barcode: searchQuery,
      });
      const product = response.data.success ? response.data.data : null;
      if (product) {
        await handleAddToCart(product);
        setSearchQuery("");
      } else {
        toast.error("Produk tidak ditemukan");
      }
    } catch {
      toast.error("Gagal mencari produk");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, guardShift, handleAddToCart]);

  const handleUpdateQty = useCallback((cartId: number, newQty: number) => {
    if (newQty < 1) return;

    router.patch(
      transactions.updateCart.url(cartId),
      { qty: newQty },
      {
        preserveScroll: true,
        preserveState: true,
        onError: (errors) =>
          toast.error((errors as Record<string, string>)?.message || "Gagal mengubah jumlah"),
      },
    );
  }, []);

  const handleRemove = useCallback((cartId: number) => {
    setRemovingItemId(cartId);
    router.delete(transactions.destroyCart.url(cartId), {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => toast.success("Item dihapus"),
      onError: () => toast.error("Gagal menghapus item"),
      onFinish: () => setRemovingItemId(null),
    });
  }, []);

  const handleHold = useCallback(
    (label: string | null) => {
      if (carts.length === 0) {
        toast.error("Keranjang kosong");
        return;
      }

      setIsHolding(true);
      router.post(
        transactions.hold.url(),
        { label: label || undefined },
        {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => toast.success("Transaksi ditahan"),
          onError: () => toast.error("Gagal menahan transaksi"),
          onFinish: () => setIsHolding(false),
        },
      );
    },
    [carts.length],
  );

  const handleOpenNumpad = useCallback(
    (config: {
      title: string;
      initialValue: number;
      onConfirm: (value: number) => void;
      minValue: number;
      maxValue: number;
      isCurrency?: boolean;
    }) => {
      setNumpadConfig(config);
      setNumpadOpen(true);
    },
    [],
  );

  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setSelectedCategory(categoryId);
  }, []);

  // Product grid is filtered entirely on the client from the products prop; no
  // JSON products API exists.
  const visibleProducts = useMemo(() => {
    if (searchQuery) {
      return products;
    }
    if (selectedCategory === null) {
      return products;
    }
    return products.filter((p) => Number(p.category_id) === selectedCategory);
  }, [products, selectedCategory, searchQuery]);

  return (
    <POSLayout>
      <div className="flex h-full">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="p-4 pb-0">
            <SearchBar
              value={searchQuery}
              onChange={(v) => setSearchQuery(v)}
              onSearch={handleSearch}
              onSelect={async (product) => {
                await handleAddToCart(product);
                setSearchQuery("");
              }}
              suggestions={visibleProducts.slice(0, 8)}
              isSearching={isSearching}
              autoFocus
            />
          </div>

          <HeldTransactions heldCarts={props.heldCarts ?? []} hasActiveCart={carts.length > 0} />

          <ProductGrid
            products={visibleProducts}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onProductClick={handleAddToCart}
            cartProductIds={carts.map((item) => item.product?.id).filter(Boolean) as number[]}
            searchQuery={searchQuery}
          />
        </div>

        <div className="w-px bg-border" />

        <div className="flex w-[400px] flex-shrink-0 flex-col bg-bg">
          <CustomerSelect customer={customer} onSelect={setCustomer} />

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-hidden">
              <CartPanel
                items={carts}
                onUpdateQty={handleUpdateQty}
                onRemove={handleRemove}
                removingItemId={removingItemId}
              />
            </div>

            {carts.length > 0 && (
              <div className="border-border border-t px-4 py-2">
                <HoldButton hasItems={carts.length > 0} onHold={handleHold} isHolding={isHolding} />
              </div>
            )}
          </div>

          <div className="border-border border-t" />

          <div className="h-[420px] overflow-y-auto">
            <PaymentPanel
              items={carts}
              customer={customer}
              pricingPreview={pricingPreview}
              onOpenNumpad={handleOpenNumpad}
              onRemoveCustomer={() => setCustomer(null)}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              bankAccounts={bankAccounts}
              paymentGateways={paymentGateways}
              hasActiveShift={hasActiveShift}
            />
          </div>
        </div>
      </div>

      {numpadConfig && (
        <NumpadModal
          isOpen={numpadOpen}
          onClose={() => setNumpadOpen(false)}
          onConfirm={(value) => {
            numpadConfig.onConfirm(value);
          }}
          title={numpadConfig.title}
          initialValue={numpadConfig.initialValue}
          minValue={numpadConfig.minValue}
          maxValue={numpadConfig.maxValue}
          isCurrency={numpadConfig.isCurrency}
        />
      )}
    </POSLayout>
  );
}
