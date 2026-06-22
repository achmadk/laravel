import { Head, useForm } from "@inertiajs/react";
import { IconTarget, IconDeviceFloppy, IconCoin } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import toast from "react-hot-toast";
import settings from "@/routes/settings";
import { Card, CardContent } from "@/components/ui/card";

function formatCurrency(value: number = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

interface TargetSettings {
  monthly_sales_target?: string | number | null;
}

interface TargetProps {
  settings: TargetSettings;
}

export default function Target({ settings: targetSettings }: TargetProps) {
  const { data, setData, post, processing, errors } = useForm({
    monthly_sales_target: targetSettings?.monthly_sales_target ?? "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(settings.target.update.url(), {
      preserveScroll: true,
      onSuccess: () => toast.success("Target berhasil disimpan"),
      onError: () => toast.error("Gagal menyimpan target"),
    });
  }

  return (
    <>
      <Head title="Target Penjualan" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-fg">Target Penjualan</h1>
          <p className="text-sm text-muted-fg">Atur target penjualan bulanan untuk bisnis Anda</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <IconTarget size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-fg">
                    Target Penjualan Bulanan
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-fg">
                      <IconCoin size={20} />
                    </div>
                    <input
                      type="number"
                      value={data.monthly_sales_target}
                      onChange={(e) => setData("monthly_sales_target", e.target.value)}
                      placeholder="Contoh: 50000000"
                      className="h-12 w-full rounded-xl border-2 border-border bg-bg pl-12 pr-4 text-fg placeholder-muted-fg transition-all focus:border-ring focus:ring-4 focus:ring-ring/20"
                    />
                  </div>
                  {Number(data.monthly_sales_target) > 0 && (
                    <p className="mt-2 text-sm text-muted-fg">
                      Target: {formatCurrency(Number(data.monthly_sales_target))}
                    </p>
                  )}
                  {errors.monthly_sales_target && (
                    <p className="mt-1 text-sm text-danger">{errors.monthly_sales_target}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end border-t border-border pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <IconDeviceFloppy size={18} />
                  {processing ? "Menyimpan..." : "Simpan Target"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm text-primary">
            <strong>Tip:</strong> Target penjualan akan ditampilkan di Dashboard sebagai progress
            bar untuk memantau pencapaian bulanan Anda.
          </p>
        </div>
      </div>
    </>
  );
}

Target.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
