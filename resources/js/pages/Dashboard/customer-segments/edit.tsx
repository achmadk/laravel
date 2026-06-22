import DashboardLayout from "@/layouts/dashboard-layout";
import Form from "./form";

interface Segment {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
  description: string;
  auto_rule_type: string | null;
  rule_config: {
    min_total_spent: string;
    min_transaction_count: string;
    recent_days: string;
    inactivity_days_min: string;
    require_outstanding_receivable: boolean;
    overdue_only: boolean;
  } | null;
}

interface EditProps {
  segment: Segment;
}

export default function Edit({ segment }: EditProps) {
  return <Form mode="edit" segment={segment} />;
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
