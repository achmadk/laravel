import { useEffect, useState } from "react";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { imageUrl } from "@/lib/image-url";
import type { POSProduct, POSCategory } from "@/types/pos";

const VIEW_STORAGE_KEY = "pos:product-view";

function loadViewMode(): "grid" | "table" {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === "table" ? "table" : "grid";
  } catch {
    return "grid";
  }
}

const formatPrice = (value = 0) =>
  Number(value || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

interface ProductGridProps {
  products?: POSProduct[];
  categories?: POSCategory[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  onProductClick: (product: POSProduct) => void;
  isLoading?: boolean;
  cartProductIds?: number[];
  searchQuery?: string;
}

export default function ProductGrid({
  products = [],
  categories = [],
  selectedCategory,
  onCategoryChange,
  onProductClick,
  isLoading = false,
  cartProductIds = [],
  searchQuery = "",
}: ProductGridProps) {
  const showSearchResultText = searchQuery.length > 0;
  // ponytail: default grid for SSR parity, apply the stored preference after mount
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    setViewMode(loadViewMode());
  }, []);

  function switchView(mode: "grid" | "table") {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      // ignore storage failures, view switch still applies for this session
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="overflow-x-auto border-slate-200 border-b px-4 py-3 dark:border-slate-800">
        <div className="flex min-w-max items-center gap-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={`whitespace-nowrap rounded-full px-4 py-2 font-medium text-sm transition-all ${
              selectedCategory === null
                ? "bg-primary text-primary-fg shadow-lg shadow-primary/30"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            Semua
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 font-medium text-sm transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-fg shadow-lg shadow-primary/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {cat.name}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1">
            <Button
              intent={viewMode === "grid" ? "primary" : "plain"}
              size="sq-sm"
              onPress={() => switchView("grid")}
              aria-label="Grid View"
            >
              <IconLayoutGrid size={20} />
            </Button>
            <Button
              intent={viewMode === "table" ? "primary" : "plain"}
              size="sq-sm"
              onPress={() => switchView("table")}
              aria-label="Table View"
            >
              <IconList size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {showSearchResultText && (
          <p className="mb-3 text-slate-500 text-xs dark:text-slate-400">
            Hasil pencarian: "{searchQuery}" ({products.length} produk)
          </p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Barcode</th>
                  <th className="px-4 py-3 font-semibold">Harga</th>
                  <th className="px-4 py-3 font-semibold">Modal</th>
                  <th className="px-4 py-3 font-semibold">Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                {products.map((product) => {
                  const isInCart = cartProductIds.includes(product.id);

                  return (
                    <tr
                      key={product.id}
                      onClick={() => {
                        if (product.stock <= 0) return;
                        onProductClick(product);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isInCart
                          ? "bg-primary/5"
                          : product.stock <= 0
                            ? "bg-slate-50 opacity-60 dark:bg-slate-800"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <td className="max-w-[200px] px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {isInCart && (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-fg text-[10px]">
                              ✓
                            </span>
                          )}
                          <span
                            className={`truncate font-medium text-slate-700 dark:text-slate-300 ${
                              product.stock <= 0 ? "line-through" : ""
                            }`}
                          >
                            {product.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono text-xs dark:text-slate-400">
                        {product.barcode || "-"}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-primary">
                        {formatPrice(product.sell_price)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                        {formatPrice(product.average_cost)}
                      </td>
                      <td className="px-4 py-2.5">
                        {product.stock <= 0 ? (
                          <span className="rounded-full bg-danger px-2 py-0.5 font-bold text-danger-fg text-xs">
                            HABIS
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400">
                            {product.stock}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => {
              const isInCart = cartProductIds.includes(product.id);

              return (
                <button
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  disabled={product.stock <= 0}
                  className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2 bg-white transition-all duration-200 dark:bg-slate-900 ${
                    isInCart
                      ? "border-primary shadow-md shadow-primary/20"
                      : product.stock <= 0
                        ? "border-slate-200 opacity-60 dark:border-slate-700"
                        : "border-slate-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg dark:border-slate-700"
                  }`}
                >
                  {isInCart && (
                    <div className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary font-bold text-primary-fg text-xs shadow-lg">
                      ✓
                    </div>
                  )}

                  <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {product.image ? (
                      <img
                        src={imageUrl(product.image) || ""}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg
                          className="h-10 w-10 text-slate-300 dark:text-slate-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                    )}

                    {product.stock <= 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
                        <span className="rounded-full bg-danger px-3 py-1 font-bold text-danger-fg text-xs">
                          HABIS
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-1 p-2.5 text-left">
                    <p className="line-clamp-2 font-medium text-slate-700 text-xs leading-snug dark:text-slate-300">
                      {product.title}
                    </p>
                    <p className="font-bold text-primary text-sm">
                      {formatPrice(product.sell_price)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg
                className="h-8 w-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-slate-500 text-sm dark:text-slate-400">
              {showSearchResultText ? "Produk tidak ditemukan" : "Tidak ada produk"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
