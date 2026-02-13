import { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { 
  Globe, 
  Server, 
  ArrowRightLeft, 
  CheckCircle, 
  Database,
  RefreshCw,
  AlertCircle,
  Settings,
  Activity,
  Shield,
  Clock,
  Zap,
  X
} from 'lucide-react';

import { partnersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Partner {
  id: number;
  name: string;
  code: string;
  type: string;
  description?: string;
  contact: {
    email?: string;
    phone?: string;
  };
  status: 'Connected' | 'Disconnected' | 'Syncing' | 'Error';
  latency: string;
  lastSync: string;
  uptime: number;
  encryption: string;
  tlsVersion: string;
  healthCheckedAt?: string;
  errorMessage?: string;
}

interface NetworkStats {
  network: {
    totalPartners: number;
    connected: number;
    syncing: number;
    disconnected: number;
    averageLatency: number;
    uptime: number;
    encryption: string;
    tlsVersion: string;
  };
  exchanges: {
    total30Days: number;
    completed: number;
    pending: number;
    failed: number;
    today: number;
  };
}

interface DataExchange {
  id: number;
  exchangeId: string;
  partner: {
    id: number;
    name: string;
    code: string;
    type: string;
  };
  case?: {
    id: number;
    number: string;
    title: string;
  };
  type: string;
  direction: 'outbound' | 'inbound';
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  initiatedBy: {
    id: number;
    name: string;
  };
  initiatedAt: string;
  completedAt?: string;
  errorDetails?: string;
}

export function PartnerInteroperabilityPage() {
  useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);

  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [exchanges, setExchanges] = useState<DataExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [syncingPartner, setSyncingPartner] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'exchanges'>('overview');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [partnersRes, statsRes, exchangesRes] = await Promise.all([
        partnersApi.getPartners(),
        partnersApi.getPartnerStats(),
        partnersApi.getDataExchanges({ limit: 10 })
      ]);

      if (partnersRes.success && partnersRes.data && Array.isArray(partnersRes.data)) {
        setPartners(partnersRes.data);
      }

      if (statsRes.success && statsRes.data && typeof statsRes.data === 'object') {
        setStats(statsRes.data as NetworkStats);
      }

      if (exchangesRes.success && exchangesRes.data && Array.isArray(exchangesRes.data)) {
        setExchanges(exchangesRes.data);
      }


    } catch (err) {
      console.error('Error fetching partner data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load partner data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSync = async (partnerId: number) => {
    try {
      setSyncingPartner(partnerId);
      await partnersApi.triggerSync(partnerId);
      
      // Refresh data after sync
      setTimeout(() => {
        fetchData();
        setSyncingPartner(null);
      }, 2000);
    } catch (err) {
      console.error('Error triggering sync:', err);
      setSyncingPartner(null);
    }
  };

  const handleConfigure = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowConfigModal(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Connected':
        return 'success';
      case 'Syncing':
        return 'warning';
      case 'Error':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Syncing':
        return <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />;
      case 'Error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <X className="h-4 w-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <Layout title="Partner Network & Interoperability" showLogoBanner={false}>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="bg-slate-900 rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 w-full md:w-1/2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-20 w-24" />
                <Skeleton className="h-20 w-24" />
              </div>
            </div>
          </div>

          {/* Partners Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-24" />
                      <div className="flex gap-4 mt-3">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-7 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Security Protocols Skeleton */}
          <Card>
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Partner Network & Interoperability" showLogoBanner={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
          <h2 className="text-xl font-semibold text-slate-900">Failed to Load Partner Data</h2>
          <p className="text-slate-500 max-w-md text-center">{error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Partner Network & Interoperability" showLogoBanner={false}>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="h-4 w-4 inline mr-2" />
            Network Overview
          </button>
          <button
            onClick={() => setActiveTab('exchanges')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'exchanges'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="h-4 w-4 inline mr-2" />
            Data Exchanges
            {exchanges.filter(e => e.status === 'Pending').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                {exchanges.filter(e => e.status === 'Pending').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
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
                  <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      {stats?.network?.connected || 0} of {stats?.network?.totalPartners || 0} partners online
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Last updated: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <div className="text-2xl font-bold text-green-400">
                      {Number(stats?.network?.uptime || 99.99).toFixed(2)}%
                    </div>

                    <div className="text-xs text-slate-400">Uptime</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <div className="text-2xl font-bold text-blue-400">
                      {stats?.network?.encryption || 'AES-256'}
                    </div>
                    <div className="text-xs text-slate-400">Encryption</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <div className="text-2xl font-bold text-purple-400">
                      {stats?.exchanges?.today || 0}
                    </div>
                    <div className="text-xs text-slate-400">Exchanges Today</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {stats?.network?.connected || 0}
                    </p>
                    <p className="text-xs text-slate-500">Connected</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {stats?.network?.syncing || 0}
                    </p>
                    <p className="text-xs text-slate-500">Syncing</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {stats?.network?.averageLatency || 0}ms
                    </p>
                    <p className="text-xs text-slate-500">Avg Latency</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {stats?.exchanges?.total30Days || 0}
                    </p>
                    <p className="text-xs text-slate-500">30-Day Exchanges</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Partner Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partners.map((partner) => (
                <Card key={partner.id} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
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
                            <Clock className="h-3 w-3" /> {partner.lastSync}
                          </span>
                        </div>
                        
                        {partner.errorMessage && (
                          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {partner.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(partner.status)}
                        <Badge variant={getStatusVariant(partner.status)}>
                          {partner.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-7"
                          onClick={() => handleConfigure(partner)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-7"
                          onClick={() => handleSync(partner.id)}
                          disabled={syncingPartner === partner.id}
                        >
                          <RefreshCw className={`h-3 w-3 ${syncingPartner === partner.id ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Security & Compliance */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-slate-700" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Security Protocols
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-slate-700">
                      End-to-End Encryption (TLS {stats?.network?.tlsVersion || '1.3'})
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
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-slate-700">
                      Data Integrity Verification
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">Active</span>
                </div>
              </div>
            </Card>
          </>
        ) : (
          /* Data Exchanges Tab */
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-slate-700" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Data Exchanges
                </h3>
              </div>
              <Button onClick={() => setShowExchangeModal(true)}>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                New Exchange
              </Button>
            </div>

            {exchanges.length === 0 ? (
              <div className="text-center py-12">
                <ArrowRightLeft className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Data Exchanges Yet</h3>
                <p className="text-slate-500 mb-4">Start exchanging data with partner agencies</p>
                <Button onClick={() => setShowExchangeModal(true)}>
                  Initiate Exchange
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {exchanges.map((exchange) => (
                  <div 
                    key={exchange.id} 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        exchange.direction === 'outbound' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <ArrowRightLeft className={`h-4 w-4 ${
                          exchange.direction === 'outbound' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">
                            {exchange.type}
                          </p>
                          <Badge variant={
                            exchange.status === 'Completed' ? 'success' :
                            exchange.status === 'Pending' ? 'warning' :
                            exchange.status === 'Failed' ? 'danger' : 'default'
                          }>
                            {exchange.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          To: {exchange.partner.name} • By: {exchange.initiatedBy.name}
                        </p>
                        {exchange.case && (
                          <p className="text-xs text-slate-400">
                            Case: {exchange.case.number}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {new Date(exchange.initiatedAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        {exchange.exchangeId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Configuration Modal */}
        {showConfigModal && selectedPartner && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Configure {selectedPartner.name}
                </h3>
                <button 
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Agency Code</label>
                  <p className="text-sm text-slate-900 font-mono bg-slate-100 p-2 rounded">
                    {selectedPartner.code}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <p className="text-sm text-slate-900">{selectedPartner.type}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedPartner.status)}
                    <span className="text-sm text-slate-900">{selectedPartner.status}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Connection Metrics</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-500">Latency</p>
                      <p className="text-sm font-medium text-slate-900">{selectedPartner.latency}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-500">Uptime</p>
                      <p className="text-sm font-medium text-slate-900">{selectedPartner.uptime}%</p>
                    </div>
                  </div>
                </div>
                
                {selectedPartner.contact.email && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Contact Email</label>
                    <p className="text-sm text-slate-900">{selectedPartner.contact.email}</p>
                  </div>
                )}
                
                {selectedPartner.description && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <p className="text-sm text-slate-600">{selectedPartner.description}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowConfigModal(false)}
                >
                  Close
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    handleSync(selectedPartner.id);
                    setShowConfigModal(false);
                  }}
                  disabled={syncingPartner === selectedPartner.id}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncingPartner === selectedPartner.id ? 'animate-spin' : ''}`} />
                  Sync Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* New Exchange Modal */}
        {showExchangeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Initiate Data Exchange
                </h3>
                <button 
                  onClick={() => setShowExchangeModal(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              
              <p className="text-sm text-slate-500 mb-4">
                Select a partner agency and exchange type to initiate a secure data transfer.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Partner Agency</label>
                <select className="w-full mt-1 p-2 border border-slate-300 rounded-md text-sm" title="Select partner agency">
                    <option value="">Select a partner...</option>

                    {partners.filter(p => p.status === 'Connected').map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name} ({partner.type})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Exchange Type</label>
                <select className="w-full mt-1 p-2 border border-slate-300 rounded-md text-sm" title="Select exchange type">
                    <option value="">Select type...</option>

                    <option value="Warrant Request">Warrant Request</option>
                    <option value="Prisoner Remand">Prisoner Remand</option>
                    <option value="Evidence Transfer">Evidence Transfer</option>
                    <option value="Case Data">Case Data</option>
                    <option value="Judgment">Judgment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Direction</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="direction" value="outbound" defaultChecked />
                      <span className="text-sm text-slate-700">Send (Outbound)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="direction" value="inbound" />
                      <span className="text-sm text-slate-700">Receive (Inbound)</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowExchangeModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    // TODO: Implement exchange creation
                    setShowExchangeModal(false);
                  }}
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Initiate Exchange
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
