export type VideoScenario = 'meditation' | 'stretch' | 'eye_yoga';

export interface VideoSource {
  id: string;
  source: 'douyin' | 'douyin_upload' | 'demo';
  url?: string;
  scenario: VideoScenario;
  title: string;
  coverUrl: string;
  creatorName?: string;
  durationSec?: number;
  rawDescription?: string;
  mimeType?: string;
  fileSize?: number;
  processingStatus?: 'uploaded' | 'queued' | 'extracting_media' | 'completed' | 'failed' | 'ready';
}

export type AnalysisStage = 'queued' | 'extracting_media' | 'transcribing_audio' | 'analyzing_frames' | 'generating_graph' | 'completed' | 'failed';
export type AnalysisTaskStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface AnalysisTask {
  taskId: string;
  videoId?: string;
  status: AnalysisTaskStatus;
  stage: AnalysisStage;
  progress: number;
  analysisId?: string | null;
  errorMessage?: string | null;
  createdAt?: string;
  completedAt?: string | null;
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
  wallet?: WalletSummary;
  buddyGrowth?: BuddyGrowthResult;
  mintedBuddy?: CollectibleBuddy;
}

export type BuddyRarity = 'common' | 'rare' | 'epic';

export interface WalletTransaction {
  id: string;
  amount: number;
  reason: string;
  refId: string;
  balanceAfter: number;
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  currentPoints: number;
  transactions: WalletTransaction[];
}

export interface SeedlingDefinition {
  id: string;
  name: string;
  rarity: BuddyRarity;
  targetCheckins: number;
  emoji: string;
  description: string;
  matureForm: {
    id: string;
    name: string;
    emoji: string;
  };
}

export interface GrowingBuddy {
  id: string;
  seedlingId: string;
  name: string;
  rarity: BuddyRarity;
  emoji: string;
  stage: 'seedling' | 'sprout' | 'bud' | 'bloom';
  stageLabel: string;
  energy: number;
  completedCheckins: number;
  targetCheckins: number;
  progress: number;
  status: 'active' | 'matured';
  message: string;
  updatedAt: string;
}

export interface CollectibleBuddy {
  id: string;
  seedlingId: string;
  matureFormId: string;
  name: string;
  rarity: BuddyRarity;
  description: string;
  emoji: string;
  sourceChallengeId?: string;
  obtainedAt: string;
}

export interface BuddyInventoryItem {
  seedling: SeedlingDefinition;
  quantity: number;
  updatedAt: string;
}

export interface BuddySummary {
  active: GrowingBuddy | null;
  inventory: BuddyInventoryItem[];
  collection: CollectibleBuddy[];
  seedlings: SeedlingDefinition[];
  drawCost: number;
}

export interface BuddyGrowthResult {
  energyDelta: number;
  previousEnergy: number;
  previousStage: string;
  current: GrowingBuddy;
  mintedBuddy?: CollectibleBuddy | null;
  message: string;
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
  personalizedStats?: {
    fullCheckins: number;
    tinyCheckins: number;
    favoriteCheckinTime: string;
    completionRate: number;
  };
  realMoments?: {
    id: string;
    day: number;
    completedType: 'full' | 'tiny';
    optionalNote?: string;
    createdAt: string;
  }[];
  nextRecommendations: Recommendation[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'continue' | 'related_video' | 'related_node' | 'light_reminder';
}

export interface ProfileSummary {
  companion: {
    name: string;
    level: number;
    levelLabel: string;
    totalPoints: number;
    weeklyPoints: number;
    weeklyTarget: number;
    nextLevelPoints: number;
    pointsToNextLevel: number;
  };
  wallet: WalletSummary;
  buddy: BuddySummary;
  garden: {
    collectionCount: number;
    inventoryCount: number;
    drawCost: number;
  };
  todayGoal: {
    state: 'active' | 'saved' | 'completed' | 'empty';
    challengeId?: string;
    challengeTitle?: string;
    dayLabel: string;
    nodeTitle?: string;
    body: string;
    actionLabel: string;
    route: string;
  };
  stats: {
    streakDays: number;
    favoriteExecutionTime: string;
    completionRate: number;
    weeklyLitNodes: number;
  };
  badges: {
    earned: ProfileBadge[];
    upcoming: ProfileBadge[];
  };
  unlockables: {
    id: string;
    title: string;
    requiredPoints: number;
    unlocked: boolean;
  }[];
  litNodes: {
    id: string;
    title: string;
    tone: 'mint' | 'coral' | 'blue';
  }[];
  insight: {
    title: string;
    body: string;
  };
}

export interface ProfileBadge {
  id: string;
  title: string;
  condition: string;
  tone: 'mint' | 'coral' | 'blue';
}
