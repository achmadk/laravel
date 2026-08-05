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

interface CreateProps {
  customers: Customer[];
}

export default function Create(props: CreateProps) {
  return <CustomerVoucherForm mode="create" {...props} />;
}

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
