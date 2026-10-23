import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommodityType, QualityGrade, BatchStatus } from '../../types';
import { X, PlusCircle, AlertTriangle, CheckCircle2, ShieldCheck, Scale } from 'lucide-react';

interface AddStockReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStockReceiptModal: React.FC<AddStockReceiptModalProps> = ({ isOpen, onClose }) => {
  const { addStockReceipt, currentRole, addToast } = useApp();

  const [commodity, setCommodity] = useState<CommodityType>('Rice');
  const [variety, setVariety] = useState('Grade A - Boiled');
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [initialBags, setInitialBags] = useState<number>(200);
  const [bagWeightKg, setBagWeightKg] = useState<number>(50);
  const [depotLocation, setDepotLocation] = useState('Godown-B, Stack 08');
  const [warehouseName, setWarehouseName] = useState('FCI District Base Depot #4, Hubballi');
  const [supplierSource, setSupplierSource] = useState('FCI Central Rake / Davanagere Silo');
  const [moisturePercentage, setMoisturePercentage] = useState<number>(11.6);
  const [qualityInspectionGrade, setQualityInspectionGrade] = useState<QualityGrade>('Grade-I (FAQ)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalQtl = Number(((initialBags * bagWeightKg) / 100).toFixed(2));
  const isMoistureHigh = moisturePercentage > 12.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (currentRole === 'Vigilance Auditor') {
      addToast('error', 'Unauthorized Action', 'Vigilance Auditors hold read-only privilege.');
      return;
    }

    if (initialBags <= 0) {
      addToast('error', 'Invalid Quantity', 'Initial bags count must be at least 1.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine initial status based on moisture & inspection grade
      let initialStatus: BatchStatus = 'Eligible';
      let statusReason = undefined;

      if (moisturePercentage > 14.0 || qualityInspectionGrade === 'Sub-Standard') {
        initialStatus = 'Quarantined';
        statusReason = `Auto-quarantined on receipt: Moisture (${moisturePercentage}%) exceeds 14.0% or grade is Sub-Standard.`;
      }

      const result = addStockReceipt({
        commodity,
        variety,
        receivedDate,
        initialBags,
        bagWeightKg,
        depotLocation: depotLocation.trim(),
        warehouseName,
        supplierSource: supplierSource.trim(),
        moisturePercentage,
        qualityInspectionGrade,
        status: initialStatus,
        statusReason,
        notes: notes.trim(),
      });

      if (result.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const varietyOptions: Record<CommodityType, string[]> = {
    Rice: ['Grade A - Boiled', 'Raw Common', 'Antyodaya Sona Masoori'],
    Wheat: ['Sharbati Lokwan', 'Durum Wheat', 'Mill Quality Wheat'],
    'Coarse Grains': ['Jowar (Sorghum)', 'Ragi (Finger Millet)', 'Bajra'],
    Pulses: ['Tur Dal (Yellow Split)', 'Chana (Gram)', 'Moong Whole'],
    Sugar: ['Refined White Grade-S', 'Raw Sugar'],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7E2DF] dark:border-[#293445] bg-[#FAF7F2] dark:bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#702D3B] dark:bg-[#801B3A] text-white flex items-center justify-center shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#344054] dark:text-[#F1F5F9]">
                Inward Stock Receipt Register (Form PDS-01)
              </h3>
              <p className="text-xs text-[#707887] dark:text-[#A1AAB9]">
                Log new grain consignment intake, moisture verification, and bay assignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9] hover:bg-[#F3EFEA] dark:hover:bg-[#151C28] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Commodity & Variety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Commodity Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={commodity}
                onChange={(e) => {
                  const c = e.target.value as CommodityType;
                  setCommodity(c);
                  setVariety(varietyOptions[c][0]);
                }}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-medium focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              >
                <option value="Rice">Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Coarse Grains">Coarse Grains</option>
                <option value="Pulses">Pulses</option>
                <option value="Sugar">Sugar</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Variety / Specification <span className="text-rose-500">*</span>
              </label>
              <select
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-medium focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              >
                {varietyOptions[commodity].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inward Date, Bags, Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Inward Intake Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Number of Bags Received <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={initialBags}
                onChange={(e) => setInitialBags(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono font-bold focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Standard Bag Weight (Kg)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={bagWeightKg}
                onChange={(e) => setBagWeightKg(parseInt(e.target.value) || 50)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              />
            </div>
          </div>

          {/* Computed Net Weight Banner */}
          <div className="p-3.5 bg-[#FAF2F4] dark:bg-[#3B1020]/40 rounded-xl border border-[#E8CCD2] dark:border-[#801B3A]/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#702D3B] dark:text-[#E4B34F]">
              <Scale className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
              <span className="font-semibold">Calculated Inward Net Weight:</span>
            </div>
            <div className="font-mono text-sm font-bold text-[#702D3B] dark:text-[#E4B34F] tabular-nums">
              {totalQtl.toLocaleString()} Quintals ({initialBags * bagWeightKg} Kg)
            </div>
          </div>

          {/* Bay Location & Source Depot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Storage Bay / Stack ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={depotLocation}
                onChange={(e) => setDepotLocation(e.target.value)}
                placeholder="e.g. Godown-B, Stack 08"
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Source Depot / Central Pool Supplier <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={supplierSource}
                onChange={(e) => setSupplierSource(e.target.value)}
                placeholder="e.g. FCI Central Rake / Davanagere Silo"
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              />
            </div>
          </div>

          {/* Quality & Moisture Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Moisture Meter Reading (%) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="5"
                max="30"
                required
                value={moisturePercentage}
                onChange={(e) => setMoisturePercentage(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono font-bold focus:bg-white dark:focus:bg-[#151C28] outline-none ${
                  isMoistureHigh
                    ? 'border-amber-400 dark:border-amber-600 focus:border-amber-500 text-amber-900 dark:text-amber-300'
                    : 'border-[#E7E2DF] dark:border-[#293445] focus:border-[#702D3B] dark:focus:border-[#801B3A]'
                }`}
              />
              {isMoistureHigh && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Warning: PDS safety norm is ≤ 12.0%. High moisture triggers auto-quarantine.</span>
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Quality Inspection Grade <span className="text-rose-500">*</span>
              </label>
              <select
                value={qualityInspectionGrade}
                onChange={(e) => setQualityInspectionGrade(e.target.value as QualityGrade)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-medium focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              >
                <option value="Grade-I (FAQ)">Grade-I (Fair Average Quality - FAQ)</option>
                <option value="Grade-II">Grade-II (Borderline Acceptable)</option>
                <option value="Sub-Standard">Sub-Standard (Reject / Barred)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
              Consignment & Weighbridge Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Railway rake invoice number, tarpaulin condition, dunnage verification..."
              className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E7E2DF] dark:border-[#293445]">
            <span className="text-[#707887] dark:text-[#A1AAB9] text-[11px]">
              Assigned to FIFO Queue based on Inward Date: {receivedDate}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-medium text-[#707887] dark:text-[#A1AAB9] hover:bg-[#FAF7F2] dark:hover:bg-[#111827] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || currentRole === 'Vigilance Auditor'}
                className={`flex items-center gap-1.5 px-5 py-2 font-semibold text-white rounded-lg shadow-xs transition-colors ${
                  isSubmitting || currentRole === 'Vigilance Auditor'
                    ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                    : 'bg-[#702D3B] hover:bg-[#54212D] dark:bg-[#801B3A] dark:hover:bg-[#9E2248]'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording Inward...' : 'Record Inward Stock'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
