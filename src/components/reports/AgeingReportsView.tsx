import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Download,
  Printer,
  Search,
  Filter,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const AgeingReportsView: React.FC = () => {
  const { batches } = useApp();

  const [selectedCommodity, setSelectedCommodity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const eligibleBatches = batches.filter((b) => b.availableBags > 0);

  const filtered = eligibleBatches.filter((b) => {
    const matchesCommodity = selectedCommodity === 'ALL' || b.commodity === selectedCommodity;
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.depotLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCommodity && matchesSearch;
  });

  // Sort oldest to newest
  const sortedByAge = [...filtered].sort((a, b) => b.stockAgeDays - a.stockAgeDays);

  const handleExportCSV = () => {
    const headers = ['Batch ID', 'Commodity', 'Variety', 'Received Date', 'Age (Days)', 'Available Bags', 'Available Qtl', 'Risk Category', 'Depot Location'];
    const rows = sortedByAge.map((b) => [
      b.id,
      b.commodity,
      `"${b.variety}"`,
      b.receivedDate,
      b.stockAgeDays,
      b.availableBags,
      b.availableQtl,
      b.stockAgeDays >= 150 ? 'Critical (>150d)' : b.stockAgeDays >= 90 ? 'Ageing (90-150d)' : b.stockAgeDays >= 60 ? 'Moderate (60-90d)' : 'Fresh (<60d)',
      `"${b.depotLocation}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartPDS_Ageing_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Quality Vigilance
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">PDS Form AGE-04</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Grain Stock Ageing & Rotation Priority Register
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Stratified age brackets, shelf-life risk index, and mandatory FIFO issue scheduling per NFSA grain rotation protocols.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#111827] hover:bg-[#F3EFEA] dark:hover:bg-[#1E293B] border border-[#E7E2DF] dark:border-[#293445] text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
          <span>Export Ageing CSV</span>
        </button>
      </div>

      {/* Register Table */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Batch ID, variety, bay stack..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Commodity:
            </span>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
            >
              <option value="ALL">All Commodities</option>
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Sugar">Sugar</option>
              <option value="Coarse Grains">Coarse Grains</option>
              <option value="Pulses">Pulses</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E7E2DF] dark:border-[#293445] rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#111827] text-[#707887] dark:text-[#A1AAB9] font-semibold border-b border-[#E7E2DF] dark:border-[#293445]">
              <tr>
                <th className="py-2.5 px-3">Batch ID</th>
                <th className="py-2.5 px-3">Commodity & Grade</th>
                <th className="py-2.5 px-3">Receipt Date</th>
                <th className="py-2.5 px-3 text-right">Age (Days in Depot)</th>
                <th className="py-2.5 px-3 text-right">Available Balance</th>
                <th className="py-2.5 px-3">Stack Location</th>
                <th className="py-2.5 px-3">FIFO Evacuation Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
              {sortedByAge.map((b) => {
                const isCritical = b.stockAgeDays >= 150;
                const isAgeing = b.stockAgeDays >= 90 && b.stockAgeDays < 150;
                const isModerate = b.stockAgeDays >= 60 && b.stockAgeDays < 90;

                return (
                  <tr key={b.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1A2230]/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#702D3B] dark:text-[#E4B34F]">
                      {b.id}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#344054] dark:text-[#F1F5F9]">{b.commodity}</div>
                      <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9]">{b.variety}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                      {b.receivedDate}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-xs">
                      <span
                        className={
                          isCritical
                            ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                            : isAgeing
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-[#344054] dark:text-[#CBD5E1]'
                        }
                      >
                        {b.stockAgeDays} days
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                      {b.availableBags} bags ({b.availableQtl} Qtl)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                      {b.depotLocation}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCritical
                            ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            : isAgeing
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : isModerate
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {isCritical ? 'CRITICAL EVACUATION' : isAgeing ? 'HIGH ROTATION' : isModerate ? 'STANDARD ROTATION' : 'FRESH STOCK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
