import { BusinessProfile, Customer, Product, Invoice, Payment, AppNotification, ActivityLog } from './types';

export const defaultBusinessProfile: BusinessProfile = {
  name: "SupaBuyer Technologies Pvt Ltd",
  logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0fuU3AVlusH1GijeHogixKlX9UfJDTtRiFMxOjeAEIegTW0kBwB0Uma0FABJ3JkNepil9XmjGPN_-fA2jevnah90v8DidOVXzIY1SjwlJz7qRpcMIqoZ-iLm1_6PkO6cUa0EDOH5UEzxE3bYppxYf2B2nX8R_FCA4DhO2mGxnXnLGDQpoW_ePgj8sUz9Ed-M2FJNqRcuDk-l4uZWoF7R95VKTwMx-UKzwQWzNtw89cEZhnHvJAriBN0XQQAQq5k9WslxUU2hypgCv",
  gstNumber: "27ABCDE1234F1Z5",
  panNumber: "ABCDE1234F",
  address: "101, Tech Park, Andheri East\nMumbai, Maharashtra 400069\nIndia",
  email: "billing@supabuyer.in",
  phone: "+91 98765 43210",
  website: "www.supabuyer.in",
  bankName: "HDFC Bank Ltd",
  accountNumber: "50200012345678",
  bankIfsc: "HDFC0001234",
  bankBranch: "Andheri East Branch",
  upiId: "supabuyer@hdfc"
};

export const defaultCustomers: Customer[] = [
  {
    id: "cust-1",
    customerName: "Rajesh Kumar",
    companyName: "TechNova Solutions",
    gstin: "29XYZAB5678G2H6",
    address: "45, Indiranagar 100ft Road\nBengaluru, Karnataka 560038\nIndia",
    phone: "+91 87654 32109",
    email: "accounts@technova.com",
    totalBilled: 1245000,
    outstanding: 125000
  },
  {
    id: "cust-2",
    customerName: "Priya Sharma",
    companyName: "Global Supply Co.",
    gstin: "07BBNPP8765Q1Z8",
    address: "B-12, Connaught Place\nNew Delhi 110001\nIndia",
    phone: "+91 99887 76655",
    email: "accounts@globalsupply.com",
    totalBilled: 890500,
    outstanding: 0
  },
  {
    id: "cust-3",
    customerName: "Amit Desai",
    companyName: "Apex Industries Ltd",
    gstin: "29CCEPP1234R1Z5",
    address: "Phase 3, Peenya Industrial Area\nBengaluru, Karnataka 560058\nIndia",
    phone: "+91 91234 56780",
    email: "finance@apexind.com",
    totalBilled: 2450000,
    outstanding: 450000
  },
  {
    id: "cust-4",
    customerName: "Vikas Patel",
    companyName: "Zenith Enterprises",
    gstin: "24AAACZ1234M1Z2",
    address: "GIDC Industrial Estate, Vatva\nAhmedabad, Gujarat 382440\nIndia",
    phone: "+91 98223 34455",
    email: "billing@zenith.in",
    totalBilled: 88000,
    outstanding: 88000
  },
  {
    id: "cust-5",
    customerName: "Stark Billing Team",
    companyName: "Stark Industries India",
    gstin: "27STARK9988M1Z0",
    address: "Stark Tower, BKC\nMumbai, Maharashtra 400051\nIndia",
    phone: "+91 99999 88888",
    email: "billing@stark.co.in",
    totalBilled: 250000,
    outstanding: 250000
  }
];

export const defaultProducts: Product[] = [
  {
    id: "prod-1",
    name: "Premium Cotton Fabric",
    description: "Finest weave certified organic high durability cotton fabric material.",
    hsnSac: "5208",
    unit: "Meter",
    rate: 450,
    gstPercentage: 5,
    category: "Product",
    status: "Active",
    includesTax: false
  },
  {
    id: "prod-2",
    name: "Web Design Service",
    description: "Bespoke high performance web design, prototyping and component layout asset structuring.",
    hsnSac: "998314",
    unit: "Hour",
    rate: 2500,
    gstPercentage: 18,
    category: "Service",
    status: "Active",
    includesTax: false
  },
  {
    id: "prod-3",
    name: "Laptop Stand",
    description: "Ergonomic anodized double height adjustable aluminum alloy desk riser support.",
    hsnSac: "8473",
    unit: "Piece",
    rate: 1200,
    gstPercentage: 12,
    category: "Product",
    status: "Active",
    includesTax: false
  },
  {
    id: "prod-4",
    name: "Cloud Hosting Maintenance",
    description: "AWS cloud infrastructure hosting, backups, and security management SLA SLA-2026.",
    hsnSac: "998315",
    unit: "Hour",
    rate: 1000,
    gstPercentage: 18,
    category: "Service",
    status: "Active",
    includesTax: false
  },
  {
    id: "prod-5",
    name: "Enterprise Database Suite",
    description: "Comprehensive relational cluster license deployment package.",
    hsnSac: "8471",
    unit: "Piece",
    rate: 125000,
    gstPercentage: 18,
    category: "Product",
    status: "Active",
    includesTax: true
  }
];

export const defaultInvoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2023-001",
    invoiceDate: "2023-10-12",
    dueDate: "2023-10-27",
    customerId: "cust-2",
    customerName: "Global Supply Co.",
    customerGstin: "07BBNPP8765Q1Z8",
    supplyType: "INTER",
    placeOfSupply: "07 - Delhi",
    items: [
      {
        id: "item-1-1",
        productId: "prod-1",
        name: "Web Development Services",
        hsnSac: "998314",
        quantity: 2,
        rate: 20000,
        discountPercentage: 0,
        gstPercentage: 18,
        taxableValue: 40000,
        cgst: 0,
        sgst: 0,
        igst: 7200,
        totalAmount: 47200
      },
      {
        id: "item-1-2",
        productId: "prod-2",
        name: "Cloud Hosting",
        hsnSac: "998315",
        quantity: 1,
        rate: 1000,
        discountPercentage: 0,
        gstPercentage: 18,
        taxableValue: 1000,
        cgst: 0,
        sgst: 0,
        igst: 180,
        totalAmount: 1180
      }
    ],
    subtotal: 41000,
    discountAmount: 0,
    discountType: "PERCENT",
    discountValue: 0,
    shippingCharges: 0,
    applyGstOnShipping: false,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 7380,
    totalTax: 7380,
    roundOff: 0,
    grandTotal: 48380,
    notes: "Thanks for placing order. Payment processed.",
    terms: "Payment received within due date.",
    status: "Paid",
    createdAt: "2023-10-12T10:00:00.000Z"
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2023-002",
    invoiceDate: "2023-10-15",
    dueDate: "2023-10-30",
    customerId: "cust-1",
    customerName: "TechNova Solutions",
    customerGstin: "29XYZAB5678G2H6",
    supplyType: "INTER",
    placeOfSupply: "29 - Karnataka",
    items: [
      {
        id: "item-2-1",
        productId: "prod-1",
        name: "Web Development Services",
        hsnSac: "998314",
        quantity: 5,
        rate: 20000,
        discountPercentage: 0,
        gstPercentage: 18,
        taxableValue: 100000,
        cgst: 0,
        sgst: 0,
        igst: 18000,
        totalAmount: 118000
      }
    ],
    subtotal: 100000,
    discountAmount: 0,
    discountType: "PERCENT",
    discountValue: 0,
    shippingCharges: 2000,
    applyGstOnShipping: false,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 18000,
    totalTax: 18000,
    roundOff: 0,
    grandTotal: 120000,
    notes: "Monthly retainer.",
    terms: "Due in 15 days.",
    status: "Paid",
    createdAt: "2023-10-15T11:00:00.000Z"
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2023-003",
    invoiceDate: "2023-09-28",
    dueDate: "2023-10-13",
    customerId: "cust-2",
    customerName: "Global Supply Co.",
    customerGstin: "07BBNPP8765Q1Z8",
    supplyType: "INTER",
    placeOfSupply: "07 - Delhi",
    items: [
      {
        id: "item-3-1",
        productId: "prod-4",
        name: "Server Maintenance (Annual)",
        hsnSac: "998314",
        quantity: 1,
        rate: 72033,
        discountPercentage: 0,
        gstPercentage: 18,
        taxableValue: 72033,
        cgst: 0,
        sgst: 0,
        igst: 12966,
        totalAmount: 85000
      }
    ],
    subtotal: 72033,
    discountAmount: 0,
    discountType: "PERCENT",
    discountValue: 0,
    shippingCharges: 0,
    applyGstOnShipping: false,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 12966,
    totalTax: 12966,
    roundOff: 0.1,
    grandTotal: 85000,
    notes: "Urgent renewal.",
    terms: "Due immediately. Overdue interest applies.",
    status: "Overdue",
    createdAt: "2023-09-28T09:30:00.000Z"
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2023-004",
    invoiceDate: "2023-10-20",
    dueDate: "2023-11-04",
    customerId: "cust-4",
    customerName: "Zenith Enterprises",
    customerGstin: "24AAACZ1234M1Z2",
    supplyType: "INTER",
    placeOfSupply: "24 - Gujarat",
    items: [
      {
        id: "item-4-1",
        productId: "prod-1",
        name: "Web Development Services",
        hsnSac: "998314",
        quantity: 1,
        rate: 27542,
        discountPercentage: 0,
        gstPercentage: 18,
        taxableValue: 27542,
        cgst: 0,
        sgst: 0,
        igst: 4958,
        totalAmount: 32500
      }
    ],
    subtotal: 27542,
    discountAmount: 0,
    discountType: "PERCENT",
    discountValue: 0,
    shippingCharges: 0,
    applyGstOnShipping: false,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 4958,
    totalTax: 4958,
    roundOff: -0.4,
    grandTotal: 32500,
    notes: "Design sprint.",
    terms: "Draft status only.",
    status: "Draft",
    createdAt: "2023-10-20T14:45:00.000Z"
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-2024-149",
    invoiceDate: "2024-10-24",
    dueDate: "2024-11-07",
    customerId: "cust-1",
    customerName: "TechNova Solutions",
    customerGstin: "29XYZAB5678G2H6",
    supplyType: "INTRA",
    placeOfSupply: "27 - Maharashtra",
    items: [
      {
        id: "item-5-1",
        productId: "prod-1",
        name: "Web Development Services",
        hsnSac: "998314",
        quantity: 1,
        rate: 20000,
        discountPercentage: 0,
        gstPercentage: 18,
        taxableValue: 20000,
        cgst: 1800,
        sgst: 1800,
        igst: 0,
        totalAmount: 23600
      },
      {
        id: "item-5-2",
        productId: "prod-2",
        name: "Cloud Hosting",
        hsnSac: "998315",
        quantity: 3,
        rate: 1000,
        discountPercentage: 10,
        taxableValue: 2700,
        gstPercentage: 18,
        cgst: 243,
        sgst: 243,
        igst: 0,
        totalAmount: 3186
      },
      {
        id: "item-5-3",
        productId: "prod-3",
        name: "SSL Certificate",
        hsnSac: "998316",
        quantity: 1,
        rate: 1500,
        discountPercentage: 0,
        gstPercentage: 18,
        taxableValue: 1500,
        cgst: 135,
        sgst: 135,
        igst: 0,
        totalAmount: 1770
      }
    ],
    subtotal: 24200,
    discountAmount: 300,
    discountType: "VALUE",
    discountValue: 300,
    shippingCharges: 0,
    applyGstOnShipping: false,
    totalCgst: 2178,
    totalSgst: 2178,
    totalIgst: 0,
    totalTax: 4356,
    roundOff: -0.5,
    grandTotal: 28555.50,
    notes: "Payment due within 14 days. Late payment is subject to 1.5% interest per month.",
    terms: "All disputes are subject to Mumbai jurisdiction.",
    status: "Sent",
    createdAt: "2024-10-24T12:00:00.000Z"
  }
];

export const defaultPayments: Payment[] = [
  {
    id: "pay-1",
    invoiceId: "inv-1",
    invoiceNumber: "INV-2023-001",
    customerName: "Global Supply Co.",
    paymentDate: "2023-10-15",
    amountPaid: 48380,
    paymentMode: "UPI / QR Code",
    transactionRef: "TXN9988221199",
    notes: "Clear outstanding."
  },
  {
    id: "pay-2",
    invoiceId: "inv-2",
    invoiceNumber: "INV-2023-002",
    customerName: "TechNova Solutions",
    paymentDate: "2023-10-20",
    amountPaid: 120000,
    paymentMode: "Bank Transfer",
    transactionRef: "HDFCNET223344",
    notes: "Automatic approval."
  }
];

export const defaultNotifications: AppNotification[] = [
  {
    id: "not-1",
    timestamp: "2026-06-21T08:00:00.000Z",
    message: "Invoice #INV-2024-149 is overdue by 591 days.",
    isRead: false,
    type: "warning"
  },
  {
    id: "not-2",
    timestamp: "2026-06-21T07:30:00.000Z",
    message: "Welcome to SupaBuyer Invoice! Start by creating client profile.",
    isRead: true,
    type: "info"
  }
];

export const defaultActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    timestamp: "2026-06-21T08:01:00Z",
    type: "AUTH",
    message: "User Arnabbpandeyy007@gmail.com logged in successfully.",
    user: "Rahul Desai"
  },
  {
    id: "log-2",
    timestamp: "2026-06-21T07:45:00Z",
    type: "SETTINGS",
    message: "Updated company bank details & settings.",
    user: "System"
  }
];
