import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
<<<<<<< HEAD
import {
  Globe,
  ArrowRightLeft,
  FileCheck,
  Shield,
  Activity,
  Search } from
'lucide-react';
export function PartnerDashboard() {
  const transfers = [
  {
=======
import { Globe, ArrowRightLeft, FileCheck, Shield, Activity, Search } from 'lucide-react';
export function PartnerDashboard() {
  const transfers = [{
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    id: 'TRX-8829',
    type: 'Warrant Request',
    target: 'Police HQ',
    status: 'Completed',
    time: '10:42 AM'
<<<<<<< HEAD
  },
  {
=======
  }, {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    id: 'TRX-8830',
    type: 'Prisoner Remand',
    target: 'Correctional Center',
    status: 'Processing',
    time: '11:15 AM'
<<<<<<< HEAD
  },
  {
=======
  }, {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    id: 'TRX-8831',
    type: 'Evidence Transfer',
    target: 'Forensic Lab',
    status: 'Pending',
    time: '11:30 AM'
  }];
<<<<<<< HEAD

  return (
    <Layout title="Partner Interoperability Portal">
=======
  return <Layout title="Partner Interoperability Portal">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Nigerian Police Force Node
              </h2>
              <p className="text-sm text-slate-500">
                Secure Data Exchange Connection • Active
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Connection Log
            </Button>
            <Button>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center p-4">
              <p className="text-sm text-slate-500 mb-2">Data Packets Sent</p>
              <h3 className="text-3xl font-bold text-slate-900">1,240</h3>
              <p className="text-xs text-green-600 mt-2">
                ↑ 15% from last week
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center p-4">
              <p className="text-sm text-slate-500 mb-2">Pending Requests</p>
              <h3 className="text-3xl font-bold text-slate-900">12</h3>
              <p className="text-xs text-amber-600 mt-2">
                Requires verification
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center p-4">
              <p className="text-sm text-slate-500 mb-2">Security Clearance</p>
              <h3 className="text-3xl font-bold text-slate-900">Level 3</h3>
              <p className="text-xs text-blue-600 mt-2">
                Authorized for restricted data
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Recent Data Transfers
              </h3>
              <Button size="sm" variant="ghost">
                View History
              </Button>
            </div>
            <div className="space-y-4">
<<<<<<< HEAD
              {transfers.map((t) =>
              <div
                key={t.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-md">

=======
              {transfers.map(t => <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <ArrowRightLeft className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {t.type}
                      </p>
                      <p className="text-xs text-slate-500">To: {t.target}</p>
                    </div>
                  </div>
                  <div className="text-right">
<<<<<<< HEAD
                    <Badge
                    variant={
                    t.status === 'Completed' ?
                    'success' :
                    t.status === 'Processing' ?
                    'warning' :
                    'default'
                    }>

=======
                    <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Processing' ? 'warning' : 'default'}>
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
                      {t.status}
                    </Badge>
                    <p className="text-xs text-slate-400 mt-1">{t.time}</p>
                  </div>
<<<<<<< HEAD
                </div>
              )}
=======
                </div>)}
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Case Lookup
              </h3>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
              <p className="text-sm text-slate-600 mb-4">
                Search for case files authorized for inter-agency sharing. All
                queries are logged.
              </p>
              <div className="flex gap-2">
<<<<<<< HEAD
                <input
                  type="text"
                  placeholder="Enter Case ID or Warrant Number"
                  className="flex-1 h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />

=======
                <input type="text" placeholder="Enter Case ID or Warrant Number" className="flex-1 h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
                <Button>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700">
                Recent Queries
              </h4>
              <div className="text-sm text-slate-500 flex justify-between py-2 border-b border-slate-100">
                <span>Warrant #9921</span>
                <span>Found</span>
              </div>
              <div className="text-sm text-slate-500 flex justify-between py-2 border-b border-slate-100">
                <span>Suspect: J. Doe</span>
                <span>No Record</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
<<<<<<< HEAD
    </Layout>);

=======
    </Layout>;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}