import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Globe, Server, Lock, ArrowRightLeft, CheckCircle, XCircle, Database } from 'lucide-react';
export function PartnerInteroperabilityPage() {
  const partners = [{
    name: 'Nigerian Police Force',
    status: 'Connected',
    latency: '24ms',
    lastSync: '2 mins ago',
    type: 'Law Enforcement'
  }, {
    name: 'Correctional Services',
    status: 'Connected',
    latency: '45ms',
    lastSync: '10 mins ago',
    type: 'Detention'
  }, {
    name: 'Ministry of Justice',
    status: 'Syncing',
    latency: '120ms',
    lastSync: 'In Progress',
    type: 'Government'
  }, {
    name: 'Legal Aid Council',
    status: 'Offline',
    latency: '-',
    lastSync: '2 days ago',
    type: 'Legal Aid'
  }];
  return <Layout title="Partner Network & Interoperability">
      <div className="space-y-6">
        {/* Network Status Map/Overview */}
        <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Globe className="h-8 w-8 text-blue-400" />
                Judicial Data Exchange Node
              </h2>
              <p className="text-slate-300 max-w-xl">
                Securely exchanging case data, warrants, and judgments with
                authorized partner agencies via encrypted channels.
              </p>
            </div>
            <div className="flex gap-4 text-center">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-400">99.9%</div>
                <div className="text-xs text-slate-400">Uptime</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-400">AES-256</div>
                <div className="text-xs text-slate-400">Encryption</div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partners.map(partner => <Card key={partner.name} className="border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg h-fit">
                    <Server className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{partner.name}</h3>
                    <p className="text-sm text-slate-500">{partner.type}</p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Database className="h-3 w-3" /> {partner.latency}
                      </span>
                      <span className="flex items-center gap-1">
                        <ArrowRightLeft className="h-3 w-3" />{' '}
                        {partner.lastSync}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={partner.status === 'Connected' ? 'success' : partner.status === 'Syncing' ? 'warning' : 'danger'}>
                    {partner.status}
                  </Badge>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Configure
                  </Button>
                </div>
              </div>
            </Card>)}
        </div>

        {/* Security & Compliance */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-900">
              Security Protocols
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-slate-700">
                  End-to-End Encryption (TLS 1.3)
                </span>
              </div>
              <span className="text-xs text-slate-500">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-slate-700">
                  Role-Based Access Control (RBAC)
                </span>
              </div>
              <span className="text-xs text-slate-500">Enforced</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-slate-700">
                  Audit Trail Logging
                </span>
              </div>
              <span className="text-xs text-slate-500">Enabled</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>;
}