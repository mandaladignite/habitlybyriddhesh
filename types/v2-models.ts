import { Document, Types } from 'mongoose'

// Goal Architecture Models
export interface INorthStarGoal extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  title: string
  description: string
  category: string
  deadline?: Date
  progress: number // 0-100
  alignmentScore: number // How well current systems align with this goal
  createdAt: Date
  updatedAt: Date
}

export interface IQuarterlyRock extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  northStarGoalId: string
  title: string
  description: string
  quarter: string // e.g., "2024-Q1"
  progress: number // 0-100
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IMonthlyMilestone extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  quarterlyRockId: string
  title: string
  description: string
  month: string // e.g., "2024-01"
  progress: number // 0-100
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

// Adaptive System Models
export interface IAdaptiveSystem extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  name: string
  description: string
  type: 'habit' | 'routine' | 'process' | 'strategy'
  effectivenessScore: number // 0-100, based on goal impact
  frictionCoefficient: number // 0-100, execution difficulty
  adaptationHistory: ISystemAdaptation[]
  failureConditions: IFailureCondition[]
  autoAdapt: boolean
  locked: boolean // User can lock to prevent auto-adaptation
  createdAt: Date
  updatedAt: Date
}

export interface ISystemAdaptation {
  timestamp: Date
  trigger: string // What caused the adaptation
  change: string // What was changed
  impact: number // Measured impact of the adaptation
}

export interface IFailureCondition {
  pattern: string
  threshold: number
  action: string
  active: boolean
}

// Cognitive Profile Models
export interface ICognitiveProfile extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  chronotype: 'morning' | 'evening' | 'intermediate'
  workStyle: 'sprinter' | 'marathoner' | 'mixed'
  energyPatterns: IEnergyPattern[]
  contextPreferences: IContextPreference[]
  cognitiveBiases: string[] // Detected biases
  adaptation: number // How well user adapts to change (0-100)
  createdAt: Date
  updatedAt: Date
}

export interface IEnergyPattern {
  hour: number // 0-23
  energyLevel: number // 0-100
  focusLevel: number // 0-100
  creativityLevel: number // 0-100
}

export interface IContextPreference {
  context: 'location' | 'device' | 'mood' | 'environment'
  preferences: Record<string, number>
}

// Momentum Models
export interface IMomentumVector extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  date: Date
  consistencyMomentum: number // 0-100
  difficultyGrowthMomentum: number // 0-100
  impactMomentum: number // 0-100
  learningMomentum: number // 0-100
  overallMomentum: number // 0-100, weighted average
  direction: 'increasing' | 'decreasing' | 'stable'
  strength: number // 0-100
  forecast: IMomentumForecast[]
  createdAt: Date
}

export interface IMomentumForecast {
  date: Date
  predictedMomentum: number
  confidence: number // 0-100
  factors: string[]
}

// Execution Quality Models
export interface IExecutionQuality extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  systemId: string
  date: Date
  completionRate: number // 0-100
  energyCost: number // 0-100, how much energy it took
  contextFit: number // 0-100, how well it fit the context
  sequenceEffectiveness: number // 0-100, how well it worked with other actions
  quality: number // 0-100, overall quality score
  factors: IQualityFactor[]
  createdAt: Date
}

export interface IQualityFactor {
  factor: string
  impact: number // -100 to 100
  description: string
}

// Insight Models
export interface IInsight extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  type: 'leverage' | 'friction' | 'bias' | 'pattern' | 'prediction'
  title: string
  description: string
  evidence: string
  recommendedAction: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  dismissed: boolean
  actedUpon: boolean
  createdAt: Date
}

// Focus Models
export interface IFocusSession extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  startTime: Date
  endTime?: Date
  mode: 'sprint' | 'maintenance' | 'exploration' | 'recovery'
  energyState: 'low' | 'medium' | 'high'
  context: Record<string, any>
  systems: string[] // System IDs worked on
  effectiveness: number // 0-100
  interruptions: number
  createdAt: Date
}

// Recovery Models
export interface IRecoveryProtocol extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  name: string
  trigger: string // What triggers this protocol
  conditions: IRecoveryCondition[]
  actions: IRecoveryAction[]
  effectiveness: number // 0-100
  lastUsed?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IRecoveryCondition {
  metric: string
  operator: 'gt' | 'lt' | 'eq'
  threshold: number
}

export interface IRecoveryAction {
  type: 'system' | 'mindset' | 'environment' | 'schedule'
  description: string
  priority: number
  automated: boolean
}
