import React from 'react';
import { ShieldCheck, X, FileText, Lock, Building, CheckCircle2 } from 'lucide-react';

interface StatutoryPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatutoryPrivacyModal: React.FC<StatutoryPrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#54212D] dark:bg-[#3B1020] text-white flex items-center justify-between border-b border-[#702D3B]/50 dark:border-[#801B3A]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#702D3B] dark:bg-[#801B3A] border border-[#C5A46D]/40 dark:border-[#E4B34F]/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#E4B34F]" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">
                Statutory Governance & Data Privacy Policy
              </h2>
              <p className="text-xs text-[#E7E2DF]/80 dark:text-[#A1AAB9]">
                Public Distribution System (PDS) Grain Logistics & Compliance Framework
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#E7E2DF]/80 hover:text-white hover:bg-[#702D3B] dark:hover:bg-[#801B3A] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs text-[#344054] dark:text-[#CBD5E1] max-h-[70vh] overflow-y-auto leading-relaxed">
          {/* Section 1: NFSA 2013 Compliance */}
          <div className="p-4 bg-[#FAF7F2] dark:bg-[#111827] rounded-xl border border-[#E7E2DF] dark:border-[#293445] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#702D3B] dark:text-[#E4B34F]">
              <Building className="w-4 h-4 shrink-0" />
              <span>1. National Food Security Act (NFSA 2013) Mandate</span>
            </div>
            <p>
              SmartPDS operates strictly within the statutory guidelines of the National Food Security Act (NFSA), 2013. The automated First-In, First-Out (FIFO) allocation algorithms ensure that grain consignments approaching ageing thresholds are allocated first to prevent spoilage, reduce transit losses, and guarantee nutritional standards for targeted beneficiaries.
            </p>
          </div>

          {/* Section 2: Fair Price Shop Dealer Confidentiality */}
          <div className="p-4 bg-[#FAF7F2] dark:bg-[#111827] rounded-xl border border-[#E7E2DF] dark:border-[#293445] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#702D3B] dark:text-[#E4B34F]">
              <Lock className="w-4 h-4 shrink-0" />
              <span>2. Consignee & Transporter Contact Confidentiality</span>
            </div>
            <p>
              All dealer phone numbers, transport driver contacts, and gate pass tokens displayed within SmartPDS are maintained for authorized depot dispatch operations. Official communications and delivery verification protocols strictly follow Department of Food & Civil Supplies operating guidelines.
            </p>
          </div>

          {/* Section 3: Beneficiary PII Zero-Exposure Boundary */}
          <div className="p-4 bg-[#FAF7F2] dark:bg-[#111827] rounded-xl border border-[#E7E2DF] dark:border-[#293445] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#702D3B] dark:text-[#E4B34F]">
              <FileText className="w-4 h-4 shrink-0" />
              <span>3. Beneficiary PII Non-Disclosure Boundary</span>
            </div>
            <p>
              In accordance with Aadhaar Act Section 29 and standard data governance policies, this warehouse tier does NOT collect, store, or transmit citizen biometric data or personal identity information. Aggregations at the depot level are confined exclusively to commodity bag counts, Fair Price Shop card quotas, and vehicle transit weights.
            </p>
          </div>

          {/* Section 4: Audit Immutability & Cryptographic Integrity */}
          <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2 text-emerald-950 dark:text-emerald-200">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>4. Anti-Diversion & Immutable Ledger Integrity</span>
            </div>
            <p>
              Every stock movement event—including inward delivery receipts, moisture updates, quarantine designations, and FIFO allocations—is permanently recorded in the system audit ledger with SHA-256 integrity verification hashes, operator identification, and timestamp tokens to eliminate diversion risks.
            </p>
          </div>

          {/* Section 5: Demonstration Environment Disclaimer */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px]">
            <span className="font-bold">Hackathon Demonstration Notice:</span> This application functions as an academic prototype simulation demonstrating automated FIFO allocation logic, digital challan issuance (Form PDS-12), and role-based access control for civil supplies operations.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF7F2] dark:bg-[#111827] border-t border-[#E7E2DF] dark:border-[#293445] flex items-center justify-between">
          <span className="text-[11px] text-[#707887] dark:text-[#A1AAB9]">
            Document Ref: PDS-STAT-GOV-2026/V4
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#702D3B] hover:bg-[#54212D] dark:bg-[#801B3A] dark:hover:bg-[#9E2248] rounded-lg shadow-xs transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
