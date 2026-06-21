import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Percent, 
  CreditCard, 
  Bell, 
  Users, 
  Cpu, 
  Lock, 
  Coins, 
  Upload, 
  Trash2, 
  Check, 
  Sparkles, 
  Save, 
  Globe, 
  ShieldCheck, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { BusinessProfile } from '../types';

interface SettingsViewProps {
  businessProfile: BusinessProfile;
  onUpdateProfile: (profile: BusinessProfile) => void;
}

const INDIAN_STATES = [
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '29', name: 'Karnataka' },
  { code: '36', name: 'Telangana' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '24', name: 'Gujarat' },
  { code: '19', name: 'West Bengal' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '32', name: 'Kerala' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '08', name: 'Rajasthan' },
  { code: '06', name: 'Haryana' },
];

export default function SettingsView({ businessProfile, onUpdateProfile }: SettingsViewProps) {
  // Option types: 'profile' | 'invoice' | 'tax' | 'bank' | 'notifications' | 'users' | 'integrations' | 'security' | 'billing'
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // --- TAB 1: BUSINESS PROFILE STATES ---
  const [bizName, setBizName] = useState(businessProfile.name || '');
  const [displayName, setDisplayName] = useState(businessProfile.name ? `${businessProfile.name} HQ` : '');
  const [gstNumber, setGstNumber] = useState(businessProfile.gstNumber || '');
  const [panNumber, setPanNumber] = useState(businessProfile.panNumber || '');
  const [bizType, setBizType] = useState('Private Limited');
  const [industry, setIndustry] = useState('Software Services / SaaS');
  const [email, setEmail] = useState(businessProfile.email || '');
  const [mobile, setMobile] = useState(businessProfile.phone || '');
  const [logoPreview, setLogoPreview] = useState<string | null>(businessProfile.logo || null);
  const [website, setWebsite] = useState(businessProfile.website || 'https://supabuyer.in');
  const [estYear, setEstYear] = useState('2024');

  // Address sub-section
  const [addrLine1, setAddrLine1] = useState('Suite 504, 5th Floor, Alpha Towers');
  const [addrLine2, setAddrLine2] = useState('Hitech City, Lane 12');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('36 - Telangana');
  const [pincode, setPincode] = useState('500081');

  // Bank sub-section
  const [bankName, setBankName] = useState(businessProfile.bankName || '');
  const [accountNumber, setAccountNumber] = useState(businessProfile.accountNumber || '');
  const [bankIfsc, setBankIfsc] = useState(businessProfile.bankIfsc || '');
  const [accountType, setAccountType] = useState('Current Account');
  const [upiId, setUpiId] = useState(businessProfile.upiId || '');

  // --- TAB 2: INVOICE SETTINGS STATES ---
  const [invoicePrefix, setInvoicePrefix] = useState('INV-{YEAR}-{NUMBER}');
  const [startingNumber, setStartingNumber] = useState('149');
  const [defaultDueDays, setDefaultDueDays] = useState('30');
  const [selectedTemplate, setSelectedTemplate] = useState('classic-blue');
  const [defaultNotes, setDefaultNotes] = useState('Thank you for choosing SupaBuyer. We appreciate your timely premium association.');
  const [defaultTerms, setDefaultTerms] = useState('1. Please remit transfers to the specified account within the due timeline.\n2. Goods once transferred cannot be refunded without registration of dynamic clearance.');
  const [currencySymbol, setCurrencySymbol] = useState('INR - Indian Rupee (₹)');
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  // --- TAB 3: TAX SETTINGS STATES ---
  const [defaultGstRate, setDefaultGstRate] = useState('18');
  const [lutNumber, setLutNumber] = useState('LUT/2025-26/0491');
  const [isLutEnabled, setIsLutEnabled] = useState(false);
  const [cessPercentage, setCessPercentage] = useState('0');

  // --- TAB 4: NOTIFICATIONS STATES ---
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifOverdue, setNotifOverdue] = useState(true);
  const [notifNewCustomer, setNotifNewCustomer] = useState(false);
  const [notifReportCompiled, setNotifReportCompiled] = useState(true);
  const [notifGstrReminder, setNotifGstrReminder] = useState(true);

  // --- TAB 8: SECURITY STATES ---
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // --- LOGO & SIGNATURE HANDLERS ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoPreview(null);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    setSignaturePreview(null);
  };

  // --- SAVE ALL ACTION SIMULATOR ---
  const handleSaveChangesSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'profile') {
      if (!bizName || !gstNumber) {
        alert('Business Name and GST number are mandatory fields!');
        return;
      }

      // Format physical address string to match expectations
      const fullAddress = `${addrLine1}, ${addrLine2 ? addrLine2 + ', ' : ''}${city}, ${state} - ${pincode}`;

      const payload: BusinessProfile = {
        name: bizName,
        logo: logoPreview || '',
        gstNumber: gstNumber.toUpperCase(),
        panNumber: panNumber.toUpperCase(),
        address: fullAddress,
        email: email,
        phone: mobile,
        website: website,
        bankName: bankName,
        accountNumber: accountNumber,
        bankIfsc: bankIfsc.toUpperCase(),
        bankBranch: city, // proxy
        upiId: upiId
      };

      onUpdateProfile(payload);
      setSavedSuccess("Business Profile settings stored correctly with GSTR compliance!");
    } else if (activeTab === 'invoice') {
      setSavedSuccess("Invoice billing prefix, templates, and signature properties saved!");
    } else if (activeTab === 'tax') {
      setSavedSuccess("GST slab mappings and LUT credentials updated!");
    } else {
      setSavedSuccess("Configuration properties updated successfully!");
    }

    setTimeout(() => {
      setSavedSuccess(null);
    }, 4000);
  };

  // List of tabs inside Settings Panel
  const navTabs = [
    { id: 'profile', label: 'Business Profile', icon: Building2 },
    { id: 'invoice', label: 'Invoice Settings', icon: FileText },
    { id: 'tax', label: 'Tax Settings', icon: Percent },
    { id: 'bank', label: 'Bank & Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Users & Access', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Cpu },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing & Plan', icon: Coins },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12" id="settings-unified-container">
      
      {/* SUCCESS TOAST FLYOUT */}
      {savedSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-slate-700 text-white font-bold text-xs px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-slide-in" id="settings-success-toast">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="border-b border-slate-150 pb-5">
        <h1 className="text-2xl font-black text-slate-850 tracking-tight">SaaS Settings Panel</h1>
        <p className="text-xs text-slate-500 mt-1">Configure GSTR-1 parameters, billing sequences, active bank transfers, team roles, and system integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SUB-NAVIGATION DIRECTIVE (RESPONSIVE SUB-NAV) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          
          {/* Vertical layout for Desktop */}
          <nav className="hidden lg:flex flex-col space-y-1.5" aria-label="Settings sub-tabs">
            <span className="px-3.5 py-1.5 text-[9.5px] uppercase font-black tracking-wider text-slate-400">Settings Sub-Navigation</span>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-all select-none cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Horizontal scroll layout for Mobile devices */}
          <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-none pb-1" aria-label="Mobile settings tabs">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all select-none cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-slate-50 text-slate-650 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-current shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* RIGHT WORKPLACE AREA */}
        <div className="lg:col-span-9">
          <form onSubmit={handleSaveChangesSubmit} className="space-y-6">

            {/* ------------------- TAB 1: BUSINESS PROFILE ------------------- */}
            {activeTab === 'profile' && (
              <div className="space-y-6" id="business-profile-tab-view">
                
                {/* Visual Identity Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                    Business Profile Identity
                  </h3>

                  {/* LOGO DRAG-DROP AREA */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-650 block">Company Brand Logo</label>
                    <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50/60 border border-slate-200 border-dashed rounded-xl p-5 text-center transition-all hover:bg-slate-50">
                      
                      {logoPreview ? (
                        <div className="relative group shrink-0">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="w-20 h-20 object-contain rounded-lg border border-slate-200 bg-white p-1"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={clearLogo}
                            className="absolute -top-2 -right-2 bg-rose-550 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-lg transition-colors cursor-pointer"
                            title="Remove Logo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 font-black text-xl shrink-0">
                          Logo
                        </div>
                      )}

                      <div className="text-left space-y-1.5 flex-1 w-full">
                        <p className="text-xs font-bold text-slate-700">Drag &amp; drop your logo file or upload manually</p>
                        <p className="text-[10px] text-slate-450">Supports PNG, JPG, or SVG. Minimum 200x200px recommended.</p>
                        
                        <div className="flex gap-2">
                          <label className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-3xs inline-flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-blue-600" />
                            <span>Upload Logo</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleLogoUpload} 
                            />
                          </label>
                          {logoPreview && (
                            <button
                              type="button"
                              onClick={clearLogo}
                              className="border border-red-200 hover:bg-red-50 text-red-650 text-xs font-bold py-1.5 px-3 rounded-lg transition-all"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2-COLUMN IDENTITY GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Business Name *</label>
                      <input 
                        type="text"
                        placeholder="e.g. SupaBuyer Enterprises Private Limited"
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-bold focus:outline-none transition-all shadow-3xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Display Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. SupaBuyer"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-bold focus:outline-none transition-all shadow-3xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">GST Number *</label>
                      <input 
                        type="text"
                        maxLength={15}
                        placeholder="e.g. 27ABCDE1234F1Z5"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-mono font-bold uppercase focus:outline-none transition-all shadow-3xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">PAN Number</label>
                      <input 
                        type="text"
                        maxLength={10}
                        placeholder="e.g. ABCDE1234F"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-mono font-bold uppercase focus:outline-none transition-all shadow-3xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Business Type</label>
                      <select
                        value={bizType}
                        onChange={(e) => setBizType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-bold focus:outline-none transition-all shadow-3xs text-slate-800"
                      >
                        <option value="Proprietorship">Proprietorship</option>
                        <option value="Partnership">Partnership LLC</option>
                        <option value="Private Limited">Private Limited Company</option>
                        <option value="Public Limited">Public Limited</option>
                        <option value="Unregistered">Unregistered Business</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Industry</label>
                      <input 
                        type="text"
                        placeholder="e.g. IT, Manufacturing, Consultation"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-semibold focus:outline-none transition-all shadow-3xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Email *</label>
                      <input 
                        type="email"
                        placeholder="accounts@yourbusiness.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-bold focus:outline-none transition-all shadow-3xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Mobile *</label>
                      <input 
                        type="text"
                        placeholder="e.g. +91 9876543210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-bold focus:outline-none transition-all shadow-3xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input 
                          type="url"
                          placeholder="e.g. https://www.yourbusiness.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-semibold focus:outline-none transition-all shadow-3xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Established Year</label>
                      <input 
                        type="number"
                        placeholder="2024"
                        value={estYear}
                        onChange={(e) => setEstYear(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-semibold focus:outline-none transition-all shadow-3xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Address Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                    Registered Physical Office Address
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600">Address Line 1</label>
                      <input 
                        type="text"
                        placeholder="Suite 504, 5th Floor, Alpha Towers"
                        value={addrLine1}
                        onChange={(e) => setAddrLine1(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-semibold focus:outline-none shadow-3xs"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600">Address Line 2 (Optional)</label>
                      <input 
                        type="text"
                        placeholder="Hitech City, Lane 12"
                        value={addrLine2}
                        onChange={(e) => setAddrLine2(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-semibold focus:outline-none shadow-3xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">City</label>
                      <input 
                        type="text"
                        placeholder="Hyderabad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-semibold focus:outline-none shadow-3xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">State</label>
                        <select
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-2.5 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-bold focus:outline-none text-slate-805"
                        >
                          {INDIAN_STATES.map(s => (
                            <option key={s.code} value={`${s.code} - ${s.name}`}>
                              {s.code} - {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Pincode</label>
                        <input 
                          type="text"
                          maxLength={6}
                          placeholder="500081"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-mono font-bold focus:outline-none shadow-3xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Settlements Details Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                    Settlement Bank Coordinates
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Bank Name</label>
                      <input 
                        type="text"
                        placeholder="HDFC Bank Ltd"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-semibold focus:outline-none shadow-3xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Account Number</label>
                      <input 
                        type="text"
                        placeholder="5020004941031"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-mono font-bold focus:outline-none shadow-3xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">IFSC Code</label>
                      <input 
                        type="text"
                        maxLength={11}
                        placeholder="HDFC0000012"
                        value={bankIfsc}
                        onChange={(e) => setBankIfsc(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-mono font-bold uppercase focus:outline-none shadow-3xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Account Type</label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-bold focus:outline-none text-slate-805"
                      >
                        <option value="Current Account">Current Account (Business)</option>
                        <option value="Savings Account">Savings Account</option>
                        <option value="Cash Credit">Cash Credit / Overdraft</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600">Active Business UPI ID (VPA)</label>
                      <input 
                        type="text"
                        placeholder="supabuyer@hdfc"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-mono font-semibold focus:outline-none shadow-3xs"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ------------------- TAB 2: INVOICE SETTINGS ------------------- */}
            {activeTab === 'invoice' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-6" id="invoice-settings-tab-view">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                  Invoice Prefixes &amp; Templates
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm font-semibold">
                  <div className="space-y-1.5Col">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Invoice Number Format (Template) *</label>
                      <input 
                        type="text"
                        value={invoicePrefix}
                        onChange={(e) => setInvoicePrefix(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-mono font-bold focus:outline-none shadow-3xs text-blue-700"
                        required
                      />
                      <p className="text-[10px] text-slate-450 mt-1 font-medium">Use tags: <code className="font-bold bg-slate-100 px-1 py-0.5 rounded text-blue-600">{"{YEAR}"}</code> and <code className="font-bold bg-slate-100 px-1 py-0.5 rounded text-blue-600">{"{NUMBER}"}</code> to customize.</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Starting Document Sequence Number *</label>
                    <input 
                      type="number"
                      value={startingNumber}
                      onChange={(e) => setStartingNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-mono font-bold focus:outline-none shadow-3xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Default Due Days *</label>
                    <input 
                      type="number"
                      value={defaultDueDays}
                      onChange={(e) => setDefaultDueDays(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-bold focus:outline-none shadow-3xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Base ISO Currency Symbol</label>
                    <select
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-bold focus:outline-none text-slate-805"
                    >
                      <option value="INR">INR - Indian Rupee (₹)</option>
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                    </select>
                  </div>

                  {/* TEMPLATE PICKER THUMBNAILS CONTAINER */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-655 block">Invoice layout styling theme</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5" id="template-style-picker">
                      
                      {/* Thumbnail 1 */}
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate('classic-blue')}
                        className={`p-3 bg-white border rounded-xl shadow-xs text-left cursor-pointer transition-all ${
                          selectedTemplate === 'classic-blue' 
                            ? 'border-blue-650 bg-blue-50/20 ring-1 ring-blue-600' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full h-16 bg-blue-50 border border-blue-105 rounded-md mb-2 flex items-center justify-center">
                          <div className="w-10 h-1 rounded bg-blue-600 mb-1.5"></div>
                        </div>
                        <span className="text-[11px] font-black block text-slate-800">Classic Blue</span>
                        <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">Formal Indian standard GST layout</p>
                      </button>

                      {/* Thumbnail 2 */}
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate('emerald-modern')}
                        className={`p-3 bg-white border rounded-xl shadow-xs text-left cursor-pointer transition-all ${
                          selectedTemplate === 'emerald-modern' 
                            ? 'border-emerald-555 bg-emerald-50/10 ring-1 ring-emerald-600' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full h-16 bg-emerald-50 border border-emerald-100 rounded-md mb-2 flex items-center justify-center">
                          <div className="w-10 h-1 rounded bg-emerald-600 mb-1.5"></div>
                        </div>
                        <span className="text-[11px] font-black block text-slate-800">Emerald Clean</span>
                        <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">Tech startup style emerald palette</p>
                      </button>

                      {/* Thumbnail 3 */}
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate('cosmic-bold')}
                        className={`p-3 bg-white border rounded-xl shadow-xs text-left cursor-pointer transition-all ${
                          selectedTemplate === 'cosmic-bold' 
                            ? 'border-slate-850 bg-slate-50/50 ring-1 ring-slate-800' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full h-16 bg-slate-100 border border-slate-250 rounded-md mb-2 flex items-center justify-center">
                          <div className="w-10 h-1 rounded bg-slate-800 mb-1.5"></div>
                        </div>
                        <span className="text-[11px] font-black block text-slate-850">Cosmic Charcoal</span>
                        <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">High contrast dark display accents</p>
                      </button>

                    </div>
                  </div>

                  {/* DEFAULT NOTES & TERMS */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 block">Default Invoice Custom Notes</label>
                    <textarea 
                      rows={2}
                      placeholder="Default thank you message..."
                      value={defaultNotes}
                      onChange={(e) => setDefaultNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 block">Default Invoice Legal Terms &amp; Conditions</label>
                    <textarea 
                      rows={3}
                      placeholder="Standard transaction clauses..."
                      value={defaultTerms}
                      onChange={(e) => setDefaultTerms(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none font-medium text-slate-700"
                    />
                  </div>

                  {/* SIGNATURE UPLOAD COMPONENT */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-655 block">Authorized Digital Signature Stamp</label>
                    <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50/60 border border-slate-200 border-dashed rounded-xl p-5 text-center transition-all hover:bg-slate-50">
                      
                      {signaturePreview ? (
                        <div className="relative group shrink-0">
                          <img 
                            src={signaturePreview} 
                            alt="Signature preview" 
                            className="w-28 h-12 object-contain bg-white rounded border border-slate-200 p-1"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-lg transition-colors cursor-pointer"
                            title="Remove Signature"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-12 rounded bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-[10px] shrink-0 border border-dashed border-slate-300">
                          No Sig Approved
                        </div>
                      )}

                      <div className="text-left space-y-1.5 flex-1 w-full">
                        <p className="text-xs font-bold text-slate-700">Submit an authorized signee image (translucent background PNG preferred)</p>
                        
                        <div className="flex gap-2">
                          <label className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-3xs inline-flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-blue-600" />
                            <span>Upload Signature Stamp</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleSignatureUpload} 
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ------------------- TAB 3: TAX SETTINGS ------------------- */}
            {activeTab === 'tax' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-6" id="tax-settings-tab-view">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                  GST Tax Mappings &amp; LUT Credentials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-650">Default Business GST Rates</label>
                    <select
                      value={defaultGstRate}
                      onChange={(e) => setDefaultGstRate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-bold focus:outline-none text-slate-805 shadow-3xs"
                    >
                      <option value="18">18% GST Slab (Software / SaaS / Consultancy)</option>
                      <option value="12">12% GST Slab (Goods &amp; Printables)</option>
                      <option value="5">5% GST Slab (Standard Logistics)</option>
                      <option value="28">28% GST Slab (Luxury / Services)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-650 font-sans">Additional Cess Pct (%)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={cessPercentage}
                      onChange={(e) => setCessPercentage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 focus:border-blue-400 bg-white rounded-lg text-xs font-semibold focus:outline-none shadow-3xs"
                    />
                  </div>

                  <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wide block">Letter of Undertaking (LUT) Registry</span>
                        <p className="text-[10.5px] text-slate-450 font-medium">Export/SEZ supplies without payment of IGST under Bond/LUT</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsLutEnabled(!isLutEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          isLutEnabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                        id="lut-trigger-toggle"
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          isLutEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {isLutEnabled && (
                      <div className="space-y-1 mt-2 animate-fade-in">
                        <label className="text-xs font-bold text-slate-600">Active ARN / LUT Number ID</label>
                        <input 
                          type="text"
                          placeholder="LUT/2026-27/ARN001"
                          value={lutNumber}
                          onChange={(e) => setLutNumber(e.target.value)}
                          className="w-full max-w-sm px-3 py-2 border border-slate-200 hover:border-slate-305 focus:border-blue-400 bg-white rounded-lg text-xs font-mono font-bold uppercase focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------- TAB 4: BANK & SETTLEMENTS (DEDICATED PANEL VIEW) ------------------- */}
            {activeTab === 'bank' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-6" id="bank-payment-settings">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                  Active Payment Gateways &amp; UPI QR
                </h3>

                <div className="grid grid-cols-1 gap-4 text-xs font-semibold">
                  
                  <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-650" />
                      <span className="text-xs font-black text-blue-800">Dynamic QR Code Generation</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Your customers can scan generated UPI QR codes straight off the tax invoice PDF to process swift IMPS/UPI transfers directly into your corporate account:
                    </p>
                    <div className="bg-white px-3 py-2 border border-slate-150 rounded text-[11px] font-mono text-slate-700">
                      Active VPA: {upiId || "supabuyer@hdfc (Not set)"}
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800">Razorpay / Cashfree In-App SDK Link</span>
                      <p className="text-[10.5px] text-slate-450 mt-0.5">Collect digital credit card payments via unique system billing urls</p>
                    </div>
                    <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">CONFIGURE IN EXPERIMENTAL</span>
                  </div>

                </div>
              </div>
            )}

            {/* ------------------- TAB 5: NOTIFICATIONS ------------------- */}
            {activeTab === 'notifications' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-6" id="notifications-settings-tab-view">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                  In-App &amp; Email Notifications
                </h3>

                {/* CHECKLIST TOGGLE SWITCHES LIST */}
                <div className="space-y-4" id="notifications-control-group">
                  
                  {/* Toggle 1 */}
                  <div className="flex items-start justify-between border-b border-slate-50 pb-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">Payment Received</span>
                      <p className="text-[11px] text-slate-450 font-medium">Trigger instant alert SMS + email whenever a client clears outstanding invoices</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifPayment(!notifPayment)}
                      className={`w-10 h-5 md:w-11 md:h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        notifPayment ? 'bg-blue-650 bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 md:top-1 md:left-1 md:w-4 md:h-4 bg-white rounded-full transition-all ${
                        notifPayment ? 'translate-x-[20px] md:translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-start justify-between border-b border-slate-50 pb-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">Invoice Overdue Alerts</span>
                      <p className="text-[11px] text-slate-450 font-medium">Send automatic escalations to customer support desk on delayed balances</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifOverdue(!notifOverdue)}
                      className={`w-10 h-5 md:w-11 md:h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        notifOverdue ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 md:top-1 md:left-1 md:w-4 md:h-4 bg-white rounded-full transition-all ${
                        notifOverdue ? 'translate-x-[20px] md:translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 3 */}
                  <div className="flex items-start justify-between border-b border-slate-50 pb-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">New Customer Registered</span>
                      <p className="text-[11px] text-slate-450 font-medium">Inform account manager whenever a new GST customer card is logged</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifNewCustomer(!notifNewCustomer)}
                      className={`w-10 h-5 md:w-11 md:h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        notifNewCustomer ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 md:top-1 md:left-1 md:w-4 md:h-4 bg-white rounded-full transition-all ${
                        notifNewCustomer ? 'translate-x-[20px] md:translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 4 */}
                  <div className="flex items-start justify-between border-b border-slate-50 pb-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">Weekly Reports Compilation</span>
                      <p className="text-[11px] text-slate-450 font-medium">Deliver premium financial audits and GSTR sheets directly to physical accountant inbox</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifReportCompiled(!notifReportCompiled)}
                      className={`w-10 h-5 md:w-11 md:h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        notifReportCompiled ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 md:top-1 md:left-1 md:w-4 md:h-4 bg-white rounded-full transition-all ${
                        notifReportCompiled ? 'translate-x-[20px] md:translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 5 */}
                  <div className="flex items-start justify-between pb-1">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">GSTR-1 Monthly Filing Reminders</span>
                      <p className="text-[11px] text-slate-450 font-medium">Warn primary stakeholder on the 10th of every month for outstanding GSTR compliance checklist</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifGstrReminder(!notifGstrReminder)}
                      className={`w-10 h-5 md:w-11 md:h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        notifGstrReminder ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 md:top-1 md:left-1 md:w-4 md:h-4 bg-white rounded-full transition-all ${
                        notifGstrReminder ? 'translate-x-[20px] md:translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* ------------------- OTHER TABS (ACCESSIBILITY PLACEHOLDERS SHOWN BEAUTIFULLY) ------------------- */}
            {activeTab === 'users' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                  Users &amp; Access Roles
                </h3>
                <p className="text-xs text-slate-500 font-medium">Add members, team roles (Viewer, Editor, Owner) for shared bookkeeping.</p>
                <div className="border border-slate-150 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs text-slate-700">
                  <div className="p-3.5 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <span className="font-bold text-slate-800 block">Arnabbpandeyy007@gmail.com</span>
                      <span className="text-[10px] text-slate-400">Account Owner</span>
                    </div>
                    <span className="text-[10.5px] text-blue-650 bg-blue-50 px-2 py-0.5 rounded font-extrabold uppercase">Owner</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                  Developer Integrations
                </h3>
                <p className="text-xs text-slate-500 font-medium">Connect external inventory syncs or tax filing portals.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 block">Government GST Portal API</span>
                    <span className="text-[10.5px] text-slate-400">Reconcile e-Invoices in real-time.</span>
                    <span className="inline-block mt-2 text-[10px] uppercase font-black text-slate-400 leading-none">Not Linked</span>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 block">Gmail Workspace Auto-Courier</span>
                    <span className="text-[10.5px] text-slate-400">Dispatch PDF copies immediately.</span>
                    <span className="inline-block mt-2 text-[10px] uppercase font-black text-slate-405 leading-none">Not Linked</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                  Security &amp; Account Guard
                </h3>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <div>
                      <span className="font-bold block">Two-Factor Authenticator (2FA)</span>
                      <p className="text-[10.5px] text-slate-400 font-medium">Protect audit parameters using TOTP credentials</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setTwoFactor(!twoFactor)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        twoFactor ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${
                        twoFactor ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-650">Inactivity Timeout Session</label>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="w-full max-w-xs px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none bg-white text-slate-805 shadow-3xs"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes (Recommended)</option>
                      <option value="60">1 Hour</option>
                      <option value="none">Never Timeout</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                  SaaS Billing &amp; Subscription Plan
                </h3>

                <div className="p-4 border border-blue-100 bg-blue-50/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-extrabold text-blue-800 text-sm block">SupaBuyer Enterprise Pro</span>
                    <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">Complimentary developer test tier — All GSTR components unlocked</p>
                  </div>
                  <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 rounded px-2.5 py-1 font-black uppercase">Active Free Tier</span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Account usage stats</span>
                  <div className="flex justify-between border-b border-slate-50 pb-1.5">
                    <span>Generated Invoices Limit Usage</span>
                    <span className="font-bold text-slate-900">Unrestricted</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-1.5">
                    <span>Tax Reports Compile Duration</span>
                    <span className="font-bold text-slate-900">Unlimited Unlimited</span>
                  </div>
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON WITH FLEX RECEPTACLE */}
            <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200/65 rounded-xl p-4 shadow-3xs" id="settings-save-row">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>GST Tax Compliant GSTR safe storage.</span>
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-black py-2 px-5 rounded-lg text-xs transition-all shadow flex items-center gap-1.5 select-none cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
