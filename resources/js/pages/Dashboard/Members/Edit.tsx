import DashboardLayout from "@/layouts/dashboard-layout";
import Form from "./Form";

interface Member {
  id: number;
  name: string;
  no_telp: string;
  address: string;
  is_loyalty_member: boolean;
  loyalty_tier: string;
  province_id: string | number;
  regency_id: string | number;
  district_id: string | number;
  village_id: string | number;
}

interface EditProps {
  member: Member;
}

export default function Edit({ member }: EditProps) {
  return <Form mode="edit" member={member} />;
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
