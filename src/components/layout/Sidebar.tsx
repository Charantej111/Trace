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
  Layers,
  Settings,
  UserCheck
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { workspace, feedbackList, painPoints, opportunities, roadmapItems, decisions } = useTraceStore();

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
    <aside className="w-56 bg-slate-100/80 dark:bg-[#0B0F17] border-r border-slate-200 dark:border-[#1E293B] flex flex-col justify-between shrink-0 h-screen sticky top-0 text-xs select-none">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand & Workspace Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-[#1E293B] space-y-2.5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#1E293B] dark:bg-[#F8FAFC] flex items-center justify-center text-white dark:text-[#0F172A] font-black text-xs">
              T
            </div>
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-sm">
              TRACE
            </span>
          </Link>

          <div className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155]">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                {workspace.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                {workspace.productCategory || 'Product Platform'}
              </p>
            </div>
          </div>
        </div>

        {/* Grouped Navigation Links */}
        <div className="p-2.5 space-y-4 flex-1 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <span className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider font-mono">
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
                          ? 'bg-slate-200/80 dark:bg-[#1E293B] text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-[#1E293B]/50 font-normal'
                      }`}
                    >
                      {/* Active Indicator Line */}
                      {isActive && (
                        <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#2E8B75] dark:bg-[#3B9B85] rounded-r"></div>
                      )}

                      <div className="flex items-center gap-2.5 min-w-0 pl-1">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                            isActive
                              ? 'text-[#2E8B75] dark:text-[#3B9B85]'
                              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                            item.badgeVariant === 'critical'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                              : item.badgeVariant === 'amber'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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

        {/* Sidebar Footer */}
        <div className="p-2.5 border-t border-slate-200 dark:border-[#1E293B] space-y-1">
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-200/50 dark:hover:bg-[#1E293B]/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px]">
                PM
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate leading-none">
                  Product Lead
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Acme Inc.
                </p>
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
          </div>
        </div>
      </div>
    </aside>
  );
}
