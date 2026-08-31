import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  MessageSquare,
  Zap,
  Target,
  Kanban,
  History,
  Database,
  Sliders,
  Settings
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { feedbackList, opportunities, roadmapItems, decisions } = useTraceStore();

  const suggestedOppsCount = opportunities.filter(o => o.status === 'suggested').length;
  const criticalFeedCount = feedbackList.filter(f => f.atoms?.some(a => a.severity === 'critical')).length;

  const navGroups = [
    {
      label: 'WORKSPACE',
      items: [
        { name: 'Overview', href: '/', icon: LayoutDashboard },
        {
          name: 'Inbox',
          href: '/inbox',
          icon: Inbox,
          badge: criticalFeedCount > 0 ? `${criticalFeedCount} critical` : `${feedbackList.length}`,
          badgeVariant: criticalFeedCount > 0 ? 'critical' : 'neutral'
        },
        { name: 'Feedback', href: '/feedback', icon: MessageSquare },
        { name: 'Insights', href: '/insights', icon: Zap },
        {
          name: 'Opportunities',
          href: '/opportunities',
          icon: Target,
          badge: suggestedOppsCount > 0 ? `${suggestedOppsCount}` : undefined,
          badgeVariant: 'amber'
        },
        { name: 'Roadmap', href: '/roadmap', icon: Kanban, badge: `${roadmapItems.length}` },
        { name: 'Decisions', href: '/decisions', icon: History, badge: `${decisions.length}` }
      ]
    },
    {
      label: 'DATA',
      items: [
        { name: 'Sources', href: '/sources', icon: Database }
      ]
    },
    {
      label: 'CONFIGURATION',
      items: [
        { name: 'Product Context', href: '/settings/context', icon: Sliders }
      ]
    }
  ];

  return (
    <aside className="w-56 bg-slate-50 dark:bg-[#0C0D10] border-r border-slate-200 dark:border-[#1A1D24] flex flex-col justify-between shrink-0 h-screen sticky top-0 text-xs select-none">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Clean Brand Header */}
        <div className="p-3.5 border-b border-slate-200/80 dark:border-[#1A1D24]">
          <Link to="/" className="flex items-center gap-2.5 px-1 group">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 shadow-xs ring-1 ring-slate-200 dark:ring-white/10 shrink-0">
              <img
                src="/trace logo.png"
                alt="Trace Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-[#EDEDED] text-sm uppercase font-mono">
              TRACE
            </span>
          </Link>
        </div>

        {/* Grouped Navigation Links */}
        <div className="p-2 space-y-3.5 flex-1 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-0.5">
              <span className="px-2 text-[9px] font-mono font-semibold text-slate-400 dark:text-[#525866] tracking-widest uppercase">
                {group.label}
              </span>

              <div className="space-y-0.5 pt-0.5">
                {group.items.map((item) => {
                  const isActive = item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        isActive
                          ? 'bg-slate-200/80 dark:bg-[#181B22] text-slate-900 dark:text-[#EDEDED] font-semibold'
                          : 'text-slate-600 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#14171E] font-medium'
                      }`}
                    >
                      {/* Active Indicator Line */}
                      {isActive && (
                        <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#2E8B75] dark:bg-[#10B981] rounded-r"></div>
                      )}

                      <div className="flex items-center gap-2.5 min-w-0 pl-1">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                            isActive
                              ? 'text-[#2E8B75] dark:text-[#10B981]'
                              : 'text-slate-400 dark:text-[#525866] group-hover:text-slate-600 dark:group-hover:text-[#8C92A4]'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold ${
                            item.badgeVariant === 'critical'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                              : item.badgeVariant === 'amber'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
                              : 'bg-slate-200/80 dark:bg-[#1C2029] text-slate-600 dark:text-[#8C92A4]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-slate-200/80 dark:border-[#1A1D24]">
          <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#14171E] transition-colors cursor-pointer">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-full bg-[#1E293B] text-white dark:bg-[#EDEDED] dark:text-[#090A0C] flex items-center justify-center font-bold text-[9px] font-mono">
                PL
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-[#EDEDED] text-xs truncate leading-none">
                  Product Lead
                </p>
                <p className="text-[10px] text-slate-500 dark:text-[#525866] truncate font-mono mt-0.5">
                  Acme Inc.
                </p>
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:text-[#525866] dark:hover:text-[#8C92A4]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
