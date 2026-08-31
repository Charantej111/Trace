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
import { Activity } from 'lucide-react';
import { useTraceStore } from '@/lib/store';

export function TelemetryChart() {
  const { feedbackList } = useTraceStore();
  const hasData = DB_TIMESERIES_DATA && DB_TIMESERIES_DATA.length > 0;

  return (
    <div className="p-5 rounded-2xl surface-card space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1c2230] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center ring-1 ring-indigo-200 dark:ring-indigo-800/40 shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Customer Struggle Velocity
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Weekly verified complaint frequency trends across problem categories.
            </p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-6 space-y-2 border border-dashed border-slate-200 dark:border-[#1e2333] rounded-xl text-xs text-slate-400">
          <Activity className="w-6 h-6 text-slate-400" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No Telemetry Recorded Yet</p>
          <p className="text-[11px]">Ingest customer feedback statements to begin generating timeseries velocity metrics.</p>
        </div>
      ) : (
        <div className="h-64 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DB_TIMESERIES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200/80 dark:stroke-[#1a2030]"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                className="text-slate-400 dark:text-slate-500 font-mono"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1e2430' }}
              />
              <YAxis
                className="text-slate-400 dark:text-slate-500 font-mono"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1e2430' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(13, 15, 21, 0.95)',
                  borderColor: '#262f42',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#f8fafc'
                }}
                itemStyle={{ padding: '2px 0' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
