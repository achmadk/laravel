export interface MenuItem {
  title: string;
  href?: string;
  icon?: string;
  permission?: string;
  subdetails?: MenuItem[];
}

export interface MenuSection {
  title: string;
  details: MenuItem[];
}

export const menuNavigation: MenuSection[] = [
  {
    title: "Overview",
    details: [
      {
        title: "Dashboard",
        href: "dashboard",
        icon: "IconLayout2",
        permission: "dashboard-access",
      },
    ],
  },
  {
    title: "Master Data",
    details: [
      {
        title: "Kategori",
        href: "categories.index",
        icon: "IconFolder",
        permission: "categories-access",
      },
      {
        title: "Produk",
        href: "products.index",
        icon: "IconBox",
        permission: "products-access",
      },
      {
        title: "Pelanggan",
        href: "customers.index",
        icon: "IconUsersPlus",
        permission: "customers-access",
      },
      {
        title: "Supplier",
        href: "suppliers.index",
        icon: "IconBuildingWarehouse",
        permission: "suppliers-access",
      },
    ],
  },
  {
    title: "Sales",
    details: [
      {
        title: "Transaksi",
        href: "transactions.index",
        icon: "IconShoppingCart",
        permission: "transactions-access",
      },
      {
        title: "Riwayat Transaksi",
        href: "transactions.history",
        icon: "IconClockHour6",
        permission: "transactions-access",
      },
      {
        title: "Retur Penjualan",
        href: "sales-returns.index",
        icon: "IconFileCertificate",
        permission: "sales-returns-access",
      },
      {
        title: "Piutang",
        href: "receivables.index",
        icon: "IconFileInvoice",
        permission: "receivables-access",
      },
      {
        title: "Aging & Pengingat",
        href: "aging.index",
        icon: "IconChartBar",
        permission: "receivables-access",
      },
    ],
  },
  {
    title: "Inventory",
    details: [
      {
        title: "Stock Opname",
        href: "stock-opnames.index",
        icon: "IconFileDescription",
        permission: "stock-opnames-access",
      },
      {
        title: "Mutasi Stok",
        href: "stock-mutations.index",
        icon: "IconChartArrowsVertical",
        permission: "stock-mutations-access",
      },
    ],
  },
  {
    title: "Procurement",
    details: [
      {
        title: "Purchase Order",
        href: "purchase-orders.index",
        icon: "IconClipboardCheck",
        permission: "purchase-orders-access",
      },
      {
        title: "Penerimaan Barang",
        href: "goods-receivings.index",
        icon: "IconTruckDelivery",
        permission: "goods-receivings-access",
      },
      {
        title: "Retur Supplier",
        href: "supplier-returns.index",
        icon: "IconTruckReturn",
        permission: "supplier-returns-access",
      },
      {
        title: "Hutang Supplier",
        href: "payables.index",
        icon: "IconCurrencyDollar",
        permission: "payables-access",
      },
    ],
  },
  {
    title: "CRM & Pricing",
    details: [
      {
        title: "Member",
        href: "members.index",
        icon: "IconCrown",
        permission: "customers-access",
      },
      {
        title: "Promo Harga",
        href: "pricing-rules.index",
        icon: "IconChartInfographic",
        permission: "pricing-rules-access",
      },
      {
        title: "Voucher Customer",
        href: "customer-vouchers.index",
        icon: "IconCreditCard",
        permission: "customer-vouchers-access",
      },
      {
        title: "Segment Customer",
        href: "customer-segments.index",
        icon: "IconUsers",
        permission: "customer-segments-access",
      },
      {
        title: "Campaign CRM",
        href: "crm-campaigns.index",
        icon: "IconSpeakerphone",
        permission: "crm-campaigns-access",
      },
      {
        title: "Reminder CRM",
        href: "crm-reminders.index",
        icon: "IconClockHour6",
        permission: "crm-reminders-access",
      },
    ],
  },
  {
    title: "Reports",
    details: [
      {
        title: "Laporan Penjualan",
        href: "reports.sales.index",
        icon: "IconChartArrowsVertical",
        permission: "reports-access",
      },
      {
        title: "Laporan Keuntungan",
        href: "reports.profits.index",
        icon: "IconChartBarPopular",
        permission: "profits-access",
      },
      {
        title: "Advanced Insights",
        href: "reports.insights.index",
        icon: "IconChartBar",
        permission: "reports-access",
      },
    ],
  },
  {
    title: "Operations & Control",
    details: [
      {
        title: "Shift Kasir",
        href: "cashier-shifts.index",
        icon: "IconWallet",
        permission: "cashier-shifts-access",
      },
      {
        title: "Audit Log",
        href: "audit-logs.index",
        icon: "IconFileSearch",
        permission: "audit-logs-access",
      },
    ],
  },
  {
    title: "User Management",
    details: [
      {
        title: "Hak Akses",
        href: "permissions.index",
        icon: "IconUserBolt",
        permission: "permissions-access",
      },
      {
        title: "Akses Group",
        href: "roles.index",
        icon: "IconUserShield",
        permission: "roles-access",
      },
      {
        title: "Pengguna",
        icon: "IconUsers",
        permission: "users-access",
        subdetails: [
          {
            title: "Data Pengguna",
            href: "users.index",
            icon: "IconTable",
            permission: "users-access",
          },
          {
            title: "Tambah Data Pengguna",
            href: "users.create",
            icon: "IconCirclePlus",
            permission: "users-create",
          },
        ],
      },
    ],
  },
  {
    title: "Pengaturan",
    details: [
      {
        title: "Payment Gateway",
        href: "settings.payments.edit",
        icon: "IconCreditCard",
        permission: "payment-settings-access",
      },
      {
        title: "Profil Toko",
        href: "settings.store",
        icon: "IconBuildingStore",
        permission: "dashboard-access",
      },
      {
        title: "Rekening Bank",
        href: "settings.bank-accounts.index",
        icon: "IconCreditCard",
        permission: "payment-settings-access",
      },
      {
        title: "Loyalty",
        href: "settings.loyalty",
        icon: "IconGift",
        permission: "dashboard-access",
      },
      {
        title: "Target Penjualan",
        href: "settings.target",
        icon: "IconChartInfographic",
        permission: "dashboard-access",
      },
    ],
  },
];
