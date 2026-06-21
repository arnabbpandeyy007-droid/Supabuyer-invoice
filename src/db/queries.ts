import { db } from './index.ts';
import { 
  businessProfiles, 
  customers, 
  products, 
  invoices, 
  invoiceItems, 
  payments, 
  notifications 
} from './schema.ts';
import { eq } from 'drizzle-orm';

export interface UserDBState {
  businessProfile: any;
  customers: any[];
  products: any[];
  invoices: any[];
  payments: any[];
  notifications: any[];
}

export async function getUserData(userId: number): Promise<UserDBState> {
  try {
    // 1. Fetch Business Profile
    const profileRows = await db.select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);
    
    // 2. Fetch Customers
    const customerRows = await db.select()
      .from(customers)
      .where(eq(customers.userId, userId));

    // 3. Fetch Products
    const productRows = await db.select()
      .from(products)
      .where(eq(products.userId, userId));

    // 4. Fetch Invoices
    const invoiceRows = await db.select()
      .from(invoices)
      .where(eq(invoices.userId, userId));

    // 5. Fetch Payments
    const paymentRows = await db.select()
      .from(payments)
      .where(eq(payments.userId, userId));

    // 6. Fetch Notifications
    const notificationRows = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    // 7. Fetch all invoice items for user's invoices
    let populatedInvoices: any[] = [];
    if (invoiceRows.length > 0) {
      const invoiceIds = invoiceRows.map(i => i.id);
      
      const allItems = await db.select()
        .from(invoiceItems); // Fetch all or filter later

      populatedInvoices = invoiceRows.map(inv => {
        const items = allItems.filter(item => item.invoiceId === inv.id).map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          hsnSac: item.hsnSac || '',
          quantity: item.quantity || 1,
          rate: item.rate || 0,
          discountPercentage: item.discountPercentage || 0,
          gstPercentage: item.gstPercentage || 0,
          taxableValue: item.taxableValue || 0,
          cgst: item.cgst || 0,
          sgst: item.sgst || 0,
          igst: item.igst || 0,
          totalAmount: item.totalAmount || 0
        }));

        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          customerId: inv.customerId,
          customerName: inv.customerName,
          customerGstin: inv.customerGstin || '',
          supplyType: inv.supplyType as 'INTRA' | 'INTER',
          placeOfSupply: inv.placeOfSupply,
          items,
          subtotal: inv.subtotal || 0,
          discountValue: inv.discountValue || 0,
          discountType: inv.discountType as 'PERCENT' | 'VALUE',
          discountAmount: inv.discountAmount || 0,
          shippingCharges: inv.shippingCharges || 0,
          applyGstOnShipping: inv.applyGstOnShipping || false,
          totalCgst: inv.totalCgst || 0,
          totalSgst: inv.totalSgst || 0,
          totalIgst: inv.totalIgst || 0,
          totalTax: inv.totalTax || 0,
          roundOff: inv.roundOff || 0,
          grandTotal: inv.grandTotal || 0,
          notes: inv.notes || '',
          terms: inv.terms || '',
          status: inv.status,
          createdAt: inv.createdAt ? inv.createdAt.toISOString() : new Date().toISOString()
        };
      });
    }

    const businessProfile = profileRows[0] ? {
      name: profileRows[0].name,
      logo: profileRows[0].logo || '',
      gstNumber: profileRows[0].gstNumber,
      panNumber: profileRows[0].panNumber || '',
      address: profileRows[0].address || '',
      email: profileRows[0].email || '',
      phone: profileRows[0].phone || '',
      website: profileRows[0].website || '',
      bankName: profileRows[0].bankName || '',
      accountNumber: profileRows[0].accountNumber || '',
      bankIfsc: profileRows[0].bankIfsc || '',
      bankBranch: profileRows[0].bankBranch || '',
      upiId: profileRows[0].upiId || ''
    } : null;

    const formattedCustomers = customerRows.map(c => ({
      id: c.id,
      customerName: c.customerName,
      companyName: c.companyName || '',
      gstin: c.gstin || '',
      address: c.address || '',
      phone: c.phone || '',
      email: c.email || '',
      totalBilled: c.totalBilled || 0,
      outstanding: c.outstanding || 0
    }));

    const formattedProducts = productRows.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      hsnSac: p.hsnSac || '',
      unit: p.unit,
      rate: p.rate || 0,
      gstPercentage: p.gstPercentage || 0
    }));

    const formattedPayments = paymentRows.map(p => ({
      id: p.id,
      invoiceId: p.invoiceId,
      invoiceNumber: p.invoiceNumber,
      customerName: p.customerName,
      paymentDate: p.paymentDate,
      amountPaid: p.amountPaid || 0,
      paymentMode: p.paymentMode,
      transactionRef: p.transactionRef,
      notes: p.notes || ''
    }));

    const formattedNotifications = notificationRows.map(n => ({
      id: n.id,
      timestamp: n.timestamp,
      message: n.message,
      isRead: n.isRead || false,
      type: n.type as 'info' | 'success' | 'warning' | 'error'
    }));

    return {
      businessProfile,
      customers: formattedCustomers,
      products: formattedProducts,
      invoices: populatedInvoices,
      payments: formattedPayments,
      notifications: formattedNotifications
    };
  } catch (err) {
    console.error('Error fetching user state from postgres:', err);
    throw new Error('Failed to query state from database', { cause: err });
  }
}

export async function saveUserData(userId: number, state: UserDBState): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Sync Business Profile
      if (state.businessProfile && state.businessProfile.name) {
        await tx.insert(businessProfiles)
          .values({
            userId,
            name: state.businessProfile.name,
            logo: state.businessProfile.logo || '',
            gstNumber: state.businessProfile.gstNumber,
            panNumber: state.businessProfile.panNumber || '',
            address: state.businessProfile.address || '',
            email: state.businessProfile.email || '',
            phone: state.businessProfile.phone || '',
            website: state.businessProfile.website || '',
            bankName: state.businessProfile.bankName || '',
            accountNumber: state.businessProfile.accountNumber || '',
            bankIfsc: state.businessProfile.bankIfsc || '',
            bankBranch: state.businessProfile.bankBranch || '',
            upiId: state.businessProfile.upiId || ''
          })
          .onConflictDoUpdate({
            target: businessProfiles.userId,
            set: {
              name: state.businessProfile.name,
              logo: state.businessProfile.logo || '',
              gstNumber: state.businessProfile.gstNumber,
              panNumber: state.businessProfile.panNumber || '',
              address: state.businessProfile.address || '',
              email: state.businessProfile.email || '',
              phone: state.businessProfile.phone || '',
              website: state.businessProfile.website || '',
              bankName: state.businessProfile.bankName || '',
              accountNumber: state.businessProfile.accountNumber || '',
              bankIfsc: state.businessProfile.bankIfsc || '',
              bankBranch: state.businessProfile.bankBranch || '',
              upiId: state.businessProfile.upiId || '',
              updatedAt: new Date()
            }
          });
      }

      // 2. Sync Customers - delete and insert to ensure state parity
      await tx.delete(customers).where(eq(customers.userId, userId));
      if (state.customers && state.customers.length > 0) {
        for (const c of state.customers) {
          await tx.insert(customers).values({
            id: c.id,
            userId,
            customerName: c.customerName,
            companyName: c.companyName || '',
            gstin: c.gstin || '',
            address: c.address || '',
            phone: c.phone || '',
            email: c.email || '',
            totalBilled: c.totalBilled || 0,
            outstanding: c.outstanding || 0
          });
        }
      }

      // 3. Sync Products
      await tx.delete(products).where(eq(products.userId, userId));
      if (state.products && state.products.length > 0) {
        for (const p of state.products) {
          await tx.insert(products).values({
            id: p.id,
            userId,
            name: p.name,
            description: p.description || '',
            hsnSac: p.hsnSac || '',
            unit: p.unit || 'PCS',
            rate: p.rate || 0,
            gstPercentage: p.gstPercentage || 0
          });
        }
      }

      // 4. Sync Invoices and Invoice Items
      await tx.delete(invoices).where(eq(invoices.userId, userId));
      // Cascade delete handles invoiceItems
      if (state.invoices && state.invoices.length > 0) {
        for (const i of state.invoices) {
          await tx.insert(invoices).values({
            id: i.id,
            userId,
            invoiceNumber: i.invoiceNumber,
            invoiceDate: i.invoiceDate,
            dueDate: i.dueDate,
            customerId: i.customerId,
            customerName: i.customerName,
            customerGstin: i.customerGstin || '',
            supplyType: i.supplyType || 'INTRA',
            placeOfSupply: i.placeOfSupply || 'MH',
            subtotal: i.subtotal || 0,
            discountValue: i.discountValue || 0,
            discountType: i.discountType || 'PERCENT',
            discountAmount: i.discountAmount || 0,
            shippingCharges: i.shippingCharges || 0,
            applyGstOnShipping: i.applyGstOnShipping || false,
            totalCgst: i.totalCgst || 0,
            totalSgst: i.totalSgst || 0,
            totalIgst: i.totalIgst || 0,
            totalTax: i.totalTax || 0,
            roundOff: i.roundOff || 0,
            grandTotal: i.grandTotal || 0,
            notes: i.notes || '',
            terms: i.terms || '',
            status: i.status || 'Draft',
            createdAt: i.createdAt ? new Date(i.createdAt) : new Date()
          });

          if (i.items && i.items.length > 0) {
            for (const item of i.items) {
              await tx.insert(invoiceItems).values({
                id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                invoiceId: i.id,
                productId: item.productId,
                name: item.name,
                hsnSac: item.hsnSac || '',
                quantity: item.quantity || 1,
                rate: item.rate || 0,
                discountPercentage: item.discountPercentage || 0,
                gstPercentage: item.gstPercentage || 0,
                taxableValue: item.taxableValue || 0,
                cgst: item.cgst || 0,
                sgst: item.sgst || 0,
                igst: item.igst || 0,
                totalAmount: item.totalAmount || 0
              });
            }
          }
        }
      }

      // 5. Sync Payments
      await tx.delete(payments).where(eq(payments.userId, userId));
      if (state.payments && state.payments.length > 0) {
        for (const pay of state.payments) {
          await tx.insert(payments).values({
            id: pay.id,
            userId,
            invoiceId: pay.invoiceId,
            invoiceNumber: pay.invoiceNumber,
            customerName: pay.customerName,
            paymentDate: pay.paymentDate,
            amountPaid: pay.amountPaid || 0,
            paymentMode: pay.paymentMode,
            transactionRef: pay.transactionRef,
            notes: pay.notes || ''
          });
        }
      }

      // 6. Sync Notifications
      await tx.delete(notifications).where(eq(notifications.userId, userId));
      if (state.notifications && state.notifications.length > 0) {
        for (const n of state.notifications) {
          await tx.insert(notifications).values({
            id: n.id,
            userId,
            timestamp: n.timestamp,
            message: n.message,
            isRead: n.isRead || false,
            type: n.type || 'info'
          });
        }
      }
    });
  } catch (err) {
    console.error('Error synchronizing state to postgres transaction:', err);
    throw new Error('Database transaction failed. Sync aborted.', { cause: err });
  }
}
