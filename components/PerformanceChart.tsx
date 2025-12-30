'use client'

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useTheme } from '@/lib/theme-context'

interface PerformanceChartProps {
  data: Array<{ date: string; completed: number; total: number; percentage: number }>
  type?: 'line' | 'area' | 'bar'
  height?: number
  colors?: string[]
}

export function PerformanceChart({ data, type = 'area', height = 250, colors: customColors }: PerformanceChartProps) {
  const { theme } = useTheme()
  
  const themeColors = {
    discipline: { primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B' },
    struggle: { primary: '#EF4444', secondary: '#F59E0B', accent: '#F97316' },
    performance: { primary: '#10B981', secondary: '#3B82F6', accent: '#06B6D4' },
    warrior: { primary: '#8B5CF6', secondary: '#EC4899', accent: '#F59E0B' },
  }

  const colors = customColors ? { primary: customColors[0] || '#3B82F6', secondary: customColors[1] || '#8b5cf6' } : themeColors[theme]

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    completion: item.percentage,
    completed: item.completed,
    total: item.total,
  }))

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="completion"
              stroke={colors.primary}
              strokeWidth={2}
              dot={{ fill: colors.primary, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : type === 'bar' ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar dataKey="completion" fill={colors.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="completion"
              stroke={colors.primary}
              strokeWidth={2}
              fill="url(#colorCompletion)"
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
