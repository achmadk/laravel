import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
  IconCirclePlus,
  IconPencilCog,
  IconTrash,
  IconLayoutGrid,
  IconList,
  IconUser,
  IconPhone,
  IconMapPin,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import customers from "@/routes/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { SearchField } from "@/components/dashboard/search-field";
import { Pagination } from "@/components/dashboard/pagination";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalClose,
} from "@/components/ui/modal";

interface Customer {
  id: number;
  name: string;
  avatar: string | null;
  no_telp: string | null;
  address: string | null;
  is_loyalty_member: boolean;
  loyalty_tier: string | null;
  loyalty_points: number;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface CustomersResponse {
  data: Customer[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface IndexProps {
  customers: CustomersResponse;
}

function CustomerCard({
  customer,
  onDelete,
  canUpdate,
  canDelete,
}: {
  customer: Customer;
  onDelete: (url: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-bg p-5 transition-all duration-200 hover:border-muted-fg/30 hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {customer.avatar ? (
            <img
              src={customer.avatar}
              alt={customer.name}
              className="h-12 w-12 flex-shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 font-semibold text-lg text-white">
              {customer.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-base text-fg">
              <Link
                href={customers.show.url({ customer: customer.id })}
                className="hover:text-primary"
              >
                {customer.name}
              </Link>
            </h3>
            <div className="mt-1 flex flex-wrap gap-1">
              <StatusBadge
                variant={customer.is_loyalty_member ? "info" : "neutral"}
                label={customer.is_loyalty_member ? (customer.loyalty_tier ?? "") : "non-member"}
              />
              <StatusBadge variant="neutral" label={`${customer.loyalty_points || 0} poin`} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        {customer.no_telp && (
          <div className="flex items-center gap-2 text-muted-fg text-sm">
            <IconPhone size={16} />
            <span>{customer.no_telp}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex items-start gap-2 text-muted-fg text-sm">
            <IconMapPin size={16} className="mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{customer.address}</span>
          </div>
        )}
      </div>

      {(canUpdate || canDelete) && (
        <div className="flex gap-2 border-border border-t pt-3">
          {canUpdate && (
            <Link href={customers.edit.url({ customer: customer.id })} className="flex-1">
              <Button intent="warning" className="w-full">
                <IconPencilCog size={16} />
                Edit
              </Button>
            </Link>
          )}
          {canDelete && (
            <Button
              intent="danger"
              className="flex-1"
              onPress={() => onDelete(customers.destroy.url({ customer: customer.id }))}
            >
              <IconTrash size={16} />
              Hapus
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Index({ customers: data }: IndexProps) {
  const { can } = useAuthorization();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
  const { delete: destroy } = useForm();

  const canCreate = can("customers-create");
  const canEdit = can("customers-edit");
  const canDelete = can("customers-delete");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.location.href = `${customers.index.url()}?search=${search}`;
  }

  function handleDeleteClick(url: string) {
    setDeleteUrl(url);
    setIsDeleteOpen(true);
  }

  function handleDeleteConfirm() {
    if (deleteUrl) {
      destroy(deleteUrl);
    }
    setIsDeleteOpen(false);
  }

  return (
    <>
      <Head title="Pelanggan" />

      <PageHeader
        title="Pelanggan"
        description={`${data.total} pelanggan terdaftar`}
        icon={<IconUser size={20} />}
        actions={
          canCreate && (
            <Link href={customers.create.url()}>
              <Button intent="primary">
                <IconCirclePlus size={18} strokeWidth={1.5} />
                Tambah Pelanggan
              </Button>
            </Link>
          )
        }
      />

      <FilterBar onSubmit={handleSearchSubmit}>
        <div className="w-full sm:w-80">
          <SearchField placeholder="Cari pelanggan..." value={search} onChange={setSearch} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            intent={viewMode === "grid" ? "primary" : "plain"}
            size="sq-sm"
            onPress={() => setViewMode("grid")}
            aria-label="Grid View"
          >
            <IconLayoutGrid size={20} />
          </Button>
          <Button
            intent={viewMode === "list" ? "primary" : "plain"}
            size="sq-sm"
            onPress={() => setViewMode("list")}
            aria-label="List View"
          >
            <IconList size={20} />
          </Button>
        </div>
      </FilterBar>

      {data.data.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.data.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onDelete={handleDeleteClick}
                canUpdate={canEdit}
                canDelete={canDelete}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="border-border border-b p-4">
                <div className="flex items-center gap-2 font-semibold text-fg text-sm">
                  <IconUser size={16} />
                  Data Pelanggan
                </div>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-border border-b bg-muted">
                    <tr>
                      <th className="h-12 w-10 px-4 text-left align-middle font-medium text-muted-fg">
                        No
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                        Pelanggan
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                        Loyalty
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                        No. Telepon
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                        Alamat
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-bg">
                    {data.data.map((customer, i) => (
                      <tr key={customer.id} className="transition-colors hover:bg-muted">
                        <td className="whitespace-nowrap p-4 text-center align-middle text-muted-fg">
                          {i + 1 + (data.current_page - 1) * data.per_page}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <div className="flex items-center gap-3">
                            {customer.avatar ? (
                              <img
                                src={customer.avatar}
                                alt={customer.name}
                                className="h-10 w-10 flex-shrink-0 rounded-full border border-border object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 font-semibold text-sm text-white">
                                {customer.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <p className="font-medium text-fg text-sm">
                              <Link
                                href={customers.show.url({ customer: customer.id })}
                                className="hover:text-primary"
                              >
                                {customer.name}
                              </Link>
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <div className="flex flex-col gap-0.5">
                            <StatusBadge
                              variant={customer.is_loyalty_member ? "info" : "neutral"}
                              label={
                                customer.is_loyalty_member
                                  ? (customer.loyalty_tier ?? "")
                                  : "non-member"
                              }
                            />
                            <span className="text-muted-fg text-xs">
                              {customer.loyalty_points || 0} poin
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <span className="text-muted-fg text-sm">{customer.no_telp || "-"}</span>
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <p className="line-clamp-1 text-muted-fg text-sm">
                            {customer.address || "-"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <div className="flex gap-2">
                            {canEdit && (
                              <Link href={customers.edit.url({ customer: customer.id })}>
                                <Button intent="warning" size="sq-sm">
                                  <IconPencilCog size={16} strokeWidth={1.5} />
                                </Button>
                              </Link>
                            )}
                            {canDelete && (
                              <Button
                                intent="danger"
                                size="sq-sm"
                                onPress={() =>
                                  handleDeleteClick(
                                    customers.destroy.url({ customer: customer.id }),
                                  )
                                }
                              >
                                <IconTrash size={16} strokeWidth={1.5} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <EmptyState
          title="Belum Ada Pelanggan"
          description="Tambahkan pelanggan pertama Anda."
          action={
            canCreate && (
              <Link href={customers.create.url()}>
                <Button intent="primary">
                  <IconCirclePlus size={18} />
                  Tambah Pelanggan
                </Button>
              </Link>
            )
          }
        />
      )}

      {data.last_page !== 1 && <Pagination links={data.links} />}

      <Modal isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Konfirmasi Hapus</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-muted-fg text-sm">Data yang dihapus tidak dapat dikembalikan!</p>
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
