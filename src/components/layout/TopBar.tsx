import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Bell,
  RotateCcw,
  Shield,
  Search,
  ExternalLink,
  ChevronDown,
  Info,
  SlidersHorizontal,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettingsModal: () => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  onOpenMobileNav?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettingsModal,
  globalSearchQuery,
  setGlobalSearchQuery,
  onOpenMobileNav,
}) => {
  const { currentRole, setCurrentRole, resetDemoData, auditLogs, batches, addToast, theme, toggleTheme } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const tabTitles: Record<NavTab, { group: string; title: string; subtitle: string }> = {
    dashboard: {
      group: 'Overview',
      title: 'Warehouse Operations Overview',
      subtitle: 'Real-time commodity stock, ageing alerts, and FIFO queue monitoring',
    },
    // Inventory Management
    'inv-stock': {
      group: 'Inventory Management',
      title: 'Stock & Batches Register',
      subtitle: 'Comprehensive inventory register by commodity, bay stack, and moisture parameter',
    },
    'inv-receipts': {
      group: 'Inventory Management',
      title: 'Inward Receipts & Gate Verification',
      subtitle: 'Record fresh rake receipts, capture electronic moisture levels, and auto-quarantine lots',
    },
    'inv-ledger': {
      group: 'Inventory Management',
      title: 'Stock Movements & Ledger',
      subtitle: 'Double-entry traceable transaction journal tracking all inflows, outflows, and adjustments',
    },
    'inv-reconciliation': {
      group: 'Inventory Management',
      title: 'Physical Stock Reconciliation',
      subtitle: 'Floor count versus computerized balance audit and variance justification register',
    },
    // FIFO Operations
    'fifo-queue': {
      group: 'FIFO Operations',
      title: 'FIFO Allocation Priority Queue',
      subtitle: 'Deterministic rotation queue ordered strictly by arrival date (oldest stock first)',
    },
    'fifo-planning': {
      group: 'FIFO Operations',
      title: 'Dispatch Planning & Allocation Sandbox',
      subtitle: 'Simulate multi-batch allocations, model indent fulfillment, and preview drawdown impact',
    },
    'fifo-exceptions': {
      group: 'FIFO Operations',
      title: 'FIFO Exceptions & Deviation Log',
      subtitle: 'Traceable log of out-of-order allocations, physical obstacles, and bypass authorizations',
    },
    'fifo-approvals': {
      group: 'FIFO Operations',
      title: 'Approval Requests & Governance Desk',
      subtitle: 'Manager and Auditor sign-off for exceptions, variances, and quarantine status changes',
    },
    // Dispatch & Challans
    'dispatch-create': {
      group: 'Dispatch & Challans',
      title: 'Create Official Dispatch Order',
      subtitle: 'Automated oldest-batch drawdown and electronic Form PDS-12 delivery challan generator',
    },
    'dispatch-challans': {
      group: 'Dispatch & Challans',
      title: 'Digital Challans & Gate Passes Register',
      subtitle: 'Official civil supplies issue vouchers, vehicle gate passes, and delivery verification records',
    },
    'dispatch-tracking': {
      group: 'Dispatch & Challans',
      title: 'Fair Price Shop Delivery Tracking',
      subtitle: 'Real-time transit fleet status, waypoint milestones, and dealer receipt verification',
    },
    'dispatch-returns': {
      group: 'Dispatch & Challans',
      title: 'Returns & Transit Discrepancies',
      subtitle: 'Log bag damage, transit moisture loss, and return gate passes with salvage accounting',
    },
    // AI Intelligence
    'ai-copilot': {
      group: 'AI Intelligence',
      title: 'AI Inventory Copilot',
      subtitle: 'Interactive advisory desk providing instant grounded responses to grain stock queries',
    },
    'ai-risk': {
      group: 'AI Intelligence',
      title: 'Stock Risk & Ageing Projection',
      subtitle: 'Predictive analytics on grain moisture hazard, shelf-life deterioration, and buffer depletion',
    },
    'ai-anomaly': {
      group: 'AI Intelligence',
      title: 'Anomaly & Fraud Detection Scanner',
      subtitle: 'Automated scrutiny detecting balance discrepancies, bypassed FIFO rules, and weight surges',
    },
    'ai-reader': {
      group: 'AI Intelligence',
      title: 'Receipt & Challan OCR Document Reader',
      subtitle: 'Computer-vision digitization of mill rake weighbridge slips and dealer indents',
    },
    // Audit & Reports
    'audit-trail': {
      group: 'Audit & Reports',
      title: 'System Audit Ledger',
      subtitle: 'Immutable event log of inward receipts, status updates, and FIFO dispatches',
    },
    'rep-stock': {
      group: 'Audit & Reports',
      title: 'Stock Position & Valuation Report',
      subtitle: 'Official monthly closing stock summary, bay capacity utilization, and MSP valuation',
    },
    'rep-ageing': {
      group: 'Audit & Reports',
      title: 'Stock Ageing Stratification Report',
      subtitle: 'Age bracket analysis (0-30d, 31-60d, 61-90d, 90+d) and rotation priority index',
    },
    'rep-wastage': {
      group: 'Audit & Reports',
      title: 'Wastage & Loss Benchmark Analytics',
      subtitle: 'Handling loss, tare shrinkage, and transit spillage metrics against statutory limits',
    },
    // Administration
    'admin-users': {
      group: 'Administration',
      title: 'Users & Role Permission Matrix',
      subtitle: 'Segregation of duties between Warehouse Manager, Depot Operator, and Vigilance Auditor',
    },
    'admin-settings': {
      group: 'Administration',
      title: 'Depot Parameters & Configuration',
      subtitle: 'FCI Hubballi Base Depot #4 parameters, godown storage limit, and working hours',
    },
    'admin-approval-rules': {
      group: 'Administration',
      title: 'Approval Rules & Escalation Thresholds',
      subtitle: 'Institutional policy gates for dispatch volumes, moisture quarantine, and variance limits',
    },
    'admin-activity': {
      group: 'Administration',
      title: 'Notifications & System Telemetry Log',
      subtitle: 'Security event logs, IoT sensor gateways, and real-time depot heartbeat monitoring',
    },
    // Legacy Aliases
    stock: {
      group: 'Inventory Management',
      title: 'Stock & Batches Register',
      subtitle: 'Manage grain batches, record inward receipts, and track moisture parameters',
    },
    dispatch: {
      group: 'Dispatch & Challans',
      title: 'Create Official Dispatch Order',
      subtitle: 'Strict oldest-first batch allocation and automated digital challan generation',
    },
    challans: {
      group: 'Dispatch & Challans',
      title: 'Digital Challans & Gate Passes',
      subtitle: 'Official PDS Form-12 dispatches, gate passes, and delivery verification',
    },
    audit: {
      group: 'Audit & Reports',
      title: 'System Audit Ledger',
      subtitle: 'Immutable event log of inward receipts, status updates, and FIFO dispatches',
    },
    'ai-advisor': {
      group: 'AI Intelligence',
      title: 'AI Inventory Copilot',
      subtitle: 'Executive stock analysis, moisture hazard alerts, and FIFO compliance reports',
    },
    settings: {
      group: 'Administration',
      title: 'Depot Parameters & Configuration',
      subtitle: 'Simulated user role switcher, demo dataset controls, and audit parameters',
    },
  };

  const currentInfo = tabTitles[currentTab] || {
    group: 'SmartPDS',
    title: 'SmartPDS',
    subtitle: 'Commodity Stock Allocation',
  };

  const roles: UserRole[] = ['Warehouse Manager', 'Depot Operator', 'Vigilance Auditor'];

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    setShowRoleMenu(false);
    addToast('info', 'Active Role Switched', `Now operating under simulated "${newRole}" role.`);
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
  };

  const ageingBatches = batches.filter(
    (b) => b.status === 'Eligible' && b.availableBags > 0 && b.stockAgeDays >= 90
  );

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2.5 sm:gap-4 px-3 sm:px-6 py-3 bg-white dark:bg-[#111827] border-b border-[#E7E2DF] dark:border-[#293445] shadow-2xs transition-colors duration-200">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0 max-w-[210px] sm:max-w-xs md:max-w-sm lg:max-w-md">
          {/* Mobile Navigation Drawer Toggle */}
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="lg:hidden p-1.5 -ml-1 text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9] hover:bg-[#FAF7F2] dark:hover:bg-[#151C28] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#702D3B]/40 dark:focus:ring-[#801B3A]"
            aria-label="Open navigation menu"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb & Context */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-[#707887] dark:text-[#A1AAB9] font-medium whitespace-nowrap overflow-hidden">
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className="shrink-0 hover:text-[#702D3B] dark:hover:text-[#E4B34F] font-semibold transition-colors cursor-pointer"
                title="Go to Overview Dashboard"
              >
                SmartPDS
              </button>
              {currentInfo.group !== 'Overview' && (
                <>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">/</span>
                  <span className="text-[#707887] dark:text-[#A1AAB9] truncate">{currentInfo.group}</span>
                </>
              )}
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-[#702D3B] dark:text-[#E4B34F] font-semibold truncate">{currentInfo.title}</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-[#344054] dark:text-[#F1F5F9] tracking-tight whitespace-nowrap truncate mt-0.5">
              {currentInfo.title}
            </h1>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md mx-2 sm:mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search batches, challans, bay numbers, or FPS..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#151C28] hover:bg-[#F4EFEA] dark:hover:bg-[#1A2230] focus:bg-white dark:focus:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445] focus:border-[#702D3B] dark:focus:border-[#801B3A] text-[#344054] dark:text-[#F1F5F9] rounded-lg outline-none transition-all placeholder:text-[#707887] dark:placeholder:text-[#A1AAB9]"
            />
            {globalSearchQuery && (
              <button
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9] px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9] bg-[#FAF7F2] dark:bg-[#151C28] hover:bg-[#F3EFEA] dark:hover:bg-[#1E293B] border border-[#E7E2DF] dark:border-[#293445] rounded-lg transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#E4B34F] animate-in spin-in-90 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-[#702D3B] animate-in spin-in-90 duration-300" />
            )}
          </button>

          {/* Demo Mode Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-[#702D3B] dark:text-[#E4B34F] bg-[#FAF2F4] dark:bg-[#2A121A] border border-[#E8CCD2] dark:border-[#54212D] rounded-md whitespace-nowrap">
            <Shield className="w-3.5 h-3.5 text-[#702D3B] dark:text-[#E4B34F]" />
            <span>Hackathon Demo Mode</span>
          </div>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] bg-white dark:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445] hover:border-[#702D3B]/40 dark:hover:border-[#801B3A] rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[140px]">{currentRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#707887] dark:text-[#A1AAB9] shrink-0" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445] rounded-xl shadow-lg p-2 z-40">
                <div className="px-3 py-2 border-b border-[#E7E2DF] dark:border-[#293445]">
                  <div className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9]">Switch Simulated Role</div>
                  <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-0.5">
                    Demonstrates role-specific controls & permissions.
                  </div>
                </div>
                <div className="py-1">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                        currentRole === r
                          ? 'bg-[#FAF2F4] dark:bg-[#2A121A] text-[#702D3B] dark:text-[#F1A5BE] font-semibold'
                          : 'text-[#344054] dark:text-[#CBD5E1] hover:bg-[#FAF7F2] dark:hover:bg-[#1E293B]'
                      }`}
                    >
                      <span>{r}</span>
                      {currentRole === r && (
                        <span className="text-[10px] bg-[#702D3B] dark:bg-[#801B3A] text-white px-1.5 py-0.5 rounded font-semibold">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#E7E2DF] dark:border-[#293445] px-2">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenSettingsModal();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-[#344054] dark:text-[#CBD5E1] hover:text-[#702D3B] dark:hover:text-[#E4B34F] font-medium rounded-md hover:bg-[#FAF7F2] dark:hover:bg-[#1E293B] transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#707887] dark:text-[#A1AAB9]" />
                    <span>Role Permission Details</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9] hover:bg-[#FAF7F2] dark:hover:bg-[#1E293B] rounded-lg transition-colors"
              title="Alerts and Activity"
              aria-label="Alerts and Activity"
            >
              <Bell className="w-4 h-4" />
              {ageingBatches.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#111827]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445] rounded-xl shadow-lg p-3 z-40">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E2DF] dark:border-[#293445]">
                  <span className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9]">Depot Alerts & Activity</span>
                  <span className="text-[11px] text-[#707887] dark:text-[#A1AAB9] font-mono tabular-nums">
                    {ageingBatches.length} alerts
                  </span>
                </div>
                <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                  {ageingBatches.length > 0 ? (
                    ageingBatches.map((b) => (
                      <div
                        key={b.id}
                        className="p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 text-xs"
                      >
                        <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                          <span>Ageing Stock Alert</span>
                          <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">{b.stockAgeDays}d old</span>
                        </div>
                        <div className="text-[11px] text-amber-800 dark:text-amber-200 mt-1">
                          Batch <span className="font-mono font-medium">{b.id}</span> ({b.commodity}) has {b.availableBags} bags awaiting dispatch.
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#707887] dark:text-[#A1AAB9] py-3 text-center">
                      All eligible batches are within standard freshness norms.
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#E7E2DF] dark:border-[#293445]">
                    <div className="text-[11px] font-semibold text-[#707887] dark:text-[#A1AAB9] uppercase tracking-wider mb-1">
                      Recent Activity
                    </div>
                    {auditLogs.slice(0, 2).map((log) => (
                      <div key={log.id} className="py-1 text-[11px] text-[#344054] dark:text-[#CBD5E1] truncate">
                        <span className="font-mono text-[#707887] dark:text-[#A1AAB9]">
                          {log.timestamp.split('T')[1]?.slice(0, 5)}
                        </span>{' '}
                        · {log.action} ({log.referenceId})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-[#344054] dark:text-[#F1F5F9] hover:text-[#702D3B] dark:hover:text-[#E4B34F] bg-[#FAF7F2] dark:bg-[#151C28] hover:bg-[#F3EFEA] dark:hover:bg-[#1E293B] border border-[#E7E2DF] dark:border-[#293445] rounded-lg transition-colors whitespace-nowrap"
            title="Reset to clean sample data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#707887] dark:text-[#A1AAB9]" />
            <span className="hidden lg:inline">Reset Demo</span>
          </button>
        </div>
      </header>


      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#344054] dark:text-[#F1F5F9]">Restore Demo Warehouse Data?</h3>
                <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-2 leading-relaxed">
                  This will reset all batch balances, newly created stock receipts, dispatches, and audit entries back to the pristine hackathon demo dataset.
                </p>
                <div className="mt-4 p-3 bg-[#FAF7F2] dark:bg-[#111827] rounded-lg border border-[#E7E2DF] dark:border-[#293445] text-xs text-[#344054] dark:text-[#CBD5E1] space-y-1">
                  <div>· Restores B001 (100 bags) and B002 (150 bags) demo state</div>
                  <div>· Re-engages sample damaged & quarantined batches</div>
                  <div>· Preserves local simulated storage</div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#344054] dark:text-[#CBD5E1] hover:bg-[#FAF7F2] dark:hover:bg-[#1E293B] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReset}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] rounded-lg shadow-sm transition-colors"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
