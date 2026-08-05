import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { IconArrowLeft, IconClipboardCheck } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import stockOpnames from "@/routes/stock-opnames";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function Create() {
  const { errors } = usePage().props as { errors: Record<string, string> };
  const { data, setData, post, processing } = useForm({ notes: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(stockOpnames.store.url(), {
      onError: () => toast.error("Gagal membuat sesi stock opname"),
    });
  }

  return (
    <>
      <Head title="Buat Stock Opname" />

      <div className="mb-6">
        <Link
          href={stockOpnames.index.url()}
          className="mb-3 inline-flex items-center gap-2 text-muted-fg text-sm hover:text-primary"
        >
          <IconArrowLeft size={16} />
          Kembali ke daftar stock opname
        </Link>
        <h1 className="flex items-center gap-2 font-bold text-2xl text-fg">
          <IconClipboardCheck size={28} className="text-primary" />
          Buat Sesi Stock Opname
        </h1>
      </div>

      <form onSubmit={submit} className="max-w-3xl">
        <Card>
          <CardContent className="p-5">
            <div>
              <label className="mb-2 block font-medium text-fg text-sm">Catatan Sesi</label>
              <textarea
                placeholder="Contoh: opname bulanan gudang depan"
                value={data.notes}
                onChange={(e) => setData("notes", e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
              />
              {errors.notes && <p className="mt-1 text-danger text-sm">{errors.notes}</p>}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-sm text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <IconClipboardCheck size={18} />
                {processing ? "Menyimpan..." : "Buat Sesi"}
              </button>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
