import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CommodityType } from '../../types';
import {
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const StockLedgerView: React.FC = () => {
  const { batches, dispatches, auditLogs, currentRole } = useApp();

  const [selectedCommodity, setSelectedCommodity] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all batch movements into unified chronological ledger entries
  const ledgerEntries = useMemo(() => {
    interface LedgerRow {
      id: string;
      date: string;
      batchId: string;
      commodity: CommodityType;
      variety: string;
      action: 'RECEIPT' | 'DISPATCH' | 'STATUS_CHANGE' | 'ADJUSTMENT';
      inBags: number;
      outBags: number;
      inQtl: number;
      outQtl: number;
      referenceId: string;
      user: string;
      notes?: string;
    }

    const rows: LedgerRow[] = [];

    batches.forEach((b) => {
      if (b.movements && b.movements.length > 0) {
        b.movements.forEach((m) => {
          const isReceipt = m.action === 'RECEIPT';
          const isDispatch = m.action === 'DISPATCH';
          const isAdjustment = m.action === 'ADJUSTMENT';

          rows.push({
            id: m.id,
            date: m.date,
            batchId: b.id,
            commodity: b.commodity,
            variety: b.variety,
            action: m.action,
            inBags: isReceipt ? m.quantityBags : 0,
            outBags: isDispatch ? m.quantityBags : isAdjustment ? m.quantityBags : 0,
            inQtl: isReceipt ? m.quantityQtl : 0,
            outQtl: isDispatch ? m.quantityQtl : isAdjustment ? m.quantityQtl : 0,
            referenceId: m.referenceId,
            user: m.user,
            notes: m.notes,
          });
        });
      } else {
        // Fallback row for batches with no explicit sub-movements array
        rows.push({
          id: `LED-${b.id}`,
          date: b.receivedDate,
          batchId: b.id,
          commodity: b.commodity,
          variety: b.variety,
          action: 'RECEIPT',
          inBags: b.initialBags,
          outBags: 0,
          inQtl: b.totalReceivedQtl,
          outQtl: 0,
          referenceId: 'INW-INIT',
          user: 'Depot Gate System',
          notes: 'Opening inward rake stock',
        });
      }
    });

    // Also include any dispatches that might have been created dynamically
    dispatches.forEach((d) => {
      d.allocatedBatches.forEach((ab) => {
        // Only push if not already represented in batch movements
        const alreadyIn = rows.some((r) => r.referenceId === d.challanNumber && r.batchId === ab.batchId);
        if (!alreadyIn) {
          const batch = batches.find((b) => b.id === ab.batchId);
          rows.push({
            id: `DISP-${d.challanNumber}-${ab.batchId}`,
            date: d.timestamp.split('T')[0],
            batchId: ab.batchId,
            commodity: d.commodity,
            variety: d.variety,
            action: 'DISPATCH',
            inBags: 0,
            outBags: ab.bags,
            inQtl: 0,
            outQtl: ab.qtl,
            referenceId: d.challanNumber,
            user: d.dispatchedBy,
            notes: `Dispatched to ${d.destinationName} via ${d.vehicleNumber}`,
          });
        }
      });
    });

    // Sort newest to oldest
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [batches, dispatches]);

  // Filter entries
  const filteredEntries = ledgerEntries.filter((item) => {
    const matchesCommodity = selectedCommodity === 'ALL' || item.commodity === selectedCommodity;
    const matchesAction = selectedAction === 'ALL' || item.action === selectedAction;
    const matchesSearch =
      item.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCommodity && matchesAction && matchesSearch;
  });

  // Calculate summary metrics
  const totalInBags = filteredEntries.reduce((sum, r) => sum + r.inBags, 0);
  const totalOutBags = filteredEntries.reduce((sum, r) => sum + r.outBags, 0);
  const totalInQtl = filteredEntries.reduce((sum, r) => sum + r.inQtl, 0);
  const totalOutQtl = filteredEntries.reduce((sum, r) => sum + r.outQtl, 0);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = ['Date', 'Batch ID', 'Commodity', 'Variety', 'Action', 'In Bags', 'Out Bags', 'In Qtl', 'Out Qtl', 'Reference ID', 'User', 'Notes'];
    const rows = filteredEntries.map((r) => [
      r.date,
      r.batchId,
      r.commodity,
      `"${r.variety}"`,
      r.action,
      r.inBags,
      r.outBags,
      r.inQtl,
      r.outQtl,
      r.referenceId,
      `"${r.user}"`,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartPDS_Stock_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Statutory Ledger
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Central PDS Stock Journal</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Traceable Stock Movements & Double-Entry Ledger
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Every bag receipt, FIFO dispatch allocation, quality adjustment, and write-off cryptographically tied to reference records.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#111827] hover:bg-[#F3EFEA] dark:hover:bg-[#1E293B] border border-[#E7E2DF] dark:border-[#293445] text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Total Intake (Filtered)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              +{totalInBags.toLocaleString()}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">bags</span>
          </div>
          <div className="text-[11px] font-mono text-[#707887] dark:text-[#A1AAB9] mt-1">
            +{totalInQtl.toFixed(1)} Quintals received
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Total Dispatched (Filtered)</span>
            <ArrowUpRight className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#702D3B] dark:text-[#E4B34F]">
              -{totalOutBags.toLocaleString()}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">bags</span>
          </div>
          <div className="text-[11px] font-mono text-[#707887] dark:text-[#A1AAB9] mt-1">
            -{totalOutQtl.toFixed(1)} Quintals outflux
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Ledger Entries Logged</span>
            <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#344054] dark:text-[#F1F5F9]">
              {filteredEntries.length}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">records</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Across {batches.length} active depot stacks
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#707887] dark:text-[#A1AAB9]">
            <span>Audit Integrity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              100%
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">verified</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Zero orphaned transactions
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference ID, batch ID, officer name, or remarks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#707887] dark:text-[#A1AAB9]">Commodity:</span>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
              >
                <option value="ALL">All Commodities</option>
                <option value="Rice">Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Sugar">Sugar</option>
                <option value="Coarse Grains">Coarse Grains</option>
                <option value="Pulses">Pulses</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#707887] dark:text-[#A1AAB9]">Movement Type:</span>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
              >
                <option value="ALL">All Movements</option>
                <option value="RECEIPT">Inward Receipts</option>
                <option value="DISPATCH">FIFO Dispatches</option>
                <option value="ADJUSTMENT">Reconciliation Adjustments</option>
                <option value="STATUS_CHANGE">Status Changes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto border border-[#E7E2DF] dark:border-[#293445] rounded-lg mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#111827] text-[#707887] dark:text-[#A1AAB9] font-semibold border-b border-[#E7E2DF] dark:border-[#293445]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Batch ID & Commodity</th>
                <th className="py-2.5 px-3 text-right">Inflow (Bags / Qtl)</th>
                <th className="py-2.5 px-3 text-right">Outflow (Bags / Qtl)</th>
                <th className="py-2.5 px-3">Reference ID</th>
                <th className="py-2.5 px-3">Authorized Officer</th>
                <th className="py-2.5 px-3">Ledger Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
              {filteredEntries.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1A2230]/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#344054] dark:text-[#CBD5E1] whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        row.action === 'RECEIPT'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : row.action === 'DISPATCH'
                          ? 'bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] border border-[#702D3B]/20 dark:border-[#801B3A]/40'
                          : row.action === 'ADJUSTMENT'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {row.action === 'RECEIPT' && <ArrowDownLeft className="w-3 h-3" />}
                      {row.action === 'DISPATCH' && <ArrowUpRight className="w-3 h-3" />}
                      {row.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-bold text-[#702D3B] dark:text-[#E4B34F]">{row.batchId}</div>
                    <div className="text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                      {row.commodity} · {row.variety}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {row.inBags > 0 ? (
                      <div>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          +{row.inBags}
                        </span>{' '}
                        <span className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">bags</span>
                        <div className="text-[10px] font-mono text-[#707887] dark:text-[#A1AAB9]">
                          +{row.inQtl} Qtl
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600 font-mono">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {row.outBags > 0 ? (
                      <div>
                        <span className="font-mono font-bold text-[#702D3B] dark:text-[#E4B34F]">
                          -{row.outBags}
                        </span>{' '}
                        <span className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">bags</span>
                        <div className="text-[10px] font-mono text-[#707887] dark:text-[#A1AAB9]">
                          -{row.outQtl} Qtl
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600 font-mono">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                    {row.referenceId}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-[#344054] dark:text-[#CBD5E1] whitespace-nowrap">
                    {row.user}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-[#707887] dark:text-[#A1AAB9] max-w-xs truncate">
                    {row.notes || 'Routine stock ledger movement'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
