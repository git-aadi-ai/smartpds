import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommodityType, QualityGrade } from '../../types';
import {
  PackagePlus,
  Truck,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Warehouse,
  Droplets,
  Calendar,
  Layers,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface InwardReceiptsViewProps {
  onOpenReceiptModal: () => void;
}

export const InwardReceiptsView: React.FC<InwardReceiptsViewProps> = ({ onOpenReceiptModal }) => {
  const { batches, addStockReceipt, currentRole, addToast } = useApp();

  // Quick Inward Form State
  const [commodity, setCommodity] = useState<CommodityType>('Rice');
  const [variety, setVariety] = useState('Grade A - Boiled');
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [initialBags, setInitialBags] = useState<number | ''>(250);
  const [bagWeightKg, setBagWeightKg] = useState<number>(50);
  const [depotLocation, setDepotLocation] = useState('Godown-B, Stack 04');
  const [moisturePercentage, setMoisturePercentage] = useState<number | ''>(11.8);
  const [qualityInspectionGrade, setQualityInspectionGrade] = useState<QualityGrade>('Grade-I (FAQ)');
  const [supplierSource, setSupplierSource] = useState('FCI Regional Hub, Raichur (Rake #18)');
  const [vehicleNumber, setVehicleNumber] = useState('KA-25-EA-9041');
  const [gatePassRef, setGatePassRef] = useState('GP-INW-2026-059');
  const [notes, setNotes] = useState('Rake unloaded with seal intact; moisture test calibrated.');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Eligible' | 'Quarantined'>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const varietiesByCommodity: Record<CommodityType, string[]> = {
    Rice: ['Grade A - Boiled', 'Raw Common', 'Sona Masoori (PDS)', 'Jaya Parboiled'],
    Wheat: ['Sharbati Lokwan', 'Durum High-Protein', 'Kalyan Sona', 'Common Milling'],
    Sugar: ['Refined M-30', 'Crystal S-30', 'White Cane Granulated'],
    'Coarse Grains': ['Hybrid Jowar (Sorghum)', 'Ragi (Finger Millet)', 'Bajra (Pearl Millet)'],
    Pulses: ['Tur / Arhar Dal (FAQ)', 'Chana Whole', 'Moong Dal Split'],
  };

  const handleCommodityChange = (newCommodity: CommodityType) => {
    setCommodity(newCommodity);
    setVariety(varietiesByCommodity[newCommodity][0] || 'Standard');
  };

  // Compute calculated metrics
  const bagsNum = typeof initialBags === 'number' ? initialBags : 0;
  const computedQuintals = Number(((bagsNum * bagWeightKg) / 100).toFixed(2));
  const moistureNum = typeof moisturePercentage === 'number' ? moisturePercentage : 0;
  const isHighMoisture = moistureNum > 14.0;

  const handleSubmitInward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bagsNum || bagsNum <= 0) {
      addToast('error', 'Invalid Quantity', 'Please specify bag count greater than 0.');
      return;
    }
    if (!moistureNum || moistureNum <= 0) {
      addToast('error', 'Invalid Moisture', 'Please enter a valid grain moisture reading.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = addStockReceipt({
        commodity,
        variety,
        receivedDate,
        initialBags: bagsNum,
        bagWeightKg,
        depotLocation,
        warehouseName: 'FCI District Base Depot #4, Hubballi',
        moisturePercentage: moistureNum,
        qualityInspectionGrade,
        status: isHighMoisture ? 'Quarantined' : 'Eligible',
        statusReason: isHighMoisture
          ? `Auto-quarantined on inward gate receipt: moisture ${moistureNum}% exceeds statutory NFSA 14.0% threshold.`
          : undefined,
        supplierSource: `${supplierSource} | Lorry: ${vehicleNumber} | GatePass: ${gatePassRef}`,
        notes,
      });

      setIsSubmitting(false);
      if (res.success) {
        // Reset non-fixed fields
        setInitialBags(200);
        setGatePassRef(`GP-INW-2026-${Math.floor(100 + Math.random() * 900)}`);
      }
    }, 350);
  };

  // Filter receipt batches
  const receiptBatches = batches.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.supplierSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.depotLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              NFSA Inward Intake
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Gate Weighbridge & Quality Test</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Inward Stock Intake Register & Quality Verification
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Record fresh rake receipts, capture electronic moisture levels, and auto-quarantine sub-standard lots.
          </p>
        </div>

        <button
          onClick={onOpenReceiptModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
        >
          <PackagePlus className="w-4 h-4" />
          <span>Detailed Inward Wizard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Inward Gate Entry Form */}
        <div className="lg:col-span-1 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">Direct Inward Intake Form</h3>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Auto FIFO Queue
            </span>
          </div>

          <form onSubmit={handleSubmitInward} className="mt-4 space-y-3.5 text-xs">
            {/* Commodity & Variety */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Commodity *
                </label>
                <select
                  value={commodity}
                  onChange={(e) => handleCommodityChange(e.target.value as CommodityType)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
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
                  Variety *
                </label>
                <select
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
                >
                  {varietiesByCommodity[commodity].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bags & Weight */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Quantity (Bags) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={initialBags}
                  onChange={(e) => setInitialBags(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
                  placeholder="e.g. 250"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Bag Weight
                </label>
                <select
                  value={bagWeightKg}
                  onChange={(e) => setBagWeightKg(parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
                >
                  <option value={50}>50 kg (Standard Gunny)</option>
                  <option value={25}>25 kg (Retail Poly)</option>
                  <option value={100}>100 kg (Legacy Jute)</option>
                </select>
              </div>
            </div>

            {/* Computed Quintal Preview */}
            <div className="p-2.5 bg-[#FAF7F2] dark:bg-[#111827] rounded-lg border border-[#E7E2DF] dark:border-[#293445] flex items-center justify-between text-xs">
              <span className="text-[#707887] dark:text-[#A1AAB9]">Calculated Net Weight:</span>
              <span className="font-mono font-bold text-[#702D3B] dark:text-[#E4B34F]">
                {computedQuintals.toLocaleString()} Quintals ({computedQuintals * 100} kg)
              </span>
            </div>

            {/* Moisture & Quality */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Moisture % *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="30"
                    value={moisturePercentage}
                    onChange={(e) => setMoisturePercentage(e.target.value ? parseFloat(e.target.value) : '')}
                    className={`w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:outline-none ${
                      isHighMoisture
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-[#E7E2DF] dark:border-[#293445]'
                    }`}
                    placeholder="12.0"
                    required
                  />
                  <Droplets className="absolute right-2.5 top-2 w-3.5 h-3.5 text-[#707887] dark:text-[#A1AAB9]" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Inspection Grade
                </label>
                <select
                  value={qualityInspectionGrade}
                  onChange={(e) => setQualityInspectionGrade(e.target.value as QualityGrade)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
                >
                  <option value="Grade-I (FAQ)">Grade-I (FAQ)</option>
                  <option value="Grade-II">Grade-II</option>
                  <option value="Sub-Standard">Sub-Standard</option>
                </select>
              </div>
            </div>

            {/* High Moisture Warning Badge */}
            {isHighMoisture && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Automatic Quarantine Warning:</span> Moisture level ({moistureNum}%) exceeds the 14.0% NFSA maximum. This batch will be auto-quarantined and excluded from FIFO dispatches.
                </div>
              </div>
            )}

            {/* Storage Bay & Supplier */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Depot Stack Bay *
                </label>
                <input
                  type="text"
                  value={depotLocation}
                  onChange={(e) => setDepotLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
                  placeholder="Godown-B, Stack 04"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Truck Vehicle #
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
                  placeholder="KA-25-EA-9041"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                Source Supply Rake / Hub
              </label>
              <input
                type="text"
                value={supplierSource}
                onChange={(e) => setSupplierSource(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none focus:border-[#702D3B] dark:focus:border-[#801B3A]"
                placeholder="e.g. FCI Central Pool / Raichur Depot (Rake #18)"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Recording Receipt...</span>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Confirm Inward Intake & Generate Batch ID</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Columns: Registered Inward Batches Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#707887] dark:text-[#A1AAB9]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter inward intake by Batch, Commodity, Lorry, or Bay..."
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
                  <option value="ALL">All Batches ({batches.length})</option>
                  <option value="Eligible">Eligible Inward</option>
                  <option value="Quarantined">Quarantined Inward</option>
                </select>
              </div>
            </div>

            {/* Batches Table */}
            <div className="overflow-x-auto border border-[#E7E2DF] dark:border-[#293445] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] dark:bg-[#111827] text-[#707887] dark:text-[#A1AAB9] font-semibold border-b border-[#E7E2DF] dark:border-[#293445]">
                  <tr>
                    <th className="py-2.5 px-3">Batch ID & Commodity</th>
                    <th className="py-2.5 px-3">Received Date</th>
                    <th className="py-2.5 px-3">Intake Bags / Qtl</th>
                    <th className="py-2.5 px-3">Location Bay</th>
                    <th className="py-2.5 px-3">Moisture</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
                  {receiptBatches.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1A2230]/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-[#702D3B] dark:text-[#E4B34F]">{b.id}</div>
                        <div className="text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                          {b.commodity} · <span className="text-[#707887] dark:text-[#A1AAB9]">{b.variety}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                        {b.receivedDate}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-semibold text-[#344054] dark:text-[#F1F5F9]">
                          {b.initialBags} bags
                        </div>
                        <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] font-mono">
                          {b.totalReceivedQtl} Qtl
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#344054] dark:text-[#CBD5E1]">
                        {b.depotLocation}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <span
                          className={
                            b.moisturePercentage > 14
                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-emerald-700 dark:text-emerald-400 font-semibold'
                          }
                        >
                          {b.moisturePercentage}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            b.status === 'Eligible'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : b.status === 'Quarantined'
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {receiptBatches.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#707887] dark:text-[#A1AAB9]">
                        No inward batches match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
