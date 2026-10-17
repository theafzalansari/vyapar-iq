import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AppAuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AppsPage } from './pages/AppsPage';
import { CopilotPage } from './pages/CopilotPage';
import { DashboardPage } from './pages/DashboardPage';
import { FindingsPage } from './pages/FindingsPage';
import { LandingPage } from './pages/LandingPage';
import { NetworkPage } from './pages/NetworkPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TransactionsPage } from './pages/TransactionsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppAuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Authenticated Application Shell */}
              <Route element={<Layout />}>
                <Route path="/apps" element={<AppsPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/findings" element={<FindingsPage />} />
                <Route path="/network" element={<NetworkPage />} />
                <Route path="/copilot" element={<CopilotPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback to Public Landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppAuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
