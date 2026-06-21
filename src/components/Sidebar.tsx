import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  Sparkles, 
  CreditCard,
  FileText,
  Settings, 
  HelpCircle, 
  Moon, 
  Sun,
  User,
  LogOut,
  LogIn
} from 'lucide-react';
import { BusinessProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  businessProfile: BusinessProfile;
  unreadCount: number;
  currentUser: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  businessProfile, 
  unreadCount,
  currentUser,
  onSignIn,
  onSignOut
}: SidebarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // List of links precisely matching: Dashboard, Invoices, Customers, Products, Payments, Reports, Settings
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'clients', label: 'Customers', icon: Users }, // Trigger clients tab for Customers
    { id: 'products', label: 'Products', icon: Sparkles },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Optional toggle class on HTML element for seamless feel
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      {/* 1. DESKTOP SIDEBAR: Fixed left layout of exactly 240px width */}
      <aside 
        className="hidden md:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200"
        id="desktop-sidebar"
      >
        {/* Top Logo + Brand Wordmark */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-black text-base shadow-sm">
            SB
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-tight">SupaBuyer</h1>
            <p className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider">GST Invoicing</p>
          </div>
        </div>

        {/* Business and Avatar section exactly below Logo */}
        <div className="p-4 px-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-105 border border-blue-200 text-blue-700 font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
            {businessProfile.name ? businessProfile.name[0].toUpperCase() : 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-800 truncate" title={businessProfile.name}>
              {businessProfile.name || 'My business name'}
            </h3>
            <p className="text-[9.5px] text-slate-400 font-medium truncate">
              {businessProfile.gstNumber || 'No GST registered'}
            </p>
          </div>
        </div>

        {/* Nav list - Active: #DBEAFE bg, #2563EB text + icon, left border accent */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Map tab matching correctly
            const isTabActive = currentTab === item.id || (item.id === 'clients' && currentTab === 'clients') || (item.id === 'reports' && currentTab === 'reports');
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r-lg text-xs font-bold transition-all text-left border-l-4
                  ${isTabActive 
                    ? 'bg-[#DBEAFE] text-[#2563EB] border-[#2563EB] bg-opacity-70' 
                    : 'text-slate-500 hover:text-[#2563EB] hover:bg-slate-50 border-transparent'
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isTabActive ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Bar: Dark Mode trigger + Help Link / Auth actions */}
        <div className="p-4 border-t border-slate-100 space-y-3.5 bg-slate-50/20">
          
          {/* Dark Mode toggle */}
          <div className="flex items-center justify-between px-1.5">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              {isDarkMode ? <Moon className="w-3.5 h-3.5 text-indigo-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </span>
            <button 
              type="button"
              onClick={handleToggleDarkMode}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${isDarkMode ? 'bg-[#2563EB]' : 'bg-slate-350'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Help link exactly as specified */}
          <a 
            href="#help"
            onClick={(e) => {
              e.preventDefault();
              alert("🙋 SupaBuyer Premium Help Center is available 24x7! Raised request ID logged. Email support at billing@supabuyer.in");
            }}
            className="flex items-center gap-2 px-1.5 text-xs font-bold text-slate-500 hover:text-[#2563EB] transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Help &amp; Support</span>
          </a>

          {/* User connection status details */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-[9.5px] text-slate-400 font-bold truncate max-w-[110px]">
                  {currentUser.email}
                </span>
                <button 
                  type="button"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1 hover:text-red-650 text-slate-450 hover:bg-red-50 rounded"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={onSignIn}
                className="w-full text-center text-[10px] font-bold text-[#2563EB] hover:underline flex items-center justify-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                Sync database online
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM NAVIGATION TAB BAR */}
      {/* Collapses sidebar cleanly to bottom bar on mobile viewports as requested */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-30 w-full bg-white border-t border-slate-200 h-16 flex items-center justify-around z-40 px-2 shadow-2xl"
        id="mobile-tabbar"
      >
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all
            ${currentTab === 'dashboard' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-650'}`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentTab('invoices')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all
            ${currentTab === 'invoices' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-650'}`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span>Invoices</span>
        </button>

        <button
          onClick={() => setCurrentTab('clients')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all
            ${currentTab === 'clients' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-650'}`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Customers</span>
        </button>

        <button
          onClick={() => setCurrentTab('products')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all
            ${currentTab === 'products' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-650'}`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span>Products</span>
        </button>

        <button
          onClick={() => setCurrentTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all
            ${currentTab === 'settings' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-650'}`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>Settings</span>
        </button>
      </nav>
    </>
  );
}
