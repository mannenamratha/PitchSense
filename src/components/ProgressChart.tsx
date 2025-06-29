import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface ProgressDataPoint {
  date: string;
  overallScore: number;
  clarity: number;
  tone: number;
  pacing: number;
  structure: number;
  pitchNumber: number;
  language: string;
}

interface LanguageData {
  language: string;
  count: number;
  averageScore: number;
  color: string;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
  chartType: 'line' | 'area' | 'bar';
  metric: 'overall' | 'clarity' | 'tone' | 'pacing' | 'structure';
  className?: string;
}

interface LanguageChartProps {
  data: LanguageData[];
  className?: string;
}

interface TrendAnalysisProps {
  data: ProgressDataPoint[];
  className?: string;
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];

const ProgressChart: React.FC<ProgressChartProps> = ({ 
  data, 
  chartType, 
  metric, 
  className = '' 
}) => {
  const getMetricKey = () => {
    switch (metric) {
      case 'clarity': return 'clarity';
      case 'tone': return 'tone';
      case 'pacing': return 'pacing';
      case 'structure': return 'structure';
      default: return 'overallScore';
    }
  };

  const getMetricColor = () => {
    switch (metric) {
      case 'clarity': return '#3B82F6';
      case 'tone': return '#10B981';
      case 'pacing': return '#F59E0B';
      case 'structure': return '#EF4444';
      default: return '#8B5CF6';
    }
  };

  const getMetricName = () => {
    switch (metric) {
      case 'clarity': return 'Clarity Score';
      case 'tone': return 'Tone Score';
      case 'pacing': return 'Pacing Score';
      case 'structure': return 'Structure Score';
      default: return 'Overall Score';
    }
  };

  const formatTooltip = (value: any, name: string, props: any) => {
    return [
      `${value}/10`,
      getMetricName()
    ];
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderChart = () => {
    const metricKey = getMetricKey();
    const color = getMetricColor();

    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              domain={[0, 10]} 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey={metricKey}
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              domain={[0, 10]} 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey={metricKey} 
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      default: // line
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              domain={[0, 10]} 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey={metricKey}
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Progress Data</h3>
          <p className="text-gray-600">Complete more pitches to see your progress chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{getMetricName()} Progress</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity className="w-4 h-4" />
          <span>{data.length} pitches</span>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const LanguageChart: React.FC<LanguageChartProps> = ({ data, className = '' }) => {
  const renderCustomLabel = (entry: any) => {
    return `${entry.language}: ${entry.count}`;
  };

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PieChartIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Language Data</h3>
          <p className="text-gray-600">Practice in different languages to see distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Language Distribution</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <PieChartIcon className="w-4 h-4" />
          <span>{data.reduce((sum, item) => sum + item.count, 0)} total</span>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, name: string, props: any) => [
                `${value} pitches (${props.payload.averageScore.toFixed(1)} avg score)`,
                props.payload.language
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ data, className = '' }) => {
  const calculateTrend = (metric: string) => {
    if (data.length < 2) return { trend: 0, direction: 'stable' as const };
    
    const recent = data.slice(0, Math.min(5, Math.floor(data.length / 2)));
    const previous = data.slice(Math.min(5, Math.floor(data.length / 2)));
    
    const recentAvg = recent.reduce((sum, item) => sum + (item as any)[metric], 0) / recent.length;
    const previousAvg = previous.reduce((sum, item) => sum + (item as any)[metric], 0) / previous.length;
    
    const trend = recentAvg - previousAvg;
    const direction = trend > 0.5 ? 'up' : trend < -0.5 ? 'down' : 'stable';
    
    return { trend: Math.round(trend * 10) / 10, direction };
  };

  const metrics = [
    { key: 'overallScore', name: 'Overall', color: 'purple' },
    { key: 'clarity', name: 'Clarity', color: 'blue' },
    { key: 'tone', name: 'Tone', color: 'green' },
    { key: 'pacing', name: 'Pacing', color: 'yellow' },
    { key: 'structure', name: 'Structure', color: 'red' }
  ];

  const getColorClasses = (color: string, direction: string) => {
    const baseColors = {
      purple: direction === 'up' ? 'text-purple-600 bg-purple-100' : direction === 'down' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 bg-gray-100',
      blue: direction === 'up' ? 'text-blue-600 bg-blue-100' : direction === 'down' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-100',
      green: direction === 'up' ? 'text-green-600 bg-green-100' : direction === 'down' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-100',
      yellow: direction === 'up' ? 'text-yellow-600 bg-yellow-100' : direction === 'down' ? 'text-yellow-600 bg-yellow-50' : 'text-gray-600 bg-gray-100',
      red: direction === 'up' ? 'text-red-600 bg-red-100' : direction === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-100'
    };
    return baseColors[color as keyof typeof baseColors];
  };

  if (data.length < 2) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Insufficient Data</h3>
          <p className="text-gray-600">Complete more pitches to see trend analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>Recent vs Previous</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {metrics.map(({ key, name, color }) => {
          const { trend, direction } = calculateTrend(key);
          const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Activity;
          
          return (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(color, direction)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{name}</h4>
                  <p className="text-sm text-gray-600">
                    {direction === 'up' ? 'Improving' : direction === 'down' ? 'Declining' : 'Stable'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  direction === 'up' ? 'text-green-600' : 
                  direction === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {direction === 'up' ? '+' : ''}{trend}
                </div>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { ProgressChart, LanguageChart, TrendAnalysis };
export type { ProgressDataPoint, LanguageData };