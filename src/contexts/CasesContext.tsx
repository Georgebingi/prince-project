import React, { useEffect, useState, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
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
}
export interface Motion {
  id: number;
  caseId: string;
  title: string;
  filedBy: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  documentUrl?: string;
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
  addCase: (newCase: Omit<Case, 'id' | 'filed' | 'updated'>) => void;
  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  getCaseById: (id: string) => Case | undefined;
  addDocumentToCase: (caseId: string, document: CaseDocument) => void;
  addNoteToCase: (caseId: string, note: string) => void;
  updateCaseStatus: (caseId: string, status: string) => void;
  scheduleHearing: (caseId: string, date: string) => void;
  submitJudgment: (caseId: string, judgmentText: string) => void;
  updateMotionStatus: (id: number, status: 'Approved' | 'Rejected') => void;
  signOrder: (id: number) => void;
  assignCaseToCourt: (caseId: string, court: string, judge: string) => void;
  approveCaseRegistration: (caseId: string) => void;
  assignCaseToLawyer: (caseId: string, lawyer: string) => void;
}
const CasesContext = createContext<CasesContextType | undefined>(undefined);
const INITIAL_CASES: Case[] = [
{
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
  court: 'High Court 1',
  filed: '2023-12-10',
  updated: '2 days ago',
  documents: [
  {
    id: 'doc1',
    name: 'Charge_Sheet.pdf',
    type: 'PDF',
    size: '1.2 MB',
    uploadedAt: '2023-12-10',
    uploadedBy: 'Registrar'
  }],

  notes: []
},
{
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
},
{
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
  court: 'High Court 2',
  filed: '2023-11-20',
  updated: '1 week ago',
  documents: [],
  notes: []
},
{
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
},
{
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
},
{
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

const INITIAL_MOTIONS: Motion[] = [
{
  id: 1,
  caseId: 'KDH/2024/001',
  title: 'Motion for Bail',
  filedBy: 'Barr. Sani Ahmed',
  date: '2024-01-15',
  status: 'Pending',
  documentUrl: 'bail_motion.pdf'
},
{
  id: 2,
  caseId: 'KDH/2024/022',
  title: 'Motion for Adjournment',
  filedBy: 'Barr. John Doe',
  date: '2024-01-16',
  status: 'Pending',
  documentUrl: 'adjournment_request.pdf'
},
{
  id: 3,
  caseId: 'KDH/2024/015',
  title: 'Motion to Amend Charges',
  filedBy: 'State Prosecutor',
  date: '2024-01-14',
  status: 'Pending',
  documentUrl: 'amendment_motion.pdf'
}];

const INITIAL_ORDERS: Order[] = [
{
  id: 1,
  caseId: 'KDH/2024/001',
  title: 'Order of Remand',
  draftedBy: 'Registrar Chioma',
  date: '2024-01-15',
  status: 'Draft',
  content:
  'The defendant is hereby remanded in custody pending the determination of the bail application...'
},
{
  id: 2,
  caseId: 'KDH/2024/042',
  title: 'Hearing Notice',
  draftedBy: 'Clerk Amina',
  date: '2024-01-16',
  status: 'Draft',
  content:
  'NOTICE IS HEREBY GIVEN that the above matter is listed for hearing on...'
}];

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
export function CasesProvider({ children }: {children: React.ReactNode;}) {
  const { user } = useAuth();
  // Initialize state from localStorage or defaults
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('court_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });
  const [motions, setMotions] = useState<Motion[]>(() => {
    const saved = localStorage.getItem('court_motions');
    return saved ? JSON.parse(saved) : INITIAL_MOTIONS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('court_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });
  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('court_cases', JSON.stringify(cases));
  }, [cases]);
  useEffect(() => {
    localStorage.setItem('court_motions', JSON.stringify(motions));
  }, [motions]);
  useEffect(() => {
    localStorage.setItem('court_orders', JSON.stringify(orders));
  }, [orders]);
  const addCase = (newCase: Omit<Case, 'id' | 'filed' | 'updated'>) => {
    const caseNumber = `KDH/2024/${String(cases.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];
    // Automatically assign judge if created by a judge
    const judgeAssignment = user?.role === 'judge' ? user.name : newCase.judge;
    const courtAssignment =
    user?.role === 'judge' ? user.department : newCase.court;
    // Set default hearing date if not provided or if TBD
    const hearingDate =
    newCase.nextHearing === 'TBD' || !newCase.nextHearing ?
    getDefaultHearingDate() :
    newCase.nextHearing;
    const caseToAdd: Case = {
      ...newCase,
      id: caseNumber,
      filed: now,
      updated: 'Just now',
      documents: newCase.documents || [],
      notes: [],
      judge: judgeAssignment,
      court: courtAssignment,
      createdBy: user?.name || 'Unknown',
      nextHearing: hearingDate,
      daysLeft: calculateDaysLeft(hearingDate),
      // If created by judge, it's automatically assigned; otherwise needs approval
      status:
      user?.role === 'judge' ? 'Filed' : newCase.status || 'Pending Approval'
    };
    setCases([caseToAdd, ...cases]);
  };
  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases(
      cases.map((c) =>
      c.id === id ?
      {
        ...c,
        ...updates,
        updated: 'Just now',
        // Recalculate daysLeft if nextHearing is updated
        daysLeft: updates.nextHearing ?
        calculateDaysLeft(updates.nextHearing) :
        c.daysLeft
      } :
      c
      )
    );
  };
  const deleteCase = (id: string) => {
    setCases(cases.filter((c) => c.id !== id));
  };
  const getCaseById = (id: string) => {
    return cases.find((c) => c.id === id);
  };
  const addDocumentToCase = (caseId: string, document: CaseDocument) => {
    setCases(
      cases.map((c) =>
      c.id === caseId ?
      {
        ...c,
        documents: [...c.documents, document],
        pages: c.pages + 1,
        updated: 'Just now'
      } :
      c
      )
    );
  };
  const addNoteToCase = (caseId: string, text: string) => {
    const newNote: CaseNote = {
      id: `note-${Date.now()}`,
      text,
      createdAt: new Date().toISOString().split('T')[0],
      author: user?.name || 'You'
    };
    setCases(
      cases.map((c) =>
      c.id === caseId ?
      {
        ...c,
        notes: [...(c.notes || []), newNote],
        updated: 'Just now'
      } :
      c
      )
    );
  };
  const updateCaseStatus = (caseId: string, status: string) => {
    setCases(
      cases.map((c) =>
      c.id === caseId ?
      {
        ...c,
        status,
        updated: 'Just now'
      } :
      c
      )
    );
  };
  const scheduleHearing = (caseId: string, date: string) => {
    setCases(
      cases.map((c) =>
      c.id === caseId ?
      {
        ...c,
        nextHearing: date,
        daysLeft: calculateDaysLeft(date),
        updated: 'Just now'
      } :
      c
      )
    );
  };
  const submitJudgment = (caseId: string, judgmentText: string) => {
    setCases(
      cases.map((c) =>
      c.id === caseId ?
      {
        ...c,
        judgment: judgmentText,
        status: 'Closed',
        updated: 'Just now'
      } :
      c
      )
    );
  };
  const updateMotionStatus = (id: number, status: 'Approved' | 'Rejected') => {
    setMotions(
      motions.map((m) =>
      m.id === id ?
      {
        ...m,
        status
      } :
      m
      )
    );
  };
  const signOrder = (id: number) => {
    setOrders(
      orders.map((o) =>
      o.id === id ?
      {
        ...o,
        status: 'Signed'
      } :
      o
      )
    );
  };
  const assignCaseToCourt = (caseId: string, court: string, judge: string) => {
    setCases(
      cases.map((c) =>
      c.id === caseId ?
      {
        ...c,
        court,
        judge,
        status: 'Assigned',
        updated: 'Just now'
      } :
      c
      )
    );
  };
  const approveCaseRegistration = (caseId: string) => {
    setCases(
      cases.map((c) =>
      c.id === caseId ?
      {
        ...c,
        status: 'Filed',
        updated: 'Just now'
      } :
      c
      )
    );
  };
  const assignCaseToLawyer = (caseId: string, lawyer: string) => {
    setCases(
      cases.map((c) =>
      c.id === caseId ?
      {
        ...c,
        lawyer,
        updated: 'Just now'
      } :
      c
      )
    );
  };
  return (
    <CasesContext.Provider
      value={{
        cases,
        motions,
        orders,
        addCase,
        updateCase,
        deleteCase,
        getCaseById,
        addDocumentToCase,
        addNoteToCase,
        updateCaseStatus,
        scheduleHearing,
        submitJudgment,
        updateMotionStatus,
        signOrder,
        assignCaseToCourt,
        approveCaseRegistration,
        assignCaseToLawyer
      }}>

      {children}
    </CasesContext.Provider>);

}
export function useCases() {
  const context = useContext(CasesContext);
  if (!context) {
    throw new Error('useCases must be used within CasesProvider');
  }
  return context;
}