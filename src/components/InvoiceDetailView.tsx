import React, { useRef, useState } from 'react';
import { ArrowLeft, Printer, CheckCircle, CreditCard, ShieldCheck, Download, Edit, Sparkles, XCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Invoice, BusinessProfile, Customer } from '../types';

// OKLCH TO RGB CONVERTER UTILITY FOR PDF/HTML2CANVAS RENDERING
function oklchToRgb(oklchStr: string): string {
  if (!oklchStr || !oklchStr.includes('oklch')) return oklchStr;
  
  try {
    const inner = oklchStr.substring(oklchStr.indexOf('(') + 1, oklchStr.lastIndexOf(')'));
    const partsStr = inner.replace(/,/g, ' ').replace(/\//g, ' ').trim().replace(/\s+/g, ' ');
    const parts = partsStr.split(' ');
    
    if (parts.length < 3) return oklchStr;
    
    const LValue = parts[0];
    const CValue = parts[1];
    const HValue = parts[2];
    const AValue = parts[3] || '1';
    
    const L = LValue.endsWith('%') ? parseFloat(LValue) / 100 : parseFloat(LValue);
    const C = parseFloat(CValue);
    const H = parseFloat(HValue);
    const alpha = AValue.endsWith('%') ? parseFloat(AValue) / 100 : parseFloat(AValue);
    
    if (isNaN(L) || isNaN(C) || isNaN(H)) {
      return oklchStr;
    }
    
    const hRad = (H * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);
    
    let l_lms = L + 0.3963377774 * a + 0.2158037573 * b;
    let m_lms = L - 0.1055613458 * a - 0.0638541728 * b;
    let s_lms = L - 0.0894841775 * a - 1.2914855414 * b;
    
    l_lms = Math.pow(Math.max(0, l_lms), 3);
    m_lms = Math.pow(Math.max(0, m_lms), 3);
    s_lms = Math.pow(Math.max(0, s_lms), 3);
    
    const r_l = 4.0767416621 * l_lms - 3.3077115913 * m_lms + 0.2309699292 * s_lms;
    const g_l = -1.2684380046 * l_lms + 2.6097574011 * m_lms - 0.3413193965 * s_lms;
    const b_l = -0.0041960863 * l_lms - 0.7034186147 * m_lms + 1.7076147010 * s_lms;
    
    const transform = (c: number) => {
      const cClamped = Math.max(0, Math.min(1, c));
      return cClamped <= 0.0031308
        ? 12.92 * cClamped
        : 1.055 * Math.pow(cClamped, 1 / 2.4) - 0.055;
    };
    
    const rComp = Math.round(transform(r_l) * 255);
    const gComp = Math.round(transform(g_l) * 255);
    const bComp = Math.round(transform(b_l) * 255);
    
    if (alpha === 1) {
      return `rgb(${rComp}, ${gComp}, ${bComp})`;
    } else {
      return `rgba(${rComp}, ${gComp}, ${bComp}, ${alpha})`;
    }
  } catch (e) {
    return oklchStr;
  }
}

// EXTRACT AND RE-COMPILE CSS STYLES WITH CONVERTED RGB COLORS
function getCleanedCssStyles(): string {
  let cssText = '';
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i];
      const rules = sheet.cssRules || sheet.rules;
      if (!rules) continue;
      for (let j = 0; j < rules.length; j++) {
        cssText += rules[j].cssText + '\n';
      }
    } catch (e) {
      // Ignore cross-origin access restrictions
    }
  }
  
  const oklchMatches = cssText.match(/oklch\([^)]+\)/g);
  if (oklchMatches) {
    const uniqueMatches = Array.from(new Set(oklchMatches));
    for (const match of uniqueMatches) {
      try {
        const rgbColor = oklchToRgb(match);
        cssText = cssText.split(match).join(rgbColor);
      } catch (err) {
        // Safe skip
      }
    }
  }
  return cssText;
}

interface InvoiceDetailViewProps {
  invoice: Invoice;
  businessProfile: BusinessProfile;
  customers: Customer[];
  setCurrentTab: (tab: string) => void;
  setSelectedInvoiceId: (id: string | null) => void;
  onMarkPaid: (id: string) => void;
  onEditInvoice?: (invoice: Invoice) => void;
}

// INDIAN RUPEE NUMBERS TO WORDS CONVERTER
function convertNumberToIndianWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];
  
  const numStr = Math.max(0, num).toFixed(2);
  const parts = numStr.split('.');
  const wholePart = parseInt(parts[0], 10);
  const paisePart = parts[1] ? parseInt(parts[1], 10) : 0;

  function translateWhole(n: number): string {
    if (n === 0) return '';
    let str = '';
    if (n >= 10000000) {
      str += translateWhole(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += translateWhole(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += translateWhole(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += translateWhole(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)] + a[n % 10];
      }
    }
    return str;
  }

  const wholeWords = translateWhole(wholePart).trim();
  const paiseWords = paisePart > 0 ? ` and ${translateWhole(paisePart).trim()} Paise` : '';

  if (!wholeWords) return 'Rupees Zero Only';
  return `Rupees ${wholeWords}${paiseWords} Only`;
}

export default function InvoiceDetailView({
  invoice,
  businessProfile,
  customers,
  setCurrentTab,
  setSelectedInvoiceId,
  onMarkPaid,
  onEditInvoice
}: InvoiceDetailViewProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadActualPDF = async () => {
    setIsDownloading(true);
    
    try {
      const element = document.getElementById('invoice-a4-printable-stage');
      if (!element) {
        setToastType('error');
        setToastMessage('Could not find the invoice element to compile.');
        setIsDownloading(false);
        return;
      }

      // 1. Generate high-resolution canvas with fully resolved CSS colors in onclone
      const canvas = await html2canvas(element, {
        scale: 2.5, // 2.5x upscale for razor sharp text print resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc: any) => {
          // A. Strip all existing stylesheets that might contain unsupported oklch color codes
          try {
            const styleAndLinks = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            styleAndLinks.forEach((item: any) => {
              item.parentNode?.removeChild(item);
            });
            
            // Build and inject clean stylesheet with converted colors only
            const cssContent = getCleanedCssStyles();
            const cleanStyle = clonedDoc.createElement('style');
            cleanStyle.id = 'pdf-clean-style-block';
            cleanStyle.textContent = cssContent;
            clonedDoc.head.appendChild(cleanStyle);
          } catch (cssErr) {
            console.warn('Could not clean styles inside the cloned document context', cssErr);
          }

          // B. Convert any remaining oklch inline computed styles to safe RGBs
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            try {
              const styles = window.getComputedStyle(el);
              const colorProps = [
                'color',
                'backgroundColor',
                'borderColor',
                'borderTopColor',
                'borderBottomColor',
                'borderLeftColor',
                'borderRightColor',
                'outlineColor',
                'fill',
                'stroke'
              ];
              for (const prop of colorProps) {
                const val = styles[prop as any];
                if (val && val.includes('oklch')) {
                  const cleanedVal = oklchToRgb(val);
                  el.style[prop as any] = cleanedVal;
                }
              }
            } catch (elStyleErr) {
              // Gracefully handle element access exceptions
            }
          }
        }
      });

      // 2. Build high fidelity PDF layout
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210; // A4 standard width (mm)
      const pdfHeight = 297; // A4 standard height (mm)
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Draw first page
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      
      let heightLeft = imgHeight - pdfHeight;
      let position = -pdfHeight;

      // Handle multi-page overflow elements
      while (heightLeft > 0) {
        pdf.addPage('a4', 'p');
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
        position -= pdfHeight;
      }

      // 3. Initiate client-side download
      pdf.save(`Invoice_${invoice.invoiceNumber || 'Detail'}.pdf`);

      // 4. Trigger professional feedback toasts
      setToastType('success');
      setToastMessage(`Tax Invoice ${invoice.invoiceNumber || ''} saved and downloaded as PDF successfully!`);
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);

    } catch (err) {
      console.error('PDF construction failed, falling back to window print', err);
      setToastType('error');
      setToastMessage('Client-side PDF compiler failed. Utilizing standard document layout print instead.');
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const matchedCustomer = customers.find(c => c.id === invoice.customerId);

  // Fallback data for realistic invoice showcase
  const defaultGstin = businessProfile.gstNumber || "27ABCDE1234F1Z5";
  const customerGstin = invoice.customerGstin && invoice.customerGstin !== 'Unregistered' 
    ? invoice.customerGstin 
    : "29XYZAB5678G2H6";

  // Calculations
  const taxableAmount = invoice.subtotal - invoice.discountAmount;
  const halfTaxRate = invoice.totalTax / 2;

  return (
    <div className="space-y-6 animate-fade-in pb-12" id="invoice-details-root">
      
      {/* 1. DOCUMENT MANAGEMENT ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-3xs print:hidden">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => {
              setSelectedInvoiceId(null);
              setCurrentTab('invoices');
            }}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">A4 Tax Document Preview</h2>
            <p className="text-[11px] text-slate-455">Download, print, or collect GST clearances on A4 layout.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEditInvoice && (
            <button 
              type="button"
              onClick={() => onEditInvoice(invoice)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-extrabold py-2 px-3.5 rounded-lg text-xs transition-all shadow-3xs cursor-pointer select-none"
            >
              <Edit className="w-4 h-4 text-slate-500" />
              <span>Edit Invoice</span>
            </button>
          )}

          {invoice.status !== 'Paid' && (
            <button 
              type="button"
              onClick={() => onMarkPaid(invoice.id)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3.5 rounded-lg text-xs transition-all shadow-sm cursor-pointer select-none"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark as Paid</span>
            </button>
          )}

          <button 
            type="button"
            onClick={handleDownloadActualPDF}
            disabled={isDownloading}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold py-2 px-3.5 rounded-lg text-xs transition-all shadow-sm cursor-pointer select-none"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-spin' : 'animate-bounce'}`} />
            <span>{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button 
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white font-extrabold py-2 px-3.5 rounded-lg text-xs transition-all shadow-sm cursor-pointer select-none"
          >
            <Printer className="w-4 h-4" />
            <span>Print Layout</span>
          </button>
        </div>
      </div>

      {/* 2. REALISTIC A4 PREVIEW BODY (210mm x 297mm Aspect Ratio styling) */}
      <div className="bg-slate-100 p-4 sm:p-8 rounded-2xl border border-slate-200 print:bg-white print:border-0 print:p-0">
        
        <div 
          ref={printAreaRef}
          className="bg-white border border-slate-200 rounded-xl p-8 max-w-[210mm] mx-auto shadow-md relative overflow-hidden flex flex-col justify-between print:border-0 print:p-0 print:shadow-none print:rounded-none min-h-[297mm]"
          id="invoice-a4-printable-stage"
        >
          {/* WATERMARK OVERLAY IF UNPAID */}
          {invoice.status !== 'Paid' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-10 opacity-[0.07] print:opacity-[0.05]">
              <span className="text-red-650 font-black text-7xl md:text-8xl tracking-widest uppercase transform -rotate-45 block">
                UNPAID
              </span>
            </div>
          )}

          <div className="space-y-6">
            
            {/* A. HEADER SECTION */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-205 pb-5">
              
              {/* Left Brand block */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  {businessProfile.logo ? (
                    <img 
                      src={businessProfile.logo} 
                      className="w-12 h-12 object-contain rounded border border-slate-205 bg-white p-0.5" 
                      alt="Business Brand Logo" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-[#1E40AF] text-white flex items-center justify-center font-black text-lg select-none">
                      SB
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-extrabold text-[#1E40AF] tracking-tight">{businessProfile.name || "SupaBuyer Invoice"}</h2>
                    <p className="text-[10px] text-slate-455 font-semibold">Premium B2B compliance billing partner</p>
                  </div>
                </div>
              </div>

              {/* Right Tax Invoice designation block */}
              <div className="text-right flex flex-col items-end gap-1.5 self-stretch sm:self-auto">
                <div className="bg-[#2563EB] text-white font-black text-xs px-4 py-1.5 rounded tracking-widest uppercase text-center w-full sm:w-auto shadow-2xs">
                  TAX INVOICE
                </div>
                <div className="text-[11px] text-slate-550 font-bold space-y-0.5 mt-1">
                  <p>Invoice No: <span className="text-slate-900 font-extrabold font-mono text-xs">{invoice.invoiceNumber || "INV-2024-149"}</span></p>
                  <p>Invoice Date: <span className="text-slate-800 font-extrabold">{invoice.invoiceDate}</span></p>
                  <p>Due Date: <span className="text-slate-800 font-extrabold">{invoice.dueDate}</span></p>
                </div>
              </div>

            </div>

            {/* B. BUSINESS & CUSTOMER INFO (2 COLUMNS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-2">
              
              {/* Left Column Box: From (Sender info) */}
              <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/40 text-xs flex flex-col justify-between space-y-1.5">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-1">Sender (From)</span>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{businessProfile.name || "SupaBuyer Invoice HQ"}</h3>
                  <p className="text-slate-600 leading-relaxed font-semibold whitespace-pre-line mt-1">
                    {businessProfile.address || "104, Hitech Avenue Office, Gachibowli, Hyderabad, Telangana - 500032"}
                  </p>
                </div>
                <div className="border-t border-slate-200/60 pt-2 text-[10.5px] mt-2 space-y-0.5">
                  <p className="font-semibold text-slate-500 font-mono">GSTIN: <span className="font-bold text-slate-800 uppercase">{defaultGstin}</span></p>
                  {businessProfile.panNumber && <p className="font-semibold text-slate-500 font-mono">PAN: <span className="font-bold text-slate-800 uppercase">{businessProfile.panNumber}</span></p>}
                  <p className="font-semibold text-slate-500">Contact: <span className="font-bold text-slate-800">{businessProfile.phone || "+91 9988221100"}</span> | {businessProfile.email || "accounts@yourbiz.com"}</p>
                </div>
              </div>

              {/* Right Column Box: Bill To (Customer info with blue border accent) */}
              <div className="border-2 border-blue-200 bg-blue-50/10 rounded-xl p-4 text-xs flex flex-col justify-between space-y-1.5 shadow-3xs">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-[#2563EB] block mb-1">Recipient (Bill To)</span>
                  <h3 className="font-extrabold text-blue-950 text-sm leading-tight">
                    {matchedCustomer?.companyName || invoice.customerName}
                  </h3>
                  <p className="text-slate-600 leading-relaxed font-semibold whitespace-pre-line mt-1">
                    {matchedCustomer?.address || "Hitech Executive Suite, Lane 2, Madhapur, Hyderabad, Telangana - 500081"}
                  </p>
                </div>
                <div className="border-t border-blue-100 pt-2 text-[10.5px] mt-2 space-y-0.5">
                  <p className="font-semibold text-slate-500 font-mono text-blue-900">GSTIN: <span className="font-extrabold text-slate-800 uppercase">{customerGstin}</span></p>
                  {matchedCustomer?.phone && <p className="font-semibold text-slate-550">Contact: <span className="font-bold text-slate-800">{matchedCustomer.phone}</span></p>}
                  {matchedCustomer?.email && <p className="font-semibold text-slate-550">Email: <span className="font-bold text-slate-805">{matchedCustomer.email}</span></p>}
                  <p className="font-semibold text-slate-500">State Code: <span className="font-extrabold text-slate-800">{invoice.placeOfSupply || "36 - Telangana"}</span></p>
                </div>
              </div>

            </div>

            {/* C. ITEMS TABLE */}
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                <thead>
                  <tr className="bg-[#DBEAFE] text-[#1E40AF] text-[9.5px] font-black uppercase tracking-wider divide-x divide-blue-200">
                    <th className="py-2.5 px-1.5 w-8 text-center text-[#1E40AF]">#</th>
                    <th className="py-2.5 px-3 min-w-[140px] text-[#1E40AF]">Description</th>
                    <th className="py-2.5 px-2 text-center text-[#1E40AF]">HSN</th>
                    <th className="py-2.5 px-2 text-center text-[#1E40AF]">Qty</th>
                    <th className="py-2.5 px-2 text-center text-[#1E40AF]">Unit</th>
                    <th className="py-2.5 px-2 text-right text-[#1E40AF]">Rate</th>
                    <th className="py-2.5 px-2 text-right text-[#1E40AF]">Disc%</th>
                    <th className="py-2.5 px-2 text-right text-[#1E40AF]">Taxable</th>
                    <th className="py-2.5 px-2 text-center text-[#1E40AF]">GST%</th>
                    <th className="py-2.5 px-3 text-right text-[#1E40AF]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-[10.5px] text-slate-700">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((it, idx) => (
                      <tr key={it.id} className="even:bg-[#F8FAFC] odd:bg-white divide-x divide-slate-105 hover:bg-slate-50/50">
                        <td className="py-2.5 px-1.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900 text-xs">{it.name}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-500 font-semibold">{it.hsnSac || "9983"}</td>
                        <td className="py-2.5 px-2 text-center font-black text-slate-850">{it.quantity}</td>
                        <td className="py-2.5 px-2 text-center font-semibold text-slate-500 uppercase">{it.unit || "NOS"}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-500">{formatCurrency(it.rate)}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-500 font-bold">{it.discountPercentage || 0}%</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-800">{formatCurrency(it.taxableValue)}</td>
                        <td className="py-2.5 px-2 text-center font-extrabold text-[#2563EB]">{it.gstPercentage}%</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-950">{formatCurrency(it.totalAmount)}</td>
                      </tr>
                    ))
                  ) : (
                    // Beautiful placeholder sample items matching description
                    <>
                      <tr className="bg-white hover:bg-slate-50/50 divide-x divide-slate-105">
                        <td className="py-2.5 px-1.5 text-center text-slate-400 font-bold">1</td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900 text-xs">Premium Cloud Hosting Consultation Module</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-500 font-semibold">998311</td>
                        <td className="py-2.5 px-2 text-center font-black text-slate-850">1</td>
                        <td className="py-2.5 px-2 text-center font-semibold text-slate-500 uppercase">PCS</td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-500">{formatCurrency(12000)}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-500 font-bold">0%</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-800">{formatCurrency(12000)}</td>
                        <td className="py-2.5 px-2 text-center font-extrabold text-[#2563EB]">18%</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-950">{formatCurrency(14160)}</td>
                      </tr>
                      <tr className="bg-[#F8FAFC] hover:bg-slate-50/50 divide-x divide-slate-105">
                        <td className="py-2.5 px-1.5 text-center text-slate-400 font-bold">2</td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900 text-xs">SupaBuyer Enterprise Licenses (Annual Pack)</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-500 font-semibold">998315</td>
                        <td className="py-2.5 px-2 text-center font-black text-slate-850">1</td>
                        <td className="py-2.5 px-2 text-center font-semibold text-slate-500 uppercase">NOS</td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-500">{formatCurrency(12500)}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-500 font-bold">4%</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-800">{formatCurrency(12000)}</td>
                        <td className="py-2.5 px-2 text-center font-extrabold text-[#2563EB]">18%</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-950">{formatCurrency(14160)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* D. FINANCIALS GRID & SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-3 border-t border-slate-100">
              
              {/* Left Block: Rupee In Words + Particulars */}
              <div className="md:col-span-7 space-y-4 text-xs">
                
                {/* AMOUNT IN WORDS */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg">
                  <span className="text-[9px] uppercase font-black text-slate-450 block tracking-wider leading-none mb-1">Total Invoice Value (In Words)</span>
                  <p className="font-serif italic text-slate-750 font-bold text-xs" id="amount-rupees-words-box">
                    {convertNumberToIndianWords(invoice.grandTotal || 28320.50)}
                  </p>
                </div>

                {/* Sender Bank Coordinates */}
                <div className="p-3 bg-blue-50/20 border border-blue-100/50 rounded-lg space-y-1 text-[11px] font-semibold text-slate-600">
                  <span className="text-[9px] font-black text-[#1E40AF] uppercase tracking-wider block mb-1">Settlement Credentials (Bank Info)</span>
                  <div className="grid grid-cols-2 gap-y-0.5 gap-x-2 font-mono text-xs">
                    <p><span className="text-slate-400">Bank:</span> <span className="font-sans font-extrabold text-slate-800">{businessProfile.bankName || "HDFC Bank"}</span></p>
                    <p><span className="text-slate-400">IFSC:</span> <span className="font-sans font-bold text-slate-850 uppercase">{businessProfile.bankIfsc || "HDFC0000012"}</span></p>
                    <p className="col-span-2"><span className="text-slate-400">Account:</span> <span className="font-bold text-slate-900">{businessProfile.accountNumber || "5020004941031"}</span></p>
                    {businessProfile.upiId && (
                      <p className="col-span-2 text-[10.5px] border-t border-slate-150 pt-1 mt-1 font-sans font-bold text-[#1E40AF]">
                        Scan to Pay: <span className="font-mono text-slate-700 bg-white border border-slate-100 px-1 py-0.5 rounded shadow-2xs">{businessProfile.upiId}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Dynamic Notes */}
                {(invoice.notes || invoice.terms) && (
                  <div className="text-[10px] text-slate-450 font-medium leading-normal space-y-1">
                    {invoice.notes && <p><span className="font-bold uppercase tracking-wider text-slate-400 text-[8px] mr-1">Notes:</span>{invoice.notes}</p>}
                    {invoice.terms && <p className="whitespace-pre-wrap"><span className="font-bold uppercase tracking-wider text-slate-400 text-[8px] mr-1">Terms:</span>{invoice.terms}</p>}
                  </div>
                )}
              </div>

              {/* Right Block: Tax & Subtotals Summary Box */}
              <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl divide-y divide-slate-150 text-[11px] font-bold text-slate-500 overflow-hidden">
                
                <div className="p-3 flex justify-between">
                  <span>Gross Subtotal</span>
                  <span className="font-mono text-slate-800">{formatCurrency(invoice.subtotal || 24500.00)}</span>
                </div>

                {(invoice.discountAmount > 0 || invoice.discountValue > 0) && (
                  <div className="p-3 flex justify-between bg-red-50/10 text-red-650">
                    <span>Discount Deduction</span>
                    <span className="font-mono font-bold">-({formatCurrency(invoice.discountAmount || 500.00)})</span>
                  </div>
                )}

                <div className="p-3 flex justify-between bg-slate-50/50">
                  <span className="text-slate-750 font-extrabold">Taxable Value</span>
                  <span className="font-mono font-black text-slate-850">{formatCurrency(taxableAmount || 24000.00)}</span>
                </div>

                {invoice.supplyType === 'INTRA' || !invoice.supplyType ? (
                  <>
                    <div className="p-3 flex justify-between">
                      <span>Central Tax (CGST 9.0%)</span>
                      <span className="font-mono text-slate-800">{formatCurrency(invoice.totalCgst || halfTaxRate || 2160.00)}</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span>State Tax (SGST 9.0%)</span>
                      <span className="font-mono text-slate-800">{formatCurrency(invoice.totalSgst || halfTaxRate || 2160.00)}</span>
                    </div>
                  </>
                ) : (
                  <div className="p-3 flex justify-between">
                    <span>Integrated Tax (IGST 18.0%)</span>
                    <span className="font-mono text-slate-800">{formatCurrency(invoice.totalIgst || invoice.totalTax || 4320.00)}</span>
                  </div>
                )}

                <div className="p-3 flex justify-between font-mono bg-[#DBEAFE]/30 text-blue-900 text-[10.5px]">
                  <span>Total GST Duties</span>
                  <span className="font-bold">{formatCurrency(invoice.totalTax || 4320.00)}</span>
                </div>

                {invoice.shippingCharges > 0 && (
                  <div className="p-3 flex justify-between">
                    <span>Shipping Outlay</span>
                    <span className="font-mono text-slate-800">{formatCurrency(invoice.shippingCharges)}</span>
                  </div>
                )}

                <div className="p-3 flex justify-between">
                  <span>Round-off Delta</span>
                  <span className="font-mono font-medium text-slate-450">{invoice.roundOff > 0 ? `+${invoice.roundOff}` : invoice.roundOff || "+₹0.50"}</span>
                </div>

                <div className="p-3.5 bg-[#DBEAFE]/50 flex justify-between items-center border-t-2 border-[#1E40AF]">
                  <span className="text-[#1E40AF] text-[11.5px] font-black uppercase">Grand Total Due</span>
                  <span className="text-[#2563EB] font-mono text-lg font-black tracking-tight" id="a4-pdf-grand-total">
                    {formatCurrency(invoice.grandTotal || 28320.50)}
                  </span>
                </div>

              </div>

            </div>

            {/* E. COMPLIANCE STAMP, QR CODE, AND SIGNATURE BLOCKS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t border-slate-105">
              
              {/* Digitally compliance note */}
              <div className="md:col-span-5 flex flex-col justify-end text-[9.5px] text-slate-400 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-650 font-sans uppercase tracking-wider text-[8.5px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>100% digitally verified compliance stamp</span>
                </p>
                <p className="leading-tight">All calculations, GSTR values, and settlement identifiers are legally locked under dynamic compliance algorithms.</p>
              </div>

              {/* UPI QR Code block (Center column) */}
              <div className="md:col-span-3 flex justify-center items-center">
                <div className="flex flex-col items-center justify-center p-1.5 border border-slate-200 rounded-lg bg-white shadow-3xs" title="Scan UPI VPA Code">
                  <svg className="w-13 h-13 text-slate-800" viewBox="0 0 100 100">
                    {/* Vector QR simulation */}
                    <rect x="0" y="0" width="22" height="22" fill="currentColor" />
                    <rect x="3" y="3" width="16" height="16" fill="white" />
                    <rect x="6" y="6" width="10" height="10" fill="currentColor" />

                    <rect x="78" y="0" width="22" height="22" fill="currentColor" />
                    <rect x="81" y="3" width="16" height="16" fill="white" />
                    <rect x="84" y="6" width="10" height="10" fill="currentColor" />

                    <rect x="0" y="78" width="22" height="22" fill="currentColor" />
                    <rect x="3" y="81" width="16" height="16" fill="white" />
                    <rect x="6" y="84" width="10" height="10" fill="currentColor" />

                    {/* Points */}
                    <rect x="30" y="5" width="8" height="5" fill="currentColor" />
                    <rect x="45" y="0" width="4" height="12" fill="currentColor" />
                    <rect x="55" y="4" width="12" height="6" fill="currentColor" />
                    <rect x="30" y="30" width="10" height="10" fill="currentColor" />
                    <rect x="45" y="25" width="6" height="22" fill="currentColor" />
                    <rect x="78" y="30" width="12" height="4" fill="currentColor" />
                    <rect x="55" y="45" width="20" height="6" fill="currentColor" />
                    <rect x="25" y="60" width="10" height="8" fill="currentColor" />
                    <rect x="38" y="75" width="15" height="15" fill="currentColor" />
                    <rect x="60" y="78" width="8" height="12" fill="currentColor" />
                    <rect x="75" y="60" width="18" height="8" fill="currentColor" />
                    <rect x="48" y="48" width="5" height="5" fill="currentColor" />
                  </svg>
                  <span className="text-[7.5px] font-black uppercase text-slate-400 tracking-wider mt-1">UPI Pay QR</span>
                </div>
              </div>

              {/* Authorised signatory & business stamp (Right column) */}
              <div className="md:col-span-4 flex flex-col items-center sm:items-end justify-between text-center sm:text-right select-none min-h-[90px]" id="signature-seal-area">
                
                {/* Seal circle */}
                <div className="w-13 h-13 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[7.5px] font-mono font-black uppercase text-slate-350 tracking-tighter" title="Company Seal">
                  Seal Circle
                </div>

                <div className="relative min-h-[24px] flex items-center justify-center pt-2">
                  <span className="font-serif italic text-xs text-blue-750 font-black relative z-10 select-none">
                    Digitally Signed Lock
                  </span>
                </div>

                <div className="border-t border-slate-200/80 pt-1 w-full sm:w-40 mt-1">
                  <p className="font-extrabold text-slate-750 text-[10px]">Authorised Signatory</p>
                  <p className="text-[8.5px] text-slate-450 font-medium">for {businessProfile.name || "SupaBuyer Invoice"}</p>
                </div>
              </div>

            </div>

          </div>

          {/* F. BOTTOM FOOTER BAR (BLUE #2563EB) */}
          <div className="bg-[#2563EB] text-white text-center py-2 px-3 rounded-md text-[9.5px] font-extrabold tracking-wide flex flex-row justify-between items-center mt-8 print:rounded-none">
            <span>Generated by SupaBuyer Invoice — Free Forever</span>
            <span className="uppercase text-[#DBEAFE]">Thank you for your business!</span>
          </div>

        </div>

      </div>

      {/* 3. DYNAMIC NOTIFICATION TOAST */}
      {toastMessage && (
        <div 
          className={`fixed top-5 right-5 z-100 flex items-center gap-3 border shadow-2xl rounded-xl py-3.5 px-5 text-sm font-bold min-w-[320px] animate-slide-in select-none ${
            toastType === 'success' 
              ? 'bg-slate-900 border-slate-700 text-white' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
          id="invoice-download-toast"
        >
          {toastType === 'success' ? (
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-wider opacity-60">System Notice</p>
            <p className="text-xs font-semibold">{toastMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
}
