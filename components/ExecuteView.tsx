'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Battery, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Target, 
  ChevronRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { IAdaptiveSystem, IExecutionQuality, ICognitiveProfile } from '@/types/v2-models'

interface ExecuteViewProps {
  systems?: IAdaptiveSystem[]
  executionQuality?: IExecutionQuality[]
  cognitiveProfile?: ICognitiveProfile
  onSystemComplete?: (systemId: string) => void
  onMicroCommit?: (systemId: string) => void
}

export default function ExecuteView({ 
  systems, 
  executionQuality, 
  cognitiveProfile,
  onSystemComplete,
  onMicroCommit 
}: ExecuteViewProps) {
  const [energyState, setEnergyState] = useState<'low' | 'medium' | 'high'>('medium')
  const [todayStack, setTodayStack] = useState<IAdaptiveSystem[]>([])
  const [completedSystems, setCompletedSystems] = useState<Set<string>>(new Set())
  const [currentSystem, setCurrentSystem] = useState<IAdaptiveSystem | null>(null)

  useEffect(() => {
    // Determine energy state based on time and profile
    const currentHour = new Date().getHours()
    if (cognitiveProfile?.energyPatterns) {
      const currentPattern = cognitiveProfile.energyPatterns.find(p => p.hour === currentHour)
      if (currentPattern) {
        setEnergyState(
          currentPattern.energyLevel > 70 ? 'high' :
          currentPattern.energyLevel > 40 ? 'medium' : 'low'
        )
      }
    }

    // Generate today's execution stack
    if (systems) {
      const prioritizedSystems = systems
        .sort((a, b) => {
          // Prioritize by effectiveness and energy alignment
          const aScore = a.effectivenessScore - (a.frictionCoefficient * 0.5)
          const bScore = b.effectivenessScore - (b.frictionCoefficient * 0.5)
          return bScore - aScore
        })
        .slice(0, 5) // Top 5 for today
      
      setTodayStack(prioritizedSystems)
      if (prioritizedSystems.length > 0 && !currentSystem) {
        setCurrentSystem(prioritizedSystems[0])
      }
    }
  }, [systems, cognitiveProfile, currentSystem])

  const handleSystemComplete = (systemId: string) => {
    setCompletedSystems(prev => new Set(prev).add(systemId))
    onSystemComplete?.(systemId)
    
    // Move to next system
    const currentIndex = todayStack.findIndex(s => s._id.toString() === systemId)
    if (currentIndex < todayStack.length - 1) {
      setCurrentSystem(todayStack[currentIndex + 1])
    } else {
      setCurrentSystem(null)
    }
  }

  const handleMicroCommit = (systemId: string) => {
    onMicroCommit?.(systemId)
  }

  const getEnergyColor = (state: string) => {
    switch (state) {
      case 'high': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30'
    }
  }

  const getEnergyIcon = (state: string) => {
    switch (state) {
      case 'high': return <Zap className="w-4 h-4" />
      case 'medium': return <Battery className="w-4 h-4" />
      case 'low': return <Clock className="w-4 h-4" />
      default: return <Battery className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Execute</h1>
          <p className="text-slate-400">Your focused execution surface for today</p>
        </motion.div>

        {/* Energy State Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${getEnergyColor(energyState)}`}>
            {getEnergyIcon(energyState)}
            <div>
              <div className="font-medium capitalize">{energyState} Energy State</div>
              <div className="text-sm opacity-80">
                {energyState === 'high' ? 'Peak performance time' :
                 energyState === 'medium' ? 'Steady execution window' :
                 'Conserve energy, focus on essentials'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Today's Execution Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Today's Execution Stack
          </h2>
          
          <div className="space-y-3">
            {todayStack.map((system, index) => {
              const isCompleted = completedSystems.has(system._id.toString())
              const isCurrent = currentSystem?._id.toString() === system._id.toString()
              
              return (
                <motion.div
                  key={system._id.toString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`relative rounded-xl border transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500/10 border-green-500/30 opacity-60' 
                      : isCurrent
                      ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : isCurrent ? (
                          <Play className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-slate-400" />
                        )}
                        <div>
                          <div className="font-medium">{system.name}</div>
                          <div className="text-sm text-slate-400">{system.type}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Effectiveness</div>
                          <div className="text-sm font-medium">{system.effectivenessScore}%</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    
                    {isCurrent && !isCompleted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-slate-700"
                      >
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSystemComplete(system._id.toString())}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Complete
                          </button>
                          <button
                            onClick={() => handleMicroCommit(system._id.toString())}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Micro-Commit
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}
            
            {todayStack.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <div>No systems scheduled for today</div>
                <div className="text-sm mt-2">Add systems to start executing</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Micro-Commitment Mode */}
        {energyState === 'low' && todayStack.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-400">
              <RotateCcw className="w-5 h-5" />
              Micro-Commitment Mode
            </h3>
            <p className="text-slate-300 mb-4">
              Low energy detected. Focus on minimum viable versions of your systems to maintain momentum.
            </p>
            <button
              onClick={() => currentSystem && handleMicroCommit(currentSystem._id.toString())}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 py-3 rounded-lg transition-colors font-medium"
            >
              Activate Micro-Commit Mode
            </button>
          </motion.div>
        )}

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {completedSystems.size} / {todayStack.length}
              </div>
              <div className="text-sm text-slate-400">Systems completed</div>
            </div>
            <div className="w-32 h-32 relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-slate-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - completedSystems.size / todayStack.length)}`}
                  className="text-blue-500 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {todayStack.length > 0 ? Math.round((completedSystems.size / todayStack.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
