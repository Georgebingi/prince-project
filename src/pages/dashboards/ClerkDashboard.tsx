import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  FileText,
  Upload,
  Download,
  Clock,
  CheckCircle,
  Printer,
  Mail,
  FolderOpen,
  X,
  Eye,
  Calendar,
  Bell,
  Send,
  ExternalLink,
  Users } from
'lucide-react';
import { useCases, CaseDocument } from '../../contexts/CasesContext';
import { useSystem } from '../../contexts/SystemContext';
import { useStaff } from '../../contexts/StaffContext';
interface Task {
  id: string;
  task: string;
  caseId: string;
  caseTitle: string;
  priority: 'High' | 'Medium' | 'Low';
  time: string;
  document?: CaseDocument;
  judge: string;
}
export function ClerkDashboard() {
  const navigate = useNavigate();
  const { cases } = useCases();
  const { staff } = useStaff();
  const { addSystemNotification } = useSystem();
  const [selectedDocument, setSelectedDocument] = useState<CaseDocument | null>(
    null
  );
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSendNoticesModal, setShowSendNoticesModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [noticeMessage, setNoticeMessage] = useState('');
  // Filter cases assigned to judges
  const judgeCases = useMemo(() => {
    return cases.filter((c) => c.judge && c.judge !== 'Unassigned');
  }, [cases]);
  // Calculate dynamic stats
  const stats = useMemo(() => {
    const totalDocs = judgeCases.reduce((acc, c) => acc + c.documents.length, 0);
    const pendingUpload = judgeCases.filter(
      (c) => c.documents.length === 0
    ).length;
    const processedToday = judgeCases.filter(
      (c) => c.updated === 'Just now'
    ).length;
    const awaitingSignature = judgeCases.filter(
      (c) => c.status === 'Pending Judgment' || c.status === 'Review'
    ).length;
    return {
      documentsFiled: totalDocs,
      pendingUpload,
      processedToday,
      awaitingSignature
    };
  }, [judgeCases]);
  // Generate tasks from judge's cases with documents (excluding completed)
  const tasks: Task[] = useMemo(() => {
    const taskList: Task[] = [];
    judgeCases.forEach((c) => {
      c.documents.forEach((doc, index) => {
        const taskId = `doc-${c.id}-${index}`;
        if (!completedTasks.has(taskId)) {
          taskList.push({
            id: taskId,
            task: `Process document: ${doc.name}`,
            caseId: c.id,
            caseTitle: c.title,
            priority: c.priority,
            time: c.updated,
            document: doc,
            judge: c.judge || 'Unknown Judge'
          });
        }
      });
      if (c.status === 'Review' || c.status === 'Pending Judgment') {
        const taskId = `file-${c.id}`;
        if (!completedTasks.has(taskId)) {
          taskList.push({
            id: taskId,
            task: `Prepare case file for ${c.status.toLowerCase()}`,
            caseId: c.id,
            caseTitle: c.title,
            priority: c.priority,
            time: c.updated,
            judge: c.judge || 'Unknown Judge'
          });
        }
      }
    });
    return taskList.slice(0, 8);
  }, [judgeCases, completedTasks]);
  // Get upcoming scheduled hearings
  const upcomingHearings = useMemo(() => {
    return judgeCases.
    filter((c) => c.nextHearing !== 'TBD').
    sort((a, b) => a.daysLeft - b.daysLeft).
    slice(0, 5);
  }, [judgeCases]);
  // Get judges and lawyers for send notices
  const judgesAndLawyers = useMemo(() => {
    return staff.filter((s) => s.role === 'Judge' || s.role === 'Lawyer');
  }, [staff]);
  const handleViewDocument = (task: Task) => {
    if (task.document) {
      setSelectedDocument(task.document);
    } else {
      alert('No document available for this task');
    }
  };
  const handleCompleteTask = (taskId: string) => {
    setCompletedTasks((prev) => new Set(prev).add(taskId));
    addSystemNotification({
      title: 'Task Completed',
      message: `Task ${taskId} has been marked as complete`,
      type: 'success',
      createdBy: 'Court Clerk'
    });
  };
  const handleOpenExternalViewer = (doc: CaseDocument) => {
    window.open(`#view-document-${doc.id}`, '_blank');
    alert(`Opening ${doc.name} in external viewer`);
  };
  const handleSendReminder = (caseItem: (typeof judgeCases)[0]) => {
    addSystemNotification({
      title: `Hearing Reminder: ${caseItem.id}`,
      message: `Reminder: Case "${caseItem.title}" is scheduled for hearing on ${caseItem.nextHearing}. Please ensure all documents are prepared.`,
      type: 'info',
      createdBy: 'Court Clerk'
    });
    alert(`Reminder sent for case ${caseItem.id} to all participants!`);
  };
  const handleSendNotices = () => {
    if (selectedRecipients.length === 0 || !noticeMessage.trim()) {
      alert('Please select recipients and enter a message');
      return;
    }
    selectedRecipients.forEach((recipientId) => {
      const recipient = staff.find((s) => s.staffId === recipientId);
      if (recipient) {
        addSystemNotification({
          title: 'Case Notice from Court Clerk',
          message: noticeMessage,
          type: 'warning',
          createdBy: 'Court Clerk'
        });
      }
    });
    alert(`Notices sent to ${selectedRecipients.length} recipient(s)!`);
    setShowSendNoticesModal(false);
    setSelectedRecipients([]);
    setNoticeMessage('');
  };
  const toggleRecipient = (staffId: string) => {
    setSelectedRecipients((prev) =>
    prev.includes(staffId) ?
    prev.filter((id) => id !== staffId) :
    [...prev, staffId]
    );
  };
  return (
    <Layout title="Clerk Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/documents')}>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Documents Filed</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {stats.documentsFiled}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/documents')}>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending Upload</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {stats.pendingUpload}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 text-amber-700">
                <Upload className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/documents')}>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Processed Today</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {stats.processedToday}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowScheduleModal(true)}>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Upcoming Hearings</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {upcomingHearings.length}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-700">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Task Queue */}
            <Card noPadding>
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">
                  My Task Queue
                </h3>
                <p className="text-sm text-slate-500">
                  Documents from judge's cases requiring processing
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {tasks.length > 0 ?
                tasks.map((task) =>
                <div
                  key={task.id}
                  className="p-6 hover:bg-slate-50 transition-colors">

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                          variant={
                          task.priority === 'High' ?
                          'danger' :
                          task.priority === 'Medium' ?
                          'warning' :
                          'secondary'
                          }>

                              {task.priority}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {task.time}
                            </span>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {task.judge}
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-900 mb-1">
                            {task.task}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {task.caseTitle}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Case: {task.caseId}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(task)}>

                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                        size="sm"
                        onClick={() => handleCompleteTask(task.id)}>

                            Complete
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
                    <p>No pending tasks at the moment.</p>
                  </div>
                }
              </div>
            </Card>

            {/* Hearing Schedule */}
            <Card noPadding>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Hearing Schedule
                  </h3>
                  <p className="text-sm text-slate-500">
                    Upcoming court hearings
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowScheduleModal(true)}>

                  View All
                </Button>
              </div>

              <div className="divide-y divide-slate-100">
                {upcomingHearings.slice(0, 3).map((hearing) =>
                <div
                  key={hearing.id}
                  className="p-6 hover:bg-slate-50 transition-colors">

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                          variant={
                          hearing.daysLeft <= 3 ? 'danger' : 'secondary'
                          }>

                            {hearing.daysLeft} days left
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {hearing.nextHearing}
                          </span>
                        </div>
                        <h4 className="font-medium text-slate-900 mb-1">
                          {hearing.title}
                        </h4>
                        <p className="text-sm text-slate-600">
                          Case: {hearing.id}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Judge: {hearing.judge}
                        </p>
                      </div>
                      <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendReminder(hearing)}>

                        <Bell className="h-4 w-4 mr-1" />
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => navigate('/documents')}>

                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => navigate('/documents')}>

                  <Download className="h-4 w-4 mr-2" />
                  Download Files
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => window.print()}>

                  <Printer className="h-4 w-4 mr-2" />
                  Print Queue
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => setShowSendNoticesModal(true)}>

                  <Mail className="h-4 w-4 mr-2" />
                  Send Notices
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => navigate('/documents')}>

                  <FolderOpen className="h-4 w-4 mr-2" />
                  File Management
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                {selectedDocument.name}
              </h3>
              <button
              onClick={() => setSelectedDocument(null)}
              className="p-1 hover:bg-slate-100 rounded-full">

                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-8 bg-slate-50 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">
                  <strong>Document:</strong> {selectedDocument.name}
                </p>
                <p className="text-sm text-slate-400 mb-2">
                  <strong>Type:</strong> {selectedDocument.type}
                </p>
                <p className="text-sm text-slate-400 mb-2">
                  <strong>Size:</strong> {selectedDocument.size}
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  <strong>Uploaded:</strong> {selectedDocument.uploadedAt} by{' '}
                  {selectedDocument.uploadedBy}
                </p>
                <Button
                onClick={() => handleOpenExternalViewer(selectedDocument)}>

                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in External Viewer
                </Button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
              <Button
              variant="outline"
              onClick={() => setSelectedDocument(null)}>

                Close
              </Button>
              <Button
              onClick={() => {
                handleCompleteTask(`doc-${selectedDocument.id}`);
                setSelectedDocument(null);
              }}>

                Mark as Processed
              </Button>
            </div>
          </div>
        </div>
      }

      {/* Send Notices Modal */}
      {showSendNoticesModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="h-5 w-5 text-slate-500" />
                Send Notices to Judges & Lawyers
              </h3>
              <button
              onClick={() => setShowSendNoticesModal(false)}
              className="p-1 hover:bg-slate-100 rounded-full">

                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Select Recipients
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {judgesAndLawyers.map((person) =>
                <label
                  key={person.id}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">

                      <input
                    type="checkbox"
                    checked={selectedRecipients.includes(person.staffId)}
                    onChange={() => toggleRecipient(person.staffId)}
                    className="rounded border-slate-300 text-primary focus:ring-primary" />

                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {person.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {person.role} • {person.department}
                        </p>
                      </div>
                    </label>
                )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {selectedRecipients.length} recipient(s) selected
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Notice Message
                </label>
                <textarea
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                placeholder="Enter your notice message about pending cases..."
                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />

              </div>

              <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                <p>
                  This notice will be sent to all selected judges and lawyers
                  regarding pending cases and upcoming hearings.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <Button
              variant="outline"
              onClick={() => setShowSendNoticesModal(false)}>

                Cancel
              </Button>
              <Button
              onClick={handleSendNotices}
              disabled={
              selectedRecipients.length === 0 || !noticeMessage.trim()
              }>

                <Send className="h-4 w-4 mr-2" />
                Send Notices
              </Button>
            </div>
          </div>
        </div>
      }

      {/* Full Schedule Modal */}
      {showScheduleModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-500" />
                Complete Hearing Schedule
              </h3>
              <button
              onClick={() => setShowScheduleModal(false)}
              className="p-1 hover:bg-slate-100 rounded-full">

                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {upcomingHearings.map((hearing) =>
              <Card key={hearing.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                        variant={
                        hearing.daysLeft <= 3 ? 'danger' : 'secondary'
                        }>

                            {hearing.daysLeft} days left
                          </Badge>
                          <span className="text-sm font-medium text-slate-600">
                            {hearing.nextHearing}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {hearing.title}
                        </h4>
                        <p className="text-sm text-slate-600 mb-1">
                          Case: {hearing.id}
                        </p>
                        <p className="text-sm text-slate-500">
                          Judge: {hearing.judge}
                        </p>
                        {hearing.lawyer &&
                    <p className="text-sm text-slate-500">
                            Lawyer: {hearing.lawyer}
                          </p>
                    }
                      </div>
                      <Button
                    size="sm"
                    onClick={() => {
                      handleSendReminder(hearing);
                      setShowScheduleModal(false);
                    }}>

                        <Send className="h-4 w-4 mr-1" />
                        Send Reminder
                      </Button>
                    </div>
                  </Card>
              )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button
              variant="outline"
              onClick={() => setShowScheduleModal(false)}>

                Close
              </Button>
            </div>
          </div>
        </div>
      }
    </Layout>);

}