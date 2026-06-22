import { useEffect, useRef, useState } from "react";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import { IconUsers, IconDeviceFloppy, IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import DashboardLayout from "@/layouts/dashboard-layout";
import customers from "@/routes/customers";
import regions from "@/routes/regions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";

interface RegionOption {
  code: string;
  name: string;
}

interface TierOption {
  value: string;
  label: string;
}

interface CustomerData {
  id: number;
  name: string;
  no_telp: string | null;
  address: string | null;
  is_loyalty_member: boolean;
  loyalty_tier: string | null;
  loyalty_points: number;
  member_code: string | null;
  province_id: string | null;
  regency_id: string | null;
  district_id: string | null;
  village_id: string | null;
}

interface EditProps {
  customer: CustomerData;
  provinces?: RegionOption[];
  regencies?: RegionOption[];
  districts?: RegionOption[];
  villages?: RegionOption[];
  tierOptions?: TierOption[];
}

export default function Edit({
  customer,
  provinces = [],
  regencies: initialRegencies = [],
  districts: initialDistricts = [],
  villages: initialVillages = [],
  tierOptions = [],
}: EditProps) {
  const { errors } = usePage().props as any;
  const { data, setData, post, processing } = useForm({
    _method: "PUT",
    name: customer.name,
    no_telp: customer.no_telp ?? "",
    address: customer.address ?? "",
    is_loyalty_member: Boolean(customer.is_loyalty_member),
    loyalty_tier: customer.loyalty_tier || "regular",
    province_id: customer.province_id ?? "",
    regency_id: customer.regency_id ?? "",
    district_id: customer.district_id ?? "",
    village_id: customer.village_id ?? "",
  });

  const [regencyList, setRegencyList] = useState<RegionOption[]>(initialRegencies);
  const [districtList, setDistrictList] = useState<RegionOption[]>(initialDistricts);
  const [villageList, setVillageList] = useState<RegionOption[]>(initialVillages);

  const prevProvince = useRef(data.province_id);
  const prevRegency = useRef(data.regency_id);
  const prevDistrict = useRef(data.district_id);

  useEffect(() => {
    if (data.province_id) {
      if (prevProvince.current && prevProvince.current !== data.province_id) {
        setData("regency_id", "");
        setData("district_id", "");
        setData("village_id", "");
        setDistrictList([]);
        setVillageList([]);
      }
      // oxlint-disable-next-line typescript/no-floating-promises
      axios
        .get(regions.regencies.url(), { params: { province_id: data.province_id } })
        .then((res) => setRegencyList(res.data));
    } else {
      setRegencyList([]);
      setDistrictList([]);
      setVillageList([]);
      setData("regency_id", "");
      setData("district_id", "");
      setData("village_id", "");
    }
    prevProvince.current = data.province_id;
  }, [data.province_id]);

  useEffect(() => {
    if (data.regency_id) {
      if (prevRegency.current && prevRegency.current !== data.regency_id) {
        setData("district_id", "");
        setData("village_id", "");
        setVillageList([]);
      }
      // oxlint-disable-next-line typescript/no-floating-promises
      axios
        .get(regions.districts.url(), { params: { regency_id: data.regency_id } })
        .then((res) => setDistrictList(res.data));
    } else {
      setDistrictList([]);
      setVillageList([]);
      setData("district_id", "");
      setData("village_id", "");
    }
    prevRegency.current = data.regency_id;
  }, [data.regency_id]);

  useEffect(() => {
    if (data.district_id) {
      if (prevDistrict.current && prevDistrict.current !== data.district_id) {
        setData("village_id", "");
      }
      // oxlint-disable-next-line typescript/no-floating-promises
      axios
        .get(regions.villages.url(), { params: { district_id: data.district_id } })
        .then((res) => setVillageList(res.data));
    } else {
      setVillageList([]);
      setData("village_id", "");
    }
    prevDistrict.current = data.district_id;
  }, [data.district_id]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(customers.update.url({ customer: customer.id }));
  }

  return (
    <>
      <Head title="Edit Pelanggan" />

      <div className="mb-6">
        <Link
          href={customers.index.url()}
          className="inline-flex items-center gap-2 text-sm text-muted-fg hover:text-primary mb-3"
        >
          <IconArrowLeft size={16} />
          Kembali ke Pelanggan
        </Link>
        <Heading level={1} className="flex items-center gap-2">
          <IconUsers size={28} className="text-primary" />
          Edit Pelanggan
        </Heading>
        <p className="text-sm text-muted-fg mt-1">{customer.name}</p>
      </div>

      <form onSubmit={submit}>
        <div className="max-w-3xl">
          <Card>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-fg mb-1.5">
                    Nama Pelanggan
                  </label>
                  <Input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    placeholder="Nama lengkap"
                    // @ts-expect-error
                    isInvalid={!!errors.name}
                  />
                  {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-fg mb-1.5">
                    No. Handphone
                  </label>
                  <Input
                    type="text"
                    value={data.no_telp}
                    onChange={(e) => setData("no_telp", e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    // @ts-expect-error
                    isInvalid={!!errors.no_telp}
                  />
                  {errors.no_telp && <p className="mt-1 text-xs text-danger">{errors.no_telp}</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-primary-subtle-fg/20 bg-primary-subtle/50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-fg">Status Loyalty</p>
                    <p className="text-xs text-muted-fg">
                      Member code: {customer.member_code || "-"} | poin saat ini:{" "}
                      {customer.loyalty_points || 0}
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-muted-fg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.is_loyalty_member}
                      onChange={(e) => setData("is_loyalty_member", e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary"
                    />
                    Member
                  </label>
                </div>

                {data.is_loyalty_member && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-muted-fg">Tier Member</label>
                    <select
                      value={data.loyalty_tier}
                      onChange={(e) => setData("loyalty_tier", e.target.value)}
                      className="mt-2 w-full h-11 rounded-xl border border-input bg-bg px-3 text-sm text-fg"
                    >
                      {tierOptions.map((tier) => (
                        <option key={tier.value} value={tier.value}>
                          {tier.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-fg">Provinsi</label>
                  <select
                    value={data.province_id}
                    onChange={(e) => setData("province_id", e.target.value)}
                    className="w-full h-11 rounded-xl border border-input bg-muted px-3 text-sm text-fg"
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.map((prov) => (
                      <option key={prov.code} value={prov.code}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                  {errors.province_id && (
                    <p className="text-xs text-danger mt-1">{errors.province_id}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-fg">Kota/Kabupaten</label>
                  <select
                    value={data.regency_id}
                    onChange={(e) => setData("regency_id", e.target.value)}
                    className="w-full h-11 rounded-xl border border-input bg-muted px-3 text-sm text-fg"
                    disabled={!data.province_id}
                  >
                    <option value="">Pilih Kota/Kabupaten</option>
                    {regencyList.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {errors.regency_id && (
                    <p className="text-xs text-danger mt-1">{errors.regency_id}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-fg">Kecamatan</label>
                  <select
                    value={data.district_id}
                    onChange={(e) => setData("district_id", e.target.value)}
                    className="w-full h-11 rounded-xl border border-input bg-muted px-3 text-sm text-fg"
                    disabled={!data.regency_id}
                  >
                    <option value="">Pilih Kecamatan</option>
                    {districtList.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {errors.district_id && (
                    <p className="text-xs text-danger mt-1">{errors.district_id}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-fg">Kelurahan</label>
                  <select
                    value={data.village_id}
                    onChange={(e) => setData("village_id", e.target.value)}
                    className="w-full h-11 rounded-xl border border-input bg-muted px-3 text-sm text-fg"
                    disabled={!data.district_id}
                  >
                    <option value="">Pilih Kelurahan</option>
                    {villageList.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {errors.village_id && (
                    <p className="text-xs text-danger mt-1">{errors.village_id}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-fg mb-1.5">
                  Alamat Detail
                </label>
                <textarea
                  value={data.address}
                  onChange={(e) => setData("address", e.target.value)}
                  placeholder="Alamat lengkap"
                  rows={3}
                  className="relative block w-full appearance-none rounded-lg bg-(--control-bg,transparent) px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] text-base/6 text-fg placeholder:text-muted-fg sm:text-sm/6 border border-input enabled:hover:border-muted-fg/30 outline-hidden focus:border-ring/70 focus:ring-3 focus:ring-ring/20 focus:enabled:hover:border-ring/80 in-disabled:bg-muted dark:scheme-dark"
                />
                {errors.address && <p className="mt-1 text-xs text-danger">{errors.address}</p>}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
            <Link href={customers.index.url()}>
              <Button intent="outline">Batal</Button>
            </Link>
            <Button type="submit" isDisabled={processing} intent="primary">
              <IconDeviceFloppy size={18} />
              {processing ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
