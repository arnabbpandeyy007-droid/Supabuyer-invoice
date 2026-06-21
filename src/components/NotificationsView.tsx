import React from 'react';
import { Bell, Check, CheckCircle2, ShieldAlert, Info, Trash } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
}

export default function NotificationsView({ 
  notifications, 
  onMarkAllRead, 
  onClearNotifications 
}: NotificationsViewProps) {
  return (
    <div className="space-y-8 animate-fade-in" id="notifications-view">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-sm text-slate-500 mt-1">Audit status reports, late payment warnings, and database compliance logs YTD.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 border border-slate-200 rounded-lg text-xs transition-colors shadow-sm"
          >
            <Check className="w-4 h-4 text-slate-400" />
            Mark all as read
          </button>
          <button 
            onClick={onClearNotifications}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold py-2 px-3 border border-slate-200 rounded-lg text-xs transition-colors"
          >
            <Trash className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Grid listing */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-150">
        
        {notifications.map((notif) => {
          let icon = <Info className="w-5 h-5 text-blue-500" />;
          let bg = 'bg-blue-50/20';
          if (notif.type === 'success') {
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            bg = 'bg-emerald-50/20';
          } else if (notif.type === 'warning') {
            icon = <ShieldAlert className="w-5 h-5 text-amber-500" />;
            bg = 'bg-amber-50/20';
          } else if (notif.type === 'error') {
            icon = <ShieldAlert className="w-5 h-5 text-red-500" />;
            bg = 'bg-red-50/20';
          }

          return (
            <div 
              key={notif.id} 
              className={`p-5 flex items-start gap-4 transition-all
                ${notif.isRead ? 'bg-white opacity-70' : 'bg-slate-50/50'}
              `}
            >
              <div className={`p-2.5 rounded-xl border border-slate-100 shrink-0 ${bg}`}>
                {icon}
              </div>
              <div className="space-y-1 flex-1">
                <p className={`text-sm ${notif.isRead ? 'text-slate-600 font-medium' : 'text-slate-900 font-semibold'}`}>
                  {notif.message}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {new Date(notif.timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {!notif.isRead && (
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 mt-2" />
              )}
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="py-16 text-center text-slate-400 font-medium">
            <Bell className="w-12 h-12 text-slate-250 stroke-1 mx-auto mb-3" />
            No new reminders.
          </div>
        )}

      </div>

    </div>
  );
}
