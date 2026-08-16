import { type PropsWithChildren, useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { IconArrowLeft, IconShoppingCart, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import NumpadModal from "@/components/pos/NumpadModal";
import { Toast } from "@/components/ui/toast";

type OpenShiftStep = "numpad" | "confirm";

export default function POSLayout({ children }: PropsWithChildren) {
  const { props, component } = usePage();
  const auth = (props as Record<string, unknown>).auth as {
    user: { data: { id: number; name: string; email: string } };
  };
  const storeProfile = (props as Record<string, unknown>).storeProfile as {
    name: string;
    address: string | null;
    phone: string | null;
  } | null;
  const activeCashierShift = (props as Record<string, unknown>).cashierShift as {
    id: number;
    cashier_id?: number;
    opened_at: string;
    opening_balance: number | null;
  } | null;

  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [step, setStep] = useState<OpenShiftStep>("numpad");
  const [openingCash, setOpeningCash] = useState(0);
  const [shiftNotes, setShiftNotes] = useState("");
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenShift = () => {
    setIsOpening(true);
    router.post(
      "/dashboard/cashier-shifts",
      {
        opening_cash: openingCash,
        notes: shiftNotes || null,
      },
      {
        onSuccess: () => {
          toast.success("Shift berhasil dibuka");
          closeModal();
          router.reload();
        },
        onError: (errors) => {
          toast.error(errors.message || "Gagal membuka shift");
          setIsOpening(false);
        },
      },
    );
  };

  const openModal = () => {
    setOpeningCash(0);
    setShiftNotes("");
    setStep("confirm");
    setShowOpenShiftModal(true);
  };

  const closeModal = () => {
    setShowOpenShiftModal(false);
    setOpeningCash(0);
    setShiftNotes("");
    setStep("numpad");
    setIsOpening(false);
  };

  const handleNumpadConfirm = (value: number) => {
    setOpeningCash(value);
    setStep("confirm");
  };

  const handleBackToNumpad = () => {
    setStep("numpad");
  };

  const pageTitle =
    typeof component === "string" ? component.replace("Dashboard/", "").replace("/", " - ") : "POS";

  return (
    <>
      <Head title={`${pageTitle} - ${storeProfile?.name || "POS"}`} />

      <div className="flex h-screen flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
        <header className="flex flex-shrink-0 items-center justify-between border-slate-200 border-b bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <IconArrowLeft size={20} className="text-slate-500 dark:text-slate-400" />
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <IconShoppingCart size={20} className="text-primary" />
              <div>
                <h1 className="font-semibold text-slate-800 text-sm leading-tight dark:text-white">
                  {storeProfile?.name || "POS"}
                </h1>
                {activeCashierShift && activeCashierShift?.opened_at && (
                  <p className="text-[11px] text-slate-500 leading-tight dark:text-slate-400">
                    Shift aktif · Buka{" "}
                    {new Date(activeCashierShift.opened_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeCashierShift ? (
              <span className="flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 font-medium text-success text-xs">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                Shift Aktif
              </span>
            ) : (
              <button
                onClick={openModal}
                className="cursor-pointer rounded-lg bg-warning-subtle px-3 py-1.5 font-medium text-warning text-xs transition-colors hover:bg-warning-subtle"
              >
                Buka Shift
              </button>
            )}

            <Link
              href={route("profile.edit")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600 text-xs transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              {auth.user.data?.name?.charAt(0)?.toUpperCase() ?? "-"}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      <Toast />

      <NumpadModal
        isOpen={showOpenShiftModal && step === "numpad"}
        onClose={closeModal}
        onConfirm={handleNumpadConfirm}
        title="Buka Shift Baru"
        initialValue={0}
        minValue={0}
        isCurrency={true}
        triggerCloseAfterConfirm={false}
      />

      {showOpenShiftModal && step === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-sm animate-slide-up overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-slate-100 border-b px-5 py-4 dark:border-slate-800">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                Buka Shift Baru
              </h3>
              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block font-medium text-slate-700 text-sm dark:text-slate-300">
                  Modal Awal
                </label>
                <button
                  onClick={handleBackToNumpad}
                  className="flex h-14 w-full items-center justify-center rounded-xl bg-slate-100 font-bold font-mono text-2xl text-slate-800 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(openingCash)}
                </button>
                <p className="mt-1 text-center text-slate-500 text-xs dark:text-slate-400">
                  Klik untuk mengubah
                </p>
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-700 text-sm dark:text-slate-300">
                  Catatan (opsional)
                </label>
                <input
                  type="text"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Tambahkan catatan..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="h-12 flex-1 rounded-xl border border-slate-200 font-medium text-slate-600 text-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  onClick={handleOpenShift}
                  disabled={isOpening}
                  className="h-12 flex-1 rounded-xl bg-primary font-semibold text-sm text-primary-fg transition-all hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isOpening ? "Membuka..." : "Buka Shift"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function route(name: string): string {
  const routes: Record<string, string> = {
    "profile.edit": "/profile",
  };
  return routes[name] || "/";
}
