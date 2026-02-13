import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useCases, Case } from '../contexts/CasesContext';

interface EditCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: Case;
}

type CaseType = Case['type'];
type Priority = Case['priority'];

const caseTypeColors: Record<CaseType, string> = {
  Criminal: 'bg-red-600',
  Civil: 'bg-blue-600',
  Family: 'bg-emerald-600',
  Commercial: 'bg-purple-600',
  Appeal: 'bg-amber-600'
};

export function EditCaseModal({
  isOpen,
  onClose,
  caseData
}: EditCaseModalProps) {
  const { updateCase } = useCases();
  const [formData, setFormData] = useState({
    title: '',
    type: undefined as CaseType | undefined,
    priority: undefined as Priority | undefined,
    status: '',
    nextHearing: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (caseData) {
      setFormData({
        title: caseData.title,
        type: caseData.type,
        priority: caseData.priority,
        status: caseData.status,
        nextHearing: caseData.nextHearing === 'TBD' ? '' : caseData.nextHearing
      });
    }
  }, [caseData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.priority) {
      alert('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      updateCase(caseData.id, {
        title: formData.title,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        nextHearing: formData.nextHearing || 'TBD',
        color: formData.type ? caseTypeColors[formData.type] : undefined
      });
      setIsSubmitting(false);
      onClose();
      alert('Case updated successfully!');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Edit Case: {caseData.id}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <Input
              label="Case Title *"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value
                })
              }
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Case Type *"
                value={formData.type || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as CaseType
                  })
                }
                options={[
                  { value: 'Criminal', label: 'Criminal' },
                  { value: 'Civil', label: 'Civil' },
                  { value: 'Family', label: 'Family' },
                  { value: 'Commercial', label: 'Commercial' },
                  { value: 'Appeal', label: 'Appeal' }
                ]}
                required
              />

              <Select
                label="Priority *"
                value={formData.priority || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as Priority
                  })
                }
                options={[
                  { value: 'High', label: 'High Priority' },
                  { value: 'Medium', label: 'Medium Priority' },
                  { value: 'Low', label: 'Low Priority' }
                ]}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value
                  })
                }
                options={[
                  { value: 'Filed', label: 'Filed' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Pending Judgment', label: 'Pending Judgment' },
                  { value: 'Closed', label: 'Closed' },
                  { value: 'Pending Approval', label: 'Pending Approval' }
                ]}
              />

              <Input
                label="Next Hearing Date"
                type="date"
                value={formData.nextHearing}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nextHearing: e.target.value
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
