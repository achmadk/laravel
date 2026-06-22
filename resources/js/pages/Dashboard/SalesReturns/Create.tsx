import SalesReturnForm from "./Form";
import salesReturns from "@/routes/sales-returns";

interface Transaction {
  id: number;
  invoice: string;
  created_at: string;
  grand_total: number;
  payment_method: string;
  payment_status: string;
  customer: { name: string } | null;
  receivable: { total: number; paid: number } | null;
  details: Array<{
    id: number;
    product: { title: string; barcode?: string; sku?: string } | null;
    qty: number;
    price: number;
    returned_completed_qty: number;
    remaining_returnable_qty: number;
    draft_item?: {
      qty_return: number;
      return_reason: string;
      restock_to_inventory: boolean;
    } | null;
  }>;
}

interface CreateProps {
  transaction: Transaction;
}

export default function Create({ transaction }: CreateProps) {
  return (
    <SalesReturnForm
      title="Buat Retur Penjualan"
      transaction={transaction}
      submitRoute={salesReturns.store.url({ transaction: transaction.id })}
      submitMethod="post"
      canEdit
    />
  );
}

Create.layout = SalesReturnForm.layout;
