import { useState } from "react";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import axios from "axios";
import {
  IconArrowLeft,
  IconChartInfographic,
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import pricingRules from "@/routes/pricing-rules";

const targetOptions = [
  { value: "all", label: "Semua Produk" },
  { value: "product", label: "Produk Tertentu" },
  { value: "category", label: "Kategori Tertentu" },
];

const customerScopeOptions = [
  { value: "all", label: "Semua Pelanggan" },
  { value: "walk_in", label: "Tanpa Pelanggan / Umum" },
  { value: "registered", label: "Pelanggan Terdaftar" },
  { value: "member", label: "Member Loyalty" },
];

const discountTypeOptions = [
  { value: "percentage", label: "Persentase (%)" },
  { value: "fixed_amount", label: "Potongan Nominal" },
  { value: "fixed_price", label: "Harga Final" },
];

interface Product {
  id: number;
  title: string;
}

interface Category {
  id: number;
  name: string;
}

interface TierOption {
  value: string;
  label: string;
}

interface PricingRule {
  id: number;
  name: string;
  kind: string;
  is_active: boolean;
  priority: number;
  target_type: string;
  product_id: number | null;
  category_id: number | null;
  customer_scope: string;
  eligible_loyalty_tiers: string[];
  discount_type: string;
  discount_value: number;
  preview_quantity_multiplier: number;
  starts_at: string | null;
  ends_at: string | null;
  notes: string;
  qty_breaks: {
    min_qty: number;
    discount_type: string;
    discount_value: number;
    sort_order: number;
  }[];
  bundle_items: { product_id: number; quantity: number; sort_order: number }[];
  buy_get_items: { product_id: number; role: string; quantity: number; sort_order: number }[];
}

interface FormProps {
  mode?: "create" | "edit";
  rule?: PricingRule | null;
  products?: Product[];
  categories?: Category[];
  tierOptions?: TierOption[];
  kindOptions?: TierOption[];
}

function InputError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-rose-500 text-xs">{message}</p>;
}

function CardSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-bg p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-fg text-lg">{title}</h2>
        {description && <p className="text-muted-fg text-sm">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function PricingRuleForm({
  mode = "create",
  rule = null,
  products = [],
  categories = [],
  tierOptions = [],
  kindOptions = [],
}: FormProps) {
  const isEdit = mode === "edit";
  const { errors } = usePage().props as any;
  const { data, setData, post, put, processing } = useForm({
    name: rule?.name ?? "",
    kind: rule?.kind ?? "standard_discount",
    is_active: rule?.is_active ?? true,
    priority: String(rule?.priority ?? 100),
    target_type: rule?.target_type ?? "all",
    product_id: rule?.product_id ? String(rule.product_id) : "",
    category_id: rule?.category_id ? String(rule.category_id) : "",
    customer_scope: rule?.customer_scope ?? "all",
    eligible_loyalty_tiers: rule?.eligible_loyalty_tiers ?? [],
    discount_type: rule?.discount_type ?? "percentage",
    discount_value: rule?.discount_value != null ? String(rule.discount_value) : "",
    preview_quantity_multiplier: String(rule?.preview_quantity_multiplier ?? 1),
    starts_at: rule?.starts_at ? new Date(rule.starts_at).toISOString().slice(0, 16) : "",
    ends_at: rule?.ends_at ? new Date(rule.ends_at).toISOString().slice(0, 16) : "",
    notes: rule?.notes ?? "",
    qty_breaks: rule?.qty_breaks?.length
      ? rule.qty_breaks.map((item) => ({
          min_qty: String(item.min_qty),
          discount_type: item.discount_type,
          discount_value: String(item.discount_value),
          sort_order: String(item.sort_order ?? 0),
        }))
      : [{ min_qty: "3", discount_type: "fixed_price", discount_value: "", sort_order: "0" }],
    bundle_items: rule?.bundle_items?.length
      ? rule.bundle_items.map((item) => ({
          product_id: String(item.product_id),
          quantity: String(item.quantity),
          sort_order: String(item.sort_order ?? 0),
        }))
      : [
          { product_id: "", quantity: "1", sort_order: "0" },
          { product_id: "", quantity: "1", sort_order: "1" },
        ],
    buy_get_items: rule?.buy_get_items?.length
      ? rule.buy_get_items.map((item) => ({
          product_id: String(item.product_id),
          role: item.role,
          quantity: String(item.quantity),
          sort_order: String(item.sort_order ?? 0),
        }))
      : [
          { product_id: "", role: "buy", quantity: "1", sort_order: "0" },
          { product_id: "", role: "get", quantity: "1", sort_order: "1" },
        ],
  });

  const [previewState, setPreviewState] = useState<{ loading: boolean; data: any }>({
    loading: false,
    data: null,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit && rule) {
      put(pricingRules.update({ pricing_rule: rule.id }).url);
    } else {
      post(pricingRules.store().url);
    }
  }

  function updateArrayRow(key: string, index: number, field: string, value: string) {
    const next = [...(data as any)[key]];
    next[index] = { ...next[index], [field]: value };
    setData(key as any, next);
  }

  function addRow(key: string, template: any) {
    setData(key as any, [...(data as any)[key], template]);
  }

  function removeRow(key: string, index: number) {
    setData(
      key as any,
      (data as any)[key].filter((_: any, i: number) => i !== index),
    );
  }

  async function runPreview() {
    setPreviewState({ loading: true, data: null });
    try {
      // const response = await axios.post(route("pricing-rules.preview"), data);
      const response = await axios.post(pricingRules.preview().url, data);
      setPreviewState({ loading: false, data: response.data?.data ?? null });
    } catch {
      setPreviewState({ loading: false, data: null });
    }
  }

  const previewGroups = previewState.data?.applied_groups ?? [];
  const discountSections = data.kind === "standard_discount" || data.kind === "qty_break";

  return (
    <>
      <Head title={isEdit ? "Edit Promo Harga" : "Buat Promo Harga"} />
      <div className="space-y-6">
        <div>
          <Link
            href={pricingRules.index.url()}
            className="mb-3 inline-flex items-center gap-2 text-smtext-muted-fg hover:text-primary"
          >
            <IconArrowLeft size={16} />
            Kembali ke promo harga
          </Link>
          <h1 className="font-bold text-2xl text-fg">
            {isEdit ? "Edit Promo Harga" : "Buat Promo Harga"}
          </h1>
          <p className="text-smtext-muted-fg">
            Kelola promo standar, grosir, bundle, dan buy x get y dalam satu engine.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <CardSection
            title="Informasi Rule"
            description="Identitas dasar rule, jenis promo, dan prioritas penerapan."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Nama Rule</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
                <InputError message={(errors as any).name} />
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Jenis Rule</label>
                <select
                  value={data.kind}
                  onChange={(e) => {
                    setData("kind", e.target.value);
                    setPreviewState({ loading: false, data: null });
                  }}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                >
                  {kindOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <InputError message={(errors as any).kind} />
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Priority</label>
                <input
                  type="number"
                  min="0"
                  value={data.priority}
                  onChange={(e) => setData("priority", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Qty Preview POS</label>
                <input
                  type="number"
                  min="1"
                  value={data.preview_quantity_multiplier}
                  onChange={(e) => setData("preview_quantity_multiplier", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
              </div>
            </div>
          </CardSection>

          <CardSection
            title="Target & Scope"
            description="Tentukan produk/kategori yang terkena promo dan siapa yang berhak."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Target Rule</label>
                <select
                  value={data.target_type}
                  onChange={(e) => setData("target_type", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                >
                  {targetOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Scope Pelanggan</label>
                <select
                  value={data.customer_scope}
                  onChange={(e) => setData("customer_scope", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                >
                  {customerScopeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {data.target_type === "product" && (
                <div className="md:col-span-2">
                  <label className="mb-2 block font-medium text-fg text-sm">Produk</label>
                  <select
                    value={data.product_id}
                    onChange={(e) => setData("product_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                  >
                    <option value="">Pilih produk</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  <InputError message={(errors as any).product_id} />
                </div>
              )}
              {data.target_type === "category" && (
                <div className="md:col-span-2">
                  <label className="mb-2 block font-medium text-fg text-sm">Kategori</label>
                  <select
                    value={data.category_id}
                    onChange={(e) => setData("category_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <InputError message={(errors as any).category_id} />
                </div>
              )}
              {data.customer_scope === "member" && (
                <div className="md:col-span-2">
                  <label className="mb-2 block font-medium text-fg text-sm">
                    Tier Member yang Berhak
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {tierOptions.map((tier) => {
                      const checked = data.eligible_loyalty_tiers.includes(tier.value);
                      return (
                        <label
                          key={tier.value}
                          className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...data.eligible_loyalty_tiers, tier.value]
                                : data.eligible_loyalty_tiers.filter(
                                    (v: string) => v !== tier.value,
                                  );
                              setData("eligible_loyalty_tiers", next);
                            }}
                          />
                          {tier.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardSection>

          {discountSections && (
            <CardSection
              title="Diskon Rule"
              description="Tentukan tipe diskon yang dipakai rule ini."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium text-fg text-sm">Tipe Diskon</label>
                  <select
                    value={data.discount_type}
                    onChange={(e) => setData("discount_type", e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                  >
                    {discountTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-medium text-fg text-sm">Nilai Diskon</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={data.discount_value}
                    onChange={(e) => setData("discount_value", e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                  />
                  <InputError message={(errors as any).discount_value} />
                </div>
              </div>
            </CardSection>
          )}

          {data.kind === "qty_break" && (
            <CardSection
              title="Qty Break / Grosir"
              description="Satu rule bisa memiliki beberapa breakpoint quantity."
            >
              <div className="space-y-3">
                {data.qty_breaks.map((row: any, index: number) => (
                  <div
                    key={`qty-break-${index}`}
                    className="grid gap-3 rounded-2xl border border-border bg-muted p-4 md:grid-cols-4"
                  >
                    <input
                      type="number"
                      min="1"
                      value={row.min_qty}
                      onChange={(e) =>
                        updateArrayRow("qty_breaks", index, "min_qty", e.target.value)
                      }
                      className="h-11 rounded-xl border border-border bg-bg px-4 text-sm"
                      placeholder="Min qty"
                    />
                    <select
                      value={row.discount_type}
                      onChange={(e) =>
                        updateArrayRow("qty_breaks", index, "discount_type", e.target.value)
                      }
                      className="h-11 rounded-xl border border-border bg-bg px-4 text-sm"
                    >
                      {discountTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={row.discount_value}
                      onChange={(e) =>
                        updateArrayRow("qty_breaks", index, "discount_value", e.target.value)
                      }
                      className="h-11 rounded-xl border border-border bg-bg px-4 text-sm"
                      placeholder="Nilai"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow("qty_breaks", index)}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addRow("qty_breaks", {
                      min_qty: "1",
                      discount_type: "fixed_price",
                      discount_value: "",
                      sort_order: String(data.qty_breaks.length),
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-medium text-fg text-sm"
                >
                  <IconPlus size={16} />
                  Tambah Break
                </button>
                <InputError message={(errors as any).qty_breaks} />
              </div>
            </CardSection>
          )}

          {data.kind === "bundle_price" && (
            <CardSection
              title="Bundle Price"
              description="Pilih kombinasi produk dan harga paket final."
            >
              <div className="mb-4">
                <label className="mb-2 block font-medium text-fg text-sm">Harga Bundle</label>
                <input
                  type="number"
                  min="1"
                  value={data.discount_value}
                  onChange={(e) => setData("discount_value", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
              </div>
              <div className="space-y-3">
                {data.bundle_items.map((row: any, index: number) => (
                  <div
                    key={`bundle-item-${index}`}
                    className="grid gap-3 rounded-2xl border border-border bg-muted p-4 md:grid-cols-[1fr_160px_48px]"
                  >
                    <select
                      value={row.product_id}
                      onChange={(e) =>
                        updateArrayRow("bundle_items", index, "product_id", e.target.value)
                      }
                      className="h-11 rounded-xl border border-border bg-bg px-4 text-sm"
                    >
                      <option value="">Pilih produk</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) =>
                        updateArrayRow("bundle_items", index, "quantity", e.target.value)
                      }
                      className="h-11 rounded-xl border border-border bg-bg px-4 text-sm"
                      placeholder="Qty"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow("bundle_items", index)}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addRow("bundle_items", {
                      product_id: "",
                      quantity: "1",
                      sort_order: String(data.bundle_items.length),
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-medium text-fg text-sm"
                >
                  <IconPlus size={16} />
                  Tambah Item Bundle
                </button>
              </div>
            </CardSection>
          )}

          {data.kind === "buy_x_get_y" && (
            <CardSection
              title="Buy X Get Y"
              description="Atur item pembelian (buy) dan item hadiah/diskon (get)."
            >
              <div className="space-y-3">
                {data.buy_get_items.map((row: any, index: number) => (
                  <div
                    key={`buy-get-item-${index}`}
                    className="grid gap-3 rounded-2xl border border-border bg-muted p-4 md:grid-cols-[160px_1fr_140px_48px]"
                  >
                    <select
                      value={row.role}
                      onChange={(e) =>
                        updateArrayRow("buy_get_items", index, "role", e.target.value)
                      }
                      className="h-11 rounded-xl border border-border bg-bg px-4 text-sm"
                    >
                      <option value="buy">Buy</option>
                      <option value="get">Get</option>
                    </select>
                    <select
                      value={row.product_id}
                      onChange={(e) =>
                        updateArrayRow("buy_get_items", index, "product_id", e.target.value)
                      }
                      className="h-11 rounded-xl border border-border bg-bg px-4 text-sm"
                    >
                      <option value="">Pilih produk</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) =>
                        updateArrayRow("buy_get_items", index, "quantity", e.target.value)
                      }
                      className="h-11 rounded-xl border border-border bg-bg px-4 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow("buy_get_items", index)}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addRow("buy_get_items", {
                      product_id: "",
                      role: "buy",
                      quantity: "1",
                      sort_order: String(data.buy_get_items.length),
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-medium text-fg text-sm"
                >
                  <IconPlus size={16} />
                  Tambah Item Buy/Get
                </button>
              </div>
            </CardSection>
          )}

          <CardSection
            title="Jadwal & Catatan"
            description="Gunakan jadwal bila promo hanya aktif pada periode tertentu."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Mulai</label>
                <input
                  type="datetime-local"
                  value={data.starts_at}
                  onChange={(e) => setData("starts_at", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Berakhir</label>
                <input
                  type="datetime-local"
                  value={data.ends_at}
                  onChange={(e) => setData("ends_at", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block font-medium text-fg text-sm">Catatan</label>
                <textarea
                  rows={3}
                  value={data.notes}
                  onChange={(e) => setData("notes", e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm"
                />
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3 font-medium text-sm">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData("is_active", e.target.checked)}
                />
                Aktifkan rule ini
              </label>
            </div>
          </CardSection>

          <CardSection
            title="Preview Draft"
            description="Simulasikan rule ini terhadap contoh produk sebelum disimpan."
          >
            <div className="mb-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={runPreview}
                className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 font-medium text-primary text-sm"
              >
                <IconChartInfographic size={16} />
                {previewState.loading ? "Memuat preview..." : "Jalankan Preview"}
              </button>
            </div>

            {previewState.data && (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <p className="text-xs uppercase tracking-widetext-muted-fg">Base subtotal</p>
                    <p className="mt-1 font-semibold text-fg text-lg">
                      Rp{" "}
                      {Number(previewState.data.summary.base_subtotal || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <p className="text-xs uppercase tracking-widetext-muted-fg">Promo discount</p>
                    <p className="mt-1 font-semibold text-danger text-lg">
                      Rp{" "}
                      {Number(previewState.data.summary.promo_discount_total || 0).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <p className="text-xs uppercase tracking-widetext-muted-fg">After promo</p>
                    <p className="mt-1 font-semibold text-fg text-lg">
                      Rp{" "}
                      {Number(previewState.data.summary.subtotal_after_promo || 0).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                </div>

                {previewGroups.length > 0 && (
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <h3 className="mb-3 font-semibold text-fg text-sm">Applied Groups</h3>
                    <div className="space-y-2">
                      {previewGroups.map((group: any) => (
                        <div
                          key={group.key}
                          className="flex items-center justify-between rounded-xl bg-bg px-4 py-3 text-sm"
                        >
                          <span className="font-medium text-fg">{group.label}</span>
                          <span className="text-danger">
                            -Rp {Number(group.discount_total || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardSection>

          <div className="flex flex-col gap-3 border-border border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={pricingRules.index.url()}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-bg px-5 py-2.5 font-medium text-fg text-sm hover:bg-muted"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-fg hover:bg-primary/90 disabled:opacity-50"
            >
              <IconDeviceFloppy size={18} />
              {processing ? "Menyimpan..." : "Simpan Rule"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
