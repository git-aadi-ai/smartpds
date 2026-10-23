import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Lock,
} from 'lucide-react';

export const ApprovalRulesView: React.FC = () => {
  const { approvalRules, toggleApprovalRule, depotSettings, updateDepotSettings, addToast } = useApp();

  const [managerThreshold, setManagerThreshold] = useState(depotSettings.mandatoryManagerApprovalBagsThreshold);
  const [maxMoisture, setMaxMoisture] = useState(depotSettings.maxMoistureAllowedPercent);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateDepotSettings({
      mandatoryManagerApprovalBagsThreshold: managerThreshold,
      maxMoistureAllowedPercent: maxMoisture,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Enforcement Policies
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Rule Engine & Trigger Thresholds</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Depot Governance Rules & Approval Escalation Gates
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Configure automated enforcement rules that intercept out-of-order allocations, moisture hazards, and large dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{approvalRules.filter((r) => r.isActive).length} / {approvalRules.length} Rules Active</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Parameter Form */}
        <div className="lg:col-span-1 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
            <Sliders className="w-5 h-5 text-[#702D3B] dark:text-[#E4B34F]" />
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
              Escalation Thresholds
            </h3>
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                Mandatory Manager Approval Threshold (Bags)
              </label>
              <input
                type="number"
                min="50"
                max="5000"
                value={managerThreshold}
                onChange={(e) => setManagerThreshold(parseInt(e.target.value) || 200)}
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:outline-none"
              />
              <span className="text-[10px] text-[#707887] dark:text-[#A1AAB9] mt-0.5 block">
                Any dispatch exceeding this bag limit pauses for Manager dual-signature.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                Maximum Allowed Moisture %
              </label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="18"
                value={maxMoisture}
                onChange={(e) => setMaxMoisture(parseFloat(e.target.value) || 14.0)}
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:outline-none"
              />
              <span className="text-[10px] text-[#707887] dark:text-[#A1AAB9] mt-0.5 block">
                Grain intake exceeding this moisture level triggers automated gate quarantine.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Update Depot Thresholds
            </button>
          </form>
        </div>

        {/* Right Column: Rules List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9] pb-2 border-b border-[#E7E2DF] dark:border-[#293445]">
              Active Institutional Rules
            </h3>

            <div className="space-y-3">
              {approvalRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-xl border transition-all ${
                    rule.isActive
                      ? 'bg-white dark:bg-[#151C28] border-[#E7E2DF] dark:border-[#293445]'
                      : 'bg-[#FAF7F2]/40 dark:bg-[#111827]/40 border-[#E7E2DF] dark:border-[#293445] opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#702D3B] dark:text-[#E4B34F]">
                          {rule.id}
                        </span>
                        <h4 className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9]">{rule.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            rule.severity === 'High'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {rule.severity} Priority
                        </span>
                      </div>

                      <p className="text-xs text-[#344054] dark:text-[#CBD5E1] mt-1 font-medium">
                        {rule.condition}
                      </p>

                      <p className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
                        {rule.description} · Approver: <strong className="text-[#344054] dark:text-[#CBD5E1]">{rule.approverRole}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleApprovalRule(rule.id)}
                      className="p-1 text-[#702D3B] dark:text-[#E4B34F] hover:opacity-80 transition-opacity cursor-pointer shrink-0"
                      title={rule.isActive ? 'Deactivate rule' : 'Activate rule'}
                    >
                      {rule.isActive ? (
                        <ToggleRight className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
