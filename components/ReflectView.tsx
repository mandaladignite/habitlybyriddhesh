'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Calendar, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Clock,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react'
import { IInsight, IMomentumVector, IAdaptiveSystem } from '@/types/v2-models'
import { IMonthlyReflection } from '@/types/models'

interface ReflectViewProps {
  insights?: IInsight[]
  momentumVector?: IMomentumVector
  systems?: IAdaptiveSystem[]
  monthlyReflections?: IMonthlyReflection[]
  onInsightAction?: (insightId: string, action: 'dismiss' | 'act') => void
  onReflectionSave?: (content: string) => void
}

export default function ReflectView({ 
  insights, 
  momentumVector, 
  systems, 
  monthlyReflections,
  onInsightAction,
  onReflectionSave
}: ReflectViewProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'insights' | 'evolution'>('weekly')
  const [currentWeek, setCurrentWeek] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(0)
  const [reflectionText, setReflectionText] = useState('')

  const weeklyQuestions = [
    "What worked well this week?",
    "What challenges did you face?",
    "What did you learn about your execution patterns?",
    "How will you adapt your systems next week?"
  ]

  const getWeekDates = (weekOffset: number) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - (today.getDay() + 7 * weekOffset))
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return {
      start: startOfWeek,
      end: endOfWeek,
      label: `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
    }
  }

  const getMonthDates = (monthOffset: number) => {
    const today = new Date()
    const month = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
    const nextMonth = new Date(today.getFullYear(), today.getMonth() - monthOffset + 1, 0)
    
    return {
      start: month,
      end: nextMonth,
      label: month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'leverage': return <TrendingUp className="w-4 h-4" />
      case 'friction': return <Clock className="w-4 h-4" />
      case 'bias': return <Brain className="w-4 h-4" />
      case 'pattern': return <Lightbulb className="w-4 h-4" />
      case 'prediction': return <Target className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'leverage': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'friction': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'bias': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'pattern': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'prediction': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Reflect</h1>
          <p className="text-slate-400">Learn from your execution patterns</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 border-b border-slate-700"
        >
          {[
            { key: 'weekly', label: 'Weekly Review', icon: Calendar },
            { key: 'monthly', label: 'Monthly Evolution', icon: TrendingUp },
            { key: 'insights', label: 'AI Insights', icon: Brain },
            { key: 'evolution', label: 'System Evolution', icon: Lightbulb }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Weekly Review */}
        {activeTab === 'weekly' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold">{getWeekDates(currentWeek).label}</h3>
                <p className="text-sm text-slate-400">Weekly Review</p>
              </div>
              
              <button
                onClick={() => setCurrentWeek(prev => Math.max(0, prev - 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekly Questions */}
            <div className="space-y-4">
              {weeklyQuestions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
                >
                  <h4 className="text-lg font-medium mb-3">{question}</h4>
                  <textarea
                    className="w-full bg-slate-700/50 rounded-lg p-3 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                    rows={3}
                    placeholder="Reflect on your experiences..."
                  />
                </motion.div>
              ))}
            </div>

            {/* Weekly Metrics Summary */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Weekly Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">85%</div>
                  <div className="text-sm text-slate-400">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">72%</div>
                  <div className="text-sm text-slate-400">Energy Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">68%</div>
                  <div className="text-sm text-slate-400">Context Alignment</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">+12%</div>
                  <div className="text-sm text-slate-400">Momentum</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Monthly Evolution */}
        {activeTab === 'monthly' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(prev => prev + 1)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold">{getMonthDates(currentMonth).label}</h3>
                <p className="text-sm text-slate-400">Monthly Evolution</p>
              </div>
              
              <button
                onClick={() => setCurrentMonth(prev => Math.max(0, prev - 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Monthly Reflection */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Monthly Reflection</h3>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full bg-slate-700/50 rounded-lg p-4 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                rows={8}
                placeholder="What were your key insights, achievements, and challenges this month? How have your systems evolved?"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => onReflectionSave?.(reflectionText)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                >
                  Save Reflection
                </button>
                <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Evolution Timeline */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">System Evolution Timeline</h3>
              <div className="space-y-4">
                {systems?.map((system, index) => (
                  <div key={system._id.toString()} className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <div className="font-medium">{system.name}</div>
                      <div className="text-sm text-slate-400">
                        {system.adaptationHistory.length} adaptations • 
                        {system.effectivenessScore}% effectiveness
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Insights */}
        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights?.filter(insight => !insight.dismissed).map((insight, index) => (
                <motion.div
                  key={insight._id.toString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`bg-slate-800/50 rounded-xl p-6 border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{insight.title}</h3>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block mb-2 ${getInsightColor(insight.type)}`}>
                        {insight.priority} priority
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-3">{insight.description}</p>
                  
                  <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-slate-400 mb-1">Evidence</div>
                    <div className="text-sm">{insight.evidence}</div>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                    <div className="text-xs text-blue-400 mb-1">Recommended Action</div>
                    <div className="text-sm text-blue-300">{insight.recommendedAction}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => onInsightAction?.(insight._id.toString(), 'act')}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors text-sm"
                    >
                      Take Action
                    </button>
                    <button
                      onClick={() => onInsightAction?.(insight._id.toString(), 'dismiss')}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {(!insights || insights.filter(i => !i.dismissed).length === 0) && (
              <div className="text-center py-16">
                <Brain className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-semibold mb-2">No insights available</h3>
                <p className="text-slate-400">Continue executing to generate AI insights</p>
              </div>
            )}
          </motion.div>
        )}

        {/* System Evolution */}
        {activeTab === 'evolution' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Long-term System Evolution</h3>
              
              {/* Momentum Evolution */}
              {momentumVector && (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3">Momentum Evolution</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Current Direction</div>
                      <div className="text-lg font-medium capitalize">{momentumVector.direction}</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Strength</div>
                      <div className="text-lg font-medium">{momentumVector.strength}%</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Consistency</div>
                      <div className="text-lg font-medium">{momentumVector.consistencyMomentum}%</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Growth</div>
                      <div className="text-lg font-medium">{momentumVector.difficultyGrowthMomentum}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Adaptation Patterns */}
              <div>
                <h4 className="text-md font-medium mb-3">Adaptation Patterns</h4>
                <div className="space-y-3">
                  {systems?.map((system) => (
                    <div key={system._id.toString()} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{system.name}</div>
                          <div className="text-sm text-slate-400">{system.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{system.adaptationHistory.length} adaptations</div>
                          <div className="text-xs text-slate-400">Last 30 days</div>
                        </div>
                      </div>
                      
                      {system.adaptationHistory.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <div className="text-xs text-slate-400 mb-2">Recent Adaptations</div>
                          <div className="space-y-1">
                            {system.adaptationHistory.slice(-3).reverse().map((adaptation, index) => (
                              <div key={index} className="text-xs text-slate-300">
                                {adaptation.change} • {new Date(adaptation.timestamp).toLocaleDateString()}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
