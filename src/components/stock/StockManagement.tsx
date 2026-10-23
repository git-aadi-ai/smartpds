import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Batch, BatchStatus, CommodityType, QualityGrade } from '../../types';
import {
  Boxes,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  MapPin,
  FileSpreadsheet,
  X,
  History,
  Shield,
  Edit3,
  ChevronDown,
} from 'lucide-react';

interface StockManagementProps {
  onOpenReceiptModal: () => void;
  selectedBatchIdForDetails: string | null;
  onClearSelectedBatchId: () => void;
  onSelectBatchIdForDetails: (batchId: string) => void;
}

export const StockManagement: React.FC<StockManagementProps> = ({
  onOpenReceiptModal,
  selectedBatchIdForDetails,
  onClearSelectedBatchId,
  onSelectBatchIdForDetails,
}) => {
  const { batches, currentRole, updateBatchStatus, editBatchMetadata, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [commodityFilter, setCommodityFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'age' | 'receivedDate' | 'availableBags'>('age');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Edit metadata modal state
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editBayLocation, setEditBayLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editMoisture, setEditMoisture] = useState<number>(11.5);

  // Status Change Modal
  const [statusChangeBatch, setStatusChangeBatch] = useState<Batch | null>(null);
  const [newTargetStatus, setNewTargetStatus] = useState<BatchStatus>('Quarantined');
  const [statusReason, setStatusReason] = useState('');

  // Active Batch for details drawer
  const detailBatch = useMemo(() => {
    if (!selectedBatchIdForDetails) return null;
    return batches.find((b) => b.id === selectedBatchIdForDetails) || null;
  }, [batches, selectedBatchIdForDetails]);

  // Filter & Sort
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      // Status filter
      if (statusFilter === 'ELIGIBLE' && (b.status !== 'Eligible' || b.availableBags <= 0)) return false;
      if (statusFilter === 'AGEING' && (b.status !== 'Eligible' || b.stockAgeDays < 90 || b.availableBags <= 0)) return false;
      if (statusFilter === 'QUARANTINED' && b.status !== 'Quarantined') return false;
      if (statusFilter === 'DAMAGED' && b.status !== 'Damaged') return false;
      if (statusFilter === 'EXHAUSTED' && b.status !== 'Exhausted' && b.availableBags > 0) return false;

      // Commodity filter
      if (commodityFilter !== 'ALL' && b.commodity !== commodityFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = b.id.toLowerCase().includes(q);
        const matchesVariety = b.variety.toLowerCase().includes(q);
        const matchesLocation = b.depotLocation.toLowerCase().includes(q);
        const matchesSupplier = b.supplierSource.toLowerCase().includes(q);
        if (!matchesId && !matchesVariety && !matchesLocation && !matchesSupplier) return false;
      }

      return true;
    }).sort((a, b) => {
      let comp = 0;
      if (sortField === 'age') {
        comp = a.stockAgeDays - b.stockAgeDays;
      } else if (sortField === 'receivedDate') {
        comp = new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime();
      } else if (sortField === 'availableBags') {
        comp = a.availableBags - b.availableBags;
      }
      return sortOrder === 'desc' ? -comp : comp;
    });
  }, [batches, statusFilter, commodityFilter, searchQuery, sortField, sortOrder]);

  const handleOpenEdit = (batch: Batch) => {
    if (currentRole === 'Vigilance Auditor') {
      addToast('error', 'Read-Only Permission', 'Auditors cannot edit batch storage details.');
      return;
    }
    setEditingBatch(batch);
    setEditBayLocation(batch.depotLocation);
    setEditNotes(batch.notes || '');
    setEditMoisture(batch.moisturePercentage);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    editBatchMetadata(editingBatch.id, {
      depotLocation: editBayLocation.trim(),
      notes: editNotes.trim(),
      moisturePercentage: Number(editMoisture),
    });

    setEditingBatch(null);
  };

  const handleOpenStatusChange = (batch: Batch) => {
    if (currentRole === 'Depot Operator') {
      addToast('error', 'Role Restriction', 'Depot Operators cannot change quarantine status. Manager authorization required.');
      return;
    }
    setStatusChangeBatch(batch);
    setNewTargetStatus(batch.status === 'Eligible' ? 'Quarantined' : 'Eligible');
    setStatusReason('');
  };

  const handleConfirmStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusChangeBatch) return;
    if (!statusReason.trim()) {
      addToast('error', 'Validation Error', 'Official justification or lab reference reason is mandatory.');
      return;
    }

    updateBatchStatus(statusChangeBatch.id, newTargetStatus, statusReason.trim());
    setStatusChangeBatch(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] tracking-tight">
            Commodity Batch Register
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Physical stock monitoring, moisture index, and stack location records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReceiptModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#702D3B] hover:bg-[#54212D] dark:bg-[#801B3A] dark:hover:bg-[#9E2248] rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Stock Receipt</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Segmented Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#FAF7F2] dark:bg-[#111827] rounded-lg border border-[#E7E2DF] dark:border-[#293445]">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-[#151C28] text-[#344054] dark:text-[#F1F5F9] shadow-2xs font-semibold ring-1 ring-[#702D3B]/20 dark:ring-[#801B3A]'
                  : 'text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9]'
              }`}
            >
              All Batches ({batches.length})
            </button>
            <button
              onClick={() => setStatusFilter('ELIGIBLE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'ELIGIBLE'
                  ? 'bg-white dark:bg-[#151C28] text-emerald-800 dark:text-emerald-400 shadow-2xs font-semibold ring-1 ring-emerald-300 dark:ring-emerald-700'
                  : 'text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9]'
              }`}
            >
              Eligible ({batches.filter((b) => b.status === 'Eligible' && b.availableBags > 0).length})
            </button>
            <button
              onClick={() => setStatusFilter('AGEING')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'AGEING'
                  ? 'bg-white dark:bg-[#151C28] text-amber-800 dark:text-amber-400 shadow-2xs font-semibold ring-1 ring-amber-300 dark:ring-amber-700'
                  : 'text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9]'
              }`}
            >
              Ageing &gt;90d ({batches.filter((b) => b.status === 'Eligible' && b.stockAgeDays >= 90 && b.availableBags > 0).length})
            </button>
            <button
              onClick={() => setStatusFilter('QUARANTINED')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'QUARANTINED'
                  ? 'bg-white dark:bg-[#151C28] text-amber-900 dark:text-amber-300 shadow-2xs font-semibold ring-1 ring-amber-400 dark:ring-amber-700'
                  : 'text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9]'
              }`}
            >
              Quarantined ({batches.filter((b) => b.status === 'Quarantined').length})
            </button>
            <button
              onClick={() => setStatusFilter('DAMAGED')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'DAMAGED'
                  ? 'bg-white dark:bg-[#151C28] text-rose-800 dark:text-rose-400 shadow-2xs font-semibold ring-1 ring-rose-300 dark:ring-rose-700'
                  : 'text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9]'
              }`}
            >
              Damaged ({batches.filter((b) => b.status === 'Damaged').length})
            </button>
            <button
              onClick={() => setStatusFilter('EXHAUSTED')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'EXHAUSTED'
                  ? 'bg-white dark:bg-[#151C28] text-[#344054] dark:text-[#F1F5F9] shadow-2xs font-semibold ring-1 ring-slate-300 dark:ring-slate-700'
                  : 'text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9]'
              }`}
            >
              Exhausted ({batches.filter((b) => b.status === 'Exhausted' || b.availableBags === 0).length})
            </button>
          </div>

          {/* Commodity Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9] font-medium">Commodity:</span>
            <select
              value={commodityFilter}
              onChange={(e) => setCommodityFilter(e.target.value)}
              className="text-xs py-1.5 px-3 bg-white dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
            >
              <option value="ALL">All Grains</option>
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Coarse Grains">Coarse Grains</option>
              <option value="Pulses">Pulses</option>
            </select>
          </div>
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E7E2DF] dark:border-[#293445]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Batch ID, variety, bay, supplier..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg outline-none focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] text-[#344054] dark:text-[#F1F5F9] placeholder:text-[#707887] dark:placeholder:text-[#A1AAB9]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs text-[#344054] dark:text-[#F1F5F9]">
            <span className="text-[#707887] dark:text-[#A1AAB9]">Sort by:</span>
            <button
              onClick={() => {
                if (sortField === 'age') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortField('age'); setSortOrder('desc'); }
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs transition-colors ${
                sortField === 'age'
                  ? 'border-[#702D3B] dark:border-[#801B3A] bg-[#FAF2F4] dark:bg-[#3B1020]/60 text-[#702D3B] dark:text-[#E4B34F] font-semibold'
                  : 'border-[#E7E2DF] dark:border-[#293445] bg-white dark:bg-[#111827] hover:bg-[#FAF7F2] dark:hover:bg-[#151C28] text-[#344054] dark:text-[#F1F5F9]'
              }`}
            >
              <span>Age (FIFO Priority)</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                if (sortField === 'availableBags') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortField('availableBags'); setSortOrder('desc'); }
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs transition-colors ${
                sortField === 'availableBags'
                  ? 'border-[#702D3B] dark:border-[#801B3A] bg-[#FAF2F4] dark:bg-[#3B1020]/60 text-[#702D3B] dark:text-[#E4B34F] font-semibold'
                  : 'border-[#E7E2DF] dark:border-[#293445] bg-white dark:bg-[#111827] hover:bg-[#FAF7F2] dark:hover:bg-[#151C28] text-[#344054] dark:text-[#F1F5F9]'
              }`}
            >
              <span>Stock Quantity</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#111827] border-b border-[#E7E2DF] dark:border-[#293445] text-[#707887] dark:text-[#A1AAB9] font-semibold">
              <tr>
                <th className="py-3 px-4">Batch ID & Variety</th>
                <th className="py-3 px-3">Received Date</th>
                <th className="py-3 px-3">Stock Age</th>
                <th className="py-3 px-3">Location / Bay</th>
                <th className="py-3 px-3 text-right">Available Stock</th>
                <th className="py-3 px-3">Quality & Moisture</th>
                <th className="py-3 px-3">Eligibility Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
              {filteredBatches.length > 0 ? (
                filteredBatches.map((batch) => {
                  const isEligible = batch.status === 'Eligible' && batch.availableBags > 0;
                  const isAgeing = isEligible && batch.stockAgeDays >= 90;

                  return (
                    <tr
                      key={batch.id}
                      className={`hover:bg-[#FAF7F2]/80 dark:hover:bg-[#1E293B]/60 transition-colors ${
                        selectedBatchIdForDetails === batch.id ? 'bg-[#FAF2F4]/60 dark:bg-[#3B1020]/40' : ''
                      }`}
                    >
                      {/* Batch ID */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-[#344054] dark:text-[#F1F5F9]">{batch.id}</div>
                        <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-0.5">
                          {batch.commodity} · {batch.variety}
                        </div>
                      </td>

                      {/* Received Date */}
                      <td className="py-3 px-3 font-mono text-[#344054] dark:text-[#CBD5E1] tabular-nums">
                        {batch.receivedDate}
                      </td>

                      {/* Stock Age */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-semibold tabular-nums ${
                              batch.stockAgeDays >= 90
                                ? 'text-amber-700 dark:text-amber-400'
                                : batch.stockAgeDays >= 60
                                ? 'text-[#702D3B] dark:text-[#E4B34F]'
                                : 'text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {batch.stockAgeDays}d
                          </span>
                          {isAgeing && (
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1 py-0.5 rounded font-medium border border-amber-200 dark:border-amber-800/60">
                              FIFO Due
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3">
                        <div className="text-[#344054] dark:text-[#F1F5F9] font-medium truncate max-w-[140px]">
                          {batch.depotLocation}
                        </div>
                        <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9] truncate max-w-[140px]">
                          {batch.warehouseName}
                        </div>
                      </td>

                      {/* Available Stock */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-[#344054] dark:text-[#F1F5F9] tabular-nums">
                          {batch.availableBags.toLocaleString()} bags
                        </div>
                        <div className="text-[11px] font-mono text-[#707887] dark:text-[#A1AAB9] tabular-nums">
                          {batch.availableQtl} Qtl
                        </div>
                      </td>

                      {/* Quality & Moisture */}
                      <td className="py-3 px-3">
                        <div className="text-[#344054] dark:text-[#F1F5F9]">{batch.qualityInspectionGrade}</div>
                        <div
                          className={`text-[11px] font-mono font-medium ${
                            batch.moisturePercentage > 12.0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-[#707887] dark:text-[#A1AAB9]'
                          }`}
                        >
                          Moisture: {batch.moisturePercentage}%
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {batch.status === 'Eligible' && batch.availableBags > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Eligible (FIFO)</span>
                          </span>
                        )}
                        {batch.status === 'Quarantined' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Quarantined (Locked)</span>
                          </span>
                        )}
                        {batch.status === 'Damaged' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            <span>Damaged (Barred)</span>
                          </span>
                        )}
                        {(batch.status === 'Exhausted' || batch.availableBags === 0) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#707887] dark:text-[#A1AAB9] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-[#E7E2DF] dark:border-[#293445]">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Exhausted</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectBatchIdForDetails(batch.id)}
                            className="px-2 py-1 text-[11px] font-semibold text-[#702D3B] dark:text-[#E4B34F] bg-[#FAF2F4] dark:bg-[#3B1020]/60 hover:bg-[#F5E5E8] dark:hover:bg-[#3B1020] border border-[#E8CCD2] dark:border-[#801B3A]/60 rounded-md transition-colors"
                            title="View Lifecycle & Stock Movements"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleOpenEdit(batch)}
                            className="p-1 text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9] hover:bg-[#FAF7F2] dark:hover:bg-[#111827] rounded-md transition-colors"
                            title="Edit Bay & Notes"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {currentRole !== 'Depot Operator' && (
                            <button
                              onClick={() => handleOpenStatusChange(batch)}
                              className="p-1 text-[#707887] dark:text-[#A1AAB9] hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-md transition-colors"
                              title="Override Quarantine/Eligible Status"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#707887] dark:text-[#A1AAB9]">
                    <Boxes className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <div className="text-sm font-semibold text-[#344054] dark:text-[#F1F5F9]">No matching batches found</div>
                    <div className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1">
                      Try clearing filters or search terms.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Details Drawer / Modal */}
      {detailBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E7E2DF] dark:border-[#293445] bg-[#FAF7F2] dark:bg-[#111827]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#344054] dark:text-[#F1F5F9] font-mono">
                    {detailBatch.id}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      detailBatch.status === 'Eligible'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : detailBatch.status === 'Quarantined'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : detailBatch.status === 'Damaged'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-[#707887] dark:text-[#A1AAB9]'
                    }`}
                  >
                    {detailBatch.status}
                  </span>
                </div>
                <div className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
                  {detailBatch.commodity} ({detailBatch.variety}) · Inward: {detailBatch.receivedDate} ({detailBatch.stockAgeDays} days ago)
                </div>
              </div>
              <button
                onClick={onClearSelectedBatchId}
                className="p-1.5 text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9] hover:bg-[#F3EFEA] dark:hover:bg-[#111827] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#FAF7F2] dark:bg-[#111827] rounded-xl border border-[#E7E2DF] dark:border-[#293445] text-xs">
                <div>
                  <span className="text-[#707887] dark:text-[#A1AAB9] block text-[10px]">Initial Received</span>
                  <span className="font-mono font-bold text-[#344054] dark:text-[#F1F5F9]">
                    {detailBatch.initialBags} bags ({detailBatch.totalReceivedQtl} Qtl)
                  </span>
                </div>
                <div>
                  <span className="text-[#707887] dark:text-[#A1AAB9] block text-[10px]">Current Available</span>
                  <span className="font-mono font-bold text-[#702D3B] dark:text-[#E4B34F]">
                    {detailBatch.availableBags} bags ({detailBatch.availableQtl} Qtl)
                  </span>
                </div>
                <div>
                  <span className="text-[#707887] dark:text-[#A1AAB9] block text-[10px]">Moisture Index</span>
                  <span
                    className={`font-mono font-bold ${
                      detailBatch.moisturePercentage > 12.0 ? 'text-rose-600 dark:text-rose-400' : 'text-[#344054] dark:text-[#F1F5F9]'
                    }`}
                  >
                    {detailBatch.moisturePercentage}%
                  </span>
                </div>
                <div>
                  <span className="text-[#707887] dark:text-[#A1AAB9] block text-[10px]">Inspection Grade</span>
                  <span className="font-semibold text-[#344054] dark:text-[#F1F5F9]">
                    {detailBatch.qualityInspectionGrade}
                  </span>
                </div>
              </div>

              {/* Location & Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg border border-[#E7E2DF] dark:border-[#293445] bg-white dark:bg-[#111827]">
                  <span className="text-[11px] font-semibold text-[#707887] dark:text-[#A1AAB9] uppercase tracking-wider block">
                    Storage Bay Location
                  </span>
                  <div className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
                    {detailBatch.depotLocation}
                  </div>
                  <div className="text-[#707887] dark:text-[#A1AAB9] mt-0.5">{detailBatch.warehouseName}</div>
                </div>

                <div className="p-3.5 rounded-lg border border-[#E7E2DF] dark:border-[#293445] bg-white dark:bg-[#111827]">
                  <span className="text-[11px] font-semibold text-[#707887] dark:text-[#A1AAB9] uppercase tracking-wider block">
                    Supplier / Source Depot
                  </span>
                  <div className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
                    {detailBatch.supplierSource}
                  </div>
                  <div className="text-[#707887] dark:text-[#A1AAB9] mt-0.5">Central Pool Rake Consignment</div>
                </div>
              </div>

              {/* Status Reason / Alerts */}
              {detailBatch.statusReason && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1">Status Note / Advisory:</span>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed">{detailBatch.statusReason}</p>
                </div>
              )}

              {/* Movement History */}
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-[#E7E2DF] dark:border-[#293445] text-xs font-bold text-[#344054] dark:text-[#F1F5F9] uppercase tracking-wider">
                  <History className="w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
                  <span>Stock Movement Ledger</span>
                </div>

                <div className="mt-3 space-y-2">
                  {detailBatch.movements && detailBatch.movements.length > 0 ? (
                    detailBatch.movements.map((mov) => (
                      <div
                        key={mov.id}
                        className="p-3 bg-[#FAF7F2] dark:bg-[#111827] rounded-lg border border-[#E7E2DF] dark:border-[#293445] flex items-start justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                                mov.action === 'RECEIPT'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : mov.action === 'DISPATCH'
                                  ? 'bg-[#FAF2F4] dark:bg-[#3B1020]/60 text-[#702D3B] dark:text-[#E4B34F] border border-[#E8CCD2] dark:border-[#801B3A]/60'
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {mov.action}
                            </span>
                            <span className="font-mono text-[#344054] dark:text-[#F1F5F9]">{mov.date}</span>
                            <span className="text-[#707887] dark:text-[#A1AAB9] font-mono">Ref: {mov.referenceId}</span>
                          </div>
                          <p className="text-[#344054] dark:text-[#CBD5E1] mt-1 text-[11px]">{mov.notes}</p>
                          <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9] mt-1">Operator: {mov.user}</div>
                        </div>
                        <div className="text-right font-mono font-bold text-[#344054] dark:text-[#F1F5F9] tabular-nums">
                          {mov.action === 'DISPATCH' ? '-' : '+'}
                          {mov.quantityBags} bags
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#707887] dark:text-[#A1AAB9] py-3 text-center">
                      No stock movement history recorded for this batch.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#FAF7F2] dark:bg-[#111827] border-t border-[#E7E2DF] dark:border-[#293445] flex items-center justify-between">
              <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">
                FIFO Queue Priority: {detailBatch.status === 'Eligible' ? 'Active' : 'Barred from Queue'}
              </span>
              <button
                onClick={onClearSelectedBatchId}
                className="px-4 py-2 text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] bg-white dark:bg-[#151C28] hover:bg-[#FAF7F2] dark:hover:bg-[#1E293B] border border-[#E7E2DF] dark:border-[#293445] rounded-lg transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
              <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
                Edit Metadata: <span className="font-mono text-[#702D3B] dark:text-[#E4B34F]">{editingBatch.id}</span>
              </h3>
              <button
                onClick={() => setEditingBatch(null)}
                className="p-1 text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#344054] dark:text-[#F1F5F9] mb-1">
                  Storage Bay / Stack Location
                </label>
                <input
                  type="text"
                  required
                  value={editBayLocation}
                  onChange={(e) => setEditBayLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] text-[#344054] dark:text-[#F1F5F9] rounded-lg focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#344054] dark:text-[#F1F5F9] mb-1">
                  Verified Moisture Content (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="25"
                  required
                  value={editMoisture}
                  onChange={(e) => setEditMoisture(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] text-[#344054] dark:text-[#F1F5F9] rounded-lg focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-[#344054] dark:text-[#F1F5F9] mb-1">
                  Operational / Fumigation Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] text-[#344054] dark:text-[#F1F5F9] rounded-lg focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
                  placeholder="Stack details, pest control dates, dunnage remarks..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E2DF] dark:border-[#293445]">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-4 py-2 font-medium text-[#707887] dark:text-[#A1AAB9] hover:bg-[#FAF7F2] dark:hover:bg-[#111827] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-[#702D3B] hover:bg-[#54212D] dark:bg-[#801B3A] dark:hover:bg-[#9E2248] rounded-lg shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Override Batch Status Modal */}
      {statusChangeBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
                  Authority Status Override: <span className="font-mono text-[#702D3B] dark:text-[#E4B34F]">{statusChangeBatch.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setStatusChangeBatch(null)}
                className="p-1 text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmStatusChange} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                Current status is <span className="font-bold">{statusChangeBatch.status}</span>.
                Altering status directly affects eligibility in the automated FIFO dispatch engine.
              </div>

              <div>
                <label className="block font-medium text-[#344054] dark:text-[#F1F5F9] mb-1">
                  Target Status
                </label>
                <select
                  value={newTargetStatus}
                  onChange={(e) => setNewTargetStatus(e.target.value as BatchStatus)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] text-[#344054] dark:text-[#F1F5F9] rounded-lg focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
                >
                  <option value="Eligible">Eligible (Release to FIFO Queue)</option>
                  <option value="Quarantined">Quarantined (Lock pending test)</option>
                  <option value="Damaged">Damaged (Permanent Bar)</option>
                  <option value="Exhausted">Exhausted (Archive)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#344054] dark:text-[#F1F5F9] mb-1">
                  Official Justification / Order Reference <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] text-[#344054] dark:text-[#F1F5F9] rounded-lg focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
                  placeholder="Specify lab test result, moisture variance, or vigilance directive..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E2DF] dark:border-[#293445]">
                <button
                  type="button"
                  onClick={() => setStatusChangeBatch(null)}
                  className="px-4 py-2 font-medium text-[#707887] dark:text-[#A1AAB9] hover:bg-[#FAF7F2] dark:hover:bg-[#111827] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-[#702D3B] hover:bg-[#54212D] dark:bg-[#801B3A] dark:hover:bg-[#9E2248] rounded-lg shadow-xs transition-colors"
                >
                  Apply Status Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
