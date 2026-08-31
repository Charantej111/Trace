import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DB_TIMESERIES_DATA } from '@/lib/server/db-seed';

export function TelemetryChart() {
  const [activeSeries, setActiveSeries] = useState<string>('all');

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Weekly Customer Struggle Telemetry (8-Week Timeseries)
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Real mention frequency trends grouped across key problem clusters.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono-numbers">
          <span className="text-slate-400">Range:</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
            Jul 7 – Aug 31, 2026
          </span>
        </div>
      </div>

      {/* Series Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={() => setActiveSeries('all')}
          className={`px-2.5 py-1 rounded-lg transition-colors font-semibold text-[11px] ${
            activeSeries === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Clusters
        </button>
        <button
          onClick={() => setActiveSeries('android')}
          className={`px-2.5 py-1 rounded-lg transition-colors font-semibold text-[11px] flex items-center gap-1.5 ${
            activeSeries === 'android'
              ? 'bg-rose-600 text-white'
              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          Android 15 Regression
        </button>
        <button
          onClick={() => setActiveSeries('upload')}
          className={`px-2.5 py-1 rounded-lg transition-colors font-semibold text-[11px] flex items-center gap-1.5 ${
            activeSeries === 'upload'
              ? 'bg-indigo-600 text-white'
              : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          PDF Upload Timeouts
        </button>
        <button
          onClick={() => setActiveSeries('billing')}
          className={`px-2.5 py-1 rounded-lg transition-colors font-semibold text-[11px] flex items-center gap-1.5 ${
            activeSeries === 'billing'
              ? 'bg-amber-600 text-white'
              : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Renewal Double-Charges
        </button>
        <button
          onClick={() => setActiveSeries('sso')}
          className={`px-2.5 py-1 rounded-lg transition-colors font-semibold text-[11px] flex items-center gap-1.5 ${
            activeSeries === 'sso'
              ? 'bg-sky-600 text-white'
              : 'text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          Okta SSO Loops
        </button>
      </div>

      {/* Chart container */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DB_TIMESERIES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorAndroid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBilling" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSso" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
            <XAxis
              dataKey="week"
              className="text-slate-400 dark:text-slate-500"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              className="text-slate-400 dark:text-slate-500"
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#f8fafc',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
              }}
              itemStyle={{ padding: '2px 0' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
              iconSize={8}
            />

            {(activeSeries === 'all' || activeSeries === 'upload') && (
              <Area
                type="monotone"
                name="PDF Upload Timeouts"
                dataKey="uploadCrashes"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUpload)"
              />
            )}

            {(activeSeries === 'all' || activeSeries === 'android') && (
              <Area
                type="monotone"
                name="Android 15 Regression Spike"
                dataKey="androidRegress"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAndroid)"
              />
            )}

            {(activeSeries === 'all' || activeSeries === 'billing') && (
              <Area
                type="monotone"
                name="Renewal Double-Charges"
                dataKey="billingErrors"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorBilling)"
              />
            )}

            {(activeSeries === 'all' || activeSeries === 'sso') && (
              <Area
                type="monotone"
                name="Okta SSO Loops"
                dataKey="ssoAuth"
                stroke="#0ea5e9"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorSso)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
