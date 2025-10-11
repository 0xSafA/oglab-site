/**
 * Agent Quick Stats Component
 * Displays key metrics at a glance
 */

export default async function AgentStats() {
  // Fetch analytics data
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/analytics?metric=all`,
    { cache: 'no-store' }
  );
  
  const data = await response.json();
  
  const stats = [
    {
      label: 'Today\'s Orders',
      value: data.today?.total_orders || 0,
      change: '+12%',
      trend: 'up' as const,
      icon: '🛍️',
    },
    {
      label: 'Revenue Today',
      value: `฿${data.today?.total_revenue || 0}`,
      change: '+8%',
      trend: 'up' as const,
      icon: '💰',
    },
    {
      label: 'Conversations',
      value: data.today?.total_conversations || 0,
      change: '+15%',
      trend: 'up' as const,
      icon: '💬',
    },
    {
      label: 'Conversion Rate',
      value: `${data.today?.conversion_rate || 0}%`,
      change: '+3%',
      trend: 'up' as const,
      icon: '📈',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  change, 
  trend, 
  icon 
}: {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

