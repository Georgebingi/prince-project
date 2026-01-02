import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { BookOpen, Clock, Gavel, FileText, AlertCircle, CheckCircle, Scale, UserPlus, Search, Plus } from 'lucide-react';
import { useCases } from '../../contexts/CasesContext';
import { CreateCaseModal } from '../../components/CreateCaseModal';
export function JudgeDashboard() {
  const navigate = useNavigate();
  const {
    cases,
    motions,
    orders,
    assignCaseToLawyer
  } = useCases();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<string>('');
  // Filter cases for current judge AND exclude closed cases
  const myCases = cases.filter(c => c.judge === 'Hon. Justice Ibrahim' && c.status !== 'Closed' && c.status !== 'Disposed');
  // Cases that need lawyer assignment (mock logic: cases without lawyer assigned)
  const unassignedCases = myCases.filter(c => !c.lawyer).slice(0, 3);
  const pendingJudgment = myCases.filter(c => c.status === 'Pending Judgment').length;
  const pendingMotions = motions.filter(m => m.status === 'Pending').length;
  const draftOrders = orders.filter(o => o.status === 'Draft').length;
  const lawyers = [{
    value: 'Barrister Musa',
    label: 'Barr. Musa'
  }, {
    value: 'Barr. Fatima Yusuf',
    label: 'Barr. Fatima Yusuf'
  }, {
    value: 'Barr. John Doe',
    label: 'Barr. John Doe'
  }, {
    value: 'Barr. Amina Bello',
    label: 'Barr. Amina Bello'
  }];
  const handleAssign = (caseId: string) => {
    if (selectedLawyer) {
      assignCaseToLawyer(caseId, selectedLawyer);
      setSelectedLawyer('');
      alert(`Case ${caseId} assigned to ${selectedLawyer} successfully!`);
    } else {
      alert('Please select a lawyer first.');
    }
  };
  const handleViewDetails = (caseId: string) => {
    // Encode the ID to handle slashes in the URL
    navigate(`/cases/${encodeURIComponent(caseId)}`);
  };
  const handleOpenCase = (caseId: string) => {
    // Encode the ID to handle slashes in the URL
    navigate(`/cases/${encodeURIComponent(caseId)}`, {
      state: {
        openDocuments: true
      }
    });
  };
  return <Layout title="Judge's Chambers">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/cases')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Active Cases</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {myCases.length}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Scale className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/cases?status=judgment')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending Judgment</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {pendingJudgment}
                </h3>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Gavel className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/sign-orders')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Draft Orders</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {draftOrders}
                </h3>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <FileText className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/review-motions')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending Motions</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {pendingMotions}
                </h3>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Assignment Section */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Assign Cases to Lawyers
                  </h3>
                  <p className="text-sm text-slate-500">
                    Manage legal representation for unassigned cases
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View All Pending
                </Button>
              </div>

              <div className="space-y-4">
                {unassignedCases.length > 0 ? unassignedCases.map(c => <div key={c.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {c.id}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {c.type}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-slate-900">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Filed {c.filed}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="w-full sm:w-48">
                          <Select options={lawyers} placeholder="Select Lawyer..." className="w-full" value={selectedLawyer} onChange={e => setSelectedLawyer(e.target.value)} />
                        </div>
                        <Button size="sm" onClick={() => handleAssign(c.id)}>
                          Assign
                        </Button>
                      </div>
                    </div>) : <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>All pending cases have been assigned!</p>
                  </div>}
              </div>
            </Card>

            {/* Case Library - Shelf View */}
            <Card noPadding>
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      My Case Library
                    </h3>
                    <p className="text-sm text-slate-500">
                      Active cases assigned to your bench
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Case
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/cases')}>
                      View All
                    </Button>
                  </div>
                </div>
              </div>

              {/* Library Shelf View */}
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {myCases.length > 0 ? myCases.map(caseFile => <button key={caseFile.id} onClick={() => setSelectedCase(caseFile.id)} className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 outline-none focus:ring-2 focus:ring-primary rounded-lg ${selectedCase === caseFile.id ? 'scale-105 ring-2 ring-primary' : ''}`}>
                        <div className={`${caseFile.color} rounded-r-lg shadow-lg h-48 flex flex-col justify-between p-4 text-white transform perspective-1000 hover:shadow-xl transition-shadow`}>
                          <div>
                            <div className="text-xs font-bold mb-2 opacity-90">
                              {caseFile.id}
                            </div>
                            <div className="text-sm font-semibold leading-tight line-clamp-3">
                              {caseFile.title}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-xs opacity-90">
                              <BookOpen className="h-3 w-3" />
                              <span>{caseFile.documents.length} docs</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs opacity-90">
                              <Clock className="h-3 w-3" />
                              <span>{caseFile.daysLeft} days</span>
                            </div>
                          </div>

                          {caseFile.priority === 'High' && <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                              !
                            </div>}
                        </div>
                        <div className="h-2 bg-slate-200 rounded-b-sm mt-0.5"></div>
                      </button>) : <div className="col-span-full py-12 text-center text-slate-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No active cases in your library.</p>
                      <Button variant="outline" className="mt-4" onClick={() => setShowCreateModal(true)}>
                        Create New Case
                      </Button>
                    </div>}
                </div>

                {/* Selected Case Details */}
                {selectedCase && <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    {(() => {
                  const selected = myCases.find(c => c.id === selectedCase);
                  return selected ? <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              {selected.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                              <Badge variant="secondary">{selected.type}</Badge>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Next:{' '}
                                {selected.nextHearing}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />{' '}
                                {selected.documents.length} documents
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetails(selected.id)}>
                              View Details
                            </Button>
                            <Button size="sm" onClick={() => handleOpenCase(selected.id)}>
                              Open Case
                            </Button>
                          </div>
                        </div> : null;
                })()}
                  </div>}
              </div>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all" size="sm" onClick={() => navigate('/write-judgment')}>
                  <Gavel className="h-4 w-4 mr-2" />
                  Write Judgment
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all" size="sm" onClick={() => navigate('/review-motions')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Review Motions
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all" size="sm" onClick={() => navigate('/sign-orders')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Sign Orders
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all" size="sm" onClick={() => navigate('/cases')}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Case Law
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <CreateCaseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </Layout>;
}