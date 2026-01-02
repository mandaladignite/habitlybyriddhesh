import { IInsight, IExecutionQuality, IAdaptiveSystem, ICognitiveProfile, IMomentumVector } from '@/types/v2-models'

export interface CognitiveBias {
  type: 'planning_fallacy' | 'perfectionism' | 'optimism_bias' | 'confirmation_bias' | 'sunk_cost_fallacy'
  description: string
  evidence: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  impact: string
  recommendation: string
}

export interface PredictionModel {
  type: 'skip_risk' | 'momentum_shift' | 'system_failure' | 'performance_decline' | 'breakthrough_opportunity'
  confidence: number // 0-100
  timeframe: string
  factors: PredictionFactor[]
  outcome: PredictionOutcome
  mitigation?: string[]
}

export interface PredictionFactor {
  factor: string
  weight: number // 0-1
  value: number
  contribution: number // 0-100
}

export interface PredictionOutcome {
  probability: number // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical'
  description: string
  scenarios: PredictionScenario[]
}

export interface PredictionScenario {
  name: string
  probability: number // 0-100
  description: string
  triggers: string[]
}

export interface InsightGeneration {
  insights: IInsight[]
  cognitiveBiases: CognitiveBias[]
  predictions: PredictionModel[]
  leveragePoints: LeveragePoint[]
  frictionPoints: FrictionPoint[]
}

export interface LeveragePoint {
  systemId: string
  systemName: string
  type: 'high_impact' | 'low_friction' | 'momentum_builder' | 'catalyst'
  potentialImpact: number // 0-100
  effortRequired: number // 0-100
  roi: number // return on investment
  description: string
  actionSteps: string[]
}

export interface FrictionPoint {
  systemId: string
  systemName: string
  type: 'energy' | 'time' | 'complexity' | 'context' | 'motivation'
  severity: number // 0-100
  frequency: number
  description: string
  solutions: string[]
}

export class InsightPredictionEngine {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Generate comprehensive insights, predictions, and cognitive bias analysis
   */
  async generateInsights(
    executionHistory: IExecutionQuality[],
    systems: IAdaptiveSystem[],
    profile: ICognitiveProfile,
    momentumVector: IMomentumVector
  ): Promise<InsightGeneration> {
    const insights = this.generateExecutionInsights(executionHistory, systems, momentumVector)
    const cognitiveBiases = this.detectCognitiveBiases(executionHistory, systems, profile)
    const predictions = this.generatePredictions(executionHistory, systems, momentumVector)
    const leveragePoints = this.identifyLeveragePoints(systems, executionHistory)
    const frictionPoints = this.identifyFrictionPoints(systems, executionHistory)

    return {
      insights,
      cognitiveBiases,
      predictions,
      leveragePoints,
      frictionPoints
    }
  }

  /**
   * Generate execution insights based on patterns and anomalies
   */
  private generateExecutionInsights(
    executionHistory: IExecutionQuality[],
    systems: IAdaptiveSystem[],
    momentumVector: IMomentumVector
  ): IInsight[] {
    const insights: any[] = [] // Use any for now to avoid Mongoose document issues

    // Momentum insights
    if (momentumVector.direction === 'decreasing' && momentumVector.strength < 40) {
      insights.push({
        userId: this.userId,
        type: 'pattern',
        title: 'Momentum Decline Detected',
        description: 'Your overall momentum is decreasing with low strength',
        evidence: `Direction: ${momentumVector.direction}, Strength: ${momentumVector.strength}%`,
        recommendedAction: 'Focus on high-consistency, low-friction systems to rebuild momentum',
        priority: 'high',
        dismissed: false,
        actedUpon: false,
        createdAt: new Date()
      })
    }

    // Consistency insights
    const consistencyScore = this.calculateConsistencyScore(executionHistory)
    if (consistencyScore < 50) {
      insights.push({
        userId: this.userId,
        type: 'pattern',
        title: 'Inconsistent Execution Pattern',
        description: 'Your execution consistency is below optimal levels',
        evidence: `Consistency score: ${consistencyScore}%`,
        recommendedAction: 'Establish fixed execution times and reduce system complexity',
        priority: 'medium',
        dismissed: false,
        actedUpon: false,
        createdAt: new Date()
      })
    }

    // Energy efficiency insights
    const energyEfficiency = this.calculateEnergyEfficiency(executionHistory)
    if (energyEfficiency < 60) {
      insights.push({
        userId: this.userId,
        type: 'friction',
        title: 'High Energy Cost Detected',
        description: 'Your systems are requiring more energy than optimal',
        evidence: `Energy efficiency: ${energyEfficiency}%`,
        recommendedAction: 'Optimize timing, reduce friction, or break down complex systems',
        priority: 'medium',
        dismissed: false,
        actedUpon: false,
        createdAt: new Date()
      })
    }

    // System effectiveness insights
    for (const system of systems) {
      if (system.effectivenessScore < 40 && system.frictionCoefficient > 70) {
        insights.push({
          userId: this.userId,
          type: 'leverage',
          title: `System "${system.name}" Needs Redesign`,
          description: 'High friction with low effectiveness indicates system misalignment',
          evidence: `Effectiveness: ${system.effectivenessScore}%, Friction: ${system.frictionCoefficient}%`,
          recommendedAction: 'Consider redesigning or replacing this system with a simpler alternative',
          priority: 'high',
          dismissed: false,
          actedUpon: false,
          createdAt: new Date()
        })
      }
    }

    return insights.sort((a: any, b: any) => {
      const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * Detect cognitive biases in user behavior and patterns
   */
  private detectCognitiveBiases(
    executionHistory: IExecutionQuality[],
    systems: IAdaptiveSystem[],
    profile: ICognitiveProfile
  ): CognitiveBias[] {
    const biases: CognitiveBias[] = []

    // Planning fallacy detection
    const planningFallacy = this.detectPlanningFallacy(executionHistory, systems)
    if (planningFallacy) biases.push(planningFallacy)

    // Perfectionism detection
    const perfectionism = this.detectPerfectionism(executionHistory, systems)
    if (perfectionism) biases.push(perfectionism)

    // Optimism bias detection
    const optimismBias = this.detectOptimismBias(executionHistory, systems)
    if (optimismBias) biases.push(optimismBias)

    // Confirmation bias detection
    const confirmationBias = this.detectConfirmationBias(systems, profile)
    if (confirmationBias) biases.push(confirmationBias)

    // Sunk cost fallacy detection
    const sunkCostFallacy = this.detectSunkCostFallacy(systems, executionHistory)
    if (sunkCostFallacy) biases.push(sunkCostFallacy)

    return biases
  }

  /**
   * Generate predictions about future performance and risks
   */
  private generatePredictions(
    executionHistory: IExecutionQuality[],
    systems: IAdaptiveSystem[],
    momentumVector: IMomentumVector
  ): PredictionModel[] {
    const predictions: PredictionModel[] = []

    // Skip risk prediction
    const skipRiskPrediction = this.predictSkipRisk(executionHistory, systems)
    if (skipRiskPrediction) predictions.push(skipRiskPrediction)

    // Momentum shift prediction
    const momentumShiftPrediction = this.predictMomentumShift(momentumVector, executionHistory)
    if (momentumShiftPrediction) predictions.push(momentumShiftPrediction)

    // System failure prediction
    const systemFailurePrediction = this.predictSystemFailure(systems, executionHistory)
    if (systemFailurePrediction) predictions.push(systemFailurePrediction)

    // Performance decline prediction
    const performanceDeclinePrediction = this.predictPerformanceDecline(executionHistory)
    if (performanceDeclinePrediction) predictions.push(performanceDeclinePrediction)

    // Breakthrough opportunity prediction
    const breakthroughPrediction = this.predictBreakthroughOpportunity(systems, momentumVector)
    if (breakthroughPrediction) predictions.push(breakthroughPrediction)

    return predictions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Identify high-leverage opportunities
   */
  private identifyLeveragePoints(systems: IAdaptiveSystem[], executionHistory: IExecutionQuality[]): LeveragePoint[] {
    const leveragePoints: LeveragePoint[] = []

    for (const system of systems) {
      const systemExecutions = executionHistory.filter(exec => exec.systemId === system._id.toString())
      const avgQuality = systemExecutions.length > 0
        ? systemExecutions.reduce((sum, exec) => sum + exec.quality, 0) / systemExecutions.length
        : 50

      // High impact, low friction systems
      if (system.effectivenessScore > 70 && system.frictionCoefficient < 40) {
        leveragePoints.push({
          systemId: system._id.toString(),
          systemName: system.name,
          type: 'high_impact',
          potentialImpact: system.effectivenessScore,
          effortRequired: system.frictionCoefficient,
          roi: (system.effectivenessScore / Math.max(1, system.frictionCoefficient)) * 10,
          description: 'High effectiveness with low friction makes this an excellent leverage point',
          actionSteps: [
            'Increase frequency or scope',
            'Use as momentum builder for other systems',
            'Share success patterns with other systems'
          ]
        })
      }

      // Momentum builders
      if (avgQuality > 80 && systemExecutions.length > 10) {
        leveragePoints.push({
          systemId: system._id.toString(),
          systemName: system.name,
          type: 'momentum_builder',
          potentialImpact: avgQuality,
          effortRequired: system.frictionCoefficient,
          roi: (avgQuality / Math.max(1, system.frictionCoefficient)) * 8,
          description: 'Consistent high quality execution makes this a reliable momentum builder',
          actionSteps: [
            'Use to start difficult days',
            'Chain with higher-friction systems',
            'Expand scope gradually'
          ]
        })
      }
    }

    return leveragePoints.sort((a, b) => b.roi - a.roi)
  }

  /**
   * Identify friction points that hinder execution
   */
  private identifyFrictionPoints(systems: IAdaptiveSystem[], executionHistory: IExecutionQuality[]): FrictionPoint[] {
    const frictionPoints: FrictionPoint[] = []

    for (const system of systems) {
      const systemExecutions = executionHistory.filter(exec => exec.systemId === system._id.toString())
      
      // High friction systems
      if (system.frictionCoefficient > 70) {
        const avgEnergyCost = systemExecutions.length > 0
          ? systemExecutions.reduce((sum, exec) => sum + exec.energyCost, 0) / systemExecutions.length
          : 70

        frictionPoints.push({
          systemId: system._id.toString(),
          systemName: system.name,
          type: 'complexity',
          severity: system.frictionCoefficient,
          frequency: systemExecutions.length,
          description: `High friction system requiring ${avgEnergyCost.toFixed(0)}% energy on average`,
          solutions: [
            'Break down into smaller components',
            'Reduce scope to minimum viable version',
            'Automate or eliminate parts of the system',
            'Change timing to match energy patterns'
          ]
        })
      }

      // Energy friction
      if (systemExecutions.length > 0) {
        const avgEnergyCost = systemExecutions.reduce((sum, exec) => sum + exec.energyCost, 0) / systemExecutions.length
        if (avgEnergyCost > 70) {
          frictionPoints.push({
            systemId: system._id.toString(),
            systemName: system.name,
            type: 'energy',
            severity: avgEnergyCost,
            frequency: systemExecutions.length,
            description: `High energy cost indicates timing or context mismatch`,
            solutions: [
              'Reschedule to optimal energy windows',
              'Optimize environment for better execution',
              'Reduce system complexity',
              'Consider energy-matching alternatives'
            ]
          })
        }
      }
    }

    return frictionPoints.sort((a, b) => b.severity - a.severity)
  }

  /**
   * Cognitive bias detection methods
   */
  private detectPlanningFallacy(executionHistory: IExecutionQuality[], systems: IAdaptiveSystem[]): CognitiveBias | null {
    // Check if planned execution time consistently underestimates actual time
    const recentExecutions = executionHistory.slice(-10)
    if (recentExecutions.length < 5) return null

    const avgEnergyCost = recentExecutions.reduce((sum, exec) => sum + exec.energyCost, 0) / recentExecutions.length
    
    if (avgEnergyCost > 75) {
      return {
        type: 'planning_fallacy',
        description: 'Consistently underestimating the time and energy required for execution',
        evidence: [
          `Average energy cost: ${avgEnergyCost.toFixed(0)}%`,
          'Systems may be too complex for current capacity'
        ],
        severity: avgEnergyCost > 85 ? 'high' : 'medium',
        impact: 'Leads to overcommitment and burnout',
        recommendation: 'Use historical data to set realistic expectations and add buffer time'
      }
    }

    return null
  }

  private detectPerfectionism(executionHistory: IExecutionQuality[], systems: IAdaptiveSystem[]): CognitiveBias | null {
    // Check for high quality but low completion rates
    const recentExecutions = executionHistory.slice(-10)
    if (recentExecutions.length < 5) return null

    const avgQuality = recentExecutions.reduce((sum, exec) => sum + exec.quality, 0) / recentExecutions.length
    const avgCompletion = recentExecutions.reduce((sum, exec) => sum + exec.completionRate, 0) / recentExecutions.length

    if (avgQuality > 85 && avgCompletion < 60) {
      return {
        type: 'perfectionism',
        description: 'Prioritizing perfect execution over consistent completion',
        evidence: [
          `High quality: ${avgQuality.toFixed(0)}%`,
          `Low completion: ${avgCompletion.toFixed(0)}%`
        ],
        severity: 'medium',
        impact: 'Reduces overall progress and momentum',
        recommendation: 'Focus on "good enough" execution and prioritize consistency over perfection'
      }
    }

    return null
  }

  private detectOptimismBias(executionHistory: IExecutionQuality[], systems: IAdaptiveSystem[]): CognitiveBias | null {
    // Check if effectiveness scores are consistently higher than actual execution quality
    const systemEffectiveness = systems.reduce((sum, system) => sum + system.effectivenessScore, 0) / systems.length
    const actualQuality = executionHistory.length > 0
      ? executionHistory.reduce((sum, exec) => sum + exec.quality, 0) / executionHistory.length
      : 50

    if (systemEffectiveness - actualQuality > 20) {
      return {
        type: 'optimism_bias',
        description: 'Overestimating system effectiveness compared to actual performance',
        evidence: [
          `Perceived effectiveness: ${systemEffectiveness.toFixed(0)}%`,
          `Actual quality: ${actualQuality.toFixed(0)}%`
        ],
        severity: 'medium',
        impact: 'Leads to poor system selection and unrealistic expectations',
        recommendation: 'Base system evaluations on actual execution data rather than perceived effectiveness'
      }
    }

    return null
  }

  private detectConfirmationBias(systems: IAdaptiveSystem[], profile: ICognitiveProfile): CognitiveBias | null {
    // Check if user only keeps systems that confirm their existing preferences
    const lockedSystems = systems.filter(system => system.locked).length
    const totalSystems = systems.length

    if (totalSystems > 5 && (lockedSystems / totalSystems) > 0.6) {
      return {
        type: 'confirmation_bias',
        description: 'Resisting change and locking in systems that confirm existing preferences',
        evidence: [
          `${lockedSystems} of ${totalSystems} systems are locked`,
          'High resistance to adaptation'
        ],
        severity: 'medium',
        impact: 'Prevents system evolution and optimization',
        recommendation: 'Regularly review locked systems and be open to adaptation based on performance data'
      }
    }

    return null
  }

  private detectSunkCostFallacy(systems: IAdaptiveSystem[], executionHistory: IExecutionQuality[]): CognitiveBias | null {
    // Check for systems with low effectiveness but high investment (many adaptations)
    for (const system of systems) {
      if (system.effectivenessScore < 40 && system.adaptationHistory.length > 5) {
        const positiveAdaptations = system.adaptationHistory.filter(adaptation => adaptation.impact > 0).length
        const totalAdaptations = system.adaptationHistory.length

        if (positiveAdaptations / totalAdaptations < 0.3) {
          return {
            type: 'sunk_cost_fallacy',
            description: `Continuing to invest in "${system.name}" despite poor performance`,
            evidence: [
              `Low effectiveness: ${system.effectivenessScore}%`,
              `${totalAdaptations} adaptations with low success rate`,
              'Continued investment despite poor returns'
            ],
            severity: 'high',
            impact: 'Wastes resources and prevents focus on more effective systems',
            recommendation: 'Consider replacing this system with a more effective alternative'
          }
        }
      }
    }

    return null
  }

  /**
   * Prediction methods
   */
  private predictSkipRisk(executionHistory: IExecutionQuality[], systems: IAdaptiveSystem[]): PredictionModel | null {
    if (executionHistory.length < 7) return null

    const recentCompletion = executionHistory.slice(-7).reduce((sum, exec) => sum + exec.completionRate, 0) / 7
    const skipRisk = Math.max(0, 100 - recentCompletion)

    if (skipRisk > 60) {
      return {
        type: 'skip_risk',
        confidence: skipRisk,
        timeframe: 'Next 3-5 days',
        factors: [
          { factor: 'Recent completion rate', weight: 0.6, value: recentCompletion, contribution: 60 },
          { factor: 'System friction', weight: 0.3, value: systems.reduce((sum, s) => sum + s.frictionCoefficient, 0) / systems.length, contribution: 30 },
          { factor: 'Energy patterns', weight: 0.1, value: 50, contribution: 10 }
        ],
        outcome: {
          probability: skipRisk,
          impact: skipRisk > 80 ? 'critical' : skipRisk > 70 ? 'high' : 'medium',
          description: `${skipRisk.toFixed(0)}% probability of skipping systems in the next few days`,
          scenarios: [
            {
              name: 'High skip scenario',
              probability: skipRisk,
              description: 'Multiple systems skipped, momentum decline',
              triggers: ['Low energy', 'High cognitive load', 'Environmental disruptions']
            },
            {
              name: 'Recovery scenario',
              probability: 100 - skipRisk,
              description: 'Successful execution with adaptation',
              triggers: ['Proactive intervention', 'System simplification', 'Timing adjustment']
            }
          ]
        },
        mitigation: [
          'Reduce system complexity',
          'Reschedule to optimal energy windows',
          'Implement micro-commitment fallbacks'
        ]
      }
    }

    return null
  }

  private predictMomentumShift(momentumVector: IMomentumVector, executionHistory: IExecutionQuality[]): PredictionModel | null {
    if (momentumVector.direction === 'decreasing' && momentumVector.strength < 40) {
      return {
        type: 'momentum_shift',
        confidence: 75,
        timeframe: 'Next 7-10 days',
        factors: [
          { factor: 'Current direction', weight: 0.4, value: momentumVector.direction === 'decreasing' ? 20 : 80, contribution: 40 },
          { factor: 'Momentum strength', weight: 0.3, value: momentumVector.strength, contribution: 30 },
          { factor: 'Consistency score', weight: 0.3, value: momentumVector.consistencyMomentum, contribution: 30 }
        ],
        outcome: {
          probability: 70,
          impact: 'high',
          description: 'Significant momentum shift likely without intervention',
          scenarios: [
            {
              name: 'Negative momentum spiral',
              probability: 70,
              description: 'Continued decline leading to system abandonment',
              triggers: ['Low consistency', 'High friction', 'Energy mismatch']
            },
            {
              name: 'Momentum recovery',
              probability: 30,
              description: 'Successful intervention and momentum rebuilding',
              triggers: ['System optimization', 'Focus on high-consistency systems', 'Energy alignment']
            }
          ]
        },
        mitigation: [
          'Focus on 1-2 high-consistency systems',
          'Reduce overall system complexity',
          'Align execution with energy patterns'
        ]
      }
    }

    return null
  }

  private predictSystemFailure(systems: IAdaptiveSystem[], executionHistory: IExecutionQuality[]): PredictionModel | null {
    const atRiskSystems = systems.filter(system => 
      system.effectivenessScore < 30 && system.frictionCoefficient > 80
    )

    if (atRiskSystems.length > 0) {
      return {
        type: 'system_failure',
        confidence: 85,
        timeframe: 'Next 2 weeks',
        factors: [
          { factor: 'System effectiveness', weight: 0.5, value: atRiskSystems[0].effectivenessScore, contribution: 50 },
          { factor: 'System friction', weight: 0.3, value: atRiskSystems[0].frictionCoefficient, contribution: 30 },
          { factor: 'Historical performance', weight: 0.2, value: 25, contribution: 20 }
        ],
        outcome: {
          probability: 80,
          impact: 'medium',
          description: `${atRiskSystems.length} system(s) at risk of failure`,
          scenarios: [
            {
              name: 'System abandonment',
              probability: 80,
              description: 'Systems become too difficult to maintain',
              triggers: ['Consistent low performance', 'High energy cost', 'User frustration']
            },
            {
              name: 'System redesign',
              probability: 20,
              description: 'Successful system redesign and recovery',
              triggers: ['Proactive intervention', 'System simplification', 'Alternative approaches']
            }
          ]
        },
        mitigation: [
          'Immediate system redesign',
          'Break down into simpler components',
          'Consider system replacement'
        ]
      }
    }

    return null
  }

  private predictPerformanceDecline(executionHistory: IExecutionQuality[]): PredictionModel | null {
    if (executionHistory.length < 14) return null

    const recentQuality = executionHistory.slice(-7).reduce((sum, exec) => sum + exec.quality, 0) / 7
    const olderQuality = executionHistory.slice(-14, -7).reduce((sum, exec) => sum + exec.quality, 0) / 7
    const qualityDecline = olderQuality - recentQuality

    if (qualityDecline > 15) {
      return {
        type: 'performance_decline',
        confidence: Math.min(90, 60 + qualityDecline),
        timeframe: 'Next 1-2 weeks',
        factors: [
          { factor: 'Quality decline rate', weight: 0.6, value: qualityDecline, contribution: 60 },
          { factor: 'Energy efficiency', weight: 0.2, value: 50, contribution: 20 },
          { factor: 'Context alignment', weight: 0.2, value: 50, contribution: 20 }
        ],
        outcome: {
          probability: Math.min(85, 50 + qualityDecline),
          impact: qualityDecline > 25 ? 'high' : 'medium',
          description: `Performance declining by ${qualityDecline.toFixed(0)}% per week`,
          scenarios: [
            {
              name: 'Continued decline',
              probability: 70,
              description: 'Performance continues to decline without intervention',
              triggers: ['Burnout', 'System fatigue', 'Context mismatch']
            },
            {
              name: 'Performance recovery',
              probability: 30,
              description: 'Successful intervention and performance recovery',
              triggers: ['Rest and recovery', 'System optimization', 'Context adjustment']
            }
          ]
        },
        mitigation: [
          'Take recovery days',
          'Review and optimize systems',
          'Adjust execution context'
        ]
      }
    }

    return null
  }

  private predictBreakthroughOpportunity(systems: IAdaptiveSystem[], momentumVector: IMomentumVector): PredictionModel | null {
    const highPotentialSystems = systems.filter(system => 
      system.effectivenessScore > 70 && 
      system.frictionCoefficient < 50 &&
      momentumVector.consistencyMomentum > 70
    )

    if (highPotentialSystems.length > 0 && momentumVector.direction === 'increasing') {
      return {
        type: 'breakthrough_opportunity',
        confidence: 75,
        timeframe: 'Next 2-3 weeks',
        factors: [
          { factor: 'System quality', weight: 0.4, value: highPotentialSystems[0].effectivenessScore, contribution: 40 },
          { factor: 'Momentum direction', weight: 0.3, value: momentumVector.direction === 'increasing' ? 80 : 20, contribution: 30 },
          { factor: 'Consistency level', weight: 0.3, value: momentumVector.consistencyMomentum, contribution: 30 }
        ],
        outcome: {
          probability: 70,
          impact: 'high',
          description: 'Breakthrough opportunity with current systems and momentum',
          scenarios: [
            {
              name: 'Breakthrough achieved',
              probability: 70,
              description: 'Significant progress and system optimization',
              triggers: ['Maintained consistency', 'Energy alignment', 'System synergy']
            },
            {
              name: 'Opportunity missed',
              probability: 30,
              description: 'Breakthrough opportunity not fully realized',
              triggers: ['Loss of consistency', 'Energy disruption', 'System interference']
            }
          ]
        },
        mitigation: [
          'Maintain current execution patterns',
          'Expand successful systems',
          'Protect momentum from disruptions'
        ]
      }
    }

    return null
  }

  /**
   * Helper methods
   */
  private calculateConsistencyScore(executionHistory: IExecutionQuality[]): number {
    if (executionHistory.length < 7) return 50

    const completionRates = executionHistory.map(exec => exec.completionRate)
    const mean = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
    const variance = completionRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / completionRates.length
    const standardDeviation = Math.sqrt(variance)
    
    return Math.max(0, 100 - (standardDeviation * 2))
  }

  private calculateEnergyEfficiency(executionHistory: IExecutionQuality[]): number {
    if (executionHistory.length === 0) return 50

    const efficiencyScores = executionHistory.map(exec => {
      if (exec.energyCost === 0) return exec.completionRate
      return (exec.completionRate / exec.energyCost) * 100
    })
    
    const avgEfficiency = efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length
    return Math.min(100, avgEfficiency)
  }
}
