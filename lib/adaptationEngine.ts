import { IAdaptiveSystem, ISystemAdaptation, IExecutionQuality, ICognitiveProfile } from '@/types/v2-models'

export interface AdaptationTrigger {
  type: 'performance_drop' | 'friction_increase' | 'context_mismatch' | 'energy_pattern' | 'skip_risk'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  data: any
}

export interface AdaptationStrategy {
  id: string
  name: string
  description: string
  conditions: AdaptationTrigger[]
  actions: AdaptationAction[]
  successRate: number
  lastUsed?: Date
}

export interface AdaptationAction {
  type: 'modify_timing' | 'reduce_difficulty' | 'change_context' | 'break_down' | 'add_support' | 'pause_system'
  description: string
  parameters: Record<string, any>
  expectedImpact: number
}

export interface AdaptationResult {
  systemId: string
  adaptation: ISystemAdaptation
  beforeMetrics: any
  afterMetrics: any
  effectiveness: number
  recommendation: string
}

export class AdaptationEngine {
  private userId: string
  private strategies: AdaptationStrategy[]

  constructor(userId: string) {
    this.userId = userId
    this.strategies = this.initializeAdaptationStrategies()
  }

  /**
   * Analyze systems and recommend adaptations based on performance data
   */
  async analyzeAndAdapt(
    systems: IAdaptiveSystem[],
    executionData: IExecutionQuality[],
    profile: ICognitiveProfile
  ): Promise<AdaptationResult[]> {
    const results: AdaptationResult[] = []

    for (const system of systems) {
      if (system.locked) continue // Skip locked systems

      const triggers = this.identifyAdaptationTriggers(system, executionData, profile)
      const applicableStrategies = this.findApplicableStrategies(triggers)
      
      for (const strategy of applicableStrategies) {
        const adaptation = await this.applyAdaptation(system, strategy, executionData)
        if (adaptation) {
          results.push(adaptation)
        }
      }
    }

    return results.sort((a, b) => b.effectiveness - a.effectiveness)
  }

  /**
   * Identify triggers that may require system adaptation
   */
  private identifyAdaptationTriggers(
    system: IAdaptiveSystem,
    executionData: IExecutionQuality[],
    profile: ICognitiveProfile
  ): AdaptationTrigger[] {
    const triggers: AdaptationTrigger[] = []
    const systemExecutions = executionData.filter(exec => exec.systemId === system._id.toString())

    // Performance drop trigger
    if (systemExecutions.length >= 7) {
      const recentExecutions = systemExecutions.slice(-7)
      const olderExecutions = systemExecutions.slice(-14, -7)
      
      if (olderExecutions.length > 0) {
        const recentAvg = recentExecutions.reduce((sum, exec) => sum + exec.quality, 0) / recentExecutions.length
        const olderAvg = olderExecutions.reduce((sum, exec) => sum + exec.quality, 0) / olderExecutions.length
        const dropPercentage = ((olderAvg - recentAvg) / olderAvg) * 100

        if (dropPercentage > 20) {
          triggers.push({
            type: 'performance_drop',
            severity: dropPercentage > 40 ? 'critical' : dropPercentage > 30 ? 'high' : 'medium',
            description: `Performance dropped by ${dropPercentage.toFixed(1)}%`,
            data: { recentAvg, olderAvg, dropPercentage }
          })
        }
      }
    }

    // Friction increase trigger
    if (system.frictionCoefficient > 70) {
      triggers.push({
        type: 'friction_increase',
        severity: system.frictionCoefficient > 85 ? 'critical' : 'high',
        description: `High friction coefficient: ${system.frictionCoefficient}%`,
        data: { frictionCoefficient: system.frictionCoefficient }
      })
    }

    // Context mismatch trigger
    if (systemExecutions.length > 0) {
      const avgContextFit = systemExecutions.reduce((sum, exec) => sum + exec.contextFit, 0) / systemExecutions.length
      if (avgContextFit < 50) {
        triggers.push({
          type: 'context_mismatch',
          severity: avgContextFit < 30 ? 'high' : 'medium',
          description: `Poor context alignment: ${avgContextFit.toFixed(1)}%`,
          data: { avgContextFit }
        })
      }
    }

    // Skip risk trigger
    const recentCompletionRate = systemExecutions.slice(-5).reduce((sum, exec) => sum + exec.completionRate, 0) / Math.min(5, systemExecutions.length)
    if (recentCompletionRate < 40) {
      triggers.push({
        type: 'skip_risk',
        severity: recentCompletionRate < 20 ? 'critical' : 'high',
        description: `High skip risk: ${recentCompletionRate.toFixed(1)}% completion rate`,
        data: { recentCompletionRate }
      })
    }

    return triggers
  }

  /**
   * Find adaptation strategies that match identified triggers
   */
  private findApplicableStrategies(triggers: AdaptationTrigger[]): AdaptationStrategy[] {
    return this.strategies.filter(strategy => {
      return triggers.some(trigger => 
        strategy.conditions.some(condition => 
          condition.type === trigger.type && 
          this.severityMatches(condition.severity, trigger.severity)
        )
      )
    })
  }

  /**
   * Apply adaptation to a system
   */
  private async applyAdaptation(
    system: IAdaptiveSystem,
    strategy: AdaptationStrategy,
    executionData: IExecutionQuality[]
  ): Promise<AdaptationResult | null> {
    const systemExecutions = executionData.filter(exec => exec.systemId === system._id.toString())
    const beforeMetrics = this.calculateSystemMetrics(systemExecutions)

    // Select the most appropriate action from the strategy
    const action = this.selectBestAction(strategy.actions, system, beforeMetrics)
    
    if (!action) return null

    // Simulate the adaptation (in production, this would actually modify the system)
    const adaptation: ISystemAdaptation = {
      timestamp: new Date(),
      trigger: strategy.name,
      change: action.description,
      impact: action.expectedImpact
    }

    // Calculate expected after metrics (simplified simulation)
    const afterMetrics = this.simulateAdaptationImpact(beforeMetrics, action)

    const effectiveness = this.calculateAdaptationEffectiveness(beforeMetrics, afterMetrics)

    return {
      systemId: system._id.toString(),
      adaptation,
      beforeMetrics,
      afterMetrics,
      effectiveness,
      recommendation: this.generateAdaptationRecommendation(action, effectiveness)
    }
  }

  /**
   * Initialize built-in adaptation strategies
   */
  private initializeAdaptationStrategies(): AdaptationStrategy[] {
    return [
      {
        id: 'reduce_friction',
        name: 'Reduce System Friction',
        description: 'Break down high-friction systems into smaller components',
        conditions: [
          { type: 'friction_increase', severity: 'high', description: '', data: {} },
          { type: 'performance_drop', severity: 'medium', description: '', data: {} }
        ],
        actions: [
          {
            type: 'break_down',
            description: 'Split system into smaller, manageable actions',
            parameters: { reductionFactor: 0.5 },
            expectedImpact: 30
          },
          {
            type: 'reduce_difficulty',
            description: 'Lower difficulty to build momentum',
            parameters: { reductionFactor: 0.7 },
            expectedImpact: 25
          }
        ],
        successRate: 75
      },
      {
        id: 'optimize_timing',
        name: 'Optimize Execution Timing',
        description: 'Adjust system timing based on energy patterns',
        conditions: [
          { type: 'context_mismatch', severity: 'medium', description: '', data: {} },
          { type: 'energy_pattern', severity: 'medium', description: '', data: {} }
        ],
        actions: [
          {
            type: 'modify_timing',
            description: 'Reschedule to optimal energy window',
            parameters: { shiftHours: 2 },
            expectedImpact: 35
          },
          {
            type: 'change_context',
            description: 'Modify environmental conditions',
            parameters: { contextChanges: ['location', 'time'] },
            expectedImpact: 20
          }
        ],
        successRate: 80
      },
      {
        id: 'prevent_skip',
        name: 'Skip Risk Prevention',
        description: 'Intervene when skip risk is detected',
        conditions: [
          { type: 'skip_risk', severity: 'high', description: '', data: {} },
          { type: 'skip_risk', severity: 'critical', description: '', data: {} }
        ],
        actions: [
          {
            type: 'reduce_difficulty',
            description: 'Implement minimum viable version',
            parameters: { reductionFactor: 0.3 },
            expectedImpact: 40
          },
          {
            type: 'add_support',
            description: 'Add accountability or reminder system',
            parameters: { supportType: 'reminder' },
            expectedImpact: 25
          },
          {
            type: 'pause_system',
            description: 'Temporarily pause system for recovery',
            parameters: { pauseDuration: 3 },
            expectedImpact: 20
          }
        ],
        successRate: 85
      }
    ]
  }

  /**
   * Helper methods
   */
  private severityMatches(required: string, actual: string): boolean {
    const severityLevels: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 }
    return severityLevels[actual] >= severityLevels[required]
  }

  private selectBestAction(actions: AdaptationAction[], system: IAdaptiveSystem, metrics: any): AdaptationAction | null {
    return actions.sort((a, b) => b.expectedImpact - a.expectedImpact)[0] || null
  }

  private calculateSystemMetrics(executions: IExecutionQuality[]): any {
    if (executions.length === 0) return { quality: 0, completionRate: 0, energyCost: 100 }

    return {
      quality: executions.reduce((sum, exec) => sum + exec.quality, 0) / executions.length,
      completionRate: executions.reduce((sum, exec) => sum + exec.completionRate, 0) / executions.length,
      energyCost: executions.reduce((sum, exec) => sum + exec.energyCost, 0) / executions.length,
      contextFit: executions.reduce((sum, exec) => sum + exec.contextFit, 0) / executions.length
    }
  }

  private simulateAdaptationImpact(beforeMetrics: any, action: AdaptationAction): any {
    const afterMetrics = { ...beforeMetrics }

    switch (action.type) {
      case 'reduce_difficulty':
        afterMetrics.quality = Math.min(100, beforeMetrics.quality + action.expectedImpact)
        afterMetrics.energyCost = Math.max(0, beforeMetrics.energyCost - (action.expectedImpact * 0.5))
        break
      case 'modify_timing':
        afterMetrics.contextFit = Math.min(100, beforeMetrics.contextFit + action.expectedImpact)
        afterMetrics.quality = Math.min(100, beforeMetrics.quality + (action.expectedImpact * 0.7))
        break
      case 'break_down':
        afterMetrics.completionRate = Math.min(100, beforeMetrics.completionRate + action.expectedImpact)
        afterMetrics.energyCost = Math.max(0, beforeMetrics.energyCost - (action.expectedImpact * 0.3))
        break
      case 'add_support':
        afterMetrics.completionRate = Math.min(100, beforeMetrics.completionRate + action.expectedImpact)
        break
    }

    return afterMetrics
  }

  private calculateAdaptationEffectiveness(before: any, after: any): number {
    const improvements = [
      after.quality - before.quality,
      after.completionRate - before.completionRate,
      before.energyCost - after.energyCost,
      after.contextFit - before.contextFit
    ]
    
    return Math.round(improvements.reduce((sum, improvement) => sum + Math.max(0, improvement), 0) / improvements.length)
  }

  private generateAdaptationRecommendation(action: AdaptationAction, effectiveness: number): string {
    if (effectiveness > 70) {
      return `Highly recommended: ${action.description} (expected ${effectiveness}% improvement)`
    } else if (effectiveness > 40) {
      return `Consider: ${action.description} (expected ${effectiveness}% improvement)`
    } else {
      return `Alternative approach may be needed for better results`
    }
  }
}
