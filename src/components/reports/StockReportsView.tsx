import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommodityType } from '../../types';
import {
  FileText,
  Download,
  Printer,
  Search,
  Filter,
  Warehouse,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from 'lucide-react';

export const StockReportsView: React.FC = () => {
  const { batches, depotSettings } = useApp();

  const [selectedCommodity, setSelectedCommodity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Commodity rate benchmarks (Govt Minimum Support Price MSP per quintal approximate for simulation)
  const mspPerQuintal: Record<CommodityType, number> = {
    Rice: 2200,
    Wheat: 2275,
    Sugar: 3600,
    'Coarse Grains': 3180,
    Pulses: 6600,
  };

  const filteredBatches = batches.filter((b) => {
    const matchesCommodity = selectedCommodity === 'ALL' || b.commodity === selectedCommodity;
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.depotLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCommodity && matchesSearch;
  });

  const totalBags = filteredBatches.reduce((s, b) => s + b.availableBags, 0);
  const totalQtl = filteredBatches.reduce((s, b) => s + b.availableQtl, 0);
  const eligibleBags = filteredBatches.filter((b) => b.status === 'Eligible').reduce((s, b) => s + b.availableBags, 0);
  const quarantinedBags = filteredBatches.filter((b) => b.status === 'Quarantined').reduce((s, b) => s + b.availableBags, 0);
  const damagedBags = filteredBatches.filter((b) => b.status === 'Damaged').reduce((s, b) => s + b.availableBags, 0);

  // Valuation
  const totalValuationINR = filteredBatches.reduce((s, b) => {
    const rate = mspPerQuintal[b.commodity] || 2200;
    return s + b.availableQtl * rate;
  }, 0);

  const handleExportCSV = () => {
    const headers = ['Batch ID', 'Commodity', 'Variety', 'Godown Location', 'Available Bags', 'Available Qtl', 'Moisture %', 'Status', 'Estimated MSP Valuation (INR)'];
    const rows = filteredBatches.map((b) => [
      b.id,
      b.commodity,
      `"${b.variety}"`,
      `"${b.depotLocation}"`,
      b.availableBags,
      b.availableQtl,
      b.moisturePercentage,
      b.status,
      (b.availableQtl * (mspPerQuintal[b.commodity] || 2200)).toFixed(0),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartPDS_Stock_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Statutory Reporting
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Form PDS-STK (Monthly Closing)</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Consolidated Commodity Stock Register & Valuation Report
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Depot inventory position by stack location, statutory MSP commodity valuation, and quality grade stratification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#111827] hover:bg-[#F3EFEA] dark:hover:bg-[#1E293B] border border-[#E7E2DF] dark:border-[#293445] text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
            <span>CSV Export</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="text-xs text-[#707887] dark:text-[#A1AAB9]">Total Grain In Godown</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#344054] dark:text-[#F1F5F9]">
              {totalBags.toLocaleString()}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">bags</span>
          </div>
          <div className="text-[11px] font-mono text-[#707887] dark:text-[#A1AAB9] mt-1">
            {totalQtl.toFixed(1)} Quintals ({((totalQtl * 100) / 1000).toFixed(1)} MT)
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="text-xs text-[#707887] dark:text-[#A1AAB9]">Eligible for FIFO Issue</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {eligibleBags.toLocaleString()}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">bags</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            {((eligibleBags / Math.max(1, totalBags)) * 100).toFixed(1)}% of total stock
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="text-xs text-[#707887] dark:text-[#A1AAB9]">Quarantined & Damaged</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {(quarantinedBags + damagedBags).toLocaleString()}
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">bags</span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Segregated in inspection bays
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs">
          <div className="text-xs text-[#707887] dark:text-[#A1AAB9]">Estimated Valuation (MSP)</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#702D3B] dark:text-[#E4B34F]">
              ₹{(totalValuationINR / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
            Govt. Minimum Support Price value
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Batch ID, variety, or bay location..."
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
                <th className="py-2.5 px-3">Commodity & Variety</th>
                <th className="py-2.5 px-3">Depot Bay Stack</th>
                <th className="py-2.5 px-3 text-right">Available Bags</th>
                <th className="py-2.5 px-3 text-right">Metric Qtl</th>
                <th className="py-2.5 px-3 text-right">Estimated Value (₹)</th>
                <th className="py-2.5 px-3">Moisture</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
              {filteredBatches.map((b) => {
                const val = b.availableQtl * (mspPerQuintal[b.commodity] || 2200);
                return (
                  <tr key={b.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1A2230]/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#702D3B] dark:text-[#E4B34F]">
                      {b.id}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#344054] dark:text-[#F1F5F9]">{b.commodity}</div>
                      <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9]">{b.variety}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                      {b.depotLocation}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#344054] dark:text-[#F1F5F9]">
                      {b.availableBags}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] text-[#707887] dark:text-[#A1AAB9]">
                      {b.availableQtl} Qtl
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] text-[#702D3B] dark:text-[#E4B34F] font-semibold">
                      ₹{val.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <span className={b.moisturePercentage > 14 ? 'text-amber-600 font-bold' : 'text-emerald-700 dark:text-emerald-400'}>
                        {b.moisturePercentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          b.status === 'Eligible'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : b.status === 'Quarantined'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {b.status}
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
