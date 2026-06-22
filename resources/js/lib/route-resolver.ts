import * as routeDashboard from "@/routes/dashboard";
import * as categories from "@/routes/categories";
import * as products from "@/routes/products";
import * as customers from "@/routes/customers";
import * as suppliers from "@/routes/suppliers";
import * as transactions from "@/routes/transactions";
import * as salesReturns from "@/routes/sales-returns";
import * as receivables from "@/routes/receivables";
import * as aging from "@/routes/aging";
import * as stockOpnames from "@/routes/stock-opnames";
import * as stockMutations from "@/routes/stock-mutations";
import * as purchaseOrders from "@/routes/purchase-orders";
import * as goodsReceivings from "@/routes/goods-receivings";
import * as supplierReturns from "@/routes/supplier-returns";
import * as payables from "@/routes/payables";
import * as members from "@/routes/members";
import * as pricingRules from "@/routes/pricing-rules";
import * as customerVouchers from "@/routes/customer-vouchers";
import * as customerSegments from "@/routes/customer-segments";
import * as crmCampaigns from "@/routes/crm-campaigns";
import * as crmReminders from "@/routes/crm-reminders";
import reports from "@/routes/reports";
import * as cashierShifts from "@/routes/cashier-shifts";
import * as auditLogs from "@/routes/audit-logs";
import * as permissions from "@/routes/permissions";
import * as roles from "@/routes/roles";
import * as users from "@/routes/users";
import * as settings from "@/routes/settings";
import * as notifications from "@/routes/notifications";

const routeMap: Record<string, any> = {
  dashboard: routeDashboard,
  categories,
  products,
  customers,
  suppliers,
  transactions,
  "sales-returns": salesReturns,
  receivables,
  aging,
  "stock-opnames": stockOpnames,
  "stock-mutations": stockMutations,
  "purchase-orders": purchaseOrders,
  "goods-receivings": goodsReceivings,
  "supplier-returns": supplierReturns,
  payables,
  members,
  "pricing-rules": pricingRules,
  "customer-vouchers": customerVouchers,
  "customer-segments": customerSegments,
  "crm-campaigns": crmCampaigns,
  "crm-reminders": crmReminders,
  reports,
  "cashier-shifts": cashierShifts,
  "audit-logs": auditLogs,
  permissions,
  roles,
  users,
  settings,
  notifications,
};

function lookupUrl(mod: any, action: string): string | null {
  const entry = mod[action];
  if (!entry) return null;
  if (typeof entry === "object" && "url" in entry) {
    if (typeof entry.url === "function") return entry.url();
    return entry.url;
  }
  if (typeof entry === "function") {
    const result = entry();
    if (result && typeof result.url === "string") return result.url;
  }
  return null;
}

export function resolveUrl(routeName: string): string {
  const parts = routeName.split(".");
  if (parts.length === 0) return "/";

  const mod = routeMap[parts[0]];
  if (!mod) return "/";

  if (parts.length === 1) {
    const url = lookupUrl(mod as any, "index") ?? lookupUrl(mod as any, "dashboard");
    return url ?? "/";
  }

  if (parts.length === 2) {
    return lookupUrl(mod as any, parts[1]) ?? "/";
  }

  if (parts.length === 3) {
    if (parts[0] === "settings") {
      return findDeepRoute(mod as any, [parts[1], parts[2]]);
    }
    if (parts[0] === "reports") {
      const sub = (mod as any)[parts[1]];
      if (sub) return lookupUrl(sub as any, parts[2]) ?? "/";
    }
    const combined = lookupUrl(mod as any, `${parts[1]}.${parts[2]}`);
    if (combined) return combined;
    const sub = (mod as any)[parts[1]];
    if (sub) return lookupUrl(sub as any, parts[2]) ?? "/";
    return "/";
  }

  return "/";
}

function findDeepRoute(mod: Record<string, any>, parts: string[]): string {
  let current = mod;
  for (const part of parts) {
    if (!current || typeof current !== "object") return "/";
    current = current[part];
    if (!current) return "/";
  }
  if (typeof current === "object" && "url" in current && typeof current.url === "function") {
    return current.url();
  }
  if (typeof current === "function") {
    const result = current();
    if (result && typeof result.url === "string") return result.url;
  }
  return "/";
}
