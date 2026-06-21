import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, boolean, integer, doublePrecision } from 'drizzle-orm/pg-core';

// 1. Users Table (Core Auth Identity)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations for users
export const usersRelations = relations(users, ({ one, many }) => ({
  businessProfile: one(businessProfiles, {
    fields: [users.id],
    references: [businessProfiles.userId],
  }),
  customers: many(customers),
  products: many(products),
  invoices: many(invoices),
  payments: many(payments),
  notifications: many(notifications),
}));

// 2. Business Profiles Table
export const businessProfiles = pgTable('business_profiles', {
  userId: integer('user_id').references(() => users.id).primaryKey(),
  name: text('name').notNull(),
  logo: text('logo'),
  gstNumber: text('gst_number').notNull(),
  panNumber: text('pan_number'),
  address: text('address'),
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  bankName: text('bank_name'),
  accountNumber: text('account_number'),
  bankIfsc: text('bank_ifsc'),
  bankBranch: text('bank_branch'),
  upiId: text('upi_id'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations for business profiles
export const businessProfilesRelations = relations(businessProfiles, ({ one }) => ({
  user: one(users, {
    fields: [businessProfiles.userId],
    references: [users.id],
  }),
}));

// 3. Customers Table
export const customers = pgTable('customers', {
  id: text('id').primaryKey(), // customer-123 e.g. client unique id string
  userId: integer('user_id').references(() => users.id).notNull(),
  customerName: text('customer_name').notNull(),
  companyName: text('company_name'),
  gstin: text('gstin'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  totalBilled: doublePrecision('total_billed').default(0),
  outstanding: doublePrecision('outstanding').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations for customers
export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  invoices: many(invoices),
}));

// 4. Products Table
export const products = pgTable('products', {
  id: text('id').primaryKey(), // product-123 e.g. product status identification string
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  hsnSac: text('hsn_sac'),
  unit: text('unit').notNull(),
  rate: doublePrecision('rate').default(0),
  gstPercentage: doublePrecision('gst_percentage').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations for products
export const productsRelations = relations(products, ({ one }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
}));

// 5. Invoices Table
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  invoiceDate: text('invoice_date').notNull(),
  dueDate: text('due_date').notNull(),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  customerGstin: text('customer_gstin'),
  supplyType: text('supply_type').notNull(), // 'INTRA' or 'INTER'
  placeOfSupply: text('place_of_supply').notNull(),
  subtotal: doublePrecision('subtotal').default(0),
  discountValue: doublePrecision('discount_value').default(0),
  discountType: text('discount_type').notNull(), // 'PERCENT' or 'VALUE'
  discountAmount: doublePrecision('discount_amount').default(0),
  shippingCharges: doublePrecision('shipping_charges').default(0),
  applyGstOnShipping: boolean('apply_gst_on_shipping').default(false),
  totalCgst: doublePrecision('total_cgst').default(0),
  totalSgst: doublePrecision('total_sgst').default(0),
  totalIgst: doublePrecision('total_igst').default(0),
  totalTax: doublePrecision('total_tax').default(0),
  roundOff: doublePrecision('round_off').default(0),
  grandTotal: doublePrecision('grand_total').default(0),
  notes: text('notes'),
  terms: text('terms'),
  status: text('status').notNull(), // 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations for invoices
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  items: many(invoiceItems),
  payments: many(payments),
}));

// 6. Invoice Line Items Table
export const invoiceItems = pgTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }).notNull(),
  productId: text('product_id').notNull(),
  name: text('name').notNull(),
  hsnSac: text('hsn_sac'),
  quantity: doublePrecision('quantity').default(1),
  rate: doublePrecision('rate').default(0),
  discountPercentage: doublePrecision('discount_percentage').default(0),
  gstPercentage: doublePrecision('gst_percentage').default(0),
  taxableValue: doublePrecision('taxable_value').default(0),
  cgst: doublePrecision('cgst').default(0),
  sgst: doublePrecision('sgst').default(0),
  igst: doublePrecision('igst').default(0),
  totalAmount: doublePrecision('total_amount').default(0),
});

// Relations for invoice items
export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

// 7. Payments Table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  invoiceId: text('invoice_id').notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  customerName: text('customer_name').notNull(),
  paymentDate: text('payment_date').notNull(),
  amountPaid: doublePrecision('amount_paid').default(0),
  paymentMode: text('payment_mode').notNull(),
  transactionRef: text('transaction_ref').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations for payments
export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

// 8. Notifications Table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  timestamp: text('timestamp').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  type: text('type').notNull(), // 'info' | 'success' | 'warning' | 'error'
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations for notifications
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
