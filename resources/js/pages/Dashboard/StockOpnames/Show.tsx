import { useEffect, useMemo, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import {
  IconArrowLeft,
  IconCheck,
  IconDeviceFloppy,
  IconClipboardCheck,
  IconPackage,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import stockOpnames from "@/routes/stock-opnames";
import toast from "react-hot-toast";

interface Product {
  id: number;
  title: string;
  category?: { id: number; name: string };
  barcode?: string;
  sku?: string;
  stock: number;
}

interface StockOpnameItem {
  id: number;
  product: Product;
  system_stock: number;
  physical_stock: number | null;
  difference: number | string;
  adjustment_reason: string;
}

interface User {
  id: number;
  name: string;
}

interface StockOpname {
  id: number;
  code: string;
  status: "draft" | "finalized";
  creator: User | null;
  finalizer: User | null;
  notes: string | null;
  created_at: string;
  finalized_at: string | null;
  items: StockOpnameItem[];
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "success" | "warning";
}) {
  const toneClasses = {
    default: "border-border bg-bg text-fg",
    success: "border-success/30 bg-success/5 text-success",
    warning: "border-warning/30 bg-warning/5 text-warning",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function Show({
  stockOpname,
  availableProducts,
  productFilters,
}: {
  stockOpname: StockOpname;
  availableProducts: Product[];
  productFilters: { search: string };
}) {
  const { can } = useAuthorization();
  const canEditStockOpname = can("stock-opnames-create");
  const canFinalizeStockOpname = can("stock-opnames-finalize");
  const isDraft = stockOpname.status === "draft";
  const canManageDraft = isDraft && canEditStockOpname;

  const [localItems, setLocalItems] = useState<StockOpnameItem[]>(stockOpname.items);
  const [savingItemId, setSavingItemId] = useState<number | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearchInput, setProductSearchInput] = useState(productFilters.search || "");

  const notesForm = useForm({
    notes: stockOpname.notes || "",
  });

  useEffect(() => {
    setLocalItems(stockOpname.items);
    notesForm.setData("notes", stockOpname.notes || "");
  }, [stockOpname.items, stockOpname.notes]);

  useEffect(() => {
    setProductSearchInput(productFilters.search || "");
  }, [productFilters.search]);

  const filters = useMemo(
    () => ({ product_search: productFilters.search || "" }),
    [productFilters],
  );

  const isWaitingSearch =
    showProductModal && productSearchInput.trim() !== (filters.product_search || "").trim();

  const summary = useMemo(() => {
    const totalItems = localItems.length;
    const countedItems = localItems.filter(
      (item) => item.physical_stock !== null && item.physical_stock !== ("" as unknown),
    );
    const matchedItems = countedItems.filter((item) => Number(item.difference || 0) === 0);
    const differentItems = countedItems.filter((item) => Number(item.difference || 0) !== 0);
    const totalAdjustment = countedItems.reduce(
      (carry, item) => carry + Number(item.difference || 0),
      0,
    );

    return {
      totalItems,
      matchedItems: matchedItems.length,
      differentItems: differentItems.length,
      totalAdjustment,
      hasMissingReasons: differentItems.some((item) => !item.adjustment_reason),
    };
  }, [localItems]);

  useEffect(() => {
    if (!showProductModal) return;
    const timeoutId = setTimeout(() => {
      if (productSearchInput === (filters.product_search || "")) return;
      updateFilter("product_search", productSearchInput);
    }, 1200);
    return () => clearTimeout(timeoutId);
  }, [productSearchInput, showProductModal, filters.product_search]);

  function updateFilter(key: string, value: string) {
    router.get(
      stockOpnames.show.url({ stockOpname: stockOpname.id }, { query: { [key]: value } }),
      {},
      { preserveState: true, preserveScroll: true, replace: true },
    );
  }

  function saveNotes(event: React.FormEvent) {
    event.preventDefault();
    notesForm.patch(stockOpnames.update.url({ stockOpname: stockOpname.id }), {
      preserveScroll: true,
      onSuccess: () => toast.success("Catatan sesi diperbarui"),
      onError: () => toast.error("Gagal memperbarui catatan sesi"),
    });
  }

  function addProduct(productId: number) {
    router.post(
      stockOpnames.items.store.url({ stockOpname: stockOpname.id }),
      { product_id: productId },
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowProductModal(false);
          toast.success("Produk ditambahkan ke sesi");
        },
        onError: () => toast.error("Gagal menambahkan produk"),
      },
    );
  }

  function setItemField(
    itemId: number,
    key: "physical_stock" | "adjustment_reason",
    value: string,
  ) {
    setLocalItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId) return item;

        const nextPhysicalStock =
          key === "physical_stock" ? (value === "" ? null : Number(value)) : item.physical_stock;
        const nextDifference =
          nextPhysicalStock === null ? null : nextPhysicalStock - Number(item.system_stock);

        return {
          ...item,
          [key]: value,
          physical_stock: nextPhysicalStock,
          difference: nextDifference ?? 0,
          adjustment_reason:
            nextDifference === 0
              ? ""
              : key === "adjustment_reason"
                ? value
                : item.adjustment_reason,
        };
      }),
    );
  }

  function persistItem(item: StockOpnameItem) {
    if (!canManageDraft) return;
    setSavingItemId(item.id);

    router.patch(
      stockOpnames.items.update.url({ stockOpname: stockOpname.id, item: item.id }),
      {
        physical_stock: item.physical_stock === ("" as unknown) ? null : item.physical_stock,
        adjustment_reason: item.adjustment_reason || "",
      },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Item opname diperbarui"),
        onError: () => toast.error("Gagal memperbarui item opname"),
        onFinish: () => setSavingItemId(null),
      },
    );
  }

  function finalize() {
    router.post(
      stockOpnames.finalize.url({ stockOpname: stockOpname.id }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Stock opname difinalisasi"),
        onError: () => toast.error("Gagal finalize. Periksa item yang belum valid."),
      },
    );
  }

  return (
    <>
      <Head title={stockOpname.code} />

      <div className="mb-6">
        <Link
          href={stockOpnames.index.url()}
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-fg hover:text-primary"
        >
          <IconArrowLeft size={16} />
          Kembali ke daftar stock opname
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h1 className="text-2xl font-bold text-fg">{stockOpname.code}</h1>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isDraft ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                }`}
              >
                {isDraft ? "Draft" : "Finalized"}
              </span>
            </div>
            <p className="text-sm text-muted-fg">
              Dibuat oleh {stockOpname.creator?.name || "-"} &bull;{" "}
              {formatDateTime(stockOpname.created_at)}
            </p>
            {!isDraft && (
              <p className="mt-1 text-sm text-muted-fg">
                Difinalisasi oleh {stockOpname.finalizer?.name || "-"} &bull;{" "}
                {formatDateTime(stockOpname.finalized_at)}
              </p>
            )}
          </div>

          {isDraft && canFinalizeStockOpname && (
            <button
              type="button"
              onClick={finalize}
              disabled={localItems.length === 0 || summary.hasMissingReasons}
              className="inline-flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-success/20 transition-colors hover:bg-success/90 disabled:opacity-50"
            >
              <IconCheck size={18} />
              Finalize Stock Opname
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Item" value={summary.totalItems} />
        <SummaryCard label="Item Sesuai" value={summary.matchedItems} tone="success" />
        <SummaryCard label="Item Selisih" value={summary.differentItems} tone="warning" />
        <SummaryCard
          label="Total Adjustment"
          value={
            summary.totalAdjustment > 0 ? `+${summary.totalAdjustment}` : summary.totalAdjustment
          }
          tone={summary.totalAdjustment === 0 ? "default" : "warning"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-bg p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg">Item Stock Opname</h2>
              {canManageDraft && (
                <button
                  type="button"
                  onClick={() => setShowProductModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  <IconPlus size={18} />
                  Tambah Produk
                </button>
              )}
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-fg">Produk</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-fg">Stok Sistem</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-fg">Stok Fisik</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-fg">Selisih</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-fg">Alasan</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-fg w-24">Simpan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {localItems.length > 0 ? (
                    localItems.map((item) => {
                      const difference = Number(item.difference || 0);
                      const isDifferent = item.physical_stock !== null && difference !== 0;

                      return (
                        <tr key={item.id} className="transition-colors hover:bg-muted">
                          <td className="px-4 py-4 align-middle">
                            <p className="font-medium text-fg">{item.product.title}</p>
                            <p className="text-xs text-muted-fg">
                              {item.product.category?.name || "-"} &bull;{" "}
                              {item.product.barcode || item.product.sku || "-"}
                            </p>
                          </td>
                          <td className="px-4 py-4 align-middle text-muted-fg">
                            {item.system_stock}
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <input
                              type="number"
                              min="0"
                              value={item.physical_stock ?? ""}
                              disabled={!canManageDraft}
                              onChange={(event) =>
                                setItemField(item.id, "physical_stock", event.target.value)
                              }
                              className="h-10 w-24 rounded-lg border border-input bg-muted px-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                            />
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                item.physical_stock === null
                                  ? "bg-muted text-muted-fg"
                                  : difference === 0
                                    ? "bg-success/10 text-success"
                                    : "bg-warning/10 text-warning"
                              }`}
                            >
                              {item.physical_stock === null
                                ? "Belum dihitung"
                                : difference > 0
                                  ? `+${difference}`
                                  : difference}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <input
                              type="text"
                              value={item.adjustment_reason || ""}
                              disabled={!canManageDraft}
                              onChange={(event) =>
                                setItemField(item.id, "adjustment_reason", event.target.value)
                              }
                              placeholder={isDifferent ? "Wajib isi alasan" : "Tidak perlu"}
                              className="h-10 w-full min-w-48 rounded-lg border border-input bg-muted px-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                            />
                          </td>
                          <td className="px-4 py-4 align-middle text-center">
                            {canManageDraft ? (
                              <button
                                type="button"
                                onClick={() => persistItem(item)}
                                disabled={savingItemId === item.id}
                                className="inline-flex rounded-xl border border-border bg-muted p-2 text-muted-fg transition hover:border-primary hover:text-primary disabled:opacity-50"
                              >
                                <IconDeviceFloppy size={18} />
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <IconPackage size={28} className="text-muted-fg" />
                        </div>
                        <p className="text-sm text-muted-fg">Belum ada produk pada sesi ini.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={saveNotes} className="rounded-2xl border border-border bg-bg p-5">
            <h2 className="mb-4 text-lg font-semibold text-fg">Catatan Sesi</h2>
            <textarea
              value={notesForm.data.notes}
              disabled={!canManageDraft}
              onChange={(event) => notesForm.setData("notes", event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Catatan sesi stock opname"
            />
            {canManageDraft && (
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  <IconDeviceFloppy size={18} />
                  Simpan Catatan
                </button>
              </div>
            )}
          </form>

          <div className="rounded-2xl border border-border bg-bg p-5">
            <h2 className="mb-4 text-lg font-semibold text-fg">Informasi Sesi</h2>
            <div className="space-y-3 text-sm text-muted-fg">
              <div className="rounded-xl border border-border bg-muted p-4">
                <p className="font-medium text-fg">Cara penggunaan</p>
                <ul className="mt-2 space-y-2">
                  <li>1. Tambahkan produk ke sesi stock opname.</li>
                  <li>2. Input stok fisik hasil hitung lapangan.</li>
                  <li>3. Isi alasan jika terdapat selisih stok.</li>
                  <li>4. Finalize setelah semua item valid.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showProductModal && canManageDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowProductModal(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-bg p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <IconClipboardCheck size={18} />
              <h2 className="text-lg font-semibold text-fg">Cari Produk untuk Stock Opname</h2>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={productSearchInput}
                  onChange={(event) => setProductSearchInput(event.target.value)}
                  placeholder="Cari nama produk, barcode, atau SKU..."
                  className="h-12 w-full rounded-xl border border-input bg-muted px-4 pr-11 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-muted-fg">
                  <IconSearch size={18} />
                </div>
              </div>

              {isWaitingSearch ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-fg">
                  Menunggu input selesai, pencarian akan dijalankan dalam 1-2 detik.
                </div>
              ) : filters.product_search ? (
                availableProducts.length > 0 ? (
                  <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                    {availableProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProduct(product.id)}
                        className="flex w-full items-start justify-between gap-3 rounded-xl border border-border p-4 text-left transition hover:border-primary hover:bg-primary/5"
                      >
                        <div>
                          <p className="font-medium text-fg">{product.title}</p>
                          <p className="mt-1 text-xs text-muted-fg">
                            {product.category?.name || "-"} &bull;{" "}
                            {product.barcode || product.sku || "-"}
                          </p>
                          <p className="mt-1 text-xs text-muted-fg">Stok sistem: {product.stock}</p>
                        </div>
                        <span className="inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white">
                          Tambah
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-fg">
                    Tidak ada produk yang cocok dengan kata kunci pencarian.
                  </div>
                )
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-fg">
                  Ketik kata kunci, lalu tunggu sebentar untuk menampilkan hasil pencarian produk.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
