import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLog } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Info,
  Clock,
  User,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = log.referenceId.toLowerCase().includes(q);
        const matchesUser = log.user.toLowerCase().includes(q);
        const matchesDetails = log.details.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        if (!matchesRef && !matchesUser && !matchesDetails && !matchesAction) return false;
      }

      return true;
    });
  }, [auditLogs, actionFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Audit Disclaimers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] tracking-tight">
            Depot Event & Audit Ledger
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Operational activity trail recording receipts, FIFO dispatches, and quarantine adjustments
          </p>
        </div>
      </div>

      {/* Honest Prototype Notice */}
      <div className="p-4 bg-[#FAF7F2] dark:bg-[#111827] rounded-xl border border-[#E7E2DF] dark:border-[#293445] text-xs text-[#707887] dark:text-[#A1AAB9] leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-[#702D3B] dark:text-[#E4B34F] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#344054] dark:text-[#F1F5F9]">Demonstration Audit Log Architecture:</span>{' '}
          This audit trail is maintained in client-side storage for the hackathon prototype. While every stock transaction, inward receipt, and FIFO status change is logged here with operator metadata, enterprise-grade tamper-proofing in production requires an append-only verifiable backend or distributed ledger integration.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Reference ID, operator, or details..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg outline-none focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] text-[#344054] dark:text-[#F1F5F9] placeholder:text-[#707887] dark:placeholder:text-[#A1AAB9]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-[#707887] dark:text-[#A1AAB9] font-medium">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-white dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
          >
            <option value="ALL">All Events ({auditLogs.length})</option>
            <option value="FIFO_DISPATCH">FIFO Dispatches</option>
            <option value="STOCK_RECEIPT">Stock Receipts</option>
            <option value="STATUS_CHANGE">Status Overrides</option>
            <option value="BATCH_UPDATE">Batch Edits</option>
            <option value="DEMO_RESET">System Resets</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#111827] border-b border-[#E7E2DF] dark:border-[#293445] text-[#707887] dark:text-[#A1AAB9] font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Operator / Role</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Entity & Reference</th>
                <th className="py-3 px-3">Result</th>
                <th className="py-3 px-3">Activity Summary</th>
                <th className="py-3 px-4 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  let badgeClass = 'bg-[#FAF2F4] dark:bg-[#3B1020]/60 text-[#702D3B] dark:text-[#E4B34F] border border-[#E7E2DF] dark:border-[#801B3A]/50';
                  if (log.action === 'STOCK_RECEIPT') badgeClass = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
                  if (log.action === 'STATUS_CHANGE') badgeClass = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
                  if (log.action === 'DEMO_RESET') badgeClass = 'bg-[#FAF7F2] dark:bg-[#111827] text-[#707887] dark:text-[#A1AAB9] border border-[#E7E2DF] dark:border-[#293445]';

                  return (
                    <tr key={log.id} className="hover:bg-[#FAF7F2]/80 dark:hover:bg-[#1E293B]/60 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[#344054] dark:text-[#CBD5E1] whitespace-nowrap">
                        <div>{log.timestamp.split('T')[0]}</div>
                        <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">
                          {log.timestamp.split('T')[1]?.slice(0, 8)}
                        </div>
                      </td>

                      {/* User & Role */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#344054] dark:text-[#F1F5F9]">{log.user}</div>
                        <div className="text-[10px] text-[#702D3B] dark:text-[#E4B34F] font-medium">{log.role}</div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${badgeClass}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Entity & Ref */}
                      <td className="py-3 px-3 font-mono font-medium text-[#344054] dark:text-[#F1F5F9]">
                        <div>{log.referenceId}</div>
                        <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">{log.entity}</div>
                      </td>

                      {/* Result */}
                      <td className="py-3 px-3">
                        {log.result === 'SUCCESS' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Success</span>
                          </span>
                        )}
                        {log.result === 'WARNING' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Warning</span>
                          </span>
                        )}
                        {log.result === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="py-3 px-3 text-[#707887] dark:text-[#A1AAB9] max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1 text-[#707887] dark:text-[#A1AAB9] hover:text-[#702D3B] dark:hover:text-[#E4B34F] hover:bg-[#FAF2F4] dark:hover:bg-[#3B1020]/40 rounded transition-colors"
                          title="Inspect complete log record"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#707887] dark:text-[#A1AAB9]">
                    <ShieldCheck className="w-8 h-8 mx-auto text-[#707887]/50 dark:text-[#A1AAB9]/50 mb-2" />
                    <div className="text-sm font-semibold text-[#344054] dark:text-[#F1F5F9]">No log entries matched</div>
                    <div className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1">Try resetting the search query.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#702D3B] dark:text-[#E4B34F]" />
                <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
                  Audit Entry Details: <span className="font-mono text-[#702D3B] dark:text-[#E4B34F]">{selectedLog.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F2] dark:bg-[#111827] rounded-lg border border-[#E7E2DF] dark:border-[#293445]">
                <div>
                  <span className="text-[#707887] dark:text-[#A1AAB9] block text-[10px]">Timestamp (UTC)</span>
                  <span className="font-mono text-[#344054] dark:text-[#CBD5E1] font-semibold">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-[#707887] dark:text-[#A1AAB9] block text-[10px]">Action Type</span>
                  <span className="font-mono font-bold text-[#702D3B] dark:text-[#E4B34F]">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-[#707887] dark:text-[#A1AAB9] block text-[10px]">Recorded User</span>
                  <span className="text-[#344054] dark:text-[#F1F5F9] font-semibold">{selectedLog.user}</span>
                </div>
                <div>
                  <span className="text-[#707887] dark:text-[#A1AAB9] block text-[10px]">Operator Role</span>
                  <span className="text-[#344054] dark:text-[#F1F5F9] font-semibold">{selectedLog.role}</span>
                </div>
              </div>

              <div>
                <span className="text-[#707887] dark:text-[#A1AAB9] font-semibold block mb-1">
                  Target Entity & Reference ID
                </span>
                <div className="p-2.5 bg-[#FAF7F2] dark:bg-[#111827] rounded-lg border border-[#E7E2DF] dark:border-[#293445] font-mono text-[#344054] dark:text-[#F1F5F9]">
                  {selectedLog.entity} · {selectedLog.referenceId}
                </div>
              </div>

              <div>
                <span className="text-[#707887] dark:text-[#A1AAB9] font-semibold block mb-1">
                  Complete Event Payload & Details
                </span>
                <div className="p-3 bg-[#FAF7F2] dark:bg-[#111827] rounded-lg border border-[#E7E2DF] dark:border-[#293445] text-[#344054] dark:text-[#F1F5F9] leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 mt-4 border-t border-[#E7E2DF] dark:border-[#293445]">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] bg-[#FAF7F2] dark:bg-[#111827] hover:bg-[#FAF2F4] dark:hover:bg-[#1E293B] border border-[#E7E2DF] dark:border-[#293445] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
