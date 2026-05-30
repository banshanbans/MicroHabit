export type VideoScenario = 'sleep' | 'sedentary' | 'emotion';

export interface VideoSource {
  id: string;
  source: 'douyin' | 'demo';
  url?: string;
  scenario: VideoScenario;
  title: string;
  coverUrl: string;
  creatorName?: string;
  durationSec?: number;
  rawDescription?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskAssessment {
  level: RiskLevel;
  label: string;
  message: string;
  reasons: string[];
  allowedToGenerateChallenge: boolean;
  saferAlternative?: string;
}

export type ChallengeDuration = 7 | 15 | 21;

export interface AnalysisResult {
  id: string;
  videoId: string;
  scenario: VideoScenario;
  theme: string;
  summary: string;
  coreMicroAction: {
    title: string;
    description: string;
    estimatedMinutes: number;
  };
  whyWorthDoing: string;
  actionTips: string[];
  useCases: string[];
  precautions: string[];
  risk: RiskAssessment;
  graphId: string;
  recommendedDuration: ChallengeDuration;
}

export interface HealthGraph {
  id: string;
  videoId: string;
  title: string;
  description: string;
  nodes: HealthGraphNode[];
  edges: HealthGraphEdge[];
  progress: {
    totalNodes: number;
    completedNodes: number;
  };
}

export interface HealthGraphNode {
  id: string;
  type: 'topic' | 'knowledge' | 'action' | 'reflection' | 'reward';
  title: string;
  description: string;
  status: 'locked' | 'available' | 'active' | 'completed';
  position: {
    x: number;
    y: number;
  };
  linkedDay?: number;
}

export interface HealthGraphEdge {
  id: string;
  source: string;
  target: string;
  status: 'inactive' | 'active' | 'completed';
}

export type ChallengeStatus = 'draft' | 'active' | 'paused' | 'completed' | 'saved';

export interface Challenge {
  id: string;
  graphId: string;
  videoId: string;
  title: string;
  durationDays: ChallengeDuration;
  status: ChallengeStatus;
  currentDay: number;
  startedAt?: string;
  completedAt?: string;
  plan: ExecutionPlan;
  days: ChallengeDay[];
  progress: {
    completedDays: number;
    totalDays: number;
    completedNodeIds: string[];
  };
}

export interface ExecutionPlan {
  preferredTime?: string;
  preferredPlace?: string;
  reminderStyle?: 'gentle' | 'coach' | 'minimal' | 'funny';
  naturalLanguagePlan?: string;
  fallbackPlan: string;
}

export interface ChallengeDay {
  day: number;
  title: string;
  microAction: string;
  why: string;
  howTo: string[];
  precautions: string[];
  graphNodeId: string;
  estimatedMinutes: number;
  status: 'locked' | 'today' | 'completed' | 'missed';
}

export interface Checkin {
  id: string;
  challengeId: string;
  day: number;
  graphNodeId: string;
  completedType: 'full' | 'tiny';
  optionalNote?: string;
  encouragement: string;
  createdAt: string;
}

export interface CheckinResult {
  checkinId: string;
  challengeId: string;
  completedDay: number;
  completedType: 'full' | 'tiny';
  litNodeId: string;
  encouragement: string;
  points: number;
  progress: {
    completedDays: number;
    totalDays: number;
  };
  nextDay?: number;
}

export interface ReviewReport {
  id: string;
  challengeId: string;
  title: string;
  completedDays: number;
  totalDays: number;
  completedNodes: {
    id: string;
    title: string;
    type: string;
  }[];
  strongestExecutionScene: string;
  easiestAction: string;
  interruptionMoment?: string;
  aiFeedback: string;
  reward: {
    badgeName: string;
    badgeDescription: string;
    points: number;
    skinUnlocked?: string;
  };
  nextRecommendations: Recommendation[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'continue' | 'related_video' | 'related_node' | 'light_reminder';
}
