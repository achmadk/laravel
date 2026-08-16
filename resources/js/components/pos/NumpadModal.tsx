import { useState, useEffect, useCallback } from "react";
import { IconBackspace, IconX, IconCheck } from "@tabler/icons-react";

interface NumpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  title?: string;
  initialValue?: number;
  minValue?: number;
  maxValue?: number;
  isCurrency?: boolean;
  /**
   * @default true
   */
  triggerCloseAfterConfirm?: boolean;
}

export default function NumpadModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Masukkan Angka",
  initialValue = 0,
  minValue = 0,
  maxValue = 999999999,
  isCurrency = false,
  triggerCloseAfterConfirm = true,
}: NumpadModalProps) {
  const [value, setValue] = useState(String(initialValue || ""));

  useEffect(() => {
    if (isOpen) {
      setValue(String(initialValue || ""));
    }
  }, [isOpen, initialValue]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Enter") {
        handleConfirm();
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === "c" || e.key === "C") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, value]);

  const handleDigit = useCallback(
    (digit: string) => {
      setValue((prev) => {
        const newValue = prev === "0" ? digit : prev + digit;
        const numValue = parseInt(newValue, 10);
        if (numValue > maxValue) return prev;
        return newValue;
      });
    },
    [maxValue],
  );

  const handleBackspace = useCallback(() => {
    setValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  }, []);

  const handleClear = useCallback(() => {
    setValue("0");
  }, []);

  const handleConfirm = useCallback(() => {
    const numValue = parseInt(value, 10) || 0;
    if (numValue >= minValue && numValue <= maxValue) {
      onConfirm(numValue);
      if (triggerCloseAfterConfirm) {
        onClose();
      }
    }
  }, [value, minValue, maxValue, onConfirm, onClose, triggerCloseAfterConfirm]);

  const handleQuickAmount = useCallback(
    (amount: number) => {
      const current = parseInt(value, 10) || 0;
      const newValue = current + amount;
      if (newValue <= maxValue) {
        setValue(String(newValue));
      }
    },
    [value, maxValue],
  );

  const formatDisplay = (val: string) => {
    const num = parseInt(val, 10) || 0;
    if (isCurrency) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(num);
    }
    return num.toLocaleString("id-ID");
  };

  if (!isOpen) return null;

  const numValue = parseInt(value, 10) || 0;
  const isValid = numValue >= minValue && numValue <= maxValue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-slide-up overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-slate-100 border-b px-5 py-4 dark:border-slate-800">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="bg-slate-50 px-5 py-6 dark:bg-slate-800/50">
          <div className="text-right">
            <p className="font-bold font-mono text-3xl text-slate-900 dark:text-white">
              {formatDisplay(value)}
            </p>
          </div>
        </div>

        {isCurrency && (
          <div className="grid grid-cols-4 gap-2 border-slate-100 border-b px-5 py-3 dark:border-slate-800">
            {[10000, 20000, 50000, 100000].map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAmount(amount)}
                className="rounded-xl bg-primary-subtle px-2 py-2 font-medium text-primary text-xs transition-colors hover:bg-primary-subtle"
              >
                +{amount / 1000}rb
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 p-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(String(num))}
              className="h-14 rounded-2xl bg-slate-100 font-semibold text-2xl text-slate-800 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {num}
            </button>
          ))}

          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-warning-subtle font-semibold text-sm text-warning transition-all hover:bg-warning-subtle active:scale-95"
          >
            C
          </button>

          <button
            onClick={() => handleDigit("0")}
            className="h-14 rounded-2xl bg-slate-100 font-semibold text-2xl text-slate-800 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="flex h-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <IconBackspace size={24} />
          </button>
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-lg transition-all ${
              isValid
                ? "bg-primary text-primary-fg shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98]"
                : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700"
            }`}
          >
            <IconCheck size={22} />
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
}
