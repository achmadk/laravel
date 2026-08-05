import { useState, useEffect, useRef } from "react";
import { IconSearch, IconX, IconBarcode } from "@tabler/icons-react";
import { imageUrl } from "@/lib/image-url";
import type { POSProduct } from "@/types/pos";

const formatPrice = (value = 0) =>
  Number(value || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

interface SearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  onSelect?: (product: POSProduct) => void;
  suggestions?: POSProduct[];
  isSearching?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  value = "",
  onChange,
  onSearch,
  onSelect,
  suggestions = [],
  isSearching = false,
  placeholder = "Cari produk atau scan barcode...",
  autoFocus = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const showSuggestions = isFocused && suggestions.length > 0 && value.length > 0;

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === "Enter") {
        onSearch?.();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onSelect?.(suggestions[selectedIndex]);
          setIsFocused(false);
          inputRef.current?.blur();
        } else {
          onSearch?.();
        }
        break;
      case "Escape":
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <div className="relative">
        <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
          {isSearching ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          ) : (
            <IconSearch size={20} className="text-slate-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white pr-24 pl-12 text-lg text-slate-800 placeholder-slate-400 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-primary-500"
        />

        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <IconX size={18} className="text-slate-400" />
            </button>
          )}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
            <IconBarcode size={18} className="text-slate-500 dark:text-slate-400" />
          </div>
        </div>
      </div>

      {showSuggestions && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-80 animate-slide-up overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <ul ref={listRef}>
            {suggestions.map((product, index) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect?.(product);
                    setIsFocused(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-primary-50 dark:bg-primary-950/30"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    {product.image ? (
                      <img
                        src={imageUrl(product.image) || ""}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <IconBarcode size={20} className="text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800 text-sm dark:text-slate-200">
                      {product.title}
                    </p>
                    <p className="text-slate-500 text-xs dark:text-slate-400">
                      {product.barcode} • Stok: {product.stock}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="font-semibold text-primary-600 text-sm dark:text-primary-400">
                      {formatPrice(product.sell_price)}
                    </p>
                    {product.stock <= 0 && (
                      <span className="font-medium text-danger-500 text-xs">Habis</span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
