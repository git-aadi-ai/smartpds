import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryTrackingRecord } from '../../types';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Phone,
  Navigation,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const DeliveryTrackingView: React.FC = () => {
  const { deliveryTracking, updateDeliveryMilestone, currentRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'In Transit' | 'Delivered'>('ALL');
  const [selectedRecordId, setSelectedRecordId] = useState<string>(deliveryTracking[0]?.id || '');
  const [updateNote, setUpdateNote] = useState('');

  const milestones: DeliveryTrackingRecord['currentMilestone'][] = [
    'Gate Pass Issued',
    'Weighbridge Exit',
    'In Transit',
    'Arrived at FPS',
    'Inspected & Unloaded',
    'Delivered Verified',
  ];

  const filteredList = deliveryTracking.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.challanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destinationFps.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driverName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedRecord = deliveryTracking.find((d) => d.id === selectedRecordId) || deliveryTracking[0];

  const handleAdvanceMilestone = (nextMilestone: DeliveryTrackingRecord['currentMilestone']) => {
    if (!selectedRecord) return;
    updateDeliveryMilestone(selectedRecord.id, nextMilestone, updateNote || `Progressed to ${nextMilestone}`);
    setUpdateNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Transit Telematics
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">GPS Fleet & Last-Mile Verification</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Fair Price Shop Delivery Tracking & e-PoS Verification
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Monitor grain consignments en route to ration dealerships, verify electronic waybills, and confirm delivered bag counts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 font-mono">
            <Truck className="w-3.5 h-3.5" />
            <span>{deliveryTracking.filter((d) => d.status === 'In Transit').length} Lorries Active</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vehicle List */}
        <div className="lg:col-span-1 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E2DF] dark:border-[#293445]">
            <h3 className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9]">Active Consignments</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-[11px] px-2 py-1 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-md text-[#344054] dark:text-[#F1F5F9]"
            >
              <option value="ALL">All ({deliveryTracking.length})</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#707887] dark:text-[#A1AAB9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search truck, challan, FPS..."
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9]"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredList.map((item) => {
              const isSelected = selectedRecord?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedRecordId(item.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF2F4] dark:bg-[#3B1020]/50 border-[#702D3B] dark:border-[#E4B34F] shadow-xs'
                      : 'bg-[#FAF7F2]/60 dark:bg-[#111827] border-[#E7E2DF] dark:border-[#293445] hover:border-[#702D3B]/40 dark:hover:border-[#801B3A]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#702D3B] dark:text-[#E4B34F]">
                      {item.vehicleNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === 'Delivered'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#344054] dark:text-[#F1F5F9] mt-1 truncate">
                    {item.destinationFps}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
                    <span>{item.bags} bags ({item.commodity})</span>
                    <span className="font-mono text-[10px]">{item.challanNumber}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Tracking Detail & Live Stepper */}
        {selectedRecord && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-5">
              {/* Consignment Overview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E2DF] dark:border-[#293445]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-[#702D3B] dark:text-[#E4B34F]">
                      {selectedRecord.challanNumber}
                    </span>
                    <span className="text-xs font-semibold text-[#344054] dark:text-[#CBD5E1]">
                      · Vehicle: <strong className="font-mono">{selectedRecord.vehicleNumber}</strong>
                    </span>
                  </div>
                  <div className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
                    Transporter: {selectedRecord.transporter} · Driver: {selectedRecord.driverName} ({selectedRecord.driverPhone})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] text-xs font-mono font-bold text-[#344054] dark:text-[#F1F5F9]">
                    {selectedRecord.bags} bags ({((selectedRecord.bags * 50) / 100).toFixed(1)} Qtl)
                  </span>
                </div>
              </div>

              {/* Milestone Stepper */}
              <div className="mt-5">
                <div className="text-[11px] font-semibold text-[#707887] dark:text-[#A1AAB9] uppercase tracking-wider mb-3">
                  Consignment Milestones
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {milestones.map((ms, index) => {
                    const currentIndex = milestones.indexOf(selectedRecord.currentMilestone);
                    const isPassed = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                      <div
                        key={ms}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          isCurrent
                            ? 'bg-[#702D3B] dark:bg-[#801B3A] text-white border-[#702D3B] dark:border-[#801B3A] shadow-xs'
                            : isPassed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                            : 'bg-[#FAF7F2] dark:bg-[#111827] border-[#E7E2DF] dark:border-[#293445] text-[#707887] dark:text-[#A1AAB9]'
                        }`}
                      >
                        <div className="text-[10px] font-mono uppercase font-semibold">Step 0{index + 1}</div>
                        <div className="text-[11px] font-bold mt-0.5 leading-tight">{ms}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advance Milestone Controls */}
              <div className="mt-5 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445]">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                      Update Dispatch Milestone
                    </label>
                    <input
                      type="text"
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      placeholder="Optional milestone note (e.g. Weighbridge exit net weight: 5,000 kg)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-4 sm:pt-0">
                    {milestones.map((ms, idx) => {
                      const currentIndex = milestones.indexOf(selectedRecord.currentMilestone);
                      if (idx === currentIndex + 1) {
                        return (
                          <button
                            key={ms}
                            onClick={() => handleAdvanceMilestone(ms)}
                            className="px-3.5 py-2 bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <span>Mark as "{ms}"</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>

              {/* Live Transit Log */}
              <div className="mt-5">
                <div className="text-[11px] font-semibold text-[#707887] dark:text-[#A1AAB9] uppercase tracking-wider mb-2">
                  Telemetry & Waypoint History
                </div>
                <div className="border border-[#E7E2DF] dark:border-[#293445] rounded-lg divide-y divide-[#E7E2DF] dark:divide-[#293445]">
                  {selectedRecord.transitUpdates.map((t, idx) => (
                    <div key={idx} className="p-3 flex items-start gap-3 text-xs">
                      <div className="font-mono text-[#702D3B] dark:text-[#E4B34F] font-bold shrink-0">
                        {t.time}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#344054] dark:text-[#F1F5F9]">{t.location}</div>
                        <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-0.5">{t.statusNote}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
