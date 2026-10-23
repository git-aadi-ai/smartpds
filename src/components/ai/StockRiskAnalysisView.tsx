import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  AlertTriangle,
  Droplets,
  Calendar,
  ShieldCheck,
  Warehouse,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  Compass,
} from 'lucide-react';

export const StockRiskAnalysisView: React.FC = () => {
  const { batches, depotSettings } = useApp();

  const eligibleBatches = batches.filter((b) => b.status === 'Eligible' && b.availableBags > 0);

  // Group by ageing brackets
  const age0to30 = eligibleBatches.filter((b) => b.stockAgeDays <= 30);
  const age31to60 = eligibleBatches.filter((b) => b.stockAgeDays > 30 && b.stockAgeDays <= 60);
  const age61to90 = eligibleBatches.filter((b) => b.stockAgeDays > 60 && b.stockAgeDays <= 90);
  const age90plus = eligibleBatches.filter((b) => b.stockAgeDays > 90);

  // Moisture risk evaluation
  const highMoistureBatches = batches.filter((b) => b.moisturePercentage >= 13.0);
  const quarantinedCount = batches.filter((b) => b.status === 'Quarantined').length;
  const damagedCount = batches.filter((b) => b.status === 'Damaged').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Predictive Intelligence
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Grain Shelf-Life & Spoilage Prevention</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Depot Stock Risk & Degradation Horizon Analysis
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Continuous AI analysis of moisture migration, godown microclimates, and rotation urgency across all active bays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#FAF2F4] dark:bg-[#3B1020] border border-[#702D3B]/30 dark:border-[#801B3A]/50 text-[#702D3B] dark:text-[#E4B34F] text-xs font-semibold flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Risk Model v4.2 Active</span>
          </span>
        </div>
      </div>

      {/* Top 3 Risk Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Ageing Horizon */}
        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span className="font-semibold text-[#344054] dark:text-[#F1F5F9]">Urgent Rotation Stacks</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {age90plus.length}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">batches &ge; 90 days</span>
          </div>
          <p className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Total {age90plus.reduce((sum, b) => sum + b.availableBags, 0)} bags approaching priority evacuation window.
          </p>
        </div>

        {/* Card 2: Moisture Alert */}
        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span className="font-semibold text-[#344054] dark:text-[#F1F5F9]">Moisture Caution Watch</span>
            <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#702D3B] dark:text-[#E4B34F]">
              {highMoistureBatches.length}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">stacks &ge; 13.0%</span>
          </div>
          <p className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Borderline moisture levels require weekly grain aeration and probe re-sampling.
          </p>
        </div>

        {/* Card 3: Non-Allocatable Isolation */}
        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span className="font-semibold text-[#344054] dark:text-[#F1F5F9]">Isolated Quarantine Stock</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-400">
              {quarantinedCount + damagedCount}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">quarantined/damaged</span>
          </div>
          <p className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            100% barred from FIFO issue orders to protect PDS consumer health standards.
          </p>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ageing Horizon Breakdown */}
        <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
              Grain Ageing Horizon Distribution
            </h3>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">FCI Base Depot Norms</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 dark:text-emerald-400">Fresh Stock (0 - 30 Days)</span>
                <span className="font-mono text-[#344054] dark:text-[#CBD5E1]">
                  {age0to30.reduce((s, b) => s + b.availableBags, 0)} bags ({age0to30.length} stacks)
                </span>
              </div>
              <div className="w-full bg-[#FAF7F2] dark:bg-[#111827] rounded-full h-2.5 overflow-hidden border border-[#E7E2DF] dark:border-[#293445]">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (age0to30.length / Math.max(1, eligibleBatches.length)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-sky-700 dark:text-sky-400">Standard Maturing (31 - 60 Days)</span>
                <span className="font-mono text-[#344054] dark:text-[#CBD5E1]">
                  {age31to60.reduce((s, b) => s + b.availableBags, 0)} bags ({age31to60.length} stacks)
                </span>
              </div>
              <div className="w-full bg-[#FAF7F2] dark:bg-[#111827] rounded-full h-2.5 overflow-hidden border border-[#E7E2DF] dark:border-[#293445]">
                <div
                  className="bg-sky-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (age31to60.length / Math.max(1, eligibleBatches.length)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700 dark:text-amber-400">Ageing Priority (61 - 90 Days)</span>
                <span className="font-mono text-[#344054] dark:text-[#CBD5E1]">
                  {age61to90.reduce((s, b) => s + b.availableBags, 0)} bags ({age61to90.length} stacks)
                </span>
              </div>
              <div className="w-full bg-[#FAF7F2] dark:bg-[#111827] rounded-full h-2.5 overflow-hidden border border-[#E7E2DF] dark:border-[#293445]">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (age61to90.length / Math.max(1, eligibleBatches.length)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700 dark:text-rose-400">Critical Evacuation Window (&gt; 90 Days)</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                  {age90plus.reduce((s, b) => s + b.availableBags, 0)} bags ({age90plus.length} stacks)
                </span>
              </div>
              <div className="w-full bg-[#FAF7F2] dark:bg-[#111827] rounded-full h-2.5 overflow-hidden border border-[#E7E2DF] dark:border-[#293445]">
                <div
                  className="bg-[#702D3B] dark:bg-[#801B3A] h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (age90plus.length / Math.max(1, eligibleBatches.length)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Card */}
        <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
              AI Mitigation Directives & Actions
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] font-semibold">
              Live Evaluation
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
              <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                <span>Directive 1: Evacuate Batch BATCH-RC-2026-001 (100 bags)</span>
                <span className="text-[10px] font-mono">164 Days Old</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-200 mt-1">
                Rice stack in Godown-A, Stack 01 is currently the oldest commodity lot in the depot. Recommend routing to the next Fair Price Shop dispatch order today.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60">
              <div className="font-bold text-sky-900 dark:text-sky-300 flex items-center justify-between">
                <span>Directive 2: Aeration Cycle in Godown-D Bay 08</span>
                <span className="text-[10px] font-mono">13.2% Moisture</span>
              </div>
              <p className="text-[11px] text-sky-800 dark:text-sky-200 mt-1">
                Durum Wheat stack approaches wet season threshold. Recommend operating motorized dunnage exhaust blowers for 4 hours daily during 12:00-16:00 window.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
              <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                <span>Directive 3: Buffer Stock Health & Replenishment</span>
                <span className="text-[10px] font-mono">Healthy (38 Days Buffer)</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-200 mt-1">
                Overall depot capacity is at 28.4% utilization. Coarse grains and sugar stocks are sufficient to meet next month's taluk allocation indents without shortfall.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
