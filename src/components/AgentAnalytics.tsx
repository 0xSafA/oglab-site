/**
 * Agent Analytics Component
 * Detailed analytics and charts
 */

export default async function AgentAnalytics() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/analytics?metric=all`,
    { cache: 'no-store' }
  );
  
  const data = await response.json();

  return (
    <div className="space-y-6">
      {/* AI Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          🤖 AI Performance
        </h2>
        <div className="space-y-4">
          <MetricRow 
            label="Total Messages" 
            value={data.aiPerformance?.totalMessages || 0}
            icon="💬"
          />
          <MetricRow 
            label="Avg Response Time" 
            value={`${data.aiPerformance?.avgResponseTime || 0}ms`}
            icon="⚡"
            status={data.aiPerformance?.avgResponseTime < 1500 ? 'good' : 'warning'}
          />
          <MetricRow 
            label="Error Rate" 
            value={`${data.aiPerformance?.errorRate || 0}%`}
            icon="🔴"
            status={data.aiPerformance?.errorRate < 1 ? 'good' : 'error'}
          />
          <MetricRow 
            label="Satisfaction Score" 
            value={`${data.aiPerformance?.satisfactionScore || 0}/5`}
            icon="⭐"
            status="good"
          />
        </div>
      </div>

      {/* User Engagement */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          👥 User Engagement
        </h2>
        <div className="space-y-4">
          <MetricRow 
            label="Daily Active Users" 
            value={data.userEngagement?.dailyActiveUsers || 0}
            icon="📊"
          />
          <MetricRow 
            label="Weekly Active Users" 
            value={data.userEngagement?.weeklyActiveUsers || 0}
            icon="📈"
          />
          <MetricRow 
            label="Avg Session Duration" 
            value={`${Math.floor((data.userEngagement?.avgSessionDuration || 0) / 60)}m`}
            icon="⏱️"
          />
          <MetricRow 
            label="Avg Messages/Session" 
            value={data.userEngagement?.avgMessagesPerSession?.toFixed(1) || 0}
            icon="💬"
          />
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          🏆 Top Products (7 days)
        </h2>
        <div className="space-y-3">
          {data.topProducts?.slice(0, 5).map((product: Record<string, unknown>, index: number) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                <div>
                  <p className="font-medium text-gray-900">{product.product_name}</p>
                  <p className="text-sm text-gray-500">
                    {product.order_count} orders · {product.total_quantity}g
                  </p>
                </div>
              </div>
              <span className="font-semibold text-[#536C4A]">
                ฿{product.total_revenue}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricRow({ 
  label, 
  value, 
  icon, 
  status = 'neutral' 
}: {
  label: string;
  value: string | number;
  icon: string;
  status?: 'good' | 'warning' | 'error' | 'neutral';
}) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    neutral: 'text-gray-900',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${statusColors[status]}`}>
        {value}
      </span>
    </div>
  );
}

