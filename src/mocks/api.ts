import { analysisResults } from './data/analysis.mock';
import { challenges, createChallenge } from './data/challenges.mock';
import { checkins } from './data/checkins.mock';
import { graphs } from './data/graphs.mock';
import { createReport, reports } from './data/reports.mock';
import { videos } from './data/videos.mock';
import { useFlowStore } from '../app/flowStore';
import { apiBlobRequest, apiRequest } from '../shared/api/client';
import { AnalysisResult, AnalysisTask, BuddySummary, Challenge, ChallengeDuration, CheckinResult, ExecutionPlan, HealthGraph, ProfileSummary, ReviewReport, WalletSummary, VideoScenario, VideoSource } from '../shared/types';

const delay = <T,>(value: T, ms = 280) => new Promise<T>((resolve) => window.setTimeout(() => resolve(value), ms));

const scenarioFromAny = (input?: string): VideoScenario => {
  if (input?.includes('meditation') || input?.includes('冥想') || input?.includes('专注') || input?.includes('emotion') || input?.includes('压力') || input?.includes('情绪')) return 'meditation';
  if (input?.includes('eye_yoga') || input?.includes('eye-yoga') || input?.includes('眼') || input?.includes('护眼')) return 'eye_yoga';
  return 'stretch';
};

const durationFromId = (input?: string): ChallengeDuration => {
  if (input?.includes('21d')) return 21;
  if (input?.includes('15d')) return 15;
  return 7;
};

const cloneChallenge = (challenge: Challenge): Challenge => ({
  ...challenge,
  plan: { ...challenge.plan },
  days: challenge.days.map((day) => ({ ...day, howTo: [...day.howTo], precautions: [...day.precautions] })),
  progress: {
    ...challenge.progress,
    completedNodeIds: [...challenge.progress.completedNodeIds],
  },
});

const mockSeedlings: BuddySummary['seedlings'] = [
  {
    id: 'seed_mint_sprout',
    name: '薄荷小芽',
    rarity: 'common',
    targetCheckins: 5,
    emoji: '🌱',
    description: '适合第一轮微行动陪伴，轻轻亮起来。',
    matureForm: { id: 'buddy_glow_sprout', name: '发光小芽', emoji: '🌿' },
  },
  {
    id: 'seed_coral_bloom',
    name: '珊瑚花芽',
    rarity: 'rare',
    targetCheckins: 10,
    emoji: '🌷',
    description: '更温暖一点的陪伴，适合连续挑战。',
    matureForm: { id: 'buddy_coral_bloom', name: '珊瑚花小芽', emoji: '🌸' },
  },
  {
    id: 'seed_starlight_sprout',
    name: '星光芽',
    rarity: 'epic',
    targetCheckins: 14,
    emoji: '✨',
    description: '夜光感的小芽，适合长期守护。',
    matureForm: { id: 'buddy_starlight_sprout', name: '星光小芽', emoji: '🌟' },
  },
];

function buildMockWallet(totalPoints: number): WalletSummary {
  return {
    balance: totalPoints,
    currentPoints: totalPoints,
    transactions: totalPoints
      ? [{ id: 'mock_wallet_1', amount: totalPoints, reason: 'mock_progress', refId: 'mock', balanceAfter: totalPoints, meta: {}, createdAt: new Date().toISOString() }]
      : [],
  };
}

function buildMockBuddies(completedCheckins: number, completedChallenges: number): BuddySummary {
  const active = completedChallenges > 0
    ? null
    : {
        id: 'mock_growing_buddy',
        seedlingId: 'seed_mint_sprout',
        name: '薄荷小芽',
        rarity: 'common' as const,
        emoji: '🌱',
        stage: completedCheckins >= 3 ? 'bud' as const : completedCheckins >= 2 ? 'sprout' as const : 'seedling' as const,
        stageLabel: completedCheckins >= 3 ? '蓄光期' : completedCheckins >= 2 ? '发芽期' : '种子期',
        energy: completedCheckins * 2,
        completedCheckins,
        targetCheckins: 5,
        progress: Math.min(1, completedCheckins / 5),
        status: 'active' as const,
        message: `再点亮 ${Math.max(0, 5 - completedCheckins)} 个节点，小芽就能完成这一轮成长。`,
        updatedAt: new Date().toISOString(),
      };
  return {
    active,
    inventory: completedChallenges ? [{ seedling: mockSeedlings[0], quantity: 1, updatedAt: new Date().toISOString() }] : [],
    collection: Array.from({ length: completedChallenges }).map((_, index) => ({
      id: `mock_collectible_${index}`,
      seedlingId: 'seed_mint_sprout',
      matureFormId: 'buddy_glow_sprout',
      name: '发光小芽',
      rarity: 'common' as const,
      description: '这是你通过微行动养成的一位伙伴。',
      emoji: '🌿',
      obtainedAt: new Date().toISOString(),
    })),
    seedlings: mockSeedlings,
    drawCost: 60,
  };
}

const mockApi = {
  parseVideo: ({ url, scenario }: { url?: string; scenario?: VideoScenario }) => {
    const resolved = scenario ?? scenarioFromAny(url);
    const video = videos.find((item) => item.scenario === resolved)!;
    useFlowStore.getState().setScenario(resolved);
    useFlowStore.getState().setCurrentVideo(video.id);
    return delay(video);
  },
  uploadVideo: async ({ file }: { file: File }) => {
    const resolved = scenarioFromAny(file.name);
    const source = videos.find((item) => item.scenario === resolved)!;
    const video: VideoSource = {
      ...source,
      id: `video_upload_mock_${Date.now()}`,
      source: 'douyin_upload',
      title: file.name.replace(/\.[^.]+$/, '') || source.title,
      rawDescription: 'Mock 上传视频',
      mimeType: file.type,
      fileSize: file.size,
      processingStatus: 'uploaded',
    };
    useFlowStore.getState().setScenario(video.scenario);
    useFlowStore.getState().setCurrentVideo(video.id);
    return delay(video, 360);
  },
  startAnalysis: ({ videoId }: { videoId: string }): Promise<AnalysisTask> => {
    const analysis = analysisResults.find((item) => item.videoId === videoId) ?? analysisResults[1];
    useFlowStore.getState().setScenario(analysis.scenario);
    useFlowStore.getState().setCurrentAnalysis(analysis.id);
    useFlowStore.getState().setCurrentGraph(analysis.graphId);
    return delay({ taskId: `task_mock_${Date.now()}`, analysisId: analysis.id, status: 'completed' as const, stage: 'completed' as const, progress: 100 }, 500);
  },
  getAnalysisTask: (taskId: string): Promise<AnalysisTask> => delay({ taskId, status: 'completed', stage: 'completed', progress: 100, analysisId: useFlowStore.getState().currentAnalysisId ?? null }, 420),
  getAnalysis: (analysisId: string) => delay(analysisResults.find((item) => item.id === analysisId)!),
  getGraph: (graphId: string) => {
    useFlowStore.getState().setCurrentGraph(graphId);
    return delay(graphs.find((item) => item.id === graphId)!);
  },
  createChallenge: ({
    graphId,
    durationDays,
    plan,
    status = 'active',
  }: {
    graphId: string;
    durationDays: ChallengeDuration;
    plan: Partial<ExecutionPlan>;
    status?: 'active' | 'saved';
  }) => {
    const scenario = scenarioFromAny(graphId);
    const challenge = createChallenge(scenario, durationDays);
    challenge.plan = { ...challenge.plan, ...plan };
    challenge.status = status;
    challenge.startedAt = status === 'active' ? challenge.startedAt : undefined;
    challenge.days = challenge.days.map((day) => ({ ...day, status: status === 'active' && day.day === 1 ? 'today' : 'locked' }));
    useFlowStore.getState().setScenario(scenario);
    useFlowStore.getState().upsertChallenge(challenge);
    return delay({ challengeId: challenge.id });
  },
  startChallenge: (challengeId: string) => {
    const stored = useFlowStore.getState().challengesById[challengeId];
    const challenge = cloneChallenge(stored ?? createChallenge(scenarioFromAny(challengeId), durationFromId(challengeId)));
    const updated: Challenge = {
      ...challenge,
      status: 'active',
      startedAt: challenge.startedAt ?? new Date().toISOString(),
      days: challenge.days.map((day) => ({ ...day, status: day.day === challenge.currentDay ? 'today' : day.day < challenge.currentDay ? 'completed' : 'locked' })),
    };
    useFlowStore.getState().upsertChallenge(updated);
    return delay(updated);
  },
  getChallenge: (challengeId: string) => {
    const stored = useFlowStore.getState().challengesById[challengeId];
    if (stored) return delay(cloneChallenge(stored));
    const scenario = scenarioFromAny(challengeId);
    return delay(cloneChallenge(challenges.find((item) => item.id === challengeId) ?? createChallenge(scenario, durationFromId(challengeId))));
  },
  listChallenges: () => {
    const stored = Object.values(useFlowStore.getState().challengesById).map(cloneChallenge);
    const storedIds = new Set(stored.map((challenge) => challenge.id));
    return delay([...stored, ...challenges.filter((challenge) => !storedIds.has(challenge.id)).map(cloneChallenge)]);
  },
  completeCheckin: ({
    challengeId,
    day,
    completedType,
  }: {
    challengeId: string;
    day: number;
    completedType: 'full' | 'tiny';
    optionalNote?: string;
  }) => {
    const scenario = scenarioFromAny(challengeId);
    const stored = useFlowStore.getState().challengesById[challengeId];
    const challenge = cloneChallenge(stored ?? createChallenge(scenario, durationFromId(challengeId)));
    const completedDay = Math.min(day || challenge.currentDay, challenge.durationDays);
    const today = challenge.days.find((item) => item.day === completedDay) ?? challenge.days[0];
    const latest = useFlowStore.getState().latestCheckin;
    if (today.status === 'completed' && latest?.challengeId === challengeId && latest.completedDay === completedDay) {
      return delay(latest);
    }
    const nextDay = completedDay < challenge.durationDays ? completedDay + 1 : undefined;
    const completedNodeIds = Array.from(new Set([...challenge.progress.completedNodeIds, today.graphNodeId]));
    const updatedChallenge: Challenge = {
      ...challenge,
      currentDay: nextDay ?? completedDay,
      status: nextDay ? 'active' : 'completed',
      completedAt: nextDay ? undefined : new Date().toISOString(),
      days: challenge.days.map((item) => ({
        ...item,
        status: item.day <= completedDay ? 'completed' : item.day === nextDay ? 'today' : 'locked',
      })),
      progress: {
        completedDays: Math.max(challenge.progress.completedDays, completedDay),
        totalDays: challenge.durationDays,
        completedNodeIds,
      },
    };
    const encouragement =
      completedType === 'tiny'
        ? '做不到完整版本也没关系，30 秒也是一次有效的开始。你已经让这个节点亮了一点光。'
        : checkins[0].encouragement;
    const points = completedType === 'tiny' ? 8 : 15;
    const checkin = {
      ...checkins[0],
      id: `checkin_${scenario}_${completedDay}_${completedType}`,
      challengeId,
      day: completedDay,
      graphNodeId: today.graphNodeId,
      completedType,
      optionalNote: completedType === 'tiny' ? '今天只做了 30 秒' : undefined,
      encouragement,
    };
    const result: CheckinResult = {
      checkinId: checkin.id,
      challengeId,
      completedDay,
      completedType,
      litNodeId: checkin.graphNodeId,
      encouragement: checkin.encouragement,
      points,
      progress: { completedDays: updatedChallenge.progress.completedDays, totalDays: updatedChallenge.durationDays },
      nextDay,
      wallet: buildMockWallet(updatedChallenge.progress.completedDays * 15 + (nextDay ? 0 : 120)),
      buddyGrowth: {
        energyDelta: completedType === 'tiny' ? 1 : 2,
        previousEnergy: Math.max(0, (completedDay - 1) * 2),
        previousStage: completedDay > 2 ? 'sprout' : 'seedling',
        current: buildMockBuddies(Math.min(completedDay, 5), 0).active!,
        mintedBuddy: completedDay >= 5 ? buildMockBuddies(5, 1).collection[0] : null,
        message: completedDay >= 5 ? '「发光小芽」成熟了。它会留在你的微光花园里。' : `小芽多了一点微光，再点亮 ${Math.max(0, 5 - completedDay)} 个节点就能完成这一轮成长。`,
      },
    };
    if (result.buddyGrowth?.mintedBuddy) {
      result.mintedBuddy = result.buddyGrowth.mintedBuddy;
    }
    useFlowStore.getState().upsertChallenge(updatedChallenge);
    useFlowStore.getState().setLatestCheckin(result);
    return delay(result);
  },
  getReport: (challengeId: string) => {
    const challenge = useFlowStore.getState().challengesById[challengeId];
    const scenario = challenge ? scenarioFromAny(challenge.graphId) : scenarioFromAny(challengeId);
    return delay(reports.find((item) => item.challengeId === challengeId) ?? createReport(scenario, challengeId));
  },
  getProfile: async (): Promise<ProfileSummary> => {
    const stored = Object.values(useFlowStore.getState().challengesById).map(cloneChallenge);
    const active = stored.find((challenge) => challenge.status === 'active');
    const saved = stored.find((challenge) => challenge.status === 'saved' || challenge.status === 'draft');
    const completed = stored.filter((challenge) => challenge.status === 'completed');
    const today = active?.days.find((day) => day.status === 'today') ?? active?.days[0];
    const totalPoints = completed.length * 120 + (active?.progress.completedDays ?? 0) * 15;
    const weeklyPoints = Math.min(180, totalPoints);
    const completionRate = active ? active.progress.completedDays / active.durationDays : completed.length ? 1 : 0;
    const upcoming = buildMockUpcomingBadges(stored, totalPoints, weeklyPoints);
    const buddy = buildMockBuddies(active?.progress.completedDays ?? 0, completed.length);
    const wallet = buildMockWallet(totalPoints);
    return delay({
      companion: {
        name: '小芽',
        level: Math.floor(totalPoints / 100) + 1,
        levelLabel: `Lv.${Math.floor(totalPoints / 100) + 1} 发光小芽`,
        totalPoints,
        weeklyPoints,
        weeklyTarget: 180,
        nextLevelPoints: (Math.floor(totalPoints / 100) + 1) * 100,
        pointsToNextLevel: Math.max(0, (Math.floor(totalPoints / 100) + 1) * 100 - totalPoints),
      },
      stats: {
        streakDays: active?.progress.completedDays ?? completed.length,
        favoriteExecutionTime: active?.plan.preferredTime ?? saved?.plan.preferredTime ?? '暂未形成固定时间',
        completionRate,
        weeklyLitNodes: active?.progress.completedNodeIds.length ?? 0,
      },
      wallet,
      buddy,
      garden: {
        collectionCount: buddy.collection.length,
        inventoryCount: buddy.inventory.reduce((sum, item) => sum + item.quantity, 0),
        drawCost: buddy.drawCost,
      },
      todayGoal: active && today
        ? {
            state: 'active',
            challengeId: active.id,
            challengeTitle: active.title,
            dayLabel: `Day ${active.currentDay}`,
            nodeTitle: today.title,
            body: `完成「${today.title}」：${today.microAction}`,
            actionLabel: '去完成今日行动',
            route: `/challenge/${active.id}/today`,
          }
        : saved
          ? {
              state: 'saved',
              challengeId: saved.id,
              challengeTitle: saved.title,
              dayLabel: '轻轻开始就好',
              body: `你保存了「${saved.title}」，可以先确认计划再开始。`,
              actionLabel: '查看挑战计划',
              route: `/challenge/plan/${saved.id}`,
            }
          : completed[0]
            ? {
                state: 'completed',
                challengeId: completed[0].id,
                challengeTitle: completed[0].title,
                dayLabel: '已完成',
                body: `最近完成了「${completed[0].title}」，可以查看复盘或开启新的微行动。`,
                actionLabel: '查看复盘报告',
                route: `/report/${completed[0].id}`,
              }
            : {
            state: 'empty',
            dayLabel: '轻轻开始就好',
            body: '还没有今日行动。先选择一个健康视频，让 AI 帮你生成第一条微习惯路径。',
            actionLabel: '创建我的挑战',
            route: '/',
            },
      badges: {
        earned: completed.map((challenge, index) => ({
          id: `mock_badge_${challenge.id}`,
          title: badgeNameForScenario(scenarioFromAny(challenge.graphId)),
          condition: `完成「${challenge.title}」后获得`,
          tone: index % 3 === 0 ? 'mint' : index % 3 === 1 ? 'coral' : 'blue',
        })),
        upcoming,
      },
      unlockables: [
        { id: 'voice', title: '温柔陪伴语气', requiredPoints: 30, unlocked: totalPoints >= 30 },
        { id: 'skin', title: '夜光小芽皮肤', requiredPoints: 100, unlocked: totalPoints >= 100 },
        { id: 'theme', title: '星光健康图谱主题', requiredPoints: 180, unlocked: totalPoints >= 180 },
      ],
      litNodes: active?.days.filter((day) => day.status === 'completed').map((day, index) => ({ id: day.graphNodeId, title: day.title, tone: index % 3 === 0 ? 'mint' : index % 3 === 1 ? 'coral' : 'blue' })) ?? [],
      insight: { title: 'AI 发现', body: '你更容易在固定场景完成低门槛行动。下一轮建议继续选择 1-2 分钟的微习惯挑战。' },
    });
  },
  getWallet: async () => {
    const stored = Object.values(useFlowStore.getState().challengesById).map(cloneChallenge);
    const active = stored.find((challenge) => challenge.status === 'active');
    const completed = stored.filter((challenge) => challenge.status === 'completed');
    return delay(buildMockWallet(completed.length * 120 + (active?.progress.completedDays ?? 0) * 15));
  },
  getBuddies: async () => {
    const stored = Object.values(useFlowStore.getState().challengesById).map(cloneChallenge);
    const active = stored.find((challenge) => challenge.status === 'active');
    const completed = stored.filter((challenge) => challenge.status === 'completed');
    return delay(buildMockBuddies(active?.progress.completedDays ?? 0, completed.length));
  },
  drawSeedling: async () => delay({ wallet: buildMockWallet(60), seedling: mockSeedlings[0], inventoryItem: { seedling: mockSeedlings[0], quantity: 1, updatedAt: new Date().toISOString() }, message: '你获得了「薄荷小芽」，可以把它种成下一轮陪伴。' }),
  plantSeedling: async ({ seedlingId }: { seedlingId: string }) => delay({ active: buildMockBuddies(0, 0).active, inventoryItem: { seedling: mockSeedlings.find((item) => item.id === seedlingId) ?? mockSeedlings[0], quantity: 0, updatedAt: new Date().toISOString() } }),
  speakCompanion: async (_payload?: { intent?: 'daily_goal' | 'analysis_waiting' }) => {
    throw new Error('Mock 模式暂不合成语音');
  },
};

function buildMockUpcomingBadges(challenges: Challenge[], totalPoints: number, weeklyPoints: number): ProfileSummary['badges']['upcoming'] {
  const activeOrSaved = challenges.find((challenge) => challenge.status === 'active' || challenge.status === 'saved' || challenge.status === 'draft');
  const items: ProfileSummary['badges']['upcoming'] = [];
  if (!challenges.length) {
    items.push({ id: 'starter', title: '微习惯启动者', condition: '创建第一条健康图谱挑战', tone: 'mint' });
  }
  if (activeOrSaved) {
    const scenario = scenarioFromAny(activeOrSaved.graphId);
    const title = badgeNameForScenario(scenario);
    items.push({
      id: `finish_${activeOrSaved.id}`,
      title,
      condition: `完成「${activeOrSaved.title}」剩余 ${Math.max(0, activeOrSaved.durationDays - activeOrSaved.progress.completedDays)} 天`,
      tone: 'mint',
    });
  }
  if (weeklyPoints < 180) {
    items.push({ id: 'weekly', title: '稳定点亮者', condition: `本周还差 ${180 - weeklyPoints} 点微光`, tone: 'blue' });
  }
  if (totalPoints < 100) {
    items.push({ id: 'level_2', title: '小芽升级', condition: `再收集 ${100 - totalPoints} 点微光，小芽升到下一阶段`, tone: 'coral' });
  }
  return items.slice(0, 3);
}

function badgeNameForScenario(scenario: VideoScenario) {
  if (scenario === 'meditation') return '专注微光练习生';
  if (scenario === 'eye_yoga') return '护眼观察员';
  return '身体松弛练习生';
}

const realApi = {
  parseVideo: async ({ url, scenario }: { url?: string; scenario?: VideoScenario }) => {
    const video = await apiRequest<VideoSource>('/api/videos/parse', {
      method: 'POST',
      body: JSON.stringify({ url, scenario }),
    });
    useFlowStore.getState().setScenario(video.scenario);
    useFlowStore.getState().setCurrentVideo(video.id);
    return video;
  },
  uploadVideo: async ({ file, source = 'douyin_upload' }: { file: File; source?: string }) => {
    const body = new FormData();
    body.append('file', file);
    body.append('source', source);
    const video = await apiRequest<VideoSource>('/api/videos/upload', {
      method: 'POST',
      body,
    });
    useFlowStore.getState().setScenario(video.scenario);
    useFlowStore.getState().setCurrentVideo(video.id);
    return video;
  },
  startAnalysis: async ({ videoId }: { videoId: string }) => {
    const result = await apiRequest<AnalysisTask>('/api/analysis', {
      method: 'POST',
      body: JSON.stringify({ videoId }),
    });
    if (result.analysisId) {
      useFlowStore.getState().setCurrentAnalysis(result.analysisId);
    }
    return result;
  },
  getAnalysisTask: async (taskId: string) => {
    const task = await apiRequest<AnalysisTask>(`/api/analysis/tasks/${taskId}`);
    if (task.analysisId) {
      useFlowStore.getState().setCurrentAnalysis(task.analysisId);
    }
    return task;
  },
  getAnalysis: async (analysisId: string) => {
    const result = await apiRequest<AnalysisResult>(`/api/analysis/${analysisId}`);
    useFlowStore.getState().setScenario(result.scenario);
    useFlowStore.getState().setCurrentGraph(result.graphId);
    return result;
  },
  getGraph: async (graphId: string) => {
    const graph = await apiRequest<HealthGraph>(`/api/graphs/${graphId}`);
    useFlowStore.getState().setCurrentGraph(graph.id);
    return graph;
  },
  createChallenge: async ({
    graphId,
    durationDays,
    plan,
    status = 'active',
  }: {
    graphId: string;
    durationDays: ChallengeDuration;
    plan: Partial<ExecutionPlan>;
    status?: 'active' | 'saved';
  }) => {
    const result = await apiRequest<{ challengeId: string }>('/api/challenges', {
      method: 'POST',
      body: JSON.stringify({ graphId, durationDays, plan, status }),
    });
    useFlowStore.getState().setLatestChallenge(result.challengeId);
    return result;
  },
  startChallenge: async (challengeId: string) => {
    const challenge = await apiRequest<Challenge>(`/api/challenges/${challengeId}/start`, { method: 'POST' });
    useFlowStore.getState().setLatestChallenge(challenge.id);
    return challenge;
  },
  getChallenge: (challengeId: string) => apiRequest<Challenge>(`/api/challenges/${challengeId}`),
  listChallenges: () => apiRequest<Challenge[]>('/api/challenges'),
  completeCheckin: async ({
    challengeId,
    day,
    completedType,
    optionalNote,
  }: {
    challengeId: string;
    day: number;
    completedType: 'full' | 'tiny';
    optionalNote?: string;
  }) => {
    const result = await apiRequest<CheckinResult>('/api/checkins', {
      method: 'POST',
      body: JSON.stringify({ challengeId, day, completedType, optionalNote }),
    });
    useFlowStore.getState().setLatestCheckin(result);
    return result;
  },
  getReport: (challengeId: string) => apiRequest<ReviewReport>(`/api/reports/${challengeId}`),
  getProfile: () => apiRequest<ProfileSummary>('/api/profile/me'),
  getWallet: () => apiRequest<WalletSummary>('/api/wallet/me'),
  getBuddies: () => apiRequest<BuddySummary>('/api/buddies/me'),
  drawSeedling: () => apiRequest('/api/nursery/draw', { method: 'POST' }),
  plantSeedling: ({ seedlingId }: { seedlingId: string }) => apiRequest('/api/buddies/plant', {
    method: 'POST',
    body: JSON.stringify({ seedlingId }),
  }),
  speakCompanion: async ({ intent = 'daily_goal' }: { intent?: 'daily_goal' | 'analysis_waiting' } = {}) => {
    const { blob, headers } = await apiBlobRequest('/api/companion/speak', {
      method: 'POST',
      body: JSON.stringify({ intent }),
    });
    return {
      blob,
      text: decodeURIComponent(headers.get('X-Companion-Text') ?? ''),
    };
  },
};

export const api = import.meta.env.VITE_USE_MOCK_API === 'true' ? mockApi : realApi;
