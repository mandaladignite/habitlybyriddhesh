'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, Eye, EyeOff, Settings, Zap, Brain, Target } from 'lucide-react'

interface AdaptiveUIProps {
  userLevel: 'beginner' | 'intermediate' | 'advanced'
  energyState: 'low' | 'medium' | 'high'
  cognitiveLoad: number // 0-100
  children: React.ReactNode
}

interface DisclosureLevel {
  level: number
  name: string
  description: string
  maxComplexity: number
  features: string[]
}

interface UIComponent {
  id: string
  name: string
  complexity: number // 0-100
  energyRequirement: 'low' | 'medium' | 'high'
  cognitiveLoad: number // 0-100
  category: 'core' | 'advanced' | 'analytics' | 'optimization'
  dependencies: string[]
  adaptiveProps?: Record<string, any>
}

export default function AdaptiveUI({ userLevel, energyState, cognitiveLoad, children }: AdaptiveUIProps) {
  const [disclosureLevel, setDisclosureLevel] = useState(0)
  const [hiddenComponents, setHiddenComponents] = useState<Set<string>>(new Set())
  const [adaptiveMode, setAdaptiveMode] = useState<'standard' | 'minimal' | 'focused'>('standard')
  const [userPreferences, setUserPreferences] = useState({
    autoHideComplex: true,
    showProgressiveHints: true,
    adaptToEnergy: true,
    minimizeCognitiveLoad: true
  })

  const disclosureLevels: DisclosureLevel[] = [
    {
      level: 0,
      name: 'Essential',
      description: 'Only the most critical features',
      maxComplexity: 20,
      features: ['Core execution', 'Basic tracking', 'Simple insights']
    },
    {
      level: 1,
      name: 'Core',
      description: 'Essential features plus basic optimization',
      maxComplexity: 40,
      features: ['Core execution', 'Basic tracking', 'Simple insights', 'Basic scheduling']
    },
    {
      level: 2,
      name: 'Enhanced',
      description: 'Comprehensive features with moderate complexity',
      maxComplexity: 60,
      features: ['All core features', 'Advanced insights', 'Energy optimization', 'Basic analytics']
    },
    {
      level: 3,
      name: 'Advanced',
      description: 'Full feature set with advanced capabilities',
      maxComplexity: 80,
      features: ['All features', 'Advanced analytics', 'Prediction models', 'System optimization']
    },
    {
      level: 4,
      name: 'Expert',
      description: 'Complete feature set with maximum customization',
      maxComplexity: 100,
      features: ['All features', 'Custom algorithms', 'Advanced predictions', 'Full control']
    }
  ]

  // Auto-adjust disclosure level based on user state
  useEffect(() => {
    if (userPreferences.adaptToEnergy) {
      if (energyState === 'low') {
        setDisclosureLevel(0)
        setAdaptiveMode('minimal')
      } else if (energyState === 'medium') {
        setDisclosureLevel(userLevel === 'beginner' ? 0 : userLevel === 'intermediate' ? 1 : 2)
        setAdaptiveMode('focused')
      } else {
        setDisclosureLevel(userLevel === 'beginner' ? 1 : userLevel === 'intermediate' ? 2 : 3)
        setAdaptiveMode('standard')
      }
    }
  }, [energyState, userLevel, userPreferences.adaptToEnergy])

  // Auto-hide complex components based on cognitive load
  useEffect(() => {
    if (userPreferences.minimizeCognitiveLoad && cognitiveLoad > 70) {
      // Hide high-complexity components when cognitive load is high
      const highComplexityThreshold = energyState === 'low' ? 30 : 50
      // This would be implemented with actual component detection
    }
  }, [cognitiveLoad, energyState, userPreferences.minimizeCognitiveLoad])

  const getVisibleComponents = (allComponents: UIComponent[]): UIComponent[] => {
    const currentLevel = disclosureLevels[disclosureLevel]
    
    return allComponents.filter(component => {
      // Check complexity threshold
      if (component.complexity > currentLevel.maxComplexity) return false
      
      // Check energy requirements
      if (energyState === 'low' && component.energyRequirement === 'high') return false
      if (energyState === 'medium' && component.energyRequirement === 'high' && userLevel === 'beginner') return false
      
      // Check cognitive load
      if (cognitiveLoad > 70 && component.cognitiveLoad > 60) return false
      
      // Check if component is hidden
      if (hiddenComponents.has(component.id)) return false
      
      // Check dependencies
      const dependenciesMet = component.dependencies.every(dep => !hiddenComponents.has(dep))
      
      return dependenciesMet
    })
  }

  const adjustDisclosureLevel = (newLevel: number) => {
    setDisclosureLevel(Math.max(0, Math.min(disclosureLevels.length - 1, newLevel)))
  }

  const toggleComponentVisibility = (componentId: string) => {
    setHiddenComponents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(componentId)) {
        newSet.delete(componentId)
      } else {
        newSet.add(componentId)
      }
      return newSet
    })
  }

  const getAdaptiveStyles = () => {
    switch (adaptiveMode) {
      case 'minimal':
        return {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderWidth: '0',
          shadow: 'none',
          spacing: 'compact',
          fontSize: 'small'
        }
      case 'focused':
        return {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          borderWidth: '1px',
          shadow: 'sm',
          spacing: 'normal',
          fontSize: 'normal'
        }
      default:
        return {
          backgroundColor: 'rgba(51, 65, 85, 0.95)',
          borderWidth: '2px',
          shadow: 'md',
          spacing: 'comfortable',
          fontSize: 'normal'
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Adaptive UI Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700"
      >
        <div className="flex items-center gap-3 mb-3">
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Adaptive UI</span>
        </div>
        
        {/* Disclosure Level Selector */}
        <div className="mb-3">
          <div className="text-xs text-slate-400 mb-1">Complexity Level</div>
          <div className="flex gap-1">
            {disclosureLevels.map((level, index) => (
              <button
                key={level.level}
                onClick={() => adjustDisclosureLevel(index)}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  disclosureLevel === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title={level.description}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>

        {/* Energy State Indicator */}
        <div className="mb-3">
          <div className="text-xs text-slate-400 mb-1">Energy State</div>
          <div className={`flex items-center gap-2 px-2 py-1 rounded ${
            energyState === 'high' ? 'bg-green-500/20 text-green-400' :
            energyState === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {energyState === 'high' ? <Zap className="w-3 h-3" /> :
             energyState === 'medium' ? <Brain className="w-3 h-3" /> :
             <Target className="w-3 h-3" />}
            <span className="text-xs capitalize">{energyState}</span>
          </div>
        </div>

        {/* Cognitive Load Indicator */}
        <div className="mb-3">
          <div className="text-xs text-slate-400 mb-1">Cognitive Load</div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                cognitiveLoad > 70 ? 'bg-red-500' :
                cognitiveLoad > 40 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${cognitiveLoad}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setAdaptiveMode('minimal')}
            className={`px-2 py-1 rounded text-xs ${
              adaptiveMode === 'minimal' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            Minimal
          </button>
          <button
            onClick={() => setAdaptiveMode('focused')}
            className={`px-2 py-1 rounded text-xs ${
              adaptiveMode === 'focused' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            Focused
          </button>
          <button
            onClick={() => setAdaptiveMode('standard')}
            className={`px-2 py-1 rounded text-xs ${
              adaptiveMode === 'standard' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            Standard
          </button>
        </div>
      </motion.div>

      {/* Progressive Disclosure Hints */}
      {userPreferences.showProgressiveHints && disclosureLevel < disclosureLevels.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 z-50 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700 max-w-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">More Features Available</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            You're currently viewing {disclosureLevels[disclosureLevel].name} features. 
            Upgrade to {disclosureLevels[disclosureLevel + 1].name} for more capabilities.
          </p>
          <button
            onClick={() => adjustDisclosureLevel(disclosureLevel + 1)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm transition-colors"
          >
            Show More Features
          </button>
        </motion.div>
      )}

      {/* Main Content with Adaptive Styling */}
      <div 
        className="transition-all duration-300"
        style={{
          padding: adaptiveMode === 'minimal' ? '1rem' : adaptiveMode === 'focused' ? '1.5rem' : '2rem',
          fontSize: adaptiveMode === 'minimal' ? '0.875rem' : '1rem'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${disclosureLevel}-${adaptiveMode}-${energyState}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={adaptiveMode === 'minimal' ? 'space-y-2' : 'space-y-6'}
          >
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  adaptiveMode,
                  disclosureLevel,
                  energyState,
                  cognitiveLoad,
                  hiddenComponents,
                  toggleComponentVisibility
                })
              }
              return child
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Progressive Disclosure Component Wrapper
interface ProgressiveDisclosureProps {
  title: string
  description?: string
  complexity: number
  energyRequirement: 'low' | 'medium' | 'high'
  cognitiveLoad: number
  category: 'core' | 'advanced' | 'analytics' | 'optimization'
  children: React.ReactNode
  adaptiveMode?: string
  disclosureLevel?: number
  energyState?: string
  hiddenComponents?: Set<string>
  toggleComponentVisibility?: (id: string) => void
}

export function ProgressiveDisclosure({
  title,
  description,
  complexity,
  energyRequirement,
  cognitiveLoad,
  category,
  children,
  adaptiveMode = 'standard',
  disclosureLevel = 2,
  energyState = 'medium',
  hiddenComponents = new Set(),
  toggleComponentVisibility = () => {}
}: ProgressiveDisclosureProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Check if component should be visible based on current settings
  useEffect(() => {
    const maxComplexity = disclosureLevel === 0 ? 20 : 
                        disclosureLevel === 1 ? 40 :
                        disclosureLevel === 2 ? 60 :
                        disclosureLevel === 3 ? 80 : 100

    const energyCompatible = 
      (energyState === 'low' && energyRequirement === 'low') ||
      (energyState === 'medium' && energyRequirement !== 'high') ||
      energyState === 'high'

    const cognitiveCompatible = cognitiveLoad <= 60 || cognitiveLoad <= cognitiveLoad

    setIsVisible(complexity <= maxComplexity && energyCompatible && cognitiveCompatible)
  }, [disclosureLevel, energyState, cognitiveLoad, complexity, energyRequirement])

  if (!isVisible) return null

  const getCategoryColor = () => {
    switch (category) {
      case 'core': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'advanced': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'analytics': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'optimization': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30'
    }
  }

  const getComplexityColor = () => {
    if (complexity <= 30) return 'text-green-400'
    if (complexity <= 60) return 'text-yellow-400'
    if (complexity <= 80) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border transition-all duration-300 ${
        adaptiveMode === 'minimal' ? 'p-3' : 'p-6'
      } ${
        energyState === 'low' ? 'border-slate-700' :
        energyState === 'medium' ? 'border-slate-600' :
        'border-slate-500'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-semibold ${adaptiveMode === 'minimal' ? 'text-sm' : 'text-lg'}`}>
              {title}
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor()}`}>
              {category}
            </div>
            <div className={`text-xs ${getComplexityColor()}`}>
              {complexity}% complexity
            </div>
          </div>
          {description && (
            <p className={`text-slate-400 ${adaptiveMode === 'minimal' ? 'text-xs' : 'text-sm'}`}>
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {energyRequirement !== 'low' && (
            <div className={`px-2 py-1 rounded text-xs ${
              energyRequirement === 'high' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {energyRequirement} energy
            </div>
          )}
          
          <button
            onClick={() => toggleComponentVisibility(title)}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            title="Toggle visibility"
          >
            {hiddenComponents.has(title) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          {children && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-slate-700 transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-slate-700">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
