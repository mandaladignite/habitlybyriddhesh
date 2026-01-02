'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Shield, 
  Edit3,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  BarChart3
} from 'lucide-react'
import { IAdaptiveSystem, ISystemAdaptation } from '@/types/v2-models'

interface SystemsViewProps {
  systems?: IAdaptiveSystem[]
  onSystemEdit?: (systemId: string) => void
  onSystemToggle?: (systemId: string, autoAdapt: boolean) => void
  onSystemLock?: (systemId: string, locked: boolean) => void
}

export default function SystemsView({ 
  systems, 
  onSystemEdit, 
  onSystemToggle, 
  onSystemLock 
}: SystemsViewProps) {
  const [selectedSystem, setSelectedSystem] = useState<IAdaptiveSystem | null>(null)
  const [filter, setFilter] = useState<'all' | 'high-performing' | 'needs-attention' | 'locked'>('all')

  const filteredSystems = systems?.filter(system => {
    switch (filter) {
      case 'high-performing':
        return system.effectivenessScore > 70 && system.frictionCoefficient < 50
      case 'needs-attention':
        return system.effectivenessScore < 50 || system.frictionCoefficient > 70
      case 'locked':
        return system.locked
      default:
        return true
    }
  }) || []

  const getSystemStatus = (system: IAdaptiveSystem) => {
    if (system.locked) return { color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30', label: 'Locked' }
    if (system.effectivenessScore > 70 && system.frictionCoefficient < 50) {
      return { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', label: 'Optimal' }
    }
    if (system.effectivenessScore < 50 || system.frictionCoefficient > 70) {
      return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', label: 'Needs Attention' }
    }
    return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', label: 'Moderate' }
  }

  const getSkipProbability = (system: IAdaptiveSystem) => {
    // Calculate skip probability based on friction and effectiveness
    const frictionWeight = system.frictionCoefficient * 0.6
    const effectivenessWeight = (100 - system.effectivenessScore) * 0.4
    return Math.min(100, Math.round(frictionWeight + effectivenessWeight))
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
          <h1 className="text-4xl font-bold mb-2">Systems</h1>
          <p className="text-slate-400">Optimize your execution systems</p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8"
        >
          {[
            { key: 'all', label: 'All Systems' },
            { key: 'high-performing', label: 'High Performing' },
            { key: 'needs-attention', label: 'Needs Attention' },
            { key: 'locked', label: 'Locked' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Systems Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSystems.map((system, index) => {
            const status = getSystemStatus(system)
            const skipProbability = getSkipProbability(system)
            const lastAdaptation = system.adaptationHistory[system.adaptationHistory.length - 1]
            
            return (
              <motion.div
                key={system._id.toString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border cursor-pointer transition-all hover:shadow-lg ${status.border}`}
                onClick={() => setSelectedSystem(system)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{system.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs ${status.bg} ${status.color} ${status.border}`}>
                        {status.label}
                      </div>
                      {system.locked && <Lock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{system.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="capitalize">{system.type}</span>
                      <span>•</span>
                      <span>Auto-adapt: {system.autoAdapt ? 'On' : 'Off'}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-slate-400">Effectiveness</span>
                    </div>
                    <div className="text-xl font-bold text-green-400">{system.effectivenessScore}%</div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-slate-400">Friction</span>
                    </div>
                    <div className="text-xl font-bold text-yellow-400">{system.frictionCoefficient}%</div>
                  </div>
                </div>

                {/* Skip Probability Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Skip Risk</span>
                    <span className={`text-xs font-medium ${
                      skipProbability > 70 ? 'text-red-400' :
                      skipProbability > 40 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {skipProbability}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        skipProbability > 70 ? 'bg-red-500' :
                        skipProbability > 40 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${skipProbability}%` }}
                    />
                  </div>
                </div>

                {/* Last Adaptation */}
                {lastAdaptation && (
                  <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-slate-400">Last Adaptation</span>
                    </div>
                    <div className="text-xs text-slate-300">{lastAdaptation.change}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(lastAdaptation.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSystemEdit?.(system._id.toString())
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSystemToggle?.(system._id.toString(), !system.autoAdapt)
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm ${
                      system.autoAdapt 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {system.autoAdapt ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {system.autoAdapt ? 'Auto' : 'Manual'}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSystemLock?.(system._id.toString(), !system.locked)
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      system.locked 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-slate-600 hover:bg-slate-500 text-white'
                    }`}
                  >
                    {system.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredSystems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Settings className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold mb-2">No systems found</h3>
            <p className="text-slate-400">
              {filter === 'all' ? 'Start by creating your first execution system' : 
               `No systems in the ${filter} category`}
            </p>
          </motion.div>
        )}

        {/* System Detail Modal */}
        {selectedSystem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setSelectedSystem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedSystem.name}</h2>
                  <p className="text-slate-400">{selectedSystem.description}</p>
                </div>
                <button
                  onClick={() => setSelectedSystem(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium">Performance Metrics</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Effectiveness</span>
                      <span className="text-sm font-medium">{selectedSystem.effectivenessScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Friction</span>
                      <span className="text-sm font-medium">{selectedSystem.frictionCoefficient}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Skip Risk</span>
                      <span className="text-sm font-medium">{getSkipProbability(selectedSystem)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium">Adaptation Settings</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Auto-Adapt</span>
                      <span className="text-sm font-medium">{selectedSystem.autoAdapt ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Locked</span>
                      <span className="text-sm font-medium">{selectedSystem.locked ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Total Adaptations</span>
                      <span className="text-sm font-medium">{selectedSystem.adaptationHistory.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium">Failure Conditions</span>
                  </div>
                  <div className="space-y-2">
                    {selectedSystem.failureConditions.slice(0, 3).map((condition, index) => (
                      <div key={index} className="text-xs text-slate-400">
                        {condition.pattern}
                      </div>
                    ))}
                    {selectedSystem.failureConditions.length === 0 && (
                      <div className="text-xs text-slate-500">No failure conditions set</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Adaptation History */}
              {selectedSystem.adaptationHistory.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Adaptation History</h3>
                  <div className="space-y-2">
                    {selectedSystem.adaptationHistory.slice(-5).reverse().map((adaptation, index) => (
                      <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium">{adaptation.change}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            adaptation.impact > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {adaptation.impact > 0 ? '+' : ''}{adaptation.impact}%
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Trigger: {adaptation.trigger} • {new Date(adaptation.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedSystem(null)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
