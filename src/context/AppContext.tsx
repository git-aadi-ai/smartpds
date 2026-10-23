import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Batch,
  DispatchRecord,
  AuditLog,
  AllocationItem,
  UserRole,
  FairPriceShop,
  CommodityType,
  BatchStatus,
  ReconciliationRecord,
  FifoException,
  ApprovalRequest,
  DeliveryTrackingRecord,
  ReturnDiscrepancyRecord,
  AnomalyAlert,
  DepotSettings,
  ApprovalRule,
} from '../types';
import {
  INITIAL_BATCHES,
  INITIAL_DISPATCHES,
  INITIAL_AUDIT_LOGS,
  INITIAL_FAIR_PRICE_SHOPS,
  INITIAL_RECONCILIATIONS,
  INITIAL_FIFO_EXCEPTIONS,
  INITIAL_APPROVAL_REQUESTS,
  INITIAL_DELIVERY_TRACKING,
  INITIAL_RETURN_DISCREPANCIES,
  INITIAL_ANOMALIES,
  DEFAULT_DEPOT_SETTINGS,
  INITIAL_APPROVAL_RULES,
  calculateAgeDays,
} from '../data/mockData';

interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

interface FifoPreviewResult {
  success: boolean;
  error?: string;
  commodity: CommodityType;
  variety: string;
  requestedBags: number;
  totalEligibleAvailableBags: number;
  allocations: AllocationItem[];
  allEligibleBatches: Batch[];
}

interface AppContextType {
  // Data
  batches: Batch[];
  dispatches: DispatchRecord[];
  auditLogs: AuditLog[];
  fairPriceShops: FairPriceShop[];
  currentRole: UserRole;
  toasts: ToastNotification[];
  activeChallan: DispatchRecord | null;
  theme: 'light' | 'dark';

  // Extended Operational Data
  reconciliations: ReconciliationRecord[];
  fifoExceptions: FifoException[];
  approvalRequests: ApprovalRequest[];
  deliveryTracking: DeliveryTrackingRecord[];
  returnDiscrepancies: ReturnDiscrepancyRecord[];
  anomalies: AnomalyAlert[];
  depotSettings: DepotSettings;
  approvalRules: ApprovalRule[];

  // Theme
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Role
  setCurrentRole: (role: UserRole) => void;

  // Toast
  addToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Challan Preview
  setActiveChallan: (challan: DispatchRecord | null) => void;

  // FIFO Calculation
  calculateFifoPreview: (
    commodity: CommodityType,
    variety: string,
    requestedBags: number
  ) => FifoPreviewResult;

  // Actions
  executeDispatch: (params: {
    commodity: CommodityType;
    variety: string;
    requestedBags: number;
    destinationFpsId: string;
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    transporterAgency: string;
    remarks?: string;
  }) => { success: boolean; challan?: DispatchRecord; error?: string };

  addStockReceipt: (newBatch: Omit<Batch, 'id' | 'availableBags' | 'availableQtl' | 'totalReceivedQtl' | 'stockAgeDays' | 'movements'>) => {
    success: boolean;
    batchId?: string;
    error?: string;
  };

  updateBatchStatus: (
    batchId: string,
    newStatus: BatchStatus,
    reason: string
  ) => { success: boolean; error?: string };

  editBatchMetadata: (
    batchId: string,
    updates: { depotLocation?: string; notes?: string; moisturePercentage?: number }
  ) => { success: boolean; error?: string };

  // New Workflow Actions
  addReconciliation: (rec: Omit<ReconciliationRecord, 'id' | 'reconciledDate' | 'status'> & { varianceReason?: string }) => void;
  reviewReconciliation: (id: string, action: 'Approve' | 'Reject', notes: string) => void;
  requestFifoException: (params: {
    requestedCommodity: CommodityType;
    requestedVariety: string;
    requestedBags: number;
    skippedBatchId: string;
    allocatedBatchId: string;
    justificationReason: string;
  }) => { success: boolean; exceptionId?: string; error?: string };
  reviewFifoException: (id: string, decision: 'Approved' | 'Rejected', remarks: string) => void;
  reviewApprovalRequest: (id: string, decision: 'Approved' | 'Rejected', remarks: string) => void;
  updateDeliveryMilestone: (id: string, milestone: DeliveryTrackingRecord['currentMilestone'], note: string) => void;
  addReturnDiscrepancy: (item: Omit<ReturnDiscrepancyRecord, 'id' | 'reportDate' | 'status'> & { status?: ReturnDiscrepancyRecord['status'] }) => void;
  resolveAnomaly: (id: string, note: string) => void;
  updateDepotSettings: (newSettings: Partial<DepotSettings>) => void;
  toggleApprovalRule: (id: string) => void;

  resetDemoData: () => void;
}

const STORAGE_KEY_PREFIX = 'smartpds_v1_';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [batches, setBatches] = useState<Batch[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}batches`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_BATCHES;
  });

  const [dispatches, setDispatches] = useState<DispatchRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}dispatches`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_DISPATCHES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [fairPriceShops] = useState<FairPriceShop[]>(INITIAL_FAIR_PRICE_SHOPS);
  const [currentRole, setCurrentRole] = useState<UserRole>('Warehouse Manager');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [activeChallan, setActiveChallan] = useState<DispatchRecord | null>(null);

  // Extended Operational Data States
  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}reconciliations`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_RECONCILIATIONS;
  });

  const [fifoExceptions, setFifoExceptions] = useState<FifoException[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}fifo_exceptions`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_FIFO_EXCEPTIONS;
  });

  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}approval_requests`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_APPROVAL_REQUESTS;
  });

  const [deliveryTracking, setDeliveryTracking] = useState<DeliveryTrackingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}delivery_tracking`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_DELIVERY_TRACKING;
  });

  const [returnDiscrepancies, setReturnDiscrepancies] = useState<ReturnDiscrepancyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}return_discrepancies`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_RETURN_DISCREPANCIES;
  });

  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}anomalies`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_ANOMALIES;
  });

  const [depotSettings, setDepotSettings] = useState<DepotSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}depot_settings`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_DEPOT_SETTINGS;
  });

  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}approval_rules`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_APPROVAL_RULES;
  });

  // Theme Mode State with persistence (Default to Light Mode on first visit)
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('smartpds_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    } catch {
      // Fallback
    }
    return 'light';
  });

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('smartpds_theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('smartpds_theme', next);
      } catch (e) {
        console.error('Failed to save theme to localStorage', e);
      }
      return next;
    });
  }, []);

  // Sync class 'dark' on <html> element instantly
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}batches`, JSON.stringify(batches));
    } catch (err) {
      console.error('Failed to save batches to localStorage', err);
    }
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}dispatches`, JSON.stringify(dispatches));
    } catch (err) {
      console.error('Failed to save dispatches to localStorage', err);
    }
  }, [dispatches]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(auditLogs));
    } catch (err) {
      console.error('Failed to save auditLogs to localStorage', err);
    }
  }, [auditLogs]);

  const addToast = useCallback((type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message, timestamp: Date.now() }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Strict FIFO Allocation Calculation (Deterministic, Oldest First, Excludes Damaged & Quarantined)
  const calculateFifoPreview = useCallback(
    (commodity: CommodityType, variety: string, requestedBags: number): FifoPreviewResult => {
      if (requestedBags <= 0) {
        return {
          success: false,
          error: 'Requested quantity must be at least 1 bag.',
          commodity,
          variety,
          requestedBags: 0,
          totalEligibleAvailableBags: 0,
          allocations: [],
          allEligibleBatches: [],
        };
      }

      // Filter: only Eligible batches of the requested commodity & variety with available stock > 0
      // Quarantined, Damaged, and Exhausted batches are NEVER allocated
      const eligibleBatches = batches.filter((b) => {
        const matchesCommodity = b.commodity === commodity;
        const matchesVariety = variety === 'ALL' || b.variety === variety;
        const isEligibleStatus = b.status === 'Eligible';
        const hasStock = b.availableBags > 0;
        return matchesCommodity && matchesVariety && isEligibleStatus && hasStock;
      });

      // Sort strictly by receivedDate ASC (Oldest first)
      const sortedBatches = [...eligibleBatches].sort((a, b) => {
        const dateA = new Date(a.receivedDate).getTime();
        const dateB = new Date(b.receivedDate).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.id.localeCompare(b.id);
      });

      const totalEligibleAvailableBags = sortedBatches.reduce((acc, b) => acc + b.availableBags, 0);

      if (requestedBags > totalEligibleAvailableBags) {
        return {
          success: false,
          error: `Insufficient eligible stock. Requested ${requestedBags} bags, but only ${totalEligibleAvailableBags} bags are currently eligible for allocation.`,
          commodity,
          variety,
          requestedBags,
          totalEligibleAvailableBags,
          allocations: [],
          allEligibleBatches: sortedBatches,
        };
      }

      let remainingToAllocate = requestedBags;
      const allocations: AllocationItem[] = [];

      for (const batch of sortedBatches) {
        if (remainingToAllocate <= 0) break;

        const takeBags = Math.min(batch.availableBags, remainingToAllocate);
        const allocatedQtl = Number(((takeBags * batch.bagWeightKg) / 100).toFixed(2));
        const remainingBagsAfter = batch.availableBags - takeBags;

        allocations.push({
          batchId: batch.id,
          commodity: batch.commodity,
          variety: batch.variety,
          receivedDate: batch.receivedDate,
          availableBags: batch.availableBags,
          allocatedBags: takeBags,
          allocatedQtl,
          remainingBagsAfter,
          depotLocation: batch.depotLocation,
          stockAgeDays: batch.stockAgeDays,
          isFullyExhausted: remainingBagsAfter === 0,
        });

        remainingToAllocate -= takeBags;
      }

      return {
        success: true,
        commodity,
        variety,
        requestedBags,
        totalEligibleAvailableBags,
        allocations,
        allEligibleBatches: sortedBatches,
      };
    },
    [batches]
  );

  // Execute Dispatch with Double-Deduction Protection & Immediate Challan Generation
  const executeDispatch = useCallback(
    (params: {
      commodity: CommodityType;
      variety: string;
      requestedBags: number;
      destinationFpsId: string;
      vehicleNumber: string;
      driverName: string;
      driverPhone: string;
      transporterAgency: string;
      remarks?: string;
    }) => {
      // Role check (Auditors cannot create dispatches)
      if (currentRole === 'Vigilance Auditor') {
        addToast('error', 'Permission Denied', 'Auditors hold read-only privileges and cannot authorize dispatches.');
        return { success: false, error: 'Permission denied: Auditor role is read-only.' };
      }

      const fps = fairPriceShops.find((f) => f.id === params.destinationFpsId);
      if (!fps) {
        addToast('error', 'Invalid Destination', 'Selected Fair Price Shop was not found.');
        return { success: false, error: 'Invalid destination Fair Price Shop.' };
      }

      const preview = calculateFifoPreview(params.commodity, params.variety, params.requestedBags);
      if (!preview.success || preview.allocations.length === 0) {
        addToast('error', 'Allocation Failed', preview.error || 'Could not allocate required quantity.');
        return { success: false, error: preview.error };
      }

      const now = new Date();
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const challanNumber = `PDS-CH-2026-${randomSeq}`;
      const gatePassNo = `GP-2026-HUB-${Math.floor(2000 + Math.random() * 8000)}`;

      const totalQtl = Number(
        preview.allocations.reduce((sum, item) => sum + item.allocatedQtl, 0).toFixed(2)
      );

      const allocatedBatchesSummary = preview.allocations.map((a) => ({
        batchId: a.batchId,
        bags: a.allocatedBags,
        qtl: a.allocatedQtl,
        receivedDate: a.receivedDate,
        bay: a.depotLocation,
        stockAgeDays: a.stockAgeDays,
      }));

      const newDispatch: DispatchRecord = {
        challanNumber,
        timestamp: now.toISOString(),
        commodity: params.commodity,
        variety: params.variety,
        totalBags: params.requestedBags,
        totalQtl,
        destinationFpsId: fps.id,
        destinationName: fps.name,
        destinationDistrict: fps.district,
        destinationAddress: `${fps.taluk}, ${fps.district} District, Karnataka`,
        vehicleNumber: params.vehicleNumber.toUpperCase().trim(),
        driverName: params.driverName.trim(),
        driverPhone: params.driverPhone.trim(),
        transporterAgency: params.transporterAgency.trim(),
        gatePassNo,
        allocatedBatches: allocatedBatchesSummary,
        status: 'Dispatched',
        dispatchedBy: `${currentRole === 'Warehouse Manager' ? 'Anand Kumar' : 'Rajesh V.'} (${currentRole})`,
        authorizedBy: 'Anand Kumar (Warehouse Manager)',
        remarks: params.remarks || 'Standard PDS quota allocation per strict FIFO compliance.',
        isDemo: true,
      };

      // Atomic stock deduction from batches
      setBatches((prevBatches) =>
        prevBatches.map((b) => {
          const allocation = preview.allocations.find((a) => a.batchId === b.id);
          if (!allocation) return b;

          const updatedAvailableBags = b.availableBags - allocation.allocatedBags;
          const updatedAvailableQtl = Number(((updatedAvailableBags * b.bagWeightKg) / 100).toFixed(2));
          const newStatus: BatchStatus = updatedAvailableBags <= 0 ? 'Exhausted' : b.status;

          const newMovement = {
            id: `MOV-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            date: now.toISOString().split('T')[0],
            action: 'DISPATCH' as const,
            quantityBags: allocation.allocatedBags,
            quantityQtl: allocation.allocatedQtl,
            referenceId: challanNumber,
            user: `${currentRole}`,
            notes: `Dispatched ${allocation.allocatedBags} bags to ${fps.name} via Gate Pass ${gatePassNo}`,
          };

          return {
            ...b,
            availableBags: updatedAvailableBags,
            availableQtl: updatedAvailableQtl,
            status: newStatus,
            movements: [newMovement, ...b.movements],
          };
        })
      );

      // Append to dispatches
      setDispatches((prev) => [newDispatch, ...prev]);

      // Append to audit trail
      const newAudit: AuditLog = {
        id: `AUD-${Date.now()}`,
        timestamp: now.toISOString(),
        user: currentRole === 'Warehouse Manager' ? 'Anand Kumar' : 'Rajesh V.',
        role: currentRole,
        action: 'FIFO_DISPATCH',
        entity: 'DISPATCH',
        referenceId: challanNumber,
        result: 'SUCCESS',
        details: `Dispatched ${params.requestedBags} bags (${totalQtl} Qtl) of ${params.commodity} (${params.variety}) to ${fps.name}. FIFO batches allocated: ${preview.allocations
          .map((a) => `${a.batchId} (${a.allocatedBags} bags)`)
          .join(', ')}.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      // Set active challan for instant preview
      setActiveChallan(newDispatch);

      addToast(
        'success',
        'Dispatch Authorized & Confirmed',
        `Challan ${challanNumber} generated. ${params.requestedBags} bags allocated under strict FIFO rules.`
      );

      return { success: true, challan: newDispatch };
    },
    [batches, calculateFifoPreview, currentRole, fairPriceShops, addToast]
  );

  // Inward Stock Receipt
  const addStockReceipt = useCallback(
    (
      newBatchData: Omit<
        Batch,
        'id' | 'availableBags' | 'availableQtl' | 'totalReceivedQtl' | 'stockAgeDays' | 'movements'
      >
    ) => {
      if (currentRole === 'Vigilance Auditor') {
        addToast('error', 'Action Restricted', 'Auditor role is read-only. Cannot record stock receipts.');
        return { success: false, error: 'Read-only role.' };
      }

      const randomNum = Math.floor(100 + Math.random() * 900);
      const prefix = newBatchData.commodity === 'Rice' ? 'RC' : newBatchData.commodity === 'Wheat' ? 'WT' : 'CM';
      const batchId = `BATCH-${prefix}-2026-${randomNum}`;

      const totalReceivedQtl = Number(((newBatchData.initialBags * newBatchData.bagWeightKg) / 100).toFixed(2));
      const ageDays = calculateAgeDays(newBatchData.receivedDate);

      const newBatch: Batch = {
        ...newBatchData,
        id: batchId,
        availableBags: newBatchData.initialBags,
        totalReceivedQtl,
        availableQtl: totalReceivedQtl,
        stockAgeDays: ageDays,
        movements: [
          {
            id: `MOV-INW-${Date.now()}`,
            date: newBatchData.receivedDate,
            action: 'RECEIPT',
            quantityBags: newBatchData.initialBags,
            quantityQtl: totalReceivedQtl,
            referenceId: `INW-${Date.now().toString().slice(-4)}`,
            user: currentRole,
            notes: `Inward receipt from ${newBatchData.supplierSource}. Quality grade: ${newBatchData.qualityInspectionGrade}, Moisture: ${newBatchData.moisturePercentage}%.`,
          },
        ],
      };

      setBatches((prev) => [newBatch, ...prev]);

      const newAudit: AuditLog = {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentRole === 'Warehouse Manager' ? 'Anand Kumar' : 'Rajesh V.',
        role: currentRole,
        action: 'STOCK_RECEIPT',
        entity: 'BATCH',
        referenceId: batchId,
        result: 'SUCCESS',
        details: `Recorded inward receipt of ${newBatchData.initialBags} bags (${totalReceivedQtl} Qtl) ${newBatchData.commodity} (${newBatchData.variety}) into ${newBatchData.depotLocation}.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      addToast(
        'success',
        'Stock Receipt Logged',
        `New batch ${batchId} added with ${newBatchData.initialBags} bags (${totalReceivedQtl} Qtl).`
      );

      return { success: true, batchId };
    },
    [currentRole, addToast]
  );

  // Update Batch Status (e.g. Quarantining or marking Damaged)
  const updateBatchStatus = useCallback(
    (batchId: string, newStatus: BatchStatus, reason: string) => {
      if (currentRole === 'Depot Operator') {
        addToast('error', 'Role Restriction', 'Depot Operators cannot change quarantine/damaged status. Manager or Auditor authority required.');
        return { success: false, error: 'Depot Operators lack authorization to alter batch status.' };
      }

      let updatedBatch: Batch | null = null;

      setBatches((prev) =>
        prev.map((b) => {
          if (b.id !== batchId) return b;
          updatedBatch = {
            ...b,
            status: newStatus,
            statusReason: reason,
            movements: [
              {
                id: `MOV-ST-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                action: 'STATUS_CHANGE',
                quantityBags: b.availableBags,
                quantityQtl: b.availableQtl,
                referenceId: `STAT-CHG-${batchId}`,
                user: currentRole,
                notes: `Status changed from ${b.status} to ${newStatus}. Reason: ${reason}`,
              },
              ...b.movements,
            ],
          };
          return updatedBatch;
        })
      );

      const newAudit: AuditLog = {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentRole === 'Warehouse Manager' ? 'Anand Kumar' : 'Dr. Sunita Rao',
        role: currentRole,
        action: 'STATUS_CHANGE',
        entity: 'BATCH',
        referenceId: batchId,
        result: newStatus === 'Eligible' ? 'SUCCESS' : 'WARNING',
        details: `Status altered to [${newStatus}]. Rationale: ${reason}. FIFO engine updated accordingly.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      addToast(
        newStatus === 'Eligible' ? 'success' : 'warning',
        'Batch Status Updated',
        `Batch ${batchId} marked as ${newStatus}. FIFO allocation eligibility recalculated.`
      );

      return { success: true };
    },
    [currentRole, addToast]
  );

  // Edit batch location or notes
  const editBatchMetadata = useCallback(
    (
      batchId: string,
      updates: { depotLocation?: string; notes?: string; moisturePercentage?: number }
    ) => {
      if (currentRole === 'Vigilance Auditor') {
        addToast('error', 'Read-Only Mode', 'Auditors cannot alter batch locations or operational notes.');
        return { success: false, error: 'Read-only mode' };
      }

      setBatches((prev) =>
        prev.map((b) => {
          if (b.id !== batchId) return b;
          return {
            ...b,
            depotLocation: updates.depotLocation ?? b.depotLocation,
            notes: updates.notes ?? b.notes,
            moisturePercentage: updates.moisturePercentage ?? b.moisturePercentage,
          };
        })
      );

      const newAudit: AuditLog = {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentRole === 'Warehouse Manager' ? 'Anand Kumar' : 'Rajesh V.',
        role: currentRole,
        action: 'BATCH_UPDATE',
        entity: 'BATCH',
        referenceId: batchId,
        result: 'SUCCESS',
        details: `Updated metadata for batch ${batchId}. Location: ${updates.depotLocation || 'unchanged'}, Moisture: ${updates.moisturePercentage ?? 'unchanged'}%.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      addToast('info', 'Batch Updated', `Metadata saved for batch ${batchId}.`);
      return { success: true };
    },
    [currentRole, addToast]
  );

  // Workflow Handlers
  const addReconciliation = useCallback(
    (rec: Omit<ReconciliationRecord, 'id' | 'reconciledDate' | 'status'> & { varianceReason?: string }) => {
      const newRec: ReconciliationRecord = {
        id: `REC-${Date.now()}`,
        reconciledDate: new Date().toISOString().split('T')[0],
        status: rec.varianceBags === 0 ? 'Reconciled' : 'Pending Approval',
        ...rec,
      };

      setReconciliations((prev) => [newRec, ...prev]);

      const newAudit: AuditLog = {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentRole === 'Warehouse Manager' ? 'Anand Kumar' : currentRole === 'Depot Operator' ? 'Rajesh V.' : 'Dr. Sunita Rao',
        role: currentRole,
        action: 'RECONCILIATION',
        entity: 'BATCH',
        referenceId: rec.batchId,
        result: rec.varianceBags === 0 ? 'SUCCESS' : 'WARNING',
        details: `Physical count for ${rec.batchId} (${rec.commodity}): system ${rec.systemBags} vs physical ${rec.physicalCountedBags} bags (variance: ${rec.varianceBags} bags).`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      if (rec.varianceBags !== 0) {
        // Create an approval request for manager
        const newApr: ApprovalRequest = {
          id: `APR-${Date.now()}`,
          type: 'STOCK_ADJUSTMENT',
          title: `Stock Count Discrepancy (${rec.varianceBags} Bags ${rec.commodity})`,
          requestedBy: currentRole === 'Warehouse Manager' ? 'Anand Kumar' : currentRole === 'Depot Operator' ? 'Rajesh V.' : 'Dr. Sunita Rao',
          requestedRole: currentRole,
          requestedDate: new Date().toISOString(),
          status: 'Pending',
          details: `Reconciliation ${newRec.id} reported physical variance of ${rec.varianceBags} bags for batch ${rec.batchId}. ${rec.varianceReason || ''}`,
          impact: `${rec.varianceBags} bags (${rec.varianceQtl} Qtl) ledger adjustment required.`,
          referenceId: newRec.id,
        };
        setApprovalRequests((prev) => [newApr, ...prev]);
      }

      addToast(
        rec.varianceBags === 0 ? 'success' : 'warning',
        rec.varianceBags === 0 ? 'Physical Count Tallied' : 'Discrepancy Logged',
        rec.varianceBags === 0
          ? `Batch ${rec.batchId} 100% matched system records.`
          : `Variance of ${rec.varianceBags} bags submitted for Manager authorization.`
      );
    },
    [currentRole, addToast]
  );

  const reviewReconciliation = useCallback(
    (id: string, action: 'Approve' | 'Reject', notes: string) => {
      setReconciliations((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            return {
              ...r,
              status: action === 'Approve' ? 'Adjusted' : 'Discrepancy',
              varianceReason: notes || r.varianceReason,
            };
          }
          return r;
        })
      );

      // If approved, adjust the batch bag count
      const target = reconciliations.find((r) => r.id === id);
      if (action === 'Approve' && target && target.varianceBags !== 0) {
        setBatches((prev) =>
          prev.map((b) => {
            if (b.id === target.batchId) {
              const adjustedBags = Math.max(0, b.availableBags + target.varianceBags);
              const adjustedQtl = Number(((adjustedBags * b.bagWeightKg) / 100).toFixed(2));
              return {
                ...b,
                availableBags: adjustedBags,
                availableQtl: adjustedQtl,
                movements: [
                  {
                    id: `MOV-ADJ-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    action: 'ADJUSTMENT',
                    quantityBags: Math.abs(target.varianceBags),
                    quantityQtl: Math.abs(target.varianceQtl),
                    referenceId: target.id,
                    user: currentRole,
                    notes: `Physical reconciliation adjustment approved. ${notes}`,
                  },
                  ...b.movements,
                ],
              };
            }
            return b;
          })
        );
      }

      const newAudit: AuditLog = {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentRole,
        role: currentRole,
        action: 'APPROVAL',
        entity: 'RECONCILIATION',
        referenceId: id,
        result: action === 'Approve' ? 'SUCCESS' : 'REJECTED',
        details: `Reconciliation ${id} ${action === 'Approve' ? 'Approved & stock adjusted' : 'Rejected'}. Notes: ${notes}`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      addToast('info', `Reconciliation ${action}d`, `Record ${id} marked as ${action === 'Approve' ? 'Adjusted' : 'Discrepancy'}.`);
    },
    [reconciliations, currentRole, addToast]
  );

  const requestFifoException = useCallback(
    (params: {
      requestedCommodity: CommodityType;
      requestedVariety: string;
      requestedBags: number;
      skippedBatchId: string;
      allocatedBatchId: string;
      justificationReason: string;
    }) => {
      const skippedBatch = batches.find((b) => b.id === params.skippedBatchId);
      const allocatedBatch = batches.find((b) => b.id === params.allocatedBatchId);

      const newException: FifoException = {
        id: `EXC-${Date.now()}`,
        timestamp: new Date().toISOString(),
        requestedCommodity: params.requestedCommodity,
        requestedVariety: params.requestedVariety,
        requestedBags: params.requestedBags,
        skippedBatchId: params.skippedBatchId,
        skippedBatchAgeDays: skippedBatch?.stockAgeDays ?? 0,
        allocatedBatchId: params.allocatedBatchId,
        allocatedBatchAgeDays: allocatedBatch?.stockAgeDays ?? 0,
        justificationReason: params.justificationReason,
        requestedBy: currentRole === 'Warehouse Manager' ? 'Anand Kumar' : currentRole === 'Depot Operator' ? 'Rajesh V.' : 'Dr. Sunita Rao',
        status: 'Pending Approval',
      };

      setFifoExceptions((prev) => [newException, ...prev]);

      // Create an approval request
      const newApr: ApprovalRequest = {
        id: `APR-${Date.now()}`,
        type: 'FIFO_EXCEPTION',
        title: `FIFO Override: Bypass ${params.skippedBatchId} for ${params.allocatedBatchId}`,
        requestedBy: newException.requestedBy,
        requestedRole: currentRole,
        requestedDate: new Date().toISOString(),
        status: 'Pending',
        details: params.justificationReason,
        impact: `Bypasses older batch (${skippedBatch?.stockAgeDays}d) for newer batch (${allocatedBatch?.stockAgeDays}d) for ${params.requestedBags} bags.`,
        referenceId: newException.id,
      };
      setApprovalRequests((prev) => [newApr, ...prev]);

      const newAudit: AuditLog = {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: newException.requestedBy,
        role: currentRole,
        action: 'FIFO_EXCEPTION',
        entity: 'DISPATCH',
        referenceId: newException.id,
        result: 'WARNING',
        details: `FIFO Exception logged: ${params.justificationReason}. Bypassing batch ${params.skippedBatchId}.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      addToast('warning', 'FIFO Exception Logged', `Exception ${newException.id} submitted for Manager digital sign-off.`);
      return { success: true, exceptionId: newException.id };
    },
    [batches, currentRole, addToast]
  );

  const reviewFifoException = useCallback(
    (id: string, decision: 'Approved' | 'Rejected', remarks: string) => {
      setFifoExceptions((prev) =>
        prev.map((e) => {
          if (e.id === id) {
            return {
              ...e,
              status: decision,
              approvedBy: `${currentRole === 'Warehouse Manager' ? 'Anand Kumar' : currentRole} (${currentRole})`,
              approvalRemarks: remarks,
            };
          }
          return e;
        })
      );

      setApprovalRequests((prev) =>
        prev.map((a) => {
          if (a.referenceId === id) {
            return {
              ...a,
              status: decision,
              reviewedBy: currentRole,
              reviewedDate: new Date().toISOString(),
              remarks,
            };
          }
          return a;
        })
      );

      const newAudit: AuditLog = {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentRole,
        role: currentRole,
        action: 'APPROVAL',
        entity: 'FIFO_EXCEPTION',
        referenceId: id,
        result: decision === 'Approved' ? 'SUCCESS' : 'REJECTED',
        details: `FIFO Exception ${id} ${decision.toLowerCase()} by ${currentRole}. Remarks: ${remarks}`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      addToast(decision === 'Approved' ? 'success' : 'error', `Exception ${decision}`, `FIFO override ${id} has been ${decision.toLowerCase()}.`);
    },
    [currentRole, addToast]
  );

  const reviewApprovalRequest = useCallback(
    (id: string, decision: 'Approved' | 'Rejected', remarks: string) => {
      const target = approvalRequests.find((a) => a.id === id);
      if (target?.type === 'FIFO_EXCEPTION') {
        reviewFifoException(target.referenceId, decision, remarks);
        return;
      }
      if (target?.type === 'STOCK_ADJUSTMENT') {
        reviewReconciliation(target.referenceId, decision === 'Approved' ? 'Approve' : 'Reject', remarks);
        return;
      }

      setApprovalRequests((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            return {
              ...a,
              status: decision,
              reviewedBy: currentRole,
              reviewedDate: new Date().toISOString(),
              remarks,
            };
          }
          return a;
        })
      );

      addToast('info', `Request ${decision}`, `Approval request ${id} updated.`);
    },
    [approvalRequests, currentRole, reviewFifoException, reviewReconciliation, addToast]
  );

  const updateDeliveryMilestone = useCallback(
    (id: string, milestone: DeliveryTrackingRecord['currentMilestone'], note: string) => {
      setDeliveryTracking((prev) =>
        prev.map((trk) => {
          if (trk.id === id) {
            const isDelivered = milestone === 'Delivered Verified' || milestone === 'Inspected & Unloaded';
            return {
              ...trk,
              currentMilestone: milestone,
              status: isDelivered ? 'Delivered' : trk.status,
              otpVerified: isDelivered ? true : trk.otpVerified,
              transitUpdates: [
                {
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  location: trk.destinationFps,
                  statusNote: note || `Milestone updated to ${milestone}`,
                },
                ...trk.transitUpdates,
              ],
            };
          }
          return trk;
        })
      );

      addToast('success', 'Transit Updated', `Delivery ${id} milestone set to "${milestone}".`);
    },
    [addToast]
  );

  const addReturnDiscrepancy = useCallback(
    (item: Omit<ReturnDiscrepancyRecord, 'id' | 'reportDate' | 'status'> & { status?: ReturnDiscrepancyRecord['status'] }) => {
      const newRet: ReturnDiscrepancyRecord = {
        id: `RET-${Date.now()}`,
        reportDate: new Date().toISOString().split('T')[0],
        status: item.status || 'Logged',
        ...item,
      };

      setReturnDiscrepancies((prev) => [newRet, ...prev]);

      const newAudit: AuditLog = {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentRole,
        role: currentRole,
        action: 'RETURN_LOGGED',
        entity: 'DISPATCH',
        referenceId: item.challanNumber,
        result: 'WARNING',
        details: `Return/Discrepancy logged for ${item.challanNumber}: ${item.damagedBags} damaged bags, ${item.shortageWeightKg} kg shortage (${item.discrepancyType}).`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      addToast('warning', 'Discrepancy Recorded', `Filed return record ${newRet.id} for Challan ${item.challanNumber}.`);
    },
    [currentRole, addToast]
  );

  const resolveAnomaly = useCallback(
    (id: string, note: string) => {
      setAnomalies((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            return {
              ...a,
              status: 'Resolved',
              actionRecommended: `Resolved: ${note}`,
            };
          }
          return a;
        })
      );
      addToast('success', 'Anomaly Resolved', `Alert ${id} cleared from active watchlist.`);
    },
    [addToast]
  );

  const updateDepotSettings = useCallback(
    (newSettings: Partial<DepotSettings>) => {
      setDepotSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        try {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}depot_settings`, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      addToast('success', 'Depot Settings Saved', 'Operational thresholds and parameters updated.');
    },
    [addToast]
  );

  const toggleApprovalRule = useCallback(
    (id: string) => {
      setApprovalRules((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            return { ...r, isActive: !r.isActive };
          }
          return r;
        })
      );
      addToast('info', 'Rule Toggled', `Rule ${id} status updated.`);
    },
    [addToast]
  );

  // Reset to Demo Data
  const resetDemoData = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}batches`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}dispatches`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}audit_logs`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}reconciliations`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}fifo_exceptions`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}approval_requests`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}delivery_tracking`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}return_discrepancies`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}anomalies`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}depot_settings`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}approval_rules`);

    setBatches(INITIAL_BATCHES);
    setDispatches(INITIAL_DISPATCHES);
    setReconciliations(INITIAL_RECONCILIATIONS);
    setFifoExceptions(INITIAL_FIFO_EXCEPTIONS);
    setApprovalRequests(INITIAL_APPROVAL_REQUESTS);
    setDeliveryTracking(INITIAL_DELIVERY_TRACKING);
    setReturnDiscrepancies(INITIAL_RETURN_DISCREPANCIES);
    setAnomalies(INITIAL_ANOMALIES);
    setDepotSettings(DEFAULT_DEPOT_SETTINGS);
    setApprovalRules(INITIAL_APPROVAL_RULES);

    const resetAudit: AuditLog = {
      id: `AUD-RESET-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'System Admin',
      role: 'Warehouse Manager',
      action: 'DEMO_RESET',
      entity: 'SYSTEM',
      referenceId: 'DEMO-DATA-RESET',
      result: 'SUCCESS',
      details: 'All batch registers, dispatch challans, and stock tallies restored to pristine hackathon demo dataset.',
    };
    setAuditLogs([resetAudit, ...INITIAL_AUDIT_LOGS]);
    setActiveChallan(null);

    addToast('info', 'Demo Data Restored', 'All sample batches, transactions, and FIFO registers reset to default state.');
  }, [addToast]);

  return (
    <AppContext.Provider
      value={{
        batches,
        dispatches,
        auditLogs,
        fairPriceShops,
        currentRole,
        toasts,
        activeChallan,
        theme,
        reconciliations,
        fifoExceptions,
        approvalRequests,
        deliveryTracking,
        returnDiscrepancies,
        anomalies,
        depotSettings,
        approvalRules,
        toggleTheme,
        setTheme,
        setCurrentRole,
        addToast,
        removeToast,
        setActiveChallan,
        calculateFifoPreview,
        executeDispatch,
        addStockReceipt,
        updateBatchStatus,
        editBatchMetadata,
        addReconciliation,
        reviewReconciliation,
        requestFifoException,
        reviewFifoException,
        reviewApprovalRequest,
        updateDeliveryMilestone,
        addReturnDiscrepancy,
        resolveAnomaly,
        updateDepotSettings,
        toggleApprovalRule,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
