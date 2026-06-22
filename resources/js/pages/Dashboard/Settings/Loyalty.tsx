import { Head, useForm } from "@inertiajs/react";
import { IconDeviceFloppy, IconGift, IconMedal } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import toast from "react-hot-toast";
import settings from "@/routes/settings";
import { Card, CardContent } from "@/components/ui/card";

function formatNumber(value: unknown) {
  return String((value as any) ?? 0);
}

interface LoyaltyTier {
  key: string;
  label: string;
  minimum_total_spent: number;
}

interface LoyaltySettings {
  enable_earn?: boolean;
  enable_redeem?: boolean;
  earn_rate_amount?: number;
  redeem_point_value?: number;
  tiers: LoyaltyTier[];
}

interface LoyaltyProps {
  settings: LoyaltySettings;
}

export default function Loyalty({ settings: loyaltySettings }: LoyaltyProps) {
  const tiers = loyaltySettings.tiers || [];
  const { data, setData, post, processing, errors } = useForm({
    enable_earn: Boolean(loyaltySettings.enable_earn),
    enable_redeem: Boolean(loyaltySettings.enable_redeem),
    earn_rate_amount: formatNumber(loyaltySettings.earn_rate_amount),
    redeem_point_value: formatNumber(loyaltySettings.redeem_point_value),
    tiers: tiers.reduce<Record<string, string>>((acc, tier) => {
      acc[tier.key] = formatNumber(tier.minimum_total_spent);
      return acc;
    }, {}),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(settings.loyalty.update.url(), {
      preserveScroll: true,
      onSuccess: () => toast.success("Pengaturan loyalty disimpan"),
      onError: () => toast.error("Gagal menyimpan pengaturan loyalty"),
    });
  }

  return (
    <>
      <Head title="Pengaturan Loyalty" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-fg">Loyalty Settings</h1>
          <p className="text-sm text-muted-fg">
            Atur earn rate, redeem value, dan threshold tier member.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-border p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <IconGift size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-fg">Earn &amp; Redeem</h2>
                      <p className="text-sm text-muted-fg">
                        Kontrol perolehan dan penggunaan poin.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3 text-sm">
                      <span className="font-medium text-fg">Aktifkan earn points</span>
                      <input
                        type="checkbox"
                        checked={data.enable_earn}
                        onChange={(e) => setData("enable_earn", e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3 text-sm">
                      <span className="font-medium text-fg">Aktifkan redeem points</span>
                      <input
                        type="checkbox"
                        checked={data.enable_redeem}
                        onChange={(e) => setData("enable_redeem", e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary"
                      />
                    </label>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-fg">
                        Nominal belanja untuk 1 poin
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={data.earn_rate_amount}
                        onChange={(e) => setData("earn_rate_amount", e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                      />
                      {errors.earn_rate_amount && (
                        <p className="mt-1 text-xs text-danger">{errors.earn_rate_amount}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-fg">
                        Nilai rupiah per 1 poin redeem
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={data.redeem_point_value}
                        onChange={(e) => setData("redeem_point_value", e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                      />
                      {errors.redeem_point_value && (
                        <p className="mt-1 text-xs text-danger">{errors.redeem_point_value}</p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-border p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                      <IconMedal size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-fg">Threshold Tier</h2>
                      <p className="text-sm text-muted-fg">
                        Threshold ini akan menentukan upgrade dan downgrade tier.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {tiers.map((tier) => (
                      <div key={tier.key}>
                        <label className="mb-2 block text-sm font-medium text-fg">
                          {tier.label}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={data.tiers[tier.key] ?? ""}
                          onChange={(e) =>
                            setData("tiers", {
                              ...data.tiers,
                              [tier.key]: e.target.value,
                            })
                          }
                          className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    ))}
                  </div>
                  {errors.tiers && <p className="mt-3 text-xs text-danger">{errors.tiers}</p>}
                </section>
              </div>

              <div className="flex justify-end border-t border-border pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <IconDeviceFloppy size={18} />
                  {processing ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

Loyalty.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
