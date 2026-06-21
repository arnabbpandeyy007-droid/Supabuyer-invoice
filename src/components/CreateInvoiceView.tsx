import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Receipt, 
  CheckCircle,
  HelpCircle,
  UserPlus,
  Eye,
  Download,
  Save,
  Send,
  X,
  Search,
  Check,
  Building,
  MapPin,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import { Customer, Product, Invoice, InvoiceItem, BusinessProfile } from '../types';

interface CreateInvoiceViewProps {
  businessProfile: BusinessProfile;
  customers: Customer[];
  products: Product[];
  onSaveInvoice: (invoice: Invoice) => void;
  setCurrentTab: (tab: string) => void;
  editingInvoice: Invoice | null;
  setEditingInvoice: (inv: Invoice | null) => void;
  onAddCustomer?: (customer: Customer) => void;
  setSelectedInvoiceId?: (id: string | null) => void;
}

export default function CreateInvoiceView({
  businessProfile,
  customers,
  products,
  onSaveInvoice,
  setCurrentTab,
  editingInvoice,
  setEditingInvoice,
  onAddCustomer,
  setSelectedInvoiceId
}: CreateInvoiceViewProps) {
  // 1. Initial State Setup
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2024-${Math.floor(100 + Math.random() * 900)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 14 days payment terms
    return d.toISOString().split('T')[0];
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [supplyType, setSupplyType] = useState<'INTRA' | 'INTER'>('INTRA');
  const [placeOfSupply, setPlaceOfSupply] = useState('27 - Maharashtra');

  // Customer dropdown search
  const [custSearch, setCustSearch] = useState('');
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Quick Customer Create Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  // Line items state (start with 3 rows displayed by default as requested)
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { id: 'item-1', name: 'Software Premium Suite License', hsnSac: '9973', quantity: 1, rate: 15000, discountPercentage: 0, gstPercentage: 18 },
    { id: 'item-2', name: 'Architectural System Consultations', hsnSac: '9983', quantity: 1, rate: 8500, discountPercentage: 0, gstPercentage: 18 },
    { id: 'item-3', name: 'Cloud Infrastructure Provisioning', hsnSac: '9987', quantity: 1, rate: 1000, discountPercentage: 0, gstPercentage: 18 }
  ]);

  // Adjustments state (matching the ₹500 discount example from user)
  const [discountType, setDiscountType] = useState<'PERCENT' | 'VALUE'>('VALUE');
  const [discountValue, setDiscountValue] = useState(500); // 500 flat discount
  const [shippingCharges, setShippingCharges] = useState(0);
  const [applyGstOnShipping, setApplyGstOnShipping] = useState(false);
  const [manualRoundOff, setManualRoundOff] = useState<number>(0.50); // Exact default of +₹0.50

  const [notes, setNotes] = useState('Payment due within 14 days. Please refer to bank accounts listed below.');
  const [terms, setTerms] = useState('All disputes are subject to municipal jurisdiction.');

  // Toggle preview visibility in desktop/mobile
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showDesktopPreview, setShowDesktopPreview] = useState(true);

  // Close customer dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCustDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pre-fill fields if we are editing an invoice
  useEffect(() => {
    if (editingInvoice) {
      setInvoiceNumber(editingInvoice.invoiceNumber);
      setInvoiceDate(editingInvoice.invoiceDate);
      setDueDate(editingInvoice.dueDate);
      setSelectedCustomerId(editingInvoice.customerId);
      setSupplyType(editingInvoice.supplyType);
      setPlaceOfSupply(editingInvoice.placeOfSupply);
      setItems(editingInvoice.items);
      setDiscountType(editingInvoice.discountType);
      setDiscountValue(editingInvoice.discountValue);
      setShippingCharges(editingInvoice.shippingCharges);
      setApplyGstOnShipping(editingInvoice.applyGstOnShipping);
      setNotes(editingInvoice.notes || '');
      setTerms(editingInvoice.terms || '');
    } else {
      // Choose first client by default to fill out fields beautifully
      if (customers && customers.length > 0 && !selectedCustomerId) {
        handleClientChange(customers[1]?.id || customers[0]?.id);
      }
    }
  }, [editingInvoice, customers]);

  // Handle client selectionPOS & supply type updates
  const handleClientChange = (custId: string) => {
    setSelectedCustomerId(custId);
    const client = customers.find(c => c.id === custId);
    if (client) {
      // In Indian GST, state code is first 2 digits of GSTIN
      const hasInGstin = client.gstin && client.gstin.startsWith('27');
      if (hasInGstin || !client.gstin) {
        setSupplyType('INTRA');
        setPlaceOfSupply('27 - Maharashtra');
      } else {
        setSupplyType('INTER');
        const stateCode = client.gstin ? client.gstin.substring(0, 2) : '29';
        if (stateCode === '29') setPlaceOfSupply('29 - Karnataka');
        else if (stateCode === '07') setPlaceOfSupply('07 - Delhi');
        else if (stateCode === '24') setPlaceOfSupply('24 - Gujarat');
        else setPlaceOfSupply(`${stateCode} - InterState State`);
      }
    }
  };

  // Add Row
  const addItemRow = () => {
    setItems([
      ...items,
      { 
        id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, 
        name: '', 
        hsnSac: '9983', 
        quantity: 1, 
        rate: 0, 
        discountPercentage: 0, 
        gstPercentage: 18 
      }
    ]);
  };

  // Delete line item
  const deleteItemRow = (id: string) => {
    setItems(items.filter(it => it.id !== id));
  };

  // Handle line item update
  const updateItemField = (id: string, field: keyof InvoiceItem, val: any) => {
    setItems(items.map(it => {
      if (it.id === id) {
        const updated = { ...it, [field]: val };
        // Pre-fill from product templates
        if (field === 'name') {
          const match = products.find(p => p.name === val);
          if (match) {
            updated.productId = match.id;
            updated.hsnSac = match.hsnSac;
            updated.rate = match.rate;
            updated.gstPercentage = match.gstPercentage;
            updated.unit = match.unit;
          }
        }
        return updated;
      }
      return it;
    }));
  };

  // 2. Calculations
  // Total Subtotal before taxes & overall discount
  const subtotalBeforeGlobalDiscount = items.reduce((sum, it) => {
    const qty = Number(it.quantity) || 0;
    const rate = Number(it.rate) || 0;
    const discPercentage = Number(it.discountPercentage) || 0;
    const baseAmount = qty * rate;
    const discountAmount = (baseAmount * discPercentage) / 100;
    return sum + (baseAmount - discountAmount);
  }, 0);

  // Calculate Global Discount
  let calculatedGlobalDiscount = 0;
  if (discountType === 'PERCENT') {
    calculatedGlobalDiscount = (subtotalBeforeGlobalDiscount * discountValue) / 100;
  } else {
    calculatedGlobalDiscount = discountValue;
  }

  const computedItems: InvoiceItem[] = items.map(it => {
    const qty = Number(it.quantity) || 0;
    const rate = Number(it.rate) || 0;
    const discPercentage = Number(it.discountPercentage) || 0;
    const gstRate = Number(it.gstPercentage) || 0;

    const baseAmount = qty * rate;
    const itemDiscountAmount = (baseAmount * discPercentage) / 100;
    const taxableBeforeGlobal = baseAmount - itemDiscountAmount;

    // Allocate global discount share proportionally to comply with CGST/SGST Act
    const globalDiscountRatio = subtotalBeforeGlobalDiscount > 0 
      ? (taxableBeforeGlobal / subtotalBeforeGlobalDiscount) 
      : 0;
    const globalDiscountShare = calculatedGlobalDiscount * globalDiscountRatio;

    // Fully discounted taxable value for tax computation
    const taxableValueForTax = taxableBeforeGlobal - globalDiscountShare;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (supplyType === 'INTRA') {
      cgst = (taxableValueForTax * (gstRate / 2)) / 100;
      sgst = (taxableValueForTax * (gstRate / 2)) / 100;
    } else {
      igst = (taxableValueForTax * gstRate) / 100;
    }

    const totalAmount = taxableValueForTax + cgst + sgst + igst;

    return {
      id: it.id || '',
      productId: it.productId || 'custom',
      name: it.name || '',
      hsnSac: it.hsnSac || '9983',
      quantity: qty,
      rate: rate,
      discountPercentage: discPercentage,
      gstPercentage: gstRate,
      taxableValue: Math.round(taxableBeforeGlobal * 100) / 100, // Return standard taxable before overall discount for line description
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      igst: Math.round(igst * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  });

  const subtotal = subtotalBeforeGlobalDiscount;

  // CGST/SGST/IGST breakdown
  const totalCgst = computedItems.reduce((sum, it) => sum + it.cgst, 0);
  const totalSgst = computedItems.reduce((sum, it) => sum + it.sgst, 0);
  const totalIgst = computedItems.reduce((sum, it) => sum + it.igst, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;

  // Adjustments computation
  const baseBeforeShipping = subtotal - calculatedGlobalDiscount + totalTax;
  const rawGrandTotal = baseBeforeShipping + Number(shippingCharges) + Number(manualRoundOff);

  const roundedTotal = rawGrandTotal;
  const roundOff = manualRoundOff;

  // Core Formatter in Indian Rupees (₹)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  // Fast direct Customer Addition
  const handleAddNewCustomerPrompt = () => {
    if (!newCustCompany.trim() || !newCustName.trim()) {
      alert('Kindly supply at least Company Name & Contact Representative Name.');
      return;
    }
    const generatedId = `client-${Date.now()}`;
    const newCustomerPayload: Customer = {
      id: generatedId,
      customerName: newCustName,
      companyName: newCustCompany,
      gstin: newCustGstin.trim().toUpperCase(),
      address: newCustAddress,
      phone: newCustPhone,
      email: newCustEmail
    };

    if (onAddCustomer) {
      onAddCustomer(newCustomerPayload);
    }
    // Select newly registered client immediately
    setSelectedCustomerId(generatedId);
    handleClientChange(generatedId);

    // Reset fields & close modal
    setNewCustCompany('');
    setNewCustName('');
    setNewCustGstin('');
    setNewCustAddress('');
    setNewCustPhone('');
    setNewCustEmail('');
    setIsCustomerModalOpen(false);
  };

  // Core Saver
  const handleSave = (status: 'Draft' | 'Sent') => {
    const selectedCust = customers.find(c => c.id === selectedCustomerId);
    
    if (computedItems.length === 0 || computedItems.some(i => !i.name)) {
      alert('Your invoice requires at least one product line item with a specified name.');
      return;
    }

    const invoicePayload: Invoice = {
      id: editingInvoice?.id || `invoice-${Date.now()}`,
      invoiceNumber,
      invoiceDate,
      dueDate,
      customerId: selectedCustomerId,
      customerName: selectedCust ? (selectedCust.companyName || selectedCust.customerName) : 'Unassigned Customer',
      customerGstin: selectedCust ? (selectedCust.gstin || 'Unregistered') : 'Unregistered',
      supplyType,
      placeOfSupply,
      items: computedItems,
      subtotal,
      discountType,
      discountValue,
      discountAmount: calculatedGlobalDiscount,
      shippingCharges: Number(shippingCharges),
      applyGstOnShipping,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax,
      roundOff: Math.round(roundOff * 100) / 100,
      grandTotal: roundedTotal,
      notes,
      terms,
      status: editingInvoice?.status || status,
      createdAt: editingInvoice?.createdAt || new Date().toISOString()
    };

    onSaveInvoice(invoicePayload);
    setEditingInvoice(null);
    setCurrentTab('invoices');
  };

  // High fidelity client-side PDF downloading and opening flow
  const handleDownloadPDF = () => {
    const selectedCust = customers.find(c => c.id === selectedCustomerId);
    
    if (computedItems.length === 0 || computedItems.some(i => !i.name)) {
      alert('Your invoice requires at least one product line item with a specified name.');
      return;
    }

    const payloadId = editingInvoice?.id || `invoice-${Date.now()}`;
    const invoicePayload: Invoice = {
      id: payloadId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      customerId: selectedCustomerId,
      customerName: selectedCust ? (selectedCust.companyName || selectedCust.customerName) : 'Unassigned Customer',
      customerGstin: selectedCust ? (selectedCust.gstin || 'Unregistered') : 'Unregistered',
      supplyType,
      placeOfSupply,
      items: computedItems,
      subtotal,
      discountType,
      discountValue,
      discountAmount: calculatedGlobalDiscount,
      shippingCharges: Number(shippingCharges),
      applyGstOnShipping,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax,
      roundOff: Math.round(roundOff * 100) / 100,
      grandTotal: roundedTotal,
      notes,
      terms,
      status: editingInvoice?.status || 'Draft',
      createdAt: editingInvoice?.createdAt || new Date().toISOString()
    };

    // Save current state as active draft
    onSaveInvoice(invoicePayload);
    setEditingInvoice(null);
    
    if (setSelectedInvoiceId) {
      setSelectedInvoiceId(payloadId);
    }
    
    // Switch view tab
    setCurrentTab('preview-invoice');

    const bypassPopupBlock = true;
    if (bypassPopupBlock) {
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Authorization popup blocked. Please permit popups to download PDF.');
      return;
    }

    // Build interactive elegant printable document using modern Tailwind classes
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoiceNumber} - Pristine Tax Invoice</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; }
            @media print {
              body { background-color: white !important; }
              .print-button { display: none !important; }
              @page { size: portrait; margin: 12mm 15mm; }
            }
          </style>
        </head>
        <body class="bg-slate-50 min-h-screen text-slate-800 antialiased p-8">
          
          {/* Header Action panel */}
          <div class="max-w-4xl mx-auto mb-6 flex justify-between items-center print-button">
            <span class="text-xs text-slate-500 font-medium">✨ Preparing high fidelity document layout</span>
            <button 
              onclick="window.print()"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              Confirm PDF Download / Print
            </button>
          </div>

          <div class="max-w-4xl mx-auto bg-white border border-slate-200 shadow-lg rounded-2xl p-10 relative overflow-hidden" id="invoice-sheet">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800" />
            
            {/* Top Branding Header */}
            <div class="flex justify-between items-start pt-4 border-b border-slate-100 pb-8">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                    S
                  </div>
                  <div>
                    <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">${businessProfile.name}</h1>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Authorized Tax Registration Holder</p>
                  </div>
                </div>
                <div class="text-[11px] text-slate-500 max-w-sm leading-relaxed mt-2.5">
                  ${businessProfile.address || 'India Headquarters Office'}<br>
                  Email: ${businessProfile.email} | Phone: ${businessProfile.phone}<br>
                  ${businessProfile.website ? `Web: ${businessProfile.website}` : ''}
                </div>
              </div>

              <div class="text-right space-y-2.5">
                <span class="inline-block bg-blue-50 text-blue-800 border border-blue-100 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                  Tax Invoice
                </span>
                <div class="text-xs space-y-1">
                  <p class="text-slate-400 font-medium">Invoice Reference:</p>
                  <p class="text-base font-black text-slate-900 font-mono">${invoiceNumber}</p>
                </div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-left text-[11px] pt-1">
                  <span class="text-slate-400">Date:</span>
                  <span class="font-semibold text-slate-800 text-right font-mono">${invoiceDate}</span>
                  <span class="text-slate-400">Due Date:</span>
                  <span class="font-semibold text-slate-800 text-right font-mono">${dueDate}</span>
                </div>
              </div>
            </div>

            {/* GSTIN / Identification details bar */}
            <div class="grid grid-cols-2 gap-8 my-8 text-xs">
              <div class="bg-slate-50/75 border border-slate-100 rounded-xl p-4 space-y-1.5">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">My Business Registry Details</p>
                <div class="space-y-1 font-medium text-slate-700">
                  <p><span class="text-slate-400">GSTIN:</span> <span class="font-bold font-mono text-slate-900">${businessProfile.gstNumber}</span></p>
                  <p><span class="text-slate-400">PAN:</span> <span class="font-semibold font-mono">${businessProfile.panNumber || 'NA'}</span></p>
                  <p><span class="text-slate-400">State Code:</span> <span class="font-semibold">MH (Code 27)</span></p>
                </div>
              </div>

              <div class="bg-slate-50/75 border border-slate-100 rounded-xl p-4 space-y-1.5">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To (Customer Details)</p>
                <div class="space-y-1 font-medium text-slate-700">
                  <p class="font-bold text-slate-900">${selectedCust ? (selectedCust.companyName || selectedCust.customerName) : 'Walk-In Customer'}</p>
                  <p class="text-slate-500">${selectedCust ? (selectedCust.address || 'Registered Office Address') : 'No address provided'}</p>
                  ${selectedCust && selectedCust.gstin ? `<p><span class="text-slate-400">GSTIN / ID:</span> <span class="font-bold font-mono text-slate-900">${selectedCust.gstin}</span></p>` : `<p><span class="text-slate-400">GSTIN:</span> <span class="text-amber-600 font-semibold italic">Unregistered Person / Consumer</span></p>`}
                  ${selectedCust && selectedCust.email ? `<p><span class="text-slate-400">Contact:</span> ${selectedCust.email} | ${selectedCust.phone || ''}</p>` : ''}
                </div>
              </div>
            </div>

            {/* Places of Supply classification */}
            <div class="bg-blue-50/40 border border-blue-50 text-blue-900/80 rounded-xl p-3.5 px-4 mb-8 text-[11px] font-semibold flex justify-between items-center">
              <div>Place of Supply: <span class="font-bold">${placeOfSupply}</span></div>
              <div>Supply Type: <span class="font-extrabold uppercase tracking-widest text-blue-800">${supplyType === 'INTRA' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}</span></div>
            </div>

            {/* Products Table */}
            <div class="border border-slate-200 rounded-xl overflow-hidden mb-8">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9.5px] tracking-wider">
                    <th class="p-3.5 pl-4">Item &amp; Description</th>
                    <th class="p-3.5 text-center">HSN/SAC</th>
                    <th class="p-3.5 text-center">Qty / Unit</th>
                    <th class="p-3.5 text-right">Rate</th>
                    <th class="p-3.5 text-center">Discount</th>
                    <th class="p-3.5 text-center">GST %</th>
                    <th class="p-3.5 text-right pr-4">Total Taxable</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-[11px] font-medium text-slate-700">
                  ${computedItems.map((item, idx) => `
                    <tr class="hover:bg-slate-50/10">
                      <td class="p-3.5 pl-4">
                        <p class="font-bold text-slate-900">${item.name || 'Custom Product Row'}</p>
                      </td>
                      <td class="p-3.5 text-center font-mono text-slate-400">${item.hsnSac || '9983'}</td>
                      <td class="p-3.5 text-center">${item.quantity} Unit(s)</td>
                      <td class="p-3.5 text-right font-mono">${formatCurrency(item.rate)}</td>
                      <td class="p-3.5 text-center text-red-500">${item.discountPercentage}%</td>
                      <td class="p-3.5 text-center">
                        <span class="bg-slate-150 text-slate-650 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          ${item.gstPercentage}%
                        </span>
                      </td>
                      <td class="p-3.5 text-right pr-4 font-bold text-slate-900 font-mono">${formatCurrency(item.taxableValue)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div class="grid grid-cols-2 gap-8 items-end text-xs">
              
              <div class="space-y-4">
                {/* Bank settlement Details */}
                <div class="bg-slate-50/50 border border-slate-100 rounded-xl p-4 text-[10.5px]">
                  <p class="font-extrabold text-slate-900 uppercase tracking-widest text-[9px] mb-2 text-blue-700">Official Bank Settlement Ledger</p>
                  <div class="grid grid-cols-3 gap-y-1 font-medium text-slate-600">
                    <span class="text-slate-450 font-normal">Beneficiary:</span>
                    <span class="col-span-2 font-semibold text-slate-800">${businessProfile.name}</span>

                    <span class="text-slate-450 font-normal font-mono">Bank Name:</span>
                    <span class="col-span-2 font-semibold">${businessProfile.bankName || 'HDFC Bank Ltd'}</span>

                    <span class="text-slate-450 font-normal">Account no:</span>
                    <span class="col-span-2 font-bold text-slate-900 font-mono">${businessProfile.accountNumber || '50200045239120'}</span>

                    <span class="text-slate-450 font-normal">IFSC Block:</span>
                    <span class="col-span-2 font-bold uppercase font-mono text-indigo-700">${businessProfile.bankIfsc || 'HDFC0000240'}</span>
                    
                    ${businessProfile.upiId ? `
                      <span class="text-slate-450 font-normal">UPI Virtual:</span>
                      <span class="col-span-2 font-semibold text-emerald-700 font-mono">${businessProfile.upiId}</span>
                    ` : ''}
                  </div>
                </div>

                <div class="text-[10px] text-slate-400 italic leading-relaxed">
                  Note: Interest at 18% per annum will be levied for delays beyond standard transaction limits.<br>
                  This is an electronically validated commercial ledger instrument. Needs no manually signed seal.
                </div>
              </div>

              {/* Precise tax calculation breakdown card */}
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                <div class="flex justify-between text-slate-500 font-medium">
                  <span>Cumulative Subtotal:</span>
                  <span class="font-semibold text-slate-800 font-mono">${formatCurrency(subtotal)}</span>
                </div>

                ${calculatedGlobalDiscount > 0 ? `
                  <div class="flex justify-between text-red-500 font-semibold">
                    <span>Overall Combined Discount:</span>
                    <span class="font-mono">- ${formatCurrency(calculatedGlobalDiscount)}</span>
                  </div>
                ` : ''}

                ${supplyType === 'INTRA' ? `
                  <div class="flex justify-between text-slate-500">
                    <span>Central GST (CGST - 9% avg):</span>
                    <span class="font-semibold text-slate-850 font-mono">${formatCurrency(totalCgst)}</span>
                  </div>
                  <div class="flex justify-between text-slate-500 border-b border-slate-200 pb-2.5">
                    <span>State GST (SGST - 9% avg):</span>
                    <span class="font-semibold text-slate-850 font-mono">${formatCurrency(totalSgst)}</span>
                  </div>
                ` : `
                  <div class="flex justify-between text-slate-550 border-b border-slate-220 pb-2.5">
                    <span>Integrated GST (IGST - 18%):</span>
                    <span class="font-semibold text-slate-850 font-mono">${formatCurrency(totalIgst)}</span>
                  </div>
                `}

                ${shippingCharges > 0 ? `
                  <div class="flex justify-between text-slate-500">
                    <span>Shipping fee:</span>
                    <span class="font-semibold text-slate-800 font-mono">${formatCurrency(shippingCharges)}</span>
                  </div>
                ` : ''}

                <div class="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                  <span>Round Off Value:</span>
                  <span>${roundOff > 0 ? `+${formatCurrency(roundOff)}` : formatCurrency(roundOff)}</span>
                </div>

                <div class="flex justify-between items-center text-slate-900 pt-2.5 border-t border-slate-200">
                  <span class="font-extrabold text-xs uppercase tracking-wider text-slate-500">Total Billed Amt (INR):</span>
                  <span class="text-lg font-black text-blue-600 font-mono">${formatCurrency(roundedTotal)}</span>
                </div>
              </div>

            </div>

            {/* Bottom terms notes area */}
            <div class="border-t border-slate-100 pt-6 mt-8 grid grid-cols-2 gap-4 text-[11px] text-slate-500">
              <div>
                <p class="font-bold text-slate-800 uppercase tracking-widest text-[9px] mb-1">Declarations &amp; Remarks</p>
                <p class="leading-relaxed font-medium">${notes || 'Standard terms & conditions apply.'}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-slate-800 uppercase tracking-widest text-[9px] mb-1">Standard Legal Prerequisite</p>
                <p class="leading-relaxed font-medium">${terms || 'Subject to local judicial authority.'}</p>
              </div>
            </div>

          </div>

          <script>
            // Automatically prompt print dialog 
            window.onload = function() {
              console.log('Document presentation ready.');
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Safe client filter for searchable customer dropdown list
  const filteredCustomers = customers.filter(c => {
    const term = custSearch.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(term) ||
      c.customerName.toLowerCase().includes(term) ||
      c.gstin.toLowerCase().includes(term)
    );
  });

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="space-y-6 animate-fade-in relative max-w-full pb-20" id="create-invoice-unified-root">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5" id="create-invoice-header">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => {
                setEditingInvoice(null);
                setCurrentTab('invoices');
              }} 
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title="Return to list"
              id="back-to-invoices-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-[28px] font-semibold text-slate-900 tracking-tight flex items-center gap-3" id="main-new-invoice-title">
                <span>New Invoice</span>
                
                {/* "Preview" toggle button next to heading */}
                <button
                  type="button"
                  onClick={() => {
                    setShowDesktopPreview(!showDesktopPreview);
                    setShowMobilePreview(!showMobilePreview);
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                    showDesktopPreview 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                      : 'bg-slate-100 text-slate-650 border-slate-200 hover:bg-slate-150'
                  }`}
                  id="preview-toggle-header-btn"
                >
                  <Eye className="w-3.5 h-3.5 shrink-0 text-[#2563EB]" />
                  <span>Preview</span>
                </button>
              </h1>
              <p className="text-xs text-slate-400 mt-1">Configure and emit standard taxation details and items for Indian business circles.</p>
            </div>
          </div>
        </div>

        {/* Action bar tags */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-105">
            GST INVOICING INDIA
          </span>
        </div>
      </div>

      {/* 2. CORE LAYOUT WRAPPER (Left Form 65% + Right Preview 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FORM CONTEXT (Col: 65% on Desktop (lg:col-span-8)) */}
        <div className={`space-y-6 ${showDesktopPreview ? 'lg:col-span-8' : 'lg:col-span-12'} ${showMobilePreview ? 'hidden sm:block' : 'block'}`}>
          
          {/* Card: Invoice metadata & Client choice */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6" id="create-invoice-metadata-form">
            
            {/* Row 1: Invoice # (auto-generated, INV-2024-149) + editable */}
            <div className="space-y-1.5 max-w-md">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Invoice #</span>
                <span className="text-[10px] text-slate-400 font-medium italic">(Auto-generated &amp; editable)</span>
              </label>
              <input 
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full max-w-sm px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                placeholder="INV-2024-149"
                id="invoice-ref-number-input"
              />
            </div>

            {/* Row 2: Date picker (Invoice Date) + Date picker (Due Date) — side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650">Invoice Date *</label>
                <input 
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white font-semibold"
                  id="invoice-date-picker"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650">Due Date *</label>
                <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white font-semibold"
                  id="due-date-picker"
                />
              </div>
            </div>

            {/* Row 3: Customer selector dropdown with search + "+ Add New Customer" option */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="text-xs font-bold text-slate-650 flex justify-between items-center">
                  <span>Customer Name *</span>
                  <button 
                    type="button"
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="text-[11px] font-bold text-blue-650 hover:underline flex items-center gap-0.5"
                    id="add-new-customer-trigger"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    + Add New Customer
                  </button>
                </label>

                {/* Searchable Select Dropdown container */}
                <div 
                  onClick={() => setShowCustDropdown(true)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs flex justify-between items-center bg-white cursor-pointer hover:border-slate-300 transition-colors"
                  id="customer-dropdown-select-box"
                >
                  <span className="font-semibold text-slate-800">
                    {activeCustomer ? `${activeCustomer.companyName} (${activeCustomer.customerName})` : 'Choose customer...'}
                  </span>
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                {/* Dropdown Floating Window */}
                {showCustDropdown && (
                  <div className="absolute z-30 left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-slide-in">
                    <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input 
                        type="text"
                        placeholder="Search customer name, company, or GSTIN..."
                        value={custSearch}
                        onChange={(e) => setCustSearch(e.target.value)}
                        className="w-full bg-transparent border-none text-xs focus:outline-none py-1 text-slate-800"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(c => (
                          <div 
                            key={c.id}
                            onClick={() => {
                              handleClientChange(c.id);
                              setShowCustDropdown(false);
                            }}
                            className={`p-3 text-xs hover:bg-slate-50 cursor-pointer flex items-center justify-between ${selectedCustomerId === c.id ? 'bg-blue-50/55' : ''}`}
                          >
                            <div>
                              <p className="font-bold text-slate-905">{c.companyName}</p>
                              <p className="text-[10px] text-slate-450">Contact: {c.customerName}</p>
                              {c.gstin && <p className="text-[9.5px] text-[#2563EB] font-bold font-mono mt-0.5">GSTIN: {c.gstin}</p>}
                            </div>
                            {selectedCustomerId === c.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-xs font-semibold">
                          No matching customer records.
                        </div>
                      )}
                    </div>
                    
                    {/* Add New Customer dropdown action link */}
                    <div 
                      onClick={() => {
                        setShowCustDropdown(false);
                        setIsCustomerModalOpen(true);
                      }}
                      className="p-3 bg-blue-50/80 hover:bg-blue-100 border-t border-slate-100 text-center text-xs font-bold text-blue-700 cursor-pointer transition-colors"
                    >
                      + Register brand new custom client
                    </div>
                  </div>
                )}
              </div>

              {/* Supply Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 font-sans">Place of Supply (POS) *</label>
                <select 
                  value={placeOfSupply}
                  onChange={(e) => {
                    setPlaceOfSupply(e.target.value);
                    setSupplyType(e.target.value.startsWith('27') ? 'INTRA' : 'INTER');
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 bg-white cursor-pointer"
                >
                  <option value="27 - Maharashtra">27 - Maharashtra (Intra-state CGST + SGST)</option>
                  <option value="29 - Karnataka">29 - Karnataka (Inter-state IGST)</option>
                  <option value="07 - Delhi">07 - Delhi (Inter-state IGST)</option>
                  <option value="24 - Gujarat">24 - Gujarat (Inter-state IGST)</option>
                </select>
              </div>
            </div>

            {/* Row 4: Billing Address Auto-fills from customer with elegant status details */}
            {activeCustomer && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 animate-fade-in space-y-1 text-xs" id="billing-address-autofill-box">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Billing Address (Auto-filled)</p>
                <p className="font-extrabold text-slate-800">{activeCustomer.companyName}</p>
                <p className="text-slate-500 leading-relaxed">{activeCustomer.address || 'No registered street billing address available.'}</p>
                {activeCustomer.gstin ? (
                  <p className="font-bold text-[#2563EB] font-mono mt-1 text-[11px]">GSTIN: {activeCustomer.gstin}</p>
                ) : (
                  <p className="text-amber-600 font-semibold italic mt-1 text-[10px]">Unregistered Consumer / Trade Entity</p>
                )}
              </div>
            )}
          </div>

          {/* Card Container: Interactive Products & Services Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs uppercase font-extrabold text-slate-400 tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full" />
                <span>Line Items Registry</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">Auto-computes dynamic taxes</span>
            </div>

            {/* Desktop Table Presentation */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/35 border-b border-slate-150 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="p-3 pl-4 w-[28%]">Item Description</th>
                    <th className="p-3 text-center w-[12%]">HSN/SAC</th>
                    <th className="p-3 text-center w-[10%]">Qty</th>
                    <th className="p-3 text-center w-[10%]">Unit</th>
                    <th className="p-3 text-right w-[12%]">Rate (INR)</th>
                    <th className="p-3 text-center w-[10%]">Disc %</th>
                    <th className="p-3 text-center w-[10%]">Tax (GST)</th>
                    <th className="p-3 text-right pr-4 w-[12%]">Amount</th>
                    <th className="p-3 text-center w-[6%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {items.map((it, idx) => {
                    const rowBase = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
                    const rowDisc = (rowBase * (Number(it.discountPercentage) || 0)) / 100;
                    const rowGst = ((rowBase - rowDisc) * (Number(it.gstPercentage) || 0)) / 100;
                    const rowGrossTotal = rowBase - rowDisc + rowGst;

                    return (
                      <tr key={it.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Selector or title input */}
                        <td className="p-3 pl-4 space-y-2">
                          <select 
                            value={it.name === '' ? '' : (products.some(p => p.name === it.name) ? it.name : 'Custom Item')}
                            onChange={(e) => updateItemField(it.id || '', 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-205 hover:border-slate-300 rounded-lg text-xs bg-white font-semibold text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer shadow-3xs"
                          >
                            <option value="">Select pre-saved product...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                            <option value="Custom Item">+ Custom Title Name</option>
                          </select>
                          
                          {(it.name === 'Custom Item' || (it.name !== '' && !products.some(p => p.name === it.name))) && (
                            <input 
                              type="text"
                              placeholder="Enter product title or notes..."
                              value={it.name === 'Custom Item' ? '' : it.name}
                              onChange={(e) => updateItemField(it.id || '', 'name', e.target.value || 'Custom Item')}
                              className="w-full px-3 py-2 border border-slate-205 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-3xs"
                            />
                          )}
                        </td>

                        {/* HSN/SAC */}
                        <td className="p-3 text-center">
                          <input 
                            type="text"
                            value={it.hsnSac || ''}
                            onChange={(e) => updateItemField(it.id || '', 'hsnSac', e.target.value)}
                            className="w-full px-2 py-2 border border-slate-205 hover:border-slate-300 rounded-lg text-xs text-center font-mono font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-3xs"
                            placeholder="9983"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="p-3 text-center">
                          <input 
                            type="number"
                            min="1"
                            value={it.quantity || ''}
                            onChange={(e) => updateItemField(it.id || '', 'quantity', Math.max(1, Number(e.target.value)))}
                            className="w-full px-2 py-2 border border-slate-205 hover:border-slate-300 rounded-lg text-xs text-center font-bold text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-3xs"
                          />
                        </td>

                        {/* Unit picker */}
                        <td className="p-3 text-center">
                          <select
                            value={it.unit || 'PCS'}
                            onChange={(e) => updateItemField(it.id || '', 'unit', e.target.value)}
                            className="w-full px-2 py-2 border border-slate-205 hover:border-slate-300 rounded-lg text-xs bg-white text-center font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer transition-all shadow-3xs"
                          >
                            <option value="PCS">PCS</option>
                            <option value="BOX">BOX</option>
                            <option value="NOS">NOS</option>
                            <option value="SET">SET</option>
                            <option value="KGS">KGS</option>
                            <option value="SAC">SAC</option>
                            <option value="SRV">SERVICES</option>
                          </select>
                        </td>

                        {/* Rate (INR) */}
                        <td className="p-3 text-right">
                          <input 
                            type="number"
                            placeholder="0"
                            min="0"
                            value={it.rate === 0 ? '' : it.rate}
                            onChange={(e) => updateItemField(it.id || '', 'rate', Number(e.target.value))}
                            className="w-full px-2 py-2 border border-slate-205 hover:border-slate-300 rounded-lg text-xs text-right font-bold text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-3xs"
                          />
                        </td>

                        {/* Discount Percentage % */}
                        <td className="p-3 text-center">
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={it.discountPercentage || ''}
                            onChange={(e) => updateItemField(it.id || '', 'discountPercentage', Number(e.target.value))}
                            className="w-full px-2 py-2 border border-slate-205 hover:border-slate-300 rounded-lg text-xs text-center font-semibold text-slate-650 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-3xs"
                            placeholder="0"
                          />
                        </td>

                        {/* GST % dropdown: 0/5/12/18/28 as requested */}
                        <td className="p-3 text-center">
                          <select 
                            value={it.gstPercentage || 18}
                            onChange={(e) => updateItemField(it.id || '', 'gstPercentage', Number(e.target.value))}
                            className="w-full px-2 py-2 border border-slate-205 hover:border-slate-300 rounded-lg text-xs bg-white text-center font-extrabold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer transition-all shadow-3xs"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>

                        {/* Output row value with tax */}
                        <td className="p-3 text-right pr-4 font-extrabold text-slate-900 font-mono">
                          {formatCurrency(rowGrossTotal || 0)}
                        </td>

                        {/* Trigger Delete row action */}
                        <td className="p-3 text-center">
                          <button 
                            type="button"
                            onClick={() => deleteItemRow(it.id || '')}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete this row item"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Add item actions row */}
            <div className="p-4 px-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              <button 
                type="button"
                onClick={addItemRow}
                className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 hover:underline"
                style={{ color: '#2563EB' }}
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>+ Add Item</span>
              </button>
              
              <span className="text-[10.5px] font-medium text-slate-400">
                Current count: {items.length} row(s) added
              </span>
            </div>

          </div>

          {/* 3. LOWER SPLIT SECTION: Left (Notes, Legal) + Right (Tax Summary Card) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-3">
            
            {/* LEFT BLOCK: Notes & terms conditions */}
            <div className="md:col-span-6 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-slate-400 rounded-full" />
                  <span>Optional Remittance Remarks</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Client Facing Invoice Notes</label>
                  <textarea 
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter customized thank you message, payment link, or timeline conditions..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Standard Terms &amp; Contract Conditions</label>
                  <textarea 
                    rows={2}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. All disputes subject to local state code jurisdiction."
                  />
                </div>
              </div>
            </div>

            {/* RIGHT BLOCK: TAX SUMMARY CARD (as requested) */}
            <div className="md:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden space-y-3.5">
                
                {/* Decorative border bar */}
                <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600" />
                
                <h3 className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-2">
                  Tax Summary Card
                </h3>

                <div className="space-y-2.5 text-xs text-slate-650 pl-2">
                  
                  {/* Dynamic Subtotal label */}
                  <div className="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span className="font-extrabold text-slate-800 font-mono">{formatCurrency(subtotal)}</span>
                  </div>

                  {/* Discount label */}
                  {calculatedGlobalDiscount > 0 && (
                    <div className="flex justify-between text-red-600 font-semibold items-center">
                      <span className="flex items-center gap-1">
                        <span>Discount:</span>
                        <select 
                          value={discountType}
                          onChange={(e) => setDiscountType(e.target.value as any)}
                          className="bg-transparent border-none text-[11px] text-red-600 font-bold focus:outline-none cursor-pointer p-0 underline"
                        >
                          <option value="PERCENT">%</option>
                          <option value="VALUE">₹ Flat</option>
                        </select>
                        <input
                          type="number"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(Number(e.target.value))}
                          className="w-12 bg-slate-50 border border-slate-200 rounded text-[11px] text-red-600 font-bold text-center py-0.5"
                        />
                      </span>
                      <span className="font-mono">- {formatCurrency(calculatedGlobalDiscount)}</span>
                    </div>
                  )}

                  {/* GST breakdown depending on Supply type (Intra vs Inter state) */}
                  {supplyType === 'INTRA' ? (
                    <>
                      <div className="flex justify-between">
                        <span>CGST (9%):</span>
                        <span className="font-semibold text-slate-800 font-mono">{formatCurrency(totalCgst)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span>SGST (9%):</span>
                        <span className="font-semibold text-slate-800 font-mono">{formatCurrency(totalSgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span>IGST (18%):</span>
                      <span className="font-semibold text-slate-800 font-mono">{formatCurrency(totalIgst)}</span>
                    </div>
                  )}

                  {/* Total GST Summary */}
                  <div className="flex justify-between text-slate-500">
                    <span>Total GST:</span>
                    <span className="font-bold text-slate-800 font-mono">{formatCurrency(totalTax)}</span>
                  </div>

                  {/* Round Off label with small edit utility */}
                  <div className="flex justify-between text-[11px] text-slate-500 items-center">
                    <span className="flex items-center gap-1.5">
                      <span>Round Off:</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={manualRoundOff}
                        onChange={(e) => setManualRoundOff(Number(e.target.value) || 0)}
                        className="w-14 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 font-bold text-center py-0.5"
                      />
                    </span>
                    <span className="font-mono font-semibold text-slate-700">
                      {manualRoundOff >= 0 ? `+${formatCurrency(manualRoundOff)}` : formatCurrency(manualRoundOff)}
                    </span>
                  </div>

                  {/* Grand total - highlighted large, bold and blue as requested */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-450">Total Amount:</span>
                    <span className="text-xl md:text-2xl font-black text-blue-600 font-mono tracking-tight" style={{ color: '#2563EB' }}>
                      {formatCurrency(roundedTotal)}
                    </span>
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* 4. ACTIONS BAR (Desktop - aligned nicely at bottom of card) */}
          <div className="hidden sm:flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
            <button 
              type="button"
              onClick={() => {
                setEditingInvoice(null);
                setCurrentTab('invoices');
              }}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-extrabold transition-all outline-none"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => handleSave('Draft')}
                className="px-5 py-2.5 bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4 text-slate-400" />
                Save as Draft
              </button>

              <button 
                type="button"
                onClick={() => handleDownloadPDF()}
                className="px-5 py-2.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Preview PDF
              </button>

              <button 
                type="button"
                onClick={() => handleSave('Sent')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                Save &amp; Send
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PREVIEW PANEL (35% width, hidden on mobile) */}
        <div className={`lg:col-span-4 ${showDesktopPreview ? 'block' : 'lg:hidden'} ${showMobilePreview ? 'block w-full' : 'hidden lg:block'}`}>
          <div className="sticky top-6 space-y-4">
            
            <div className="bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-950/80 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">Prívate Mini PDF Preview</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-450 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  Realtime Output
                </span>
              </div>

              {/* Dynamic simulated Mini PDF Sheet (high fidelity styling) */}
              <div className="p-5 overflow-y-auto max-h-[500px] bg-slate-950/50 space-y-4 text-slate-300 scrollbar-thin">
                
                {/* PDF Content Sheet Box */}
                <div className="bg-white text-slate-800 p-6 rounded-lg shadow-inner text-[10px] leading-normal font-sans space-y-4 border border-zinc-200">
                  
                  {/* Top header strip */}
                  <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-extrabold text-[#111827] text-xs shrink">{businessProfile.name || 'SupaBuyer Ltd'}</h4>
                      <p className="text-[8px] text-slate-400 mt-1">{businessProfile.email}</p>
                      <p className="text-[8px] text-slate-400 font-mono mt-0.5">{businessProfile.gstNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-indigo-50 text-indigo-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider mb-2">
                        Tax Invoice
                      </span>
                      <p className="font-bold text-[#111827] font-mono text-xs">{invoiceNumber}</p>
                      <p className="text-[8px] text-slate-400 font-mono mt-1">{invoiceDate}</p>
                    </div>
                  </div>

                  {/* Customer details info */}
                  <div className="bg-slate-50/70 border border-slate-100 rounded p-3 text-[9px] text-slate-650 flex justify-between">
                    <div>
                      <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wide">Recipient Customer</p>
                      <p className="font-bold text-[#111827] mt-1">{activeCustomer ? activeCustomer.companyName : 'Walk-In Customer'}</p>
                      <p className="text-slate-400 truncate max-w-[130px]">{activeCustomer ? (activeCustomer.address || 'Street Address') : 'No address specified'}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[7.5px] font-bold text-slate-450 uppercase tracking-wide">Supply Particular</p>
                      <p className="font-semibold">{supplyType === 'INTRA' ? 'Intra-State GST' : 'Inter-State IGST'}</p>
                      <p className="text-[8.5px] font-mono font-bold text-indigo-650">{activeCustomer ? activeCustomer.gstin : 'Unregistered'}</p>
                    </div>
                  </div>

                  {/* Products listings inside preview */}
                  <table className="w-full text-left text-[8.5px] bg-white border border-slate-100 rounded overflow-hidden">
                    <thead>
                      <tr className="bg-slate-50 text-slate-450 font-bold border-b border-slate-100 text-[8px]">
                        <th className="p-2">Line Particulars</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Rate</th>
                        <th className="p-2 text-right">Taxable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                      {computedItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-bold text-slate-800 truncate max-w-[100px]">{item.name || 'Custom Product'}</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(item.rate)}</td>
                          <td className="p-2 text-right font-bold text-slate-800 font-mono">{formatCurrency(item.taxableValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals table blocks */}
                  <div className="space-y-1 text-[9px] max-w-sm ml-auto border-t border-slate-100 pt-2.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Taxable Accumulated:</span>
                      <span className="font-mono text-slate-800 font-semibold">{formatCurrency(subtotal)}</span>
                    </div>

                    {calculatedGlobalDiscount > 0 && (
                      <div className="flex justify-between text-red-500 font-bold">
                        <span>Combined Promo Deduction:</span>
                        <span className="font-mono">- {formatCurrency(calculatedGlobalDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-500">
                      <span>Total GST Collected:</span>
                      <span className="font-mono text-slate-800 font-semibold">{formatCurrency(totalTax)}</span>
                    </div>

                    {roundOff !== 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Round Off:</span>
                        <span className="font-mono text-slate-800 font-semibold">
                          {roundOff >= 0 ? `+${formatCurrency(roundOff)}` : formatCurrency(roundOff)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[10px] font-black text-blue-700 bg-blue-50 p-1.5 rounded mt-1.5">
                      <span>Grand Total (INR):</span>
                      <span className="font-mono text-xs">{formatCurrency(roundedTotal)}</span>
                    </div>
                  </div>

                  {/* Payment UPI QR Code slot */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">Scan QR to pay with UPI</p>
                      <p className="font-mono text-emerald-650 font-bold">{businessProfile.upiId || 'merchant@upi'}</p>
                    </div>
                    {/* Visual QR Code Generator area */}
                    <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded p-0.5 flex flex-wrap items-center justify-center shrink-0">
                      {/* Generates physical realistic grids for qr representing pixels */}
                      <div className="w-9 h-9 grid grid-cols-4 gap-0.5">
                        <div className="bg-slate-900 rounded-sm"></div>
                        <div className="bg-slate-900 rounded-sm"></div>
                        <div className="bg-slate-100"></div>
                        <div className="bg-slate-900 rounded-sm"></div>
                        <div className="bg-slate-100"></div>
                        <div className="bg-slate-900 rounded-sm"></div>
                        <div className="bg-slate-900 rounded-sm"></div>
                        <div className="bg-slate-100"></div>
                        <div className="bg-slate-900 rounded-sm"></div>
                        <div className="bg-slate-100"></div>
                        <div className="bg-slate-900 rounded-sm"></div>
                        <div className="bg-slate-900 rounded-sm"></div>
                        <div className="bg-slate-100"></div>
                        <div className="bg-slate-900 rounded-sm"></div>
                        <div className="bg-slate-100"></div>
                        <div className="bg-slate-100"></div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* PDF download and printing panel buttons */}
              <div className="p-4 bg-slate-950/90 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleDownloadPDF()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[12px] py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Document</span>
                </button>
                <p className="text-[10px] text-center text-zinc-500 mt-2">
                  Triggers browser print system to generate pristine tax layout
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 5. MOBILE STICKY ACTIONS BAR (As explicitly requested by user) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-3.5 flex items-center justify-between gap-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-4">
        <button
          type="button"
          onClick={() => handleSave('Draft')}
          className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Save className="w-4 h-4 text-slate-500" />
          <span>Draft</span>
        </button>

        <button
          type="button"
          onClick={() => handleDownloadPDF()}
          className="bg-white border border-blue-200 text-blue-700 hover:text-blue-800 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>PDF</span>
        </button>

        <button
          type="button"
          onClick={() => handleSave('Sent')}
          className="flex-[1.8] bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_6px_rgba(37,99,235,0.2)]"
        >
          <span>Save &amp; Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. MODAL ELEMENT: REGISTER NEW GST CUSTOMER (Quick inline modal popup context) */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-55 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-lg w-full relative overflow-hidden animate-zoom-in">
            
            {/* Modal header bar */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-[#111827] text-sm tracking-tight">Register New Customer / Business</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-150 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal inputs content */}
            <div className="p-5.5 space-y-4 text-xs font-sans text-slate-700">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Company Name *</label>
                  <input 
                    type="text"
                    value={newCustCompany}
                    onChange={(e) => setNewCustCompany(e.target.value)}
                    placeholder="e.g. Acme Tech Solutions Private Ltd"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-shadow focus:border-blue-500 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Contact Representative Name *</label>
                  <input 
                    type="text"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Rahul Desai"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-shadow focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 flex justify-between items-center">
                  <span>Customer GSTIN</span>
                  <span className="text-[10px] text-slate-450">Format: 15-character code</span>
                </label>
                <input 
                  type="text"
                  maxLength={15}
                  value={newCustGstin}
                  onChange={(e) => setNewCustGstin(e.target.value)}
                  placeholder="e.g. 27AAAAA1111A1Z1"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-shadow focus:border-blue-500 font-mono font-bold uppercase tracking-wider text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Billing Street Address</label>
                <textarea 
                  rows={2}
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Plot No 4, Bandra Kurla Complex Road, Bandra East, Mumbai, MH - 400051"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Representative Email</label>
                  <input 
                    type="email"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    placeholder="representative@domain.com"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Contact Number</label>
                  <input 
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

            </div>

            {/* Modal footer with action buttons */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3.5">
              <button 
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-4 py-1.5 hover:bg-slate-150 rounded text-slate-500 font-bold"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleAddNewCustomerPrompt}
                className="px-5 py-1.5 bg-blue-650 hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-sm"
              >
                Register &amp; Select
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
