import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DispatchRecord } from '../../types';
import {
  FileText,
  Search,
  Printer,
  Eye,
  Truck,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  Download,
} from 'lucide-react';

interface ChallansViewProps {
  onOpenDispatchTab: () => void;
}

export const ChallansView: React.FC<ChallansViewProps> = ({ onOpenDispatchTab }) => {
  const { dispatches, setActiveChallan } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('ALL');

  const filteredDispatches = useMemo(() => {
    return dispatches.filter((d) => {
      if (commodityFilter !== 'ALL' && d.commodity !== commodityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesChallan = d.challanNumber.toLowerCase().includes(q);
        const matchesFps = d.destinationName.toLowerCase().includes(q) || d.destinationFpsId.toLowerCase().includes(q);
        const matchesVehicle = d.vehicleNumber.toLowerCase().includes(q);
        const matchesDriver = d.driverName.toLowerCase().includes(q);
        const matchesBatches = d.allocatedBatches.some((b) => b.batchId.toLowerCase().includes(q));
        if (!matchesChallan && !matchesFps && !matchesVehicle && !matchesDriver && !matchesBatches) return false;
      }

      return true;
    });
  }, [dispatches, commodityFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] tracking-tight">
            Digital Challans & Gate Passes Register
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Official delivery orders, vehicle consignment receipts, and batch deduction logs
          </p>
        </div>
        <button
          onClick={onOpenDispatchTab}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#702D3B] hover:bg-[#54212D] dark:bg-[#801B3A] dark:hover:bg-[#9E2248] rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>New FIFO Dispatch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Challan No, FPS, Vehicle, Driver..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg outline-none focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] text-[#344054] dark:text-[#F1F5F9] placeholder:text-[#707887] dark:placeholder:text-[#A1AAB9]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-[#707887] dark:text-[#A1AAB9] font-medium">Commodity:</span>
          <select
            value={commodityFilter}
            onChange={(e) => setCommodityFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-white dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
          >
            <option value="ALL">All Commodities</option>
            <option value="Rice">Rice</option>
            <option value="Wheat">Wheat</option>
          </select>
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#111827] border-b border-[#E7E2DF] dark:border-[#293445] text-[#707887] dark:text-[#A1AAB9] font-semibold">
              <tr>
                <th className="py-3 px-4">Challan Reference</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Destination (FPS)</th>
                <th className="py-3 px-3">Commodity</th>
                <th className="py-3 px-3 text-right">Net Quantity</th>
                <th className="py-3 px-3">Allocated Batches (FIFO)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
              {filteredDispatches.length > 0 ? (
                filteredDispatches.map((dispatch) => (
                  <tr key={dispatch.challanNumber} className="hover:bg-[#FAF7F2]/80 dark:hover:bg-[#1E293B]/60 transition-colors">
                    {/* Challan Ref */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#702D3B] dark:text-[#E4B34F]">
                        {dispatch.challanNumber}
                      </div>
                      <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9] font-mono">
                        Pass: {dispatch.gatePassNo}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 font-mono text-[#344054] dark:text-[#CBD5E1]">
                      {dispatch.timestamp.split('T')[0]}
                      <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">
                        {dispatch.timestamp.split('T')[1]?.slice(0, 5)}
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#344054] dark:text-[#F1F5F9] truncate max-w-[180px]">
                        {dispatch.destinationName}
                      </div>
                      <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9] font-mono">
                        {dispatch.destinationFpsId}
                      </div>
                    </td>

                    {/* Commodity */}
                    <td className="py-3 px-3">
                      <div className="text-[#344054] dark:text-[#F1F5F9] font-medium">{dispatch.commodity}</div>
                      <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">{dispatch.variety}</div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <div className="font-bold text-[#344054] dark:text-[#F1F5F9]">{dispatch.totalBags} bags</div>
                      <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">{dispatch.totalQtl} Qtl</div>
                    </td>

                    {/* Batch breakdown */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        {dispatch.allocatedBatches.map((b) => (
                          <div
                            key={b.batchId}
                            className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] text-[10px] font-mono text-[#344054] dark:text-[#F1F5F9]"
                          >
                            <span className="font-bold text-[#702D3B] dark:text-[#E4B34F]">{b.batchId}</span> ({b.bags}b)
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{dispatch.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setActiveChallan(dispatch)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-[#702D3B] dark:text-[#E4B34F] bg-[#FAF2F4] dark:bg-[#3B1020]/60 hover:bg-[#f3e4e8] dark:hover:bg-[#3B1020] border border-[#E7E2DF] dark:border-[#801B3A]/60 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Challan</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#707887] dark:text-[#A1AAB9]">
                    <FileText className="w-8 h-8 mx-auto text-[#707887]/50 dark:text-[#A1AAB9]/50 mb-2" />
                    <div className="text-sm font-semibold text-[#344054] dark:text-[#F1F5F9]">No dispatches found</div>
                    <div className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1">
                      Execute a dispatch from the FIFO engine to generate official digital challans.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
