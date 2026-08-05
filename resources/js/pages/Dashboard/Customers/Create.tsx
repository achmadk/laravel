import { useEffect, useState } from "react";
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

interface CreateProps {
  provinces?: RegionOption[];
  tierOptions?: TierOption[];
}

export default function Create({ provinces = [], tierOptions = [] }: CreateProps) {
  const { errors } = usePage().props as any;
  const { data, setData, post, processing } = useForm({
    name: "",
    no_telp: "",
    address: "",
    is_loyalty_member: false,
    loyalty_tier: "regular",
    province_id: "",
    regency_id: "",
    district_id: "",
    village_id: "",
  });

  const [regencies, setRegencies] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [villages, setVillages] = useState<RegionOption[]>([]);

  useEffect(() => {
    setData("regency_id", "");
    setData("district_id", "");
    setData("village_id", "");
    setDistricts([]);
    setVillages([]);
    if (data.province_id) {
      // oxlint-disable-next-line typescript/no-floating-promises
      axios
        .get(regions.regencies.url(), { params: { province_id: data.province_id } })
        .then((res) => setRegencies(res.data));
    } else {
      setRegencies([]);
    }
  }, [data.province_id]);

  useEffect(() => {
    setData("district_id", "");
    setData("village_id", "");
    setVillages([]);
    if (data.regency_id) {
      // oxlint-disable-next-line typescript/no-floating-promises
      axios
        .get(regions.districts.url(), { params: { regency_id: data.regency_id } })
        .then((res) => setDistricts(res.data));
    } else {
      setDistricts([]);
    }
  }, [data.regency_id]);

  useEffect(() => {
    setData("village_id", "");
    if (data.district_id) {
      // oxlint-disable-next-line typescript/no-floating-promises
      axios
        .get(regions.villages.url(), { params: { district_id: data.district_id } })
        .then((res) => setVillages(res.data));
    } else {
      setVillages([]);
    }
  }, [data.district_id]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(customers.store.url());
  }

  return (
    <>
      <Head title="Tambah Pelanggan" />

      <div className="mb-6">
        <Link
          href={customers.index.url()}
          className="mb-3 inline-flex items-center gap-2 text-muted-fg text-sm hover:text-primary"
        >
          <IconArrowLeft size={16} />
          Kembali ke Pelanggan
        </Link>
        <Heading level={1} className="flex items-center gap-2">
          <IconUsers size={28} className="text-primary" />
          Tambah Pelanggan Baru
        </Heading>
      </div>

      <form onSubmit={submit}>
        <div className="max-w-3xl">
          <Card>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-medium text-muted-fg text-sm">
                    Nama Pelanggan
                  </label>
                  <Input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    // @ts-expect-error
                    isInvalid={!!errors.name}
                  />
                  {errors.name && <p className="mt-1 text-danger text-xs">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-muted-fg text-sm">
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
                  {errors.no_telp && <p className="mt-1 text-danger text-xs">{errors.no_telp}</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-primary-subtle-fg/20 bg-primary-subtle/50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-fg text-sm">Aktivasi Loyalty Member</p>
                    <p className="text-muted-fg text-xs">
                      Member mendapat poin, voucher, dan harga khusus.
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-muted-fg text-sm">
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
                    <label className="font-medium text-muted-fg text-sm">Tier Awal</label>
                    <select
                      value={data.loyalty_tier}
                      onChange={(e) => setData("loyalty_tier", e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-input bg-bg px-3 text-fg text-sm"
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="font-medium text-muted-fg text-sm">Provinsi</label>
                  <select
                    value={data.province_id}
                    onChange={(e) => setData("province_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm"
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.map((prov) => (
                      <option key={prov.code} value={prov.code}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                  {errors.province_id && (
                    <p className="mt-1 text-danger text-xs">{errors.province_id}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-muted-fg text-sm">Kota/Kabupaten</label>
                  <select
                    value={data.regency_id}
                    onChange={(e) => setData("regency_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm"
                    disabled={!data.province_id}
                  >
                    <option value="">Pilih Kota/Kabupaten</option>
                    {regencies.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {errors.regency_id && (
                    <p className="mt-1 text-danger text-xs">{errors.regency_id}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="font-medium text-muted-fg text-sm">Kecamatan</label>
                  <select
                    value={data.district_id}
                    onChange={(e) => setData("district_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm"
                    disabled={!data.regency_id}
                  >
                    <option value="">Pilih Kecamatan</option>
                    {districts.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {errors.district_id && (
                    <p className="mt-1 text-danger text-xs">{errors.district_id}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-muted-fg text-sm">Kelurahan</label>
                  <select
                    value={data.village_id}
                    onChange={(e) => setData("village_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm"
                    disabled={!data.district_id}
                  >
                    <option value="">Pilih Kelurahan</option>
                    {villages.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {errors.village_id && (
                    <p className="mt-1 text-danger text-xs">{errors.village_id}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-medium text-muted-fg text-sm">
                  Alamat Detail
                </label>
                <textarea
                  value={data.address}
                  onChange={(e) => setData("address", e.target.value)}
                  placeholder="Alamat lengkap pelanggan"
                  rows={3}
                  className="dark:scheme-dark relative block w-full appearance-none rounded-lg border border-input bg-(--control-bg,transparent) in-disabled:bg-muted px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] text-base/6 text-fg outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20 enabled:hover:border-muted-fg/30 focus:enabled:hover:border-ring/80 sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6"
                />
                {errors.address && <p className="mt-1 text-danger text-xs">{errors.address}</p>}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-3 border-border border-t pt-6">
            <Link href={customers.index.url()}>
              <Button intent="outline">Batal</Button>
            </Link>
            <Button type="submit" isDisabled={processing} intent="primary">
              <IconDeviceFloppy size={18} />
              {processing ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
