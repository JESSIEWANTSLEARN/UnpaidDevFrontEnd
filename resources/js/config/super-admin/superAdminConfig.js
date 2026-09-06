export const navSections = [
  { label: "Overview", items: [{ name: "Dashboard", icon: "home" }] },
  {
    label: "Catalog",
    items: [
      { name: "Inventory", icon: "package" },
      { name: "Products", icon: "warehouse" },
      { name: "Product Reviews", icon: "search" },
      { name: "Categories", icon: "tag" },
      { name: "Suppliers", icon: "truck" },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Stock Movement", icon: "chart" },
      { name: "Purchase Orders", icon: "cart" },
      { name: "Sales Orders", icon: "money" },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Users", icon: "users" },
      { name: "View as Role", icon: "users" },
      { name: "Reports", icon: "reports" },
      { name: "Audit Logs", icon: "search" },
      { name: "System Health", icon: "settings" },
      { name: "Settings", icon: "settings" },
    ],
  },
  {
    label: "System Access",
    items: [
      { name: "Landing Page", icon: "home", href: "/" },
      { name: "Customer Store", icon: "cart", href: "/store-preview" },
      { name: "Website Content", icon: "settings", href: "/super-admin/content" },
    ],
  },
];


export const INTERNAL_ROLES = [
  "super_admin",
  "Operations_Manager",
  "Purchasing_Manager",
  "Warehouse_Admin",
  "Sales_Manager",
  "Purchasing_Staff",
  "Inventory_Controller",
  "Sales_Staff",
  "User_Admin",
  "System_User",
];

export const INITIAL_FORMS = {
  profile: { name: "", email: "", contact_number: "" },
  password: { current_password: "", password: "", password_confirmation: "" },
  product: {
    sku: "", name: "", description: "", category_id: "", category: "", supplier_id: "", abc_class: "C",
    is_seasonal: false, is_visible: true, is_featured: false, unit_cost: "", unit_price: "", image: null,
  },
  category: { name: "", description: "" },
  stock: { product_id: "", batch_number: "", quantity_received: "", expiry_date: "" },
  user: {
    name: "", email: "", contact_number: "", password: "", password_confirmation: "",
    role: "System_User", account_status: "active",
  },
  supplier: { name: "", contact_number: "", email: "", lead_time_days: "7" },
  purchaseOrder: { supplier_id: "", product_id: "", quantity: "", status: "DRAFT" },
  company: {
    company_name: "Walang Brownout", company_email: "", company_contact: "", company_address: "", logo: null,
  },
  editUser: { user_id: "", name: "", email: "", contact_number: "", role: "System_User", account_status: "active" },
  deleteUser: { confirmation: "" },
};
