import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import DashboardView from './components/DashboardView';
import InvoicesView from './components/InvoicesView';
import CreateInvoiceView from './components/CreateInvoiceView';
import ClientsView from './components/ClientsView';
import ProductsView from './components/ProductsView';
import ReportsView from './components/ReportsView';
import PaymentsView from './components/PaymentsView';
import SettingsView from './components/SettingsView';
import InvoiceDetailView from './components/InvoiceDetailView';
import NotificationsView from './components/NotificationsView';

import { 
  auth, 
  googleAuthProvider 
} from './lib/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

import { 
  defaultBusinessProfile, 
  defaultCustomers, 
  defaultProducts, 
  defaultInvoices, 
  defaultPayments, 
  defaultNotifications 
} from './mockData';
import { BusinessProfile, Customer, Product, Invoice, Payment, AppNotification } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Core full-stack state variables
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(defaultBusinessProfile);
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [invoices, setInvoices] = useState<Invoice[]>(defaultInvoices);
  const [payments, setPayments] = useState<Payment[]>(defaultPayments);
  const [notifications, setNotifications] = useState<AppNotification[]>(defaultNotifications);

  // Selected state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Firebase auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Handle client authentication state and load user data dynamically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const token = await user.getIdToken();
          setUserToken(token);

          // Force load user-specific Postgres database entries
          const res = await fetch('/api/db', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const remote = await res.json();
            setBusinessProfile(remote.businessProfile || defaultBusinessProfile);
            setCustomers(remote.customers || []);
            setProducts(remote.products || []);
            setInvoices(remote.invoices || []);
            setPayments(remote.payments || []);
            setNotifications(remote.notifications || []);
          }
        } catch (err) {
          console.error('Failed to load user-specific relational database:', err);
        }
      } else {
        setCurrentUser(null);
        setUserToken(null);
        // Fallback or guest state parsing
        try {
          const res = await fetch('/api/db');
          if (res.ok) {
            const remote = await res.json();
            if (remote.businessProfile) setBusinessProfile(remote.businessProfile);
            if (remote.customers) setCustomers(remote.customers);
            if (remote.products) setProducts(remote.products);
            if (remote.invoices) setInvoices(remote.invoices);
            if (remote.payments) setPayments(remote.payments);
            if (remote.notifications) setNotifications(remote.notifications);
          }
        } catch (err) {
          console.log('Using robust client-side fallback persistence engine.');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync state to backend server whenever local state modifies
  const syncWithServer = async (updatedState: {
    businessProfile?: BusinessProfile;
    customers?: Customer[];
    products?: Product[];
    invoices?: Invoice[];
    payments?: Payment[];
    notifications?: AppNotification[];
  }) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      await fetch('/api/db', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          businessProfile: updatedState.businessProfile || businessProfile,
          customers: updatedState.customers || customers,
          products: updatedState.products || products,
          invoices: updatedState.invoices || invoices,
          payments: updatedState.payments || payments,
          notifications: updatedState.notifications || notifications
        })
      });
    } catch (err) {
      console.log('Failed to sync to server database. Retaining state in local buffer.');
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Google ID identification failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Session clearance failed:', err);
    }
  };

  // State Mutators
  const handleSaveInvoice = (inv: Invoice) => {
    let fresh: Invoice[];
    const exists = invoices.some(i => i.id === inv.id);

    if (exists) {
      fresh = invoices.map(i => i.id === inv.id ? inv : i);
    } else {
      fresh = [inv, ...invoices];
    }

    setInvoices(fresh);

    // Automatically update customer balance ledger
    const updatedCusts = customers.map(c => {
      if (c.id === inv.customerId) {
        const billed = (c.totalBilled || 0) + inv.grandTotal;
        const outstanding = (c.outstanding || 0) + (inv.status !== 'Paid' ? inv.grandTotal : 0);
        return { ...c, totalBilled: billed, outstanding };
      }
      return c;
    });
    setCustomers(updatedCusts);

    // Add logging notification
    const alert: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `Invoice ${inv.invoiceNumber} has been ${exists ? 'updated' : 'generated'} successfully for ${inv.customerName}.`,
      isRead: false,
      type: 'success'
    };
    const freshNotifs = [alert, ...notifications];
    setNotifications(freshNotifs);

    syncWithServer({ invoices: fresh, customers: updatedCusts, notifications: freshNotifs });
  };

  const handleDeleteInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    if (!confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber}?`)) return;

    const fresh = invoices.filter(i => i.id !== id);
    setInvoices(fresh);

    // Adjust customer ledger balance
    const updatedCusts = customers.map(c => {
      if (c.id === inv.customerId) {
        const billed = Math.max(0, (c.totalBilled || 0) - inv.grandTotal);
        const outstanding = Math.max(0, (c.outstanding || 0) - (inv.status !== 'Paid' ? inv.grandTotal : 0));
        return { ...c, totalBilled: billed, outstanding };
      }
      return c;
    });
    setCustomers(updatedCusts);

    syncWithServer({ invoices: fresh, customers: updatedCusts });
  };

  const handleDuplicateInvoice = (inv: Invoice) => {
    const duplicated: Invoice = {
      ...inv,
      id: `invoice-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      createdAt: new Date().toISOString()
    };
    const fresh = [duplicated, ...invoices];
    setInvoices(fresh);
    setCurrentTab('create-invoice');
    setEditingInvoice(duplicated);

    syncWithServer({ invoices: fresh });
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setCurrentTab('create-invoice');
  };

  const handleAddCustomer = (c: Customer) => {
    const freshList = [c, ...customers];
    setCustomers(freshList);
    syncWithServer({ customers: freshList });
  };

  const handleEditCustomer = (c: Customer) => {
    const freshList = customers.map(cust => cust.id === c.id ? c : cust);
    setCustomers(freshList);
    syncWithServer({ customers: freshList });
  };

  const handleDeleteCustomer = (id: string) => {
    const freshList = customers.filter(cust => cust.id !== id);
    setCustomers(freshList);
    syncWithServer({ customers: freshList });
    
    // Add logging notification
    const alert: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `Customer profile was successfully removed from the active SaaS directory.`,
      isRead: false,
      type: 'warning'
    };
    setNotifications([alert, ...notifications]);
  };

  const handleAddProduct = (p: Product) => {
    const freshList = [p, ...products];
    setProducts(freshList);
    syncWithServer({ products: freshList });
  };

  const handleEditProduct = (p: Product) => {
    const freshList = products.map(prod => prod.id === p.id ? p : prod);
    setProducts(freshList);
    syncWithServer({ products: freshList });
  };

  const handleDeleteProduct = (id: string) => {
    const freshList = products.filter(prod => prod.id !== id);
    setProducts(freshList);
    syncWithServer({ products: freshList });
    
    // Add logging notification
    const alert: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `Product or service SKU was successfully deleted from catalog.`,
      isRead: false,
      type: 'warning'
    };
    setNotifications([alert, ...notifications]);
  };

  const handleRecordPayment = (pay: Payment) => {
    const freshPayments = [pay, ...payments];
    setPayments(freshPayments);

    // Update associated invoice status to "Paid"
    const freshInvoices = invoices.map(i => {
      if (i.id === pay.invoiceId) {
        return { ...i, status: 'Paid' as any };
      }
      return i;
    });
    setInvoices(freshInvoices);

    // Reduce customer's outstanding balance
    const updatedInvoice = invoices.find(i => i.id === pay.invoiceId);
    const updatedCusts = customers.map(c => {
      if (updatedInvoice && c.id === updatedInvoice.customerId) {
        const outstanding = Math.max(0, (c.outstanding || 0) - pay.amountPaid);
        return { ...c, outstanding };
      }
      return c;
    });
    setCustomers(updatedCusts);

    // Log Notification log
    const alert: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `Cleared UPI settlement. Payment of ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(pay.amountPaid)} received for invoice ${pay.invoiceNumber}.`,
      isRead: false,
      type: 'success'
    };
    const freshNotifs = [alert, ...notifications];
    setNotifications(freshNotifs);

    syncWithServer({ 
      payments: freshPayments, 
      invoices: freshInvoices, 
      customers: updatedCusts, 
      notifications: freshNotifs 
    });
  };

  const handleMarkPaid = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    const fakePayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      paymentDate: new Date().toISOString().split('T')[0],
      amountPaid: inv.grandTotal,
      paymentMode: 'Direct settlement / Credit Journal',
      transactionRef: 'CR_CLR_' + Math.floor(Math.random() * 100000),
      notes: 'Cleared directly from preview console panel.'
    };
    handleRecordPayment(fakePayment);
  };

  const handleUpdateProfile = (prof: BusinessProfile) => {
    setBusinessProfile(prof);
    syncWithServer({ businessProfile: prof });
  };

  const handleMarkAllRead = () => {
    const fresh = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(fresh);
    syncWithServer({ notifications: fresh });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    syncWithServer({ notifications: [] });
  };

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col md:flex-row bg-slate-50 min-h-screen text-slate-800" id="supabuyer-root">
      
      {/* Universal sidebar (with mobile bottom tabbar behavior as specified) */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        businessProfile={businessProfile}
        unreadCount={unreadCount}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Container consisting of Top Navbar + Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0" id="main-content-layout-wrapper">
        
        {/* Top Navbar */}
        <TopNavbar 
          currentUser={currentUser}
          unreadCount={unreadCount}
          notifications={notifications}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          setCurrentTab={setCurrentTab}
          businessName={businessProfile.name}
        />

        {/* Primary stage view layout with bottom paddings for mobile sticky bottom tabbar */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-28 md:pb-10 transition-all duration-300 ease-in-out">
          
          {currentTab === 'dashboard' && (
            <DashboardView 
              invoices={invoices} 
              customers={customers}
              setCurrentTab={setCurrentTab}
              setSelectedInvoiceId={setSelectedInvoiceId}
              paymentsCount={payments.length}
            />
          )}

          {currentTab === 'invoices' && (
            <InvoicesView 
              invoices={invoices}
              setCurrentTab={setCurrentTab}
              setSelectedInvoiceId={setSelectedInvoiceId}
              onDeleteInvoice={handleDeleteInvoice}
              onDuplicateInvoice={handleDuplicateInvoice}
              onEditInvoice={handleEditInvoice}
            />
          )}

          {currentTab === 'create-invoice' && (
            <CreateInvoiceView 
              businessProfile={businessProfile}
              customers={customers}
              products={products}
              onSaveInvoice={handleSaveInvoice}
              setCurrentTab={setCurrentTab}
              editingInvoice={editingInvoice}
              setEditingInvoice={setEditingInvoice}
              onAddCustomer={handleAddCustomer}
              setSelectedInvoiceId={setSelectedInvoiceId}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsView 
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              invoices={invoices}
              payments={payments}
              setCurrentTab={setCurrentTab}
              setEditingInvoice={setEditingInvoice}
              setSelectedInvoiceId={setSelectedInvoiceId}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView 
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView invoices={invoices} payments={payments} customers={customers} />
          )}

          {currentTab === 'payments' && (
            <PaymentsView 
              invoices={invoices}
              payments={payments}
              onRecordPayment={handleRecordPayment}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView 
              businessProfile={businessProfile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentTab === 'preview-invoice' && selectedInvoice && (
            <InvoiceDetailView 
              invoice={selectedInvoice}
              businessProfile={businessProfile}
              customers={customers}
              setCurrentTab={setCurrentTab}
              setSelectedInvoiceId={setSelectedInvoiceId}
              onMarkPaid={handleMarkPaid}
              onEditInvoice={handleEditInvoice}
            />
          )}

          {currentTab === 'notifications' && (
            <NotificationsView 
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onClearNotifications={handleClearNotifications}
            />
          )}

        </main>
      </div>

    </div>
  );
}
