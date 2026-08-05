import DashboardLayout from "@/layouts/dashboard-layout";
import Form from "./Form";
import type { AudienceOptions } from "./Form";

interface Campaign {
  id: number;
  name: string;
  type: string;
  channel: string;
  message_template: string;
  audience_filters: {
    segment_ids: number[];
    customer_type: string;
    receivable_status: string;
    voucher_filter: string;
  } | null;
}

interface EditProps {
  campaign: Campaign;
  audienceOptions: AudienceOptions;
}

export default function Edit(props: EditProps) {
  return <Form mode="edit" campaign={props.campaign} audienceOptions={props.audienceOptions} />;
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
