import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Activity,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  Server,
  Layers,
} from 'lucide-react';

export const SystemActivityView: React.FC = () => {
  const { auditLogs, batches, dispatches, currentRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Simulated live event feed combining system audit logs with telemetry
  const systemEvents = [
    {
      id: 'EVT-101',
      time: 'Just now',
      type: 'SECURITY',
      title: 'Active Session Verified',
      description: `Authenticated session verified for ${currentRole} under Karnataka Civil Supplies IAM service.`,
      status: 'OK',
    },
    {
      id: 'EVT-102',
      time: '8 mins ago',
      type: 'FIFO_ENGINE',
      title: 'Deterministic FIFO Queue Sync',
      description: 'Queue sequence recalculated across 14 depot bays. Oldest batch BATCH-RC-2026-001 (164d) locked at head.',
      status: 'OK',
    },
    {
      id: 'EVT-103',
      time: '24 mins ago',
      type: 'IOT_SENSOR',
      title: 'Weighbridge Bridge Calibration Check',
      description: 'Electronic tare calibration check performed on Inward Weighbridge #2: 0.00 kg zero tare verified.',
      status: 'OK',
    },
    {
      id: 'EVT-104',
      time: '1 hour ago',
      type: 'NETWORK',
      title: 'National Food Security Portal Sync',
      description: 'Cryptographic ledger heartbeat pulse transmitted to Karnataka State Civil Supplies cloud hub.',
      status: 'OK',
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    return (
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.referenceId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] rounded border border-[#702D3B]/20 dark:border-[#801B3A]/40 uppercase tracking-wider">
              System Telemetry
            </span>
            <span className="text-xs text-[#707887] dark:text-[#A1AAB9]">Infrastructure & Event Stream</span>
          </div>
          <h2 className="text-lg font-bold text-[#344054] dark:text-[#F1F5F9] mt-1">
            Notifications, Server Health & Real-Time Activity Log
          </h2>
          <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5">
            Real-time feed of sensor alerts, gateway handshakes, dispatch issues, and administrative events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 font-mono">
            <Server className="w-3.5 h-3.5" />
            <span>Depot Server Hubballi: Operational (99.98% uptime)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: System Status Telemetry */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9] pb-2 border-b border-[#E7E2DF] dark:border-[#293445]">
              Core Service Telemetry
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#707887] dark:text-[#A1AAB9]">FIFO Rotation Engine:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">Active (Sub-10ms)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#707887] dark:text-[#A1AAB9]">Weighbridge IoT Gateway:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">Connected (RS-232)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#707887] dark:text-[#A1AAB9]">Database Sync:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">100% In-Memory Local</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#707887] dark:text-[#A1AAB9]">Cryptographic Hash Verifier:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">SHA-256 Enabled</span>
              </div>
            </div>
          </div>

          {/* Real-time System Heartbeats */}
          <div className="p-5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9] pb-2 border-b border-[#E7E2DF] dark:border-[#293445]">
              Real-Time Security Feed
            </h3>

            <div className="space-y-3">
              {systemEvents.map((evt) => (
                <div key={evt.id} className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#344054] dark:text-[#F1F5F9]">{evt.title}</span>
                    <span className="text-[10px] text-[#707887] dark:text-[#A1AAB9] font-mono">{evt.time}</span>
                  </div>
                  <p className="text-[11px] text-[#707887] dark:text-[#A1AAB9] mt-1">{evt.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Complete Audit Activity Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#151C28] rounded-xl border border-[#E7E2DF] dark:border-[#293445] shadow-xs p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold text-[#344054] dark:text-[#F1F5F9]">
              Depot Audit Activity Stream ({filteredLogs.length} events)
            </h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#707887] dark:text-[#A1AAB9]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-8 pr-2.5 py-1 text-xs bg-[#FAF7F2] dark:bg-[#111827] border border-[#E7E2DF] dark:border-[#293445] rounded-lg text-[#344054] dark:text-[#F1F5F9]"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-[#E7E2DF] dark:border-[#293445] rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] dark:bg-[#111827] text-[#707887] dark:text-[#A1AAB9] font-semibold border-b border-[#E7E2DF] dark:border-[#293445]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">User & Role</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2DF] dark:divide-[#293445]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1A2230]/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#707887] dark:text-[#A1AAB9] whitespace-nowrap">
                      {log.timestamp.split('T')[0]} {log.timestamp.split('T')[1]?.slice(0, 5)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-[10px] px-1.5 py-0.5 rounded bg-[#FAF2F4] dark:bg-[#3B1020] text-[#702D3B] dark:text-[#E4B34F] font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      <div className="font-semibold text-[#344054] dark:text-[#F1F5F9]">{log.user}</div>
                      <div className="text-[10px] text-[#707887] dark:text-[#A1AAB9]">{log.role}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#702D3B] dark:text-[#E4B34F]">
                      {log.referenceId}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#344054] dark:text-[#CBD5E1] max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
