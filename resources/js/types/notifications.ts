import type { PageProps } from "@inertiajs/core";

export interface LowStockNotificationItem {
  id: number;
  title: string;
  stock: number;
  time: string;
}

export interface ReceivableNotificationItem {
  id: number;
  title: string;
  customer_id: number | null;
  due_date: string;
  remaining: number;
  status: string;
  time: string;
}

export interface PayableNotificationItem {
  id: number;
  title: string;
  supplier_id: number | null;
  due_date: string;
  remaining: number;
  status: string;
  time: string;
}

export interface NotificationsProps extends PageProps {
  notifications?: {
    low_stock: LowStockNotificationItem[];
    receivables: ReceivableNotificationItem[];
    payables: PayableNotificationItem[];
  };
}

export type BellNotification =
  | (Omit<LowStockNotificationItem, "id"> & { id: string; subtitle: string; type: "stock"; originalId: number })
  | (Omit<ReceivableNotificationItem, "id"> & { id: string; subtitle: string; type: "receivable" })
  | (Omit<PayableNotificationItem, "id"> & { id: string; subtitle: string; type: "payable" });