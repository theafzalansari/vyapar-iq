import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AppAuthProvider } from './context/AuthContext';
import { CopilotPage } from './pages/CopilotPage';
import { DashboardPage } from './pages/DashboardPage';
import { FindingsPage } from './pages/FindingsPage';
import { LandingPage } from './pages/LandingPage';
import { NetworkPage } from './pages/NetworkPage';
import { ReportsPage } from './pages/ReportsPage';
import { TransactionsPage } from './pages/TransactionsPage';

export const App: React.FC = () => {
  return (
    <AppAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated Application Shell */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/findings" element={<FindingsPage />} />
            <Route path="/copilot" element={<CopilotPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Fallback to Public Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppAuthProvider>
  );
};

export default App;
