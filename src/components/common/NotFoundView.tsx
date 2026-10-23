import React from 'react';
import { FileQuestion, ArrowLeft, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface NotFoundViewProps {
  onReturnToDashboard: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onReturnToDashboard }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white dark:bg-[#151C28] rounded-2xl border border-[#E7E2DF] dark:border-[#293445] shadow-lg p-8 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF2F4] dark:bg-[#3B1020]/60 border border-[#702D3B]/30 dark:border-[#801B3A] flex items-center justify-center mx-auto text-[#702D3B] dark:text-[#E4B34F]">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-[#702D3B] dark:text-[#E4B34F] uppercase tracking-wider">
            Error 404 · Section Not Found
          </span>
          <h2 className="text-xl font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Depot Registry Record Unavailable
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-2 leading-relaxed">
            The requested warehouse register, allocation workflow, or navigation path could not be located in the current depot index.
          </p>
        </div>

        <div className="p-3 bg-[#FAF7F2] dark:bg-[#111827] rounded-xl border border-[#E7E2DF] dark:border-[#293445] text-[11px] text-[#707887] dark:text-[#A1AAB9] flex items-center gap-2 text-left">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            All legitimate stock movements are logged under the Overview Dashboard and Stock Management tabs.
          </span>
        </div>

        <button
          onClick={onReturnToDashboard}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#702D3B] hover:bg-[#54212D] dark:bg-[#801B3A] dark:hover:bg-[#9E2248] shadow-xs transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Warehouse Overview</span>
        </button>
      </div>
    </div>
  );
};
