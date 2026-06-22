import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
  IconCirclePlus,
  IconDatabaseOff,
  IconPencilCog,
  IconTrash,
  IconLayoutGrid,
  IconList,
  IconPhoto,
  IconPackage,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import { imageUrl } from "@/lib/image-url";
import products from "@/routes/products";
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

function formatCurrency(value: number = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

interface Product {
  id: number;
  title: string;
  image: string | null;
  barcode: string | null;
  sku: string | null;
  buy_price: number;
  sell_price: number;
  stock: number;
  category: { id: number; name: string } | null;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface ProductsResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface IndexProps {
  products: ProductsResponse;
}

function ProductCard({
  product,
  onDelete,
  canUpdate,
  canDelete,
}: {
  product: Product;
  onDelete: (url: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;

  return (
    <div className="group bg-bg rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-muted-fg/30 transition-all duration-200">
      <div className="relative aspect-square bg-muted overflow-hidden">
        {product.image ? (
          <img
            src={imageUrl(product.image) ?? ""}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconPhoto size={48} className="text-muted-fg" strokeWidth={1} />
          </div>
        )}

        <div className="absolute top-2 right-2">
          {outOfStock ? (
            <span className="px-2 py-1 text-xs font-semibold bg-danger text-white rounded-full">
              Habis
            </span>
          ) : lowStock ? (
            <span className="px-2 py-1 text-xs font-semibold bg-warning text-white rounded-full">
              Stok: {product.stock}
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-fg/60 text-bg rounded-full">
              Stok: {product.stock}
            </span>
          )}
        </div>

        {(canUpdate || canDelete) && (
          <div className="absolute inset-0 bg-fg/0 group-hover:bg-fg/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            {canUpdate && (
              <Link
                href={products.edit.url({ product: product.id })}
                className="p-2.5 rounded-xl bg-bg text-warning hover:bg-warning-subtle shadow-lg transition-colors"
              >
                <IconPencilCog size={18} />
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(products.destroy.url({ product: product.id }))}
                className="p-2.5 rounded-xl bg-bg text-danger hover:bg-danger-subtle shadow-lg transition-colors"
              >
                <IconTrash size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <StatusBadge variant="info" label={product.category?.name || "Kategori"} />
        </div>
        <h3 className="text-sm font-semibold text-fg line-clamp-2 mb-1">{product.title}</h3>
        {(product.barcode || product.sku) && (
          <div className="space-y-0.5 mb-2">
            {product.barcode && (
              <p className="text-xs text-muted-fg line-clamp-1">Barcode: {product.barcode}</p>
            )}
            {product.sku && (
              <p className="text-xs text-muted-fg line-clamp-1">SKU: {product.sku}</p>
            )}
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-base sm:text-lg font-bold text-primary">
            {formatCurrency(product.sell_price)}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-fg">Modal: {formatCurrency(product.buy_price)}</p>
            {product.sell_price > product.buy_price && (
              <span className="text-xs font-medium text-success">
                +{formatCurrency(product.sell_price - product.buy_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Index({ products: data }: IndexProps) {
  const { can } = useAuthorization();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
  const { delete: destroy } = useForm();

  const canCreateProducts = can("products-create");
  const canEditProducts = can("products-edit");
  const canDeleteProducts = can("products-delete");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.location.href = `${products.index.url()}?search=${search}`;
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
      <Head title="Produk" />

      <PageHeader
        title="Produk"
        description={`${data.total} produk terdaftar`}
        icon={<IconPackage size={20} />}
        actions={
          canCreateProducts && (
            <Link href={products.create.url()}>
              <Button intent="primary">
                <IconCirclePlus size={18} strokeWidth={1.5} />
                Tambah Produk
              </Button>
            </Link>
          )
        }
      />

      <FilterBar onSubmit={handleSearchSubmit}>
        <div className="w-full sm:w-80">
          <SearchField placeholder="Cari produk..." value={search} onChange={setSearch} />
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.data.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDeleteClick}
                canUpdate={canEditProducts}
                canDelete={canDeleteProducts}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 font-semibold text-sm text-fg">
                  Data Produk
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
                        Produk
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                        Kategori
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                        Harga Beli
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                        Harga Jual
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                        Stok
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-bg">
                    {data.data.map((product, i) => (
                      <tr key={product.id} className="hover:bg-muted transition-colors">
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg text-center">
                          {i + 1 + (data.current_page - 1) * data.per_page}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                              {product.image ? (
                                <img
                                  src={imageUrl(product.image) ?? ""}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <IconPackage size={16} className="text-muted-fg" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-fg">{product.title}</p>
                              {(product.barcode || product.sku) && (
                                <div className="text-xs text-muted-fg space-y-0.5">
                                  {product.barcode && <p>Barcode: {product.barcode}</p>}
                                  {product.sku && <p>SKU: {product.sku}</p>}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <StatusBadge variant="info" label={product.category?.name ?? ""} />
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          {formatCurrency(product.buy_price)}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle font-semibold text-primary">
                          {formatCurrency(product.sell_price)}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <StatusBadge
                            variant={
                              product.stock === 0
                                ? "danger"
                                : product.stock <= 5
                                  ? "warning"
                                  : "success"
                            }
                            label={String(product.stock)}
                          />
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <div className="flex gap-2">
                            {canEditProducts && (
                              <Link href={products.edit.url({ product: product.id })}>
                                <Button intent="warning" size="sq-sm">
                                  <IconPencilCog size={16} strokeWidth={1.5} />
                                </Button>
                              </Link>
                            )}
                            {canDeleteProducts && (
                              <Button
                                intent="danger"
                                size="sq-sm"
                                onPress={() =>
                                  handleDeleteClick(products.destroy.url({ product: product.id }))
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
          title="Belum Ada Produk"
          description="Tambahkan produk pertama Anda untuk memulai."
          action={
            canCreateProducts && (
              <Link href={products.create.url()}>
                <Button intent="primary">
                  <IconCirclePlus size={18} />
                  Tambah Produk
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
