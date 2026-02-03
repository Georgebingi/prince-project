import React, { useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileText } from
'lucide-react';
import { useCases } from '../contexts/CasesContext';
export function ReportsPage() {
  const { cases } = useCases();
  // Calculate dynamic statistics
  const stats = useMemo(() => {
    const totalCases = cases.length;
    const disposedCases = cases.filter((c) =>
    c.status.toLowerCase().includes('disposed')
    ).length;
    const newCases = cases.filter((c) => c.status === 'Filed').length;
    const disposalRate =
    totalCases > 0 ? Math.round(disposedCases / totalCases * 100) : 0;
    // Calculate average case duration (mock calculation)
    const avgDuration = 45;
    // Count by type
    const byType = {
      Criminal: cases.filter((c) => c.type === 'Criminal').length,
      Civil: cases.filter((c) => c.type === 'Civil').length,
      Family: cases.filter((c) => c.type === 'Family').length,
      Commercial: cases.filter((c) => c.type === 'Commercial').length,
      Appeal: cases.filter((c) => c.type === 'Appeal').length
    };
    const maxCount = Math.max(...Object.values(byType), 1);
    return {
      totalCases,
      disposedCases,
      newCases,
      disposalRate,
      avgDuration,
      byType,
      maxCount
    };
  }, [cases]);
  const handleExportPDF = () => {
    window.print();
  };
  return (
    <Layout title="Analytics & Reports">
      <div className="space-y-6 print:space-y-4">
        <div className="flex justify-between items-center print:hidden">
          <p className="text-slate-500">
            Overview of court performance and case metrics
          </p>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              This Month
            </Button>
            <Button onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-full print:border print:border-blue-200">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Case Disposal Rate</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.disposalRate}%
                </h3>
                <p className="text-xs text-green-600">
                  Based on {stats.totalCases} total cases
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-50 rounded-full print:border print:border-purple-200">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Cases</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.totalCases}
                </h3>
                <p className="text-xs text-slate-500">
                  {stats.newCases} newly filed
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-amber-50 rounded-full print:border print:border-amber-200">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Avg. Case Duration</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.avgDuration} Days
                </h3>
                <p className="text-xs text-green-600">↓ 2 days faster</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-6">
              Case Distribution by Type
            </h3>
            <div className="h-64 flex items-end justify-between px-4 gap-2">
              {Object.entries(stats.byType).map(([type, count]) => {
                const heightPercent = count / stats.maxCount * 100;
                const colors: Record<string, string> = {
                  Criminal: 'bg-red-500',
                  Civil: 'bg-blue-500',
                  Family: 'bg-green-500',
                  Commercial: 'bg-purple-500',
                  Appeal: 'bg-amber-500'
                };
                return (
                  <div
                    key={type}
                    className="flex flex-col items-center gap-2 flex-1">

                    <div className="relative w-full flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-700 mb-1">
                        {count}
                      </span>
                      <div
                        className={`w-full rounded-t-md ${colors[type]} opacity-80 hover:opacity-100 transition-opacity print:bg-slate-800`}
                        style={{
                          height: `${Math.max(heightPercent, 10)}%`,
                          minHeight: '40px'
                        }}>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {type}
                    </span>
                  </div>);

              })}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-6">
              Case Status Overview
            </h3>
            <div className="space-y-4">
              {[
              {
                label: 'In Progress',
                count: cases.filter((c) => c.status === 'In Progress').length,
                color: 'bg-blue-500'
              },
              {
                label: 'Pending Judgment',
                count: cases.filter((c) => c.status === 'Pending Judgment').
                length,
                color: 'bg-amber-500'
              },
              {
                label: 'Review',
                count: cases.filter((c) => c.status === 'Review').length,
                color: 'bg-purple-500'
              },
              {
                label: 'Filed',
                count: cases.filter((c) => c.status === 'Filed').length,
                color: 'bg-green-500'
              },
              {
                label: 'Other',
                count: cases.filter(
                  (c) =>
                  ![
                  'In Progress',
                  'Pending Judgment',
                  'Review',
                  'Filed'].
                  includes(c.status)
                ).length,
                color: 'bg-slate-400'
              }].
              map((item) =>
              <div key={item.label} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-slate-700 font-medium">
                    {item.label}
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden print:border print:border-slate-200">
                    <div
                    className={`${item.color} h-full flex items-center justify-end px-3 text-white text-sm font-bold transition-all duration-500 print:bg-slate-700`}
                    style={{
                      width: `${item.count / stats.totalCases * 100}%`
                    }}>

                      {item.count > 0 && item.count}
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm text-slate-500">
                    {Math.round(item.count / stats.totalCases * 100)}%
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>);

}