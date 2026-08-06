import { useEffect, useRef, useState } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import { IconArrowLeft, IconCrown, IconDeviceFloppy, IconInfoCircle } from "@tabler/icons-react";
import axios from "axios";
import toast from "react-hot-toast";
import { index, update, store } from "@/routes/members";
import regionsRouter from "@/routes/regions";

interface Region {
  code: string;
  name: string;
}

interface TierOption {
  value: string;
  label: string;
}

interface PageProps {
  provinces?: Region[];
  regencies?: Region[];
  districts?: Region[];
  villages?: Region[];
  tierOptions?: TierOption[];
  errors?: Record<string, string>;
  [key: string]: unknown;
}

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

interface FormProps {
  mode?: "create" | "edit";
  member?: Member | null;
}

export default function Form({ mode = "create", member = null }: FormProps) {
  const isEdit = mode === "edit";
  const {
    errors,
    provinces = [],
    regencies = [],
    districts = [],
    villages = [],
    tierOptions = [],
  } = usePage<PageProps>().props;

  const { data, setData, post, processing } = useForm({
    name: member?.name ?? "",
    no_telp: member?.no_telp ?? "",
    address: member?.address ?? "",
    is_loyalty_member: Boolean(member?.is_loyalty_member ?? true),
    loyalty_tier: member?.loyalty_tier ?? "regular",
    province_id: member?.province_id ?? "",
    regency_id: member?.regency_id ?? "",
    district_id: member?.district_id ?? "",
    village_id: member?.village_id ?? "",
    _method: isEdit ? "PUT" : "POST",
  });

  const [regencyList, setRegencyList] = useState<Region[]>(regencies);
  const [districtList, setDistrictList] = useState<Region[]>(districts);
  const [villageList, setVillageList] = useState<Region[]>(villages);
  const prevProvince = useRef<string | number | null>(member?.province_id ?? null);
  const prevRegency = useRef<string | number | null>(member?.regency_id ?? null);
  const prevDistrict = useRef<string | number | null>(member?.district_id ?? null);

  console.log("miro regencies", regencies);
  const fetchRegencies = async (provinceId: string | number) => {
    if (!provinceId) {
      setRegencyList([]);
      return;
    }
    const response = await axios.get("regencies", {
      params: { province_id: provinceId },
    });
    setRegencyList(response.data);
  };

  const fetchDistricts = async (regencyId: string | number) => {
    if (!regencyId) {
      setDistrictList([]);
      return;
    }
    const response = await axios.get(regionsRouter.districts().url, {
      params: { regency_id: regencyId },
    });
    setDistrictList(response.data);
  };

  const fetchVillages = async (districtId: string | number) => {
    if (!districtId) {
      setVillageList([]);
      return;
    }
    const response = await axios.get(regionsRouter.villages().url, {
      params: { district_id: districtId },
    });
    setVillageList(response.data);
  };

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
      fetchRegencies(data.province_id);
    } else {
      setRegencyList([]);
      setDistrictList([]);
      setVillageList([]);
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
      fetchDistricts(data.regency_id);
    } else {
      setDistrictList([]);
      setVillageList([]);
    }
    prevRegency.current = data.regency_id;
  }, [data.regency_id]);

  useEffect(() => {
    if (data.district_id) {
      if (prevDistrict.current && prevDistrict.current !== data.district_id) {
        setData("village_id", "");
      }
      // oxlint-disable-next-line typescript/no-floating-promises
      fetchVillages(data.district_id);
    } else {
      setVillageList([]);
    }
    prevDistrict.current = data.district_id;
  }, [data.district_id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(isEdit ? update(member!.id).url : store().url, {
      onSuccess: () =>
        toast.success(
          isEdit ? "Data member berhasil diperbarui" : "Member baru berhasil didaftarkan",
        ),
      onError: () =>
        toast.error(isEdit ? "Gagal memperbarui data member" : "Gagal mendaftarkan member"),
    });
  };

  return (
    <>
      <Head title={isEdit ? "Edit Member" : "Daftar Member Baru"} />

      <div className="w-full">
        <div className="mb-6">
          <Link
            href={index().url}
            className="mb-3 inline-flex items-center gap-2 text-smtext-muted-fg hover:text-primary"
          >
            <IconArrowLeft size={16} />
            Kembali ke Member
          </Link>
          <h1 className="font-bold text-2xl text-fg">
            {isEdit ? "Edit Member" : "Daftarkan Member Baru"}
          </h1>
          <p className="text-muted-fg text-sm">
            {isEdit
              ? "Kelola status, tier, dan data dasar member tanpa memutus histori transaksi maupun reward."
              : "Daftarkan pelanggan sebagai member agar langsung mendapatkan poin, benefit harga member, dan voucher personal."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-bg/80 p-2 text-primary">
                <IconInfoCircle size={18} />
              </div>
              <div>
                <p className="font-semibold text-fg text-sm">Cara kerja member</p>
                <p className="mt-1 text-fg text-xs leading-6">
                  Member otomatis memakai pricing khusus member, earn/redeem poin dari loyalty
                  settings, dan bisa menerima voucher personal di CRM.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <IconCrown size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-fg text-lg">Profil Member</h2>
                <p className="text-muted-fg text-sm">
                  Lengkapi identitas dasar member untuk pencarian dan histori CRM.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Nama Member</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                />
                {errors.name && <p className="mt-1 text-rose-500 text-xs">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">No. Handphone</label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={data.no_telp}
                  onChange={(e) => setData("no_telp", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                />
                {errors.no_telp && <p className="mt-1 text-rose-500 text-xs">{errors.no_telp}</p>}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-fg text-sm">Status Member</p>
                  <p className="text-muted-fg text-xs">
                    Nonaktifkan member jika benefit member perlu dihentikan tanpa menghapus histori.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 font-medium text-fg text-sm">
                  <input
                    type="checkbox"
                    checked={data.is_loyalty_member}
                    onChange={(e) => setData("is_loyalty_member", e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                  Aktif
                </label>
              </div>

              <div className="mt-4">
                <label className="font-medium text-fg text-sm">Tier Member</label>
                <select
                  value={data.loyalty_tier}
                  onChange={(e) => setData("loyalty_tier", e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-bg px-3 text-fg text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                >
                  {tierOptions.map((tier: TierOption) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
                {errors.loyalty_tier && (
                  <p className="mt-1 text-rose-500 text-xs">{errors.loyalty_tier}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg p-6">
            <h2 className="mb-4 font-semibold text-fg text-lg">Wilayah & Alamat</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="font-medium text-fg text-sm">Provinsi</label>
                <select
                  value={data.province_id}
                  onChange={(e) => setData("province_id", e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.map((province: Region) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {errors.province_id && (
                  <p className="mt-1 text-rose-500 text-xs">{errors.province_id}</p>
                )}
              </div>

              <div>
                <label className="font-medium text-fg text-sm">Kota/Kabupaten</label>
                <select
                  value={data.regency_id}
                  onChange={(e) => setData("regency_id", e.target.value)}
                  disabled={!data.province_id}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Pilih Kota/Kabupaten</option>
                  {regencyList.map((regency: Region) => (
                    <option key={regency.code} value={regency.code}>
                      {regency.name}
                    </option>
                  ))}
                </select>
                {errors.regency_id && (
                  <p className="mt-1 text-rose-500 text-xs">{errors.regency_id}</p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="font-medium text-fg text-sm">Kecamatan</label>
                <select
                  value={data.district_id}
                  onChange={(e) => setData("district_id", e.target.value)}
                  disabled={!data.regency_id}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Pilih Kecamatan</option>
                  {districtList.map((district: Region) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.district_id && (
                  <p className="mt-1 text-rose-500 text-xs">{errors.district_id}</p>
                )}
              </div>

              <div>
                <label className="font-medium text-fg text-sm">Kelurahan</label>
                <select
                  value={data.village_id}
                  onChange={(e) => setData("village_id", e.target.value)}
                  disabled={!data.district_id}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Pilih Kelurahan</option>
                  {villageList.map((village: Region) => (
                    <option key={village.code} value={village.code}>
                      {village.name}
                    </option>
                  ))}
                </select>
                {errors.village_id && (
                  <p className="mt-1 text-rose-500 text-xs">{errors.village_id}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block font-medium text-fg text-sm">Alamat Detail</label>
              <textarea
                rows={3}
                placeholder="Alamat lengkap member"
                value={data.address}
                onChange={(e) => setData("address", e.target.value)}
                className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
              />
              {errors.address && <p className="mt-1 text-rose-500 text-xs">{errors.address}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-border border-t pt-6">
            <Link
              href={index().url}
              className="rounded-xl border border-input px-5 py-2.5 font-medium text-muted-fg transition-colors hover:bg-muted"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-fg transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <IconDeviceFloppy size={18} />
              {processing ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Daftarkan Member"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
