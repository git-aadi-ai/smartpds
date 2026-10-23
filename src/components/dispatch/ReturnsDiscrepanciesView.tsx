import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommodityType, ReturnDiscrepancyRecord } from '../../types';
import {
  RotateCcw,
  AlertTriangle,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Warehouse,
  ShieldCheck,
  Scale,
} from 'lucide-react';

export const ReturnsDiscrepanciesView: React.FC = () => {
  const { returnDiscrepancies, addReturnDiscrepancy, fairPriceShops, dispatches } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [challanNumber, setChallanNumber] = useState(dispatches[0]?.challanNumber || 'PDS-CH-2026-0842');
  const [fpsName, setFpsName] = useState(fairPriceShops[0]?.name || 'Gokul Road Seva Sahakari Sangha');
  const [commodity, setCommodity] = useState<CommodityType>('Rice');
  const [dispatchedBags, setDispatchedBags] = useState<number>(100);
  const [receivedBags, setReceivedBags] = useState<number>(98);
  const [damagedBags, setDamagedBags] = useState<number>(2);
  const [shortageWeightKg, setShortageWeightKg] = useState<number>(100);
  const [discrepancyType, setDiscrepancyType] = useState<ReturnDiscrepancyRecord['discrepancyType']>('Bag Tear / Spillage');
  const [notes, setNotes] = useState('Damaged gunny bags returned to central depot for reconditioning.');

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    addReturnDiscrepancy({
      challanNumber,
      fpsName,
      commodity,
      dispatchedBags,
      receivedBags,
      damagedBags,
      missingBags: Math.max(0, dispatchedBags - (receivedBags + damagedBags)),
      shortageWeightKg,
      discrepancyType,
      status: 'Logged',
      notes,
    });
    setShowModal(false);
  };

  const filteredReturns = returnDiscrepancies.filter((item) => {
    return (
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.challanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fpsName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Transit Loss & Salvage
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">FPS Delivery Exception Logging</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Consignment Returns & Delivery Discrepancies Register
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Log transit damages, torn gunny sacks, scale tare differences, and salvage return gate passes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Delivery Discrepancy</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Reported Return Records</span>
            <RotateCcw className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#344054] dark:text-[#F1F5F9]">
              {returnDiscrepancies.length}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">events</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Logged with return gate passes
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Total Damaged Bags</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {returnDiscrepancies.reduce((sum, r) => sum + r.damagedBags, 0)}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">bags salvage logged</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Gunny re-stitching & salvage in progress
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Statutory Loss Margin</span>
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              0.14%
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">loss ratio</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Below statutory 0.50% transit allowance
          </div>
        </div>
      </div>

      {/* Register List */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search returns by Challan #, Fair Price Shop, or cause..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
          />
        </div>

        <div className="overflow-x-auto border border-[#E7E2DF] dark:border-[#293445] rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#111827] text-[#707887] dark:text-[#A1AAB9] font-semibold border-b border-[#E7E2DF] dark:border-[#293445]">
              <tr>
                <th className="py-2.5 px-3">Return ID & Date</th>
                <th className="py-2.5 px-3">Challan Ref</th>
                <th className="py-2.5 px-3">Fair Price Shop Destination</th>
                <th className="py-2.5 px-3 text-right">Dispatched / Received</th>
                <th className="py-2.5 px-3 text-right">Damaged / Deficit</th>
                <th className="py-2.5 px-3">Discrepancy Category</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
              {filteredReturns.map((ret) => (
                <tr key={ret.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1A2230]/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    <div className="font-bold text-[#702D3B] dark:text-[#E4B34F]">{ret.id}</div>
                    <div className="text-[#707887] dark:text-[#A1AAB9]">{ret.reportDate}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1]">
                    {ret.challanNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[#344054] dark:text-[#F1F5F9]">{ret.fpsName}</div>
                    <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9]">{ret.commodity}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                    <div>{ret.dispatchedBags} sent</div>
                    <div className="text-emerald-700 dark:text-emerald-400">{ret.receivedBags} accepted</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                    <div className="text-rose-600 dark:text-rose-400 font-bold">
                      {ret.damagedBags} bags damaged
                    </div>
                    <div className="text-[#707887] dark:text-[#A1AAB9]">
                      {ret.shortageWeightKg} kg shortage
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] font-medium text-[#344054] dark:text-[#CBD5E1]">
                      {ret.discrepancyType}
                    </span>
                    <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9] max-w-xs truncate">
                      {ret.notes}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {ret.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Delivery Discrepancy */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl p-6">
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
              Log Consignment Return / Delivery Shortage
            </h3>
            <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1">
              File statutory Form PDS-18 return voucher for damaged or short-delivered stock.
            </p>

            <form onSubmit={handleCreateReturn} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Challan Number *
                </label>
                <input
                  type="text"
                  value={challanNumber}
                  onChange={(e) => setChallanNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Fair Price Shop
                </label>
                <input
                  type="text"
                  value={fpsName}
                  onChange={(e) => setFpsName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                    Dispatched Bags
                  </label>
                  <input
                    type="number"
                    value={dispatchedBags}
                    onChange={(e) => setDispatchedBags(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                    Received Bags
                  </label>
                  <input
                    type="number"
                    value={receivedBags}
                    onChange={(e) => setReceivedBags(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-1">
                    Damaged Bags
                  </label>
                  <input
                    type="number"
                    value={damagedBags}
                    onChange={(e) => setDamagedBags(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-rose-300 dark:border-rose-800 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                    Shortage Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={shortageWeightKg}
                    onChange={(e) => setShortageWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Discrepancy Type
                </label>
                <select
                  value={discrepancyType}
                  onChange={(e) => setDiscrepancyType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg"
                >
                  <option value="Bag Tear / Spillage">Bag Tear / Spillage</option>
                  <option value="Transit Moisture Loss">Transit Moisture Loss</option>
                  <option value="Damaged by Water">Damaged by Water</option>
                  <option value="Count Shortage">Count Shortage</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2DF] dark:border-[#293445]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-[#344054] dark:text-[#CBD5E1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#702D3B] dark:bg-[#801B3A] text-white rounded-lg font-semibold"
                >
                  Save Discrepancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
