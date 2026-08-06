import { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { IconBuildingStore, IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import suppliers from "@/routes/suppliers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/dashboard/empty-state";
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

interface SuppliersIndexProps {
  suppliers: Supplier[];
}

export default function Index({ suppliers: supplierData }: SuppliersIndexProps) {
  const { can } = useAuthorization();
  const [editing, setEditing] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const canManageSuppliers = can("suppliers-access");
  const {
    data,
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

  const startEdit = (supplier: Supplier) => {
    setEditing(supplier.id);
    setData({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
  };

  const cancel = () => {
    setEditing(null);
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
        onSuccess: () => reset(),
      });
    }
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

  return (
    <>
      <Head title="Supplier" />

      <div className="mb-6">
        <Heading level={1} className="flex items-center gap-2">
          <IconBuildingStore size={26} className="text-primary" />
          Supplier
        </Heading>
        <p className="mt-0.5 text-muted-fg text-sm">Data pemasok untuk pencatatan hutang.</p>
      </div>

      {canManageSuppliers && (
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
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  required
                  placeholder="Nama supplier"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-muted-fg text-sm">Telepon</label>
                <Input
                  value={data.phone}
                  onChange={(e) => setData("phone", e.target.value)}
                  placeholder="No. telepon"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-muted-fg text-sm">Email</label>
                <Input
                  value={data.email}
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
                  value={data.address}
                  onChange={(e) => setData("address", e.target.value)}
                  placeholder="Alamat"
                />
              </div>
              <div className="flex gap-2 md:col-span-4">
                <Button type="submit" isDisabled={processing} intent="primary">
                  {editing ? "Update" : "Simpan"}
                </Button>
                {editing && (
                  <Button type="button" intent="outline" onPress={cancel}>
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {supplierData.length ? (
            supplierData.map((sup) => (
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
            <EmptyState title="Belum Ada Supplier" description="Tambahkan supplier pertama Anda." />
          )}
        </CardContent>
      </Card>

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
