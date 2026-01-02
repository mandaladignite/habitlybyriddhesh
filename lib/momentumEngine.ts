import { IMomentumVector, IMomentumForecast, IExecutionQuality, IAdaptiveSystem } from '@/types/v2-models'

export interface MomentumMetrics {
  consistencyScore: number // 0-100
  difficultyGrowthScore: number // 0-100
  impactScore: number // 0-100
  learningScore: number // 0-100
  overallMomentum: number // 0-100
  direction: 'increasing' | 'decreasing' | 'stable'
  strength: number // 0-100
}

export interface MomentumTrend {
  metric: string
  currentValue: number
  previousValue: number
  change: number
  trend: 'up' | 'down' | 'stable'
  significance: 'high' | 'medium' | 'low'
}

export interface MomentumBreakpoint {
  type: 'positive' | 'negative'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timeframe: string
  factors: string[]
  recommendations: string[]
}

export class MomentumEngine {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Calculate comprehensive momentum metrics across multiple dimensions
   */
  async calculateMomentum(
    executionHistory: IExecutionQuality[],
    systems: IAdaptiveSystem[],
    historicalVectors: IMomentumVector[] = []
  ): Promise<{
    current: MomentumMetrics
    trends: MomentumTrend[]
    breakpoints: MomentumBreakpoint[]
    forecast: IMomentumForecast[]
  }> {
    const current = this.calculateCurrentMomentum(executionHistory, systems)
    const trends = this.analyzeMomentumTrends(current, historicalVectors)
    const breakpoints = this.identifyMomentumBreakpoints(current, trends, executionHistory)
    const forecast = this.generateMomentumForecast(current, trends, historicalVectors)

    return {
      current,
      trends,
      breakpoints,
      forecast
    }
  }

  /**
   * Calculate current momentum across all dimensions
   */
  private calculateCurrentMomentum(
    executionHistory: IExecutionQuality[],
    systems: IAdaptiveSystem[]
  ): MomentumMetrics {
    const consistencyScore = this.calculateConsistencyMomentum(executionHistory)
    const difficultyGrowthScore = this.calculateDifficultyGrowthMomentum(executionHistory, systems)
    const impactScore = this.calculateImpactMomentum(executionHistory, systems)
    const learningScore = this.calculateLearningMomentum(executionHistory, systems)

    // Weighted average for overall momentum
    const overallMomentum = Math.round(
      (consistencyScore * 0.4) +
      (difficultyGrowthScore * 0.25) +
      (impactScore * 0.2) +
      (learningScore * 0.15)
    )

    const direction = this.determineMomentumDirection(overallMomentum, executionHistory)
    const strength = this.calculateMomentumStrength(consistencyScore, difficultyGrowthScore, impactScore, learningScore)

    return {
      consistencyScore,
      difficultyGrowthScore,
      impactScore,
      learningScore,
      overallMomentum,
      direction,
      strength
    }
  }

  /**
   * Calculate consistency momentum based on execution regularity
   */
  private calculateConsistencyMomentum(executionHistory: IExecutionQuality[]): number {
    if (executionHistory.length < 7) return 50 // Insufficient data

    const recentExecutions = executionHistory.slice(-14) // Last 2 weeks
    const completionRates = recentExecutions.map(exec => exec.completionRate)
    
    // Calculate consistency (inverse of variance)
    const mean = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
    const variance = completionRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / completionRates.length
    const standardDeviation = Math.sqrt(variance)
    
    // Lower variance = higher consistency
    const consistencyScore = Math.max(0, 100 - (standardDeviation * 2))
    
    // Bonus for high completion rates
    const avgCompletionRate = mean
    const completionBonus = Math.max(0, (avgCompletionRate - 70) * 0.5)
    
    return Math.min(100, Math.round(consistencyScore + completionBonus))
  }

  /**
   * Calculate difficulty growth momentum based on progressive challenge increase
   */
  private calculateDifficultyGrowthMomentum(
    executionHistory: IExecutionQuality[],
    systems: IAdaptiveSystem[]
  ): number {
    if (executionHistory.length < 14) return 50 // Insufficient data

    // Analyze energy cost trends over time
    const energyCosts = executionHistory.map(exec => exec.energyCost)
    const recentEnergy = energyCosts.slice(-7).reduce((sum, cost) => sum + cost, 0) / 7
    const olderEnergy = energyCosts.slice(-14, -7).reduce((sum, cost) => sum + cost, 0) / 7
    
    // Calculate energy efficiency improvement
    const energyImprovement = ((olderEnergy - recentEnergy) / olderEnergy) * 100
    
    // Analyze system complexity progression
    const avgSystemFriction = systems.reduce((sum, system) => sum + system.frictionCoefficient, 0) / systems.length
    const complexityScore = Math.max(0, 100 - avgSystemFriction)
    
    // Combine energy efficiency with complexity handling
    const growthScore = (energyImprovement * 0.6) + (complexityScore * 0.4)
    
    return Math.max(0, Math.min(100, Math.round(50 + growthScore)))
  }

  /**
   * Calculate impact momentum based on goal alignment and effectiveness
   */
  private calculateImpactMomentum(
    executionHistory: IExecutionQuality[],
    systems: IAdaptiveSystem[]
  ): number {
    if (executionHistory.length === 0 || systems.length === 0) return 50

    // Calculate average system effectiveness
    const avgSystemEffectiveness = systems.reduce((sum, system) => sum + system.effectivenessScore, 0) / systems.length
    
    // Calculate average execution quality
    const avgExecutionQuality = executionHistory.reduce((sum, exec) => sum + exec.quality, 0) / executionHistory.length
    
    // Calculate sequence effectiveness (how well systems work together)
    const avgSequenceEffectiveness = executionHistory.reduce((sum, exec) => sum + exec.sequenceEffectiveness, 0) / executionHistory.length
    
    // Weighted combination
    const impactScore = (avgSystemEffectiveness * 0.4) + (avgExecutionQuality * 0.4) + (avgSequenceEffectiveness * 0.2)
    
    return Math.round(impactScore)
  }

  /**
   * Calculate learning momentum based on adaptation and improvement
   */
  private calculateLearningMomentum(
    executionHistory: IExecutionQuality[],
    systems: IAdaptiveSystem[]
  ): number {
    if (systems.length === 0) return 50

    // Count adaptations across all systems
    const totalAdaptations = systems.reduce((sum, system) => sum + system.adaptationHistory.length, 0)
    const avgAdaptationsPerSystem = totalAdaptations / systems.length
    
    // Calculate adaptation impact
    const adaptationImpacts = systems.flatMap(system => 
      system.adaptationHistory.map(adaptation => adaptation.impact)
    )
    const avgAdaptationImpact = adaptationImpacts.length > 0
      ? adaptationImpacts.reduce((sum, impact) => sum + impact, 0) / adaptationImpacts.length
      : 0
    
    // Calculate learning from execution patterns
    const contextFitImprovement = this.calculateContextFitImprovement(executionHistory)
    
    // Combine learning metrics
    const learningScore = (avgAdaptationsPerSystem * 10) + (avgAdaptationImpact * 0.5) + (contextFitImprovement * 0.4)
    
    return Math.max(0, Math.min(100, Math.round(learningScore)))
  }

  /**
   * Determine momentum direction based on recent trends
   */
  private determineMomentumDirection(
    overallMomentum: number,
    executionHistory: IExecutionQuality[]
  ): 'increasing' | 'decreasing' | 'stable' {
    if (executionHistory.length < 7) return 'stable'

    const recentQuality = executionHistory.slice(-7).reduce((sum, exec) => sum + exec.quality, 0) / 7
    const olderQuality = executionHistory.slice(-14, -7).reduce((sum, exec) => sum + exec.quality, 0) / 7
    
    const qualityChange = recentQuality - olderQuality
    
    if (qualityChange > 5) return 'increasing'
    if (qualityChange < -5) return 'decreasing'
    return 'stable'
  }

  /**
   * Calculate momentum strength based on consistency across dimensions
   */
  private calculateMomentumStrength(
    consistency: number,
    difficultyGrowth: number,
    impact: number,
    learning: number
  ): number {
    const scores = [consistency, difficultyGrowth, impact, learning]
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    // Higher strength when all dimensions are balanced and high
    const balance = Math.max(0, 100 - (standardDeviation * 2))
    const overall = mean
    
    return Math.round((balance * 0.4) + (overall * 0.6))
  }

  /**
   * Analyze momentum trends over time
   */
  private analyzeMomentumTrends(
    current: MomentumMetrics,
    historicalVectors: IMomentumVector[]
  ): MomentumTrend[] {
    const trends: MomentumTrend[] = []
    
    if (historicalVectors.length === 0) return trends

    const previousVector = historicalVectors[historicalVectors.length - 1]
    
    const metrics = [
      { name: 'Consistency', current: current.consistencyScore, previous: previousVector.consistencyMomentum },
      { name: 'Growth', current: current.difficultyGrowthScore, previous: previousVector.difficultyGrowthMomentum },
      { name: 'Impact', current: current.impactScore, previous: previousVector.impactMomentum },
      { name: 'Learning', current: current.learningScore, previous: previousVector.learningMomentum },
      { name: 'Overall', current: current.overallMomentum, previous: previousVector.overallMomentum }
    ]

    for (const metric of metrics) {
      const change = metric.current - metric.previous
      const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
      const significance = Math.abs(change) > 15 ? 'high' : Math.abs(change) > 8 ? 'medium' : 'low'
      
      trends.push({
        metric: metric.name,
        currentValue: metric.current,
        previousValue: metric.previous,
        change,
        trend,
        significance
      })
    }

    return trends
  }

  /**
   * Identify momentum breakpoints (potential turning points)
   */
  private identifyMomentumBreakpoints(
    current: MomentumMetrics,
    trends: MomentumTrend[],
    executionHistory: IExecutionQuality[]
  ): MomentumBreakpoint[] {
    const breakpoints: MomentumBreakpoint[] = []

    // Negative breakpoints
    if (current.consistencyScore < 40) {
      breakpoints.push({
        type: 'negative',
        description: 'Consistency breakdown detected',
        severity: current.consistencyScore < 25 ? 'critical' : 'high',
        timeframe: 'This week',
        factors: ['Low completion rates', 'High variance in execution'],
        recommendations: ['Return to basics', 'Reduce system complexity', 'Focus on core habits']
      })
    }

    if (current.overallMomentum < 30 && current.direction === 'decreasing') {
      breakpoints.push({
        type: 'negative',
        description: 'Momentum collapse imminent',
        severity: 'critical',
        timeframe: 'Next 3-5 days',
        factors: ['Declining overall momentum', 'Negative direction', 'Low strength'],
        recommendations: ['Activate recovery protocol', 'Pause non-essential systems', 'Focus on 1-2 core systems']
      })
    }

    // Positive breakpoints
    if (current.overallMomentum > 80 && current.direction === 'increasing') {
      breakpoints.push({
        type: 'positive',
        description: 'Momentum acceleration point',
        severity: 'high',
        timeframe: 'This week',
        factors: ['High overall momentum', 'Positive direction', 'Strong consistency'],
        recommendations: ['Introduce new challenges', 'Expand system scope', 'Leverage peak performance']
      })
    }

    if (current.learningScore > 85) {
      breakpoints.push({
        type: 'positive',
        description: 'Learning acceleration detected',
        severity: 'medium',
        timeframe: 'Next 2 weeks',
        factors: ['High adaptation success', 'Rapid skill acquisition'],
        recommendations: ['Increase system complexity', 'Add new systems', 'Experiment with advanced strategies']
      })
    }

    return breakpoints
  }

  /**
   * Generate momentum forecast for next 3 days
   */
  private generateMomentumForecast(
    current: MomentumMetrics,
    trends: MomentumTrend[],
    historicalVectors: IMomentumVector[]
  ): IMomentumForecast[] {
    const forecast: IMomentumForecast[] = []
    
    // Simple linear forecast based on current trends
    const overallTrend = trends.find(t => t.metric === 'Overall')
    const dailyChange = overallTrend ? overallTrend.change / 7 : 0 // Daily change approximation
    
    for (let i = 1; i <= 3; i++) {
      const forecastDate = new Date()
      forecastDate.setDate(forecastDate.getDate() + i)
      
      const predictedMomentum = Math.max(0, Math.min(100, current.overallMomentum + (dailyChange * i)))
      const confidence = Math.max(20, 100 - (i * 15)) // Decreasing confidence over time
      
      const factors = []
      if (current.direction === 'increasing') factors.push('Positive momentum direction')
      if (current.strength > 70) factors.push('Strong momentum strength')
      if (current.consistencyScore > 70) factors.push('High consistency')
      if (Math.abs(dailyChange) > 2) factors.push('Strong recent trend')
      
      forecast.push({
        date: forecastDate,
        predictedMomentum: Math.round(predictedMomentum),
        confidence,
        factors
      })
    }

    return forecast
  }

  /**
   * Helper methods
   */
  private calculateContextFitImprovement(executionHistory: IExecutionQuality[]): number {
    if (executionHistory.length < 14) return 0

    const recentContextFit = executionHistory.slice(-7).reduce((sum, exec) => sum + exec.contextFit, 0) / 7
    const olderContextFit = executionHistory.slice(-14, -7).reduce((sum, exec) => sum + exec.contextFit, 0) / 7
    
    return Math.max(0, Math.min(100, (recentContextFit - olderContextFit) * 2))
  }
}
