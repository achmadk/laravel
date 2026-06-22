import { useState, useEffect } from "react";
import { IconX, IconSearch, IconUserCircle, IconCheck } from "@tabler/icons-react";
import axios from "axios";
import type { POSCustomer } from "@/types/pos";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: POSCustomer) => void;
  selectedCustomer?: POSCustomer | null;
}

export default function AddCustomerModal({
  isOpen,
  onClose,
  onSelect,
  selectedCustomer,
}: AddCustomerModalProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<POSCustomer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setResults([]);
      setShowCreateForm(false);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!search || search.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // This will be bound to route customers.search when implemented
        const response = await axios.get("/apps/customers/search", {
          params: { q: search },
        });
        setResults(response.data.data || response.data || []);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      return;
    }
    setIsCreating(true);
    try {
      const response = await axios.post("/apps/customers/store-ajax", newCustomer);
      const customer = response.data;
      onSelect(customer);
      setShowCreateForm(false);
      setNewCustomer({ name: "", phone: "", email: "", address: "" });
      onClose();
    } catch {
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showCreateForm) return;
    if (!results.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          onSelect(results[selectedIndex]);
          onClose();
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <IconUserCircle size={22} className="text-primary-500" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              {showCreateForm ? "Pelanggan Baru" : "Cari Pelanggan"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        {selectedCustomer && !showCreateForm && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/50">
            <div className="flex items-center gap-3">
              <IconCheck size={20} className="text-primary-600 dark:text-primary-400" />
              <div>
                <p className="text-sm font-medium text-primary-800 dark:text-primary-200">
                  {selectedCustomer.name}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400">
                  {selectedCustomer.no_telp}
                </p>
              </div>
            </div>
          </div>
        )}

        {!showCreateForm ? (
          <>
            <div className="p-5">
              <div className="relative">
                <IconSearch
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Cari nama atau nomor telepon..."
                  autoFocus
                  className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto px-5 pb-4 space-y-1">
              {results.length > 0
                ? results.map((customer, index) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        onSelect(customer);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                        index === selectedIndex
                          ? "bg-primary-50 dark:bg-primary-950/30"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium text-sm">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {customer.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {customer.no_telp}
                        </p>
                      </div>
                    </button>
                  ))
                : search.length >= 2 &&
                  !isSearching && (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        Pelanggan tidak ditemukan
                      </p>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Buat pelanggan baru
                      </button>
                    </div>
                  )}
            </div>
          </>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nama <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="Nama pelanggan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Telepon <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Alamat
              </label>
              <textarea
                value={newCustomer.address}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, address: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="Alamat (opsional)"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewCustomer({
                    name: "",
                    phone: "",
                    email: "",
                    address: "",
                  });
                }}
                className="flex-1 h-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={isCreating || !newCustomer.name || !newCustomer.phone}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl disabled:opacity-50 transition-all"
              >
                {isCreating ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
