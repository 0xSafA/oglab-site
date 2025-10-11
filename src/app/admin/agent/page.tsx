/**
 * Admin Agent Dashboard
 * Analytics, monitoring, and configuration for AI Agent
 */

import { Suspense } from 'react';
import AgentAnalytics from '@/components/AgentAnalytics';
import AgentStats from '@/components/AgentStats';
import AgentOrders from '@/components/AgentOrders';

export const metadata = {
  title: 'AI Agent Dashboard | OG Lab Admin',
  description: 'AI Agent analytics, monitoring, and configuration',
};

export default function AgentDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agent Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor performance, analytics, and manage AI agent configuration
          </p>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 text-sm bg-[#536C4A] text-white rounded-lg hover:bg-[#445839] transition-colors">
            Configure Agent
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <AgentStats />
      </Suspense>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Charts & Metrics */}
        <Suspense fallback={<AnalyticsLoadingSkeleton />}>
          <AgentAnalytics />
        </Suspense>

        {/* Right Column: Recent Orders & Activity */}
        <Suspense fallback={<OrdersLoadingSkeleton />}>
          <AgentOrders />
        </Suspense>
      </div>

      {/* Configuration Section (Phase 2) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Agent Configuration
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Coming soon: Adjust system prompts, personality, knowledge base, and more
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ConfigCard 
            title="System Prompt" 
            description="Customize AI personality and behavior"
            status="Phase 2"
          />
          <ConfigCard 
            title="Knowledge Base" 
            description="Manage FAQ and semantic cache"
            status="Phase 2"
          />
          <ConfigCard 
            title="Integrations" 
            description="Connect payment, accounting, and more"
            status="Phase 2"
          />
        </div>
      </div>
    </div>
  );
}

// Loading Skeletons
function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

function OrdersLoadingSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}

// Config Card Component
function ConfigCard({ 
  title, 
  description, 
  status 
}: { 
  title: string; 
  description: string; 
  status: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
          {status}
        </span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

