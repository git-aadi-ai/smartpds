import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommodityType } from '../../types';
import {
  ArrowRightLeft,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  Flame,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';

interface AllocationQueueViewProps {
  onPlanDispatch?: () => void;
}

export const AllocationQueueView: React.FC<AllocationQueueViewProps> = ({ onPlanDispatch }) => {
  const { batches } = useApp();
  const [selectedCommodity, setSelectedCommodity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Strictly eligible batches with positive inventory, sorted strictly by receivedDate ascending
  const eligibleQueue = batches
    .filter((b) => b.status === 'Eligible' && b.availableBags > 0)
    .sort((a, b) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime());

  const filteredQueue = eligibleQueue.filter((b) => {
    const matchesCommodity = selectedCommodity === 'ALL' || b.commodity === selectedCommodity;
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.depotLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.supplierSource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCommodity && matchesSearch;
  });

  const oldestBatch = eligibleQueue[0];
  const highAgeCount = eligibleQueue.filter((b) => b.stockAgeDays >= 90).length;
  const totalEligibleBags = eligibleQueue.reduce((sum, b) => sum + b.availableBags, 0);
  const totalEligibleQtl = eligibleQueue.reduce((sum, b) => sum + b.availableQtl, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Deterministic FIFO Engine
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Live Automated Allocation Sequence</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Real-Time FIFO Allocation Priority Queue
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Batches strictly sorted by arrival date. Position #1 will always be drawn first during dispatch execution.
          </p>
        </div>

        {onPlanDispatch && (
          <button
            onClick={onPlanDispatch}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Launch Dispatch Planner</span>
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Next Batch in Queue</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#702D3B] dark:bg-[#801B3A] text-white rounded">
              Position #1
            </span>
          </div>
          <div className="mt-2">
            <div className="text-base font-bold font-mono text-[#702D3B] dark:text-[#E4B34F]">
              {oldestBatch ? oldestBatch.id : 'None'}
            </div>
            <div className="text-xs text-[#344054] dark:text-[#CBD5E1]">
              {oldestBatch ? `${oldestBatch.commodity} (${oldestBatch.variety})` : '—'}
            </div>
            <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 mt-1 font-semibold">
              {oldestBatch ? `${oldestBatch.stockAgeDays} days in warehouse` : ''}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Total Queue Depth</span>
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#344054] dark:text-[#F1F5F9]">
              {eligibleQueue.length}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">active stacks</span>
          </div>
          <div className="text-[11px] font-mono text-[#707887] dark:text-[#A1AAB9] mt-1">
            {totalEligibleBags.toLocaleString()} bags ({totalEligibleQtl.toFixed(1)} Qtl)
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Ageing Warning (&ge;90 Days)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {highAgeCount}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">batches flagged</span>
          </div>
          <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">
            Prioritized for immediate allocation
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>FIFO Rotation Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              98.4%
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">compliance</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Zero unapproved out-of-order dispatches
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter queue by Batch ID, variety, bay stack..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Commodity:
            </span>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
            >
              <option value="ALL">All Commodities ({eligibleQueue.length})</option>
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Sugar">Sugar</option>
              <option value="Coarse Grains">Coarse Grains</option>
              <option value="Pulses">Pulses</option>
            </select>
          </div>
        </div>

        {/* Priority Queue Cards / Table */}
        <div className="space-y-3">
          {filteredQueue.map((b, idx) => {
            const isNextUp = idx === 0;
            const isAgeing = b.stockAgeDays >= 90;
            const isCritical = b.stockAgeDays >= 150;

            return (
              <div
                key={b.id}
                className={`p-4 rounded-xl border transition-all ${
                  isNextUp
                    ? 'bg-[#FAF2F4]/80 dark:bg-[#2A101C]/80 border-[#C5A46D] dark:border-[#E4B34F] shadow-sm ring-1 ring-[#C5A46D]/30'
                    : 'bg-[#FAF7F2]/50 dark:bg-[#111827]/70 border-[#E7E2DF] dark:border-[#293445] hover:border-[#702D3B]/40 dark:hover:border-[#801B3A]/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Queue Position & Batch Details */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold ${
                        isNextUp
                          ? 'bg-[#702D3B] dark:bg-[#801B3A] text-white shadow-xs'
                          : 'bg-white dark:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445] text-[#344054] dark:text-[#F1F5F9]'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-tighter text-[#C5A46D] dark:text-[#E4B34F] font-semibold">
                        Pos
                      </span>
                      <span className="text-sm font-mono leading-none">#{idx + 1}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#702D3B] dark:text-[#E4B34F]">
                          {b.id}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445] rounded text-[#344054] dark:text-[#CBD5E1]">
                          {b.commodity}
                        </span>
                        <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">{b.variety}</span>
                        {isNextUp && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded uppercase tracking-wider">
                            Next Up for Dispatch
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#707887] dark:text-[#A1AAB9]">
                        <span className="flex items-center gap-1">
                          <Warehouse className="w-3.5 h-3.5 text-[#702D3B] dark:text-[#E4B34F]" />
                          <span>{b.depotLocation}</span>
                        </span>
                        <span>·</span>
                        <span>Received: <strong className="text-[#344054] dark:text-[#CBD5E1] font-mono">{b.receivedDate}</strong></span>
                        <span>·</span>
                        <span>Moisture: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{b.moisturePercentage}%</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Balance & Age Badge */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-[#E7E2DF] dark:border-[#293445]">
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-[#344054] dark:text-[#F1F5F9]">
                        {b.availableBags} bags
                      </div>
                      <div className="text-[11px] font-mono text-[#707887] dark:text-[#A1AAB9]">
                        {b.availableQtl} Quintals ({b.bagWeightKg} kg/bag)
                      </div>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-lg text-right font-mono border ${
                        isCritical
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                          : isAgeing
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{b.stockAgeDays} Days Old</div>
                      <div className="text-[10px] uppercase font-semibold">
                        {isCritical ? 'Critical Age' : isAgeing ? 'Priority Exit' : 'Standard'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredQueue.length === 0 && (
            <div className="py-12 text-center text-[#707887] dark:text-[#A1AAB9] bg-[#FAF7F2] dark:bg-[#111827] rounded-xl border border-[#E7E2DF] dark:border-[#293445]">
              No eligible batches found in queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
