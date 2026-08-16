import { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { IconBuildingStore, IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import suppliers from "@/routes/suppliers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { SearchField } from "@/components/dashboard/search-field";
import { Pagination } from "@/components/dashboard/pagination";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalClose,
} from "@/components/ui/modal";

interface Supplier {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface SuppliersResponse {
  data: Supplier[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface SuppliersIndexProps {
  suppliers: SuppliersResponse;
  filters: { search?: string };
}

export default function Index({ suppliers: data, filters }: SuppliersIndexProps) {
  const { can } = useAuthorization();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState(filters.search ?? "");
  const canManageSuppliers = can("suppliers-access");
  const {
    data: form,
    setData,
    post,
    put,
    // oxlint-disable-next-line no-unused-vars
    delete: destroy,
    processing,
    reset,
  } = useForm({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const openAddForm = () => {
    setEditing(null);
    setShowForm(true);
    reset();
  };

  const startEdit = (supplier: Supplier) => {
    setEditing(supplier.id);
    setShowForm(true);
    setData({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
  };

  const cancel = () => {
    setEditing(null);
    setShowForm(false);
    reset();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      put(suppliers.update.url({ supplier: editing }), {
        onSuccess: () => cancel(),
      });
    } else {
      post(suppliers.store.url(), {
        onSuccess: () => cancel(),
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(suppliers.index.url(), { search }, { preserveState: true, preserveScroll: true });
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      router.delete(suppliers.destroy.url({ supplier: deletingId }));
    }
    setIsDeleteOpen(false);
    setDeletingId(null);
  };

  const searching = search.trim().length > 0;

  return (
    <>
      <Head title="Supplier" />

      <PageHeader
        title="Supplier"
        description={`${data.total} supplier terdaftar`}
        icon={<IconBuildingStore size={20} />}
        actions={
          canManageSuppliers && !showForm && (
            <Button intent="primary" onPress={openAddForm}>
              <IconPlus size={18} />
              Tambah Supplier
            </Button>
          )
        }
      />

      <FilterBar onSubmit={handleSearchSubmit}>
        <div className="w-full sm:w-80">
          <SearchField placeholder="Cari nama, telepon, email..." value={search} onChange={setSearch} />
        </div>
      </FilterBar>

      {canManageSuppliers && showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              {editing ? <IconPencil size={16} /> : <IconPlus size={16} />}
              {editing ? "Edit Supplier" : "Tambah Supplier Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="md:col-span-1">
                <label className="mb-1 block font-semibold text-muted-fg text-sm">Nama</label>
                <Input
                  value={form.name}
                  onChange={(e) => setData("name", e.target.value)}
                  required
                  placeholder="Nama supplier"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-muted-fg text-sm">Telepon</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setData("phone", e.target.value)}
                  placeholder="No. telepon"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-muted-fg text-sm">Email</label>
                <Input
                  value={form.email}
                  onChange={(e) => setData("email", e.target.value)}
                  type="email"
                  placeholder="email@example.com"
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block font-semibold text-muted-fg text-sm">Alamat</label>
                <textarea
                  rows={3}
                  className="dark:scheme-dark relative block w-full appearance-none rounded-lg border border-input bg-(--control-bg,transparent) in-disabled:bg-muted px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] text-base/6 text-fg outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20 enabled:hover:border-muted-fg/30 focus:enabled:hover:border-ring/80 sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6"
                  value={form.address}
                  onChange={(e) => setData("address", e.target.value)}
                  placeholder="Alamat"
                />
              </div>
              <div className="flex gap-2 md:col-span-4">
                <Button type="submit" isDisabled={processing} intent="primary">
                  {editing ? "Update" : "Simpan"}
                </Button>
                <Button type="button" intent="outline" onPress={cancel}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {data.data.length ? (
            data.data.map((sup) => (
              <div key={sup.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-fg text-sm">{sup.name}</p>
                  <p className="text-muted-fg text-xs">
                    {sup.phone || "-"} &bull; {sup.email || "-"}
                  </p>
                  {sup.address && <p className="text-muted-fg text-xs">{sup.address}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {canManageSuppliers && (
                    <>
                      <Button intent="plain" size="sq-sm" onPress={() => startEdit(sup)}>
                        <IconPencil size={16} />
                      </Button>
                      <Button intent="plain" size="sq-sm" onPress={() => handleDeleteClick(sup.id)}>
                        <IconTrash size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title={searching ? "Tidak Ditemukan" : "Belum Ada Supplier"}
              description={
                searching
                  ? "Tidak ada supplier yang cocok dengan pencarian Anda."
                  : "Tambahkan supplier pertama Anda."
              }
            />
          )}
        </CardContent>
      </Card>

      {data.last_page > 1 && <Pagination links={data.links} />}

      <Modal isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Konfirmasi Hapus</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-muted-fg text-sm">Hapus supplier ini?</p>
          </ModalBody>
          <ModalFooter>
            <ModalClose>Batal</ModalClose>
            <Button intent="danger" onPress={handleDeleteConfirm}>
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;