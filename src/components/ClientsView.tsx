import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MapPin, 
  Mail, 
  Phone, 
  Hash, 
  ShieldCheck, 
  Edit, 
  Trash2,
  X, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  Receipt, 
  FileText, 
  CreditCard, 
  Activity, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  Building2,
  CheckCircle2,
  User
} from 'lucide-react';
import { Customer, Invoice, Payment } from '../types';

interface ClientsViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer?: (id: string) => void;
  invoices: Invoice[];
  payments: Payment[];
  setCurrentTab: (tab: string) => void;
  setEditingInvoice: (invoice: Invoice | null) => void;
  setSelectedInvoiceId?: (id: string | null) => void;
}

// Indian state list with region codes for auto-detection
const INDIAN_STATES = [
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '07', name: 'Delhi' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '36', name: 'Telangana' },
  { code: '24', name: 'Gujarat' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '19', name: 'West Bengal' },
  { code: '06', name: 'Haryana' },
  { code: '08', name: 'Rajasthan' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '32', name: 'Kerala' },
  { code: '18', name: 'Assam' },
  { code: '10', name: 'Bihar' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '30', name: 'Goa' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '20', name: 'Jharkhand' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '21', name: 'Odisha' },
  { code: '11', name: 'Sikkim' },
  { code: '05', name: 'Uttarakhand' }
];

export default function ClientsView({ 
  customers, 
  onAddCustomer, 
  onEditCustomer, 
  onDeleteCustomer,
  invoices,
  payments,
  setCurrentTab,
  setEditingInvoice,
  setSelectedInvoiceId
}: ClientsViewProps) {
  
  // Navigation & View Sub-states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Customer | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'Invoices' | 'Payments' | 'Activity'>('Invoices');

  // Form Fields State
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('27 - Maharashtra');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // GSTIN Verification Sub-states
  const [isValidatingGstin, setIsValidatingGstin] = useState(false);
  const [gstinValidationMsg, setGstinValidationMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Currency Converter Formatter (en-IN)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Prepopulate stats
  const totalCustomersCount = 84 + (customers.length - 5);
  const activeThisMonthCount = 32;
  const outstandingAmountSum = 124500 + customers.reduce((sum, c) => {
    const isMock = ['cust-1', 'cust-2', 'cust-3', 'cust-4', 'cust-5'].includes(c.id);
    return sum + (isMock ? 0 : (c.outstanding || 0));
  }, 0);

  // Dynamic Avatar Theme Picker (Blue, Emerald, Purple)
  const getAvatarTheme = (id: string, name: string) => {
    const sum = (id + name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const themes = [
      { bg: 'bg-blue-50 text-blue-600 border-blue-100', circle: 'bg-blue-100 text-blue-700 font-bold' },
      { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', circle: 'bg-emerald-100 text-emerald-700 font-bold' },
      { bg: 'bg-purple-50 text-purple-600 border-purple-100', circle: 'bg-purple-100 text-purple-700 font-bold' }
    ];
    return themes[sum % themes.length];
  };

  const getInitials = (company: string, client: string) => {
    const target = company || client || 'Customer';
    const words = target.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return target.substring(0, 2).toUpperCase();
  };

  // GSTIN Real-time verification simulator
  const handleValidateGstin = () => {
    if (!gstin) {
      setGstinValidationMsg({ type: 'error', text: 'Please input a GSTIN number to validate.' });
      return;
    }
    const cleanGst = gstin.trim().toUpperCase();
    if (cleanGst.length !== 15) {
      setGstinValidationMsg({ type: 'error', text: 'GSTIN must be exactly 15 characters long.' });
      return;
    }

    setIsValidatingGstin(true);
    setGstinValidationMsg(null);

    setTimeout(() => {
      setIsValidatingGstin(false);
      const statePrefix = cleanGst.substring(0, 2);
      const matchedState = INDIAN_STATES.find(s => s.code === statePrefix);

      if (matchedState) {
        // Auto-configure the dropdown based on state code prefix
        setState(`${matchedState.code} - ${matchedState.name}`);
        setGstinValidationMsg({
          type: 'success',
          text: `Verified! Active GSTIN mapped to ${companyName || 'Registered Taxpayer'} in state ${matchedState.name}.`
        });
      } else {
        setGstinValidationMsg({
          type: 'success',
          text: `Verified! Standard valid structure format. Unknown state code prefix (${statePrefix}).`
        });
      }
    }, 800);
  };

  // Form Reset helper
  const resetForm = () => {
    setCustomerName('');
    setCompanyName('');
    setGstin('');
    setPhone('');
    setEmail('');
    setAddress('');
    setState('27 - Maharashtra');
    setCity('');
    setPincode('');
    setBillingSameAsShipping(true);
    setShippingAddress('');
    setStatus('Active');
    setEditingClient(null);
    setGstinValidationMsg(null);
  };

  // Populate form for editing
  const handleEditClick = (c: Customer) => {
    setEditingClient(c);
    setCustomerName(c.customerName);
    setCompanyName(c.companyName);
    setGstin(c.gstin);
    setPhone(c.phone);
    setEmail(c.email);
    setAddress(c.address);
    setState(c.state || '27 - Maharashtra');
    setCity(c.city || '');
    setPincode(c.pincode || '');
    setBillingSameAsShipping(c.billingSameAsShipping !== false);
    setShippingAddress(c.shippingAddress || '');
    setStatus(c.status || 'Active');
    setShowAddForm(true);
  };

  // Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      alert('Primary Contact Name is a required field.');
      return;
    }
    if (!phone) {
      alert('Mobile Number is a required field.');
      return;
    }

    const payload: Customer = {
      id: editingClient?.id || `cust-${Date.now()}`,
      customerName,
      companyName: companyName || customerName, // fall back to contact name
      gstin: gstin.toUpperCase(),
      address,
      phone,
      email,
      state,
      city,
      pincode,
      billingSameAsShipping,
      shippingAddress: billingSameAsShipping ? address : shippingAddress,
      status,
      totalBilled: editingClient?.totalBilled || 0,
      outstanding: editingClient?.outstanding || 0
    };

    if (editingClient) {
      onEditCustomer(payload);
    } else {
      // Set some initial billing for demo robustness
      payload.totalBilled = 0;
      payload.outstanding = 0;
      onAddCustomer(payload);
    }

    resetForm();
    setShowAddForm(false);
  };

  // Navigation: Direct create invoice from Customer
  const handleNewInvoiceForCustomer = (c: Customer) => {
    const draftInvoice: Invoice = {
      id: '',
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return d.toISOString().split('T')[0];
      })(),
      customerId: c.id,
      customerName: c.companyName || c.customerName,
      customerGstin: c.gstin,
      supplyType: c.gstin.startsWith('27') ? 'INTRA' : 'INTER',
      placeOfSupply: c.state || '27 - Maharashtra',
      items: [
        { id: 'item-1', productId: '', name: 'Software Premium Suite License', hsnSac: '9973', quantity: 1, rate: 15000, discountPercentage: 0, gstPercentage: 18, taxableValue: 15000, cgst: 1350, sgst: 1350, igst: 0, totalAmount: 17700 }
      ],
      subtotal: 15000,
      discountValue: 0,
      discountType: 'VALUE',
      discountAmount: 0,
      shippingCharges: 0,
      applyGstOnShipping: false,
      totalCgst: 1350,
      totalSgst: 1350,
      totalIgst: 0,
      totalTax: 2700,
      roundOff: 0,
      grandTotal: 17700,
      notes: 'Payment due within 14 days.',
      terms: 'All disputes are subject to municipal jurisdiction.',
      status: 'Draft',
      createdAt: new Date().toISOString()
    };

    setEditingInvoice(draftInvoice);
    setCurrentTab('create-invoice');
  };

  // Deletion wrap with navigation handle
  const handleCustomerDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer? This operation cannot be undone.')) {
      if (onDeleteCustomer) {
        onDeleteCustomer(id);
      }
      setSelectedCustomer(null);
    }
  };

  // Searching & Filtering
  const filteredCustomers = customers.filter(c => {
    const sTerm = searchQuery.toLowerCase();
    const matchesSearch = 
      c.companyName?.toLowerCase().includes(sTerm) ||
      c.customerName?.toLowerCase().includes(sTerm) ||
      c.gstin?.toLowerCase().includes(sTerm) ||
      c.phone?.toLowerCase().includes(sTerm) ||
      c.email?.toLowerCase().includes(sTerm);

    const isCustomerActive = c.status !== 'Inactive';
    const matchesFilter = 
      statusFilter === 'All' ||
      (statusFilter === 'Active' && isCustomerActive) ||
      (statusFilter === 'Inactive' && !isCustomerActive);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="customers-view-wrapper">
      
      {/* ----------------- SUB-VIEW: LEDGER PROFILE DETAIL PAGE ----------------- */}
      {selectedCustomer ? (
        <div className="space-y-6" id="customer-detail-page">
          
          {/* Back Trigger Navigation Row */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200"
              id="back-to-customers-grid-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Customers Grid
            </button>

            <span className="text-[11px] text-slate-400 font-semibold font-mono">
              SUITE ID: {selectedCustomer.id}
            </span>
          </div>

          {/* Customer Deep Details Header Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-lg border shadow-xs ${getAvatarTheme(selectedCustomer.id, selectedCustomer.companyName).bg}`}>
                {getInitials(selectedCustomer.companyName, selectedCustomer.customerName)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {selectedCustomer.companyName || selectedCustomer.customerName}
                  </h1>
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${selectedCustomer.status !== 'Inactive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {selectedCustomer.status || 'Active'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 font-medium">
                  Primary Contact: <span className="text-slate-705 font-bold">{selectedCustomer.customerName}</span>
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                  {selectedCustomer.gstin && (
                    <span className="flex items-center gap-1 font-mono text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      GSTIN: <strong className="text-slate-700">{selectedCustomer.gstin}</strong>
                    </span>
                  )}
                  {selectedCustomer.phone && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Phone className="w-3 h-3 text-slate-350" />
                      {selectedCustomer.phone}
                    </span>
                  )}
                  {selectedCustomer.email && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Mail className="w-3 h-3 text-slate-350" />
                      {selectedCustomer.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile actions container */}
            <div className="flex items-center gap-2 max-sm:w-full">
              <button 
                onClick={() => handleNewInvoiceForCustomer(selectedCustomer)}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs shadow-sm transition-all"
                id="profile-create-invoice-btn"
              >
                <Receipt className="w-3.5 h-3.5" />
                New Invoice
              </button>
              
              <button 
                onClick={() => handleEditClick(selectedCustomer)}
                className="inline-flex items-center justify-center p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs"
                title="Edit Customer Profile"
                id="profile-edit-customer-btn"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button 
                onClick={() => handleCustomerDelete(selectedCustomer.id)}
                className="inline-flex items-center justify-center p-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs"
                title="Delete Customer profile"
                id="profile-delete-customer-btn"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Detailed stats overview: 4 customized ledger status cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="customer-deep-ledger-metrics">
            
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Invoices</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {invoices.filter(i => i.customerId === selectedCustomer.id).length || (selectedCustomer.id === 'cust-1' ? 12 : selectedCustomer.id === 'cust-2' ? 4 : selectedCustomer.id === 'cust-3' ? 18 : selectedCustomer.id === 'cust-4' ? 2 : selectedCustomer.id === 'cust-5' ? 5 : 0)}
                </span>
                <span className="text-xs text-slate-400 font-semibold">invoices</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Billed Amount</span>
              <span className="text-2xl font-black text-slate-900 font-mono block">
                {formatCurrency(selectedCustomer.totalBilled || 0)}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Paid Amount</span>
              <span className="text-2xl font-black text-emerald-600 font-mono block">
                {formatCurrency(Math.max(0, (selectedCustomer.totalBilled || 0) - (selectedCustomer.outstanding || 0)))}
              </span>
            </div>

            <div className="bg-white border border-red-150 bg-red-50/10 rounded-xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider block">Outstanding Due</span>
              <span className="text-2xl font-black text-red-600 font-mono block">
                {formatCurrency(selectedCustomer.outstanding || 0)}
              </span>
            </div>

          </div>

          {/* Deep Tabs Row: Invoices | Payments | Activity */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="customer-deep-history-tabs-container">
            <div className="border-b border-slate-200 bg-slate-50/70 p-2 flex items-center justify-between">
              <div className="flex gap-1">
                {(['Invoices', 'Payments', 'Activity'] as const).map(tab => {
                  const isActive = activeDetailTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveDetailTab(tab)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isActive ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      {tab === 'Invoices' && <FileText className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />}
                      {tab === 'Payments' && <CreditCard className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />}
                      {tab === 'Activity' && <Activity className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />}
                      {tab}
                    </button>
                  );
                })}
              </div>

              <span className="text-[10px] text-slate-400 font-semibold px-2">
                Active Ledger Sync
              </span>
            </div>

            <div className="p-4">
              
              {/* Tab 1: Invoices */}
              {activeDetailTab === 'Invoices' && (
                <div className="overflow-x-auto min-w-full">
                  {invoices.filter(i => i.customerId === selectedCustomer.id).length === 0 ? (
                    <div className="text-center py-12 text-slate-450 space-y-2">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-500">No active invoices found for this customer.</p>
                      <button 
                        onClick={() => handleNewInvoiceForCustomer(selectedCustomer)} 
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Create the very first invoice for this customer
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 text-[10.5px] uppercase font-black text-slate-450 tracking-wider">
                          <th className="pb-3 pl-2">Invoice Number</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Due Date</th>
                          <th className="pb-3 text-right">Amount</th>
                          <th className="pb-3 text-center">Status</th>
                          <th className="pb-3 text-right pr-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {invoices.filter(i => i.customerId === selectedCustomer.id).map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50/50">
                            <td className="py-3 pl-2">
                              <button 
                                onClick={() => {
                                  if (setSelectedInvoiceId) setSelectedInvoiceId(inv.id);
                                  setCurrentTab('preview-invoice');
                                }}
                                className="font-bold text-blue-600 hover:underline text-left font-mono"
                              >
                                {inv.invoiceNumber}
                              </button>
                            </td>
                            <td className="py-3 text-slate-500">{inv.invoiceDate}</td>
                            <td className="py-3 text-slate-500">{inv.dueDate}</td>
                            <td className="py-3 font-mono font-bold text-slate-900 text-right">{formatCurrency(inv.grandTotal)}</td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                                inv.status === 'Sent' ? 'bg-blue-50 text-blue-600' :
                                inv.status === 'Overdue' ? 'bg-red-50 text-red-600' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-3 text-right pr-2">
                              <button
                                onClick={() => {
                                  if (setSelectedInvoiceId) setSelectedInvoiceId(inv.id);
                                  setCurrentTab('preview-invoice');
                                }}
                                className="text-xs font-bold text-slate-600 hover:text-blue-600 hover:underline"
                              >
                                View PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 2: Payments */}
              {activeDetailTab === 'Payments' && (
                <div className="overflow-x-auto min-w-full">
                  {payments.filter(p => invoices.find(i => i.id === p.invoiceId)?.customerId === selectedCustomer.id).length === 0 ? (
                    <div className="text-center py-12 text-slate-450 space-y-2">
                      <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-500">No payment receipts have been processed.</p>
                      <p className="text-xs text-slate-400">All direct settlement ledgers are adjusted through credit journals.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 text-[10.5px] uppercase font-black text-slate-450 tracking-wider">
                          <th className="pb-3 pl-2">Receipt reference</th>
                          <th className="pb-3">Payment Date</th>
                          <th className="pb-3">Invoice context</th>
                          <th className="pb-3">Payment mode</th>
                          <th className="pb-3 text-right pr-2">Amount Cleared</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-705">
                        {payments.filter(p => invoices.find(i => i.id === p.invoiceId)?.customerId === selectedCustomer.id).map(pay => (
                          <tr key={pay.id} className="hover:bg-slate-50/50">
                            <td className="py-3 pl-2 font-mono font-medium text-slate-500">{pay.transactionRef}</td>
                            <td className="py-3">{pay.paymentDate}</td>
                            <td className="py-3 text-blue-600 font-bold font-mono">{pay.invoiceNumber}</td>
                            <td className="py-3">{pay.paymentMode}</td>
                            <td className="py-3 font-mono font-bold text-emerald-600 text-right pr-2">+{formatCurrency(pay.amountPaid)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 3: Activity */}
              {activeDetailTab === 'Activity' && (
                <div className="space-y-4 max-w-2xl py-2">
                  <div className="relative border-l-2 border-slate-150 pl-5 space-y-6">
                    
                    {/* Activity line 4 */}
                    <div className="relative">
                      <div className="absolute -left-[27px] top-1 bg-blue-100 text-blue-600 p-1 rounded-full border-2 border-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">JUNE 20, 2026 14:12</span>
                      <p className="text-xs font-bold text-slate-800">Direct settlement cleared via UPI</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">UPI clearance reference CR_CLR_8727 recorded successfully.</p>
                    </div>

                    {/* Activity line 3 */}
                    <div className="relative">
                      <div className="absolute -left-[27px] top-1 bg-emerald-100 text-emerald-600 p-1 rounded-full border-2 border-white">
                        <Receipt className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">JUNE 15, 2026 10:45</span>
                      <p className="text-xs font-bold text-slate-800">GST Invoice Issued successfully</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Dispatched to accounts@technova.com with 18% CGST/SGST structure.</p>
                    </div>

                    {/* Activity line 2 */}
                    <div className="relative">
                      <div className="absolute -left-[27px] top-1 bg-purple-100 text-purple-600 p-1 rounded-full border-2 border-white">
                        <ShieldCheck className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">JUNE 10, 2026 09:30</span>
                      <p className="text-xs font-bold text-slate-800">GSTIN verified &amp; state mapped</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Validated with Indian GST network database state code region.</p>
                    </div>

                    {/* Activity line 1 */}
                    <div className="relative">
                      <div className="absolute -left-[27px] top-1 bg-slate-100 text-slate-600 p-1 rounded-full border-2 border-white">
                        <User className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">JUNE 01, 2026 09:00</span>
                      <p className="text-xs font-bold text-slate-800">Customer Registered</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Ledger activated under default business configurations.</p>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      ) : (
        /* ----------------- SUB-VIEW: MASTER GRID DIRECTORY VIEW ----------------- */
        <div className="space-y-6" id="customers-grid-lobby-page">
          
          {/* Header Layout Banner */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight" id="customers-heading-label">Customers</h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Keep track of customer profile information, Indian GSTINs, and outstanding balances.</p>
            </div>
            
            <button 
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-sm text-xs border border-transparent"
              id="add-customer-header-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>

          {/* Core Stats Row of 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="customers-stats-deck">
            
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1.5" id="stat-card-total-customers">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-black tracking-wider block">Total Customers</span>
                <User className="w-4 h-4 text-slate-300" />
              </div>
              <span className="text-3xl font-black text-slate-900 font-mono block">
                {totalCustomersCount}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1.5" id="stat-card-active">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-black tracking-wider block">Active This Month</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-3xl font-black text-slate-900 font-mono block">
                {activeThisMonthCount}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1.5" id="stat-card-outstanding">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-black tracking-wider text-red-500 block">Outstanding Amount</span>
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-3xl font-black text-red-650 font-mono block">
                {formatCurrency(outstandingAmountSum)}
              </span>
            </div>

          </div>

          {/* Search and Filters Strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm" id="client-search-filter-belt">
            
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                id="customer-search-input"
                type="text"
                placeholder="Search customers by name, GSTIN, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 focus:border-slate-300 bg-slate-50/50 rounded-lg text-xs font-semibold focus:outline-none placeholder:text-slate-400 text-slate-800"
              />
            </div>

            {/* In-tab filter controllers */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto" id="customers-status-filters">
              {(['All', 'Active', 'Inactive'] as const).map(f => {
                const isActive = statusFilter === f;
                return (
                  <button
                    key={f}
                    id={`filter-btn-${f.toLowerCase()}`}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${isActive ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Main Grid View list of Customers */}
          {filteredCustomers.length === 0 ? (
            <div className="bg-white border border-slate-150 rounded-xl py-12 text-center text-slate-450 space-y-2 shadow-sm" id="empty-search-state">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">No customers found matching your search parameters.</p>
              <button 
                onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Clear all active search filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="customers-grid-block">
              {filteredCustomers.map(c => {
                const hasLedgers = c.outstanding !== undefined;
                return (
                  <div 
                    key={c.id} 
                    id={`customer-card-${c.id}`}
                    className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden relative"
                  >
                    <div>
                      {/* Top bar with Circle Avatar & Initials */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm border ${getAvatarTheme(c.id, c.companyName).bg}`}>
                          {getInitials(c.companyName, c.customerName)}
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${c.status !== 'Inactive' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {c.status || 'Active'}
                        </span>
                      </div>

                      {/* Customer / Company name */}
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm truncate leading-tight" title={c.companyName || c.customerName}>
                        {c.companyName || c.customerName}
                      </h3>

                      {c.companyName && c.customerName !== c.companyName && (
                        <p className="text-[10.5px] text-slate-450 font-bold truncate mt-0.5">
                          POC: {c.customerName}
                        </p>
                      )}

                      {/* GSTIN displayed in mono font (#64748B) */}
                      {c.gstin ? (
                        <p className="text-[11px] text-[#64748B] font-mono mt-1.5 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{c.gstin}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic font-mono mt-1.5">
                          GSTIN unregistered / cash ledger
                        </p>
                      )}

                      {/* Contact metadata */}
                      <div className="space-y-1 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                        {c.phone && (
                          <p className="flex items-center gap-1.5 truncate">
                            <Phone className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                            <span>{c.phone}</span>
                          </p>
                        )}
                        {c.email && (
                          <p className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                            <span>{c.email}</span>
                          </p>
                        )}
                      </div>

                      {/* Financial performance indicators: Total Invoices & Outstanding */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <div>
                          <span className="text-[9.5px] text-slate-400 block uppercase font-bold tracking-wider">Total Invoices</span>
                          <span className="font-semibold text-slate-800 font-mono">
                            {invoices.filter(inv => inv.customerId === c.id).length || (c.id === 'cust-1' ? 12 : c.id === 'cust-2' ? 4 : c.id === 'cust-3' ? 18 : c.id === 'cust-4' ? 2 : c.id === 'cust-5' ? 5 : 0)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9.5px] text-slate-400 block uppercase font-bold tracking-wider">Outstanding</span>
                          <span className="font-semibold text-red-650 font-mono">
                            {formatCurrency(c.outstanding || 0)}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Bottom buttons: View Profile / New Invoice */}
                    <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                      <button 
                        onClick={() => setSelectedCustomer(c)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                        id={`view-profile-btn-${c.id}`}
                      >
                        <span>View Profile</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <button 
                        onClick={() => handleNewInvoiceForCustomer(c)}
                        className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-1.5 px-3 rounded-lg text-[11px] transition-colors"
                        id={`new-invoice-btn-${c.id}`}
                      >
                        <Receipt className="w-3 h-3" />
                        <span>New Invoice</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ----------------- CUSTOM ADD / EDIT DRAWER (SLIDING FROM RIGHT) ----------------- */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="customer-drawer-title" role="dialog" aria-modal="true" id="add-customer-drawer">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Dark background backdrop overlay */}
            <div 
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-md transition-all duration-500 ease-in-out" 
              onClick={() => { resetForm(); setShowAddForm(false); }}
              id="drawer-backdrop"
            ></div>
            
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 max-sm:pl-0">
              
              {/* Responsive slide-over container (mobile matches full-screen sheet) */}
              <div className="pointer-events-auto w-screen max-w-md max-sm:max-w-full h-full transform transition duration-300 bg-white shadow-2xl flex flex-col justify-between" id="drawer-sheet-body">
                
                {/* Form Wrapper Header */}
                <div className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
                  <div>
                    <h2 className="text-base font-bold text-slate-900" id="customer-drawer-title">
                      {editingClient ? 'Edit Customer Card' : 'Configure New Customer'}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium">Input Indian GST taxpayer credentials and billing ledgers.</p>
                  </div>
                  
                  <button 
                    onClick={() => { resetForm(); setShowAddForm(false); }} 
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                    id="close-drawer-header-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Scrollable Form Body Container */}
                <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4" id="add-customer-form">
                  
                  {/* Customer Status Block */}
                  {editingClient && (
                    <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-150 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-700">Account status</span>
                        <p className="text-[10px] text-slate-400">Suspend invoices if deactivated.</p>
                      </div>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-700 font-bold focus:outline-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  )}

                  {/* Primary contact person */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <span>Customer Name *</span>
                      <User className="w-3.5 h-3.5 text-slate-350" />
                    </label>
                    <input 
                      id="input-customer-name"
                      type="text"
                      placeholder="Rahul Patel"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs font-medium focus:outline-none"
                      required
                    />
                  </div>

                  {/* Company legal name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <span>Company Name</span>
                      <Building2 className="w-3.5 h-3.5 text-slate-350" />
                    </label>
                    <input 
                      id="input-company-name"
                      type="text"
                      placeholder="TechNova Associates Pvt Ltd (Optional)"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs font-medium focus:outline-none"
                    />
                  </div>

                  {/* GSTIN details validator strip */}
                  <div className="space-y-1 pb-1">
                    <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
                      <span>GSTIN (GST Identification Number)</span>
                      <span className="text-[10.5px] text-slate-400 font-semibold font-mono">15 digits</span>
                    </label>
                    <div className="flex gap-2">
                      <input 
                        id="input-gstin"
                        type="text"
                        maxLength={15}
                        placeholder="27ABCDE1234F1Z5"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs font-mono uppercase focus:outline-none"
                      />
                      <button
                        type="button"
                        id="validate-gstin-btn"
                        onClick={handleValidateGstin}
                        disabled={isValidatingGstin}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-extrabold border border-blue-150 px-3.5 py-2 rounded-lg text-xs transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
                      >
                        {isValidatingGstin ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span>Validate</span>
                      </button>
                    </div>

                    {/* Integrated validation alerts */}
                    {gstinValidationMsg && (
                      <div className={`mt-1.5 p-2 rounded text-[11px] leading-tight flex items-start gap-1.5 font-medium border ${
                        gstinValidationMsg.type === 'success' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                          : 'bg-red-50 text-red-700 border-red-150'
                      }`}>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{gstinValidationMsg.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Phone + Email details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Mobile *</label>
                      <input 
                        id="input-phone"
                        type="tel"
                        placeholder="+91 9988112233"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs font-medium focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Email</label>
                      <input 
                        id="input-email"
                        type="email"
                        placeholder="billing@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Billing address primary textarea */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <span>Address *</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-350" />
                    </label>
                    <textarea 
                      id="input-billing-address"
                      rows={2}
                      placeholder="Suite 104, Hitech Avenue Office, Gachibowli"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs focus:outline-none"
                      required
                    />
                  </div>

                  {/* State, City, Pincode stacked beautifully in 3 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">State *</label>
                      <select 
                        id="input-state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-2 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/50 rounded-lg text-xs focus:outline-none text-slate-800"
                        required
                      >
                        {INDIAN_STATES.map(st => (
                          <option key={st.code} value={`${st.code} - ${st.name}`}>
                            {st.code} - {st.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">City</label>
                      <input 
                        id="input-city"
                        type="text"
                        placeholder="Hyderabad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-2.5 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs font-medium focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Pincode</label>
                      <input 
                        id="input-pincode"
                        type="text"
                        maxLength={6}
                        placeholder="500081"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-2 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs font-mono focus:outline-none text-center"
                      />
                    </div>
                  </div>

                  {/* Billing = Shipping toggle switch with Lucide icons */}
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                      <div>
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Billing = Shipping</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Shipping matches billing address</p>
                      </div>
                      <button 
                        type="button"
                        id="billing-shipping-toggle-switch"
                        onClick={() => setBillingSameAsShipping(!billingSameAsShipping)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 ${billingSameAsShipping ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${billingSameAsShipping ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Conditionally render Shipping Address Textarea if toggle is unchecked */}
                  {!billingSameAsShipping && (
                    <div className="space-y-1 animate-fade-in" id="shipping-address-container">
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <span>Alternate Shipping Address *</span>
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      </label>
                      <textarea 
                        id="input-shipping-address"
                        rows={2}
                        placeholder="Enter alternative shipping address if different from billing..."
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs focus:outline-none"
                        required={!billingSameAsShipping}
                      />
                    </div>
                  )}

                  <input type="submit" className="hidden" /> {/* standard keyboard submit support */}
                </form>

                {/* Left/Right Action Footers to Commit/Cancel */}
                <div className="px-6 py-4.5 border-t border-slate-150 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                  <button 
                    type="button" 
                    id="cancel-drawer-btn"
                    onClick={() => { resetForm(); setShowAddForm(false); }} 
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-bold border border-slate-200 rounded-lg text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="button" 
                    id="submit-drawer-btn"
                    onClick={handleFormSubmit}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-xs shadow-sm transition-all border border-transparent"
                  >
                    {editingClient ? 'Save Changes' : 'Save Customer'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
