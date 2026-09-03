import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Activity } from 'lucide-react';
import { useTraceStore } from '@/lib/store';

export function TelemetryChart() {
  const { feedbackList } = useTraceStore();

  const chartData = useMemo(() => {
    if (feedbackList.length === 0) {
      return [];
    }

    // Group real feedback by date
    const dateMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 5);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dateMap[label] = 0;
    }

    feedbackList.forEach(item => {
      const d = new Date(item.sourceCreatedAt || item.importedAt);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (dateMap[label] !== undefined) {
        dateMap[label] += 1;
      } else {
        // Find closest bucket
        const keys = Object.keys(dateMap);
        const lastKey = keys[keys.length - 1];
        if (lastKey) dateMap[lastKey] += 1;
      }
    });

    // Plot exact persisted feedback counts per date bucket
    const entries = Object.entries(dateMap).map(([period, count]) => ({
      period,
      feedbackCount: count
    }));

    return entries;
  }, [feedbackList]);

  const hasData = chartData.length > 0 && feedbackList.length > 0;

  return (
    <div className="p-4 rounded-xl surface-card space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/8 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] flex items-center justify-center">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#64748B] uppercase tracking-wider">
            FEEDBACK VELOCITY TREND
          </h2>
        </div>
        {hasData && (
          <span className="text-[10px] font-mono font-bold text-[#2E8B75] dark:text-[#10B981] px-2 py-0.5 rounded-full bg-[#2E8B75]/10 border border-[#2E8B75]/20">
            Live Telemetry
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="h-44 flex flex-col items-center justify-center text-center p-4 space-y-2 border border-dashed border-slate-200 dark:border-white/8 rounded-lg text-xs text-slate-400 dark:text-[#64748B]">
          <Activity className="w-5 h-5 text-slate-400 dark:text-[#64748B]" />
          <p className="font-semibold text-slate-700 dark:text-[#EDEDED]">No Telemetry Recorded</p>
          <p className="text-[11px] max-w-xs">Ingest customer feedback to automatically generate feedback velocity and volume curves.</p>
        </div>
      ) : (
        <div className="h-44 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="velocityTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E8B75" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2E8B75" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200/80 dark:stroke-white/6"
                vertical={false}
              />
              <XAxis
                dataKey="period"
                className="text-slate-400 dark:text-[#64748B] font-mono"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-slate-400 dark:text-[#64748B] font-mono"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#13151A',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#EDEDED',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ padding: '2px 0', color: '#10B981', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="feedbackCount"
                name="Feedback Volume"
                stroke="#2E8B75"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#velocityTeal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
