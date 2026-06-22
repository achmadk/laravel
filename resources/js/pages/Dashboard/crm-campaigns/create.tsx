import DashboardLayout from "@/layouts/dashboard-layout";
import Form from "./form";
import type { AudienceOptions } from "./form";

interface CreateProps {
  audienceOptions: AudienceOptions;
}

export default function Create(props: CreateProps) {
  return <Form mode="create" {...props} />;
}

Create.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
