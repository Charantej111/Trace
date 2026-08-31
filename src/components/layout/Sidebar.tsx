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
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { workspace, feedbackList, painPoints, opportunities, roadmapItems, decisions } = useTraceStore();

  const suggestedOppsCount = opportunities.filter(o => o.status === 'suggested').length;
  const criticalFeedCount = feedbackList.filter(f => f.atoms?.some(a => a.severity === 'critical')).length;
  const emergingCount = painPoints.filter(p => p.isEmerging).length;

  const navGroups = [
    {
      label: 'INTELLIGENCE',
      items: [
        { name: 'Overview', href: '/', icon: LayoutDashboard },
        {
          name: 'Feedback Inbox',
          href: '/inbox',
          icon: Inbox,
          badge: criticalFeedCount > 0 ? `${criticalFeedCount} critical` : `${feedbackList.length}`,
          badgeVariant: criticalFeedCount > 0 ? 'critical' : 'neutral'
        },
        { name: 'Feedback Explorer', href: '/feedback', icon: MessageSquare },
        {
          name: 'Problem Clusters',
          href: '/insights',
          icon: Zap,
          badge: emergingCount > 0 ? `${emergingCount} spike` : `${painPoints.length}`,
          badgeVariant: emergingCount > 0 ? 'critical' : 'indigo'
        }
      ]
    },
    {
      label: 'DECISION & ROADMAP',
      items: [
        {
          name: 'Opportunities',
          href: '/opportunities',
          icon: Target,
          badge: suggestedOppsCount > 0 ? `${suggestedOppsCount}` : undefined,
          badgeVariant: 'amber'
        },
        { name: 'Roadmap Telemetry', href: '/roadmap', icon: Kanban, badge: `${roadmapItems.length}` },
        { name: 'Decision Memory (PDR)', href: '/decisions', icon: History, badge: `${decisions.length}` }
      ]
    },
    {
      label: 'CONFIGURATION',
      items: [
        { name: 'Data Sources', href: '/sources', icon: Database },
        { name: 'Strategic Context', href: '/settings/context', icon: Sliders }
      ]
    }
  ];

  return (
    <aside className="w-60 bg-slate-50/70 dark:bg-[#090b10] border-r border-slate-200/80 dark:border-[#1a1e2b] flex flex-col justify-between shrink-0 h-screen sticky top-0 text-[13px] select-none shadow-xs">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="px-4 py-3.5 border-b border-slate-200/70 dark:border-[#171b26] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-white text-sm">
              Trace
            </span>
          </Link>
        </div>

        {/* Workspace Display */}
        <div className="p-3 border-b border-slate-200/70 dark:border-[#171b26]">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#0f121a] border border-slate-200/80 dark:border-[#1e2333] shadow-xs">
            <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-[#1a2030] text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              {workspace.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate leading-tight">
                {workspace.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {workspace.productCategory || 'Workspace'}
              </p>
            </div>
          </div>
        </div>

        {/* Grouped Navigation Links */}
        <div className="p-3 space-y-4 flex-1 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <span className="px-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider font-mono">
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
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs ring-1 ring-indigo-200 dark:ring-indigo-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-[#131620]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                            isActive
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-numbers font-bold ${
                            item.badgeVariant === 'critical'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                              : item.badgeVariant === 'amber'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                              : item.badgeVariant === 'indigo'
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40'
                              : 'bg-slate-100 dark:bg-[#171b26] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'
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
      </div>
    </aside>
  );
}
