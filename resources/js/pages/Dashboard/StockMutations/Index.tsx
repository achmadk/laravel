import { useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import { IconHistory } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import stockMutationsRoutes from "@/routes/stock-mutations";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

interface Product {
  id: number;
  title: string;
  barcode?: string | null;
  sku?: string | null;
}

interface Mutation {
  id: number;
  product: Product | null;
  mutation_type: string;
  qty: number;
  stock_before: number;
  stock_after: number;
  reference_type: string;
  notes: string | null;
  creator: { id: number; name: string } | null;
  created_at: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface MutationsResponse {
  data: Mutation[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface IndexProps {
  stockMutations: MutationsResponse;
  products: Product[];
  filters: {
    product_id?: string;
    mutation_type?: string;
    date_from?: string;
    date_to?: string;
  };
}

export default function Index({ stockMutations, products, filters }: IndexProps) {
  const currentFilters = useMemo(
    () => ({
      product_id: filters?.product_id || "",
      mutation_type: filters?.mutation_type || "",
      date_from: filters?.date_from || "",
      date_to: filters?.date_to || "",
    }),
    [filters],
  );

  function updateFilter(key: string, value: string) {
    router.get(
      stockMutationsRoutes.index.url(),
      { ...currentFilters, [key]: value },
      { preserveState: true, replace: true },
    );
  }

  return (
    <>
      <Head title="Mutasi Stok" />

      <PageHeader
        title="Mutasi Stok"
        description="Histori perubahan stok dari stock opname dan initial stock produk."
        icon={<IconHistory size={20} />}
      />

      <Card className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-bg p-4 md:grid-cols-4">
        <select
          value={currentFilters.product_id}
          onChange={(e) => updateFilter("product_id", e.target.value)}
          className="h-11 rounded-xl border border-input bg-muted px-3 text-fg text-sm"
        >
          <option value="">Semua Produk</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.mutation_type}
          onChange={(e) => updateFilter("mutation_type", e.target.value)}
          className="h-11 rounded-xl border border-input bg-muted px-3 text-fg text-sm"
        >
          <option value="">Semua Tipe</option>
          <option value="in">In</option>
          <option value="out">Out</option>
          <option value="adjustment">Adjustment</option>
        </select>

        <input
          type="date"
          value={currentFilters.date_from}
          onChange={(e) => updateFilter("date_from", e.target.value)}
          className="h-11 rounded-xl border border-input bg-muted px-3 text-fg text-sm"
        />

        <input
          type="date"
          value={currentFilters.date_to}
          onChange={(e) => updateFilter("date_to", e.target.value)}
          className="h-11 rounded-xl border border-input bg-muted px-3 text-fg text-sm"
        />
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="border-border border-b p-4">
            <div className="flex items-center gap-2 font-semibold text-fg text-sm">
              Histori Mutasi Stok
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border border-b bg-muted">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                    Produk
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                    Tipe
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                    Qty
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                    Before / After
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                    Referensi
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                    Dibuat Oleh
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                    Waktu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stockMutations.data.length > 0 ? (
                  stockMutations.data.map((mutation) => (
                    <tr key={mutation.id} className="transition-colors hover:bg-muted">
                      <td className="whitespace-nowrap p-4 align-middle">
                        <div>
                          <p className="font-medium text-fg">{mutation.product?.title || "-"}</p>
                          <p className="text-muted-fg text-xs">
                            {mutation.product?.barcode || mutation.product?.sku || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle">
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 font-semibold text-muted-fg text-xs">
                          {mutation.mutation_type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                        {mutation.qty}
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                        {mutation.stock_before} → {mutation.stock_after}
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle">
                        <div>
                          <p className="font-medium text-muted-fg text-sm">
                            {mutation.reference_type}
                          </p>
                          <p className="text-muted-fg text-xs">{mutation.notes || "-"}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                        {mutation.creator?.name || "-"}
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                        {formatDateTime(mutation.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <IconHistory size={28} className="text-muted-fg" />
                        </div>
                        <p className="text-muted-fg">Belum ada mutasi stok.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {stockMutations.last_page > 1 && <Pagination links={stockMutations.links} />}
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
