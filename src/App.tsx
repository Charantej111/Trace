import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { OverviewPage } from '@/pages/OverviewPage';
import { AuditPage } from '@/pages/AuditPage';
import { InboxPage } from '@/pages/InboxPage';
import { FeedbackPage } from '@/pages/FeedbackPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { OpportunitiesPage } from '@/pages/OpportunitiesPage';
import { DecisionsPage } from '@/pages/DecisionsPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { SourcesPage } from '@/pages/SourcesPage';
import { StrategicContextPage } from '@/pages/StrategicContextPage';

export function App() {
  return (
    <AppShell>
      <CommandPalette />
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/decisions" element={<DecisionsPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/settings/context" element={<StrategicContextPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;
