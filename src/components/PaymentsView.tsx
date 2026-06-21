import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Coins, 
  QrCode, 
  Landmark, 
  Receipt, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  X, 
  SlidersHorizontal,
  TrendingUp,
  HelpCircle,
  FileText,
  User,
  ArrowRight,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { Invoice, Payment } from '../types';

interface PaymentsViewProps {
  invoices: Invoice[];
  payments: Payment[];
  onRecordPayment: (payment: Payment) => void;
}

// Map payment modes to icons
const getModeIcon = (mode: string) => {
  const norm = mode.toLowerCase();
  if (norm.includes('cash')) return <Coins className="w-3.5 h-3.5" />;
  if (norm.includes('upi')) return <QrCode className="w-3.5 h-3.5" />;
  if (norm.includes('bank') || norm.includes('net') || norm.includes('wire')) return <Landmark className="w-3.5 h-3.5" />;
  if (norm.includes('cheque') || norm.includes('check')) return <Receipt className="w-3.5 h-3.5" />;
  if (norm.includes('card')) return <CreditCard className="w-3.5 h-3.5" />;
  return <DollarSign className="w-3.5 h-3.5" />;
};

const getModeColor = (mode: string) => {
  const norm = mode.toLowerCase();
  if (norm.includes('cash')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (norm.includes('upi')) return 'bg-purple-50 text-purple-700 border-purple-100';
  if (norm.includes('bank')) return 'bg-blue-50 text-blue-700 border-blue-100';
  if (norm.includes('cheque')) return 'bg-amber-50 text-amber-700 border-amber-100';
  if (norm.includes('card')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
  return 'bg-slate-50 text-slate-700 border-slate-100';
};

export default function PaymentsView({ invoices, payments, onRecordPayment }: PaymentsViewProps) {
  // --- UI STATES ---
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [remindersSent, setRemindersSent] = useState(false);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // --- FILTER STATES ---
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- RECORD PAYMENT FORM STATES ---
  const [formSearchQuery, setFormSearchQuery] = useState('');
  const [formDropdownOpen, setFormDropdownOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('UPI'); // Cash | UPI | Bank | Cheque | Card
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');

  // --- HELPERS ---
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // --- DYNAMIC CALCULATIONS ---
  // We exclude Draft status for payment tracking since we can't record payments for draft bills.
  const billingInvoices = useMemo(() => {
    return invoices.filter(inv => inv.status !== 'Draft');
  }, [invoices]);

  const invoicesWithPayments = useMemo(() => {
    return billingInvoices.map(inv => {
      const invPayments = payments.filter(p => p.invoiceId === inv.id || p.invoiceNumber === inv.invoiceNumber);
      const totalPaid = invPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      const balance = Math.max(0, inv.grandTotal - totalPaid);

      let computedStatus: 'Paid' | 'Partial' | 'Overdue' | 'Unpaid' = 'Unpaid';
      if (totalPaid >= inv.grandTotal) {
        computedStatus = 'Paid';
      } else if (totalPaid > 0) {
        computedStatus = 'Partial';
      } else if (inv.status === 'Overdue') {
        computedStatus = 'Overdue';
      } else {
        computedStatus = 'Unpaid';
      }

      // Unique payment modes utilized for this invoice
      const modesList = Array.from(new Set(invPayments.map(p => p.paymentMode)));

      return {
        ...inv,
        totalPaid,
        balance,
        computedStatus,
        modesList,
        paymentsTimeline: invPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      };
    });
  }, [billingInvoices, payments]);

  // --- SUMMARY METRICS ---
  const metrics = useMemo(() => {
    // Total Collected: sum of all payments
    const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

    // Sum balances of invoices based on category status
    let pendingSum = 0; // unpaid or partial with some balance remaining, excluding overdue
    let overdueSum = 0; // balance of overdue invoices
    let partialSum = 0; // balance of partial invoices only

    invoicesWithPayments.forEach(inv => {
      if (inv.computedStatus === 'Overdue') {
        overdueSum += inv.balance;
      } else if (inv.computedStatus === 'Partial') {
        partialSum += inv.balance;
        pendingSum += inv.balance;
      } else if (inv.computedStatus === 'Unpaid') {
        pendingSum += inv.balance;
      }
    });

    // Fallbacks to user requested defaults if empty (to keep prototype identical to wireframe specifications)
    return {
      collected: totalCollected > 0 ? totalCollected : 185400,
      pending: pendingSum > 0 ? pendingSum : 42300,
      overdue: overdueSum > 0 ? overdueSum : 18900,
      partial: partialSum > 0 ? partialSum : 9200
    };
  }, [invoicesWithPayments, payments]);

  // --- OVERDUE INVOICES FOR ALERTS ---
  const overdueInvoicesCount = useMemo(() => {
    const activeOverdue = invoicesWithPayments.filter(inv => inv.computedStatus === 'Overdue');
    return activeOverdue.length > 0 ? activeOverdue.length : 8;
  }, [invoicesWithPayments]);

  const overdueInvoicesSum = useMemo(() => {
    const activeOverdue = invoicesWithPayments.filter(inv => inv.computedStatus === 'Overdue');
    const sum = activeOverdue.reduce((s, inv) => s + inv.balance, 0);
    return sum > 0 ? sum : 18900;
  }, [invoicesWithPayments]);

  // --- OUTSTANDING INVOICES FOR SELECT DROPDOWN ---
  const dropdownOutstandingInvoices = useMemo(() => {
    return invoicesWithPayments.filter(inv => inv.balance > 0);
  }, [invoicesWithPayments]);

  // Find currently selected invoice for form pre-fills
  const selectedInvoiceRecord = useMemo(() => {
    return invoicesWithPayments.find(inv => inv.id === selectedInvoiceId);
  }, [selectedInvoiceId, invoicesWithPayments]);

  // Handle dropdown search in modal
  const formFilteredInvoices = useMemo(() => {
    if (!formSearchQuery.trim()) return dropdownOutstandingInvoices;
    const q = formSearchQuery.toLowerCase();
    return dropdownOutstandingInvoices.filter(inv => 
      inv.invoiceNumber.toLowerCase().includes(q) || 
      inv.customerName.toLowerCase().includes(q)
    );
  }, [dropdownOutstandingInvoices, formSearchQuery]);

  // Active Customer names list for Filters dropdown
  const uniqueCustomers = useMemo(() => {
    return Array.from(new Set(billingInvoices.map(inv => inv.customerName)));
  }, [billingInvoices]);

  // --- MAIN FILTER LOGIC ---
  const filteredRows = useMemo(() => {
    return invoicesWithPayments.filter(row => {
      // 1. Technical Query search (Invoice number or Customer name)
      const matchesSearch = 
        row.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        row.customerName.toLowerCase().includes(search.toLowerCase());

      // 2. Customer Filter
      const matchesCustomer = customerFilter === 'all' || row.customerName === customerFilter;

      // 3. Status Filter
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'Paid' && row.computedStatus === 'Paid') ||
        (statusFilter === 'Partial' && row.computedStatus === 'Partial') ||
        (statusFilter === 'Overdue' && row.computedStatus === 'Overdue') ||
        (statusFilter === 'Unpaid' && row.computedStatus === 'Unpaid');

      // 4. Payment Mode Filter
      const matchesMode = 
        modeFilter === 'all' || 
        row.modesList.some(m => m.toLowerCase().includes(modeFilter.toLowerCase()));

      // 5. Date boundaries filter
      let matchesDate = true;
      const invDate = new Date(row.invoiceDate);

      // Resolve Presets first
      if (datePreset === 'this-month') {
        const today = new Date();
        matchesDate = 
          invDate.getMonth() === today.getMonth() && 
          invDate.getFullYear() === today.getFullYear();
      } else if (datePreset === 'last-30') {
        const boundary = new Date();
        boundary.setDate(boundary.getDate() - 30);
        matchesDate = invDate >= boundary;
      }

      // Explicit dates override
      if (startDate) {
        const start = new Date(startDate);
        matchesDate = matchesDate && invDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        matchesDate = matchesDate && invDate <= end;
      }

      return matchesSearch && matchesCustomer && matchesStatus && matchesMode && matchesDate;
    });
  }, [invoicesWithPayments, search, customerFilter, statusFilter, modeFilter, datePreset, startDate, endDate]);

  // Open record payment modal with preset invoice ID
  const openRecordModalWithInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    const inv = invoicesWithPayments.find(i => i.id === invoiceId);
    if (inv) {
      setAmountPaid(inv.balance);
      setFormSearchQuery(`${inv.invoiceNumber} - ${inv.customerName}`);
    }
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMode('UPI');
    setTransactionRef('');
    setNotes('');
    setShowRecordModal(true);
  };

  // Submit recorded payment
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      alert('Please select an outstanding invoice first.');
      return;
    }
    if (amountPaid === '' || Number(amountPaid) <= 0) {
      alert('Please enter a valid amount paid (greater than zero).');
      return;
    }

    const matchedInvoice = invoicesWithPayments.find(inv => inv.id === selectedInvoiceId);
    if (!matchedInvoice) return;

    const payload: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: selectedInvoiceId,
      invoiceNumber: matchedInvoice.invoiceNumber,
      customerName: matchedInvoice.customerName,
      paymentDate,
      amountPaid: Number(amountPaid),
      paymentMode,
      transactionRef: transactionRef.trim() || 'N/A',
      notes: notes.trim() || 'Cleared from ledger panel.'
    };

    onRecordPayment(payload);

    // Reset Form & Close
    setSelectedInvoiceId('');
    setFormSearchQuery('');
    setAmountPaid('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMode('UPI');
    setTransactionRef('');
    setNotes('');
    setShowRecordModal(false);
  };

  // Simulated reminders trigger
  const triggerOverdueReminders = () => {
    setRemindersSent(true);
    setTimeout(() => {
      setRemindersSent(false);
    }, 5000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="payments-saas-dashboard-wrapper">
      
      {/* ----------------- PAGE COMPLIANCE HEADER ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight" id="payments-view-title">
            Payments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time collection balances, view granular settlement logs, and manage payment milestones.
          </p>
        </div>
        
        <button 
          type="button"
          id="record-payment-main-btn"
          onClick={() => {
            setSelectedInvoiceId('');
            setFormSearchQuery('');
            setAmountPaid('');
            setPaymentMode('UPI');
            setTransactionRef('');
            setNotes('');
            setShowRecordModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* ----------------- RED ALERT OVERDUE BANNER ----------------- */}
      <div className="transition-all duration-300">
        {remindersSent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4 shadow-xs" id="reminders-sent-toast">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-emerald-900">Overdue Reminders Dispatched!</h4>
                <p className="text-[10.5px] text-emerald-650">
                  Fully formatted professional GST e-way reminder letters have been sent to {overdueInvoicesCount} customers via registered Email and SMS.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setRemindersSent(false)}
              className="text-emerald-400 hover:text-emerald-700 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs" id="overdue-reminders-banner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center shrink-0 animate-pulse">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-rose-900">{overdueInvoicesCount} invoices are overdue!</h4>
                <p className="text-[10.5px] text-rose-650">
                  Outstanding arrears accumulated amount: <strong className="font-bold text-rose-800">{formatCurrency(overdueInvoicesSum)}</strong>. Dispatch instant payment alerts.
                </p>
              </div>
            </div>
            
            <button
              type="button"
              id="send-reminders-banner-btn"
              onClick={triggerOverdueReminders}
              className="px-4.5 py-2 hover:bg-rose-100 bg-white border border-rose-200 text-rose-700 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
            >
              Send Reminders
            </button>
          </div>
        )}
      </div>

      {/* ----------------- SUMMARY CARDS (4 IN A ROW) ----------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="payments-metric-deck">
        
        {/* Metric 1: Total Collected (Green) */}
        <div 
          onClick={() => setStatusFilter('Paid')}
          className={`bg-emerald-50/50 hover:bg-emerald-55/75 border border-emerald-200/60 p-4.5 rounded-xl space-y-1.5 transition-all shadow-2xs cursor-pointer group relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider uppercase font-black text-emerald-700/80">Total Collected</span>
            <div className="p-1.5 bg-emerald-100/50 rounded-lg text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-emerald-850 font-mono tracking-tight">
              {formatCurrency(metrics.collected)}
            </div>
            <p className="text-[10px] text-emerald-600/90 font-medium">Reconciled in bank registry</p>
          </div>
        </div>

        {/* Metric 2: Pending (Yellow) */}
        <div 
          onClick={() => setStatusFilter('Unpaid')}
          className={`bg-amber-50/40 hover:bg-amber-50/60 border border-amber-200/60 p-4.5 rounded-xl space-y-1.5 transition-all shadow-2xs cursor-pointer group relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider uppercase font-black text-amber-700/80">Pending Amount</span>
            <div className="p-1.5 bg-amber-100/50 rounded-lg text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-amber-850 font-mono tracking-tight">
              {formatCurrency(metrics.pending)}
            </div>
            <p className="text-[10px] text-amber-600/90 font-medium">In active billing cycle</p>
          </div>
        </div>

        {/* Metric 3: Overdue (Red) */}
        <div 
          onClick={() => setStatusFilter('Overdue')}
          className={`bg-rose-50/40 hover:bg-rose-50/60 border border-rose-200/60 p-4.5 rounded-xl space-y-1.5 transition-all shadow-2xs cursor-pointer group relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider uppercase font-black text-rose-700/80">Overdue Arrears</span>
            <div className="p-1.5 bg-rose-100/55 rounded-lg text-rose-600">
              <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-rose-850 font-mono tracking-tight">
              {formatCurrency(metrics.overdue)}
            </div>
            <p className="text-[10px] text-rose-600/90 font-medium">Critical attention needed</p>
          </div>
        </div>

        {/* Metric 4: Partial (Blue) */}
        <div 
          onClick={() => setStatusFilter('Partial')}
          className={`bg-blue-50/40 hover:bg-blue-50/60 border border-blue-200/60 p-4.5 rounded-xl space-y-1.5 transition-all shadow-2xs cursor-pointer group relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider uppercase font-black text-blue-700/80">Partially Paid</span>
            <div className="p-1.5 bg-blue-100/55 rounded-lg text-blue-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-blue-850 font-mono tracking-tight">
              {formatCurrency(metrics.partial)}
            </div>
            <p className="text-[10px] text-blue-600/90 font-medium font-sans">Divided milestones cleared</p>
          </div>
        </div>

      </div>

      {/* ----------------- INTERACTIVE COMPREHENSIVE FILTER BAR ----------------- */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-2xs" id="payments-filter-dock">
        
        {/* First Row: Search Query & Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Quick Realtime Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              id="payment-ledger-search"
              type="text"
              placeholder="Search Invoice # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 focus:border-slate-350 bg-slate-50/40 rounded-lg text-xs font-semibold focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-405 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Customer filter list */}
          <div className="md:col-span-1">
            <select
              id="payment-customer-filter"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 bg-white text-xs font-bold rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">All Customers</option>
              {uniqueCustomers.map(cust => (
                <option key={cust} value={cust}>{cust}</option>
              ))}
            </select>
          </div>

          {/* Status filter list */}
          <div className="md:col-span-1">
            <select
              id="payment-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 bg-white text-xs font-bold rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Paid in full</option>
              <option value="Partial">Partial payment</option>
              <option value="Overdue">Overdue</option>
              <option value="Unpaid">Unpaid / Unsettled</option>
            </select>
          </div>

          {/* Payment Mode filter list */}
          <div className="md:col-span-1">
            <select
              id="payment-mode-filter"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 bg-white text-xs font-bold rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">All Payment Modes</option>
              <option value="UPI">UPI</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Card">Card</option>
            </select>
          </div>

        </div>

        {/* Second Row: Date range toggler & clear active filters strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-100">
          
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Range Presets Toggle buttons panel */}
            <div className="flex items-center gap-1 bg-slate-105 p-1 rounded-lg border border-slate-200/50">
              <button
                type="button"
                onClick={() => { setDatePreset('all'); setStartDate(''); setEndDate(''); }}
                className={`px-3 py-1 rounded text-[10.5px] font-bold transition-all ${
                  datePreset === 'all' ? 'bg-white text-blue-650 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => { setDatePreset('this-month'); setStartDate(''); setEndDate(''); }}
                className={`px-3 py-1 rounded text-[10.5px] font-bold transition-all ${
                  datePreset === 'this-month' ? 'bg-white text-blue-650 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => { setDatePreset('last-30'); setStartDate(''); setEndDate(''); }}
                className={`px-3 py-1 rounded text-[10.5px] font-bold transition-all ${
                  datePreset === 'last-30' ? 'bg-white text-blue-650 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Last 30 Days
              </button>
            </div>

            {/* Structured manual range inputs */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setDatePreset('custom'); }}
                className="px-2 py-1 border border-slate-200 bg-slate-50/50 rounded-md text-[11px] focus:outline-none"
              />
              <span>to</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setDatePreset('custom'); }}
                className="px-2 py-1 border border-slate-200 bg-slate-50/50 rounded-md text-[11px] focus:outline-none"
              />
            </div>

          </div>

          {/* Reset Action */}
          {(search || customerFilter !== 'all' || statusFilter !== 'all' || modeFilter !== 'all' || datePreset !== 'all' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setCustomerFilter('all');
                setStatusFilter('all');
                setModeFilter('all');
                setDatePreset('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-[10.5px] text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1 transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Clear Filter Presets</span>
            </button>
          )}

        </div>

      </div>

      {/* ----------------- PAYMENT TRACKING MASTER TABLE ----------------- */}
      {filteredRows.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-16 text-center space-y-4 shadow-sm" id="payments-empty-state">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Coins className="w-8 h-8 text-slate-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-850">No payments match your active filters</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              Try adjusting your search query, choosing a different customer profile, or changing payment statuses.
            </p>
          </div>
          <button
            onClick={() => {
              setSearch('');
              setCustomerFilter('all');
              setStatusFilter('all');
              setModeFilter('all');
              setDatePreset('all');
            }}
            className="px-4 py-2 border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all"
          >
            Show All Ledgers
          </button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs" id="desktop-payment-ledger">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] uppercase font-black tracking-wider text-slate-500">
                    <th className="py-3.5 px-4.5 text-center w-10">Details</th>
                    <th className="py-3.5 px-2">Date</th>
                    <th className="py-3.5 px-3">Invoice #</th>
                    <th className="py-3.5 px-3">Customer</th>
                    <th className="py-3.5 px-3 text-right">Invoice Amount</th>
                    <th className="py-3.5 px-3 text-right">Paid Amount</th>
                    <th className="py-3.5 px-3 text-right">Balance</th>
                    <th className="py-3.5 px-3 text-center w-36">Mode</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 px-4.5 text-right w-36">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans">
                  {filteredRows.map((row) => {
                    const isExpanded = expandedInvoiceId === row.id;
                    const hasPayments = row.paymentsTimeline.length > 0;
                    
                    return (
                      <React.Fragment key={row.id}>
                        <tr className={`hover:bg-slate-50/40 transition-colors ${isExpanded ? 'bg-blue-50/15' : ''}`}>
                          
                          {/* Chevron Toggle For Nested Histories */}
                          <td className="py-4 px-4.5 text-center">
                            <button
                              onClick={() => setExpandedInvoiceId(isExpanded ? null : row.id)}
                              className={`p-1 hover:bg-slate-100 rounded transition-all cursor-pointer ${hasPayments ? 'text-blue-600' : 'text-slate-350 hover:text-slate-500'}`}
                              title={hasPayments ? 'View individual payment settlement history' : 'No payments tracked yet'}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>

                          {/* Invoice Date */}
                          <td className="py-4 px-2 text-slate-550 font-semibold">
                            {formatDate(row.invoiceDate)}
                          </td>

                          {/* Invoice Number */}
                          <td className="py-4 px-3 font-bold text-blue-700 font-mono">
                            {row.invoiceNumber}
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-3 font-bold text-slate-900 max-w-[140px] truncate" title={row.customerName}>
                            {row.customerName}
                          </td>

                          {/* Grand Total */}
                          <td className="py-4 px-3 text-right font-mono font-bold text-slate-550">
                            {formatCurrency(row.grandTotal)}
                          </td>

                          {/* Cleared Paid Amount */}
                          <td className="py-4 px-3 text-right font-mono font-bold text-emerald-600">
                            {formatCurrency(row.totalPaid)}
                          </td>

                          {/* Outstanding Balance */}
                          <td className="py-4 px-3 text-right">
                            {row.balance > 0 ? (
                              <span className="font-mono font-black text-rose-650 block">
                                {formatCurrency(row.balance)}
                              </span>
                            ) : (
                              <span className="text-[10.5px] font-black text-emerald-600 font-mono block">
                                ₹0
                              </span>
                            )}
                          </td>

                          {/* Dynamic Payment Modes Icons */}
                          <td className="py-4 px-3">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {row.modesList.length === 0 ? (
                                <span className="text-[10px] text-slate-400 font-bold tracking-wider">—</span>
                              ) : (
                                row.modesList.map((mode, mid) => (
                                  <span 
                                    key={mid}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-semibold border ${getModeColor(mode)}`}
                                    title={mode}
                                  >
                                    {getModeIcon(mode)}
                                    <span className="capitalize text-[8.5px]">{mode.split(' ')[0]}</span>
                                  </span>
                                ))
                              )}
                            </div>
                          </td>

                          {/* Reconciled Payments Status badging */}
                          <td className="py-4 px-3 text-center">
                            {row.computedStatus === 'Paid' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Paid</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                <span>Partial</span>
                              </span>
                            )}
                          </td>

                          {/* Dynamic smart actions */}
                          <td className="py-4 px-4.5 text-right">
                            {row.balance > 0 ? (
                              <button
                                type="button"
                                onClick={() => openRecordModalWithInvoice(row.id)}
                                className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-extrabold px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer shadow-3xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Record Payment</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-450 font-bold flex items-center justify-end gap-1 select-none">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Fully Cleared</span>
                              </span>
                            )}
                          </td>

                        </tr>

                        {/* EXPANDABLE ROW CONTENT: granular history timeline per invoice */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={10} className="bg-slate-50/50 p-4.5 border-t border-b border-slate-150">
                              <div className="max-w-2xl mx-auto space-y-3" id={`expanded-timeline-${row.id}`}>
                                <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Payment History Timeline — {row.invoiceNumber}</span>
                                </h5>

                                {row.paymentsTimeline.length === 0 ? (
                                  <div className="bg-white border border-slate-200 rounded-lg p-4 text-center text-xs text-slate-400 font-medium">
                                    No payment clearances have been registered on this invoice ledger.
                                  </div>
                                ) : (
                                  <div className="space-y-4 pl-3.5 relative border-l border-slate-200">
                                    {row.paymentsTimeline.map((pay, pIdx) => (
                                      <div key={pay.id} className="relative space-y-1">
                                        {/* Timeline Dotted Pin */}
                                        <div className="absolute -left-[20.5px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-2xs">
                                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                        </div>

                                        {/* Details box */}
                                        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 shadow-3xs">
                                          <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                                            
                                            <div className="flex items-center gap-2">
                                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${getModeColor(pay.paymentMode)}`}>
                                                {getModeIcon(pay.paymentMode)}
                                                <span>{pay.paymentMode}</span>
                                              </span>
                                              <span className="font-mono text-[10.5px] text-slate-450 uppercase" title="Transaction Reference Code">
                                                Ref: {pay.transactionRef || 'N/A'}
                                              </span>
                                            </div>

                                            <div className="font-mono font-bold text-slate-900 text-[12.5px]">
                                              {formatCurrency(pay.amountPaid)}
                                            </div>

                                          </div>

                                          {pay.notes && (
                                            <p className="text-[11px] text-slate-400 italic">
                                              &ldquo;{pay.notes}&rdquo;
                                            </p>
                                          )}

                                          <div className="text-[9.5px] text-slate-400 font-bold flex items-center gap-1 pt-0.5">
                                            <Calendar className="w-3 h-3 text-slate-355" />
                                            <span>Cleared {formatDate(pay.paymentDate)}</span>
                                          </div>
                                        </div>

                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="md:hidden space-y-4" id="mobile-payment-ledger">
            {filteredRows.map((row) => {
              const isExpanded = expandedInvoiceId === row.id;
              const hasPayments = row.paymentsTimeline.length > 0;

              return (
                <div 
                  key={row.id}
                  id={`mobile-invoice-row-${row.id}`}
                  className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3 shadow-2xs relative"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {row.invoiceNumber}
                      </span>
                      <h3 className="font-bold text-slate-850 leading-tight text-sm">
                        {row.customerName}
                      </h3>
                      <p className="text-[10.5px] text-slate-400 font-medium">
                        Due Date: {formatDate(row.dueDate)}
                      </p>
                    </div>

                    <div>
                      {row.computedStatus === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9.5px] font-black uppercase">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[9.5px] font-black uppercase">
                          Partial
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial details Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-[11px] leading-tight">
                    <div className="space-y-1">
                      <span className="text-[8.5px] uppercase font-bold text-slate-400 block tracking-wider">
                        Invoice
                      </span>
                      <span className="font-mono font-bold text-slate-650 block">
                        {formatCurrency(row.grandTotal)}
                      </span>
                    </div>

                    <div className="space-y-1 border-l border-slate-200/60 pl-2">
                      <span className="text-[8.5px] uppercase font-bold text-slate-400 block tracking-wider">
                        Paid So Far
                      </span>
                      <span className="font-mono font-bold text-emerald-600 block">
                        {formatCurrency(row.totalPaid)}
                      </span>
                    </div>

                    <div className="space-y-1 border-l border-slate-200/60 pl-2">
                      <span className="text-[8.5px] uppercase font-bold text-slate-400 block tracking-wider">
                        Balance Left
                      </span>
                      <span className={`font-mono font-black block ${row.balance > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                        {formatCurrency(row.balance)}
                      </span>
                    </div>
                  </div>

                  {/* Payment modes row lists */}
                  {row.modesList.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9.5px] font-bold text-slate-450 uppercase">Cleared via:</span>
                      {row.modesList.map((mode, mIdx) => (
                        <span 
                          key={mIdx}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] font-bold"
                        >
                          {getModeIcon(mode)}
                          <span>{mode}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Divider line */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    
                    {/* Expand payment history */}
                    <button
                      onClick={() => setExpandedInvoiceId(isExpanded ? null : row.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{hasPayments ? `Payments Log (${row.paymentsTimeline.length})` : 'No payments yet'}</span>
                    </button>

                    <div>
                      {row.balance > 0 ? (
                        <button
                          type="button"
                          onClick={() => openRecordModalWithInvoice(row.id)}
                          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Record Payment</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 pr-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Fully Cleared</span>
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Nested Timeline for Mobile Card */}
                  {isExpanded && (
                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg space-y-3 mt-2 animate-fade-in">
                      <h4 className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-450">Individual Settlements Timeline:</h4>
                      {row.paymentsTimeline.length === 0 ? (
                        <p className="text-[10.5px] text-slate-400">No payment clearances found.</p>
                      ) : (
                        <div className="space-y-3 pl-2.5 border-l border-slate-300">
                          {row.paymentsTimeline.map((pay) => (
                            <div key={pay.id} className="relative space-y-1">
                              <div className="absolute -left-[14.5px] top-1 w-2 h-2 rounded-full bg-blue-600"></div>
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-750 block leading-tight">{pay.paymentMode}</span>
                                  <span className="text-[9.5px] text-slate-405 block">Ref: {pay.transactionRef || 'N/A'}</span>
                                  {pay.notes && <p className="text-[10px] italic text-slate-450 block font-sans mt-0.5">"{pay.notes}"</p>}
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[11.5px] font-black text-slate-900 font-mono">{formatCurrency(pay.amountPaid)}</span>
                                  <span className="text-[9.5px] text-slate-400 block">{formatDate(pay.paymentDate)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ----------------- RECORD PAYMENT INSTANT SHEET MODAL ----------------- */}
      {showRecordModal && (
        <div 
          className="fixed inset-0 z-50 overflow-hidden" 
          aria-labelledby="record-payment-title" 
          role="dialog" 
          aria-modal="true" 
          id="record-payment-backdrop-root"
        >
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Modal transparent dark background overlay */}
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xs transition-opacity" 
              onClick={() => { setShowRecordModal(false); setFormDropdownOpen(false); }}
            ></div>
            
            {/* Slide up responsive panel */}
            <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto flex max-w-full pointer-events-none md:pl-10">
              <div 
                className="w-full md:max-w-md pointer-events-auto bg-white rounded-t-2xl md:rounded-t-none md:rounded-l-2xl shadow-2xl flex flex-col h-[95vh] md:h-full transform transition duration-200" 
                id="record-payment-sheet-body"
              >
                
                {/* Panel header bar */}
                <div className="px-6 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide" id="record-payment-title">
                      Log Bill Payment
                    </h2>
                    <p className="text-[10px] text-slate-450 font-medium mt-0.5">
                      Record client financial clearances inside your ledger.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => { setShowRecordModal(false); setFormDropdownOpen(false); }}
                    className="text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form interactive container content */}
                <form 
                  id="record-financial-clearance" 
                  onSubmit={handleRecordPaymentSubmit} 
                  className="flex-1 overflow-y-auto p-6 space-y-4"
                >
                  
                  {/* Select Invoice block (dropdown with search) */}
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-slate-600 block">Select Outstanding Invoice *</label>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                      <input 
                        type="text"
                        placeholder="Search by invoice number or client..."
                        value={formSearchQuery}
                        onChange={(e) => {
                          setFormSearchQuery(e.target.value);
                          setFormDropdownOpen(true);
                        }}
                        onFocus={() => setFormDropdownOpen(true)}
                        className="w-full pl-9 pr-8 py-2 border border-slate-205 focus:border-slate-350 bg-white rounded-lg text-xs font-semibold focus:outline-none"
                      />
                      {formSearchQuery && (
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedInvoiceId('');
                            setFormSearchQuery('');
                            setAmountPaid('');
                            setFormDropdownOpen(true);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Searched autocompletion drop-down widget */}
                    {formDropdownOpen && (
                      <div className="absolute z-60 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-105">
                        {formFilteredInvoices.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 text-xs">
                            No unsettled invoices found matching '{formSearchQuery}'
                          </div>
                        ) : (
                          formFilteredInvoices.map((inv) => (
                            <button
                              key={inv.id}
                              type="button"
                              onClick={() => {
                                setSelectedInvoiceId(inv.id);
                                setAmountPaid(inv.balance);
                                setFormSearchQuery(`${inv.invoiceNumber} - ${inv.customerName}`);
                                setFormDropdownOpen(false);
                              }}
                              className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex flex-col gap-0.5 shrink-0"
                            >
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-blue-700 font-mono">{inv.invoiceNumber}</span>
                                <span className="text-rose-650 font-mono">{formatCurrency(inv.balance)} outstanding</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-semibold flex justify-between">
                                <span>{inv.customerName}</span>
                                <span>Total: {formatCurrency(inv.grandTotal)}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected invoice context feedback badge */}
                  {selectedInvoiceRecord && (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5 text-[11px] text-emerald-800 leading-normal">
                      Outstanding invoice <strong className="font-bold">{selectedInvoiceRecord.invoiceNumber}</strong> for client <strong className="font-bold">{selectedInvoiceRecord.customerName}</strong> has been selected. Unpaid balance is <strong>{formatCurrency(selectedInvoiceRecord.balance)}</strong>.
                    </div>
                  )}

                  {/* Paid Amount clearance entry */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Payment Amount (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-405">
                        ₹
                      </span>
                      <input 
                        type="number"
                        placeholder="0.00"
                        step="1"
                        value={amountPaid === '' ? '' : amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 border border-slate-205 focus:border-slate-350 bg-white rounded-lg text-xs font-bold focus:outline-none"
                        required
                      />
                    </div>
                    {selectedInvoiceRecord && amountPaid !== '' && Number(amountPaid) > selectedInvoiceRecord.balance && (
                      <p className="text-[10.5px] text-amber-600 font-bold leading-tight pt-1">
                        ⚠ Clear warning: The specified paid amount is larger than the invoice's remaining balance of {formatCurrency(selectedInvoiceRecord.balance)}.
                      </p>
                    )}
                  </div>

                  {/* Payment date clearance entry */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Payment Date *</label>
                    <input 
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 focus:border-slate-350 bg-white rounded-lg text-xs font-semibold focus:outline-none"
                      required
                    />
                  </div>

                  {/* Payment Mode (icon buttons deck) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Payment Mode *</label>
                    <div className="grid grid-cols-5 gap-1" id="payment-mode-icon-buttons">
                      
                      {/* Button: UPI */}
                      <button
                        type="button"
                        onClick={() => setPaymentMode('UPI')}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                          paymentMode === 'UPI' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-black shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-500 font-semibold hover:border-slate-300'
                        }`}
                      >
                        <QrCode className="w-4 h-4 shrink-0" />
                        <span className="text-[9.5px]">UPI</span>
                      </button>

                      {/* Button: Bank Transfer */}
                      <button
                        type="button"
                        onClick={() => setPaymentMode('Bank Transfer')}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                          paymentMode === 'Bank Transfer' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-black shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-500 font-semibold hover:border-slate-300'
                        }`}
                      >
                        <Landmark className="w-4 h-4 shrink-0" />
                        <span className="text-[9.5px] leading-tight">Bank</span>
                      </button>

                      {/* Button: Cash */}
                      <button
                        type="button"
                        onClick={() => setPaymentMode('Cash')}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                          paymentMode === 'Cash' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-black shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-500 font-semibold hover:border-slate-300'
                        }`}
                      >
                        <Coins className="w-4 h-4 shrink-0" />
                        <span className="text-[9.5px]">Cash</span>
                      </button>

                      {/* Button: Cheque */}
                      <button
                        type="button"
                        onClick={() => setPaymentMode('Cheque')}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                          paymentMode === 'Cheque' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-black shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-500 font-semibold hover:border-slate-300'
                        }`}
                      >
                        <Receipt className="w-4 h-4 shrink-0" />
                        <span className="text-[9.5px]">Cheque</span>
                      </button>

                      {/* Button: Card */}
                      <button
                        type="button"
                        onClick={() => setPaymentMode('Card')}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                          paymentMode === 'Card' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-black shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-500 font-semibold hover:border-slate-300'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 shrink-0" />
                        <span className="text-[9.5px]">Card</span>
                      </button>

                    </div>
                  </div>

                  {/* Transaction reference code clearance */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Reference / Transaction ID (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g. UPI883392911 or CHQ-002341"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 focus:border-slate-350 bg-white rounded-lg text-xs font-mono uppercase focus:outline-none"
                    />
                  </div>

                  {/* Settlement metadata Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Notes (Optional)</label>
                    <textarea 
                      rows={2}
                      placeholder="Clearance context e.g. received first installment cheque..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 focus:border-slate-350 bg-white rounded-lg text-xs focus:outline-none"
                    />
                  </div>

                </form>

                {/* Form fixed sticky footer button */}
                <div className="px-6 py-4 border-t border-slate-150 bg-slate-50 flex items-center justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => { setShowRecordModal(false); setFormDropdownOpen(false); }}
                    className="px-4.5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    form="record-financial-clearance"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer select-none"
                  >
                    Save Payment
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
