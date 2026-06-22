import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
  IconCirclePlus,
  IconDatabaseOff,
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
    <div className="group bg-bg rounded-2xl border border-border p-5 hover:shadow-lg hover:border-muted-fg/30 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {customer.avatar ? (
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-12 h-12 rounded-full object-cover border border-border flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
              {customer.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-fg">
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

      <div className="space-y-2 mb-4">
        {customer.no_telp && (
          <div className="flex items-center gap-2 text-sm text-muted-fg">
            <IconPhone size={16} />
            <span>{customer.no_telp}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex items-start gap-2 text-sm text-muted-fg">
            <IconMapPin size={16} className="flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{customer.address}</span>
          </div>
        )}
      </div>

      {(canUpdate || canDelete) && (
        <div className="flex gap-2 pt-3 border-t border-border">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 font-semibold text-sm text-fg">
                  <IconUser size={16} />
                  Data Pelanggan
                </div>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted border-border">
                    <tr>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg w-10">
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
                      <tr key={customer.id} className="hover:bg-muted transition-colors">
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg text-center">
                          {i + 1 + (data.current_page - 1) * data.per_page}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <div className="flex items-center gap-3">
                            {customer.avatar ? (
                              <img
                                src={customer.avatar}
                                alt={customer.name}
                                className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {customer.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <p className="text-sm font-medium text-fg">
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
                            <span className="text-xs text-muted-fg">
                              {customer.loyalty_points || 0} poin
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <span className="text-sm text-muted-fg">{customer.no_telp || "-"}</span>
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <p className="text-sm text-muted-fg line-clamp-1">
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
            <p className="text-sm text-muted-fg">Data yang dihapus tidak dapat dikembalikan!</p>
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
