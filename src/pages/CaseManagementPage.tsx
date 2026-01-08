import React, { useState, Component } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { FolderOpen, Plus, Search, Filter, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCases } from '../contexts/CasesContext';
import { CreateCaseModal } from '../components/CreateCaseModal';
import { NetworkAwareSkeleton } from '../components/NetworkAwareSkeleton';
export function CaseManagementPage() {
  const navigate = useNavigate();
  const {
    cases
  } = useCases();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const filteredCases = cases.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase().includes(statusFilter);
    const matchesType = typeFilter === 'all' || c.type.toLowerCase() === typeFilter;
    return matchesStatus && matchesType;
  });
  const handleCaseClick = (caseId: string) => {
    // Encode the ID to handle slashes in the URL
    navigate(`/cases/${encodeURIComponent(caseId)}`);
  };
  return <Layout title="Case Management">
      <NetworkAwareSkeleton isLoading={isLoading} type="table">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search cases by ID, title, or parties..." className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <Button variant="secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Case
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          <Select className="w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={[{
          value: 'all',
          label: 'All Statuses'
        }, {
          value: 'filed',
          label: 'Filed'
        }, {
          value: 'progress',
          label: 'In Progress'
        }, {
          value: 'judgment',
          label: 'Pending Judgment'
        }, {
          value: 'disposed',
          label: 'Disposed'
        }]} />
          <Select className="w-40" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={[{
          value: 'all',
          label: 'All Types'
        }, {
          value: 'criminal',
          label: 'Criminal'
        }, {
          value: 'civil',
          label: 'Civil'
        }, {
          value: 'family',
          label: 'Family'
        }, {
          value: 'commercial',
          label: 'Commercial'
        }, {
          value: 'appeal',
          label: 'Appeal'
        }]} />
        </div>

        {/* Case List */}
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Case Details</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Assigned To</th>
                  <th className="px-6 py-3">Last Updated</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map(c => <tr key={c.id} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleCaseClick(c.id)}>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded text-blue-600 mt-1 group-hover:bg-blue-100 transition-colors">
                          <FolderOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {c.title}
                          </p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            {c.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700">{c.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={c.status === 'In Progress' ? 'warning' : c.status === 'Pending Judgment' ? 'danger' : 'secondary'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="h-3 w-3" />
                        <span className="text-xs">{c.judge}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {c.updated}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={e => {
                    e.stopPropagation();
                    handleCaseClick(c.id);
                  }}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing 1-{filteredCases.length} of {cases.length} cases
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled>
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
      </NetworkAwareSkeleton>

      <CreateCaseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </Layout>;
}