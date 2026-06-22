import { imageUrl } from "@/lib/image-url";
import type { POSProduct, POSCategory } from "@/types/pos";

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

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-x-auto px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === null
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Semua
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {showSearchResultText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Hasil pencarian: "{searchQuery}" ({products.length} produk)
          </p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map((product) => {
              const isInCart = cartProductIds.includes(product.id);

              return (
                <button
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  disabled={product.stock <= 0}
                  className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                    isInCart
                      ? "border-primary-500 dark:border-primary-400 shadow-md shadow-primary-500/20"
                      : product.stock <= 0
                        ? "border-slate-200 dark:border-slate-700 opacity-60"
                        : "border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {isInCart && (
                    <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shadow-lg">
                      ✓
                    </div>
                  )}

                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {product.image ? (
                      <img
                        src={imageUrl(product.image) || ""}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-slate-300 dark:text-slate-600"
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
                      <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center">
                        <span className="px-3 py-1 bg-danger-500 text-white text-xs font-bold rounded-full">
                          HABIS
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 text-left flex-1 flex flex-col justify-between gap-1">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug">
                      {product.title}
                    </p>
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(product.sell_price)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <svg
                className="w-8 h-8 text-slate-400"
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {showSearchResultText ? "Produk tidak ditemukan" : "Tidak ada produk"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
