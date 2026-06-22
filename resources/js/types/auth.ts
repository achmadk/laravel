import type { User } from "@/types/user";

export interface Auth {
  user: User;
}

export interface BotGuardPayload {
  enabled: boolean;
  honeypot_field: string;
  token_field: string;
  token: string;
}
