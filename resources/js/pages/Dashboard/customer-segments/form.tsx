import customerSegments from "@/routes/customer-segments";
import { Head, useForm, Link } from "@inertiajs/react";
import { IconArrowLeft, IconDeviceFloppy, IconUsersGroup } from "@tabler/icons-react";

interface RuleConfig {
  min_total_spent: string;
  min_transaction_count: string;
  recent_days: string;
  inactivity_days_min: string;
  require_outstanding_receivable: boolean;
  overdue_only: boolean;
}

interface Segment {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
  description: string;
  auto_rule_type: string | null;
  rule_config: RuleConfig | null;
}

interface FormProps {
  mode?: "create" | "edit";
  segment?: Segment | null;
}

function InputError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-500">{message}</p>;
}

export default function Form({ mode = "create", segment = null }: FormProps) {
  const isEdit = mode === "edit";
  const { data, setData, post, put, processing, errors } = useForm({
    name: segment?.name ?? "",
    type: segment?.type ?? "manual",
    is_active: Boolean(segment?.is_active ?? true),
    description: segment?.description ?? "",
    auto_rule_type: segment?.auto_rule_type ?? "spending",
    rule_config: {
      min_total_spent: String(segment?.rule_config?.min_total_spent ?? 1500000),
      min_transaction_count: String(segment?.rule_config?.min_transaction_count ?? 5),
      recent_days: String(segment?.rule_config?.recent_days ?? 45),
      inactivity_days_min: String(segment?.rule_config?.inactivity_days_min ?? 30),
      require_outstanding_receivable: Boolean(
        segment?.rule_config?.require_outstanding_receivable ?? true,
      ),
      overdue_only: Boolean(segment?.rule_config?.overdue_only ?? false),
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(customerSegments.update(segment!.id).url);
      return;
    }
    post(customerSegments.store().url);
  };

  const setRuleConfig = (key: string, value: string | boolean) => {
    setData("rule_config", {
      ...data.rule_config,
      [key]: value,
    });
  };

  return (
    <>
      <Head title={isEdit ? "Edit Segment Customer" : "Buat Segment Customer"} />

      <div className="w-full">
        <div className="mb-6">
          <Link
            href={customerSegments.index().url}
            className="mb-3 inline-flex items-center gap-2 text-smtext-muted-fg hover:text-primary-600"
          >
            <IconArrowLeft size={16} />
            Kembali ke segment customer
          </Link>
          <h1 className="text-2xl font-bold text-fg">
            {isEdit ? "Edit Segment Customer" : "Buat Segment Customer"}
          </h1>
          <p className="text-sm text-muted-fg">
            Kelompokkan customer secara manual atau otomatis berdasarkan perilaku bisnis.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="rounded-2xl border border-border bg-bg p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300">
                <IconUsersGroup size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg">Informasi Segment</h2>
                <p className="text-sm text-muted-fg">
                  Segment manual bisa diatur per customer, segment otomatis dihitung oleh sistem.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-fg">Nama Segment</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
                <InputError message={errors.name} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-fg">Tipe Segment</label>
                <select
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                >
                  <option value="manual">Manual Tag</option>
                  <option value="auto">Auto Segment</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-fg">Deskripsi</label>
                <textarea
                  rows={3}
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
              </div>
              <label className="inline-flex items-center gap-3 rounded-2xl border border-input bg-muted px-4 py-3">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData("is_active", e.target.checked)}
                />
                <span className="text-sm font-medium text-fg">Segment aktif</span>
              </label>
            </div>
          </div>

          {data.type === "auto" && (
            <div className="rounded-2xl border border-border bg-bg p-5">
              <h2 className="mb-4 text-lg font-semibold text-fg">Rule Auto Segment</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-fg">Rule Type</label>
                  <select
                    value={data.auto_rule_type}
                    onChange={(e) => setData("auto_rule_type", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                  >
                    <option value="spending">Spending</option>
                    <option value="purchase_frequency">Purchase Frequency</option>
                    <option value="receivable_behavior">Receivable Behavior</option>
                  </select>
                </div>

                {data.auto_rule_type === "spending" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-fg">
                      Minimum Total Belanja
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={data.rule_config.min_total_spent}
                      onChange={(e) => setRuleConfig("min_total_spent", e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                    />
                  </div>
                )}

                {data.auto_rule_type === "purchase_frequency" && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-fg">
                        Minimum Jumlah Transaksi
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={data.rule_config.min_transaction_count}
                        onChange={(e) => setRuleConfig("min_transaction_count", e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-fg">
                        Recent Days / Inactivity Days
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={
                          data.name.toLowerCase().includes("inactive")
                            ? data.rule_config.inactivity_days_min
                            : data.rule_config.recent_days
                        }
                        onChange={(e) =>
                          setRuleConfig(
                            data.name.toLowerCase().includes("inactive")
                              ? "inactivity_days_min"
                              : "recent_days",
                            e.target.value,
                          )
                        }
                        className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                      />
                    </div>
                  </>
                )}

                {data.auto_rule_type === "receivable_behavior" && (
                  <div className="space-y-3 md:col-span-2">
                    <label className="inline-flex items-center gap-3 rounded-2xl border border-input bg-muted px-4 py-3">
                      <input
                        type="checkbox"
                        checked={data.rule_config.require_outstanding_receivable}
                        onChange={(e) =>
                          setRuleConfig("require_outstanding_receivable", e.target.checked)
                        }
                      />
                      <span className="text-sm font-medium text-fg">
                        Harus punya piutang outstanding
                      </span>
                    </label>
                    <label className="inline-flex items-center gap-3 rounded-2xl border border-input bg-muted px-4 py-3">
                      <input
                        type="checkbox"
                        checked={data.rule_config.overdue_only}
                        onChange={(e) => setRuleConfig("overdue_only", e.target.checked)}
                      />
                      <span className="text-sm font-medium text-fg">Hanya piutang overdue</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={customerSegments.index().url}
              className="inline-flex items-center justify-center rounded-xl border border-input bg-bg px-5 py-2.5 text-sm font-medium text-muted-fg hover:bg-muted"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
            >
              <IconDeviceFloppy size={18} />
              {processing ? "Menyimpan..." : "Simpan Segment"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
