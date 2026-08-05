import DashboardLayout from "@/layouts/dashboard-layout";
import Form from "./Form";

export default function Create() {
  return <Form mode="create" />;
}

Create.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
