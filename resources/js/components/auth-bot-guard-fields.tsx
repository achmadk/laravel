import type { BotGuardPayload } from "@/types/auth";

interface AuthBotGuardFieldsProps {
  botGuard?: BotGuardPayload | null;
  data: Record<string, unknown>;
  setData: (field: string, value: unknown) => void;
}

export default function AuthBotGuardFields({ botGuard, data, setData }: AuthBotGuardFieldsProps) {
  if (!botGuard?.enabled) {
    return null;
  }

  const honeypotField = botGuard.honeypot_field ?? "company_website";
  const tokenField = botGuard.token_field ?? "bot_guard_token";

  return (
    <div className="hidden" aria-hidden="true">
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        name={honeypotField}
        value={(data[honeypotField] as string) ?? ""}
        onChange={(event) => setData(honeypotField, event.target.value)}
      />
      <input type="hidden" name={tokenField} value={(data[tokenField] as string) ?? ""} readOnly />
    </div>
  );
}
