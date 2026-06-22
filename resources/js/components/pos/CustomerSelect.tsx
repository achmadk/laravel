import { useState } from "react";
import { IconUserCircle, IconUserPlus, IconX } from "@tabler/icons-react";
import AddCustomerModal from "./AddCustomerModal";
import CustomerHistoryPanel from "./CustomerHistoryPanel";
import type { POSCustomer } from "@/types/pos";

interface CustomerSelectProps {
  customer: POSCustomer | null;
  onSelect: (customer: POSCustomer | null) => void;
}

export default function CustomerSelect({ customer, onSelect }: CustomerSelectProps) {
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      {customer ? (
        <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm flex-shrink-0">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {customer.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{customer.no_telp}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setShowHistory(true);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30"
              title="Riwayat"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            <button
              onClick={() => onSelect(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/50"
              title="Hapus pelanggan"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all text-sm font-medium"
          >
            <IconUserPlus size={18} />
            Tambah Pelanggan
          </button>
        </div>
      )}

      <AddCustomerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={(newCustomer) => onSelect(newCustomer)}
        selectedCustomer={customer}
      />

      <CustomerHistoryPanel
        customer={customer}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </>
  );
}
