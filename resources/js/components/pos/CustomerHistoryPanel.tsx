import { useState } from "react";
import { IconHistory, IconRefresh, IconChevronRight, IconX } from "@tabler/icons-react";
import axios from "axios";
import customers from "@/routes/customers";
import type { POSCustomer } from "@/types/pos";

const formatPrice = (value = 0) =>
  Number(value || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

interface HistoryTransaction {
  id: number;
  code: string;
  grand_total: number;
  created_at: string;
  payment_status: string;
}

interface CustomerHistoryPanelProps {
  customer: POSCustomer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerHistoryPanel({
  customer,
  isOpen,
  onClose,
}: CustomerHistoryPanelProps) {
  const [history, setHistory] = useState<HistoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchHistory = async () => {
    if (!customer) return;
    setIsLoading(true);
    try {
      const response = await axios.get(customers.history.url(customer.id), {
        headers: { Accept: "application/json" },
      });
      setHistory(response.data.data || response.data || []);
      setHasLoaded(true);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = async () => {
    if (!hasLoaded) {
      await fetchHistory();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
      case "settlement":
        return "bg-success-subtle text-success";
      case "pending":
        return "bg-warning-subtle text-warning";
      case "failed":
      case "expire":
        return "bg-danger-subtle text-danger";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  if (!isOpen) {
    if (customer) {
      return (
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 text-slate-500 text-sm transition-colors hover:text-primary dark:text-slate-400"
        >
          <IconHistory size={16} />
          Riwayat
        </button>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-lg animate-slide-up overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-slate-100 border-b px-5 py-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-2">
            <IconHistory size={20} className="flex-shrink-0 text-primary" />
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-lg text-slate-800 dark:text-white">
                {customer?.name || "Riwayat"}
              </h3>
              <p className="text-slate-500 text-xs dark:text-slate-400">{customer?.no_telp}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHistory}
              disabled={isLoading}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-primary-subtle hover:text-primary"
            >
              <IconRefresh size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>

        <div className="max-h-[350px] space-y-2 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : history.length > 0 ? (
            history.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-700 text-sm dark:text-slate-300">
                    {tx.code}
                  </p>
                  <p className="mt-0.5 text-slate-500 text-xs dark:text-slate-400">
                    {new Date(tx.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="ml-3 flex-shrink-0 text-right">
                  <p className="font-semibold text-slate-800 text-sm dark:text-slate-200">
                    {formatPrice(tx.grand_total)}
                  </p>
                  <span
                    className={`mt-0.5 inline-block rounded-md px-2 py-0.5 font-medium text-[11px] ${getStatusBadge(tx.payment_status)}`}
                  >
                    {tx.payment_status}
                  </span>
                </div>
                <IconChevronRight size={16} className="ml-2 flex-shrink-0 text-slate-300" />
              </div>
            ))
          ) : hasLoaded ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <IconHistory size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm dark:text-slate-400">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-slate-500 text-sm dark:text-slate-400">
                Klik refresh untuk memuat riwayat
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
