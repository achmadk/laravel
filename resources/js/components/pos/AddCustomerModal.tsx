import { useState, useEffect } from "react";
import { IconX, IconSearch, IconUserCircle, IconCheck } from "@tabler/icons-react";
import axios from "axios";
import customers from "@/routes/customers";
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
        // Reuses the JSON-capable customers index (no dedicated search
        // endpoint). The index returns a flat JSON array for non-Inertia
        // requests; any non-array response (HTML, redirect) yields no results.
        const response = await axios.get(customers.index.url({ query: { search } }), {
          headers: { Accept: "application/json" },
        });
        setResults(Array.isArray(response.data) ? response.data : []);
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
      const response = await axios.post(customers.storeAjax.url(), newCustomer);
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
      <div className="relative mx-4 w-full max-w-lg animate-slide-up overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-slate-100 border-b px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <IconUserCircle size={22} className="text-primary" />
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
              {showCreateForm ? "Pelanggan Baru" : "Cari Pelanggan"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <IconX size={20} />
          </button>
        </div>

        {selectedCustomer && !showCreateForm && (
          <div className="mx-5 mt-4 rounded-xl border border-primary-subtle bg-primary-subtle p-3">
            <div className="flex items-center gap-3">
              <IconCheck size={20} className="text-primary" />
              <div>
                <p className="font-medium text-primary text-sm">{selectedCustomer.name}</p>
                <p className="text-primary text-xs">{selectedCustomer.no_telp}</p>
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
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Cari nama atau nomor telepon..."
                  autoFocus
                  className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white pr-4 pl-10 text-slate-800 placeholder-slate-400 transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
                {isSearching && (
                  <div className="absolute top-1/2 right-3 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </div>
            </div>

            <div className="max-h-60 space-y-1 overflow-y-auto px-5 pb-4">
              {results.length > 0
                ? results.map((customer, index) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        onSelect(customer);
                        onClose();
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                        index === selectedIndex
                          ? "bg-primary-subtle"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-medium text-slate-500 text-sm dark:bg-slate-700 dark:text-slate-400">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm dark:text-slate-300">
                          {customer.name}
                        </p>
                        <p className="text-slate-500 text-xs dark:text-slate-400">
                          {customer.no_telp}
                        </p>
                      </div>
                    </button>
                  ))
                : search.length >= 2 &&
                  !isSearching && (
                    <div className="py-6 text-center">
                      <p className="mb-3 text-slate-500 text-sm dark:text-slate-400">
                        Pelanggan tidak ditemukan
                      </p>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="font-medium text-primary text-sm hover:underline"
                      >
                        Buat pelanggan baru
                      </button>
                    </div>
                  )}
            </div>
          </>
        ) : (
          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1 block font-medium text-slate-700 text-sm dark:text-slate-300">
                Nama <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
                className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                placeholder="Nama pelanggan"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-slate-700 text-sm dark:text-slate-300">
                Telepon <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-slate-700 text-sm dark:text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
                className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-slate-700 text-sm dark:text-slate-300">
                Alamat
              </label>
              <textarea
                value={newCustomer.address}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, address: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
                className="h-11 flex-1 rounded-xl border-2 border-slate-200 font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={isCreating || !newCustomer.name || !newCustomer.phone}
                className="h-11 flex-1 rounded-xl bg-primary font-medium text-primary-fg shadow-lg shadow-primary/30 transition-all hover:shadow-xl disabled:opacity-50"
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
