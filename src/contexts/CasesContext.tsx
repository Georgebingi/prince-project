import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { casesApi, motionsApi, ordersApi, ApiError } from '../services/api';

export interface CaseDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
  category?: 'judgment' | 'affidavit' | 'evidence' | 'admin';
}
export interface CaseNote {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}
export interface Case {
  id: string;
  title: string;
  type: 'Criminal' | 'Civil' | 'Family' | 'Commercial' | 'Appeal';
  status: string;
  priority: 'High' | 'Medium' | 'Low';
  nextHearing: string;
  daysLeft: number;
  color: string;
  pages: number;
  judge?: string;
  filed: string;
  updated: string;
  documents: CaseDocument[];
  notes?: CaseNote[];
  judgment?: string;
  court?: string;
  assignedToJudge?: boolean;
  lawyer?: string;
  createdBy?: string;
  partyCategory?: 'govt-vs-govt' | 'govt-vs-public' | 'public-vs-govt' | 'public-vs-public';
  plaintiffInfo?: {
    name: string;
    phone: string;
    address: string;
  };
  defendantInfo?: {
    name: string;
    phone: string;
    address: string;
  };
}

export interface Motion {
  id: number;
  caseId: string;
  title: string;
  filedBy: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  documentUrl?: string;
  documentId?: number;
}
export interface Order {
  id: number;
  caseId: string;
  title: string;
  draftedBy: string;
  date: string;
  status: 'Draft' | 'Signed';
  content?: string;
}
interface CasesContextType {
  cases: Case[];
  motions: Motion[];
  orders: Order[];
  isLoading: boolean;
  motionsLoading: boolean;
  ordersLoading: boolean;
  error: string | null;
  lastSync: number;
  refresh: () => Promise<void>;
  fetchMotions: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  addCase: (newCase: Omit<Case, 'id' | 'filed' | 'updated'>, parties?: Array<{role: string, name: string, contactInfo?: {phone?: string, address?: string}}>, partyCategory?: string) => Promise<Case>;


  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => Promise<void>;

  getCaseById: (id: string) => Case | undefined;
  addDocumentToCase: (caseId: string, document: CaseDocument) => void;
  removeDocumentFromCase: (caseId: string, docId: string) => void;
  addNoteToCase: (caseId: string, note: string) => void;

  updateCaseStatus: (caseId: string, status: string) => void;
  scheduleHearing: (caseId: string, date: string) => void;
  submitJudgment: (caseId: string, judgmentText: string) => void;
  updateMotionStatus: (id: number, status: 'Approved' | 'Rejected', notes?: string) => Promise<void>;
  signOrder: (id: number) => Promise<void>;
  assignCaseToCourt: (caseId: string, court: string, judge: string) => Promise<void>;
  approveCaseRegistration: (caseId: string) => Promise<void>;
  assignCaseToLawyer: (caseId: string, lawyer: string) => Promise<void>;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);
const INITIAL_CASES: Case[] = [{
  id: 'KDH/2024/001',
  title: 'State vs. Abdullahi Musa',
  type: 'Criminal',
  status: 'In Progress',
  priority: 'High',
  nextHearing: '15 Jan 2024',
  daysLeft: 3,
  color: 'bg-red-600',
  pages: 142,
  judge: 'Hon. Justice Ibrahim',
  lawyer: 'Barrister Musa',
  court: 'High Court 1',
  filed: '2023-12-10',
  updated: '2 days ago',
  documents: [{
    id: 'doc1',
    name: 'Charge_Sheet.pdf',
    type: 'PDF',
    size: '1.2 MB',
    uploadedAt: '2023-12-10',
    uploadedBy: 'Registrar'
  }],
  notes: []
}, {
  id: 'KDH/2024/015',
  title: 'Land Dispute: Zaria GRA',
  type: 'Civil',
  status: 'Review',
  priority: 'Medium',
  nextHearing: '18 Jan 2024',
  daysLeft: 6,
  color: 'bg-blue-600',
  pages: 89,
  judge: 'Hon. Justice Ibrahim',
  court: 'High Court 1',
  filed: '2024-01-05',
  updated: '5 hours ago',
  documents: [],
  notes: []
}, {
  id: 'KDH/2024/022',
  title: 'Contract Breach: ABC Ltd',
  type: 'Commercial',
  status: 'Pending Judgment',
  priority: 'High',
  nextHearing: '20 Jan 2024',
  daysLeft: 8,
  color: 'bg-purple-600',
  pages: 215,
  judge: 'Hon. Justice Sani',
  lawyer: 'Barrister Musa',
  court: 'High Court 2',
  filed: '2023-11-20',
  updated: '1 week ago',
  documents: [],
  notes: []
}, {
  id: 'KDH/2024/038',
  title: 'Family Estate Settlement',
  type: 'Family',
  status: 'Evidence Review',
  priority: 'Low',
  nextHearing: '25 Jan 2024',
  daysLeft: 13,
  color: 'bg-emerald-600',
  pages: 67,
  judge: 'Hon. Justice Maryam',
  court: 'High Court 3',
  filed: '2024-01-02',
  updated: 'Yesterday',
  documents: [],
  notes: []
}, {
  id: 'KDH/2024/042',
  title: 'Tenancy Appeal No. 4',
  type: 'Appeal',
  status: 'Scheduled',
  priority: 'Medium',
  nextHearing: '28 Jan 2024',
  daysLeft: 16,
  color: 'bg-amber-600',
  pages: 103,
  judge: 'Hon. Justice Ibrahim',
  court: 'High Court 1',
  filed: '2024-01-08',
  updated: '3 days ago',
  documents: [],
  notes: []
}, {
  id: 'KDH/2024/051',
  title: 'Divorce Petition',
  type: 'Family',
  status: 'Mediation',
  priority: 'Low',
  nextHearing: '02 Feb 2024',
  daysLeft: 21,
  color: 'bg-teal-600',
  pages: 45,
  judge: 'Hon. Justice Ibrahim',
  lawyer: 'Barrister Musa',
  court: 'High Court 1',
  filed: '2024-01-10',
  updated: '4 days ago',
  documents: [],
  notes: []
},
// Pending Registration Cases
{
  id: 'KDH/2024/099',
  title: 'New Commercial Dispute',
  type: 'Commercial',
  status: 'Pending Approval',
  priority: 'High',
  nextHearing: 'TBD',
  daysLeft: 30,
  color: 'bg-slate-500',
  pages: 12,
  filed: '2024-01-20',
  updated: 'Just now',
  documents: [],
  notes: []
}];
// Motions and Orders are now fetched from backend - no hardcoded data

// Helper function to calculate days left until hearing
const calculateDaysLeft = (hearingDate: string): number => {
  if (hearingDate === 'TBD') return 30;
  const today = new Date();
  const hearing = new Date(hearingDate);
  const diffTime = hearing.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};
// Helper function to generate default hearing date (14 days from now)
const getDefaultHearingDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const TYPE_COLORS: Record<string, string> = {
  Criminal: 'bg-red-600',
  Civil: 'bg-blue-600',
  Family: 'bg-emerald-600',
  Commercial: 'bg-purple-600',
  Appeal: 'bg-amber-600'
};

function formatDate(d: string | null | undefined): string {
  if (!d) return 'TBD';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Map backend case row (list or detail) to frontend Case shape */
function mapBackendCaseToFrontend(row: {
  id?: number;
  case_number?: string;
  title?: string;
  type?: string;
  status?: string;
  priority?: string;
  next_hearing?: string | null;
  filed_date?: string;
  judge_name?: string | null;
  lawyer_name?: string | null;
  court?: string | null;
  created_at?: string;
  updated_at?: string;
  documents?: Array<{ id: number; name: string; type: string; file_size?: number; uploaded_at?: string; uploaded_by_name?: string }>;
}): Case {
  const id = row.case_number ?? String(row.id ?? '');
  const nextHearing = formatDate(row.next_hearing);
  return {
    id,
    title: row.title ?? '',
    type: (row.type as Case['type']) ?? 'Civil',
    status: row.status ?? 'Pending',
    priority: (row.priority as Case['priority']) ?? 'Medium',
    nextHearing: nextHearing === 'TBD' ? 'TBD' : nextHearing,
    daysLeft: calculateDaysLeft(nextHearing),
    color: TYPE_COLORS[row.type ?? ''] ?? 'bg-slate-600',
    pages: row.documents?.length ?? 0,
    judge: row.judge_name ?? undefined,
    lawyer: row.lawyer_name ?? undefined,
    court: row.court ?? undefined,
    filed: formatDate(row.filed_date) ?? '',
    updated: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '',
    documents: (row.documents ?? []).map((d) => ({
      id: String(d.id),
      name: d.name,
      type: d.type,
      size: d.file_size ? `${(d.file_size / 1024).toFixed(1)} KB` : '0 KB',
      uploadedAt: d.uploaded_at ? formatDate(d.uploaded_at) : '',
      uploadedBy: d.uploaded_by_name ?? 'Unknown'
    })),
    notes: []
  };
}

export function CasesProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('court_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });
  const [motions, setMotions] = useState<Motion[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [motionsLoading, setMotionsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number>(Date.now());


  const refresh = useCallback(async () => {
    if (!user) {
      setCases([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await casesApi.getCases({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        const mapped = (res.data as unknown[]).map((row: unknown) =>
          mapBackendCaseToFrontend(row as Parameters<typeof mapBackendCaseToFrontend>[0])
        );
        // Merge with local cases to keep locally created cases that may not be in backend yet
        const localCases = JSON.parse(localStorage.getItem('court_cases') || '[]');
        const merged = [...mapped];
        for (const localCase of localCases) {
          if (!mapped.some(m => m.id === localCase.id)) {
            merged.push(localCase);
          }
        }
        setCases(merged);
        localStorage.setItem('court_cases', JSON.stringify(merged));
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load cases';
      setError(message);
      // Keep existing cases from localStorage on error
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch motions from backend
  const fetchMotions = useCallback(async () => {
    if (!user) {
      setMotions([]);
      return;
    }
    setMotionsLoading(true);
    try {
      const res = await motionsApi.getMotions({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        setMotions(res.data as Motion[]);
      }
    } catch (err) {
      console.error('Failed to fetch motions:', err);
      // Don't set error state to avoid blocking UI, just log it
    } finally {
      setMotionsLoading(false);
    }
  }, [user]);

  // Fetch orders from backend
  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    try {
      const res = await ordersApi.getOrders({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data as Order[]);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      // Don't set error state to avoid blocking UI, just log it
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);


  useEffect(() => {
    refresh();
    fetchMotions();
    fetchOrders();
  }, [refresh, fetchMotions, fetchOrders]);


  // Auto-sync cases, motions, and orders every 30 seconds
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (user) {
        try {
          await Promise.all([
            refresh(),
            fetchMotions(),
            fetchOrders()
          ]);
          setLastSync(Date.now());
        } catch (err) {
          console.warn('Auto-sync failed:', err);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(syncInterval);
  }, [user, refresh, fetchMotions, fetchOrders]);


  useEffect(() => {
    localStorage.setItem('court_cases', JSON.stringify(cases));
  }, [cases]);
  // Motions and orders are now stored in backend only


  const addCase = async (newCase: Omit<Case, 'id' | 'filed' | 'updated'>, parties?: Array<{role: string, name: string, contactInfo?: {phone?: string, address?: string}}>, partyCategory?: string) => {
    const hearingDate =
      newCase.nextHearing === 'TBD' || !newCase.nextHearing
        ? getDefaultHearingDate()
        : newCase.nextHearing;
    const nextHearingISO =
      hearingDate === 'TBD' || !hearingDate
        ? undefined
        : new Date(hearingDate).toISOString().split('T')[0];

    // Generate a temporary ID for optimistic update
    const tempId = `TEMP-${Date.now()}`;
    
    // Create optimistic case for immediate UI update
    const optimisticCase: Case = {
      ...newCase,
      id: tempId,
      filed: new Date().toISOString().split('T')[0],
      updated: 'Just now',
      documents: [],
      notes: [],
      daysLeft: calculateDaysLeft(hearingDate),
      pages: 0,
      partyCategory: partyCategory as Case['partyCategory']
    };

    // Optimistic update: Add to local state immediately
    setCases(prev => [optimisticCase, ...prev]);

    let createdCase: Case;
    
    try {
      const response = await casesApi.createCase({
        title: newCase.title,
        type: newCase.type,
        description: '',
        priority: newCase.priority,
        nextHearing: nextHearingISO,
        partyCategory: partyCategory,
        parties: parties || []
      });

      
      if (response.success && response.data) {
        // Use the backend-generated case data
        const backendCase = response.data as { id: number; caseNumber: string };
        
        // Create case object with backend ID
        createdCase = {
          ...newCase,
          id: backendCase.caseNumber || String(backendCase.id),
          filed: new Date().toISOString().split('T')[0],
          updated: 'Just now',
          documents: [],
          notes: [],
          daysLeft: calculateDaysLeft(hearingDate),
          pages: 0,
          partyCategory: partyCategory as Case['partyCategory']
        };

        // Replace optimistic case with real case
        setCases(prev => prev.map(c => c.id === tempId ? createdCase : c));
      } else {
        throw new Error(response.error?.message || 'Failed to create case in backend');
      }
    } catch (err) {
      // Remove optimistic case on failure
      setCases(prev => prev.filter(c => c.id !== tempId));
      console.error('Backend create failed:', err);
      throw err instanceof Error ? err : new Error('Failed to create case in backend');
    }

    return createdCase;
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases(cases.map(c => c.id === id ? {
      ...c,
      ...updates,
      updated: 'Just now',
      // Recalculate daysLeft if nextHearing is updated
      daysLeft: updates.nextHearing ? calculateDaysLeft(updates.nextHearing) : c.daysLeft
    } : c));
  };
  const deleteCase = async (id: string) => {
    // Store original case for potential rollback
    const originalCase = cases.find(c => c.id === id);
    
    // Optimistic update: Remove from local state immediately
    setCases(prev => prev.filter(c => c.id !== id));
    
    try {
      await casesApi.deleteCase(id);
      // Successfully deleted - no need to refresh
    } catch (err) {
      // Restore original case on failure
      if (originalCase) {
        setCases(prev => [...prev, originalCase]);
      }
      const message = err instanceof ApiError ? err.message : 'Failed to delete case';
      throw new Error(message);
    }
  };


  const getCaseById = (id: string) => {
    return cases.find(c => c.id === id);
  };
  const addDocumentToCase = (caseId: string, document: CaseDocument) => {
    setCases(cases.map(c => c.id === caseId ? {
      ...c,
      documents: [...c.documents, document],
      pages: c.pages + 1,
      updated: 'Just now'
    } : c));
  };
  const removeDocumentFromCase = (caseId: string, docId: string) => {
    setCases(cases.map(c => c.id === caseId ? {
      ...c,
      documents: c.documents.filter(d => d.id !== docId),
      pages: Math.max(0, c.pages - 1),
      updated: 'Just now'
    } : c));
  };
  const addNoteToCase = (caseId: string, text: string) => {

    const newNote: CaseNote = {
      id: `note-${Date.now()}`,
      text,
      createdAt: new Date().toISOString().split('T')[0],
      author: user?.name || 'You'
    };
    setCases(cases.map(c => c.id === caseId ? {
      ...c,
      notes: [...(c.notes || []), newNote],
      updated: 'Just now'
    } : c));
  };
  const updateCaseStatus = (caseId: string, status: string) => {
    setCases(cases.map(c => c.id === caseId ? {
      ...c,
      status,
      updated: 'Just now'
    } : c));
  };
  const scheduleHearing = async (caseId: string, date: string) => {
    // Optimistic update: Update local state immediately for instant UI feedback
    const originalCase = cases.find(c => c.id === caseId);
    if (originalCase) {
      setCases(prev => prev.map(c => c.id === caseId ? {
        ...c,
        nextHearing: date,
        daysLeft: calculateDaysLeft(date),
        updated: 'Just now'
      } : c));
    }

    try {
      // Convert display date to ISO format for API
      const hearingDateISO = new Date(date).toISOString().split('T')[0];
      await casesApi.scheduleHearing(caseId, hearingDateISO);
      // Refresh cases from server to ensure consistency
      await refresh();
      setLastSync(Date.now());
    } catch (err) {
      // Revert optimistic update on failure
      if (originalCase) {
        setCases(prev => prev.map(c => c.id === caseId ? originalCase : c));
      }
      const message = err instanceof ApiError ? err.message : 'Failed to schedule hearing';
      throw new Error(message);
    }
  };

  const submitJudgment = (caseId: string, judgmentText: string) => {
    setCases(cases.map(c => c.id === caseId ? {
      ...c,
      judgment: judgmentText,
      status: 'Closed',
      updated: 'Just now'
    } : c));
  };
  const updateMotionStatus = async (id: number, status: 'Approved' | 'Rejected', notes?: string) => {
    // Optimistic update
    const originalMotions = [...motions];
    setMotions(motions.map(m => m.id === id ? { ...m, status } : m));
    
    try {
      await motionsApi.updateMotionStatus(id, status, notes);
      // Refresh to get updated data
      await fetchMotions();
    } catch (err) {
      // Revert on failure
      setMotions(originalMotions);
      const message = err instanceof ApiError ? err.message : 'Failed to update motion status';
      throw new Error(message);
    }
  };
  
  const signOrder = async (id: number) => {
    // Optimistic update
    const originalOrders = [...orders];
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'Signed' } : o));
    
    try {
      await ordersApi.signOrder(id);
      // Refresh to get updated data
      await fetchOrders();
    } catch (err) {
      // Revert on failure
      setOrders(originalOrders);
      const message = err instanceof ApiError ? err.message : 'Failed to sign order';
      throw new Error(message);
    }
  };

  const assignCaseToCourt = async (caseId: string, court: string, judge: string) => {
    // Optimistic update: Update local state immediately for instant UI feedback
    const originalCase = cases.find(c => c.id === caseId);
    if (originalCase) {
      setCases(prev => prev.map(c => c.id === caseId ? {
        ...c,
        court,
        judge,
        status: 'Assigned',
        updated: 'Just now'
      } : c));
    }

    try {
      await casesApi.assignCaseToCourt(caseId, court, judge);
      // Refresh cases from server to ensure consistency
      await refresh();
      setLastSync(Date.now());
    } catch (err) {
      // Revert optimistic update on failure
      if (originalCase) {
        setCases(prev => prev.map(c => c.id === caseId ? originalCase : c));
      }
      const message = err instanceof ApiError ? err.message : 'Failed to assign case to court';
      throw new Error(message);
    }
  };

  const approveCaseRegistration = async (caseId: string) => {
    // Optimistic update: Update local state immediately for instant UI feedback
    const originalCase = cases.find(c => c.id === caseId);
    if (originalCase) {
      setCases(prev => prev.map(c => c.id === caseId ? {
        ...c,
        status: 'Filed',
        updated: 'Just now'
      } : c));
    }

    try {
      await casesApi.approveCaseRegistration(caseId);
      // Refresh cases from server to ensure consistency
      await refresh();
      setLastSync(Date.now());
    } catch (err) {
      // Revert optimistic update on failure
      if (originalCase) {
        setCases(prev => prev.map(c => c.id === caseId ? originalCase : c));
      }
      const message = err instanceof ApiError ? err.message : 'Failed to approve case registration';
      throw new Error(message);
    }
  };

  const assignCaseToLawyer = async (caseId: string, lawyer: string) => {
    // Optimistic update: Update local state immediately for instant UI feedback
    const originalCase = cases.find(c => c.id === caseId);
    if (originalCase) {
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, lawyer, updated: 'Just now' } : c));
    }

    try {
      await casesApi.assignLawyerToCase(caseId, lawyer);
      // Refresh cases from server to ensure consistency
      await refresh();
      setLastSync(Date.now());
    } catch (err) {
      // Revert optimistic update on failure
      if (originalCase) {
        setCases(prev => prev.map(c => c.id === caseId ? originalCase : c));
      }
      const message = err instanceof ApiError ? err.message : 'Failed to assign lawyer';
      throw new Error(message);
    }
  };
  return (
    <CasesContext.Provider
      value={{
        cases,
        motions,
        orders,
        isLoading,
        motionsLoading,
        ordersLoading,
        error,
        lastSync,
        refresh,
        fetchMotions,
        fetchOrders,
        addCase,
        updateCase,
        deleteCase,
        getCaseById,
        addDocumentToCase,
        removeDocumentFromCase,
        addNoteToCase,

        updateCaseStatus,
        scheduleHearing,
        submitJudgment,
        updateMotionStatus,
        signOrder,
        assignCaseToCourt,
        approveCaseRegistration,
        assignCaseToLawyer
      }}
    >
      {children}
    </CasesContext.Provider>
  );

}
// eslint-disable-next-line react-refresh/only-export-components
export function useCases() {

  const context = useContext(CasesContext);
  if (!context) {
    throw new Error('useCases must be used within CasesProvider');
  }
  return context;
}
