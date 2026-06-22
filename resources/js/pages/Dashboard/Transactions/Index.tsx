import { useState, useCallback, /* useRef, */ useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import POSLayout from "@/layouts/pos-layout";
import ProductGrid from "@/components/pos/ProductGrid";
import CartPanel from "@/components/pos/CartPanel";
import PaymentPanel from "@/components/pos/PaymentPanel";
import SearchBar from "@/components/pos/SearchBar";
import CustomerSelect from "@/components/pos/CustomerSelect";
import NumpadModal from "@/components/pos/NumpadModal";
import { HoldButton } from "@/components/pos/HeldTransactions";
import HeldTransactions from "@/components/pos/HeldTransactions";
// import { useAuthorization } from "@/lib/auth";

import type {
  POSProduct,
  POSCategory,
  POSCartItem,
  POSCustomer,
  HeldCart,
  BankAccount,
  PaymentGateway,
} from "@/types/pos";

// const formatPrice = (value = 0) =>
//   Number(value || 0).toLocaleString("id-ID", {
//     style: "currency",
//     currency: "IDR",
//     minimumFractionDigits: 0,
//   });

interface TransactionsPageProps {
  products?: POSProduct[];
  categories?: POSCategory[];
  cart?: POSCartItem[];
  customer?: POSCustomer | null;
  heldCarts?: HeldCart[];
  bankAccounts?: BankAccount[];
  paymentGateways?: PaymentGateway[];
  searchQuery?: string;
}

export default function TransactionsIndex(props: TransactionsPageProps) {
  const {
    products: initialProducts = [],
    categories = [],
    cart: initialCart = [],
    customer: initialCustomer = null,
    heldCarts = [],
    bankAccounts = [],
    paymentGateways = [],
    searchQuery: initialSearchQuery = "",
  } = props;

  // const { can } = useAuthorization();

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [products, setProducts] = useState(initialProducts);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<POSCartItem[]>(initialCart);
  const [customer, setCustomer] = useState<POSCustomer | null>(initialCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [isHolding, setIsHolding] = useState(false);

  const [numpadOpen, setNumpadOpen] = useState(false);
  const [numpadConfig, setNumpadConfig] = useState<{
    title: string;
    initialValue: number;
    onConfirm: (value: number) => void;
    minValue: number;
    maxValue: number;
    isCurrency?: boolean;
  } | null>(null);

  // const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCart(initialCart);
  }, [initialCart]);

  useEffect(() => {
    setCustomer(initialCustomer);
  }, [initialCustomer]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setProducts(initialProducts);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get("/apps/products/search", {
          params: { q: searchQuery },
        });
        setProducts(response.data.data || response.data || []);
      } catch {
        setProducts([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, initialProducts]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const response = await axios.get("/apps/products/search", {
        params: { q: searchQuery, exact: true },
      });
      const results = response.data.data || response.data || [];
      if (results.length === 1) {
        await handleAddToCart(results[0]);
        setSearchQuery("");
        toast.success(`${results[0].title} ditambahkan`);
      } else if (results.length > 1) {
        setProducts(results);
      } else {
        toast.error("Produk tidak ditemukan");
      }
    } catch {
      toast.error("Gagal mencari produk");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleAddToCart = useCallback(async (product: POSProduct) => {
    try {
      const response = await axios.post("/apps/cart/add", {
        product_id: product.id,
        qty: 1,
      });
      setCart(response.data.cart || response.data);
      toast.success(`${product.title} ditambahkan`);
    } catch {
      toast.error("Gagal menambahkan produk");
    }
  }, []);

  const handleUpdateQty = useCallback(async (cartId: number, newQty: number) => {
    try {
      const response = await axios.patch(`/apps/cart/${cartId}`, {
        qty: newQty,
      });
      setCart(response.data.cart || response.data);
    } catch {
      toast.error("Gagal mengubah jumlah");
    }
  }, []);

  const handleRemove = useCallback(async (cartId: number) => {
    setRemovingItemId(cartId);
    try {
      const response = await axios.delete(`/apps/cart/${cartId}`);
      setCart(response.data.cart || response.data);
    } catch {
      toast.error("Gagal menghapus item");
    } finally {
      setRemovingItemId(null);
    }
  }, []);

  const handleHold = useCallback(async (label: string | null) => {
    setIsHolding(true);
    try {
      await axios.post("/apps/transactions/hold", {
        label: label || undefined,
      });
      setCart([]);
      toast.success("Transaksi ditahan");
    } catch {
      toast.error("Gagal menahan transaksi");
    } finally {
      setIsHolding(false);
    }
  }, []);

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

  const handleCategoryChange = useCallback(
    async (categoryId: number | null) => {
      setSelectedCategory(categoryId);
      try {
        const response = await axios.get("/apps/products", {
          params: { category_id: categoryId },
        });
        setProducts(response.data.data || response.data || []);
      } catch {
        if (categoryId === null) {
          setProducts(initialProducts);
        } else {
          setProducts(initialProducts.filter((p) => p.category_id === categoryId));
        }
      }
    },
    [initialProducts],
  );

  return (
    <POSLayout>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 pb-0">
            <SearchBar
              value={searchQuery}
              onChange={(v) => setSearchQuery(v)}
              onSearch={handleSearch}
              onSelect={async (product) => {
                await handleAddToCart(product);
                setSearchQuery("");
              }}
              suggestions={products.slice(0, 8)}
              isSearching={isSearching}
              autoFocus
            />
          </div>

          <HeldTransactions heldCarts={heldCarts} hasActiveCart={cart.length > 0} />

          <ProductGrid
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onProductClick={async (product) => {
              await handleAddToCart(product);
            }}
            cartProductIds={cart.map((item) => item.product?.id).filter(Boolean) as number[]}
            searchQuery={searchQuery}
          />
        </div>

        <div className="w-px bg-border" />

        <div className="w-[400px] flex flex-col flex-shrink-0 bg-bg">
          <CustomerSelect
            customer={customer}
            onSelect={async (c) => {
              setCustomer(c);
              if (c) {
                await axios.post("/apps/transactions/select-customer", {
                  customer_id: c.id,
                });
              } else {
                await axios.post("/apps/transactions/select-customer", {
                  customer_id: null,
                });
              }
            }}
          />

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-hidden">
              <CartPanel
                items={cart}
                onUpdateQty={handleUpdateQty}
                onRemove={handleRemove}
                removingItemId={removingItemId}
              />
            </div>

            {cart.length > 0 && (
              <div className="px-4 py-2 border-t border-border">
                <HoldButton hasItems={cart.length > 0} onHold={handleHold} isHolding={isHolding} />
              </div>
            )}
          </div>

          <div className="border-t border-border" />

          <div className="h-[420px] overflow-y-auto">
            <PaymentPanel
              items={cart}
              customer={customer}
              onOpenNumpad={handleOpenNumpad}
              onRemoveCustomer={async () => {
                setCustomer(null);
                await axios.post("/apps/transactions/select-customer", {
                  customer_id: null,
                });
              }}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              bankAccounts={bankAccounts}
              paymentGateways={paymentGateways}
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
