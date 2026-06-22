export interface POSProduct {
  id: number;
  barcode: string | null;
  title: string;
  description: string | null;
  image: string | null;
  buy_price: number;
  sell_price: number;
  stock: number;
  category_id: number | null;
  category?: { id: number; name: string } | null;
  pricing_badge: {
    label: string;
    promo_price: number | null;
    base_price: number;
    kind: string;
  } | null;
}

export interface POSCategory {
  id: number;
  name: string;
  image: string | null;
}

export interface POSCartItem {
  id: number;
  cashier_id: number;
  product_id: number;
  qty: number;
  price: number;
  product: {
    id: number;
    title: string;
    sell_price: number;
    image: string | null;
    barcode?: string | null;
  } | null;
  hold_id: string | null;
  hold_label: string | null;
  held_at: string | null;
}

export interface POSCustomer {
  id: number;
  name: string;
  no_telp: string | null;
  address: string | null;
  is_loyalty_member: boolean;
  loyalty_tier: string | null;
  loyalty_points: number;
  member_code: string | null;
}

export interface HeldCart {
  hold_id: string;
  label: string;
  held_at: string;
  items_count: number;
  total: number;
}

export interface PricingItem {
  cart_id: number;
  line_base_total: number;
  line_total: number;
  line_discount_total: number;
  base_unit_price: number;
  effective_unit_price: number;
  pricing_rule: {
    id: number;
    name: string;
    kind: string;
    label: string;
    price_context: boolean;
  } | null;
  pricing_group_key: string | null;
  pricing_group_label: string | null;
}

export interface PricingSummary {
  base_subtotal: number;
  promo_discount_total: number;
  subtotal_after_promo: number;
  voucher_discount_total: number;
  loyalty_discount_total: number;
  manual_discount_total: number;
  shipping_cost: number;
  grand_total: number;
  available_loyalty_points: number;
  applied_redeem_points: number;
}

export interface PricingPreview {
  items: PricingItem[];
  summary: PricingSummary;
  eligible_vouchers?: Array<{
    id: number;
    code: string;
    name: string;
    minimum_order: number;
  }>;
  applied_groups?: Array<{
    key: string;
    label: string;
    discount_total: number;
  }>;
  voucher?: { code: string; name: string } | null;
}

export interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  logo_url: string | null;
}

export interface PaymentGateway {
  value: string;
  label: string;
  description?: string;
}

export interface LoyaltyTierOption {
  value: string;
  label: string;
}
