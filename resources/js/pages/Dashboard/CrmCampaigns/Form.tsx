import crmCampaigns from "@/routes/crm-campaigns";
import { Head, useForm, Link } from "@inertiajs/react";
import { IconArrowLeft, IconBroadcast, IconDeviceFloppy } from "@tabler/icons-react";

interface SegmentOption {
  value: number | string;
  label: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export interface AudienceOptions {
  segment_options: SegmentOption[];
  customer_types: SelectOption[];
  receivable_statuses: SelectOption[];
  voucher_filters: SelectOption[];
}

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

interface FormProps {
  mode?: "create" | "edit";
  campaign?: Campaign | null;
  audienceOptions: AudienceOptions;
}

export default function Form({ mode = "create", campaign = null, audienceOptions }: FormProps) {
  const isEdit = mode === "edit";
  const { data, setData, post, put, processing } = useForm({
    name: campaign?.name ?? "",
    type: campaign?.type ?? "promo_broadcast",
    channel: campaign?.channel ?? "whatsapp_link",
    message_template: campaign?.message_template ?? "Halo {{name}}, ada promo spesial untuk Anda.",
    save_as_draft: true,
    audience_filters: {
      segment_ids: campaign?.audience_filters?.segment_ids ?? [],
      customer_type: campaign?.audience_filters?.customer_type ?? "all",
      receivable_status: campaign?.audience_filters?.receivable_status ?? "all",
      voucher_filter: campaign?.audience_filters?.voucher_filter ?? "all",
    },
  });

  const setAudienceFilter = (key: string, value: string | number[] | number) => {
    setData("audience_filters", { ...data.audience_filters, [key]: value });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(crmCampaigns.update(campaign!.id).url);
      // put(route("crm-campaigns.update", campaign!.id));
      return;
    }
    post(crmCampaigns.store().url);
  };

  return (
    <>
      <Head title={isEdit ? "Edit CRM Campaign" : "Buat CRM Campaign"} />

      <div className="w-full">
        <div className="mb-6">
          <Link
            href={crmCampaigns.index().url}
            className="mb-3 inline-flex items-center gap-2 text-smtext-muted-fg hover:text-primary"
          >
            <IconArrowLeft size={16} />
            Kembali ke CRM campaigns
          </Link>
          <h1 className="font-bold text-2xl text-fg">
            {isEdit ? "Edit CRM Campaign" : "Buat CRM Campaign"}
          </h1>
          <p className="text-muted-fg text-sm">
            Bangun audience dari segment dan siapkan campaign WhatsApp/manual follow-up.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="rounded-2xl border border-border bg-bg p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
                <IconBroadcast size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-fg text-lg">Informasi Campaign</h2>
                <p className="text-muted-fg text-sm">
                  Campaign disimpan sebagai draft dan dapat diproses menjadi audience nyata.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Nama Campaign</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Tipe Campaign</label>
                <select
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                >
                  <option value="promo_broadcast">Promo Broadcast</option>
                  <option value="due_date_reminder">Due Date Reminder</option>
                  <option value="repeat_order_reminder">Repeat Order Reminder</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Channel</label>
                <select
                  value={data.channel}
                  onChange={(e) => setData("channel", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                >
                  <option value="internal">Internal</option>
                  <option value="whatsapp_link">WhatsApp Link</option>
                </select>
              </div>
              <label className="inline-flex items-center gap-3 rounded-2xl border border-input bg-muted px-4 py-3">
                <input
                  type="checkbox"
                  checked={data.save_as_draft}
                  onChange={(e) => setData("save_as_draft", e.target.checked)}
                />
                <span className="font-medium text-fg text-sm">Simpan sebagai draft</span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg p-5">
            <h2 className="mb-4 font-semibold text-fg text-lg">Audience Builder</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block font-medium text-fg text-sm">Segment Customer</label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {audienceOptions.segment_options.map((segment) => {
                    const checked = data.audience_filters.segment_ids.includes(
                      Number(segment.value),
                    );
                    return (
                      <label
                        key={segment.value}
                        className="flex items-center gap-2 rounded-xl border border-input bg-muted px-4 py-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const nextValues = e.target.checked
                              ? [...data.audience_filters.segment_ids, Number(segment.value)]
                              : data.audience_filters.segment_ids.filter(
                                  (v) => v !== Number(segment.value),
                                );
                            setAudienceFilter("segment_ids", nextValues);
                          }}
                        />
                        <span>{segment.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Customer Type</label>
                <select
                  value={data.audience_filters.customer_type}
                  onChange={(e) => setAudienceFilter("customer_type", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                >
                  {audienceOptions.customer_types.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Status Piutang</label>
                <select
                  value={data.audience_filters.receivable_status}
                  onChange={(e) => setAudienceFilter("receivable_status", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                >
                  {audienceOptions.receivable_statuses.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Voucher Filter</label>
                <select
                  value={data.audience_filters.voucher_filter}
                  onChange={(e) => setAudienceFilter("voucher_filter", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                >
                  {audienceOptions.voucher_filters.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg p-5">
            <h2 className="mb-4 font-semibold text-fg text-lg">Template Pesan</h2>
            <textarea
              rows={5}
              value={data.message_template}
              onChange={(e) => setData("message_template", e.target.value)}
              className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-3 border-border border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={crmCampaigns.index().url}
              className="inline-flex items-center justify-center rounded-xl border border-input bg-bg px-5 py-2.5 font-medium text-muted-fg text-sm hover:bg-muted"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-fg hover:bg-primary/90 disabled:opacity-50"
            >
              <IconDeviceFloppy size={18} />
              {processing ? "Menyimpan..." : "Simpan Campaign"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
