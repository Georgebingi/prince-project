import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  X,
  Download } from
'lucide-react';
import { useCases, Motion } from '../contexts/CasesContext';
export function ReviewMotionsPage() {
  const navigate = useNavigate();
  const { motions, updateMotionStatus } = useCases();
  const [selectedMotion, setSelectedMotion] = useState<Motion | null>(null);
  // Filter only pending motions
  const pendingMotions = motions.filter((m) => m.status === 'Pending');
  const handleAction = (id: number, action: 'Approved' | 'Rejected') => {
    if (
    confirm(`Are you sure you want to ${action.toLowerCase()} this motion?`))
    {
      updateMotionStatus(id, action);
      alert(`Motion ${action.toLowerCase()} successfully!`);
    }
  };
  return (
    <Layout title="Review Motions" showLogoBanner={false}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}>

            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card noPadding>
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">
              Pending Motions
            </h2>
            <p className="text-sm text-slate-500">
              Review and rule on motions filed by counsel
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingMotions.length > 0 ?
            pendingMotions.map((motion) =>
            <div
              key={motion.id}
              className="p-6 hover:bg-slate-50 transition-colors">

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="warning">Pending Review</Badge>
                        <span className="text-sm font-medium text-slate-600">
                          {motion.caseId}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {motion.date}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {motion.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Filed by: {motion.filedBy}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMotion(motion)}>

                        <FileText className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                      <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                    onClick={() => handleAction(motion.id, 'Rejected')}>

                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction(motion.id, 'Approved')}>

                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
            ) :

            <div className="p-12 text-center text-slate-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <h3 className="text-lg font-medium text-slate-900">
                  All Caught Up!
                </h3>
                <p>No pending motions to review.</p>
              </div>
            }
          </div>
        </Card>
      </div>

      {/* View Document Modal */}
      {selectedMotion &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                {selectedMotion.title} - {selectedMotion.documentUrl}
              </h3>
              <button
              onClick={() => setSelectedMotion(null)}
              className="p-1 hover:bg-slate-100 rounded-full">

                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-8 bg-slate-50 flex-1 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <FileText className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">
                  Document preview for: {selectedMotion.title}
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  In a real application, this would display the PDF content.
                </p>
                <Button
                onClick={() =>
                alert(`Downloading ${selectedMotion.documentUrl}`)
                }>

                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </Button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedMotion(null)}>
                Close
              </Button>
              <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                handleAction(selectedMotion.id, 'Rejected');
                setSelectedMotion(null);
              }}>

                Reject
              </Button>
              <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                handleAction(selectedMotion.id, 'Approved');
                setSelectedMotion(null);
              }}>

                Approve
              </Button>
            </div>
          </div>
        </div>
      }
    </Layout>);

}