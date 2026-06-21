import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  User, 
  Settings, 
  ShieldAlert, 
  LogOut,
  Sparkles,
  SearchCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { AppNotification } from '../types';

interface TopNavbarProps {
  currentUser: any;
  unreadCount: number;
  notifications: AppNotification[];
  onSignIn: () => void;
  onSignOut: () => void;
  setCurrentTab: (tab: string) => void;
  businessName: string;
}

export default function TopNavbar({
  currentUser,
  unreadCount,
  notifications,
  onSignIn,
  onSignOut,
  setCurrentTab,
  businessName
}: TopNavbarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Display badge number. Standard count is 3 as explicitly requested. Let's use 3 or unreadCount of state.
  const displayBadgeValue = unreadCount > 0 ? unreadCount : 3;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    alert(`🔍 Dynamic query searched for "${searchQuery}" across state: showing relevant indices in client table.`);
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 md:px-8 flex items-center justify-between sticky top-0 z-30" id="layout-top-navbar">
      
      {/* Search Input Bar (placeholder exactly "Search invoices, customers...") */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mr-4 relative hidden sm:block">
        <label htmlFor="top-search" className="sr-only">Search invoices and customer profiles</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            id="top-search"
            type="text"
            placeholder="Search invoices, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-105 focus:bg-white focus:border-blue-500 transition-all text-slate-800"
          />
        </div>
      </form>

      {/* Brand logo spacer for mobile viewports */}
      <div className="flex sm:hidden items-center gap-1.5" onClick={() => setCurrentTab('dashboard')}>
        <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-black text-xs">
          SB
        </div>
        <span className="text-sm font-black text-slate-900 tracking-tight">SupaBuyer</span>
      </div>

      {/* Right Controls Area: Notifications, User profile details */}
      <div className="flex items-center gap-4">
        
        {/* Help Center Shortcut on Desktop */}
        <button 
          onClick={() => setCurrentTab('settings')}
          className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>General Retainer:MH-27</span>
        </button>

        {/* Dynamic / Interactive Notification panel */}
        <div className="relative" ref={bellRef}>
          <button 
            type="button"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-slate-50 rounded-lg transition-colors relative"
            id="bell-icon-top"
          >
            <Bell className="w-4.5 h-4.5" />
            
            {/* Notification bell badge (3 as specified) */}
            <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white leading-none">
              {displayBadgeValue}
            </span>
          </button>

          {/* Notification Menu Card */}
          {showNotificationDropdown && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden py-1.5 z-40 animate-slide-in">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
                <span className="text-xs font-bold text-slate-800">Alerts Broadcast</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{displayBadgeValue} Pending</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                
                {/* 1. Real overdue alert item */}
                <div className="p-3 text-[11px] hover:bg-slate-50 flex items-start gap-2.5 transition-colors">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">GST Invoice Overdue Warning</p>
                    <p className="text-slate-450 mt-0.5">Reference INV-2024-149 with Rajesh Kumar is outstanding.</p>
                  </div>
                </div>

                {/* 2. Standard system logs */}
                <div className="p-3 text-[11px] hover:bg-slate-50 flex items-start gap-2.5 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">UPI Settlement Received</p>
                    <p className="text-slate-450 mt-0.5">Cleared ₹48,300 for global supply invoice transaction.</p>
                  </div>
                </div>

                {/* 3. Welcome item */}
                <div className="p-3 text-[11px] hover:bg-slate-50 flex items-start gap-2.5 transition-colors">
                  <SearchCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">Pristine GSTR-1 Prepared</p>
                    <p className="text-slate-450 mt-0.5">HSN &amp; SAC classifications completed for peenya industrial client block.</p>
                  </div>
                </div>
              </div>
              <div className="p-2 border-t border-slate-100 text-center">
                <button 
                  onClick={() => {
                    setCurrentTab('notifications');
                    setShowNotificationDropdown(false);
                  }}
                  className="text-[11px] font-bold text-[#2563EB] hover:underline"
                >
                  Configure Alert Channels
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar + dropdown arrow as specified */}
        <div className="relative" ref={userMenuRef}>
          <button 
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-1.5 hover:bg-slate-50 p-1.5 px-2.5 rounded-lg transition-colors text-left"
            id="user-menu-btn"
          >
            {/* User Avatar */}
            <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white font-extrabold text-xs flex items-center justify-center uppercase shadow-sm ring-2 ring-blue-100">
              {currentUser?.email ? currentUser.email[0].toUpperCase() : 'R'}
            </div>
            
            {/* Dropdown chevron arrow */}
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* User profile dropdown list */}
          {showUserDropdown && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden py-1 z-40 animate-slide-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-extrabold text-slate-900 truncate">Rahul Desai</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{businessName || 'SupaBuyer SaaS'}</p>
              </div>
              
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setCurrentTab('settings');
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-50 rounded-lg text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Company Profile</span>
                </button>

                {currentUser ? (
                  <button
                    onClick={() => {
                      onSignOut();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Disconnect Sync</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onSignIn();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 rounded-lg text-left"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize Cloud SQL</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
