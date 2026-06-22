import { useAuthorization } from "@/lib/auth";
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

interface SalesReturn {
  id: number;
  code: string;
  status: string;
  completed_at: string | null;
  return_type: string;
  notes: string;
}

interface ShowProps {
  salesReturn: SalesReturn;
  transaction: Transaction;
}

export default function Show({ salesReturn, transaction }: ShowProps) {
  const { can } = useAuthorization();

  return (
    <SalesReturnForm
      title={salesReturn.code}
      transaction={transaction}
      salesReturn={salesReturn}
      submitRoute={salesReturns.update.url({ salesReturn: salesReturn.id })}
      submitMethod="patch"
      canEdit={salesReturn.status === "draft" && can("sales-returns-create")}
      canComplete={salesReturn.status === "draft" && can("sales-returns-complete")}
      completeRoute={salesReturns.complete.url({ salesReturn: salesReturn.id })}
    />
  );
}

Show.layout = SalesReturnForm.layout;
