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
  Settings,
  ChevronDown,
  Sparkles,
  Sliders
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { feedbackList, painPoints, opportunities, decisions, roadmapItems } = useTraceStore();

  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Inbox', href: '/inbox', icon: Inbox, badge: `${feedbackList.length}` },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
    {
      name: 'Insights',
      href: '/insights',
      icon: Zap,
      badge: `${painPoints.length}`,
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
    },
    {
      name: 'Opportunities',
      href: '/opportunities',
      icon: Target,
      badge: `${opportunities.filter(o => o.status === 'suggested').length}`,
      badgeColor: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
    },
    { name: 'Roadmap', href: '/roadmap', icon: Kanban, badge: `${roadmapItems.length}` },
    { name: 'Decisions', href: '/decisions', icon: History, badge: `${decisions.length}` },
    { name: 'Sources', href: '/sources', icon: Database },
    { name: 'Settings', href: '/settings/context', icon: Settings }
  ];

  return (
    <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 text-[13px] select-none shadow-[1px_0_2px_rgba(0,0,0,0.01)]">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-slate-900 dark:text-slate-100 text-base tracking-tight group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base tracking-tight">Trace</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 font-mono">v2.0</span>
            </div>
          </Link>
        </div>

        {/* Workspace Identifier */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate leading-tight">Acme Cloud Platform</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Production Workspace</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-2 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-numbers font-bold ${
                    item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Strategic Context Indicator */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <Link
            to="/settings/context"
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-[11px]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="truncate">
                <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">Strategic Context</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Active & Weighting</p>
              </div>
            </div>
            <span className="text-[10px] px-1 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
              3 Goals
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
