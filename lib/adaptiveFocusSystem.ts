import { ICognitiveProfile, IAdaptiveSystem, IFocusSession, IExecutionQuality } from '@/types/v2-models'

export interface FocusRecommendation {
  systemId: string
  systemName: string
  priority: number // 1-10
  energyMatch: number // 0-100
  contextMatch: number // 0-100
  confidence: number // 0-100
  reasoning: string
  estimatedDuration: number // minutes
  preparationTips: string[]
}

export interface FocusMode {
  type: 'sprint' | 'maintenance' | 'exploration' | 'recovery'
  description: string
  energyRequirement: 'high' | 'medium' | 'low'
  optimalDuration: number // minutes
  recommendedSystems: string[]
  environmentalFactors: string[]
  constraints: string[]
}

export interface FocusState {
  currentEnergy: 'high' | 'medium' | 'low'
  currentContext: Record<string, any>
  availableTime: number // minutes
  cognitiveLoad: number // 0-100
  recentInterruptions: number
  preferredMode: FocusMode
}

export interface FocusSessionPlan {
  mode: FocusMode
  systems: FocusRecommendation[]
  schedule: FocusBlock[]
  preparation: FocusPreparation
  successFactors: string[]
  riskFactors: string[]
}

export interface FocusBlock {
  startTime: Date
  endTime: Date
  systemId: string
  systemName: string
  mode: string
  energyRequirement: string
  preparation: string[]
  expectedOutcome: string
}

export interface FocusPreparation {
  environmental: string[]
  mental: string[]
  physical: string[]
  technical: string[]
}

export class AdaptiveFocusSystem {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Generate adaptive focus recommendations based on current state and patterns
   */
  async generateFocusPlan(
    profile: ICognitiveProfile,
    systems: IAdaptiveSystem[],
    focusHistory: IFocusSession[],
    executionHistory: IExecutionQuality[],
    currentState: FocusState
  ): Promise<FocusSessionPlan> {
    const focusMode = this.determineOptimalFocusMode(currentState, profile, focusHistory)
    const recommendations = this.generateFocusRecommendations(systems, currentState, profile, executionHistory)
    const schedule = this.createFocusSchedule(recommendations, currentState, focusMode)
    const preparation = this.generateFocusPreparation(focusMode, currentState)
    const successFactors = this.identifySuccessFactors(focusMode, profile, recommendations)
    const riskFactors = this.identifyRiskFactors(focusMode, currentState, focusHistory)

    return {
      mode: focusMode,
      systems: recommendations,
      schedule,
      preparation,
      successFactors,
      riskFactors
    }
  }

  /**
   * Determine optimal focus mode based on current state and patterns
   */
  private determineOptimalFocusMode(
    currentState: FocusState,
    profile: ICognitiveProfile,
    focusHistory: IFocusSession[]
  ): FocusMode {
    const energyModes = {
      high: 'sprint' as const,
      medium: 'maintenance' as const,
      low: 'recovery' as const
    }

    // Base mode on energy state
    let modeType = energyModes[currentState.currentEnergy]

    // Adjust based on cognitive load
    if (currentState.cognitiveLoad > 80) {
      modeType = 'recovery'
    } else if (currentState.cognitiveLoad > 60 && currentState.currentEnergy === 'high') {
      modeType = 'maintenance'
    }

    // Adjust based on recent interruptions
    if (currentState.recentInterruptions > 3) {
      modeType = 'recovery'
    }

    // Adjust based on work style
    if (profile.workStyle === 'sprinter' && currentState.currentEnergy === 'high') {
      modeType = 'sprint'
    } else if (profile.workStyle === 'marathoner' && modeType === 'sprint') {
      modeType = 'maintenance'
    }

    return this.getFocusModeDetails(modeType)
  }

  /**
   * Generate focus recommendations for systems
   */
  private generateFocusRecommendations(
    systems: IAdaptiveSystem[],
    currentState: FocusState,
    profile: ICognitiveProfile,
    executionHistory: IExecutionQuality[]
  ): FocusRecommendation[] {
    const recommendations: FocusRecommendation[] = []

    for (const system of systems) {
      const energyMatch = this.calculateEnergyMatch(system, currentState.currentEnergy)
      const contextMatch = this.calculateContextMatch(system, currentState.currentContext, profile)
      const confidence = this.calculateRecommendationConfidence(system, energyMatch, contextMatch, executionHistory)
      
      // Only include systems with reasonable confidence
      if (confidence > 40) {
        recommendations.push({
          systemId: system._id.toString(),
          systemName: system.name,
          priority: this.calculateSystemPriority(system, currentState),
          energyMatch,
          contextMatch,
          confidence,
          reasoning: this.generateRecommendationReasoning(system, energyMatch, contextMatch, currentState),
          estimatedDuration: this.estimateSystemDuration(system, currentState),
          preparationTips: this.generatePreparationTips(system, currentState)
        })
      }
    }

    // Sort by priority and confidence
    return recommendations.sort((a, b) => (b.priority * b.confidence) - (a.priority * a.confidence))
  }

  /**
   * Create focus schedule with time blocks
   */
  private createFocusSchedule(
    recommendations: FocusRecommendation[],
    currentState: FocusState,
    focusMode: FocusMode
  ): FocusBlock[] {
    const schedule: FocusBlock[] = []
    const currentTime = new Date()
    let availableTime = currentState.availableTime

    // Take top recommendations that fit within available time
    const selectedRecommendations = recommendations
      .filter(rec => rec.estimatedDuration <= availableTime)
      .slice(0, focusMode.type === 'sprint' ? 1 : focusMode.type === 'maintenance' ? 3 : 2)

    for (const recommendation of selectedRecommendations) {
      const startTime = new Date(currentTime)
      const endTime = new Date(currentTime.getTime() + recommendation.estimatedDuration * 60000)

      schedule.push({
        startTime,
        endTime,
        systemId: recommendation.systemId,
        systemName: recommendation.systemName,
        mode: focusMode.type,
        energyRequirement: focusMode.energyRequirement,
        preparation: recommendation.preparationTips,
        expectedOutcome: this.generateExpectedOutcome(recommendation, focusMode)
      })

      currentTime.setTime(endTime.getTime())
      availableTime -= recommendation.estimatedDuration

      if (availableTime <= 0) break
    }

    return schedule
  }

  /**
   * Generate focus preparation recommendations
   */
  private generateFocusPreparation(focusMode: FocusMode, currentState: FocusState): FocusPreparation {
    return {
      environmental: this.getEnvironmentalPreparation(focusMode, currentState),
      mental: this.getMentalPreparation(focusMode, currentState),
      physical: this.getPhysicalPreparation(focusMode, currentState),
      technical: this.getTechnicalPreparation(focusMode, currentState)
    }
  }

  /**
   * Identify success factors for the focus session
   */
  private identifySuccessFactors(
    focusMode: FocusMode,
    profile: ICognitiveProfile,
    recommendations: FocusRecommendation[]
  ): string[] {
    const factors: string[] = []

    // Mode-specific factors
    if (focusMode.type === 'sprint') {
      factors.push('High energy alignment', 'Minimal interruptions', 'Clear outcome definition')
    } else if (focusMode.type === 'maintenance') {
      factors.push('Consistent energy levels', 'Familiar systems', 'Steady pace')
    } else if (focusMode.type === 'recovery') {
      factors.push('Low cognitive load', 'Simple systems', 'Gentle progression')
    }

    // Profile-specific factors
    if (profile.workStyle === 'sprinter') {
      factors.push('Time-boxed sessions', 'Clear start/end points')
    } else if (profile.workStyle === 'marathoner') {
      factors.push('Sustainable pace', 'Regular breaks')
    }

    // Recommendation-specific factors
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length
    if (avgConfidence > 80) {
      factors.push('High system-match confidence')
    }

    return factors
  }

  /**
   * Identify risk factors for the focus session
   */
  private identifyRiskFactors(
    focusMode: FocusMode,
    currentState: FocusState,
    focusHistory: IFocusSession[]
  ): string[] {
    const risks: string[] = []

    // Energy-related risks
    if (currentState.currentEnergy === 'low' && focusMode.type === 'sprint') {
      risks.push('Energy-mode mismatch', 'Potential burnout risk')
    }

    // Cognitive load risks
    if (currentState.cognitiveLoad > 70) {
      risks.push('High cognitive load', 'Reduced effectiveness')
    }

    // Interruption risks
    if (currentState.recentInterruptions > 2) {
      risks.push('Recent interruption pattern', 'Focus fragmentation risk')
    }

    // Historical risks
    const recentSessions = focusHistory.slice(-5)
    const avgEffectiveness = recentSessions.reduce((sum, session) => sum + session.effectiveness, 0) / recentSessions.length
    if (avgEffectiveness < 50) {
      risks.push('Recent low effectiveness', 'Pattern of poor focus sessions')
    }

    return risks
  }

  /**
   * Helper methods
   */
  private getFocusModeDetails(modeType: string): FocusMode {
    const modes: Record<string, FocusMode> = {
      sprint: {
        type: 'sprint',
        description: 'High-intensity, focused execution on high-impact systems',
        energyRequirement: 'high',
        optimalDuration: 45,
        recommendedSystems: ['high-impact', 'low-friction'],
        environmentalFactors: ['minimal distractions', 'optimal lighting', 'comfortable temperature'],
        constraints: ['no interruptions', 'single system focus', 'time-boxed']
      },
      maintenance: {
        type: 'maintenance',
        description: 'Steady, consistent execution across multiple systems',
        energyRequirement: 'medium',
        optimalDuration: 90,
        recommendedSystems: ['routine', 'moderate-impact'],
        environmentalFactors: ['familiar environment', 'background music optional', 'comfortable setup'],
        constraints: ['limited interruptions', 'system switching allowed', 'flexible timing']
      },
      exploration: {
        type: 'exploration',
        description: 'Creative experimentation and system optimization',
        energyRequirement: 'medium',
        optimalDuration: 60,
        recommendedSystems: ['creative', 'learning', 'optimization'],
        environmentalFactors: ['inspiring environment', 'creative tools available', 'flexible space'],
        constraints: ['open mindset', 'experimentation allowed', 'failure tolerance']
      },
      recovery: {
        type: 'recovery',
        description: 'Gentle, low-pressure execution to rebuild momentum',
        energyRequirement: 'low',
        optimalDuration: 30,
        recommendedSystems: ['simple', 'high-familiarity', 'low-friction'],
        environmentalFactors: ['calm environment', 'comfortable', 'low-pressure'],
        constraints: ['no performance pressure', 'simple systems only', 'self-compassion']
      }
    }

    return modes[modeType] || modes.maintenance
  }

  private calculateEnergyMatch(system: IAdaptiveSystem, energyState: string): number {
    const energyRequirements: Record<string, Record<string, number>> = {
      high: { high: 90, medium: 60, low: 30 },
      medium: { high: 70, medium: 85, low: 50 },
      low: { high: 40, medium: 60, low: 90 }
    }

    // Determine system energy requirement based on friction and effectiveness
    const systemEnergyReq = system.frictionCoefficient > 70 ? 'high' :
                           system.frictionCoefficient > 40 ? 'medium' : 'low'

    return energyRequirements[systemEnergyReq]?.[energyState] || 50
  }

  private calculateContextMatch(
    system: IAdaptiveSystem,
    currentContext: Record<string, any>,
    profile: ICognitiveProfile
  ): number {
    let match = 50 // Base match

    // Check location preferences
    if (currentContext.location && profile.contextPreferences) {
      const locationPref = profile.contextPreferences.find(p => p.context === 'location')
      if (locationPref && locationPref.preferences[currentContext.location]) {
        match += locationPref.preferences[currentContext.location] * 0.3
      }
    }

    // Check device preferences
    if (currentContext.device && profile.contextPreferences) {
      const devicePref = profile.contextPreferences.find(p => p.context === 'device')
      if (devicePref && devicePref.preferences[currentContext.device]) {
        match += devicePref.preferences[currentContext.device] * 0.2
      }
    }

    // Check mood alignment
    if (currentContext.mood) {
      const moodAlignment = this.getMoodAlignment(system.type, currentContext.mood)
      match += moodAlignment * 0.2
    }

    return Math.min(100, Math.round(match))
  }

  private calculateRecommendationConfidence(
    system: IAdaptiveSystem,
    energyMatch: number,
    contextMatch: number,
    executionHistory: IExecutionQuality[]
  ): number {
    let confidence = (energyMatch * 0.4) + (contextMatch * 0.3)

    // Adjust based on historical performance
    const systemExecutions = executionHistory.filter(exec => exec.systemId === system._id.toString())
    if (systemExecutions.length > 0) {
      const avgQuality = systemExecutions.reduce((sum, exec) => sum + exec.quality, 0) / systemExecutions.length
      confidence += avgQuality * 0.3
    }

    return Math.min(100, Math.round(confidence))
  }

  private calculateSystemPriority(system: IAdaptiveSystem, currentState: FocusState): number {
    let priority = 5 // Base priority

    // Higher priority for more effective systems
    priority += (system.effectivenessScore / 100) * 3

    // Lower priority for high friction systems when energy is low
    if (currentState.currentEnergy === 'low' && system.frictionCoefficient > 70) {
      priority -= 2
    }

    // Higher priority for systems that need attention
    if (system.effectivenessScore < 50) {
      priority += 1
    }

    return Math.max(1, Math.min(10, Math.round(priority)))
  }

  private generateRecommendationReasoning(
    system: IAdaptiveSystem,
    energyMatch: number,
    contextMatch: number,
    currentState: FocusState
  ): string {
    const reasons: string[] = []

    if (energyMatch > 70) {
      reasons.push('Excellent energy alignment')
    } else if (energyMatch < 40) {
      reasons.push('Energy mismatch - consider alternative')
    }

    if (contextMatch > 70) {
      reasons.push('Strong context fit')
    }

    if (system.effectivenessScore > 80) {
      reasons.push('High historical effectiveness')
    }

    if (currentState.currentEnergy === 'high' && system.frictionCoefficient < 50) {
      reasons.push('Optimal for high-energy execution')
    }

    return reasons.join('; ') || 'Standard recommendation based on system analysis'
  }

  private estimateSystemDuration(system: IAdaptiveSystem, currentState: FocusState): number {
    let baseDuration = 30 // Base duration in minutes

    // Adjust based on system complexity
    if (system.frictionCoefficient > 70) {
      baseDuration += 15
    } else if (system.frictionCoefficient < 30) {
      baseDuration -= 10
    }

    // Adjust based on energy state
    if (currentState.currentEnergy === 'high') {
      baseDuration += 10
    } else if (currentState.currentEnergy === 'low') {
      baseDuration -= 10
    }

    // Adjust based on cognitive load
    if (currentState.cognitiveLoad > 70) {
      baseDuration -= 15
    }

    return Math.max(15, Math.min(120, baseDuration))
  }

  private generatePreparationTips(system: IAdaptiveSystem, currentState: FocusState): string[] {
    const tips: string[] = []

    if (system.frictionCoefficient > 70) {
      tips.push('Break down into smaller steps', 'Prepare environment in advance')
    }

    if (currentState.currentEnergy === 'low') {
      tips.push('Start with easiest component', 'Set up rewards for completion')
    }

    if (currentState.cognitiveLoad > 60) {
      tips.push('Clear mental clutter first', 'Use focus techniques like Pomodoro')
    }

    tips.push('Review system requirements', 'Prepare necessary tools/resources')

    return tips
  }

  private getEnvironmentalPreparation(focusMode: FocusMode, currentState: FocusState): string[] {
    const preparations: string[] = []

    if (focusMode.type === 'sprint') {
      preparations.push('Eliminate all distractions', 'Optimize lighting and temperature', 'Prepare water/snacks')
    } else if (focusMode.type === 'maintenance') {
      preparations.push('Organize workspace', 'Set background music if helpful', 'Ensure comfortable seating')
    } else if (focusMode.type === 'recovery') {
      preparations.push('Create calm environment', 'Use comfortable lighting', 'Remove pressure items')
    }

    return preparations
  }

  private getMentalPreparation(focusMode: FocusMode, currentState: FocusState): string[] {
    const preparations: string[] = []

    if (focusMode.type === 'sprint') {
      preparations.push('Clear mind of other tasks', 'Set clear intention', 'Visualize successful completion')
    } else if (focusMode.type === 'recovery') {
      preparations.push('Practice self-compassion', 'Set gentle expectations', 'Focus on showing up')
    }

    return preparations
  }

  private getPhysicalPreparation(focusMode: FocusMode, currentState: FocusState): string[] {
    const preparations: string[] = ['Take bathroom break', 'Ensure comfortable posture']

    if (focusMode.type === 'sprint') {
      preparations.push('Light stretching', 'Hydrate well')
    }

    return preparations
  }

  private getTechnicalPreparation(focusMode: FocusMode, currentState: FocusState): string[] {
    const preparations: string[] = ['Open necessary applications', 'Test tools and equipment']

    if (focusMode.type === 'sprint') {
      preparations.push('Disable notifications', 'Set up focus timer')
    }

    return preparations
  }

  private getMoodAlignment(systemType: string, mood: string): number {
    const alignments: Record<string, Record<string, number>> = {
      habit: {
        focused: 80,
        motivated: 70,
        tired: 40,
        stressed: 30
      },
      routine: {
        focused: 60,
        motivated: 50,
        tired: 60,
        stressed: 40
      },
      strategy: {
        focused: 70,
        motivated: 80,
        tired: 30,
        stressed: 20
      },
      process: {
        focused: 60,
        motivated: 60,
        tired: 50,
        stressed: 50
      }
    }

    return alignments[systemType]?.[mood] || 50
  }

  private generateExpectedOutcome(recommendation: FocusRecommendation, focusMode: FocusMode): string {
    if (focusMode.type === 'sprint') {
      return `Complete ${recommendation.systemName} with high quality and efficiency`
    } else if (focusMode.type === 'maintenance') {
      return `Maintain steady progress on ${recommendation.systemName}`
    } else if (focusMode.type === 'recovery') {
      return `Gentle engagement with ${recommendation.systemName} to rebuild momentum`
    }
    return `Execute ${recommendation.systemName} according to focus mode requirements`
  }
}
