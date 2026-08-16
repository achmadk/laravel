interface SimpleBarcodeProps {
  value?: string | null;
  className?: string;
}

export default function SimpleBarcode({ value = "", className = "" }: SimpleBarcodeProps) {
  const bars = (value || "")
    .split("")
    .map((char, idx) => {
      const weight = (char.charCodeAt(0) + idx * 17) % 5;
      return 2 + weight;
    });

  if (bars.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-end justify-center gap-[2px] mt-2 ${className}`}>
      {bars.map((w, i) => (
        <span
          key={i}
          style={{ width: `${w}px` }}
          className="h-10 bg-black block"
        />
      ))}
    </div>
  );
}