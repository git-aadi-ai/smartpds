import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommodityType, AllocationItem } from '../../types';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Warehouse,
  Sparkles,
  RotateCcw,
  Boxes,
  Truck,
} from 'lucide-react';

interface DispatchPlanningViewProps {
  onProceedToDispatch?: (params: { commodity: CommodityType; variety: string; bags: number }) => void;
}

export const DispatchPlanningView: React.FC<DispatchPlanningViewProps> = ({ onProceedToDispatch }) => {
  const { batches, calculateFifoPreview } = useApp();

  const [commodity, setCommodity] = useState<CommodityType>('Rice');
  const [variety, setVariety] = useState('Grade A - Boiled');
  const [requestedBags, setRequestedBags] = useState<number>(150);

  const varietiesByCommodity: Record<CommodityType, string[]> = {
    Rice: ['Grade A - Boiled', 'Raw Common', 'Sona Masoori (PDS)', 'Jaya Parboiled'],
    Wheat: ['Sharbati Lokwan', 'Durum High-Protein', 'Kalyan Sona', 'Common Milling'],
    Sugar: ['Refined M-30', 'Crystal S-30', 'White Cane Granulated'],
    'Coarse Grains': ['Hybrid Jowar (Sorghum)', 'Ragi (Finger Millet)', 'Bajra (Pearl Millet)'],
    Pulses: ['Tur / Arhar Dal (FAQ)', 'Chana Whole', 'Moong Dal Split'],
  };

  const handleCommodityChange = (newCommodity: CommodityType) => {
    setCommodity(newCommodity);
    setVariety(varietiesByCommodity[newCommodity][0] || 'Standard');
  };

  const preview = calculateFifoPreview(commodity, variety, requestedBags);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Simulation Sandbox
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Pre-Execution Allocation Modeling</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Dispatch Planning & Multi-Batch Allocation Sandbox
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Test and model requisition bag requirements against live depot stock. Understand exactly which stacks will exhaust.
          </p>
        </div>

        {onProceedToDispatch && preview.success && (
          <button
            onClick={() => onProceedToDispatch({ commodity, variety, bags: requestedBags })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Proceed to Formal Dispatch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
            <Sliders className="w-5 h-5 text-[#702D3B] dark:text-[#E4B34F]" />
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">Requisition Parameters</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                Commodity
              </label>
              <select
                value={commodity}
                onChange={(e) => handleCommodityChange(e.target.value as CommodityType)}
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
              >
                <option value="Rice">Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Sugar">Sugar</option>
                <option value="Coarse Grains">Coarse Grains</option>
                <option value="Pulses">Pulses</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                Grain Variety / Grade
              </label>
              <select
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
              >
                {varietiesByCommodity[commodity].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1]">
                  Simulated Bags Quantity
                </label>
                <span className="font-mono font-bold text-sm text-[#702D3B] dark:text-[#E4B34F]">
                  {requestedBags} bags
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={requestedBags}
                onChange={(e) => setRequestedBags(parseInt(e.target.value))}
                className="w-full accent-[#702D3B] dark:accent-[#E4B34F] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-[#707887] dark:text-[#A1AAB9] mt-1 font-mono">
                <span>10 bags</span>
                <span>500 bags</span>
                <span>1000 bags</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] text-[#707887] dark:text-[#A1AAB9] uppercase font-semibold block mb-1.5">
                Standard Transport Indents
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 150, 200, 300, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRequestedBags(preset)}
                    className={`py-1.5 rounded text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                      requestedBags === preset
                        ? 'bg-[#702D3B] dark:bg-[#801B3A] text-white border-[#702D3B] dark:border-[#801B3A]'
                        : 'bg-[#FAF7F2] dark:bg-[#111827] border-[#E7E2DF] dark:border-[#293445] text-[#344054] dark:text-[#CBD5E1] hover:border-[#702D3B]/40 dark:hover:border-[#801B3A]/40'
                    }`}
                  >
                    {preset} bags
                  </button>
                ))}
              </div>
            </div>

            {/* Total Stock Available Card */}
            <div className="p-3 bg-[#FAF7F2] dark:bg-[#111827] rounded-lg border border-[#E7E2DF] dark:border-[#293445]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#707887] dark:text-[#A1AAB9]">Total Eligible Available:</span>
                <span className="font-mono font-bold text-[#344054] dark:text-[#F1F5F9]">
                  {preview.totalEligibleAvailableBags} bags
                </span>
              </div>
              <div className="w-full bg-[#E7E2DF] dark:bg-[#293445] rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    preview.requestedBags > preview.totalEligibleAvailableBags
                      ? 'bg-rose-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (preview.requestedBags / Math.max(1, preview.totalEligibleAvailableBags)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Column: Allocated Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#702D3B] dark:text-[#E4B34F]" />
                <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
                  Simulated Multi-Batch Allocation Plan
                </h3>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  preview.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {preview.success ? '100% Fulfillable' : 'Deficit / Insufficient Stock'}
              </span>
            </div>

            {preview.success ? (
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                  <span>
                    Deterministic FIFO engine successfully resolved <strong className="font-mono">{requestedBags} bags</strong> ({((requestedBags * 50) / 100).toFixed(1)} Qtl) across <strong className="font-mono">{preview.allocations.length} stack batch(es)</strong>.
                  </span>
                  <span className="font-mono font-bold shrink-0 ml-3">{preview.allocations.length} source(s)</span>
                </div>

                <div className="overflow-x-auto border border-[#E7E2DF] dark:border-[#293445] rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] dark:bg-[#111827] text-[#707887] dark:text-[#A1AAB9] font-semibold border-b border-[#E7E2DF] dark:border-[#293445]">
                      <tr>
                        <th className="py-2.5 px-3">Batch ID & Stack Bay</th>
                        <th className="py-2.5 px-3">Receipt Date (Age)</th>
                        <th className="py-2.5 px-3 text-right">Available Before</th>
                        <th className="py-2.5 px-3 text-right">Allocated Bags / Qtl</th>
                        <th className="py-2.5 px-3 text-right">Remaining Balance</th>
                        <th className="py-2.5 px-3 text-center">Batch Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
                      {preview.allocations.map((item, idx) => (
                        <tr key={item.batchId} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1A2230]/60">
                          <td className="py-2.5 px-3">
                            <div className="font-mono font-bold text-[#702D3B] dark:text-[#E4B34F]">
                              {item.batchId}
                            </div>
                            <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9]">{item.depotLocation}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                            <div>{item.receivedDate}</div>
                            <div className="text-amber-700 dark:text-amber-400 font-semibold">{item.stockAgeDays} days old</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                            {item.availableBags} bags
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-xs font-bold text-[#702D3B] dark:text-[#E4B34F]">
                            {item.allocatedBags} bags
                            <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9] font-normal">
                              {item.allocatedQtl} Qtl
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                            {item.remainingBagsAfter} bags
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {item.isFullyExhausted ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                Fully Exhausted
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                                Partial Drawdown
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="font-semibold text-sm">Cannot Fulfill Requested Quantity</div>
                <div className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1 max-w-sm mx-auto">
                  {preview.error || 'Requested bags exceed current eligible stock for this commodity variety.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
