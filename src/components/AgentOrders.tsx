/**
 * Agent Recent Orders Component (Realtime)
 * Displays recent orders made through AI agent with live updates
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-client'

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  contact_info: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  conversation_id: string | null;
}

export default function AgentOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const todayIso = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [])

  useEffect(() => {
    let isMounted = true
    const supabase = supabaseBrowser

    async function fetchInitial() {
      setLoading(true)
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, status, total_amount, created_at, contact_info, items, conversation_id')
        .gte('created_at', todayIso)
        .order('created_at', { ascending: false })
        .limit(10)
      if (isMounted) {
        setOrders((data as OrderRow[]) || [])
        setLoading(false)
      }
    }

    fetchInitial()

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const row = payload.new as OrderRow | undefined
        if (!row || row.created_at < todayIso) return
        setOrders((prev) => {
          // insert or update head, keep max 10
          const without = prev.filter(o => o.id !== row.id)
          const next = [row, ...without].sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0, 10)
          return next
        })
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [todayIso])

  return (
    <div className="space-y-6">
      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            📦 Recent Orders
          </h2>
          <span className="text-sm text-gray-500">
            {loading ? 'Loading…' : `Today: ${orders.length}`}
          </span>
        </div>

        <div className="space-y-3">
          {!loading && orders && orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No orders yet today</p>
              <p className="text-sm mt-1">Orders will appear here as they come in</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          ⚡ Quick Actions
        </h2>
        <div className="space-y-2">
          <ActionButton 
            label="View All Orders" 
            href="/admin/agent/orders"
            icon="📋"
          />
          <ActionButton 
            label="Export Analytics" 
            href="/admin/agent/export"
            icon="📊"
          />
          <ActionButton 
            label="Agent Settings" 
            href="/admin/agent/settings"
            icon="⚙️"
          />
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: OrderRow }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    delivering: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const contactInfo = order.contact_info as { name?: string; phone?: string } | null | undefined;
  const firstItem = (order.items as Array<Record<string, unknown>>)?.[0] as { product_name?: string } | undefined;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900">{String(order.order_number)}</p>
          <p className="text-sm text-gray-500">
            {contactInfo?.name || 'Unknown'} · {contactInfo?.phone || ''}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusColors[order.status as keyof typeof statusColors] || statusColors.pending
        }`}>
          {order.status}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 mb-2">
        {String(firstItem?.product_name || '')} {order.items?.length > 1 && `+${order.items.length - 1} more`}
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {new Date(order.created_at).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
        <span className="font-semibold text-[#536C4A]">
          ฿{Number(order.total_amount)}
        </span>
      </div>
    </div>
  );
}

function ActionButton({ label, href, icon }: { label: string; href: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}

