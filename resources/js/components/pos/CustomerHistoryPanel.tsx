import { useState } from "react";
import { IconHistory, IconRefresh, IconChevronRight, IconX } from "@tabler/icons-react";
import axios from "axios";
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
      const response = await axios.get(`/apps/customers/${customer.id}/history`);
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
        return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400";
      case "pending":
        return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400";
      case "failed":
      case "expire":
        return "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  if (!isOpen) {
    if (customer) {
      return (
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
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
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <IconHistory size={20} className="text-primary-500 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white truncate">
                {customer?.name || "Riwayat"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{customer?.no_telp}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHistory}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
            >
              <IconRefresh size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length > 0 ? (
            history.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {tx.code}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(tx.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatPrice(tx.grand_total)}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-md mt-0.5 ${getStatusBadge(tx.payment_status)}`}
                  >
                    {tx.payment_status}
                  </span>
                </div>
                <IconChevronRight size={16} className="text-slate-300 ml-2 flex-shrink-0" />
              </div>
            ))
          ) : hasLoaded ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <IconHistory size={24} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Klik refresh untuk memuat riwayat
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
