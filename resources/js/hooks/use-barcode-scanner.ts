import { useState, useEffect, useCallback, useRef } from "react";

interface UseBarcodeScannerOptions {
  minLength?: number;
  maxDelay?: number;
  enabled?: boolean;
  ignoreInputs?: string[];
}

interface UseBarcodeScannerReturn {
  lastBarcode: string;
  isScanning: boolean;
  reset: () => void;
}

/**
 * useBarcodeScanner - Hook for handling barcode scanner input
 *
 * Barcode scanners typically type characters rapidly followed by Enter.
 * This hook detects that pattern and triggers a callback.
 */
export default function useBarcodeScanner(
  onScan: (barcode: string) => void,
  options: UseBarcodeScannerOptions = {},
): UseBarcodeScannerReturn {
  const {
    minLength = 3,
    maxDelay = 50,
    enabled = true,
    ignoreInputs = ["text", "number", "search", "password"],
  } = options;

  const [lastBarcode, setLastBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    bufferRef.current = "";
    setIsScanning(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if typing in input fields
      const activeElement = document.activeElement;
      if (activeElement) {
        const tagName = activeElement.tagName.toLowerCase();
        const inputType = activeElement.getAttribute("type")?.toLowerCase();

        if (tagName === "textarea") return;
        if (tagName === "input" && ignoreInputs.includes(inputType || "text")) return;
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      // If too much time has passed, reset buffer
      if (timeSinceLastKey > maxDelay && bufferRef.current.length > 0) {
        bufferRef.current = "";
      }

      lastKeyTimeRef.current = now;

      // Handle Enter key - end of barcode
      if (e.key === "Enter") {
        if (bufferRef.current.length >= minLength) {
          const barcode = bufferRef.current;
          setLastBarcode(barcode);
          setIsScanning(false);
          onScan(barcode);
        }
        bufferRef.current = "";
        return;
      }

      // Only accept alphanumeric characters and common barcode chars
      if (e.key.length === 1 && /^[a-zA-Z0-9\-_.]$/.test(e.key)) {
        bufferRef.current += e.key;
        setIsScanning(true);

        // Clear timeout and set new one
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          // Reset if no more input
          bufferRef.current = "";
          setIsScanning(false);
        }, maxDelay * 3);
      }
    },
    [enabled, minLength, maxDelay, ignoreInputs, onScan],
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, handleKeyDown]);

  return {
    lastBarcode,
    isScanning,
    reset,
  };
}
