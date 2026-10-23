import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Shield,
  RotateCcw,
  Download,
  Upload,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Server,
  Sliders,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentRole, setCurrentRole, resetDemoData, batches, dispatches, auditLogs, addToast } = useApp();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      facility: 'FCI District Base Depot #4, Hubballi',
      batches,
      dispatches,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartpds_snapshot_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Snapshot Exported', 'Warehouse state downloaded as JSON file.');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.batches && Array.isArray(json.batches)) {
          localStorage.setItem('smartpds_v1_batches', JSON.stringify(json.batches));
          if (json.dispatches) localStorage.setItem('smartpds_v1_dispatches', JSON.stringify(json.dispatches));
          if (json.auditLogs) localStorage.setItem('smartpds_v1_audit_logs', JSON.stringify(json.auditLogs));
          window.location.reload();
        } else {
          addToast('error', 'Invalid File Format', 'File does not contain valid SmartPDS warehouse records.');
        }
      } catch (err) {
        addToast('error', 'Import Failed', 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const permissionsMatrix: Array<{
    feature: string;
    description: string;
    manager: boolean;
    operator: boolean;
    auditor: boolean;
  }> = [
    {
      feature: 'Record Inward Stock Receipt',
      description: 'Enter new grain consignments, moisture readings, and bay assignments',
      manager: true,
      operator: true,
      auditor: false,
    },
    {
      feature: 'Execute FIFO Dispatch',
      description: 'Compute oldest-first batch draw and issue digital gate passes',
      manager: true,
      operator: true,
      auditor: false,
    },
    {
      feature: 'Override Quarantine / Damaged Status',
      description: 'Lock batches failing moisture tests or release re-inspected grain',
      manager: true,
      operator: false,
      auditor: true,
    },
    {
      feature: 'Edit Storage Bay / Fumigation Notes',
      description: 'Update physical stack identifiers and pest management metadata',
      manager: true,
      operator: true,
      auditor: false,
    },
    {
      feature: 'Inspect System Audit Logs',
      description: 'Review timestamped transaction records and operator history',
      manager: true,
      operator: true,
      auditor: true,
    },
    {
      feature: 'Reset Demo Dataset',
      description: 'Restore initial fictional Indian PDS test cases',
      manager: true,
      operator: false,
      auditor: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] tracking-tight">
          System Roles & Prototype Settings
        </h2>
        <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
          Simulated user roles, permission boundaries, and demo dataset lifecycle
        </p>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Simulated Security & Role Verification Notice:</span> In this college hackathon prototype, authentication and role-based permissions are simulated in the browser to demonstrate operational workflows. Frontend-only role checks must never be construed as production security. Production deployments require server-side token authentication and Firebase/IAM security rules.
        </div>
      </div>

      {/* Role Switcher Section */}
      <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
          <span className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
            <span>Active Simulated Role</span>
          </span>
          <span className="text-[11px] text-[#702D3B] dark:text-[#E4B34F] bg-[#FAF2F4] dark:bg-[#3B1020]/60 px-2 py-0.5 rounded font-medium border border-[#E7E2DF] dark:border-[#801B3A]/50">
            Current: {currentRole}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Warehouse Manager */}
          <div
            onClick={() => setCurrentRole('Warehouse Manager')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              currentRole === 'Warehouse Manager'
                ? 'border-[#702D3B] dark:border-[#801B3A] bg-[#FAF2F4] dark:bg-[#3B1020]/40 shadow-xs ring-1 ring-[#702D3B] dark:ring-[#801B3A]'
                : 'border-[#E7E2DF] dark:border-[#293445] hover:border-[#C5A46D] dark:hover:border-[#E4B34F] bg-white dark:bg-[#111827]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">Warehouse Manager</span>
              {currentRole === 'Warehouse Manager' && (
                <span className="text-[10px] bg-[#702D3B] dark:bg-[#801B3A] text-white px-2 py-0.5 rounded font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1">Simulated User: Anand Kumar</div>
            <p className="text-xs text-[#344054]/90 dark:text-[#CBD5E1] mt-3 leading-relaxed">
              Full administrative authority across receipts, FIFO dispatches, quarantine adjustments, and system resets.
            </p>
          </div>

          {/* Depot Operator */}
          <div
            onClick={() => setCurrentRole('Depot Operator')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              currentRole === 'Depot Operator'
                ? 'border-[#702D3B] dark:border-[#801B3A] bg-[#FAF2F4] dark:bg-[#3B1020]/40 shadow-xs ring-1 ring-[#702D3B] dark:ring-[#801B3A]'
                : 'border-[#E7E2DF] dark:border-[#293445] hover:border-[#C5A46D] dark:hover:border-[#E4B34F] bg-white dark:bg-[#111827]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">Depot Operator</span>
              {currentRole === 'Depot Operator' && (
                <span className="text-[10px] bg-[#702D3B] dark:bg-[#801B3A] text-white px-2 py-0.5 rounded font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1">Simulated User: Rajesh V.</div>
            <p className="text-xs text-[#344054]/90 dark:text-[#CBD5E1] mt-3 leading-relaxed">
              Operational gate and stack handling. Records inward consignments and initiates dispatches; cannot alter quarantine status.
            </p>
          </div>

          {/* Vigilance Auditor */}
          <div
            onClick={() => setCurrentRole('Vigilance Auditor')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              currentRole === 'Vigilance Auditor'
                ? 'border-[#702D3B] dark:border-[#801B3A] bg-[#FAF2F4] dark:bg-[#3B1020]/40 shadow-xs ring-1 ring-[#702D3B] dark:ring-[#801B3A]'
                : 'border-[#E7E2DF] dark:border-[#293445] hover:border-[#C5A46D] dark:hover:border-[#E4B34F] bg-white dark:bg-[#111827]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">Vigilance Auditor</span>
              {currentRole === 'Vigilance Auditor' && (
                <span className="text-[10px] bg-[#702D3B] dark:bg-[#801B3A] text-white px-2 py-0.5 rounded font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1">Simulated User: Dr. Sunita Rao</div>
            <p className="text-xs text-[#344054]/90 dark:text-[#CBD5E1] mt-3 leading-relaxed">
              Read-only inspection authority. Reviews stock ledgers and locks sub-standard batches; barred from executing dispatches.
            </p>
          </div>
        </div>
      </div>

      {/* Permissions Comparison Matrix */}
      <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
          <span className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
            <span>Role Permissions Matrix</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#111827] border-b border-[#E7E2DF] dark:border-[#293445] text-[#707887] dark:text-[#A1AAB9] font-semibold">
              <tr>
                <th className="py-2.5 px-3">System Operation</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Manager</th>
                <th className="py-2.5 px-3 text-center">Operator</th>
                <th className="py-2.5 px-3 text-center">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
              {permissionsMatrix.map((item) => (
                <tr key={item.feature} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1E293B]/60">
                  <td className="py-2.5 px-3 font-semibold text-[#344054] dark:text-[#F1F5F9]">{item.feature}</td>
                  <td className="py-2.5 px-3 text-[#707887] dark:text-[#A1AAB9]">{item.description}</td>
                  <td className="py-2.5 px-3 text-center">
                    {item.manager ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#E7E2DF] dark:text-[#293445] mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.operator ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#E7E2DF] dark:text-[#293445] mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.auditor ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#E7E2DF] dark:text-[#293445] mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset & Demo Lifecycle Controls */}
      <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
          <span className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
            <span>Demo Data Lifecycle Controls</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reset Demo Data */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9] flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Reset Demo State</span>
              </h4>
              <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1 leading-relaxed">
                Clears localStorage and restores initial batches (including older B001 with 100 bags and B002 with 150 bags, plus quarantined stock).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E7E2DF] dark:border-[#293445]">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2 px-3 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700 rounded-lg transition-colors text-center"
              >
                Restore Pristine Hackathon Dataset
              </button>
            </div>
          </div>

          {/* Backup / Restore JSON */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9] flex items-center gap-2">
                <Download className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
                <span>Export / Import Warehouse JSON</span>
              </h4>
              <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1 leading-relaxed">
                Download the current batch registers, dispatches, and audit trail as a portable JSON snapshot.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E7E2DF] dark:border-[#293445] flex items-center gap-2">
              <button
                onClick={handleExportData}
                className="flex-1 py-2 px-3 text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] bg-white dark:bg-[#151C28] hover:bg-[#FAF2F4] dark:hover:bg-[#3B1020]/40 border border-[#E7E2DF] dark:border-[#293445] rounded-lg transition-colors text-center"
              >
                Export JSON
              </button>
              <label className="flex-1 py-2 px-3 text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] bg-white dark:bg-[#151C28] hover:bg-[#FAF2F4] dark:hover:bg-[#3B1020]/40 border border-[#E7E2DF] dark:border-[#293445] rounded-lg transition-colors text-center cursor-pointer">
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl p-6">
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">Confirm Warehouse State Reset</h3>
            <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-2 leading-relaxed">
              This will overwrite all active batch tallies, newly added inward receipts, and generated challans with the default demonstration data.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-[#707887] dark:text-[#A1AAB9] hover:bg-[#FAF7F2] dark:hover:bg-[#111827] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#702D3B] hover:bg-[#54212D] dark:bg-[#801B3A] dark:hover:bg-[#9E2248] rounded-lg shadow-xs transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
