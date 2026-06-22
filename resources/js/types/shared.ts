import type { Auth } from "./auth";

export type FlashProps = {
  type: string;
  message: string;
};

export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: Auth;
  sidebarOpen: boolean;
  flash: FlashProps;

  [key: string]: unknown;
}
