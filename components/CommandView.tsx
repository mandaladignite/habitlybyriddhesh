'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Minus, Target, TrendingUp, AlertTriangle, Brain } from 'lucide-react'
import { IMomentumVector, INorthStarGoal, IAdaptiveSystem, IInsight } from '@/types/v2-models'

interface CommandViewProps {
  momentumVector?: IMomentumVector
  northStarGoals?: INorthStarGoal[]
  systems?: IAdaptiveSystem[]
  insights?: IInsight[]
}

export default function CommandView({ momentumVector, northStarGoals, systems, insights }: CommandViewProps) {
  const [selectedGoal, setSelectedGoal] = useState<INorthStarGoal | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Command View</h1>
          <p className="text-slate-400">Strategic overview of your execution system</p>
        </motion.div>

        {/* Momentum Vector Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Momentum Vector
              </h2>
              {momentumVector && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  momentumVector.direction === 'increasing' ? 'bg-green-500/20 text-green-400' :
                  momentumVector.direction === 'decreasing' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {momentumVector.direction === 'increasing' ? <ArrowUp className="w-3 h-3" /> :
                   momentumVector.direction === 'decreasing' ? <ArrowDown className="w-3 h-3" /> :
                   <Minus className="w-3 h-3" />}
                  {momentumVector.strength}%
                </div>
              )}
            </div>
            
            {momentumVector ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Consistency</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${momentumVector.consistencyMomentum}%` }}
                      />
                    </div>
                    <span className="text-sm">{momentumVector.consistencyMomentum}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Growth</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${momentumVector.difficultyGrowthMomentum}%` }}
                      />
                    </div>
                    <span className="text-sm">{momentumVector.difficultyGrowthMomentum}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Impact</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${momentumVector.impactMomentum}%` }}
                      />
                    </div>
                    <span className="text-sm">{momentumVector.impactMomentum}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Learning</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 transition-all duration-500"
                        style={{ width: `${momentumVector.learningMomentum}%` }}
                      />
                    </div>
                    <span className="text-sm">{momentumVector.learningMomentum}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No momentum data available
              </div>
            )}
          </div>

          {/* Goal Alignment Rings */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goal Alignment
            </h2>
            <div className="space-y-3">
              {northStarGoals?.slice(0, 3).map((goal, index) => (
                <motion.div
                  key={goal._id.toString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedGoal(goal)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium truncate">{goal.title}</span>
                    <span className="text-xs text-slate-400">{goal.progress}%</span>
                  </div>
                  <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                    <div 
                      className="absolute inset-0 bg-white/20 rounded-full"
                      style={{ 
                        width: `${goal.alignmentScore}%`,
                        opacity: goal.alignmentScore / 100
                      }}
                    />
                  </div>
                </motion.div>
              ))}
              {(!northStarGoals || northStarGoals.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  No goals defined yet
                </div>
              )}
            </div>
          </div>

          {/* Leverage System Highlight */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Leverage System
            </h2>
            {systems && systems.length > 0 ? (
              <div className="space-y-3">
                {systems
                  .filter(system => system.effectivenessScore > 70)
                  .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
                  .slice(0, 3)
                  .map((system, index) => (
                    <motion.div
                      key={system._id.toString()}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-slate-700/50 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{system.name}</span>
                        <span className="text-xs text-green-400">{system.effectivenessScore}%</span>
                      </div>
                      <div className="text-xs text-slate-400">{system.type}</div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No systems available
              </div>
            )}
          </div>
        </motion.div>

        {/* Risk & Friction Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Risk & Friction Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights?.filter(insight => insight.priority === 'high' || insight.priority === 'critical').map((insight, index) => (
              <motion.div
                key={insight._id.toString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  insight.priority === 'critical' 
                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                }`}
              >
                <div className="font-medium mb-1">{insight.title}</div>
                <div className="text-sm opacity-80 mb-2">{insight.description}</div>
                <div className="text-xs opacity-60">{insight.recommendedAction}</div>
              </motion.div>
            ))}
            {(!insights || insights.filter(i => i.priority === 'high' || i.priority === 'critical').length === 0) && (
              <div className="col-span-full text-center py-8 text-slate-500">
                No critical alerts at this time
              </div>
            )}
          </div>
        </motion.div>

        {/* Selected Goal Detail Modal */}
        {selectedGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setSelectedGoal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4">{selectedGoal.title}</h3>
              <p className="text-slate-400 mb-4">{selectedGoal.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Progress</div>
                  <div className="text-2xl font-bold">{selectedGoal.progress}%</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Alignment</div>
                  <div className="text-2xl font-bold">{selectedGoal.alignmentScore}%</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedGoal(null)}
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
