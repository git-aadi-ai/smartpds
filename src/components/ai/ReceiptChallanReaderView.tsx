import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommodityType, QualityGrade } from '../../types';
import {
  FileScan,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileText,
  Truck,
  Droplets,
  Layers,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';

interface SampleDoc {
  id: string;
  name: string;
  docType: 'Mill Rake Inward Receipt' | 'PDS Lorry Challan' | 'Fair Price Shop Indent';
  date: string;
  sourceText: string;
  extracted: {
    commodity: CommodityType;
    variety: string;
    bags: number;
    bagWeightKg: number;
    moisturePercentage: number;
    qualityGrade: QualityGrade;
    lorryNumber: string;
    supplierSource: string;
    gatePassNo: string;
    depotLocation: string;
  };
}

const SAMPLE_DOCS: SampleDoc[] = [
  {
    id: 'DOC-01',
    name: 'FCI Raichur Mill Rake Receipt (Lorry #KA-25-EA-9041)',
    docType: 'Mill Rake Inward Receipt',
    date: '2026-10-23',
    sourceText: `FOOD CORPORATION OF INDIA - DIVISIONAL WEIGHBRIDGE
INWARD CONSIGNMENT SLIP #WBR-2026-9041
Consignor: Raichur Modern Rice Mill #3
Consignee: FCI District Base Depot #4 Hubballi
Commodity: Rice (Grade A - Boiled)
Total Bags: 300 Bags (Gunny tare 50 kg)
Gross Weight: 18,250 kg | Tare: 3,250 kg | Net: 15,000 kg (150.0 Qtl)
Moisture Level: 11.4% (Direct Sensor Probe Calibrated)
Quality Inspection: FAQ Grade-I
Vehicle Registration: KA-25-EA-9041
Driver: H. Manjunath | Gate Pass: GP-INW-094`,
    extracted: {
      commodity: 'Rice',
      variety: 'Grade A - Boiled',
      bags: 300,
      bagWeightKg: 50,
      moisturePercentage: 11.4,
      qualityGrade: 'Grade-I (FAQ)',
      lorryNumber: 'KA-25-EA-9041',
      supplierSource: 'Raichur Modern Rice Mill #3 (Rake #14)',
      gatePassNo: 'GP-INW-094',
      depotLocation: 'Godown-A, Stack 05',
    },
  },
  {
    id: 'DOC-02',
    name: 'Durum Wheat Milling Consignment (Truck #KA-26-B-1190)',
    docType: 'Mill Rake Inward Receipt',
    date: '2026-10-22',
    sourceText: `KARNATAKA STATE WAREHOUSING CORP - INWARD WAYBILL
Consignment Ref: KSWC-HUB-0881
Commodity: Wheat (Sharbati Lokwan)
Pack Count: 200 Bags (50 kg each)
Net Metric Weight: 10,000 kg (100.0 Qtl)
Lab Moisture: 12.2% | Grade: Grade-I (FAQ)
Depot Destination: FCI Depot #4 Hubballi
Vehicle: KA-26-B-1190 | Carrier: Hubli Roadways`,
    extracted: {
      commodity: 'Wheat',
      variety: 'Sharbati Lokwan',
      bags: 200,
      bagWeightKg: 50,
      moisturePercentage: 12.2,
      qualityGrade: 'Grade-I (FAQ)',
      lorryNumber: 'KA-26-B-1190',
      supplierSource: 'Karnataka State Warehousing Corp, Dharwad',
      gatePassNo: 'GP-INW-088',
      depotLocation: 'Godown-C, Stack 04',
    },
  },
];

export const ReceiptChallanReaderView: React.FC = () => {
  const { addStockReceipt, addToast } = useApp();

  const [selectedDocId, setSelectedDocId] = useState<string>(SAMPLE_DOCS[0].id);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<SampleDoc['extracted']>(SAMPLE_DOCS[0].extracted);
  const [isCommitted, setIsCommitted] = useState(false);

  const selectedDoc = SAMPLE_DOCS.find((d) => d.id === selectedDocId) || SAMPLE_DOCS[0];

  const handleSelectSample = (doc: SampleDoc) => {
    setSelectedDocId(doc.id);
    setIsScanning(true);
    setIsCommitted(false);
    setTimeout(() => {
      setExtractedData(doc.extracted);
      setIsScanning(false);
      addToast('info', 'Document Extracted', `OCR parsed 9 fields with 99.4% confidence.`);
    }, 600);
  };

  const handleCommitToRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addStockReceipt({
      commodity: extractedData.commodity,
      variety: extractedData.variety,
      receivedDate: new Date().toISOString().split('T')[0],
      initialBags: extractedData.bags,
      bagWeightKg: extractedData.bagWeightKg,
      depotLocation: extractedData.depotLocation,
      warehouseName: 'FCI District Base Depot #4, Hubballi',
      moisturePercentage: extractedData.moisturePercentage,
      qualityInspectionGrade: extractedData.qualityGrade,
      status: extractedData.moisturePercentage > 14 ? 'Quarantined' : 'Eligible',
      supplierSource: `${extractedData.supplierSource} (Imported via AI OCR Lorry: ${extractedData.lorryNumber})`,
      notes: `Imported via AI Receipt Reader OCR from ${selectedDoc.name}.`,
    });

    if (res.success) {
      setIsCommitted(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              Computer Vision & OCR
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Physical Document Digitizer</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            AI Inward Receipt & Gate Pass Document Reader
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Digitize paper lorry waybills, mill rake slips, and delivery indents into structured inventory records with verification safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#FAF2F4] dark:bg-[#3B1020] border border-[#702D3B]/30 dark:border-[#801B3A]/50 text-[#702D3B] dark:text-[#E4B34F] text-xs font-semibold flex items-center gap-1.5 font-mono">
            <FileScan className="w-3.5 h-3.5" />
            <span>OCR Confidence: 99.4%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Sample Select & Scanned Raw Document View */}
        <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
              Physical Document Source
            </h3>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Select Sample Document</span>
          </div>

          {/* Sample Switcher Buttons */}
          <div className="space-y-2">
            {SAMPLE_DOCS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectSample(doc)}
                className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedDocId === doc.id
                    ? 'bg-[#FAF2F4] dark:bg-[#3B1020]/60 border-[#702D3B] dark:border-[#E4B34F]'
                    : 'bg-[#FAF7F2] dark:bg-[#111827] border-[#E7E2DF] dark:border-[#293445] hover:border-[#702D3B]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#344054] dark:text-[#F1F5F9]">{doc.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#151C28] border border-[#E7E2DF] dark:border-[#293445]">
                    {doc.docType}
                  </span>
                </div>
                <div className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">
                  Issued: {doc.date} · Click to run OCR parsing
                </div>
              </button>
            ))}
          </div>

          {/* Raw Scanned OCR Canvas Preview */}
          <div className="mt-4 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#0B0F17] border border-[#E7E2DF] dark:border-[#293445] font-mono text-xs leading-relaxed text-[#344054] dark:text-[#CBD5E1] whitespace-pre-wrap max-h-72 overflow-y-auto">
            {selectedDoc.sourceText}
          </div>
        </div>

        {/* Right Column: AI Extraction & Verification Form */}
        <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DF] dark:border-[#293445]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#702D3B] dark:text-[#E4B34F]" />
              <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
                Structured Field Verification & Import
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Verified by Human Inspector
            </span>
          </div>

          <form onSubmit={handleCommitToRegister} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Commodity
                </label>
                <input
                  type="text"
                  value={extractedData.commodity}
                  onChange={(e) => setExtractedData({ ...extractedData, commodity: e.target.value as CommodityType })}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Variety
                </label>
                <input
                  type="text"
                  value={extractedData.variety}
                  onChange={(e) => setExtractedData({ ...extractedData, variety: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Bags Count
                </label>
                <input
                  type="number"
                  value={extractedData.bags}
                  onChange={(e) => setExtractedData({ ...extractedData, bags: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Moisture %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={extractedData.moisturePercentage}
                  onChange={(e) => setExtractedData({ ...extractedData, moisturePercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Lorry Vehicle #
                </label>
                <input
                  type="text"
                  value={extractedData.lorryNumber}
                  onChange={(e) => setExtractedData({ ...extractedData, lorryNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                  Depot Stack Bay Location
                </label>
                <input
                  type="text"
                  value={extractedData.depotLocation}
                  onChange={(e) => setExtractedData({ ...extractedData, depotLocation: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#344054] dark:text-[#CBD5E1] mb-1">
                Source Supply Rake / Mill
              </label>
              <input
                type="text"
                value={extractedData.supplierSource}
                onChange={(e) => setExtractedData({ ...extractedData, supplierSource: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isCommitted}
              className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                isCommitted
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-[#702D3B] dark:bg-[#801B3A] hover:bg-[#54212D] dark:hover:bg-[#9E2248] text-white shadow-sm'
              }`}
            >
              {isCommitted ? (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span>Successfully Committed to Depot Register</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Confirm Verified Fields & Generate Batch</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
