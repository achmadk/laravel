import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
  IconCirclePlus,
  IconPencilCog,
  IconTrash,
  IconLayoutGrid,
  IconList,
  IconCategory,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import { imageUrl } from "@/lib/image-url";
import categories from "@/routes/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { SearchField } from "@/components/dashboard/search-field";
import { Pagination } from "@/components/dashboard/pagination";
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

interface Category {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface CategoriesResponse {
  data: Category[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface IndexProps {
  categories: CategoriesResponse;
}

function CategoryCard({
  category,
  onDelete,
  canUpdate,
  canDelete,
}: {
  category: Category;
  onDelete: (url: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-bg transition-all duration-200 hover:border-muted-fg/30 hover:shadow-lg">
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        {category.image ? (
          <img
            src={imageUrl(category.image) ?? ""}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <IconCategory size={48} className="text-muted-fg" strokeWidth={1} />
          </div>
        )}

        {(canUpdate || canDelete) && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-fg/0 opacity-0 transition-all group-hover:bg-fg/40 group-hover:opacity-100">
            {canUpdate && (
              <Link
                href={categories.edit.url({ category: category.id })}
                className="rounded-xl bg-bg p-2.5 text-warning shadow-lg transition-colors hover:bg-warning-subtle"
              >
                <IconPencilCog size={18} />
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(categories.destroy.url({ category: category.id }))}
                className="rounded-xl bg-bg p-2.5 text-danger shadow-lg transition-colors hover:bg-danger-subtle"
              >
                <IconTrash size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-1 font-semibold text-base text-fg">{category.name}</h3>
        {category.description && (
          <p className="line-clamp-2 text-muted-fg text-sm">{category.description}</p>
        )}
      </div>
    </div>
  );
}

export default function Index({ categories: data }: IndexProps) {
  const { can } = useAuthorization();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
  const { delete: destroy } = useForm();

  const canCreate = can("categories-create");
  const canEdit = can("categories-edit");
  const canDelete = can("categories-delete");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.location.href = `${categories.index.url()}?search=${search}`;
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
      <Head title="Kategori" />

      <PageHeader
        title="Kategori"
        description={`${data.total} kategori terdaftar`}
        icon={<IconCategory size={20} />}
        actions={
          canCreate && (
            <Link href={categories.create.url()}>
              <Button intent="primary">
                <IconCirclePlus size={18} strokeWidth={1.5} />
                Tambah Kategori
              </Button>
            </Link>
          )
        }
      />

      <FilterBar onSubmit={handleSearchSubmit}>
        <div className="w-full sm:w-80">
          <SearchField placeholder="Cari kategori..." value={search} onChange={setSearch} />
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.data.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
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
                  <IconCategory size={16} />
                  Data Kategori
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
                        Kategori
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                        Deskripsi
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-bg">
                    {data.data.map((category, i) => (
                      <tr key={category.id} className="transition-colors hover:bg-muted">
                        <td className="whitespace-nowrap p-4 text-center align-middle text-muted-fg">
                          {i + 1 + (data.current_page - 1) * data.per_page}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                              {category.image ? (
                                <img
                                  src={imageUrl(category.image) ?? ""}
                                  alt={category.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <IconCategory size={20} className="text-muted-fg" />
                                </div>
                              )}
                            </div>
                            <p className="font-medium text-fg text-sm">{category.name}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <p className="line-clamp-2 text-muted-fg text-sm">
                            {category.description || "-"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <div className="flex gap-2">
                            {canEdit && (
                              <Link href={categories.edit.url({ category: category.id })}>
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
                                    categories.destroy.url({ category: category.id }),
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
          title="Belum Ada Kategori"
          description="Tambahkan kategori pertama Anda."
          action={
            canCreate && (
              <Link href={categories.create.url()}>
                <Button intent="primary">
                  <IconCirclePlus size={18} />
                  Tambah Kategori
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
