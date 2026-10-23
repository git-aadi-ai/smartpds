import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  UserCheck,
  Building2,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const UsersRolesView: React.FC = () => {
  const { currentRole, setCurrentRole, addToast } = useApp();

  const handleSwitchRole = (role: UserRole) => {
    setCurrentRole(role);
    addToast('info', 'Active Role Switched', `Operating as simulated "${role}".`);
  };

  const permissions = [
    {
      feature: 'Record New Inward Stock Rake Intake',
      manager: true,
      operator: true,
      auditor: false,
    },
    {
      feature: 'Execute Standard Deterministic FIFO Dispatch',
      manager: true,
      operator: true,
      auditor: false,
    },
    {
      feature: 'Request FIFO Out-of-Sequence Exception',
      manager: true,
      operator: true,
      auditor: false,
    },
    {
      feature: 'Authorize FIFO Exception & Override Older Batch',
      manager: true,
      operator: false,
      auditor: false,
    },
    {
      feature: 'Conduct Physical Stack Count & Log Variance',
      manager: true,
      operator: true,
      auditor: true,
    },
    {
      feature: 'Authorize Physical Count Ledger Adjustments',
      manager: true,
      operator: false,
      auditor: true,
    },
    {
      feature: 'Modify Batch Status (Eligible / Quarantined / Damaged)',
      manager: true,
      operator: false,
      auditor: true,
    },
    {
      feature: 'Export Immutable Cryptographic Audit Ledger',
      manager: true,
      operator: true,
      auditor: true,
    },
    {
      feature: 'Configure Depot Thresholds & Operating Parameters',
      manager: true,
      operator: false,
      auditor: false,
    },
  ];

  const depotStaff = [
    {
      name: 'Anand Kumar',
      role: 'Warehouse Manager' as UserRole,
      id: 'EMP-FCI-0012',
      email: 'anand.kumar@fci.gov.in',
      designation: 'Area Manager (Depot Operations)',
      status: 'Active',
    },
    {
      name: 'Rajesh V.',
      role: 'Depot Operator' as UserRole,
      id: 'EMP-FCI-0048',
      email: 'rajesh.v@fci.gov.in',
      designation: 'Senior Technical Assistant & Gate Operator',
      status: 'Active',
    },
    {
      name: 'Dr. Sunita Rao',
      role: 'Vigilance Auditor' as UserRole,
      id: 'EMP-VIG-0003',
      email: 'sunita.rao@civilsupplies.kar.gov.in',
      designation: 'Divisional Quality Assurance Inspector',
      status: 'Active',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Access Control & RBAC
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Depot Staff Security Protocol</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Users, Role Permission Matrix & Role Simulator
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Role-based segregation of duties enforcing dual-authorization between floor operators and vigilance auditors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#FAF2F4] dark:bg-[#3B1020] border border-[#702D3B]/30 dark:border-[#801B3A]/50 text-[#702D3B] dark:text-[#E4B34F] text-xs font-semibold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            <span>Active Role: {currentRole}</span>
          </span>
        </div>
      </div>

      {/* Staff Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {depotStaff.map((staff) => {
          const isSelected = currentRole === staff.role;
          return (
            <div
              key={staff.id}
              className={`p-5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-white dark:bg-[#151C28] border-[#702D3B] dark:border-[#E4B34F] shadow-sm ring-2 ring-[#702D3B]/30 dark:ring-[#E4B34F]/30'
                  : 'bg-white dark:bg-[#151C28] border-[#E7E2DF] dark:border-[#293445]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#707887] dark:text-[#A1AAB9]">{staff.id}</span>
                {isSelected ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#702D3B] dark:bg-[#801B3A] text-white">
                    Currently Operating
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    {staff.status}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">{staff.name}</h4>
                <div className="text-xs font-semibold text-[#702D3B] dark:text-[#E4B34F] mt-0.5">
                  {staff.role}
                </div>
                <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-0.5">
                  {staff.designation}
                </div>
                <div className="text-[10px] font-mono text-[#707887] dark:text-[#A1AAB9] mt-1">
                  {staff.email}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E7E2DF] dark:border-[#293445]">
                <button
                  type="button"
                  onClick={() => handleSwitchRole(staff.role)}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#FAF7F2] dark:bg-[#111827] text-[#702D3B] dark:text-[#E4B34F] border border-[#702D3B]/30'
                      : 'bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] text-white'
                  }`}
                >
                  <span>{isSelected ? 'Active Simulator Session' : `Switch to ${staff.role}`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permission Matrix Table */}
      <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
          <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
            Statutory Responsibility & Permission Matrix
          </h3>
          <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Dual-Key Enforcement</span>
        </div>

        <div className="overflow-x-auto border border-[#E7E2DF] dark:border-[#293445] rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#111827] text-[#707887] dark:text-[#A1AAB9] font-semibold border-b border-[#E7E2DF] dark:border-[#293445]">
              <tr>
                <th className="py-2.5 px-3">System Operation / Action Capability</th>
                <th className="py-2.5 px-3 text-center">Warehouse Manager</th>
                <th className="py-2.5 px-3 text-center">Depot Operator</th>
                <th className="py-2.5 px-3 text-center">Vigilance Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1A2230]/60">
                  <td className="py-2.5 px-3 font-medium text-[#344054] dark:text-[#F1F5F9]">
                    {p.feature}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.manager ? (
                      <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.operator ? (
                      <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.auditor ? (
                      <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
