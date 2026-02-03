import React, { useEffect, useState, createContext, useContext } from 'react';
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastActive: string;
  joinedDate: string;
}
interface StaffContextType {
  staff: StaffMember[];
  addStaff: (
  staff: Omit<StaffMember, 'id' | 'lastActive' | 'joinedDate'>)
  => void;
  updateStaffStatus: (id: string, status: StaffMember['status']) => void;
  deleteStaff: (id: string) => void;
}
const StaffContext = createContext<StaffContextType | undefined>(undefined);
const INITIAL_STAFF: StaffMember[] = [
{
  id: 'JDG/2024/001',
  name: 'Hon. Justice Ibrahim',
  role: 'Judge',
  department: 'High Court 1',
  email: 'ibrahim@court.gov.ng',
  status: 'Active',
  lastActive: 'Just now',
  joinedDate: '2020-01-15'
},
{
  id: 'REG/2024/015',
  name: 'Registrar Bello',
  role: 'Registrar',
  department: 'Court Registry',
  email: 'bello@court.gov.ng',
  status: 'Active',
  lastActive: '5 mins ago',
  joinedDate: '2021-03-10'
},
{
  id: 'CLK/2024/042',
  name: 'Clerk Amina',
  role: 'Clerk',
  department: 'Filing Department',
  email: 'amina@court.gov.ng',
  status: 'Active',
  lastActive: '1 hour ago',
  joinedDate: '2022-06-20'
},
{
  id: 'ADM/2024/003',
  name: 'SysAdmin Yusuf',
  role: 'IT Admin',
  department: 'IT Systems',
  email: 'yusuf@court.gov.ng',
  status: 'Active',
  lastActive: '2 mins ago',
  joinedDate: '2019-11-05'
},
{
  id: 'LAW/2024/128',
  name: 'Barrister Musa',
  role: 'Lawyer',
  department: 'Legal Practice',
  email: 'musa@law.ng',
  status: 'Inactive',
  lastActive: '2 days ago',
  joinedDate: '2023-01-12'
},
{
  id: 'IT/2024/001',
  name: 'IT Director Sani',
  role: 'IT Admin',
  department: 'Technology Infrastructure',
  email: 'sani@court.gov.ng',
  status: 'Active',
  lastActive: '1 day ago',
  joinedDate: '2020-05-15'
},
{
  id: 'ADM/2024/010',
  name: 'Admin Director Okon',
  role: 'Court Admin',
  department: 'Court Administration',
  email: 'okon@court.gov.ng',
  status: 'Active',
  lastActive: '3 hours ago',
  joinedDate: '2018-09-01'
},
{
  id: 'AUD/2024/007',
  name: 'Auditor Sarah',
  role: 'Auditor',
  department: 'Audit & Compliance',
  email: 'sarah@court.gov.ng',
  status: 'Active',
  lastActive: '4 hours ago',
  joinedDate: '2021-11-20'
},
{
  id: 'EXT/2024/099',
  name: 'Police Liaison Officer',
  role: 'Partner',
  department: 'Nigerian Police Force',
  email: 'police@partners.gov.ng',
  status: 'Active',
  lastActive: '10 mins ago',
  joinedDate: '2022-02-14'
}];

export function StaffProvider({ children }: {children: ReactNode;}) {
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('court_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });
  useEffect(() => {
    localStorage.setItem('court_staff', JSON.stringify(staff));
  }, [staff]);
  const addStaff = (
  newStaff: Omit<StaffMember, 'id' | 'lastActive' | 'joinedDate'>) =>
  {
    const id = `STF/2024/${String(staff.length + 1).padStart(3, '0')}`;
    const staffMember: StaffMember = {
      ...newStaff,
      id,
      lastActive: 'Never',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setStaff([staffMember, ...staff]);
  };
  const updateStaffStatus = (id: string, status: StaffMember['status']) => {
    setStaff(
      staff.map((s) =>
      s.id === id ?
      {
        ...s,
        status
      } :
      s
      )
    );
  };
  const deleteStaff = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
  };
  return (
    <StaffContext.Provider
      value={{
        staff,
        addStaff,
        updateStaffStatus,
        deleteStaff
      }}>

      {children}
    </StaffContext.Provider>);

}
export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
}