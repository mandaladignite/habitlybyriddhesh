import { IAdaptiveSystem, IExecutionQuality, IMomentumVector, ICognitiveProfile } from '@/types/v2-models'

export interface ExecutionPattern {
  timeOfDay: number
  dayOfWeek: number
  energyLevel: number
  completionRate: number
  context: Record<string, any>
}

export interface FrictionPoint {
  type: 'time' | 'energy' | 'context' | 'sequence' | 'difficulty'
  severity: number // 0-100
  frequency: number
  description: string
  suggestedFix: string
}

export interface SkipRisk {
  systemId: string
  probability: number // 0-100
  factors: string[]
  timeframe: 'today' | 'tomorrow' | 'this_week'
  mitigation: string
}

export interface OptimalTiming {
  systemId: string
  bestTime: number // hour of day
  confidence: number // 0-100
  reasoning: string
  alternatives: number[]
}

export class PatternRecognitionEngine {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Analyze execution patterns to identify optimal timing, friction points, and skip risks
   */
  async analyzeExecutionPatterns(
    executionHistory: IExecutionQuality[],
    systems: IAdaptiveSystem[],
    profile: ICognitiveProfile
  ): Promise<{
    patterns: ExecutionPattern[]
    frictionPoints: FrictionPoint[]
    skipRisks: SkipRisk[]
    optimalTimings: OptimalTiming[]
  }> {
    const patterns = this.extractExecutionPatterns(executionHistory)
    const frictionPoints = this.identifyFrictionPoints(patterns, systems)
    const skipRisks = this.predictSkipRisks(patterns, systems, profile)
    const optimalTimings = this.calculateOptimalTimings(patterns, profile)

    return {
      patterns,
      frictionPoints,
      skipRisks,
      optimalTimings,
    }
  }

  /**
   * Extract recurring patterns from execution history
   */
  private extractExecutionPatterns(executionHistory: IExecutionQuality[]): ExecutionPattern[] {
    const patterns: ExecutionPattern[] = []
    
    // Group by time of day and day of week
    const timeSlots = this.groupByTimeSlot(executionHistory)
    
    for (const [timeKey, executions] of Object.entries(timeSlots)) {
      const [hour, dayOfWeek] = timeKey.split('-').map(Number)
      
      const avgCompletionRate = executions.reduce((sum, exec) => sum + exec.completionRate, 0) / executions.length
      const avgEnergyCost = executions.reduce((sum, exec) => sum + exec.energyCost, 0) / executions.length
      const avgContextFit = executions.reduce((sum, exec) => sum + exec.contextFit, 0) / executions.length
      
      patterns.push({
        timeOfDay: hour,
        dayOfWeek,
        energyLevel: 100 - avgEnergyCost, // Invert energy cost to get energy level
        completionRate: avgCompletionRate,
        context: { avgContextFit }
      })
    }
    
    return patterns
  }

  /**
   * Identify friction points that hinder execution
   */
  private identifyFrictionPoints(patterns: ExecutionPattern[], systems: IAdaptiveSystem[]): FrictionPoint[] {
    const frictionPoints: FrictionPoint[] = []
    
    // Analyze time-based friction
    const lowPerformanceTimes = patterns.filter(p => p.completionRate < 50)
    for (const time of lowPerformanceTimes) {
      frictionPoints.push({
        type: 'time',
        severity: 100 - time.completionRate,
        frequency: patterns.filter(p => p.timeOfDay === time.timeOfDay).length,
        description: `Low completion rate at ${time.timeOfDay}:00`,
        suggestedFix: `Reschedule to optimal time or reduce difficulty during this period`
      })
    }
    
    // Analyze energy-based friction
    const lowEnergyPatterns = patterns.filter(p => p.energyLevel < 30)
    for (const pattern of lowEnergyPatterns) {
      frictionPoints.push({
        type: 'energy',
        severity: 100 - pattern.energyLevel,
        frequency: patterns.filter(p => p.energyLevel < 30).length,
        description: `Low energy periods detected`,
        suggestedFix: `Schedule lighter tasks or implement energy recovery protocols`
      })
    }
    
    // Analyze system-specific friction
    for (const system of systems) {
      if (system.frictionCoefficient > 70) {
        frictionPoints.push({
          type: 'difficulty',
          severity: system.frictionCoefficient,
          frequency: 1,
          description: `High friction in system: ${system.name}`,
          suggestedFix: `Break down into smaller components or reduce complexity`
        })
      }
    }
    
    return frictionPoints.sort((a, b) => b.severity - a.severity)
  }

  /**
   * Predict skip risks for upcoming periods
   */
  private predictSkipRisks(
    patterns: ExecutionPattern[],
    systems: IAdaptiveSystem[],
    profile: ICognitiveProfile
  ): SkipRisk[] {
    const skipRisks: SkipRisk[] = []
    const currentHour = new Date().getHours()
    const currentDay = new Date().getDay()
    
    for (const system of systems) {
      // Find similar historical patterns
      const similarPatterns = patterns.filter(p => 
        p.dayOfWeek === currentDay && 
        Math.abs(p.timeOfDay - currentHour) <= 2
      )
      
      if (similarPatterns.length > 0) {
        const avgCompletionRate = similarPatterns.reduce((sum, p) => sum + p.completionRate, 0) / similarPatterns.length
        const skipProbability = Math.max(0, 100 - avgCompletionRate)
        
        // Adjust based on system friction and user profile
        const adjustedProbability = skipProbability + (system.frictionCoefficient * 0.3)
        
        if (adjustedProbability > 60) {
          skipRisks.push({
            systemId: system._id.toString(),
            probability: Math.min(100, adjustedProbability),
            factors: this.getSkipRiskFactors(similarPatterns, system, profile),
            timeframe: 'today',
            mitigation: this.generateSkipMitigation(system, profile)
          })
        }
      }
    }
    
    return skipRisks.sort((a, b) => b.probability - a.probability)
  }

  /**
   * Calculate optimal timing for each system
   */
  private calculateOptimalTimings(patterns: ExecutionPattern[], profile: ICognitiveProfile): OptimalTiming[] {
    const optimalTimings: OptimalTiming[] = []
    
    // Find peak performance times
    const peakTimes = patterns
      .filter(p => p.completionRate > 80 && p.energyLevel > 70)
      .sort((a, b) => b.completionRate - a.completionRate)
    
    for (const pattern of peakTimes.slice(0, 3)) { // Top 3 optimal times
      optimalTimings.push({
        systemId: 'general', // General recommendation
        bestTime: pattern.timeOfDay,
        confidence: pattern.completionRate,
        reasoning: `Historical completion rate of ${pattern.completionRate.toFixed(1)}% at this time`,
        alternatives: peakTimes.slice(3, 5).map(p => p.timeOfDay)
      })
    }
    
    return optimalTimings
  }

  /**
   * Helper methods
   */
  private groupByTimeSlot(executions: IExecutionQuality[]): Record<string, IExecutionQuality[]> {
    const groups: Record<string, IExecutionQuality[]> = {}
    
    for (const execution of executions) {
      const hour = execution.date.getHours()
      const dayOfWeek = execution.date.getDay()
      const key = `${hour}-${dayOfWeek}`
      
      if (!groups[key]) groups[key] = []
      groups[key].push(execution)
    }
    
    return groups
  }

  private getSkipRiskFactors(patterns: ExecutionPattern[], system: IAdaptiveSystem, profile: ICognitiveProfile): string[] {
    const factors: string[] = []
    
    if (system.frictionCoefficient > 70) factors.push('High system friction')
    if (patterns.some(p => p.energyLevel < 30)) factors.push('Low energy period')
    if (system.effectivenessScore < 50) factors.push('Low system effectiveness')
    if (profile.adaptation < 30) factors.push('Low adaptability to change')
    
    return factors
  }

  private generateSkipMitigation(system: IAdaptiveSystem, profile: ICognitiveProfile): string {
    if (system.frictionCoefficient > 70) {
      return 'Break down into smaller, more manageable actions'
    }
    if (profile.adaptation < 30) {
      return 'Maintain consistent routine and minimize changes'
    }
    return 'Reduce scope to minimum viable version'
  }
}
