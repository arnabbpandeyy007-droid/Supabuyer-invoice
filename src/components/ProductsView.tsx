import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Upload, 
  X, 
  Check, 
  Pencil, 
  Trash2, 
  Package, 
  Sparkles, 
  AlertCircle, 
  Info,
  ChevronDown,
  Inbox,
  FileSpreadsheet
} from 'lucide-react';
import { Product } from '../types';

interface ProductsViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
}

const UNITS = [
  { value: 'Piece', label: 'Piece (PCS)' },
  { value: 'Meter', label: 'Meter (MTR)' },
  { value: 'Hour', label: 'Hour (HRS)' },
  { value: 'Kg', label: 'Kilogram (KGS)' },
  { value: 'Liter', label: 'Liter (LTR)' },
  { value: 'Box', label: 'Box (BOX)' },
  { value: 'Set', label: 'Set (SET)' },
  { value: 'Pack', label: 'Pack (PAC)' },
  { value: 'Service', label: 'Service (SRV)' }
];

export default function ProductsView({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct 
}: ProductsViewProps) {
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Product' | 'Service'>('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  
  // Simulated CSV Import states
  const [showCsvImporter, setShowCsvImporter] = useState(false);
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Product' | 'Service'>('Product');
  const [hsnSac, setHsnSac] = useState('');
  const [unit, setUnit] = useState('Piece');
  const [rate, setRate] = useState<number | ''>('');
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [includesTax, setIncludesTax] = useState<boolean>(false);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // Currency Converter Formatter (en-IN)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  // GST badge coloring scheme based on percentages
  const getGstBadgeStyles = (percentage: number) => {
    switch (percentage) {
      case 5:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 12:
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 18:
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 28:
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  // Helper reset form fields
  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('Product');
    setHsnSac('');
    setUnit('Piece');
    setRate('');
    setGstPercentage(18);
    setIncludesTax(false);
    setStatus('Active');
    setEditingProd(null);
  };

  // Populate fields for Editing
  const handleEditClick = (p: Product) => {
    setEditingProd(p);
    setName(p.name);
    setDescription(p.description || '');
    setCategory(p.category || 'Product');
    setHsnSac(p.hsnSac || '');
    setUnit(p.unit || 'Piece');
    setRate(p.rate || 0);
    setGstPercentage(p.gstPercentage || 18);
    setIncludesTax(p.includesTax || false);
    setStatus(p.status || 'Active');
    setShowAddForm(true);
  };

  // Handle SKU deletion
  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this product/service from the catalog? This operation cannot be reversed.')) {
      if (onDeleteProduct) {
        onDeleteProduct(id);
      }
    }
  };

  // Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Product or Service title is required.');
      return;
    }
    if (!hsnSac.trim()) {
      alert(`${category === 'Product' ? 'HSN' : 'SAC'} code is required for GST compliance.`);
      return;
    }
    if (rate === '' || Number(rate) < 0) {
      alert('Please enter a valid rate (0 or higher).');
      return;
    }

    const payload: Product = {
      id: editingProd?.id || `prod-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      hsnSac: hsnSac.trim(),
      unit,
      rate: Number(rate),
      gstPercentage,
      includesTax,
      status
    };

    if (editingProd) {
      onEditProduct(payload);
    } else {
      onAddProduct(payload);
    }

    resetForm();
    setShowAddForm(false);
  };

  // Live Auto-Suggestion for common codes when switching categories
  const handleCategoryChange = (cat: 'Product' | 'Service') => {
    setCategory(cat);
    // If user hasn't typed anything yet or has old prefix, assist with standard template codes
    if (!hsnSac) {
      setHsnSac(cat === 'Product' ? '8471' : '9983');
      setUnit(cat === 'Product' ? 'Piece' : 'Hour');
    }
  };

  // Simulated CSV Import with smart fallback template
  const triggerCsvImport = () => {
    setShowCsvImporter(true);
    setCsvFeedback(null);
  };

  const handleSimulateImport = () => {
    // Generate dummy product listings representing typical imports
    const sampleImports: Product[] = [
      {
        id: `prod-csv-1-${Date.now()}`,
        name: "Wireless Designer Mouse Black Edition",
        description: "USB 3.0 ergonomic rechargeable optical wheel mouse.",
        category: "Product",
        hsnSac: "847130",
        unit: "Piece",
        rate: 1850,
        gstPercentage: 18,
        status: "Active",
        includesTax: false
      },
      {
        id: `prod-csv-2-${Date.now()}`,
        name: "Cloud Server Deployment Sprint Setup",
        description: "DevOps automation, Docker swarm configuration with load balancer.",
        category: "Service",
        hsnSac: "998315",
        unit: "Hour",
        rate: 4500,
        gstPercentage: 18,
        status: "Active",
        includesTax: false
      },
      {
        id: `prod-csv-3-${Date.now()}`,
        name: "Organic Bamboo Writing Pad (Pack of 3)",
        description: "Eco-friendly natural bamboo cover sheets with premium ruling paper.",
        category: "Product",
        hsnSac: "4820",
        unit: "Pack",
        rate: 650,
        gstPercentage: 12,
        status: "Active",
        includesTax: true
      }
    ];

    sampleImports.forEach(prod => {
      onAddProduct(prod);
    });

    setCsvFeedback(`Pruned and successfully imported 3 fully compliant catalog items into your directory!`);
    setTimeout(() => {
      setShowCsvImporter(false);
      setCsvFeedback(null);
    }, 2200);
  };

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    // Search filter parameters
    const sTerm = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(sTerm) ||
      (p.description && p.description.toLowerCase().includes(sTerm)) ||
      (p.hsnSac && p.hsnSac.toLowerCase().includes(sTerm));

    // Category filter parameters
    const matchesCategory = 
      activeCategory === 'All' ||
      (activeCategory === 'Product' && (p.category === 'Product' || !p.category)) || // fallback to Product if unassigned
      (activeCategory === 'Service' && p.category === 'Service');

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="products-catalog-wrapper">
      
      {/* ----------------- PAGE HEADER BLOCK ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight" id="products-view-title">
            Products &amp; Services
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your inventory catalog, configure HSN/SAC Indian taxation codes, rate tables, and units.
          </p>
        </div>
        
        {/* Actions Button Deck */}
        <div className="flex items-center gap-2 max-sm:w-full">
          <button 
            type="button"
            id="import-csv-header-btn"
            onClick={triggerCsvImport}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-lg text-xs shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button 
            type="button"
            id="add-product-header-btn"
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* ----------------- SEARCH & TABS BAR ----------------- */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs" id="catalog-control-belt">
        
        {/* Interactive Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            id="product-directory-search-input"
            type="text"
            placeholder="Search items by name, description, HSN/SAC code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 focus:border-slate-300 bg-slate-50/50 rounded-lg text-xs font-semibold focus:outline-none placeholder:text-slate-400 text-slate-800"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Toggling Switch Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto" id="product-category-filters">
          {(['All', 'Product', 'Service'] as const).map(tab => {
            const isActive = activeCategory === tab;
            return (
              <button
                key={tab}
                id={`cat-filter-btn-${tab.toLowerCase()}`}
                onClick={() => setActiveCategory(tab)}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all relative ${
                  isActive 
                    ? 'bg-white text-blue-600 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'All' && 'All Catalog'}
                {tab === 'Product' && 'Products'}
                {tab === 'Service' && 'Services'}
              </button>
            );
          })}
        </div>

      </div>

      {/* ----------------- DATA TABLE / CARDS SCREEN ----------------- */}
      {filteredProducts.length === 0 ? (
        /* Empty State with standard clean guidelines layout */
        <div className="bg-white border border-slate-200 rounded-xl py-14 px-6 text-center space-y-4 shadow-xs" id="products-empty-view">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-8 h-8 text-slate-450 animate-pulse" />
          </div>
          
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-905">Add your first product or service</h3>
            <p className="text-xs text-slate-500 font-medium">
              Maintain standardized pricing and SAC/HSN billing configurations. Saves massive effort during manual billing.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm font-sans"
              id="empty-add-product-btn"
            >
              + Create Product / Service SKU
            </button>
            
            <button
              onClick={triggerCsvImport}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg"
              id="empty-import-csv-btn"
            >
              Simulate Compliance Import
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* DESKTOP: Grid responsive standard compliance Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" id="desktop-catalog-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[10.5px] uppercase font-black text-slate-500 tracking-wider">
                    <th className="py-3.5 pl-5 w-12 text-center">#</th>
                    <th className="py-3.5 pl-2">Product / Service Name</th>
                    <th className="py-3.5">Category</th>
                    <th className="py-3.5">HSN/SAC Code</th>
                    <th className="py-3.5">Unit</th>
                    <th className="py-3.5 text-right w-36">Rate (₹)</th>
                    <th className="py-3.5 text-center w-28">GST %</th>
                    <th className="py-3.5 text-center w-28">Status</th>
                    <th className="py-3.5 text-right pr-6 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-750">
                  {filteredProducts.map((p, idx) => {
                    const isService = p.category === 'Service';
                    const hasTaxInclusion = p.includesTax === true;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/40 transition-colors group">
                        {/* Serial Number Row */}
                        <td className="py-4 pl-5 text-center font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        
                        {/* Name and description column */}
                        <td className="py-4 pl-2 max-w-xs">
                          <div className="font-bold text-slate-900 leading-tight block">
                            {p.name}
                          </div>
                          {p.description && (
                            <div className="text-[10.5px] text-slate-400 mt-0.5 line-clamp-1 group-hover:line-clamp-none transition-all duration-150">
                              {p.description}
                            </div>
                          )}
                        </td>

                        {/* Category badge */}
                        <td className="py-4">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            isService 
                              ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {p.category || 'Product'}
                          </span>
                        </td>

                        {/* Mono formatted HSN/SAC Code */}
                        <td className="py-4 font-mono font-bold text-slate-600">
                          {p.hsnSac || '—'}
                        </td>

                        {/* Unit label */}
                        <td className="py-4 font-medium text-slate-500">
                          {p.unit || 'Piece'}
                        </td>

                        {/* Comma-formatted Price Rate */}
                        <td className="py-4 text-right">
                          <div className="font-mono font-black text-slate-900">
                            {formatCurrency(p.rate)}
                          </div>
                          {hasTaxInclusion && (
                            <span className="text-[9px] font-bold text-emerald-600 block leading-none mt-1">
                              Tax-inclusive rate
                            </span>
                          )}
                        </td>

                        {/* GST % Colored Badge */}
                        <td className="py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black font-mono inline-block ${getGstBadgeStyles(p.gstPercentage)}`}>
                            {p.gstPercentage}%
                          </span>
                        </td>

                        {/* Active/Inactive Status label */}
                        <td className="py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase tracking-wide border ${
                            p.status !== 'Inactive' 
                              ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100' 
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {p.status || 'Active'}
                          </span>
                        </td>

                        {/* Actions Panel */}
                        <td className="py-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            <button 
                              type="button"
                              onClick={() => handleEditClick(p)}
                              className="p-1.5 border border-slate-150 hover:border-blue-300 text-slate-500 hover:text-blue-600 bg-white hover:bg-blue-50/50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Item"
                              id={`edit-item-btn-${p.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              type="button"
                              onClick={() => handleDeleteClick(p.id)}
                              className="p-1.5 border border-slate-150 hover:border-red-300 text-slate-400 hover:text-red-650 bg-white hover:bg-red-50/40 rounded-lg transition-colors cursor-pointer"
                              title="Delete Item"
                              id={`delete-item-btn-${p.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE: Grid mapping list conversion cards */}
          <div className="md:hidden space-y-4" id="mobile-catalog-cards-block">
            {filteredProducts.map((p, idx) => {
              const isService = p.category === 'Service';
              return (
                <div 
                  key={p.id}
                  id={`mobile-sku-card-${p.id}`}
                  className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3 shadow-xs relative"
                >
                  {/* Card Identifier Strip */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold font-mono text-slate-405">
                          #{idx + 1}
                        </span>
                        
                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                          isService 
                            ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {p.category || 'Product'}
                        </span>

                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase border ${
                          p.status !== 'Inactive' 
                            ? 'bg-emerald-50/20 text-emerald-600 border-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {p.status || 'Active'}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-slate-900 leading-tight text-sm">
                        {p.name}
                      </h3>
                    </div>

                    {/* Unified GST Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono shrink-0 ${getGstBadgeStyles(p.gstPercentage)}`}>
                      {p.gstPercentage}% GST
                    </span>
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  {/* Pricing and Code Row */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs leading-none">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        {isService ? 'SAC Code' : 'HSN Code'}
                      </span>
                      <span className="font-mono font-bold text-slate-700 block">
                        {p.hsnSac || '—'}
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Rate ({p.unit || 'Piece'})
                      </span>
                      <span className="font-mono font-bold text-slate-900 block">
                        {formatCurrency(p.rate)}
                      </span>
                    </div>
                  </div>

                  {/* Floating Action Strip */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    {p.includesTax && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Price Includes GST</span>
                      </span>
                    )}
                    
                    <div className="flex items-center gap-2 ml-auto">
                      
                      <button
                        type="button"
                        onClick={() => handleEditClick(p)}
                        className="inline-flex items-center gap-1 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs text-slate-700 font-bold"
                        id={`mobile-edit-btn-${p.id}`}
                      >
                        <Pencil className="w-3 h-3 text-slate-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(p.id)}
                        className="inline-flex items-center gap-1 border border-red-100 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs text-red-650 font-bold"
                        id={`mobile-delete-btn-${p.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ----------------- ADD / EDIT INTERACTIVE DRAWER MODAL ----------------- */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="add-sku-title" role="dialog" aria-modal="true" id="add-product-drawer-wrapper">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Dark background backdrop overlay */}
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
              onClick={() => { resetForm(); setShowAddForm(false); }}
              id="product-drawer-backdrop"
            ></div>
            
            {/* Sliding responsive Container (On mobile, this can behave as a bottom sheet. On desktop, slides in nicely or centers) */}
            <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto flex max-w-full pointer-events-none md:pl-10">
              <div className="w-full md:max-w-md pointer-events-auto bg-white rounded-t-2xl md:rounded-t-none md:rounded-l-2xl shadow-2xl flex flex-col h-[90vh] md:h-full transform transition duration-300" id="product-modal-dialog-body">
                
                {/* Modal / Sheet Header */}
                <div className="px-6 py-4 border-b border-slate-150 bg-slate-50 rounded-t-2xl md:rounded-t-none flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900" id="add-sku-title">
                      {editingProd ? 'Edit Catalog Item' : 'Add New Catalog SKU'}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Configure standard Indian taxation rules, HSN prefixes, and invoice catalog rates.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => { resetForm(); setShowAddForm(false); }} 
                    className="text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    id="close-product-drawer-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Elements Container */}
                <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4" id="catalog-sku-form">
                  
                  {/* Category Selection toggle button strip */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-650 block">SKU Category Type *</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        id="form-cat-product-btn"
                        onClick={() => handleCategoryChange('Product')}
                        className={`py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          category === 'Product' 
                            ? 'bg-white text-blue-750 shadow-xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Product</span>
                      </button>

                      <button
                        type="button"
                        id="form-cat-service-btn"
                        onClick={() => handleCategoryChange('Service')}
                        className={`py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          category === 'Service' 
                            ? 'bg-white text-blue-750 shadow-xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Service</span>
                      </button>
                    </div>
                  </div>

                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Product / Service Name *</label>
                    <input 
                      id="input-product-name"
                      type="text"
                      placeholder={category === 'Product' ? 'Premium Cotton Fabric' : 'Custom Web Design Retainer'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs font-semibold focus:outline-none"
                      required
                    />
                  </div>

                  {/* Description field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-650 block">Description (Optional)</label>
                    <textarea 
                      id="input-product-desc"
                      rows={2}
                      placeholder="Enter specific line item context, model codes, scope of work limits..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs focus:outline-none"
                    />
                  </div>

                  {/* Code Block fields - dynamically swaps between HSN and SAC labels based on Category toggle! */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-bold text-slate-650 block">
                        {category === 'Product' ? 'HSN Code *' : 'SAC Code *'}
                      </label>
                      <input 
                        id="input-product-hsn"
                        type="text"
                        placeholder={category === 'Product' ? '5208' : '998314'}
                        value={hsnSac}
                        onChange={(e) => setHsnSac(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs font-mono uppercase focus:outline-none"
                        required
                      />
                    </div>

                    {/* Unit field */}
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-bold text-slate-650 block">Unit *</label>
                      <select 
                        id="select-product-unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 focus:border-slate-450 bg-white rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        {UNITS.map(uni => (
                          <option key={uni.value} value={uni.value}>
                            {uni.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selling Rate and Includes Tax Toggle Switch */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-bold text-slate-650 block">Selling Rate (₹) *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-405 font-mono text-xs font-bold">
                          ₹
                        </span>
                        <input 
                          id="input-product-rate"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={rate}
                          onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 border border-slate-200 focus:border-slate-450 bg-slate-50/20 rounded-lg text-xs font-bold focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* GST Rate Field */}
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-bold text-slate-655 block">GST Rate *</label>
                      <select 
                        id="select-product-gst"
                        value={gstPercentage}
                        onChange={(e) => setGstPercentage(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 focus:border-slate-450 bg-white rounded-lg text-xs font-black focus:outline-none cursor-pointer"
                      >
                        <option value={0}>0% (GST Exempt)</option>
                        <option value={5}>5% GST (Consumables/Fabric)</option>
                        <option value={12}>12% GST (Electronics/Appliances)</option>
                        <option value={18}>18% GST (Standard Services/Software)</option>
                        <option value={28}>28% GST (Luxury / Cess Goods)</option>
                      </select>
                    </div>
                  </div>

                  {/* Includes Tax custom toggle row */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-705 block">Includes Tax (VAT / GST)</span>
                      <p className="text-[10px] text-slate-400">Rate is inclusive of standard chosen GST % rate.</p>
                    </div>
                    
                    <button
                      type="button"
                      id="toggle-includes-tax-btn"
                      onClick={() => setIncludesTax(!includesTax)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                        includesTax ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-250 ease-in-out ${
                        includesTax ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Math preview of tax distribution helper box */}
                  {rate !== '' && rate > 0 && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-[11px] leading-relaxed text-slate-700">
                      <div className="flex items-center gap-1 text-xs font-bold text-blue-750 mb-1.5">
                        <Info className="w-3.5 h-3.5" />
                        <span>GST Billing Estimate Breakdown</span>
                      </div>
                      
                      {includesTax ? (
                        <>
                          <p>
                            Calculated from a Tax-inclusive rate of <strong>{formatCurrency(Number(rate))}</strong>:
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono">
                            <div>Taxable Value (Base):</div>
                            <div className="text-right font-bold text-slate-900">
                              {formatCurrency(Number(rate) / (1 + gstPercentage / 100))}
                            </div>
                            <div>GST Share Claim ({gstPercentage}%):</div>
                            <div className="text-right font-bold text-blue-700">
                              {formatCurrency(Number(rate) - (Number(rate) / (1 + gstPercentage / 100)))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <p>
                            Calculated from an Exclusive rate of <strong>{formatCurrency(Number(rate))}</strong>:
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono">
                            <div>Taxable Value (Base):</div>
                            <div className="text-right font-bold text-slate-950">
                              {formatCurrency(Number(rate))}
                            </div>
                            <div>GST Share Claim ({gstPercentage}%):</div>
                            <div className="text-right font-bold text-blue-700">
                              {formatCurrency(Number(rate) * (gstPercentage / 100))}
                            </div>
                            <div className="border-t border-slate-200 pt-1 font-sans font-bold">Grand Total Estimated:</div>
                            <div className="text-right border-t border-slate-200 pt-1 font-bold text-slate-900">
                              {formatCurrency(Number(rate) * (1 + gstPercentage / 100))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Active vs Inactive Product Toggle configuration */}
                  {editingProd && (
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-slate-600 block">Catalog SKU Status</span>
                      <select
                        id="select-sku-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="bg-white border border-slate-200 text-xs font-extrabold focus:outline-none p-1.5 rounded-lg text-slate-750 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  )}

                </form>

                {/* Form Drawer Footer Sticky Buttons */}
                <div className="px-6 py-4.5 border-t border-slate-150 flex items-center justify-end gap-2 bg-slate-50">
                  <button 
                    type="button" 
                    id="cancel-form-btn"
                    onClick={() => { resetForm(); setShowAddForm(false); }} 
                    className="px-4.5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold rounded-lg text-slate-600"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    id="save-form-btn"
                    form="catalog-sku-form"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                    Save SKU to Catalog
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- CSV IMPORT DIALOG DRAWER MODAL ----------------- */}
      {showCsvImporter && (
        <div id="csv-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="csv-drawer-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setShowCsvImporter(false)}></div>
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 max-sm:pl-0">
              <div className="w-screen max-w-md h-full bg-white shadow-2xl flex flex-col justify-between" id="csv-sheet-body">
                
                {/* Header info */}
                <div className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
                  <div>
                    <h2 className="text-base font-bold text-slate-900" id="csv-drawer-title">Simulate Import CSV</h2>
                    <p className="text-[10px] text-slate-400">Load batch compliant SKU catalogues directly.</p>
                  </div>
                  <button 
                    onClick={() => setShowCsvImporter(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Import body content */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-slate-50/10 transition-colors p-8 rounded-xl text-center space-y-3">
                    <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700 block">Drag &amp; drop compliance file here</span>
                      <p className="text-[10.5px] text-slate-400">Accepted formats: .csv, .xlsx, or exported tax tally files</p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-100/50 border border-slate-200 rounded-xl p-4 text-xs">
                    <span className="font-bold text-slate-750 block">Sample columns expected:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px] font-mono">
                      <li>ProductName (String)</li>
                      <li>Category (Product / Service)</li>
                      <li>HSNSAC (Numeric String)</li>
                      <li>UnitType (Meter, Piece, Kg, etc.)</li>
                      <li>SellingRate (Numeric)</li>
                      <li>GstPercentage (0, 5, 12, 18, 28)</li>
                    </ul>
                  </div>

                  {csvFeedback && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-lg text-xs leading-relaxed flex items-start gap-1.5">
                      <Check className="w-4 h-4 shrink-0 rounded-full bg-emerald-100 text-emerald-700 p-0.5 mt-0.5" />
                      <div>
                        <span className="font-bold block">Status Checklist: Verified</span>
                        <span>{csvFeedback}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Import Footer Actions */}
                <div className="px-6 py-4.5 border-t border-slate-150 flex items-center justify-end gap-2 bg-slate-50">
                  <button
                    onClick={() => setShowCsvImporter(false)}
                    className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold rounded-lg text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSimulateImport}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                    Simulate Compliant Import
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
