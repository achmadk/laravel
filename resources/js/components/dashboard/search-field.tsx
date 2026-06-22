import { useEffect, useRef, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Input, InputGroup } from "@/components/ui/input";

interface SearchFieldProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export function SearchField({
  placeholder = "Cari...",
  value,
  onChange,
  debounceMs = 300,
  className,
}: SearchFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : localValue;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;

    if (!isControlled) {
      setLocalValue(newValue);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <InputGroup className={className}>
      <IconSearch data-slot="icon" />
      <Input type="search" placeholder={placeholder} value={displayValue} onChange={handleChange} />
    </InputGroup>
  );
}
