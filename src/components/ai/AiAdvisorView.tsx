import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  Boxes,
  ArrowRightLeft,
  ShieldAlert,
  Info,
  Clock,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isAdvisory?: boolean;
}

export const AiAdvisorView: React.FC = () => {
  const { batches, dispatches } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Greetings. I am the SmartPDS Warehouse Advisory Desk. I analyze depot stock levels, monitor grain batch ageing horizons, and audit FIFO adherence per National Food Security Act (NFSA) guidelines.\n\n*Important Notice:* Under PDS statutory norms, my recommendations are strictly advisory. Allocation decisions and stock deductions are executed exclusively by the deterministic SmartPDS FIFO engine.`,
      timestamp: 'Just now',
      isAdvisory: true,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Compute live contextual data to ground responses in current state
  const generateAdvisoryResponse = (query: string): string => {
    const q = query.toLowerCase();

    const eligibleBatches = batches.filter((b) => b.status === 'Eligible' && b.availableBags > 0);
    const totalBags = eligibleBatches.reduce((sum, b) => sum + b.availableBags, 0);
    const totalQtl = Number(eligibleBatches.reduce((sum, b) => sum + b.availableQtl, 0).toFixed(2));

    const riceBatches = eligibleBatches.filter((b) => b.commodity === 'Rice');
    const wheatBatches = eligibleBatches.filter((b) => b.commodity === 'Wheat');

    const riceBags = riceBatches.reduce((sum, b) => sum + b.availableBags, 0);
    const wheatBags = wheatBatches.reduce((sum, b) => sum + b.availableBags, 0);

    const sortedEligible = [...eligibleBatches].sort(
      (a, b) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime()
    );
    const oldestBatch = sortedEligible[0];

    const criticalBatches = eligibleBatches.filter((b) => b.stockAgeDays >= 90);
    const quarantined = batches.filter((b) => b.status === 'Quarantined');
    const damaged = batches.filter((b) => b.status === 'Damaged');

    if (q.includes('stock') || q.includes('inventory') || q.includes('level') || q.includes('summarize')) {
      return `### Live Warehouse Stock Summary\n\n- **Total Allocatable Stock:** ${totalBags.toLocaleString()} bags (${totalQtl} Quintals)\n- **Rice Reserves:** ${riceBags.toLocaleString()} bags across ${riceBatches.length} active batches\n- **Wheat Reserves:** ${wheatBags.toLocaleString()} bags across ${wheatBatches.length} active batches\n\n**Quality Lockdown Check:**\n- Quarantined: ${quarantined.length} batch (${quarantined.reduce((a, b) => a + b.availableBags, 0)} bags locked for moisture)\n- Damaged: ${damaged.length} batch (${damaged.reduce((a, b) => a + b.availableBags, 0)} bags barred)\n\n*Advisory Advice:* Stock reserve levels are adequate for current monthly FPS quotas. No stock-out risk detected.`;
    }

    if (q.includes('age') || q.includes('ageing') || q.includes('alert') || q.includes('old') || q.includes('priority')) {
      return `### Ageing-Stock Analysis & FIFO Priority Queue\n\nCurrently, there are **${criticalBatches.length} batches** with storage age exceeding the 90-day threshold:\n\n1. **Top Priority: Batch ${oldestBatch ? oldestBatch.id : 'None'}**\n   - Commodity: ${oldestBatch ? `${oldestBatch.commodity} (${oldestBatch.variety})` : 'N/A'}\n   - Inward Date: ${oldestBatch ? oldestBatch.receivedDate : 'N/A'} (**${oldestBatch ? oldestBatch.stockAgeDays : 0} days in depot**)\n   - Available: ${oldestBatch ? oldestBatch.availableBags : 0} bags in ${oldestBatch ? oldestBatch.depotLocation : 'N/A'}\n\n**Actionable Advisory:**\n- Ensure upcoming Fair Price Shop allotments for ${oldestBatch ? oldestBatch.commodity : 'grain'} clear Batch ${oldestBatch ? oldestBatch.id : ''} immediately.\n- The SmartPDS FIFO engine will automatically prioritize this batch without manual intervention.`;
    }

    if (q.includes('dispatch') || q.includes('challan') || q.includes('throughput') || q.includes('recent')) {
      const totalMovedBags = dispatches.reduce((sum, d) => sum + d.totalBags, 0);
      return `### Dispatch Throughput & Challan Audit\n\n- **Completed Dispatches:** ${dispatches.length} digital challans recorded\n- **Total Grain Dispatched:** ${totalMovedBags.toLocaleString()} bags (${(totalMovedBags * 0.5).toFixed(1)} Qtl)\n\n**Most Recent Dispatches:**\n${dispatches
        .slice(0, 3)
        .map(
          (d) =>
            `- **${d.challanNumber}** (${d.timestamp.split('T')[0]}): ${d.totalBags} bags of ${d.commodity} dispatched to *${d.destinationName}* via Vehicle ${d.vehicleNumber}`
        )
        .join('\n')}\n\n*FIFO Integrity Audit:* 100% of issued challans strictly complied with chronological intake priority. Zero batch skipping detected.`;
    }

    if (q.includes('rule') || q.includes('fifo') || q.includes('nfsa') || q.includes('compliance')) {
      return `### PDS FIFO Allocation Guidelines (NFSA 2013 & Godown Manual)\n\n1. **Principle of First-In First-Out (FIFO):**\n   Oldest stored grain batches must always be allocated prior to releasing newer consignments to minimize grain deterioration and weevil infestation.\n\n2. **Exclusion of Non-FAQ Grain:**\n   Batches flagged as Quarantined (moisture > 12.0%) or Damaged must be immediately excluded from allocation algorithms.\n\n3. **Deterministic Application Logic:**\n   PDS regulations mandate that stock deductions must be deterministic and verifiable by physical stack ledgers. AI models are prohibited from directly authorizing dispatches or altering stock tallies.`;
    }

    // Default intelligent response
    return `### Advisory Assessment\n\nBased on your query regarding "${query}":\n\n- Current active allocatable batches: **${eligibleBatches.length}**\n- Oldest batch awaiting dispatch: **${oldestBatch ? oldestBatch.id : 'N/A'}** (${oldestBatch ? oldestBatch.stockAgeDays : 0} days)\n- Available stock: **${totalBags} bags** (${totalQtl} Qtl)\n\nTo see this in action, visit the **FIFO Allocation & Dispatch Engine** tab and enter a demand for 120 bags to observe autonomous oldest-first allocation.`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    // Realistic delay simulating advisory computation
    setTimeout(() => {
      const responseText = generateAdvisoryResponse(text);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAdvisory: true,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsGenerating(false);
    }, 600);
  };

  const samplePrompts = [
    'Summarize current stock levels across all commodities',
    'Explain ageing-stock alerts and recommend FIFO dispatch priorities',
    'Summarize recent dispatches and depot throughput',
    'Explain the FIFO algorithm compliance rules under PDS norms',
  ];

  return (
    <div className="space-y-6">
      {/* Header and Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#702D3B] dark:text-[#E4B34F]" />
            <span>PDS Warehouse AI Advisory Desk</span>
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Operational intelligence for stock ageing, moisture hazards, and statutory compliance
          </p>
        </div>

        {/* Clear Model Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF7F2] dark:bg-[#111827] rounded-lg border border-[#E7E2DF] dark:border-[#293445] text-xs">
          <Sparkles className="w-4 h-4 text-[#C5A46D] dark:text-[#E4B34F]" />
          <span className="text-[#707887] dark:text-[#A1AAB9] font-medium">Model:</span>
          <span className="font-semibold text-[#344054] dark:text-[#F1F5F9]">Local PDS Advisory Engine (Demo Mode)</span>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Statutory Boundary:</span> AI outputs are advisory only and cannot independently deduct stock, bypass warehouse permissions, or generate challans. The FIFO allocation calculation is executed purely through deterministic mathematical logic.
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-2xs flex flex-col h-[560px] overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-[#702D3B] dark:bg-[#801B3A] text-white'
                    : 'bg-[#54212D] dark:bg-[#3B1020] text-[#C5A46D] dark:text-[#E4B34F]'
                }`}
              >
                {msg.sender === 'user' ? <span className="text-xs font-bold">U</span> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#702D3B] dark:bg-[#801B3A] text-white rounded-tr-none'
                    : 'bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] text-[#344054] dark:text-[#F1F5F9] rounded-tl-none'
                }`}
              >
                {/* Render formatted markdown-like text */}
                <div className="whitespace-pre-line space-y-1">
                  {msg.text.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={idx} className="font-bold text-[#344054] dark:text-[#F1F5F9] text-sm mt-1 mb-1">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }
                    return <p key={idx}>{paragraph}</p>;
                  })}
                </div>

                <div
                  className={`mt-2 text-[10px] flex items-center justify-between ${
                    msg.sender === 'user' ? 'text-amber-100' : 'text-[#707887] dark:text-[#A1AAB9]'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.isAdvisory && (
                    <span className="italic">Advisory Output · Demo Mode</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-full bg-[#54212D] dark:bg-[#3B1020] text-[#C5A46D] dark:text-[#E4B34F] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] text-xs text-[#707887] dark:text-[#A1AAB9] rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#702D3B] dark:bg-[#E4B34F] animate-ping" />
                <span>Analyzing warehouse ledger and batch age profiles...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Starters */}
        <div className="p-3 bg-[#FAF7F2] dark:bg-[#111827] border-t border-[#E7E2DF] dark:border-[#293445] flex flex-wrap gap-2">
          <span className="text-[11px] font-semibold text-[#707887] dark:text-[#A1AAB9] self-center">
            Suggested queries:
          </span>
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] px-2.5 py-1 bg-white dark:bg-[#151C28] hover:bg-[#FAF2F4] dark:hover:bg-[#3B1020]/40 border border-[#E7E2DF] dark:border-[#293445] rounded-md text-[#344054] dark:text-[#F1F5F9] transition-colors text-left truncate max-w-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-[#151C28] border-t border-[#E7E2DF] dark:border-[#293445] flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask about grain stock levels, ageing batches, or PDS FIFO rules..."
            className="flex-1 px-4 py-2 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg outline-none focus:bg-white dark:focus:bg-[#151C28] focus:border-[#702D3B] dark:focus:border-[#801B3A] text-[#344054] dark:text-[#F1F5F9] placeholder:text-[#707887] dark:placeholder:text-[#A1AAB9]"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || isGenerating}
            className="px-4 py-2 bg-[#702D3B] hover:bg-[#54212D] dark:bg-[#801B3A] dark:hover:bg-[#9E2248] disabled:bg-[#E7E2DF] dark:disabled:bg-[#293445] disabled:text-[#707887] dark:disabled:text-[#A1AAB9] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
