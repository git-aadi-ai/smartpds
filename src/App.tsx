import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// View Components
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { StockManagement } from './components/stock/StockManagement';
import { InwardReceiptsView } from './components/inventory/InwardReceiptsView';
import { StockLedgerView } from './components/inventory/StockLedgerView';
import { StockReconciliationView } from './components/inventory/StockReconciliationView';

import { AllocationQueueView } from './components/fifo/AllocationQueueView';
import { DispatchPlanningView } from './components/fifo/DispatchPlanningView';
import { FifoExceptionsView } from './components/fifo/FifoExceptionsView';
import { ApprovalRequestsView } from './components/fifo/ApprovalRequestsView';

import { FifoDispatchEngine } from './components/dispatch/FifoDispatchEngine';
import { ChallansView } from './components/challan/ChallansView';
import { DeliveryTrackingView } from './components/dispatch/DeliveryTrackingView';
import { ReturnsDiscrepanciesView } from './components/dispatch/ReturnsDiscrepanciesView';

import { AiAdvisorView } from './components/ai/AiAdvisorView';
import { StockRiskAnalysisView } from './components/ai/StockRiskAnalysisView';
import { AnomalyDetectionView } from './components/ai/AnomalyDetectionView';
import { ReceiptChallanReaderView } from './components/ai/ReceiptChallanReaderView';

import { AuditLogsView } from './components/audit/AuditLogsView';
import { StockReportsView } from './components/reports/StockReportsView';
import { AgeingReportsView } from './components/reports/AgeingReportsView';
import { WastageDiscrepancyReportsView } from './components/reports/WastageDiscrepancyReportsView';

import { UsersRolesView } from './components/admin/UsersRolesView';
import { SettingsView } from './components/settings/SettingsView';
import { ApprovalRulesView } from './components/admin/ApprovalRulesView';
import { SystemActivityView } from './components/admin/SystemActivityView';

// Common Modals & Toasts
import { AddStockReceiptModal } from './components/stock/AddStockReceiptModal';
import { DigitalChallanModal } from './components/challan/DigitalChallanModal';
import { ToastContainer } from './components/common/ToastContainer';
import { StatutoryPrivacyModal } from './components/common/StatutoryPrivacyModal';
import { NotFoundView } from './components/common/NotFoundView';
import { ShieldCheck, FileText, Layers, CheckCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeChallan, setActiveChallan } = useApp();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [selectedBatchIdForDetails, setSelectedBatchIdForDetails] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Dynamic route document title and meta description updates
  useEffect(() => {
    const titles: Partial<Record<NavTab, string>> = {
      dashboard: 'SmartPDS — Warehouse Operations Overview | Intelligent FIFO Allocation',
      'inv-stock': 'SmartPDS — Stock & Batches Register | Public Distribution System',
      'inv-receipts': 'SmartPDS — Inward Intake & Quality Gate | FCI Depot #4',
      'inv-ledger': 'SmartPDS — Traceable Stock Ledger & Movements | Karnataka Civil Supplies',
      'inv-reconciliation': 'SmartPDS — Physical Stock Reconciliation & Audit Gate',
      'fifo-queue': 'SmartPDS — Deterministic FIFO Priority Queue | Oldest First',
      'fifo-planning': 'SmartPDS — Multi-Batch Dispatch Allocation Sandbox',
      'fifo-exceptions': 'SmartPDS — FIFO Out-of-Sequence Exceptions & Bypass Register',
      'fifo-approvals': 'SmartPDS — Operational Approval Requests & Governance Desk',
      'dispatch-create': 'SmartPDS — FIFO Dispatch Engine & Electronic Issue Orders',
      'dispatch-challans': 'SmartPDS — Digital Challan Register & Form PDS-12 Gate Passes',
      'dispatch-tracking': 'SmartPDS — Fair Price Shop Transit Fleet Tracking',
      'dispatch-returns': 'SmartPDS — Delivery Returns & Transit Discrepancies',
      'ai-copilot': 'SmartPDS — AI Inventory Advisory Copilot',
      'ai-risk': 'SmartPDS — Grain Stock Risk & Degradation Horizon Analysis',
      'ai-anomaly': 'SmartPDS — Anomaly & Divergence Detection Scanner',
      'ai-reader': 'SmartPDS — AI Inward Receipt & Gate Pass OCR Document Reader',
      'audit-trail': 'SmartPDS — Immutable Cryptographic System Audit Ledger',
      'rep-stock': 'SmartPDS — Consolidated Commodity Stock Position & MSP Valuation',
      'rep-ageing': 'SmartPDS — Stock Ageing Stratification & Rotation Index',
      'rep-wastage': 'SmartPDS — Wastage, Transit Loss & Moisture Shrinkage Analytics',
      'admin-users': 'SmartPDS — Users & Role-Based Access Control (RBAC) Matrix',
      'admin-settings': 'SmartPDS — Depot Parameters & Storage Capacity Settings',
      'admin-approval-rules': 'SmartPDS — Approval Rules & Escalation Thresholds',
      'admin-activity': 'SmartPDS — Real-Time Telemetry & System Activity Feed',
    };

    document.title = titles[currentTab] || 'SmartPDS — Intelligent Commodity Stock Allocation & FIFO Management System';
  }, [currentTab]);

  const handleNavigateTab = (tab: NavTab) => {
    setCurrentTab(tab);
    setIsMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBatchIdForDetails = (batchId: string) => {
    setSelectedBatchIdForDetails(batchId);
    setCurrentTab('inv-stock');
    setIsMobileOpen(false);
  };

  const validTabs: NavTab[] = [
    'dashboard',
    'inv-stock',
    'inv-receipts',
    'inv-ledger',
    'inv-reconciliation',
    'fifo-queue',
    'fifo-planning',
    'fifo-exceptions',
    'fifo-approvals',
    'dispatch-create',
    'dispatch-challans',
    'dispatch-tracking',
    'dispatch-returns',
    'ai-copilot',
    'ai-risk',
    'ai-anomaly',
    'ai-reader',
    'audit-trail',
    'rep-stock',
    'rep-ageing',
    'rep-wastage',
    'admin-users',
    'admin-settings',
    'admin-approval-rules',
    'admin-activity',
    // Legacy Aliases
    'stock',
    'dispatch',
    'challans',
    'audit',
    'ai-advisor',
    'settings',
  ];

  const isValidTab = validTabs.includes(currentTab);

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0F17] text-[#344054] dark:text-[#F1F5F9] flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigateTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Bar Header */}
        <TopBar
          currentTab={currentTab}
          onSelectTab={handleNavigateTab}
          onOpenSettingsModal={() => handleNavigateTab('admin-settings')}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
          onOpenMobileNav={() => setIsMobileOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* 1. Dashboard */}
          {currentTab === 'dashboard' && (
            <OverviewDashboard
              onNavigateTab={handleNavigateTab}
              onOpenReceiptModal={() => setIsReceiptModalOpen(true)}
              onSelectBatchIdForDetails={handleSelectBatchIdForDetails}
            />
          )}

          {/* 2. Inventory Management */}
          {(currentTab === 'inv-stock' || currentTab === 'stock') && (
            <StockManagement
              onOpenReceiptModal={() => setIsReceiptModalOpen(true)}
              selectedBatchIdForDetails={selectedBatchIdForDetails}
              onClearSelectedBatchId={() => setSelectedBatchIdForDetails(null)}
              onSelectBatchIdForDetails={setSelectedBatchIdForDetails}
            />
          )}

          {currentTab === 'inv-receipts' && (
            <InwardReceiptsView onOpenReceiptModal={() => setIsReceiptModalOpen(true)} />
          )}

          {currentTab === 'inv-ledger' && <StockLedgerView />}

          {currentTab === 'inv-reconciliation' && <StockReconciliationView />}

          {/* 3. FIFO Operations */}
          {currentTab === 'fifo-queue' && (
            <AllocationQueueView onPlanDispatch={() => handleNavigateTab('fifo-planning')} />
          )}

          {currentTab === 'fifo-planning' && (
            <DispatchPlanningView
              onProceedToDispatch={() => handleNavigateTab('dispatch-create')}
            />
          )}

          {currentTab === 'fifo-exceptions' && <FifoExceptionsView />}

          {currentTab === 'fifo-approvals' && <ApprovalRequestsView />}

          {/* 4. Dispatch & Challans */}
          {(currentTab === 'dispatch-create' || currentTab === 'dispatch') && (
            <FifoDispatchEngine onOpenChallansTab={() => handleNavigateTab('dispatch-challans')} />
          )}

          {(currentTab === 'dispatch-challans' || currentTab === 'challans') && (
            <ChallansView onOpenDispatchTab={() => handleNavigateTab('dispatch-create')} />
          )}

          {currentTab === 'dispatch-tracking' && <DeliveryTrackingView />}

          {currentTab === 'dispatch-returns' && <ReturnsDiscrepanciesView />}

          {/* 5. AI Intelligence */}
          {(currentTab === 'ai-copilot' || currentTab === 'ai-advisor') && <AiAdvisorView />}

          {currentTab === 'ai-risk' && <StockRiskAnalysisView />}

          {currentTab === 'ai-anomaly' && <AnomalyDetectionView />}

          {currentTab === 'ai-reader' && <ReceiptChallanReaderView />}

          {/* 6. Audit & Reports */}
          {(currentTab === 'audit-trail' || currentTab === 'audit') && <AuditLogsView />}

          {currentTab === 'rep-stock' && <StockReportsView />}

          {currentTab === 'rep-ageing' && <AgeingReportsView />}

          {currentTab === 'rep-wastage' && <WastageDiscrepancyReportsView />}

          {/* 7. Administration */}
          {currentTab === 'admin-users' && <UsersRolesView />}

          {(currentTab === 'admin-settings' || currentTab === 'settings') && <SettingsView />}

          {currentTab === 'admin-approval-rules' && <ApprovalRulesView />}

          {currentTab === 'admin-activity' && <SystemActivityView />}

          {!isValidTab && (
            <NotFoundView onReturnToDashboard={() => handleNavigateTab('dashboard')} />
          )}
        </main>

        {/* Enterprise Government SaaS Footer */}
        <footer className="mt-auto border-t border-[#E7E2DF] dark:border-[#293445] bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xs py-5 px-4 sm:px-6 lg:px-8 text-xs text-[#707887] dark:text-[#A1AAB9] transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[#344054] dark:text-[#F1F5F9]">SmartPDS Platform</span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-600">·</span>
              </div>
              <span className="text-[11px]">
                FCI District Base Depot #4 (Hubballi-Dharwad) · Operational Simulation &copy; {new Date().getFullYear()}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="hover:text-[#702D3B] dark:hover:text-[#E4B34F] font-medium transition-colors cursor-pointer flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#702D3B] dark:text-[#E4B34F]" />
                <span>Statutory Governance & Privacy</span>
              </button>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <button
                type="button"
                onClick={() => handleNavigateTab('admin-settings')}
                className="hover:text-[#702D3B] dark:hover:text-[#E4B34F] font-medium transition-colors cursor-pointer flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Depot Parameters</span>
              </button>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="font-mono text-[10px] bg-[#FAF2F4] dark:bg-[#3B1020]/60 text-[#702D3B] dark:text-[#E4B34F] px-2 py-0.5 rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40">
                FIFO Spec NFSA-v2.4
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals & Overlays */}
      <AddStockReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {activeChallan && (
        <DigitalChallanModal
          challan={activeChallan}
          onClose={() => setActiveChallan(null)}
        />
      )}

      <StatutoryPrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Toast Feedback Stack */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
