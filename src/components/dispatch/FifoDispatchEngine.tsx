import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CommodityType } from '../../types';
import {
  ArrowRightLeft,
  Boxes,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

interface FifoDispatchEngineProps {
  onOpenChallansTab: () => void;
}

export const FifoDispatchEngine: React.FC<FifoDispatchEngineProps> = ({ onOpenChallansTab }) => {
  const {
    batches,
    fairPriceShops,
    currentRole,
    calculateFifoPreview,
    executeDispatch,
    addToast,
  } = useApp();

  // Form State
  const [commodity, setCommodity] = useState<CommodityType>('Rice');
  const [variety, setVariety] = useState<string>('Grade A - Boiled');
  const [requestedBags, setRequestedBags] = useState<number>(120); // Default to 120 bags to directly demo the prompt's scenario!
  const [destinationFpsId, setDestinationFpsId] = useState<string>(
    fairPriceShops[0]?.id || 'FPS-KA-29-014'
  );
  const [vehicleNumber, setVehicleNumber] = useState<string>('KA-25-AA-4921');
  const [driverName, setDriverName] = useState<string>('Ramesh Patil');
  const [driverPhone, setDriverPhone] = useState<string>('+91 98450 12345');
  const [transporterAgency, setTransporterAgency] = useState<string>(
    'Karnataka State Food Transport Corporation (Contract #26/TR)'
  );
  const [remarks, setRemarks] = useState<string>(
    'Regular monthly NFSA ration allotment for BPL cardholders'
  );

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Variety options for commodity
  const availableVarieties = useMemo(() => {
    const set = new Set<string>();
    batches
      .filter((b) => b.commodity === commodity && b.status === 'Eligible' && b.availableBags > 0)
      .forEach((b) => set.add(b.variety));
    return Array.from(set);
  }, [batches, commodity]);

  // Ensure variety matches available
  React.useEffect(() => {
    if (availableVarieties.length > 0 && !availableVarieties.includes(variety)) {
      setVariety(availableVarieties[0]);
    }
  }, [availableVarieties, variety]);

  // Run Real-Time FIFO Allocation Calculation
  const fifoResult = useMemo(() => {
    return calculateFifoPreview(commodity, variety, requestedBags);
  }, [calculateFifoPreview, commodity, variety, requestedBags]);

  // Selected Fair Price Shop
  const selectedFps = useMemo(() => {
    return fairPriceShops.find((f) => f.id === destinationFpsId) || fairPriceShops[0];
  }, [fairPriceShops, destinationFpsId]);

  // Quick Preset Handler for College Hackathon Evaluation
  const loadScenarioPreset = (presetBags: number, presetCommodity: CommodityType, presetVariety: string) => {
    setCommodity(presetCommodity);
    setVariety(presetVariety);
    setRequestedBags(presetBags);
    addToast(
      'info',
      'Demo Scenario Loaded',
      `Loaded request for ${presetBags} bags of ${presetCommodity} (${presetVariety}).`
    );
  };

  const handleInitiateDispatch = () => {
    if (currentRole === 'Vigilance Auditor') {
      addToast(
        'error',
        'Read-Only Role',
        'Vigilance Auditors are prohibited from creating dispatches.'
      );
      return;
    }

    if (!fifoResult.success) {
      addToast('error', 'Cannot Proceed', fifoResult.error || 'Invalid requested quantity.');
      return;
    }

    if (!vehicleNumber.trim() || !driverName.trim()) {
      addToast('error', 'Missing Logistics Details', 'Vehicle number and driver name are required.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmAndDispatch = () => {
    if (isProcessing) return; // Prevent double execution
    setIsProcessing(true);

    const result = executeDispatch({
      commodity,
      variety,
      requestedBags,
      destinationFpsId,
      vehicleNumber,
      driverName,
      driverPhone,
      transporterAgency,
      remarks,
    });

    setIsProcessing(false);
    setShowConfirmModal(false);

    if (result.success) {
      // The modal opens via activeChallan in AppContext
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Engine Banner */}
      <div className="p-5 rounded-2xl bg-[#54212D] dark:bg-[#3B1020] text-white shadow-md border border-[#702D3B] dark:border-[#801B3A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A46D] dark:bg-[#E4B34F]" />
            <h2 className="text-base font-bold tracking-tight text-white">
              Deterministic FIFO Stock Allocation Engine
            </h2>
          </div>
          <p className="text-xs text-stone-200 dark:text-stone-300 mt-1 leading-relaxed max-w-2xl">
            In compliance with Central PDS Godown Manual norms: batches of grain are strictly prioritized by inward receipt date (oldest first).
            Quarantined batches, damaged bags, and expired lots are completely excluded from allocation.
          </p>
        </div>

        {/* Quick Demo Test Scenario Button */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => loadScenarioPreset(120, 'Rice', 'Grade A - Boiled')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#702D3B] hover:bg-[#853546] dark:bg-[#801B3A] dark:hover:bg-[#9E2248] border border-[#C5A46D]/60 dark:border-[#E4B34F]/60 rounded-lg shadow-sm transition-all whitespace-nowrap"
            title="Load 120 bags test case (100 bags from B001, 20 bags from B002)"
          >
            <Sparkles className="w-4 h-4 text-[#C5A46D] dark:text-[#E4B34F]" />
            <span>Load 120 Bags Demo Case</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Demand Inputs (Left) and Live FIFO Allocation Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Demand & Logistics Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Commodity & Quantity Demand */}
          <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
              <span className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
                <span>1. Allotment Demand</span>
              </span>
              <span className="text-[11px] text-[#707887] dark:text-[#A1AAB9] font-mono">
                Eligible Stock: {fifoResult.totalEligibleAvailableBags} bags
              </span>
            </div>

            {/* Commodity Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Commodity
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Rice', 'Wheat'] as CommodityType[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCommodity(c)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                      commodity === c
                        ? 'border-[#702D3B] dark:border-[#801B3A] bg-[#FAF2F4] dark:bg-[#3B1020]/60 text-[#702D3B] dark:text-[#E4B34F]'
                        : 'border-[#E7E2DF] dark:border-[#293445] bg-white dark:bg-[#111827] hover:bg-[#FAF7F2] dark:hover:bg-[#151C28] text-[#344054] dark:text-[#F1F5F9]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Variety Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Variety / Specification
              </label>
              <select
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-medium focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              >
                {availableVarieties.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Requested Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#344054] dark:text-[#F1F5F9]">
                  Requested Quantity (Bags)
                </label>
                <span className="text-xs text-[#707887] dark:text-[#A1AAB9] font-mono tabular-nums">
                  = {(requestedBags * 0.5).toFixed(1)} Quintals
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={fifoResult.totalEligibleAvailableBags || 1000}
                  value={requestedBags}
                  onChange={(e) => setRequestedBags(parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 text-base font-bold font-mono rounded-lg border outline-none ${
                    requestedBags > fifoResult.totalEligibleAvailableBags
                      ? 'border-rose-300 dark:border-rose-600 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 focus:border-rose-500'
                      : 'border-[#E7E2DF] dark:border-[#293445] bg-[#FAF7F2] dark:bg-[#111827] text-[#344054] dark:text-[#F1F5F9] focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A]'
                  }`}
                />
              </div>

              {/* Quick bag chips */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-[#707887] dark:text-[#A1AAB9]">Presets:</span>
                {[50, 80, 100, 120, 150].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRequestedBags(num)}
                    className="px-2 py-0.5 text-[11px] font-mono bg-[#FAF7F2] dark:bg-[#111827] hover:bg-[#FAF2F4] dark:hover:bg-[#3B1020]/40 text-[#344054] dark:text-[#F1F5F9] border border-[#E7E2DF] dark:border-[#293445] rounded transition-colors"
                  >
                    {num}b
                  </button>
                ))}
              </div>

              {/* Insufficient stock error message */}
              {requestedBags > fifoResult.totalEligibleAvailableBags && (
                <div className="mt-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Insufficient Stock:</span> Available eligible balance is{' '}
                    <span className="font-mono font-bold">
                      {fifoResult.totalEligibleAvailableBags} bags
                    </span>
                    . Request cannot be fulfilled.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Consignee Fair Price Shop (FPS) & Logistics */}
          <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
              <span className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
                <span>2. Consignee & Transport</span>
              </span>
            </div>

            {/* Destination FPS */}
            <div>
              <label className="block text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Destination Fair Price Shop (FPS)
              </label>
              <select
                value={destinationFpsId}
                onChange={(e) => setDestinationFpsId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-medium focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              >
                {fairPriceShops.map((fps) => (
                  <option key={fps.id} value={fps.id}>
                    {fps.code} — {fps.name} ({fps.taluk})
                  </option>
                ))}
              </select>

              {selectedFps && (
                <div className="mt-2 p-2.5 bg-[#FAF7F2] dark:bg-[#111827] rounded-lg border border-[#E7E2DF] dark:border-[#293445] text-[11px] text-[#707887] dark:text-[#A1AAB9] space-y-0.5">
                  <div>
                    <span className="font-semibold text-[#344054] dark:text-[#F1F5F9]">Dealer:</span>{' '}
                    {selectedFps.dealerName} (
                    <a
                      href={`tel:${selectedFps.contactNumber.replace(/[^+\d]/g, '')}`}
                      className="text-[#702D3B] dark:text-[#E4B34F] hover:underline font-mono"
                    >
                      {selectedFps.contactNumber}
                    </a>
                    )
                  </div>
                  <div>
                    <span className="font-semibold text-[#344054] dark:text-[#F1F5F9]">Jurisdiction:</span>{' '}
                    {selectedFps.taluk}, {selectedFps.district} District · {selectedFps.activeCardsCount} Ration Cards
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle & Driver Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                  Vehicle Reg. No.
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="KA-25-AA-4921"
                  className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Ramesh Patil"
                  className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                  Driver Phone
                </label>
                <input
                  type="tel"
                  required
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
                />
              </div>
            </div>

            {/* Transporter */}
            <div>
              <label className="block text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Authorized Transporter Agency
              </label>
              <input
                type="text"
                value={transporterAgency}
                onChange={(e) => setTransporterAgency(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] mb-1">
                Dispatch Gate Pass Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time FIFO Allocation Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
              <span className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>3. Live FIFO Allocation Breakdown</span>
              </span>
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Oldest Inward First
              </span>
            </div>

            {/* Scenario Demonstration Banner */}
            <div className="p-3 bg-[#FAF2F4] dark:bg-[#3B1020]/30 border border-[#E7E2DF] dark:border-[#801B3A]/40 rounded-lg text-xs text-[#702D3B] dark:text-[#E4B34F] leading-relaxed">
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                <Info className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F] shrink-0" />
                <span>FIFO Algorithm Proof of Operation</span>
              </div>
              <p className="text-[11px] text-[#702D3B]/90 dark:text-[#E4B34F]/90">
                Batches are drawn in strict chronological order of intake. When batch #1 is completely depleted, the engine transitions automatically to batch #2 until the requested quota ({requestedBags} bags) is fulfilled.
              </p>
            </div>

            {/* Proposed Batch Draw Table */}
            {fifoResult.success && fifoResult.allocations.length > 0 ? (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] dark:bg-[#111827] border-b border-[#E7E2DF] dark:border-[#293445] text-[#707887] dark:text-[#A1AAB9] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Queue #</th>
                        <th className="py-2.5 px-3">Batch ID & Bay</th>
                        <th className="py-2.5 px-3">Received Date (Age)</th>
                        <th className="py-2.5 px-3 text-right">Available</th>
                        <th className="py-2.5 px-3 text-right font-bold text-[#702D3B] dark:text-[#E4B34F]">
                          Allocated
                        </th>
                        <th className="py-2.5 px-3 text-right">Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
                      {fifoResult.allocations.map((item, index) => (
                        <tr key={item.batchId} className="bg-emerald-50/25 dark:bg-emerald-950/20">
                          {/* Queue Position */}
                          <td className="py-3 px-3">
                            <span className="w-5 h-5 rounded-full bg-[#702D3B] dark:bg-[#801B3A] text-white font-mono font-bold text-[10px] inline-flex items-center justify-center">
                              {index + 1}
                            </span>
                          </td>

                          {/* Batch ID */}
                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-[#344054] dark:text-[#F1F5F9]">{item.batchId}</div>
                            <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">{item.depotLocation}</div>
                          </td>

                          {/* Received Date & Age */}
                          <td className="py-3 px-3">
                            <div className="font-mono text-[#344054] dark:text-[#CBD5E1]">{item.receivedDate}</div>
                            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                              {item.stockAgeDays} days in depot
                            </div>
                          </td>

                          {/* Available Before */}
                          <td className="py-3 px-3 text-right font-mono text-[#707887] dark:text-[#A1AAB9] tabular-nums">
                            {item.availableBags} bags
                          </td>

                          {/* Allocated This Dispatch */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-[#702D3B] dark:text-[#E4B34F] tabular-nums">
                            {item.allocatedBags} bags
                            <div className="text-[10px] text-[#702D3B]/70 dark:text-[#E4B34F]/70 font-normal">
                              ({item.allocatedQtl} Qtl)
                            </div>
                          </td>

                          {/* Remaining After */}
                          <td className="py-3 px-3 text-right">
                            <div className="font-mono font-semibold text-[#344054] dark:text-[#F1F5F9] tabular-nums">
                              {item.remainingBagsAfter} bags
                            </div>
                            {item.isFullyExhausted ? (
                              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                Fully Depleted
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                Partial Draw
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Untouched Eligible Batches in Queue (Show transparency) */}
                      {fifoResult.allEligibleBatches
                        .filter(
                          (eb) => !fifoResult.allocations.some((a) => a.batchId === eb.id)
                        )
                        .slice(0, 2)
                        .map((untouched, idx) => (
                          <tr key={untouched.id} className="opacity-50 bg-[#FAF7F2]/40 dark:bg-[#111827]/40">
                            <td className="py-2.5 px-3">
                              <span className="w-5 h-5 rounded-full bg-[#E7E2DF] dark:bg-[#293445] text-[#707887] dark:text-[#A1AAB9] font-mono text-[10px] inline-flex items-center justify-center">
                                {fifoResult.allocations.length + idx + 1}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-mono text-[#707887] dark:text-[#A1AAB9]">{untouched.id}</div>
                              <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">{untouched.depotLocation}</div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[#707887] dark:text-[#A1AAB9]">
                              {untouched.receivedDate} ({untouched.stockAgeDays}d)
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[#707887] dark:text-[#A1AAB9]">
                              {untouched.availableBags} bags
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#707887] dark:text-[#A1AAB9]">
                              0 bags
                            </td>
                            <td className="py-2.5 px-3 text-right text-[10px] text-[#707887] dark:text-[#A1AAB9] italic">
                              Queue Standby
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Metrics */}
                <div className="p-4 bg-[#FAF7F2] dark:bg-[#111827] rounded-xl border border-[#E7E2DF] dark:border-[#293445] flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-[#707887] dark:text-[#A1AAB9] block text-[11px]">Total Net Allotted</span>
                    <span className="text-base font-bold font-mono text-[#344054] dark:text-[#F1F5F9] tabular-nums">
                      {requestedBags} Bags ({(requestedBags * 0.5).toFixed(2)} Quintals)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#707887] dark:text-[#A1AAB9] block text-[11px]">Batches Mobilized</span>
                    <span className="text-base font-bold font-mono text-[#702D3B] dark:text-[#E4B34F]">
                      {fifoResult.allocations.length} {fifoResult.allocations.length === 1 ? 'batch' : 'batches'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#707887] dark:text-[#A1AAB9] block text-[11px]">Destination FPS</span>
                    <span className="font-semibold text-[#344054] dark:text-[#F1F5F9] truncate max-w-[150px] block">
                      {selectedFps.code} · {selectedFps.name}
                    </span>
                  </div>
                </div>

                {/* Dispatch Trigger Button */}
                <div className="pt-2">
                  <button
                    onClick={handleInitiateDispatch}
                    disabled={currentRole === 'Vigilance Auditor'}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
                      currentRole === 'Vigilance Auditor'
                        ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Allocation & Issue Digital Gate Pass</span>
                  </button>
                  {currentRole === 'Vigilance Auditor' && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 text-center font-medium">
                      Auditor role is read-only. Switch role in top bar to authorize dispatches.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#707887] dark:text-[#A1AAB9] space-y-2">
                <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-1" />
                <div className="font-bold text-[#344054] dark:text-[#F1F5F9]">Cannot Generate FIFO Preview</div>
                <p className="text-[#707887] dark:text-[#A1AAB9] max-w-sm mx-auto">
                  {fifoResult.error || 'Please enter a valid requested quantity.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Stock Deduction */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#E7E2DF] dark:border-[#293445] bg-[#FAF7F2] dark:bg-[#111827]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#702D3B] dark:text-[#E4B34F]" />
                  <h3 className="text-base font-bold text-[#344054] dark:text-[#F1F5F9]">
                    Authorize PDS Commodity Dispatch?
                  </h3>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="p-1 text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-1">
                Please verify consignment details before stock balance deduction.
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Summary Table */}
              <div className="p-4 bg-[#FAF7F2] dark:bg-[#111827] rounded-xl border border-[#E7E2DF] dark:border-[#293445] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#707887] dark:text-[#A1AAB9]">Commodity:</span>
                  <span className="font-semibold text-[#344054] dark:text-[#F1F5F9]">{commodity} ({variety})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#707887] dark:text-[#A1AAB9]">Total Quantity:</span>
                  <span className="font-bold font-mono text-[#344054] dark:text-[#F1F5F9]">
                    {requestedBags} Bags ({(requestedBags * 0.5).toFixed(2)} Quintals)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#707887] dark:text-[#A1AAB9]">Destination FPS:</span>
                  <span className="font-semibold text-[#344054] dark:text-[#F1F5F9]">{selectedFps.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#707887] dark:text-[#A1AAB9]">Transport:</span>
                  <span className="font-mono text-[#344054] dark:text-[#CBD5E1]">{vehicleNumber} · {driverName}</span>
                </div>
              </div>

              {/* Batches to be deducted */}
              <div>
                <span className="font-semibold text-[#344054] dark:text-[#F1F5F9] block mb-2">
                  Atomic Stock Deductions (FIFO):
                </span>
                <div className="space-y-1.5">
                  {fifoResult.allocations.map((a) => (
                    <div
                      key={a.batchId}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#FAF2F4] dark:bg-[#3B1020]/40 border border-[#E7E2DF] dark:border-[#801B3A]/40 font-mono text-[11px]"
                    >
                      <span className="font-bold text-[#344054] dark:text-[#F1F5F9]">{a.batchId}</span>
                      <span className="text-[#702D3B] dark:text-[#E4B34F] font-semibold">
                        - {a.allocatedBags} bags (leaves {a.remainingBagsAfter} bags)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                <span className="font-bold">Anti-Duplication Protection:</span> Stock will be deducted atomically once. An official digital challan (Form-12) will be generated and logged to the audit ledger.
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] dark:bg-[#111827] border-t border-[#E7E2DF] dark:border-[#293445] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isProcessing}
                className="px-4 py-2 font-medium text-[#707887] dark:text-[#A1AAB9] hover:bg-[#FAF7F2] dark:hover:bg-[#151C28] rounded-lg transition-colors text-xs"
              >
                Cancel / Edit Demand
              </button>
              <button
                type="button"
                onClick={handleConfirmAndDispatch}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-5 py-2 font-semibold text-white bg-[#702D3B] hover:bg-[#54212D] dark:bg-[#801B3A] dark:hover:bg-[#9E2248] rounded-lg shadow-xs transition-colors text-xs"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>{isProcessing ? 'Processing...' : 'Authorize & Print Challan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
