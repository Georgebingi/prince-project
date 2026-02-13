import { useMemo } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useCases } from '../contexts/CasesContext';
import { useStaff } from '../contexts/StaffContext';
export function UserPerformanceStats() {
  const { cases } = useCases();
  const { staff } = useStaff();
  const stats = useMemo(() => {
    // Filter staff to only include those who might have cases (Judges, Lawyers, Registrars)
    const relevantStaff = staff.filter((s) =>
    ['Judge', 'Lawyer', 'Registrar', 'Clerk'].includes(s.role)
    );
    return relevantStaff.
    map((person) => {
      // Find cases associated with this person
      // This logic depends on how cases are assigned.
      // Judges are in 'judge' field
      // Lawyers might be in 'lawyer' field (if added) or 'createdBy'
      // Registrars/Clerks might be in 'createdBy'
      const personCases = cases.filter((c) => {
        if (person.role === 'Judge') return c.judge === person.name;
        // For others, we check if they created it or are assigned (if we had an assignedTo field)
        // Since we don't have a generic 'assignedTo' field for everyone, we'll use createdBy as a proxy for now
        // or check specific fields if they exist
        return c.createdBy === person.name || c.judge === person.name;
      });
      const total = personCases.length;
      const completed = personCases.filter(
        (c) => c.status === 'Closed' || c.status === 'Judgment Delivered'
      ).length;
      const pending = personCases.filter(
        (c) => c.status !== 'Closed' && c.status !== 'Judgment Delivered'
      ).length;
      // 'Created' is a bit ambiguous if we are already filtering by createdBy, but let's assume it means cases they initiated
      const created = cases.filter((c) => c.createdBy === person.name).length;
      return {
        name: person.name,
        role: person.role,
        total,
        completed,
        pending,
        created
      };
    }).
    sort((a, b) => b.total - a.total); // Sort by total cases descending
  }, [cases, staff]);
  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Staff Performance Metrics
        </h3>
        <p className="text-sm text-slate-500">
          Case handling statistics per staff member
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Staff Member</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3 text-center">Total Cases</th>
              <th className="px-6 py-3 text-center">Completed</th>
              <th className="px-6 py-3 text-center">Pending</th>
              <th className="px-6 py-3 text-center">Created</th>
              <th className="px-6 py-3 text-center">Completion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.map((stat) =>
            <tr key={stat.name} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {stat.name}
                </td>
                <td className="px-6 py-4 text-slate-600">{stat.role}</td>
                <td className="px-6 py-4 text-center font-semibold">
                  {stat.total}
                </td>
                <td className="px-6 py-4 text-center text-green-600">
                  {stat.completed}
                </td>
                <td className="px-6 py-4 text-center text-amber-600">
                  {stat.pending}
                </td>
                <td className="px-6 py-4 text-center text-blue-600">
                  {stat.created}
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge
                  variant={
                  stat.total > 0 && stat.completed / stat.total > 0.7 ?
                  'success' :
                  'secondary'
                  }>

                    {stat.total > 0 ?
                  `${Math.round(stat.completed / stat.total * 100)}%` :
                  'N/A'}
                  </Badge>
                </td>
              </tr>
            )}
            {stats.length === 0 &&
            <tr>
                <td
                colSpan={7}
                className="px-6 py-8 text-center text-slate-500">

                  No performance data available.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </Card>);

}