import DashboardLayout from "@/layouts/dashboard-layout";
import PricingRuleForm from "./Form";

interface Product {
  id: number;
  title: string;
}

interface Category {
  id: number;
  name: string;
}

interface TierOption {
  value: string;
  label: string;
}

interface PricingRule {
  id: number;
  name: string;
  kind: string;
  is_active: boolean;
  priority: number;
  target_type: string;
  product_id: number | null;
  category_id: number | null;
  customer_scope: string;
  eligible_loyalty_tiers: string[];
  discount_type: string;
  discount_value: number;
  preview_quantity_multiplier: number;
  starts_at: string | null;
  ends_at: string | null;
  notes: string;
  qty_breaks: {
    min_qty: number;
    discount_type: string;
    discount_value: number;
    sort_order: number;
  }[];
  bundle_items: { product_id: number; quantity: number; sort_order: number }[];
  buy_get_items: { product_id: number; role: string; quantity: number; sort_order: number }[];
}

interface EditProps {
  rule: PricingRule;
  products: Product[];
  categories: Category[];
  tierOptions: TierOption[];
  kindOptions: TierOption[];
}

export default function Edit(props: EditProps) {
  return <PricingRuleForm mode="edit" {...props} />;
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
