import { IExecutionQuality, IAdaptiveSystem, IInsight } from '@/types/v2-models'

export interface ExecutionMetrics {
  consistencyScore: number // 0-100
  energyEfficiency: number // 0-100
  contextAlignment: number // 0-100
  sequenceEffectiveness: number // 0-100
  overallQuality: number // 0-100
}

export interface QualityInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'pattern'
  description: string
  evidence: string
  recommendation: string
  impact: number // 0-100
}

export interface TrendAnalysis {
  metric: string
  trend: 'improving' | 'declining' | 'stable'
  changeRate: number // percentage change
  timeframe: string
  significance: 'high' | 'medium' | 'low'
}

export class ExecutionQualityTracker {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Track and analyze execution quality across multiple dimensions
   */
  async trackExecutionQuality(
    executionData: IExecutionQuality[],
    systems: IAdaptiveSystem[]
  ): Promise<{
    metrics: ExecutionMetrics
    insights: QualityInsight[]
    trends: TrendAnalysis[]
    recommendations: string[]
  }> {
    const metrics = this.calculateMetrics(executionData)
    const insights = this.generateInsights(executionData, systems, metrics)
    const trends = this.analyzeTrends(executionData)
    const recommendations = this.generateRecommendations(metrics, insights, trends)

    return {
      metrics,
      insights,
      trends,
      recommendations,
    }
  }

  /**
   * Calculate comprehensive execution metrics
   */
  private calculateMetrics(executionData: IExecutionQuality[]): ExecutionMetrics {
    if (executionData.length === 0) {
      return {
        consistencyScore: 0,
        energyEfficiency: 0,
        contextAlignment: 0,
        sequenceEffectiveness: 0,
        overallQuality: 0,
      }
    }

    const consistencyScore = this.calculateConsistency(executionData)
    const energyEfficiency = this.calculateEnergyEfficiency(executionData)
    const contextAlignment = this.calculateContextAlignment(executionData)
    const sequenceEffectiveness = this.calculateSequenceEffectiveness(executionData)
    const overallQuality = this.calculateOverallQuality(executionData)

    return {
      consistencyScore,
      energyEfficiency,
      contextAlignment,
      sequenceEffectiveness,
      overallQuality,
    }
  }

  /**
   * Calculate consistency score based on completion rate variance
   */
  private calculateConsistency(executionData: IExecutionQuality[]): number {
    const completionRates = executionData.map(exec => exec.completionRate)
    const mean = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
    const variance = completionRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / completionRates.length
    const standardDeviation = Math.sqrt(variance)
    
    // Lower variance = higher consistency (inverse relationship)
    const consistencyScore = Math.max(0, 100 - (standardDeviation * 2))
    return Math.round(consistencyScore)
  }

  /**
   * Calculate energy efficiency (lower energy cost for same completion rate)
   */
  private calculateEnergyEfficiency(executionData: IExecutionQuality[]): number {
    const efficiencyScores = executionData.map(exec => {
      if (exec.energyCost === 0) return exec.completionRate
      return (exec.completionRate / exec.energyCost) * 100
    })
    
    const avgEfficiency = efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length
    return Math.min(100, Math.round(avgEfficiency))
  }

  /**
   * Calculate how well executions align with optimal contexts
   */
  private calculateContextAlignment(executionData: IExecutionQuality[]): number {
    const contextScores = executionData.map(exec => exec.contextFit)
    const avgContextScore = contextScores.reduce((sum, score) => sum + score, 0) / contextScores.length
    return Math.round(avgContextScore)
  }

  /**
   * Calculate effectiveness of execution sequences
   */
  private calculateSequenceEffectiveness(executionData: IExecutionQuality[]): number {
    const sequenceScores = executionData.map(exec => exec.sequenceEffectiveness)
    const avgSequenceScore = sequenceScores.reduce((sum, score) => sum + score, 0) / sequenceScores.length
    return Math.round(avgSequenceScore)
  }

  /**
   * Calculate overall quality as weighted average
   */
  private calculateOverallQuality(executionData: IExecutionQuality[]): number {
    const qualityScores = executionData.map(exec => exec.quality)
    const avgQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
    return Math.round(avgQuality)
  }

  /**
   * Generate actionable insights from execution data
   */
  private generateInsights(
    executionData: IExecutionQuality[],
    systems: IAdaptiveSystem[],
    metrics: ExecutionMetrics
  ): QualityInsight[] {
    const insights: QualityInsight[] = []

    // Consistency insights
    if (metrics.consistencyScore < 60) {
      insights.push({
        type: 'weakness',
        description: 'Execution consistency is below optimal levels',
        evidence: `Consistency score: ${metrics.consistencyScore}%`,
        recommendation: 'Focus on establishing regular routines and reducing variability',
        impact: 80 - metrics.consistencyScore,
      })
    } else if (metrics.consistencyScore > 85) {
      insights.push({
        type: 'strength',
        description: 'Excellent execution consistency',
        evidence: `Consistency score: ${metrics.consistencyScore}%`,
        recommendation: 'Maintain current routines and consider increasing complexity',
        impact: metrics.consistencyScore - 70,
      })
    }

    // Energy efficiency insights
    if (metrics.energyEfficiency < 50) {
      insights.push({
        type: 'weakness',
        description: 'High energy cost for execution',
        evidence: `Energy efficiency: ${metrics.energyEfficiency}%`,
        recommendation: 'Optimize timing, reduce friction, or break down complex tasks',
        impact: 70 - metrics.energyEfficiency,
      })
    }

    // Context alignment insights
    if (metrics.contextAlignment < 60) {
      insights.push({
        type: 'opportunity',
        description: 'Poor alignment between execution and optimal contexts',
        evidence: `Context alignment: ${metrics.contextAlignment}%`,
        recommendation: 'Reschedule tasks to match energy patterns and environmental preferences',
        impact: 80 - metrics.contextAlignment,
      })
    }

    // System-specific insights
    for (const system of systems) {
      const systemExecutions = executionData.filter(exec => exec.systemId === system._id.toString())
      if (systemExecutions.length > 0) {
        const avgSystemQuality = systemExecutions.reduce((sum, exec) => sum + exec.quality, 0) / systemExecutions.length
        
        if (avgSystemQuality < 50 && system.frictionCoefficient > 70) {
          insights.push({
            type: 'weakness',
            description: `System "${system.name}" shows poor quality metrics`,
            evidence: `Average quality: ${avgSystemQuality.toFixed(1)}%, Friction: ${system.frictionCoefficient}%`,
            recommendation: 'Consider redesigning or replacing this high-friction system',
            impact: 70 - avgSystemQuality,
          })
        }
      }
    }

    return insights.sort((a, b) => b.impact - a.impact)
  }

  /**
   * Analyze trends in execution metrics over time
   */
  private analyzeTrends(executionData: IExecutionQuality[]): TrendAnalysis[] {
    const trends: TrendAnalysis[] = []
    
    if (executionData.length < 7) return trends // Need at least 7 data points for trend analysis

    const sortedData = executionData.sort((a, b) => a.date.getTime() - b.date.getTime())
    const recentData = sortedData.slice(-14) // Last 14 executions
    const olderData = sortedData.slice(-28, -14) // Previous 14 executions

    if (olderData.length > 0) {
      // Analyze completion rate trend
      const recentCompletion = recentData.reduce((sum, exec) => sum + exec.completionRate, 0) / recentData.length
      const olderCompletion = olderData.reduce((sum, exec) => sum + exec.completionRate, 0) / olderData.length
      const completionChange = ((recentCompletion - olderCompletion) / olderCompletion) * 100

      trends.push({
        metric: 'Completion Rate',
        trend: completionChange > 5 ? 'improving' : completionChange < -5 ? 'declining' : 'stable',
        changeRate: Math.abs(completionChange),
        timeframe: 'Last 2 weeks',
        significance: Math.abs(completionChange) > 10 ? 'high' : Math.abs(completionChange) > 5 ? 'medium' : 'low',
      })

      // Analyze energy cost trend
      const recentEnergy = recentData.reduce((sum, exec) => sum + exec.energyCost, 0) / recentData.length
      const olderEnergy = olderData.reduce((sum, exec) => sum + exec.energyCost, 0) / olderData.length
      const energyChange = ((recentEnergy - olderEnergy) / olderEnergy) * 100

      trends.push({
        metric: 'Energy Cost',
        trend: energyChange < -5 ? 'improving' : energyChange > 5 ? 'declining' : 'stable',
        changeRate: Math.abs(energyChange),
        timeframe: 'Last 2 weeks',
        significance: Math.abs(energyChange) > 10 ? 'high' : Math.abs(energyChange) > 5 ? 'medium' : 'low',
      })
    }

    return trends
  }

  /**
   * Generate actionable recommendations based on analysis
   */
  private generateRecommendations(
    metrics: ExecutionMetrics,
    insights: QualityInsight[],
    trends: TrendAnalysis[]
  ): string[] {
    const recommendations: string[] = []

    // Metrics-based recommendations
    if (metrics.consistencyScore < 60) {
      recommendations.push('Establish fixed execution times to improve consistency')
    }

    if (metrics.energyEfficiency < 50) {
      recommendations.push('Schedule high-energy tasks during peak performance periods')
    }

    if (metrics.contextAlignment < 60) {
      recommendations.push('Optimize your environment for better execution context')
    }

    // Insight-based recommendations
    insights.forEach(insight => {
      if (insight.impact > 60) {
        recommendations.push(insight.recommendation)
      }
    })

    // Trend-based recommendations
    const decliningTrends = trends.filter(trend => trend.trend === 'declining' && trend.significance === 'high')
    if (decliningTrends.length > 0) {
      recommendations.push('Address declining performance trends before they become habits')
    }

    return recommendations.slice(0, 5) // Top 5 recommendations
  }
}
