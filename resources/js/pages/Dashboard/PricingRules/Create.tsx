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

interface CreateProps {
  products: Product[];
  categories: Category[];
  tierOptions: TierOption[];
  kindOptions: TierOption[];
}

export default function Create(props: CreateProps) {
  return <PricingRuleForm mode="create" {...props} />;
}

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
