import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  PlusCircle,
  Search,
  Filter,
  Warehouse,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const StockReconciliationView: React.FC = () => {
  const { batches, reconciliations, addReconciliation, reviewReconciliation, currentRole, addToast } = useApp();

  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [physicalCount, setPhysicalCount] = useState<number | ''>(100);
  const [varianceReason, setVarianceReason] = useState('Routine physical verification count');
  const [auditorName, setAuditorName] = useState(() =>
    currentRole === 'Warehouse Manager' ? 'Anand Kumar (Manager)' : currentRole === 'Depot Operator' ? 'Rajesh V. (Operator)' : 'Dr. Sunita Rao (Vigilance Auditor)'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Reconciled' | 'Pending Approval' | 'Discrepancy' | 'Adjusted'>('ALL');
  const [showNewModal, setShowNewModal] = useState(false);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const systemBags = selectedBatch ? selectedBatch.availableBags : 0;
  const countedNum = typeof physicalCount === 'number' ? physicalCount : systemBags;
  const varianceBags = countedNum - systemBags;
  const varianceQtl = Number((((varianceBags * (selectedBatch?.bagWeightKg || 50))) / 100).toFixed(2));

  const handleAddVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    addReconciliation({
      batchId: selectedBatch.id,
      commodity: selectedBatch.commodity,
      variety: selectedBatch.variety,
      bay: selectedBatch.depotLocation,
      systemBags,
      physicalCountedBags: countedNum,
      varianceBags,
      varianceQtl,
      auditorName,
      varianceReason,
    });

    setShowNewModal(false);
    setVarianceReason('Routine physical verification count');
  };

  const filteredReconciliations = reconciliations.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.auditorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const reconciledCount = reconciliations.filter((r) => r.status === 'Reconciled').length;
  const pendingCount = reconciliations.filter((r) => r.status === 'Pending Approval').length;
  const discrepancyCount = reconciliations.filter((r) => r.varianceBags !== 0).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Physical Stock Audit
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">System vs Physical Floor Count</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Physical Stock Reconciliation & Variance Gate
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Conduct 100% stack verification counts, record hook damages or spillage variances, and authorize adjustments.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Physical Audit Count</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>100% Tallied Stacks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {reconciledCount}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">stacks verified</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Zero count variance logged
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Pending Manager Reviews</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {pendingCount}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">adjustments pending</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Requires Manager / Vigilance digital sign-off
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Historical Discrepancies</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#344054] dark:text-[#F1F5F9]">
              {discrepancyCount}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">events tracked</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Logged under statutory handling norms
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by reconciliation ID, batch ID, auditor..."
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
              <option value="ALL">All Records ({reconciliations.length})</option>
              <option value="Reconciled">Reconciled (Tally)</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Adjusted">Adjusted</option>
              <option value="Discrepancy">Discrepancy</option>
            </select>
          </div>
        </div>

        {/* Reconciliations Table */}
        <div className="overflow-x-auto border border-[#E7E2DF] dark:border-[#293445] rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#111827] text-[#707887] dark:text-[#A1AAB9] font-semibold border-b border-[#E7E2DF] dark:border-[#293445]">
              <tr>
                <th className="py-2.5 px-3">Audit ID & Date</th>
                <th className="py-2.5 px-3">Batch & Bay Location</th>
                <th className="py-2.5 px-3 text-right">System Count</th>
                <th className="py-2.5 px-3 text-right">Physical Count</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
                <th className="py-2.5 px-3">Auditor & Justification</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
              {filteredReconciliations.map((rec) => {
                const isDiscrepant = rec.varianceBags !== 0;
                return (
                  <tr key={rec.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1A2230]/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <div className="font-bold text-[#702D3B] dark:text-[#E4B34F]">{rec.id}</div>
                      <div className="text-[#707887] dark:text-[#A1AAB9]">{rec.reconciledDate}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-semibold text-[#344054] dark:text-[#F1F5F9]">{rec.batchId}</div>
                      <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9]">
                        {rec.commodity} · {rec.bay}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1]">
                      {rec.systemBags} bags
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1]">
                      {rec.physicalCountedBags} bags
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                      {rec.varianceBags === 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">0 bags (0.0 Qtl)</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          {rec.varianceBags > 0 ? `+${rec.varianceBags}` : rec.varianceBags} bags ({rec.varianceQtl} Qtl)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="text-[11px] font-medium text-[#344054] dark:text-[#CBD5E1] truncate">
                        {rec.auditorName}
                      </div>
                      <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9] truncate">
                        {rec.varianceReason || 'No notes'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          rec.status === 'Reconciled'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : rec.status === 'Pending Approval'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : rec.status === 'Adjusted'
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {rec.status === 'Pending Approval' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => reviewReconciliation(rec.id, 'Approve', 'Authorized by Manager in audit view')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
                            title="Approve adjustment"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => reviewReconciliation(rec.id, 'Reject', 'Disputed by Manager')}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
                            title="Reject adjustment"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {rec.status !== 'Pending Approval' && (
                        <span className="text-[10px] text-[#707887] dark:text-[#A1AAB9] font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Physical Count Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
                  Log Stack Physical Count
                </h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9] text-xs font-semibold px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVerification} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Select Batch Stack *
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => {
                    setSelectedBatchId(e.target.value);
                    const b = batches.find((item) => item.id === e.target.value);
                    if (b) setPhysicalCount(b.availableBags);
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} — {b.commodity} ({b.variety}) · {b.depotLocation} ({b.availableBags} bags in system)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F2] dark:bg-[#111827] rounded-lg border border-[#E7E2DF] dark:border-[#293445]">
                <div>
                  <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9] uppercase font-semibold">
                    Current System Balance
                  </div>
                  <div className="text-base font-bold font-mono text-[#344054] dark:text-[#F1F5F9] mt-0.5">
                    {systemBags} bags
                  </div>
                  <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">
                    {((systemBags * (selectedBatch?.bagWeightKg || 50)) / 100).toFixed(1)} Qtl
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#707887] dark:text-[#A1AAB9] uppercase mb-0.5">
                    Physical Counted Bags *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20000"
                    value={physicalCount}
                    onChange={(e) => setPhysicalCount(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full px-2 py-1 bg-white dark:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445] rounded-md font-mono font-bold text-sm text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Variance Indicator */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between text-xs font-semibold ${
                  varianceBags === 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                <span>Calculated Count Variance:</span>
                <span className="font-mono text-sm">
                  {varianceBags === 0 ? 'Zero Variance (100% Match)' : `${varianceBags > 0 ? '+' : ''}${varianceBags} bags (${varianceQtl} Qtl)`}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Verification Auditor / Inspector *
                </label>
                <input
                  type="text"
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Audit Notes / Reason for Discrepancy
                </label>
                <textarea
                  rows={2}
                  value={varianceReason}
                  onChange={(e) => setVarianceReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                  placeholder="e.g. 2 bags damaged due to forklift hook snag; segregated for re-bagging."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2DF] dark:border-[#293445]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#344054] dark:text-[#CBD5E1] hover:bg-[#FAF7F2] dark:hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save Verification Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
