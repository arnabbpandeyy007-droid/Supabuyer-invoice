import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Plus, 
  Users, 
  FileText, 
  Wallet, 
  AlertTriangle, 
  CheckCircle,
  Download,
  Clock,
  ExternalLink,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { Invoice, Customer } from '../types';

interface DashboardViewProps {
  invoices: Invoice[];
  customers: Customer[];
  setCurrentTab: (tab: string) => void;
  setSelectedInvoiceId: (id: string | null) => void;
  paymentsCount: number;
}

export default function DashboardView({ 
  invoices, 
  customers, 
  setCurrentTab, 
  setSelectedInvoiceId,
  paymentsCount
}: DashboardViewProps) {

  // Format currency helper in Indian style (₹)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 6 months historical trend dataset for the Revenue Overview Area/Line chart
  const revenueTrendData = [
    { month: 'Jan', revenue: 110000 },
    { month: 'Feb', revenue: 155000 },
    { month: 'Mar', revenue: 185000 },
    { month: 'Apr', revenue: 210000 },
    { month: 'May', revenue: 232000 },
    { month: 'Jun', revenue: 245800 }, // Exactly matches the total revenue metric
  ];

  // Quick report simulated download
  const handleDownloadCSVReport = () => {
    const reportColumns = "Invoice #,Customer,Date,Amount (INR),GST,Status\n";
    const reportRows = invoices.map(i => 
      `${i.invoiceNumber},"${i.customerName}",${i.invoiceDate},${i.grandTotal},${i.totalTax},${i.status}`
    ).join("\n");
    const blob = new Blob([reportColumns + reportRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `SupaBuyer_MSTR_GST_Report_2026.csv`);
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12" id="unified-dashboard-container">
      
      {/* Dynamic top title banner with stats summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Financial Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">SupaBuyer GST portal overview for Rahul Desai. Standard local terms are MH-27.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active GSTIN Registry</p>
          <p className="text-xs font-bold text-[#2563EB] font-mono">27ABCDE1234F1Z5</p>
        </div>
      </div>

      {/* 1. MAIN CONTENT — 4 METRIC CARDS (2X2 GRID AS SPECIFIED) */}
      {/* Grid classes are responsive: 'grid-cols-2' stacks 2x2 on mobile viewports as specified, 'lg:grid-cols-4' stretches on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5" id="metric-cards-bento">
        
        {/* Metric 1: Total Revenue — ₹2,45,800 — blue icon, green +12% trend */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/40 rounded-bl-full -z-10" />
          <div className="flex justify-between items-start mb-2.5">
            <div className="p-2 md:p-2.5 bg-blue-50 text-[#2563EB] rounded-lg">
              <Wallet className="w-5 h-5 shrink-0" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Revenue</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900 mt-1 font-mono">₹2,45,800</h3>
            <p className="text-[9.5px] text-[#16A34A] font-bold mt-1 uppercase tracking-wide">YTD Profit Stream</p>
          </div>
        </div>

        {/* Metric 2: Total Invoices — 148 — document icon */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50/40 rounded-bl-full -z-10" />
          <div className="flex justify-between items-start mb-2.5">
            <div className="p-2 md:p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Commercial
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Invoices</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900 mt-1 font-mono">148</h3>
            <p className="text-[9.5px] text-slate-500 font-medium mt-1">Generated YTD</p>
          </div>
        </div>

        {/* Metric 3: Paid Invoices — 112 — green check icon */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50/40 rounded-bl-full -z-10" />
          <div className="flex justify-between items-start mb-2.5">
            <div className="p-2 md:p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              75.6% Rate
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Paid Invoices</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-950 mt-1 font-mono-bold">112</h3>
            <p className="text-[9.5px] text-emerald-600 font-bold mt-1 uppercase tracking-wide">Fully Settled</p>
          </div>
        </div>

        {/* Metric 4: Overdue — 8 — red alert icon, red text */}
        <div className="bg-white border border-red-150 rounded-xl p-4 md:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50/40 rounded-bl-full -z-10" />
          <div className="flex justify-between items-start mb-2.5">
            <div className="p-2 md:p-2.5 bg-rose-50 text-red-650 rounded-lg">
              <AlertTriangle className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[9px] font-bold text-red-700 bg-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              Attention Required
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overdue</p>
            {/* Displaying exactly: '8 — red alert icon, red text' as specified */}
            <h3 className="text-lg md:text-2xl font-black text-red-600 mt-1 font-mono">8</h3>
            <p className="text-[9.5px] text-red-550 font-semibold mt-1">Outstanding collections</p>
          </div>
        </div>

      </div>

      {/* 2. QUICK ACTIONS ROW (OUTLINED BLUE BUTTONS AS SPECIFIED) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-sm">
        <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
          <span>Quick Actions Deck</span>
        </h4>
        <div className="grid grid-cols-1 md:flex items-center gap-3">
          
          {/* + New Invoice */}
          <button 
            type="button"
            onClick={() => setCurrentTab('create-invoice')}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-[#2563EB] hover:text-white bg-transparent hover:bg-[#2563EB] border border-[#2563EB] rounded-lg transition-all cursor-pointer shadow-sm focus:outline-none"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ New Invoice</span>
          </button>

          {/* + Add Customer */}
          <button 
            type="button"
            onClick={() => setCurrentTab('clients')}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-[#2563EB] hover:text-white bg-transparent hover:bg-[#2563EB] border border-[#2563EB] rounded-lg transition-all cursor-pointer shadow-sm focus:outline-none"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>+ Add Customer</span>
          </button>

          {/* Download Report */}
          <button 
            type="button"
            onClick={handleDownloadCSVReport}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-[#2563EB] hover:text-white bg-transparent hover:bg-[#2563EB] border border-[#2563EB] rounded-lg transition-all cursor-pointer shadow-sm focus:outline-none"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Download Report</span>
          </button>

        </div>
      </div>

      {/* 3. CHARTS / ANALYTICS GRID: Left 60% Revenue + Right 40% Recent Invoices */}
      {/* Responsive layout: Charts full width on mobile viewports as specified. Stacks perfectly */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-8 items-start">
        
        {/* Left 60%: "Revenue Overview" line/area chart (6 months, blue line, light blue fill area, ₹ axis) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Revenue Overview</h2>
              <p className="text-[11px] text-slate-400">Monthly gross sales statement trend (YTD)</p>
            </div>
            <span className="text-[10px] bg-slate-100 font-extrabold px-2.5 py-1 rounded text-slate-600">Last 6 Months</span>
          </div>

          {/* Area/Line representation using Recharts */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
                <defs>
                  {/* Definition for the elegant light blue fill area */}
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                {/* Months axis */}
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                {/* ₹ axis as specified */}
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2 px-3 rounded-lg shadow-xl text-xs font-bold font-mono">
                          {formatCurrency(payload[0].value as number)}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Blue line & light blue area fill precisely mapping requirements */}
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563EB" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 40%: "Recent Invoices" list (5 rows: customer name, invoice #, amount, status badge) */}
        {/* Responsive layout: stack nicely and become full-width on mobile */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl shadow-sm flex flex-col justify-between">
          
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Recent Invoices</h2>
              <p className="text-[10px] text-slate-400">Newly processed commercial orders</p>
            </div>
            <button 
              type="button"
              onClick={() => setCurrentTab('invoices')}
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-0.5"
            >
              <span>All bills</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List of 5 Rows precisely mapping the design (customer name, invoice #, amount, status badge) */}
          <div className="divide-y divide-slate-100">
            
            {/* Row 1 */}
            <div 
              onClick={() => setCurrentTab('invoices')}
              className="p-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Rajesh Kumar (TechNova)</p>
                <p className="text-[10px] text-[#2563EB] font-mono font-bold mt-0.5">INV-2024-149</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-bold text-slate-900 font-mono">₹28,555.50</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 uppercase">
                  Unpaid
                </span>
              </div>
            </div>

            {/* Row 2 */}
            <div 
              onClick={() => setCurrentTab('invoices')}
              className="p-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Priya Sharma (Global Supply)</p>
                <p className="text-[10px] text-[#2563EB] font-mono font-bold mt-0.5">INV-2023-001</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-bold text-slate-900 font-mono">₹48,380.00</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                  Paid
                </span>
              </div>
            </div>

            {/* Row 3 */}
            <div 
              onClick={() => setCurrentTab('invoices')}
              className="p-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Amit Desai (Apex Industries)</p>
                <p className="text-[10px] text-[#2563EB] font-mono font-bold mt-0.5">INV-2023-003</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-bold text-red-600 font-mono">₹85,000.00</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-100 uppercase">
                  Overdue
                </span>
              </div>
            </div>

            {/* Row 4 */}
            <div 
              onClick={() => setCurrentTab('invoices')}
              className="p-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Vikas Patel (Zenith Ent)</p>
                <p className="text-[10px] text-[#2563EB] font-mono font-bold mt-0.5">INV-2023-004</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-bold text-slate-600 font-mono">₹32,500.00</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-705 border border-slate-200 uppercase">
                  Draft
                </span>
              </div>
            </div>

            {/* Row 5 */}
            <div 
              onClick={() => setCurrentTab('invoices')}
              className="p-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Stark Industries India</p>
                <p className="text-[10px] text-[#2563EB] font-mono font-bold mt-0.5">INV-2024-099</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-bold text-slate-900 font-mono">₹2,50,000.00</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 uppercase">
                  Unpaid
                </span>
              </div>
            </div>

          </div>

          <div className="p-3 bg-slate-50 text-center rounded-b-xl border-t border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400">Showing latest 5 entries from ledger indices</span>
          </div>

        </div>

      </div>

    </div>
  );
}
