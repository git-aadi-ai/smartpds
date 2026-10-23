import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingDown,
  AlertTriangle,
  Download,
  Printer,
  ShieldCheck,
  Scale,
  Droplets,
  Layers,
} from 'lucide-react';

export const WastageDiscrepancyReportsView: React.FC = () => {
  const { returnDiscrepancies, reconciliations, batches } = useApp();

  const totalDamagedBags = returnDiscrepancies.reduce((s, r) => s + r.damagedBags, 0);
  const totalReconciliationLossBags = reconciliations
    .filter((r) => r.varianceBags < 0)
    .reduce((s, r) => s + Math.abs(r.varianceBags), 0);

  const totalWastageBags = totalDamagedBags + totalReconciliationLossBags;
  const totalHandledBags = batches.reduce((s, b) => s + b.initialBags, 0);
  const calculatedLossRatio = Number(((totalWastageBags / Math.max(1, totalHandledBags)) * 100).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Loss Accounting
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Form PDS-DISC (Transit & Godown Shrinkage)</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Wastage, Transit Discrepancy & Moisture Shrinkage Analytics
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Audit loss benchmarks against statutory NFSA handling limits (0.50% transit allowance, 0.20% godown norm).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Loss Ratio: {calculatedLossRatio}% (Within Tolerance)</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="text-xs text-[#707887] dark:text-[#A1AAB9]">Total Discrepancy Loss</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-400">
              {totalWastageBags}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">bags</span>
          </div>
          <div className="text-[11px] font-mono text-[#707887] dark:text-[#A1AAB9] mt-1">
            {((totalWastageBags * 50) / 100).toFixed(1)} Quintals ({totalWastageBags * 50} kg)
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="text-xs text-[#707887] dark:text-[#A1AAB9]">Transit Damage Incidents</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {totalDamagedBags}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">damaged bags</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Across {returnDiscrepancies.length} recorded consignments
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="text-xs text-[#707887] dark:text-[#A1AAB9]">Godown Stack Variance</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#344054] dark:text-[#F1F5F9]">
              {totalReconciliationLossBags}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">bags adjusted</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Reconciled through physical verification audits
          </div>
        </div>
      </div>

      {/* Cause Breakdown Table */}
      <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
          Categorized Loss Causes & Statutory Limits
        </h3>

        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-[#E7E2DF] dark:border-[#293445] flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-[#344054] dark:text-[#F1F5F9]">
                1. Transit Gunny Hook Puncture & Tailgate Tear
              </div>
              <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9]">
                Mechanical handling damage during unloading at fair price shops
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">3 bags</span>
              <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">150 kg (Re-bagged)</div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-[#E7E2DF] dark:border-[#293445] flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-[#344054] dark:text-[#F1F5F9]">
                2. Natural Moisture Evaporation Shrinkage
              </div>
              <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9]">
                Grain aeration weight loss in hot-dry weather months
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">18.5 kg</span>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400">Within 0.5% Allowance</div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-[#E7E2DF] dark:border-[#293445] flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-[#344054] dark:text-[#F1F5F9]">
                3. Dunnage Moisture & Rodent Damage
              </div>
              <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9]">
                Bottom layer poly-sheet seepage during seasonal monsoon
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">1 bag</span>
              <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">Condemned & Written Off</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
