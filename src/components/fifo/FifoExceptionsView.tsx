import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommodityType } from '../../types';
import {
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Clock,
  Warehouse,
} from 'lucide-react';

export const FifoExceptionsView: React.FC = () => {
  const { batches, fifoExceptions, requestFifoException, reviewFifoException, currentRole } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [commodity, setCommodity] = useState<CommodityType>('Wheat');
  const [variety, setVariety] = useState('Sharbati Lokwan');
  const [requestedBags, setRequestedBags] = useState<number | ''>(100);
  const [skippedBatchId, setSkippedBatchId] = useState('');
  const [allocatedBatchId, setAllocatedBatchId] = useState('');
  const [justificationReason, setJustificationReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending Approval' | 'Approved' | 'Rejected'>('ALL');

  // Eligible batches for the chosen commodity
  const relevantBatches = batches.filter((b) => b.commodity === commodity && b.status === 'Eligible');

  const handleOpenModal = () => {
    if (relevantBatches.length >= 2) {
      setSkippedBatchId(relevantBatches[0].id);
      setAllocatedBatchId(relevantBatches[1].id);
    } else if (relevantBatches.length === 1) {
      setSkippedBatchId(relevantBatches[0].id);
      setAllocatedBatchId(relevantBatches[0].id);
    }
    setShowModal(true);
  };

  const handleCreateException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skippedBatchId || !allocatedBatchId || !justificationReason) return;

    requestFifoException({
      requestedCommodity: commodity,
      requestedVariety: variety,
      requestedBags: typeof requestedBags === 'number' ? requestedBags : 50,
      skippedBatchId,
      allocatedBatchId,
      justificationReason,
    });

    setShowModal(false);
    setJustificationReason('');
  };

  const filteredExceptions = fifoExceptions.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requestedCommodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skippedBatchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.allocatedBatchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.justificationReason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingExceptions = fifoExceptions.filter((e) => e.status === 'Pending Approval').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 rounded border border-rose-200 dark:border-rose-800 uppercase tracking-wider">
              Vigilance Control
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Rule Deviation & Override Log</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            FIFO Exceptions & Out-of-Sequence Audit Register
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Strict surveillance over instances where older grain batches are bypassed. Requires authorized digital sign-off.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>File FIFO Exception Request</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {pendingExceptions}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">awaiting review</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Requires Manager / Auditor authorization
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Total Historical Exceptions</span>
            <AlertOctagon className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#344054] dark:text-[#F1F5F9]">
              {fifoExceptions.length}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">logged events</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            100% traceable to physical causes
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Statutory Compliance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              98.4%
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">standard</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Well within FCI &le;3.0% allowance limit
          </div>
        </div>
      </div>

      {/* Filter & Register */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter exceptions by ID, batch, justification, or commodity..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
            >
              <option value="ALL">All Exceptions ({fifoExceptions.length})</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#E7E2DF] dark:border-[#293445] rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#111827] text-[#707887] dark:text-[#A1AAB9] font-semibold border-b border-[#E7E2DF] dark:border-[#293445]">
              <tr>
                <th className="py-2.5 px-3">Exception ID & Date</th>
                <th className="py-2.5 px-3">Commodity & Quantity</th>
                <th className="py-2.5 px-3">Bypassed Older Batch</th>
                <th className="py-2.5 px-3">Allocated Alternate Batch</th>
                <th className="py-2.5 px-3">Operational Justification</th>
                <th className="py-2.5 px-3">Status & Approver</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
              {filteredExceptions.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1A2230]/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    <div className="font-bold text-[#702D3B] dark:text-[#E4B34F]">{item.id}</div>
                    <div className="text-[#707887] dark:text-[#A1AAB9]">{item.timestamp.split('T')[0]}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-[#344054] dark:text-[#F1F5F9]">
                      {item.requestedCommodity}
                    </div>
                    <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] font-mono">
                      {item.requestedBags} bags ({((item.requestedBags * 50) / 100).toFixed(1)} Qtl)
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                      {item.skippedBatchId}
                    </div>
                    <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] font-mono">
                      Age: {item.skippedBatchAgeDays} days
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      {item.allocatedBatchId}
                    </div>
                    <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] font-mono">
                      Age: {item.allocatedBatchAgeDays} days
                    </div>
                  </td>
                  <td className="py-2.5 px-3 max-w-xs text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                    <div className="line-clamp-2">{item.justificationReason}</div>
                    <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9] mt-0.5">
                      Requested by: {item.requestedBy}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === 'Approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : item.status === 'Pending Approval'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.approvedBy && (
                      <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9] mt-0.5 truncate max-w-[140px]">
                        By: {item.approvedBy}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {item.status === 'Pending Approval' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => reviewFifoException(item.id, 'Approved', 'Manager verified physical accessibility exception')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reviewFifoException(item.id, 'Rejected', 'Older batch must be rotated per NFSA norms')}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#707887] dark:text-[#A1AAB9] font-mono">Concluded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Request New FIFO Exception */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
                  File FIFO Out-of-Sequence Exception
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9] text-xs font-semibold px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateException} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                    Commodity
                  </label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value as CommodityType)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
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
                    Bags to Allocate
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={requestedBags}
                    onChange={(e) => setRequestedBags(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-1">
                  Older Batch to Bypass (Skipped) *
                </label>
                <select
                  value={skippedBatchId}
                  onChange={(e) => setSkippedBatchId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-rose-300 dark:border-rose-800 rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                  required
                >
                  {relevantBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} — Age: {b.stockAgeDays}d ({b.availableBags} bags in {b.depotLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  Alternate Batch to Allocate Instead *
                </label>
                <select
                  value={allocatedBatchId}
                  onChange={(e) => setAllocatedBatchId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-emerald-300 dark:border-emerald-800 rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                  required
                >
                  {relevantBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} — Age: {b.stockAgeDays}d ({b.availableBags} bags in {b.depotLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Operational Justification Reason *
                </label>
                <textarea
                  rows={3}
                  value={justificationReason}
                  onChange={(e) => setJustificationReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                  placeholder="e.g. Forklift aisle in Bay 03 blocked for emergency roof structural repairs; fumigation enclosure active until 2026-10-25."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2DF] dark:border-[#293445]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#344054] dark:text-[#CBD5E1] hover:bg-[#FAF7F2] dark:hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Submit Exception for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
