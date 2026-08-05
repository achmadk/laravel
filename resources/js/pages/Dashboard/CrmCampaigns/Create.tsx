import DashboardLayout from "@/layouts/dashboard-layout";
import Form from "./Form";
import type { AudienceOptions } from "./Form";

interface CreateProps {
  audienceOptions: AudienceOptions;
}

export default function Create(props: CreateProps) {
  return <Form mode="create" {...props} />;
}

Create.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
