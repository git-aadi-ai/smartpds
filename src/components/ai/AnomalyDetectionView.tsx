import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AnomalyAlert } from '../../types';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCheck,
} from 'lucide-react';

export const AnomalyDetectionView: React.FC = () => {
  const { anomalies, resolveAnomaly, currentRole, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AnomalyAlert['severity']>('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [resolutionModalItem, setResolutionModalItem] = useState<AnomalyAlert | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      addToast('success', 'Deep Scan Complete', 'Scanned 14 depot bays, 8 challans, and 2,400 ledger records. No critical vulnerabilities found.');
    }, 1200);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionModalItem) return;
    resolveAnomaly(resolutionModalItem.id, resolutionNote || 'Reviewed and reconciled by auditor.');
    setResolutionModalItem(null);
    setResolutionNote('');
  };

  const filteredAnomalies = anomalies.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const activeCount = anomalies.filter((a) => a.status === 'Active' || a.status === 'Investigating').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 rounded border border-rose-200 dark:border-rose-800 uppercase tracking-wider">
              Autonomous Surveillance
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Heuristic & Discrepancy Scanner</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Depot Anomaly & Divergence Detection Engine
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Automated scrutiny flagging suspicious manual balance adjustments, bypassed FIFO sequences, and sensor moisture gradients.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isScanning ? 'Scanning Depot Ledger...' : 'Run Real-Time Anomaly Audit'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Active Investigation Flags</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {activeCount}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">alerts active</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Requires field verification or sign-off
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Audit Engine Precision</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              99.2%
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">confidence</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Grounded against statutory NFSA rules
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Resolved Incidents</span>
            <CheckCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#344054] dark:text-[#F1F5F9]">
              {anomalies.filter((a) => a.status === 'Resolved').length}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">cleared</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Archived in vigilance audit repository
          </div>
        </div>
      </div>

      {/* Anomaly Feed */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anomalies by ID, description, or keyword..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Severity:
            </span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredAnomalies.map((a) => {
            const isResolved = a.status === 'Resolved';
            return (
              <div
                key={a.id}
                className={`p-4 rounded-xl border transition-all ${
                  isResolved
                    ? 'bg-[#FAF7F2]/40 dark:bg-[#111827]/40 border-[#E7E2DF] dark:border-[#293445] opacity-75'
                    : a.severity === 'HIGH' || a.severity === 'CRITICAL'
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60'
                    : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        a.severity === 'HIGH' || a.severity === 'CRITICAL'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      <ShieldAlert className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#702D3B] dark:text-[#E4B34F]">
                          {a.id}
                        </span>
                        <h4 className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9]">{a.title}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.severity === 'HIGH' || a.severity === 'CRITICAL'
                              ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {a.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445] text-[#707887] dark:text-[#A1AAB9]">
                          {a.category}
                        </span>
                      </div>

                      <p className="text-xs text-[#344054] dark:text-[#CBD5E1] mt-1.5 leading-relaxed">
                        {a.description}
                      </p>

                      <div className="mt-2.5 p-2.5 rounded-lg bg-white dark:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445] text-[11px]">
                        <span className="font-semibold text-[#702D3B] dark:text-[#E4B34F]">
                          Recommended Protocol:
                        </span>{' '}
                        <span className="text-[#344054] dark:text-[#CBD5E1]">{a.actionRecommended}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-[#E7E2DF] dark:border-[#293445]">
                    {!isResolved ? (
                      <button
                        onClick={() => {
                          setResolutionModalItem(a);
                          setResolutionNote('');
                        }}
                        className="px-3 py-1.5 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Resolve Alert</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resolution Modal */}
      {resolutionModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl p-6">
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
              Resolve Anomaly Alert
            </h3>
            <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1">
              Mark alert <span className="font-mono font-bold">{resolutionModalItem.id}</span> as remediated.
            </p>

            <form onSubmit={handleConfirmResolve} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Corrective Action Taken *
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Physical moisture sensor recalibrated. Manual probe reading 12.1% recorded."
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2DF] dark:border-[#293445]">
                <button
                  type="button"
                  onClick={() => setResolutionModalItem(null)}
                  className="px-3 py-1.5 font-semibold text-[#344054] dark:text-[#CBD5E1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
