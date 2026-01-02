import { ICognitiveProfile, IAdaptiveSystem, IFocusSession } from '@/types/v2-models'

export interface EnergyWindow {
  startHour: number
  endHour: number
  energyLevel: number // 0-100
  focusLevel: number // 0-100
  creativityLevel: number // 0-100
  recommendedActivities: string[]
}

export interface SchedulingRecommendation {
  systemId: string
  systemName: string
  optimalTime: EnergyWindow
  alternativeTimes: EnergyWindow[]
  confidence: number // 0-100
  reasoning: string
  adjustments: SchedulingAdjustment[]
}

export interface SchedulingAdjustment {
  type: 'time_shift' | 'duration_change' | 'sequence_reorder' | 'context_optimization'
  description: string
  impact: number // 0-100
  effort: 'low' | 'medium' | 'high'
}

export interface DailySchedule {
  date: Date
  energyWindows: EnergyWindow[]
  recommendations: SchedulingRecommendation[]
  totalEnergyEfficiency: number // 0-100
  focusOptimization: number // 0-100
}

export class EnergyAwareScheduler {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Generate energy-aware scheduling recommendations
   */
  async generateOptimalSchedule(
    profile: ICognitiveProfile,
    systems: IAdaptiveSystem[],
    focusHistory: IFocusSession[]
  ): Promise<DailySchedule> {
    const energyWindows = this.calculateEnergyWindows(profile)
    const recommendations = this.generateSchedulingRecommendations(systems, energyWindows, profile)
    const totalEnergyEfficiency = this.calculateEnergyEfficiency(recommendations, energyWindows)
    const focusOptimization = this.calculateFocusOptimization(recommendations, focusHistory)

    return {
      date: new Date(),
      energyWindows,
      recommendations,
      totalEnergyEfficiency,
      focusOptimization,
    }
  }

  /**
   * Calculate energy windows based on cognitive profile
   */
  private calculateEnergyWindows(profile: ICognitiveProfile): EnergyWindow[] {
    const windows: EnergyWindow[] = []
    
    if (profile.energyPatterns.length === 0) {
      // Default energy patterns if none exist
      return this.getDefaultEnergyWindows(profile.chronotype)
    }

    // Group consecutive hours with similar energy levels
    const sortedPatterns = profile.energyPatterns.sort((a, b) => a.hour - b.hour)
    let currentWindow: EnergyWindow | null = null

    for (const pattern of sortedPatterns) {
      if (!currentWindow) {
        currentWindow = {
          startHour: pattern.hour,
          endHour: pattern.hour + 1,
          energyLevel: pattern.energyLevel,
          focusLevel: pattern.focusLevel,
          creativityLevel: pattern.creativityLevel,
          recommendedActivities: this.getRecommendedActivities(pattern)
        }
      } else {
        // Check if this hour should be part of the current window
        const avgEnergy = currentWindow.energyLevel
        const avgFocus = currentWindow.focusLevel
        const avgCreativity = currentWindow.creativityLevel

        const energyDiff = Math.abs(pattern.energyLevel - avgEnergy)
        const focusDiff = Math.abs(pattern.focusLevel - avgFocus)
        const creativityDiff = Math.abs(pattern.creativityLevel - avgCreativity)

        // If differences are small enough, extend the window
        if (energyDiff < 20 && focusDiff < 20 && creativityDiff < 20) {
          currentWindow.endHour = pattern.hour + 1
          // Update averages
          currentWindow.energyLevel = (currentWindow.energyLevel + pattern.energyLevel) / 2
          currentWindow.focusLevel = (currentWindow.focusLevel + pattern.focusLevel) / 2
          currentWindow.creativityLevel = (currentWindow.creativityLevel + pattern.creativityLevel) / 2
        } else {
          // Close current window and start a new one
          windows.push(currentWindow)
          currentWindow = {
            startHour: pattern.hour,
            endHour: pattern.hour + 1,
            energyLevel: pattern.energyLevel,
            focusLevel: pattern.focusLevel,
            creativityLevel: pattern.creativityLevel,
            recommendedActivities: this.getRecommendedActivities(pattern)
          }
        }
      }
    }

    if (currentWindow) {
      windows.push(currentWindow)
    }

    return windows
  }

  /**
   * Generate scheduling recommendations for systems
   */
  private generateSchedulingRecommendations(
    systems: IAdaptiveSystem[],
    energyWindows: EnergyWindow[],
    profile: ICognitiveProfile
  ): SchedulingRecommendation[] {
    const recommendations: SchedulingRecommendation[] = []

    for (const system of systems) {
      const bestWindow = this.findBestEnergyWindow(system, energyWindows)
      const alternatives = energyWindows
        .filter(w => w !== bestWindow && w.energyLevel > 40)
        .sort((a, b) => b.energyLevel - a.energyLevel)
        .slice(0, 2)

      const adjustments = this.generateSchedulingAdjustments(system, bestWindow, profile)

      recommendations.push({
        systemId: system._id.toString(),
        systemName: system.name,
        optimalTime: bestWindow,
        alternativeTimes: alternatives,
        confidence: this.calculateSchedulingConfidence(system, bestWindow),
        reasoning: this.generateSchedulingReasoning(system, bestWindow, profile),
        adjustments
      })
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Find the best energy window for a specific system
   */
  private findBestEnergyWindow(system: IAdaptiveSystem, energyWindows: EnergyWindow[]): EnergyWindow {
    // Score each window based on system requirements
    const scoredWindows = energyWindows.map(window => {
      let score = 0

      // High friction systems need high energy windows
      if (system.frictionCoefficient > 70) {
        score += window.energyLevel * 2
      } else {
        score += window.energyLevel
      }

      // Creative tasks need high creativity windows
      if (system.type === 'strategy' || system.name.toLowerCase().includes('creative')) {
        score += window.creativityLevel * 1.5
      }

      // Focus-intensive tasks need high focus windows
      if (system.type === 'habit' || system.name.toLowerCase().includes('focus')) {
        score += window.focusLevel * 1.5
      }

      return { window, score }
    })

    return scoredWindows.sort((a, b) => b.score - a.score)[0].window
  }

  /**
   * Generate scheduling adjustments to optimize execution
   */
  private generateSchedulingAdjustments(
    system: IAdaptiveSystem,
    window: EnergyWindow,
    profile: ICognitiveProfile
  ): SchedulingAdjustment[] {
    const adjustments: SchedulingAdjustment[] = []

    // High friction systems in low energy windows
    if (system.frictionCoefficient > 70 && window.energyLevel < 60) {
      adjustments.push({
        type: 'duration_change',
        description: 'Reduce duration to match energy level',
        impact: 30,
        effort: 'low'
      })
    }

    // Chronotype mismatches
    if (profile.chronotype === 'morning' && window.startHour > 12) {
      adjustments.push({
        type: 'time_shift',
        description: 'Consider shifting to morning hours for better alignment',
        impact: 40,
        effort: 'medium'
      })
    } else if (profile.chronotype === 'evening' && window.startHour < 12) {
      adjustments.push({
        type: 'time_shift',
        description: 'Consider shifting to evening hours for better alignment',
        impact: 40,
        effort: 'medium'
      })
    }

    // Low focus windows for focus-intensive tasks
    if (window.focusLevel < 50 && system.type === 'habit') {
      adjustments.push({
        type: 'context_optimization',
        description: 'Optimize environment to improve focus',
        impact: 25,
        effort: 'medium'
      })
    }

    return adjustments.sort((a, b) => b.impact - a.impact)
  }

  /**
   * Calculate overall energy efficiency for the schedule
   */
  private calculateEnergyEfficiency(
    recommendations: SchedulingRecommendation[],
    energyWindows: EnergyWindow[]
  ): number {
    if (recommendations.length === 0) return 0

    const totalEfficiency = recommendations.reduce((sum, rec) => {
      return sum + (rec.optimalTime.energyLevel * rec.confidence / 100)
    }, 0)

    return Math.round(totalEfficiency / recommendations.length)
  }

  /**
   * Calculate focus optimization score
   */
  private calculateFocusOptimization(
    recommendations: SchedulingRecommendation[],
    focusHistory: IFocusSession[]
  ): number {
    if (recommendations.length === 0) return 0

    // Analyze historical focus patterns
    const avgFocusScore = focusHistory.length > 0
      ? focusHistory.reduce((sum, session) => sum + session.effectiveness, 0) / focusHistory.length
      : 50

    // Calculate how well recommendations align with focus patterns
    const alignmentScore = recommendations.reduce((sum, rec) => {
      return sum + (rec.optimalTime.focusLevel * rec.confidence / 100)
    }, 0) / recommendations.length

    return Math.round((alignmentScore + avgFocusScore) / 2)
  }

  /**
   * Helper methods
   */
  private getDefaultEnergyWindows(chronotype: string): EnergyWindow[] {
    switch (chronotype) {
      case 'morning':
        return [
          {
            startHour: 6,
            endHour: 11,
            energyLevel: 85,
            focusLevel: 90,
            creativityLevel: 75,
            recommendedActivities: ['Deep work', 'Complex tasks', 'Creative work']
          },
          {
            startHour: 11,
            endHour: 16,
            energyLevel: 70,
            focusLevel: 60,
            creativityLevel: 80,
            recommendedActivities: ['Collaborative work', 'Meetings', 'Administrative tasks']
          },
          {
            startHour: 16,
            endHour: 20,
            energyLevel: 50,
            focusLevel: 40,
            creativityLevel: 60,
            recommendedActivities: ['Light tasks', 'Planning', 'Learning']
          }
        ]
      case 'evening':
        return [
          {
            startHour: 10,
            endHour: 15,
            energyLevel: 60,
            focusLevel: 50,
            creativityLevel: 70,
            recommendedActivities: ['Administrative tasks', 'Communication', 'Planning']
          },
          {
            startHour: 15,
            endHour: 20,
            energyLevel: 75,
            focusLevel: 70,
            creativityLevel: 85,
            recommendedActivities: ['Creative work', 'Problem-solving', 'Deep work']
          },
          {
            startHour: 20,
            endHour: 23,
            energyLevel: 85,
            focusLevel: 80,
            creativityLevel: 90,
            recommendedActivities: ['Peak performance tasks', 'Creative flow', 'Strategic thinking']
          }
        ]
      default: // intermediate
        return [
          {
            startHour: 9,
            endHour: 12,
            energyLevel: 75,
            focusLevel: 80,
            creativityLevel: 70,
            recommendedActivities: ['Focused work', 'Important tasks', 'Problem-solving']
          },
          {
            startHour: 14,
            endHour: 17,
            energyLevel: 70,
            focusLevel: 65,
            creativityLevel: 75,
            recommendedActivities: ['Collaborative work', 'Meetings', 'Creative tasks']
          },
          {
            startHour: 19,
            endHour: 21,
            energyLevel: 60,
            focusLevel: 50,
            creativityLevel: 65,
            recommendedActivities: ['Light work', 'Learning', 'Planning']
          }
        ]
    }
  }

  private getRecommendedActivities(pattern: any): string[] {
    const activities: string[] = []
    
    if (pattern.energyLevel > 70 && pattern.focusLevel > 70) {
      activities.push('Deep work', 'Complex tasks', 'Strategic planning')
    } else if (pattern.creativityLevel > 70) {
      activities.push('Creative work', 'Brainstorming', 'Innovation')
    } else if (pattern.energyLevel > 50) {
      activities.push('Productive tasks', 'Collaboration', 'Learning')
    } else {
      activities.push('Light tasks', 'Organization', 'Reflection')
    }
    
    return activities
  }

  private calculateSchedulingConfidence(system: IAdaptiveSystem, window: EnergyWindow): number {
    let confidence = 50 // Base confidence

    // Higher confidence for better energy alignment
    confidence += window.energyLevel * 0.3

    // Lower confidence for high friction systems
    confidence -= system.frictionCoefficient * 0.2

    // Higher confidence for effective systems
    confidence += system.effectivenessScore * 0.2

    return Math.max(0, Math.min(100, Math.round(confidence)))
  }

  private generateSchedulingReasoning(
    system: IAdaptiveSystem,
    window: EnergyWindow,
    profile: ICognitiveProfile
  ): string {
    const reasons: string[] = []

    if (window.energyLevel > 70) {
      reasons.push('High energy window supports task completion')
    }

    if (system.frictionCoefficient > 70 && window.energyLevel > 60) {
      reasons.push('Sufficient energy to overcome system friction')
    }

    if (profile.chronotype === 'morning' && window.startHour < 12) {
      reasons.push('Aligns with morning chronotype peak performance')
    } else if (profile.chronotype === 'evening' && window.startHour > 15) {
      reasons.push('Aligns with evening chronotype peak performance')
    }

    if (window.focusLevel > 70 && system.type === 'habit') {
      reasons.push('High focus period optimal for habit execution')
    }

    return reasons.join('; ') || 'Standard scheduling recommendation'
  }
}
