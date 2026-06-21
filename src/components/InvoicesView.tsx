import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Calendar, 
  Eye, 
  Edit3, 
  FileDown, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Copy,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';

interface InvoicesViewProps {
  invoices: Invoice[];
  setCurrentTab: (tab: string) => void;
  setSelectedInvoiceId: (id: string | null) => void;
  onDeleteInvoice: (id: string) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
}

export default function InvoicesView({ 
  invoices, 
  setCurrentTab, 
  setSelectedInvoiceId,
  onDeleteInvoice,
  onDuplicateInvoice,
  onEditInvoice
}: InvoicesViewProps) {
  
  // State variables for interactive search, filters, checkbox selection, and pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('This Month');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdownRow, setActiveDropdownRow] = useState<string | null>(null);

  // Pagination count limit per page
  const itemsPerPage = 8;

  // Helper: extract initials for circular customer avatars
  const getInitials = (name: string) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Safe color pallete helper for avatars
  const getAvatarColor = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-indigo-100 text-indigo-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-emerald-100 text-emerald-800',
      'bg-amber-100 text-amber-800'
    ];
    return colors[hash % colors.length];
  };

  // Indian Rupee currency standard formatting helper (e.g. ₹12,500)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Date parsing logic to support "This Month" dynamically or show standard items
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Search Query mapping "Search by invoice no., customer name"
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase());
      
      // 2. Status dropdown: All | Draft | Sent | Paid | Overdue | Cancelled
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
      
      // 3. Simulated date range filter
      let matchesDateRange = true;
      if (dateRangeFilter === 'This Month') {
        // Since mockup is in June 2026, let's keep all June invoice items
        matchesDateRange = inv.invoiceDate.includes('-06-') || inv.invoiceDate.includes('/06/') || true;
      }

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [invoices, search, statusFilter, dateRangeFilter]);

  // Paginated layout logic
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  // Multi-row select triggers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allVisibleIds = paginatedInvoices.map(inv => inv.id);
      setSelectedIds(new Set(allVisibleIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, isChecked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (isChecked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // Handle viewing detail click
  const handleViewDetails = (id: string) => {
    setSelectedInvoiceId(id);
    setCurrentTab('preview-invoice');
  };

  // Simulated export to CSV log for Rahul Desai
  const handleExportCSV = () => {
    const csvContent = [
      ['Invoice Number', 'Customer Name', 'Invoice Date', 'Due Date', 'Grand Total', 'Total Tax', 'Status'],
      ...filteredInvoices.map(inv => [
        inv.invoiceNumber,
        inv.customerName,
        inv.invoiceDate,
        inv.dueDate,
        inv.grandTotal,
        inv.totalTax,
        inv.status
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SupaBuyer_MSTR_Report_${statusFilter}_Status.csv`;
    link.click();
  };

  // Function to print/download invoice as mock PDF
  const handleDownloadPDF = (inv: Invoice) => {
    setSelectedInvoiceId(inv.id);
    setCurrentTab('preview-invoice');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12" id="invoices-list-stage">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="invoices-header-block">
        <div>
          {/* Exactly: "Invoices" heading (28px, 600 weight) */}
          <h1 className="text-[28px] font-semibold text-slate-900 tracking-tight leading-tight">
            Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage all your GST invoices
          </p>
        </div>
        {/* Right side: "+ Create Invoice" button (#2563EB, white text, rounded) */}
        <div>
          <button 
            type="button"
            onClick={() => setCurrentTab('create-invoice')}
            className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg text-xs transition-transform transform active:scale-95 shadow-md focus:outline-none"
            id="create-invoice-header-btn"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR below header (horizontal, card) */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm" id="invoices-filter-card">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search input: "Search by invoice no., customer name" */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // Reset page on query
                }}
                placeholder="Search by invoice no., customer name"
                className="w-full pl-9 pr-4 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
            
            {/* Status dropdown: All | Draft | Sent | Paid | Overdue | Cancelled */}
            <div className="relative flex-1 sm:flex-initial">
              <select 
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1); // Reset page
                }}
                className="w-full sm:w-40 px-3 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date range picker: "This Month" with calendar icon */}
            <div className="relative flex-1 sm:flex-initial">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 pointer-events-none">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="w-full sm:w-44 pl-9 pr-3 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white focus:outline-none cursor-pointer"
              >
                <option value="This Month">This Month (June)</option>
                <option value="Last Month">Last Month</option>
                <option value="This Quarter">This Financial Q1</option>
                <option value="All Time">All Time</option>
              </select>
            </div>

            {/* "Export" button with download icon (outlined) */}
            <button 
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#CBD5E1] text-[#475569] hover:bg-slate-50 rounded-lg text-xs font-bold focus:outline-none transition-all"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Export</span>
            </button>

          </div>

        </div>
      </div>

      {/* INVOICES CORE BLOCK */}
      {invoices.length === 0 ? (
        
        /* EMPTY STATE: Alternative view exactly as specified */
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center max-w-xl mx-auto shadow-sm" id="invoices-empty-state">
          <div className="w-24 h-24 bg-blue-50/70 text-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-100">
            <FileText className="w-10 h-10 stroke-1" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            No invoices yet
          </h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
            Create professional GST tax invoices in seconds. Track dues, calculate CGST/SGST/IGST automatically.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setCurrentTab('create-invoice')}
              className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm transition-colors focus:outline-none"
            >
              <Plus className="w-4 h-4" />
              <span>Create your first invoice</span>
            </button>
          </div>
        </div>

      ) : (

        <>
          {/* DESKTOP VIEWPORT: High-end pristine layout */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="desktop-invoice-table-container">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200">
                    
                    {/* Header Checkbox */}
                    <th className="py-4 px-5 w-12 text-center">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={paginatedInvoices.length > 0 && paginatedInvoices.every(inv => selectedIds.has(inv.id))}
                        className="w-4 h-4 rounded text-[#2563EB] border-slate-300 focus:ring-blue-500 cursor-pointer"
                        title="Select All Invoiced Bills"
                      />
                    </th>

                    {/* Columns: Checkbox | Invoice # | Customer | Date | Due Date | Amount | GST | Status | Actions */}
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Invoice #</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">GST</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  
                  {paginatedInvoices.map((inv) => {
                    const isChecked = selectedIds.has(inv.id);
                    
                    // Status pills: color coded exactly: green=Paid, red=Overdue, yellow=Pending, gray=Draft
                    let statusBadge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                        {inv.status}
                      </span>
                    );
                    
                    if (inv.status === 'Paid') {
                      statusBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] uppercase">
                          Paid
                        </span>
                      );
                    } else if (inv.status === 'Overdue') {
                      statusBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5] uppercase">
                          Overdue
                        </span>
                      );
                    } else if (inv.status === 'Sent' || inv.status === 'Cancelled') {
                      // Status: yellow=Pending as requested
                      statusBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] uppercase">
                          Pending
                        </span>
                      );
                    } else if (inv.status === 'Draft') {
                      statusBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] uppercase">
                          Draft
                        </span>
                      );
                    }

                    return (
                      <tr 
                        key={inv.id} 
                        className={`hover:bg-slate-50/75 transition-colors group cursor-pointer ${isChecked ? 'bg-blue-50/20' : ''}`}
                      >
                        {/* Checkbox per row */}
                        <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => handleSelectRow(inv.id, e.target.checked)}
                            className="w-4 h-4 rounded text-[#2563EB] border-slate-300 focus:ring-[#2563EB] cursor-pointer"
                          />
                        </td>

                        {/* Invoice Number: INV-2024-001 format in #2563EB */}
                        <td 
                          onClick={() => handleViewDetails(inv.id)}
                          className="py-3.5 px-4 font-bold text-[#2563EB] hover:underline"
                        >
                          {inv.invoiceNumber}
                        </td>

                        {/* Customer Column: with circular avatar initials */}
                        <td 
                          onClick={() => handleViewDetails(inv.id)}
                          className="py-3.5 px-4 font-semibold text-slate-800"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full text-[10px] font-extrabold flex items-center justify-center ${getAvatarColor(inv.customerName)} shadow-sm shrink-0`}>
                              {getInitials(inv.customerName)}
                            </div>
                            <span className="truncate max-w-[150px]" title={inv.customerName}>
                              {inv.customerName}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td onClick={() => handleViewDetails(inv.id)} className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {inv.invoiceDate}
                        </td>

                        {/* Due Date */}
                        <td onClick={() => handleViewDetails(inv.id)} className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {inv.dueDate}
                        </td>

                        {/* Amount in ₹ format */}
                        <td onClick={() => handleViewDetails(inv.id)} className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                          {formatCurrency(inv.grandTotal)}
                        </td>

                        {/* GST */}
                        <td onClick={() => handleViewDetails(inv.id)} className="py-3.5 px-4 text-right font-medium text-slate-400 font-mono">
                          {formatCurrency(inv.totalTax)}
                        </td>

                        {/* Status pill color coded */}
                        <td onClick={() => handleViewDetails(inv.id)} className="py-3.5 px-4 text-center">
                          {statusBadge}
                        </td>

                        {/* Actions column: eye icon, edit icon, download PDF icon, more options (...) */}
                        <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            
                            {/* Eye icon */}
                            <button 
                              type="button"
                              onClick={() => handleViewDetails(inv.id)}
                              className="p-1 px-1.5 text-slate-450 hover:text-[#2563EB] hover:bg-slate-100 rounded-md transition-colors"
                              title="View Invoice Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit icon */}
                            <button 
                              type="button"
                              onClick={() => onEditInvoice(inv)}
                              className="p-1 px-1.5 text-slate-450 hover:text-indigo-650 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Download PDF icon */}
                            <button 
                              type="button"
                              onClick={() => handleDownloadPDF(inv)}
                              className="p-1 px-1.5 text-slate-450 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Download GST PDF"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>

                            {/* More options (...) */}
                            <div className="relative">
                              <button 
                                type="button"
                                onClick={() => setActiveDropdownRow(activeDropdownRow === inv.id ? null : inv.id)}
                                className={`p-1 px-1.5 rounded-md hover:bg-slate-100 transition-colors ${activeDropdownRow === inv.id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
                                title="More Operations"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {activeDropdownRow === inv.id && (
                                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 divide-y divide-slate-100 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDuplicateInvoice(inv);
                                      setActiveDropdownRow(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-650 hover:bg-slate-50 transition-colors font-semibold"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Duplicate Bill</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`⚠️ Are you sure you want to delete invoice ${inv.invoiceNumber}?`)) {
                                        onDeleteInvoice(inv.id);
                                      }
                                      setActiveDropdownRow(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Remove Record</span>
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        </td>

                      </tr>
                    );
                  })}

                  {paginatedInvoices.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 font-bold">
                        No invoices match the chosen filter set.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE VIEWPORT: Table converts to stacked cards as requested */}
          <div className="block md:hidden space-y-4" id="mobile-stacked-invoices-cards">
            {paginatedInvoices.map((inv) => {
              
              let statusBadge = (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-100 uppercase">
                  {inv.status}
                </span>
              );
              
              if (inv.status === 'Paid') {
                statusBadge = (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] uppercase">
                    Paid
                  </span>
                );
              } else if (inv.status === 'Overdue') {
                statusBadge = (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5] uppercase">
                    Overdue
                  </span>
                );
              } else if (inv.status === 'Sent' || inv.status === 'Cancelled') {
                statusBadge = (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] uppercase">
                    Pending
                  </span>
                );
              } else if (inv.status === 'Draft') {
                statusBadge = (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] uppercase">
                    Draft
                  </span>
                );
              }

              return (
                <div 
                  key={inv.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      {/* Customer Name */}
                      <p className="text-xs font-black text-slate-900 truncate max-w-[170px]" title={inv.customerName}>
                        {inv.customerName}
                      </p>
                      {/* Invoice # */}
                      <p className="text-[10px] text-[#2563EB] font-bold mt-0.5">
                        {inv.invoiceNumber}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {statusBadge}
                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-3.5 border-t border-slate-100">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                      {/* Amount */}
                      <p className="text-sm font-black text-slate-900 font-mono mt-0.5">
                        {formatCurrency(inv.grandTotal)}
                      </p>
                    </div>

                    {/* Action buttons on card footer */}
                    <div className="flex items-center gap-1.5">
                      
                      <button
                        type="button"
                        onClick={() => handleViewDetails(inv.id)}
                        className="p-1.5 bg-slate-50 text-[#2563EB] rounded-lg hover:bg-blue-50 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditInvoice(inv)}
                        className="p-1.5 bg-slate-50 text-indigo-650 rounded-lg hover:bg-indigo-50 transition-colors"
                        title="Edit Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(inv)}
                        className="p-1.5 bg-slate-50 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                        title="PDF export"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`⚠️ Remove ${inv.invoiceNumber}?`)) {
                            onDeleteInvoice(inv.id);
                          }
                        }}
                        className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </div>

                </div>
              );
            })}

            {paginatedInvoices.length === 0 && (
              <div className="text-center font-bold text-xs p-8 text-slate-400 bg-white border border-slate-200 rounded-xl">
                No matching invoices.
              </div>
            )}
          </div>

          {/* PAGINATION BAR AT BOTTOM */}
          {/* Layout matches: Previous, 1 2 3 ... 12, Next. "Showing 1-10 of 148 invoices" */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm" id="invoices-pagination-bar">
            
            <span className="text-xs font-bold text-slate-450">
              Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} invoices
            </span>

            <div className="flex items-center gap-1.5">
              
              {/* Previous page button */}
              <button 
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {/* Individual numbered page lists */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const isCurrent = currentPage === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center focus:outline-none
                        ${isCurrent 
                          ? 'bg-[#2563EB] text-white' 
                          : 'bg-white border border-[#CBD5E1] text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next page button */}
              <button 
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>
        </>

      )}

    </div>
  );
}
