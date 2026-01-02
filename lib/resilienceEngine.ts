import { IRecoveryProtocol, IRecoveryCondition, IRecoveryAction, IAdaptiveSystem, IExecutionQuality } from '@/types/v2-models'

export interface ResilienceAssessment {
  overallResilience: number // 0-100
  burnoutRisk: number // 0-100
  momentumStability: number // 0-100
  systemRobustness: number // 0-100
  recoveryCapacity: number // 0-100
  riskFactors: RiskFactor[]
  protectiveFactors: ProtectiveFactor[]
}

export interface RiskFactor {
  type: 'energy_depletion' | 'consistency_break' | 'system_failure' | 'context_mismatch' | 'motivation_loss'
  severity: 'low' | 'medium' | 'high' | 'critical'
  probability: number // 0-100
  impact: number // 0-100
  description: string
  indicators: string[]
  mitigation: string[]
}

export interface ProtectiveFactor {
  type: 'high_consistency' | 'low_friction_systems' | 'energy_awareness' | 'adaptation_capacity' | 'recovery_protocols'
  strength: number // 0-100
  description: string
  benefits: string[]
}

export interface RecoveryTrigger {
  type: 'automatic' | 'manual' | 'scheduled'
  condition: string
  threshold: number
  activated: boolean
  timestamp?: Date
}

export interface RecoveryPlan {
  protocol: IRecoveryProtocol
  triggers: RecoveryTrigger[]
  actions: RecoveryAction[]
  timeline: RecoveryTimeline
  successMetrics: RecoveryMetric[]
  estimatedDuration: number // days
  confidence: number // 0-100
}

export interface RecoveryAction extends IRecoveryAction {
  status: 'pending' | 'active' | 'completed' | 'skipped'
  scheduledTime?: Date
  completedTime?: Date
  effectiveness?: number // 0-100
  notes?: string
}

export interface RecoveryTimeline {
  phases: RecoveryPhase[]
  milestones: RecoveryMilestone[]
  checkpoints: RecoveryCheckpoint[]
}

export interface RecoveryPhase {
  name: string
  duration: number // days
  description: string
  objectives: string[]
  actions: string[]
  successCriteria: string[]
}

export interface RecoveryMilestone {
  name: string
  targetDate: Date
  description: string
  achieved: boolean
  achievedDate?: Date
}

export interface RecoveryCheckpoint {
  day: number
  assessments: string[]
  adjustments: string[]
  criteria: string[]
}

export interface RecoveryMetric {
  name: string
  target: number
  current: number
  unit: string
  direction: 'increase' | 'decrease'
  weight: number // 0-1
}

export class ResilienceEngine {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Assess overall system resilience and identify risks
   */
  async assessResilience(
    systems: IAdaptiveSystem[],
    executionHistory: IExecutionQuality[],
    protocols: IRecoveryProtocol[]
  ): Promise<ResilienceAssessment> {
    const overallResilience = this.calculateOverallResilience(systems, executionHistory, protocols)
    const burnoutRisk = this.assessBurnoutRisk(executionHistory, systems)
    const momentumStability = this.assessMomentumStability(executionHistory)
    const systemRobustness = this.assessSystemRobustness(systems)
    const recoveryCapacity = this.assessRecoveryCapacity(protocols, executionHistory)
    
    const riskFactors = this.identifyRiskFactors(systems, executionHistory)
    const protectiveFactors = this.identifyProtectiveFactors(systems, executionHistory, protocols)

    return {
      overallResilience,
      burnoutRisk,
      momentumStability,
      systemRobustness,
      recoveryCapacity,
      riskFactors,
      protectiveFactors
    }
  }

  /**
   * Generate personalized recovery plan based on current state
   */
  async generateRecoveryPlan(
    assessment: ResilienceAssessment,
    systems: IAdaptiveSystem[],
    executionHistory: IExecutionQuality[],
    protocols: IRecoveryProtocol[]
  ): Promise<RecoveryPlan> {
    const selectedProtocol = this.selectOptimalProtocol(assessment, protocols)
    const triggers = this.identifyRecoveryTriggers(assessment, executionHistory)
    const actions = this.planRecoveryActions(selectedProtocol, assessment, systems)
    const timeline = this.createRecoveryTimeline(selectedProtocol, assessment)
    const successMetrics = this.defineRecoveryMetrics(assessment, selectedProtocol)
    const estimatedDuration = this.estimateRecoveryDuration(selectedProtocol, assessment)
    const confidence = this.calculatePlanConfidence(selectedProtocol, assessment)

    return {
      protocol: selectedProtocol,
      triggers,
      actions,
      timeline,
      successMetrics,
      estimatedDuration,
      confidence
    }
  }

  /**
   * Activate recovery protocol when conditions are met
   */
  async activateRecovery(
    protocol: IRecoveryProtocol,
    triggerCondition: string,
    systems: IAdaptiveSystem[]
  ): Promise<RecoveryPlan> {
    // Update protocol last used timestamp
    protocol.lastUsed = new Date()

    // Create recovery actions from protocol
    const actions: RecoveryAction[] = protocol.actions.map(action => ({
      ...action,
      status: 'pending' as const,
      scheduledTime: new Date()
    }))

    // Create basic timeline
    const timeline: RecoveryTimeline = {
      phases: [
        {
          name: 'Immediate Recovery',
          duration: 1,
          description: 'Stabilize current state and prevent further decline',
          objectives: ['Stop momentum loss', 'Reduce cognitive load', 'Activate core systems'],
          actions: actions.filter(a => a.priority <= 3).map(a => a.description),
          successCriteria: ['No further system failures', 'Stabilized energy levels', 'Core systems active']
        },
        {
          name: 'Rebuilding Phase',
          duration: 3,
          description: 'Gradually rebuild momentum and system effectiveness',
          objectives: ['Rebuild consistency', 'Optimize systems', 'Restore confidence'],
          actions: actions.filter(a => a.priority > 3 && a.priority <= 7).map(a => a.description),
          successCriteria: ['Consistent execution', 'Improved system effectiveness', 'Positive momentum']
        },
        {
          name: 'Growth Phase',
          duration: 2,
          description: 'Expand beyond recovery to growth and optimization',
          objectives: ['Expand system scope', 'Increase challenge', 'Optimize performance'],
          actions: actions.filter(a => a.priority > 7).map(a => a.description),
          successCriteria: ['Momentum growth', 'System optimization', 'Sustainable performance']
        }
      ],
      milestones: [
        {
          name: 'Stabilization Achieved',
          targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
          description: 'Initial stabilization and momentum preservation',
          achieved: false
        },
        {
          name: 'Recovery Complete',
          targetDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days
          description: 'Full recovery and return to optimal performance',
          achieved: false
        }
      ],
      checkpoints: [
        {
          day: 1,
          assessments: ['Energy levels', 'System stability', 'Momentum direction'],
          adjustments: ['System complexity', 'Execution timing', 'Recovery intensity'],
          criteria: ['No new system failures', 'Energy levels stable', 'Momentum stabilized']
        },
        {
          day: 3,
          assessments: ['Consistency improvement', 'System effectiveness', 'Recovery progress'],
          adjustments: ['System scope', 'Challenge level', 'Support systems'],
          criteria: ['Consistent execution', 'System effectiveness improving', 'On track for recovery']
        }
      ]
    }

    const successMetrics: RecoveryMetric[] = [
      {
        name: 'Completion Rate',
        target: 80,
        current: 0,
        unit: '%',
        direction: 'increase',
        weight: 0.3
      },
      {
        name: 'Energy Cost',
        target: 50,
        current: 0,
        unit: '%',
        direction: 'decrease',
        weight: 0.2
      },
      {
        name: 'System Effectiveness',
        target: 70,
        current: 0,
        unit: '%',
        direction: 'increase',
        weight: 0.3
      },
      {
        name: 'Momentum Strength',
        target: 60,
        current: 0,
        unit: '%',
        direction: 'increase',
        weight: 0.2
      }
    ]

    return {
      protocol,
      triggers: [{
        type: 'automatic',
        condition: triggerCondition,
        threshold: 80,
        activated: true,
        timestamp: new Date()
      }],
      actions,
      timeline,
      successMetrics,
      estimatedDuration: 6,
      confidence: 85
    }
  }

  /**
   * Monitor recovery progress and adjust plan
   */
  async monitorRecovery(
    plan: RecoveryPlan,
    currentMetrics: Record<string, number>,
    executionHistory: IExecutionQuality[]
  ): Promise<{
    progress: number // 0-100
    status: 'on_track' | 'behind' | 'ahead' | 'stalled'
    adjustments: string[]
    recommendations: string[]
  }> {
    // Update current metrics
    plan.successMetrics.forEach(metric => {
      if (currentMetrics[metric.name] !== undefined) {
        metric.current = currentMetrics[metric.name]
      }
    })

    // Calculate overall progress
    const totalProgress = plan.successMetrics.reduce((sum, metric) => {
      const progress = Math.min(100, Math.max(0, 
        metric.direction === 'increase' 
          ? (metric.current / metric.target) * 100
          : ((metric.target - metric.current) / metric.target) * 100
      ))
      return sum + (progress * metric.weight)
    }, 0)

    // Determine status
    let status: 'on_track' | 'behind' | 'ahead' | 'stalled' = 'on_track'
    if (totalProgress < 30) status = 'behind'
    else if (totalProgress > 80) status = 'ahead'
    else if (this.isProgressStalled(executionHistory)) status = 'stalled'

    // Generate adjustments and recommendations
    const adjustments = this.generateAdjustments(plan, currentMetrics, status)
    const recommendations = this.generateRecommendations(plan, status, currentMetrics)

    return {
      progress: Math.round(totalProgress),
      status,
      adjustments,
      recommendations
    }
  }

  /**
   * Helper methods for resilience assessment
   */
  private calculateOverallResilience(
    systems: IAdaptiveSystem[],
    executionHistory: IExecutionQuality[],
    protocols: IRecoveryProtocol[]
  ): number {
    const systemResilience = this.assessSystemRobustness(systems)
    const momentumResilience = this.assessMomentumStability(executionHistory)
    const recoveryResilience = this.assessRecoveryCapacity(protocols, executionHistory)
    
    return Math.round((systemResilience * 0.4) + (momentumResilience * 0.3) + (recoveryResilience * 0.3))
  }

  private assessBurnoutRisk(executionHistory: IExecutionQuality[], systems: IAdaptiveSystem[]): number {
    if (executionHistory.length < 7) return 30 // Default risk

    const recentExecutions = executionHistory.slice(-7)
    const avgEnergyCost = recentExecutions.reduce((sum, exec) => sum + exec.energyCost, 0) / recentExecutions.length
    const avgCompletion = recentExecutions.reduce((sum, exec) => sum + exec.completionRate, 0) / recentExecutions.length
    
    const avgSystemFriction = systems.reduce((sum, system) => sum + system.frictionCoefficient, 0) / systems.length
    
    // Calculate burnout risk factors
    const energyRisk = Math.max(0, avgEnergyCost - 60)
    const completionRisk = Math.max(0, 60 - avgCompletion)
    const frictionRisk = Math.max(0, avgSystemFriction - 60)
    
    return Math.min(100, Math.round(energyRisk + completionRisk + frictionRisk))
  }

  private assessMomentumStability(executionHistory: IExecutionQuality[]): number {
    if (executionHistory.length < 14) return 50

    const qualityScores = executionHistory.map(exec => exec.quality)
    const recentQuality = qualityScores.slice(-7).reduce((sum, score) => sum + score, 0) / 7
    const olderQuality = qualityScores.slice(-14, -7).reduce((sum, score) => sum + score, 0) / 7
    
    const variance = this.calculateVariance(qualityScores)
    const trend = recentQuality - olderQuality
    
    // Higher stability with lower variance and positive trends
    const stabilityScore = Math.max(0, 100 - (variance * 2)) + Math.max(0, trend)
    
    return Math.min(100, Math.round(stabilityScore))
  }

  private assessSystemRobustness(systems: IAdaptiveSystem[]): number {
    if (systems.length === 0) return 0

    const avgEffectiveness = systems.reduce((sum, system) => sum + system.effectivenessScore, 0) / systems.length
    const avgFriction = systems.reduce((sum, system) => sum + system.frictionCoefficient, 0) / systems.length
    const adaptationCapacity = systems.reduce((sum, system) => sum + system.adaptationHistory.length, 0) / systems.length
    
    const robustness = (avgEffectiveness * 0.5) + ((100 - avgFriction) * 0.3) + (Math.min(100, adaptationCapacity * 10) * 0.2)
    
    return Math.round(robustness)
  }

  private assessRecoveryCapacity(protocols: IRecoveryProtocol[], executionHistory: IExecutionQuality[]): number {
    const protocolCount = protocols.length
    const avgEffectiveness = protocols.reduce((sum, protocol) => sum + protocol.effectiveness, 0) / Math.max(1, protocolCount)
    
    // Check if protocols have been used successfully
    const recentRecovery = executionHistory.filter(exec => exec.quality > 70).length
    const recoverySuccess = Math.min(100, (recentRecovery / Math.max(1, executionHistory.length)) * 100)
    
    return Math.round((avgEffectiveness * 0.6) + (Math.min(100, protocolCount * 20) * 0.2) + (recoverySuccess * 0.2))
  }

  private identifyRiskFactors(systems: IAdaptiveSystem[], executionHistory: IExecutionQuality[]): RiskFactor[] {
    const risks: RiskFactor[] = []

    // Energy depletion risk
    const avgEnergyCost = executionHistory.reduce((sum, exec) => sum + exec.energyCost, 0) / Math.max(1, executionHistory.length)
    if (avgEnergyCost > 70) {
      risks.push({
        type: 'energy_depletion',
        severity: avgEnergyCost > 85 ? 'critical' : 'high',
        probability: avgEnergyCost,
        impact: 80,
        description: 'High energy consumption leading to burnout risk',
        indicators: ['Energy cost > 70%', 'Declining completion rates', 'Increased skip frequency'],
        mitigation: ['Reduce system complexity', 'Optimize timing', 'Add recovery periods']
      })
    }

    // Consistency break risk
    const consistencyScore = this.calculateConsistencyScore(executionHistory)
    if (consistencyScore < 40) {
      risks.push({
        type: 'consistency_break',
        severity: consistencyScore < 25 ? 'critical' : 'high',
        probability: 100 - consistencyScore,
        impact: 70,
        description: 'Breaking consistency patterns leading to momentum loss',
        indicators: ['Irregular execution patterns', 'High variance in completion', 'Missed executions'],
        mitigation: ['Establish fixed routines', 'Reduce system count', 'Focus on core systems']
      })
    }

    // System failure risk
    const atRiskSystems = systems.filter(system => system.effectivenessScore < 30)
    if (atRiskSystems.length > 0) {
      risks.push({
        type: 'system_failure',
        severity: atRiskSystems.length > 2 ? 'critical' : 'high',
        probability: atRiskSystems.length * 20,
        impact: 60,
        description: `${atRiskSystems.length} systems at risk of failure`,
        indicators: ['Low effectiveness scores', 'High friction', 'Poor adaptation history'],
        mitigation: ['System redesign', 'Replace failing systems', 'Reduce complexity']
      })
    }

    return risks
  }

  private identifyProtectiveFactors(
    systems: IAdaptiveSystem[],
    executionHistory: IExecutionQuality[],
    protocols: IRecoveryProtocol[]
  ): ProtectiveFactor[] {
    const factors: ProtectiveFactor[] = []

    // High consistency systems
    const consistentSystems = systems.filter(system => system.effectivenessScore > 70 && system.frictionCoefficient < 40)
    if (consistentSystems.length > 0) {
      factors.push({
        type: 'high_consistency',
        strength: (consistentSystems.length / systems.length) * 100,
        description: `${consistentSystems.length} systems with high effectiveness and low friction`,
        benefits: ['Reliable momentum builders', 'Low energy cost', 'Predictable outcomes']
      })
    }

    // Recovery protocols
    if (protocols.length > 0) {
      factors.push({
        type: 'recovery_protocols',
        strength: Math.min(100, protocols.length * 25),
        description: `${protocols.length} recovery protocols available`,
        benefits: ['Automated recovery triggers', 'Structured recovery process', 'Proven recovery strategies']
      })
    }

    return factors
  }

  private selectOptimalProtocol(assessment: ResilienceAssessment, protocols: IRecoveryProtocol[]): IRecoveryProtocol {
    if (protocols.length === 0) {
      // Return default protocol (use any to avoid Mongoose document issues)
      return {
        userId: this.userId,
        name: 'Default Recovery Protocol',
        trigger: 'High burnout risk or momentum decline',
        conditions: [
          { metric: 'burnoutRisk', operator: 'gt', threshold: 70 },
          { metric: 'momentumStability', operator: 'lt', threshold: 40 }
        ],
        actions: [
          { type: 'system', description: 'Reduce system complexity by 50%', priority: 1, automated: true },
          { type: 'schedule', description: 'Add recovery periods between executions', priority: 2, automated: true },
          { type: 'mindset', description: 'Focus on consistency over intensity', priority: 3, automated: false }
        ],
        effectiveness: 75,
        lastUsed: new Date()
      } as any // Use any to avoid Mongoose document issues
    }

    // Select protocol based on assessment
    return protocols.sort((a, b) => b.effectiveness - a.effectiveness)[0]
  }

  private identifyRecoveryTriggers(assessment: ResilienceAssessment, executionHistory: IExecutionQuality[]): RecoveryTrigger[] {
    const triggers: RecoveryTrigger[] = []

    if (assessment.burnoutRisk > 70) {
      triggers.push({
        type: 'automatic',
        condition: 'burnoutRisk',
        threshold: 70,
        activated: false
      })
    }

    if (assessment.momentumStability < 40) {
      triggers.push({
        type: 'automatic',
        condition: 'momentumStability',
        threshold: 40,
        activated: false
      })
    }

    return triggers
  }

  private planRecoveryActions(
    protocol: IRecoveryProtocol,
    assessment: ResilienceAssessment,
    systems: IAdaptiveSystem[]
  ): RecoveryAction[] {
    return protocol.actions.map(action => ({
      ...action,
      status: 'pending' as const,
      scheduledTime: new Date()
    }))
  }

  private createRecoveryTimeline(protocol: IRecoveryProtocol, assessment: ResilienceAssessment): RecoveryTimeline {
    return {
      phases: [
        {
          name: 'Stabilization',
          duration: 2,
          description: 'Immediate stabilization and damage control',
          objectives: ['Stop decline', 'Stabilize energy', 'Maintain core systems'],
          actions: ['Reduce complexity', 'Add recovery time', 'Focus on essentials'],
          successCriteria: ['No further decline', 'Energy stabilized', 'Core systems maintained']
        },
        {
          name: 'Rebuilding',
          duration: 3,
          description: 'Gradual rebuilding of momentum and systems',
          objectives: ['Rebuild consistency', 'Optimize systems', 'Restore confidence'],
          actions: ['Gradual complexity increase', 'System optimization', 'Momentum building'],
          successCriteria: ['Consistent execution', 'Improved effectiveness', 'Positive momentum']
        },
        {
          name: 'Growth',
          duration: 2,
          description: 'Return to growth and optimization',
          objectives: ['Expand systems', 'Increase challenges', 'Optimize performance'],
          actions: ['System expansion', 'Challenge increase', 'Performance optimization'],
          successCriteria: ['System growth', 'Challenge mastery', 'Peak performance']
        }
      ],
      milestones: [
        {
          name: 'Stabilized',
          targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          description: 'Initial stabilization achieved',
          achieved: false
        },
        {
          name: 'Recovered',
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          description: 'Full recovery completed',
          achieved: false
        }
      ],
      checkpoints: [
        {
          day: 2,
          assessments: ['Energy levels', 'System stability', 'Momentum'],
          adjustments: ['Complexity', 'Timing', 'Support'],
          criteria: ['Stabilized energy', 'No failures', 'Momentum stable']
        },
        {
          day: 5,
          assessments: ['Consistency', 'Effectiveness', 'Progress'],
          adjustments: ['Challenge level', 'System scope', 'Goals'],
          criteria: ['Consistent execution', 'Improving effectiveness', 'On track']
        }
      ]
    }
  }

  private defineRecoveryMetrics(assessment: ResilienceAssessment, protocol: IRecoveryProtocol): RecoveryMetric[] {
    return [
      {
        name: 'Completion Rate',
        target: 80,
        current: 0,
        unit: '%',
        direction: 'increase',
        weight: 0.3
      },
      {
        name: 'Energy Cost',
        target: 50,
        current: assessment.burnoutRisk,
        unit: '%',
        direction: 'decrease',
        weight: 0.2
      },
      {
        name: 'System Effectiveness',
        target: 70,
        current: assessment.systemRobustness,
        unit: '%',
        direction: 'increase',
        weight: 0.3
      },
      {
        name: 'Momentum Stability',
        target: 60,
        current: assessment.momentumStability,
        unit: '%',
        direction: 'increase',
        weight: 0.2
      }
    ]
  }

  private estimateRecoveryDuration(protocol: IRecoveryProtocol, assessment: ResilienceAssessment): number {
    const baseDuration = 7 // Base recovery duration in days
    
    // Adjust based on severity
    const severityMultiplier = assessment.burnoutRisk > 80 ? 1.5 : 
                              assessment.burnoutRisk > 60 ? 1.2 : 1.0
    
    // Adjust based on resilience
    const resilienceAdjustment = assessment.overallResilience > 70 ? -2 :
                                assessment.overallResilience > 50 ? 0 : 2
    
    return Math.round(baseDuration * severityMultiplier + resilienceAdjustment)
  }

  private calculatePlanConfidence(protocol: IRecoveryProtocol, assessment: ResilienceAssessment): number {
    const protocolConfidence = protocol.effectiveness
    const resilienceConfidence = assessment.overallResilience
    const riskConfidence = Math.max(0, 100 - assessment.burnoutRisk)
    
    return Math.round((protocolConfidence * 0.5) + (resilienceConfidence * 0.3) + (riskConfidence * 0.2))
  }

  private isProgressStalled(executionHistory: IExecutionQuality[]): boolean {
    if (executionHistory.length < 5) return false
    
    const recentQuality = executionHistory.slice(-3).map(exec => exec.quality)
    const isStalled = recentQuality.every(quality => quality < 50) && 
                     this.calculateVariance(recentQuality) < 100
    
    return isStalled
  }

  private generateAdjustments(plan: RecoveryPlan, currentMetrics: Record<string, number>, status: string): string[] {
    const adjustments: string[] = []
    
    if (status === 'behind') {
      adjustments.push('Increase recovery intensity', 'Add support systems', 'Reduce system complexity')
    } else if (status === 'stalled') {
      adjustments.push('Change recovery approach', 'Identify blocking factors', 'Adjust timeline')
    } else if (status === 'ahead') {
      adjustments.push('Accelerate timeline', 'Add growth objectives', 'Increase challenges')
    }
    
    return adjustments
  }

  private generateRecommendations(plan: RecoveryPlan, status: string, currentMetrics: Record<string, number>): string[] {
    const recommendations: string[] = []
    
    if (status === 'behind') {
      recommendations.push('Focus on core systems only', 'Increase recovery frequency', 'Seek additional support')
    } else if (status === 'stalled') {
      recommendations.push('Reassess recovery strategy', 'Consider alternative approaches', 'Address root causes')
    } else if (status === 'ahead') {
      recommendations.push('Maintain current momentum', 'Prepare for growth phase', 'Document successful strategies')
    }
    
    return recommendations
  }

  private calculateConsistencyScore(executionHistory: IExecutionQuality[]): number {
    if (executionHistory.length < 3) return 50

    const completionRates = executionHistory.map(exec => exec.completionRate)
    const mean = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
    const variance = this.calculateVariance(completionRates)
    
    return Math.max(0, 100 - (variance * 2))
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0
    
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length
    
    return variance
  }
}
