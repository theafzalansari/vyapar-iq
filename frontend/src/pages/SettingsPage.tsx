import React, { useState } from 'react';
import {
  Moon,
  Save,
  Sun,
  User,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAppAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export interface BusinessProfileSettings {
  businessName: string;
  gstin: string;
  pan: string;
  industry: string;
  currency: string;
  dateFormat: string;
  defaultScope: 'reconciliation' | 'anomalies' | 'gst';
  includeDisclaimer: boolean;
}

const SETTINGS_STORAGE_KEY = 'vyapariq_business_profile';

export const SettingsPage: React.FC = () => {
  const { user, isMockMode } = useAppAuth();
  const { theme, setTheme } = useTheme();
  const { success } = useToast();

  const [settings, setSettings] = useState<BusinessProfileSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      businessName: 'Ansari Textiles & Trading Co.',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      industry: 'Textile Wholesale & Distribution',
      currency: 'INR',
      dateFormat: 'YYYY-MM-DD',
      defaultScope: 'reconciliation',
      includeDisclaimer: true,
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      success('Company profile & preferences saved successfully.', 'Settings Updated');
    } catch {
      alert('Failed to save settings to browser storage.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Company & Workspace Settings
            </h1>
            <Badge variant="primary">Configuration</Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage entity identifiers, GST compliance profile, appearance, and export defaults.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
          <Save size={15} /> Save Settings
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Business Entity Profile Card */}
        <Card
          title="Business Legal Entity & Tax Identifiers"
          subtitle="Appears on all generated audit report packs, workpapers, and invoice exports"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginTop: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Registered Business Name
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Goods and Services Tax ID (GSTIN)
              </label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Permanent Account Number (PAN)
              </label>
              <input
                type="text"
                value={settings.pan}
                onChange={(e) => setSettings({ ...settings, pan: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Sector / Industry Classification
              </label>
              <input
                type="text"
                value={settings.industry}
                onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </Card>

        {/* Appearance & Theme Customization */}
        <Card
          title="Display & Theme Preferences"
          subtitle="Persistent user interface styling across all workspace screens"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Theme Mode
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: theme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border-card)',
                    backgroundColor: theme === 'dark' ? 'var(--primary-light)' : 'var(--bg-card)',
                    color: theme === 'dark' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Moon size={16} /> Dark Navy
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border-card)',
                    backgroundColor: theme === 'light' ? 'var(--primary-light)' : 'var(--bg-card)',
                    color: theme === 'light' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Sun size={16} /> Clean Light
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Ledger Currency Symbol
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Audit & Report Defaults */}
        <Card
          title="Export & Compliance Defaults"
          subtitle="Configure default scope and disclaimers for PDF and CSV generation"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  Statutory Accounting Disclaimer
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Mandatory notice stating anomalies represent variance requiring review and do not prove fraud.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.includeDisclaimer}
                onChange={(e) => setSettings({ ...settings, includeDisclaimer: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Default Workpaper Scope
              </label>
              <select
                value={settings.defaultScope}
                onChange={(e) => setSettings({ ...settings, defaultScope: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              >
                <option value="reconciliation">Reconciliation Pack (Bank vs Ledger Matching)</option>
                <option value="anomalies">Dispute Evidence Pack (Duplicates & Outliers)</option>
                <option value="gst">GST / Tax Prep Schedule (GSTR-3B ITC)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Authenticated Identity Information */}
        <Card title="Security & Authentication Status">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  {user?.fullName || 'User'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {user?.primaryEmailAddress?.emailAddress || 'User ID: ' + (user?.id || 'unknown')}
                </div>
              </div>
            </div>

            <div>
              {isMockMode ? (
                <Badge variant="warning">Dev Mock Session</Badge>
              ) : (
                <Badge variant="success">Clerk JWT Active</Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
