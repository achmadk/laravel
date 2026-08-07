import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type ColorScheme, type Theme, useTheme } from "@/hooks/use-theme";

interface Themes {
  value: Theme;
  icon: React.FC<React.SVGAttributes<SVGSVGElement>>;
  label: string;
}

const SCHEMES: { value: ColorScheme; label: string; preview: string }[] = [
  { value: "default", label: "Default", preview: "#1e3a8a" },
  { value: "1", label: "Navy", preview: "#172554" },
  { value: "2", label: "Ocean", preview: "#075985" },
  { value: "3", label: "Teal", preview: "#155e75" },
  { value: "4", label: "Violet", preview: "#312e81" },
  { value: "5", label: "Graphite", preview: "#111827" },
];

export function ThemeSwitcher() {
  const { theme, updateTheme } = useTheme();
  const themes: Themes[] = [
    { value: "light", icon: SunIcon, label: "Light" },
    {
      value: "dark",
      icon: MoonIcon,
      label: "Dark",
    },
    {
      value: "system",
      icon: ComputerDesktopIcon,
      label: "System",
    },
  ];

  return (
    <ToggleGroup
      size="sm"
      selectedKeys={new Set([theme])}
      onSelectionChange={(v) => {
        // @ts-expect-error
        updateTheme([...v][0]);
      }}
      selectionMode="single"
      aria-label="Choose theme"
    >
      {themes.map((theme) => (
        <ToggleGroupItem key={theme.value} id={theme.value} aria-label={theme.value}>
          <theme.icon />
          {theme.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function SchemeSwitcher() {
  const { scheme, updateScheme } = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-4" role="radiogroup" aria-label="Color scheme">
      {SCHEMES.map((s) => {
        const active = scheme === s.value;
        return (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={s.label}
            title={s.label}
            onClick={() => updateScheme(s.value)}
            className={`flex flex-col items-center gap-1.5 rounded-lg p-1 transition-opacity ${
              active ? "text-fg" : "text-muted-fg hover:text-fg hover:opacity-80"
            }`}
          >
            <span
              className={`size-8 rounded-full border border-border transition-shadow ${
                active ? "ring-2 ring-ring ring-offset-2 ring-offset-bg" : ""
              }`}
              style={{ backgroundColor: s.preview }}
            />
            <span className="text-xs">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
