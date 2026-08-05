import { useState } from "react";
import { IconUserPlus, IconX } from "@tabler/icons-react";
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
        <div className="flex items-center justify-between border-slate-200 border-b bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-600 text-sm dark:bg-primary-900/50 dark:text-primary-400">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800 text-sm dark:text-slate-200">
                {customer.name}
              </p>
              <p className="text-slate-500 text-xs dark:text-slate-400">{customer.no_telp}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setShowHistory(true);
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/30"
              title="Riwayat"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="rounded-lg p-1.5 text-slate-400 hover:bg-danger-50 hover:text-danger-500 dark:hover:bg-danger-950/50"
              title="Hapus pelanggan"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-slate-200 border-b bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setShowModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-300 border-dashed py-2 font-medium text-slate-500 text-sm transition-all hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-primary-950/30"
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
