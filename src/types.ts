export interface BusinessProfile {
  name: string;
  logo: string;
  gstNumber: string;
  panNumber: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  bankName: string;
  accountNumber: string;
  bankIfsc: string;
  bankBranch: string;
  upiId: string;
}

export interface Customer {
  id: string;
  customerName: string;
  companyName: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  totalBilled?: number;
  outstanding?: number;
  status?: 'Active' | 'Inactive';
  state?: string;
  city?: string;
  pincode?: string;
  billingSameAsShipping?: boolean;
  shippingAddress?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  hsnSac: string;
  unit: string;
  rate: number;
  gstPercentage: number;
  category?: 'Product' | 'Service';
  status?: 'Active' | 'Inactive';
  includesTax?: boolean;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  discountPercentage: number;
  gstPercentage: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  unit?: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerGstin: string;
  supplyType: 'INTRA' | 'INTER';
  placeOfSupply: string;
  items: InvoiceItem[];
  subtotal: number;
  discountValue: number; // raw value or %
  discountType: 'PERCENT' | 'VALUE';
  discountAmount: number; // total calculated discount
  shippingCharges: number;
  applyGstOnShipping: boolean;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  notes: string;
  terms: string;
  status: InvoiceStatus;
  bankDetailsId?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  paymentDate: string;
  amountPaid: number;
  paymentMode: string;
  transactionRef: string;
  notes: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  user: string;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  message: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}
