import React from 'react';
import { Check, Clock, AlertCircle, Truck, Package } from 'lucide-react';
import { Order, OrderEvent, OrderStatus, ORDER_STATUS_LABELS } from '../types';

const PRIMARY_LIFECYCLE: OrderStatus[] = [
  'ORDER_PLACED',
  'ORDER_CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const EXCEPTION_STATES: OrderStatus[] = [
  'CANCELLATION_REQUESTED',
  'CANCELLED',
  'DELIVERY_ATTEMPT_FAILED',
  'DELAYED',
  'RETURN_REQUESTED',
  'RETURN_APPROVED',
  'RETURN_PICKED_UP',
  'REFUND_PROCESSING',
  'REFUNDED',
  'RETURNED',
];

export const OrderTimeline: React.FC<{
  order: Order;
  events: OrderEvent[];
}> = ({ order, events }) => {
  const isException = EXCEPTION_STATES.includes(order.status);
  const currentPrimaryIdx = PRIMARY_LIFECYCLE.indexOf(order.status);

  // Determine highest reached primary stage from events if order is currently in an exception state
  const highestReachedIdx = React.useMemo(() => {
    if (currentPrimaryIdx >= 0) return currentPrimaryIdx;
    let maxIdx = 0;
    for (const ev of events) {
      const idx = PRIMARY_LIFECYCLE.indexOf(ev.status);
      if (idx > maxIdx) maxIdx = idx;
    }
    return maxIdx;
  }, [currentPrimaryIdx, events]);

  const sortedEvents = [...events].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return (
    <div className="space-y-8">
      {/* Store-Managed Tracking Transparency Notice */}
      <div className="p-4 bg-[#F3EFEA] border border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#57534E]">
        <div className="flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-[#8C6239] shrink-0" />
          <span>
            {order.courierName
              ? `Dispatched via ${order.courierName} · AWB / Tracking ID: ${order.trackingNumber || 'Assigned'}`
              : 'Fulfillment & tracking updates are verified and recorded directly by Atelier Vanguard Concierge.'}
          </span>
        </div>
        {order.trackingUrl && (
          <a
            href={order.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#141413] underline whitespace-nowrap"
          >
            Open Courier Link →
          </a>
        )}
      </div>

      {/* Horizontal / Vertical 7-Step Lifecycle Stepper */}
      <div className="bg-white border border-[#E5E0D8] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C]">
              Current Fulfillment Stage
            </p>
            <h3 className="font-serif-display text-2xl font-bold text-[#141413] mt-0.5">
              {ORDER_STATUS_LABELS[order.status]}
            </h3>
          </div>
          {order.estimatedDelivery && order.status !== 'CANCELLED' && (
            <div className="text-right">
              <p className="text-xs text-[#78716C]">Estimated Delivery</p>
              <p className="text-xs font-mono-tabular font-semibold text-[#141413]">
                {order.estimatedDelivery}
              </p>
            </div>
          )}
        </div>

        {/* 7 Primary Stages */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {PRIMARY_LIFECYCLE.map((stage, idx) => {
            const isCompleted = idx < highestReachedIdx || order.status === 'DELIVERED';
            const isCurrent = !isException && idx === currentPrimaryIdx;
            const matchingEvent = events.find((e) => e.status === stage);

            return (
              <div
                key={stage}
                className={`p-3 border transition-colors ${
                  isCurrent
                    ? 'border-[#8C6239] bg-[#FAF8F5]'
                    : isCompleted
                    ? 'border-[#E5E0D8] bg-[#FAF8F5]/60'
                    : 'border-[#F3EFEA] bg-white opacity-55'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-5 h-5 flex items-center justify-center text-[11px] font-mono-tabular font-bold ${
                      isCompleted || isCurrent
                        ? 'bg-[#141413] text-[#FAF8F5]'
                        : 'bg-[#E5E0D8] text-[#78716C]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#141413]">
                    {ORDER_STATUS_LABELS[stage]}
                  </span>
                </div>
                {matchingEvent ? (
                  <p className="text-[11px] font-mono-tabular text-[#78716C]">
                    {new Date(matchingEvent.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                ) : (
                  <p className="text-[11px] text-[#A8A29E]">Pending</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Exception State Banner if active */}
        {isException && (
          <div className="mt-5 p-4 bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold uppercase tracking-wider">
                Exception / Post-Order Stage: {ORDER_STATUS_LABELS[order.status]}
              </p>
              <p className="mt-1 text-amber-900">
                This order is currently in {ORDER_STATUS_LABELS[order.status]} status. Review the chronological audit log below for full details.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chronological Vertical Event Timeline */}
      <div className="bg-white border border-[#E5E0D8] p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#ECE7DF] pb-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#141413]">
            Verified Chronological Shipment Log
          </h4>
          <span className="text-xs font-mono-tabular text-[#78716C]">
            {sortedEvents.length} Event(s) Recorded
          </span>
        </div>

        {sortedEvents.length === 0 ? (
          <p className="text-xs text-[#78716C]">
            Initial order event recorded at checkout. Further updates will appear here as your package moves through fulfillment.
          </p>
        ) : (
          <div className="relative pl-6 border-l border-[#D6D3D1] space-y-6">
            {sortedEvents.map((ev, index) => (
              <div key={ev.id} className="relative">
                <span
                  className={`absolute -left-[29px] top-1 w-3.5 h-3.5 flex items-center justify-center border ${
                    index === 0
                      ? 'bg-[#8C6239] border-[#8C6239]'
                      : 'bg-[#FAF8F5] border-[#78716C]'
                  }`}
                />
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#141413]">
                    {ORDER_STATUS_LABELS[ev.status] || ev.status}
                  </span>
                  <span className="text-xs font-mono-tabular text-[#78716C] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ev.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <p className="text-sm text-[#292524] mt-1 leading-relaxed">
                  {ev.message}
                </p>
                <p className="text-[11px] text-[#78716C] mt-1 flex items-center gap-2">
                  <Package className="w-3 h-3" />
                  <span>
                    {ev.location ? `${ev.location} · ` : ''}Updated by {ev.updatedBy}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
