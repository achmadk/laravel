import DashboardLayout from "@/layouts/dashboard-layout";
import CustomerVoucherForm from "./Form";

interface Customer {
  id: number;
  name: string;
  no_telp: string | null;
  is_loyalty_member: boolean;
  loyalty_tier: string | null;
  loyalty_points: number;
}

interface Voucher {
  id: number;
  customer_id: number | null;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  minimum_order: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  notes: string;
}

interface EditProps {
  voucher: Voucher;
  customers: Customer[];
}

export default function Edit(props: EditProps) {
  return <CustomerVoucherForm mode="edit" {...props} />;
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
