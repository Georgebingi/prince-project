import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, PenTool, FileText, Check, X } from 'lucide-react';
import { useCases, Order } from '../contexts/CasesContext';
export function SignOrdersPage() {
  const navigate = useNavigate();
  const { orders, signOrder } = useCases();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  // Filter only pending (draft) orders
  const pendingOrders = orders.filter((o) => o.status === 'Draft');
  const handleSign = (id: number) => {
    if (confirm('Apply digital signature to this order?')) {
      signOrder(id);
      setSelectedOrder(null);
      alert('Order signed and dispatched successfully!');
    }
  };
  return (
    <Layout title="Sign Orders" showLogoBanner={false}>
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
              Orders Awaiting Signature
            </h2>
            <p className="text-sm text-slate-500">
              Review and digitally sign court orders
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingOrders.length > 0 ?
            pendingOrders.map((order) =>
            <div
              key={order.id}
              className="p-6 hover:bg-slate-50 transition-colors">

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary">Draft</Badge>
                        <span className="text-sm font-medium text-slate-600">
                          {order.caseId}
                        </span>
                        <span className="text-xs text-slate-400">
                          Drafted: {order.date}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {order.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Prepared by: {order.draftedBy}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}>

                        <FileText className="h-4 w-4 mr-2" />
                        Review Draft
                      </Button>
                      <Button size="sm" onClick={() => handleSign(order.id)}>
                        <PenTool className="h-4 w-4 mr-2" />
                        Sign Order
                      </Button>
                    </div>
                  </div>
                </div>
            ) :

            <div className="p-12 text-center text-slate-500">
                <Check className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <h3 className="text-lg font-medium text-slate-900">
                  No Pending Orders
                </h3>
                <p>You have signed all pending orders.</p>
              </div>
            }
          </div>
        </Card>
      </div>

      {/* Review Draft Modal */}
      {selectedOrder &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                Review Draft: {selectedOrder.title}
              </h3>
              <button
              onClick={() => setSelectedOrder(null)}
              className="p-1 hover:bg-slate-100 rounded-full">

                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-8 bg-slate-50 overflow-y-auto flex-1">
              <div className="bg-white p-8 shadow-sm border border-slate-200 min-h-[400px] max-w-2xl mx-auto">
                <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
                  <h2 className="text-xl font-bold uppercase tracking-wide">
                    In The High Court of Kaduna State
                  </h2>
                  <p className="text-sm mt-2 font-mono">
                    {selectedOrder.caseId}
                  </p>
                </div>

                <h3 className="text-center font-bold underline mb-6 uppercase">
                  {selectedOrder.title}
                </h3>

                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {selectedOrder.content ||
                  'Content not available for this draft.'}
                  </p>
                </div>

                <div className="mt-12 flex justify-end">
                  <div className="text-center border-t border-slate-400 pt-2 w-48">
                    <p className="font-serif italic text-slate-400">
                      Pending Signature
                    </p>
                    <p className="font-bold text-sm mt-1">
                      Hon. Justice Ibrahim
                    </p>
                    <p className="text-xs">Judge, High Court</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close Review
              </Button>
              <Button onClick={() => handleSign(selectedOrder.id)}>
                <PenTool className="h-4 w-4 mr-2" />
                Sign & Dispatch
              </Button>
            </div>
          </div>
        </div>
      }
    </Layout>);

}