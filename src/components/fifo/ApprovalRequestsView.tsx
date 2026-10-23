import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApprovalRequest } from '../../types';
import {
  CheckCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Layers,
  ArrowRight,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

export const ApprovalRequestsView: React.FC = () => {
  const { approvalRequests, reviewApprovalRequest, currentRole, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ApprovalRequest['type']>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('ALL');
  const [reviewModalRequest, setReviewModalRequest] = useState<ApprovalRequest | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewRemarks, setReviewRemarks] = useState('');

  const filteredRequests = approvalRequests.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'ALL' || a.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const pendingCount = approvalRequests.filter((a) => a.status === 'Pending').length;

  const handleOpenReview = (req: ApprovalRequest, decision: 'Approved' | 'Rejected') => {
    setReviewModalRequest(req);
    setReviewDecision(decision);
    setReviewRemarks(decision === 'Approved' ? 'Verified in compliance with depot operational conditions.' : 'Returned for physical stack remediation.');
  };

  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalRequest) return;

    reviewApprovalRequest(reviewModalRequest.id, reviewDecision, reviewRemarks);
    setReviewModalRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Governance Gate
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Executive Authority Sign-Off</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Depot Operational Approval Desk
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Authorize or reject FIFO exceptions, physical count variances, quarantine releases, and high-volume dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Pending Authorizations</span>
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, requested officer, or details..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#707887] dark:text-[#A1AAB9]">Category:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="FIFO_EXCEPTION">FIFO Bypass Exceptions</option>
                <option value="STOCK_ADJUSTMENT">Count Discrepancies</option>
                <option value="QUARANTINE_RELEASE">Quarantine Releases</option>
                <option value="OVERSIZE_DISPATCH">High-Volume Dispatches</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#707887] dark:text-[#A1AAB9]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'Pending';
            return (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-[#E7E2DF] dark:border-[#293445] bg-[#FAF7F2]/40 dark:bg-[#111827]/70 hover:border-[#702D3B]/40 dark:hover:border-[#801B3A]/40 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        req.type === 'FIFO_EXCEPTION'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          : req.type === 'STOCK_ADJUSTMENT'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#702D3B] dark:text-[#E4B34F]">
                          {req.id}
                        </span>
                        <span className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9]">{req.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : req.status === 'Pending'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-[#344054] dark:text-[#CBD5E1] mt-1">{req.details}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#707887] dark:text-[#A1AAB9]">
                        <span>
                          Initiated by: <strong className="text-[#344054] dark:text-[#CBD5E1]">{req.requestedBy}</strong> ({req.requestedRole})
                        </span>
                        <span>·</span>
                        <span className="font-mono">{req.requestedDate.split('T')[0]}</span>
                        <span>·</span>
                        <span>Impact: <strong className="text-[#702D3B] dark:text-[#E4B34F]">{req.impact}</strong></span>
                      </div>

                      {req.reviewedBy && (
                        <div className="mt-2 text-[11px] p-2 rounded bg-white dark:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445] text-[#344054] dark:text-[#CBD5E1]">
                          <span className="font-semibold text-[#702D3B] dark:text-[#E4B34F]">
                            Review Decision:
                          </span>{' '}
                          {req.status} by {req.reviewedBy} on {req.reviewedDate?.split('T')[0]}. Remarks: {req.remarks}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-[#E7E2DF] dark:border-[#293445]">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleOpenReview(req, 'Approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleOpenReview(req, 'Rejected')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-mono text-[#707887] dark:text-[#A1AAB9]">
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredRequests.length === 0 && (
            <div className="py-12 text-center text-[#707887] dark:text-[#A1AAB9]">
              No approval requests match your search criteria.
            </div>
          )}
        </div>
      </div>

      {/* Review Confirmation Modal */}
      {reviewModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl p-6">
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
              {reviewDecision === 'Approved' ? 'Confirm Digital Approval' : 'Confirm Request Rejection'}
            </h3>
            <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1">
              You are endorsing request <span className="font-mono font-bold">{reviewModalRequest.id}</span> under your simulated role as <strong>{currentRole}</strong>.
            </p>

            <form onSubmit={handleConfirmReview} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Endorsement Remarks / Audit Justification *
                </label>
                <textarea
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2DF] dark:border-[#293445]">
                <button
                  type="button"
                  onClick={() => setReviewModalRequest(null)}
                  className="px-3 py-1.5 font-semibold text-[#344054] dark:text-[#CBD5E1] hover:bg-[#FAF7F2] dark:hover:bg-[#1E293B] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 font-semibold text-white rounded-lg transition-colors cursor-pointer ${
                    reviewDecision === 'Approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {reviewDecision}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
