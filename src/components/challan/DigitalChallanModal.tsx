import React from 'react';
import { DispatchRecord } from '../../types';
import {
  Printer,
  X,
  Building2,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Truck,
  Download,
} from 'lucide-react';

interface DigitalChallanModalProps {
  challan: DispatchRecord | null;
  onClose: () => void;
}

export const DigitalChallanModal: React.FC<DigitalChallanModalProps> = ({ challan, onClose }) => {
  if (!challan) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(challan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${challan.challanNumber}_digital_challan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Outer Card */}
      <div className="w-full max-w-3xl bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Top Action Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-[#54212D] dark:bg-[#3B1020] text-white shrink-0 border-b border-[#702D3B] dark:border-[#801B3A]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C5A46D] dark:text-[#E4B34F]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Digital Challan Preview & Gate Pass
            </span>
            <span className="text-[10px] bg-[#702D3B] dark:bg-[#801B3A] text-amber-100 border border-[#C5A46D]/40 dark:border-[#E4B34F]/40 px-2 py-0.5 rounded font-mono">
              {challan.challanNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-200 hover:text-white bg-[#702D3B]/60 hover:bg-[#702D3B] dark:bg-[#801B3A]/60 dark:hover:bg-[#801B3A] rounded-lg transition-colors border border-[#C5A46D]/30 dark:border-[#E4B34F]/30"
              title="Export as JSON verification payload"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#702D3B] hover:bg-[#853546] dark:bg-[#801B3A] dark:hover:bg-[#9E2248] border border-[#C5A46D]/50 dark:border-[#E4B34F]/50 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#C5A46D] dark:text-[#E4B34F]" />
              <span>Print Challan</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-300 hover:text-white hover:bg-[#702D3B] dark:hover:bg-[#801B3A] rounded-lg transition-colors ml-2"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Challan Document Area */}
        <div
          id="printable-challan-container"
          className="p-8 sm:p-10 overflow-y-auto bg-white text-slate-900 font-sans"
        >
          {/* Official Government Watermark & Prototype Banner */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img
                src="/src/assets/images/pds_depot_seal_1792736205959.jpg"
                alt="State Food Authority Seal"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full border border-slate-300 object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="text-left">
                <div className="inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-700 rounded border border-slate-300">
                  DEMO / PROTOTYPE SIMULATION — HACKATHON EDITION
                </div>
                <div className="text-xs font-bold tracking-widest text-slate-600 uppercase mt-0.5">
                  Department of Food, Civil Supplies & Consumer Affairs
                </div>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase mt-1">
              Public Distribution System (PDS) Issue Challan
            </h1>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">
              Form PDS-12 (Central Godown to Fair Price Shop Release Memo & Gate Pass)
            </div>
          </div>

          {/* Challan Meta & Date Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Challan Number
              </span>
              <span className="font-mono font-bold text-slate-950 text-sm">
                {challan.challanNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Gate Pass No
              </span>
              <span className="font-mono font-bold text-slate-800">
                {challan.gatePassNo}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Issue Date & Time
              </span>
              <span className="font-mono text-slate-800">
                {new Date(challan.timestamp).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Allocation Protocol
              </span>
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                Strict FIFO Verified
              </span>
            </div>
          </div>

          {/* Issue Depot vs Consignee FPS Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4 border-b border-slate-200 text-xs">
            {/* Issuing Depot */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Issuing Authority / Depot
              </span>
              <div className="font-bold text-slate-900 text-sm">
                FCI District Base Depot #4, Hubballi
              </div>
              <div className="text-slate-600 mt-0.5">
                Karnataka State Food & Civil Supplies Corporation Ltd.
              </div>
              <div className="text-slate-500 text-[11px] mt-1">
                Godown Complex, PB Road, Hubballi - 580024
              </div>
            </div>

            {/* Consignee Fair Price Shop */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Consignee Fair Price Shop (FPS)
              </span>
              <div className="font-bold text-slate-900 text-sm">
                {challan.destinationName}
              </div>
              <div className="text-slate-700 font-mono text-[11px] mt-0.5">
                FPS Code: {challan.destinationFpsId}
              </div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                Taluk/District: {challan.destinationAddress}
              </div>
            </div>
          </div>

          {/* Transport & Vehicle Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Vehicle Reg. No</span>
              <span className="font-mono font-bold text-slate-900">{challan.vehicleNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Driver Name</span>
              <span className="font-semibold text-slate-800">{challan.driverName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Driver Mobile</span>
              <a
                href={`tel:${challan.driverPhone.replace(/[^+\d]/g, '')}`}
                className="font-mono text-slate-800 hover:text-[#702D3B] hover:underline"
                title="Call driver"
              >
                {challan.driverPhone}
              </a>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Transporter</span>
              <span className="text-slate-800 truncate block" title={challan.transporterAgency}>
                {challan.transporterAgency}
              </span>
            </div>
          </div>

          {/* Commodity & Batch Allocation Breakdown Table */}
          <div className="py-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Commodity Batch Allocation Breakdown (FIFO Verified)
              </h3>
              <span className="text-xs text-slate-600 font-medium">
                Commodity: <span className="font-bold text-slate-900">{challan.commodity} ({challan.variety})</span>
              </span>
            </div>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-200">Sl No</th>
                  <th className="py-2 px-3 border-r border-slate-200">Batch Number</th>
                  <th className="py-2 px-3 border-r border-slate-200">Inward Date</th>
                  <th className="py-2 px-3 border-r border-slate-200">Depot Bay Location</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-center">Batch Age</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-right">Standard Bags</th>
                  <th className="py-2 px-3 text-right">Net Weight (Quintals)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {challan.allocatedBatches.map((item, idx) => (
                  <tr key={item.batchId} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-sans">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                      {item.batchId}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                      {item.receivedDate}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-sans text-slate-700">
                      {item.bay}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-sans text-slate-700">
                      {item.stockAgeDays} days
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-bold text-slate-950 tabular-nums">
                      {item.bags}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-950 tabular-nums">
                      {item.qtl} Qtl
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={5} className="py-2 px-3 text-right uppercase text-slate-700">
                    Total Consignment Dispatched:
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-slate-950 text-sm">
                    {challan.totalBags} Bags
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-950 text-sm">
                    {challan.totalQtl} Qtl
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Remarks */}
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs mb-6">
            <span className="font-bold text-slate-700">Gate Pass Remarks: </span>
            <span className="text-slate-600">{challan.remarks}</span>
          </div>

          {/* Digital QR & Cryptographic Seal Simulator */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-8 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Digital Gate Pass Verification Token</div>
                <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                  HASH: SHA256:{challan.challanNumber}-FIFO-VERIFIED-AUTH-0982
                </div>
                <div className="text-[10px] text-slate-500">
                  Scan at toll / weighbridge checkpoint to verify official release.
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block">Status:</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                AUTHENTICATED
              </span>
            </div>
          </div>

          {/* 3-Column Signatures Block */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-center text-xs">
            {/* 1. Depot Manager */}
            <div className="flex flex-col justify-end">
              <div className="h-10 border-b border-dashed border-slate-400 flex items-center justify-center text-[11px] font-serif italic text-[#702D3B]">
                {challan.authorizedBy.split('(')[0]}
              </div>
              <div className="font-bold text-slate-900 mt-1">Authorized Signatory</div>
              <div className="text-[10px] text-slate-500">Warehouse Depot In-Charge</div>
            </div>

            {/* 2. Transporter / Driver */}
            <div className="flex flex-col justify-end">
              <div className="h-10 border-b border-dashed border-slate-400 flex items-center justify-center text-[11px] font-serif italic text-slate-800">
                {challan.driverName}
              </div>
              <div className="font-bold text-slate-900 mt-1">Transport Carrier Signature</div>
              <div className="text-[10px] text-slate-500">Driver / Logistics Agent</div>
            </div>

            {/* 3. FPS Consignee */}
            <div className="flex flex-col justify-end">
              <div className="h-10 border-b border-dashed border-slate-400 flex items-center justify-center text-[11px] text-slate-400 italic">
                (Biometric / Stamp on Receipt)
              </div>
              <div className="font-bold text-slate-900 mt-1">Consignee FPS Dealer</div>
              <div className="text-[10px] text-slate-500">Fair Price Shop Authorization</div>
            </div>
          </div>

          {/* Document Footer Disclaimer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            This document is a demonstration artifact generated by SmartPDS FIFO Stock Allocation System for college hackathon evaluation.
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden in Print) */}
        <div className="no-print p-4 bg-[#FAF7F2] border-t border-[#E7E2DF] flex items-center justify-between text-xs text-[#707887]">
          <span>Challan Status: Recorded in Local Ledger</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-[#344054] bg-white hover:bg-[#FAF7F2] border border-[#E7E2DF] rounded-lg transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
