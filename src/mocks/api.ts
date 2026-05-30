import { analysisResults } from './data/analysis.mock';
import { challenges, createChallenge } from './data/challenges.mock';
import { checkins } from './data/checkins.mock';
import { graphs } from './data/graphs.mock';
import { createReport, reports } from './data/reports.mock';
import { videos } from './data/videos.mock';
import { useFlowStore } from '../app/flowStore';
import { Challenge, ChallengeDuration, CheckinResult, ExecutionPlan, VideoScenario } from '../shared/types';

const delay = <T,>(value: T, ms = 280) => new Promise<T>((resolve) => window.setTimeout(() => resolve(value), ms));

const scenarioFromAny = (input?: string): VideoScenario => {
  if (input?.includes('sleep')) return 'sleep';
  if (input?.includes('emotion')) return 'emotion';
  return 'sedentary';
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

export const api = {
  parseVideo: ({ url, scenario }: { url?: string; scenario?: VideoScenario }) => {
    const resolved = scenario ?? scenarioFromAny(url);
    const video = videos.find((item) => item.scenario === resolved)!;
    useFlowStore.getState().setScenario(resolved);
    useFlowStore.getState().setCurrentVideo(video.id);
    return delay(video);
  },
  startAnalysis: ({ videoId }: { videoId: string }) => {
    const analysis = analysisResults.find((item) => item.videoId === videoId)!;
    useFlowStore.getState().setScenario(analysis.scenario);
    useFlowStore.getState().setCurrentAnalysis(analysis.id);
    useFlowStore.getState().setCurrentGraph(analysis.graphId);
    return delay({ analysisId: analysis.id, status: 'completed' as const }, 500);
  },
  getAnalysis: (analysisId: string) => delay(analysisResults.find((item) => item.id === analysisId)!),
  getGraph: (graphId: string) => {
    useFlowStore.getState().setCurrentGraph(graphId);
    return delay(graphs.find((item) => item.id === graphId)!);
  },
  createChallenge: ({
    graphId,
    durationDays,
    plan,
  }: {
    graphId: string;
    durationDays: ChallengeDuration;
    plan: Partial<ExecutionPlan>;
  }) => {
    const scenario = scenarioFromAny(graphId);
    const challenge = createChallenge(scenario, durationDays);
    challenge.plan = { ...challenge.plan, ...plan };
    useFlowStore.getState().setScenario(scenario);
    useFlowStore.getState().upsertChallenge(challenge);
    return delay({ challengeId: challenge.id });
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
    };
    useFlowStore.getState().upsertChallenge(updatedChallenge);
    useFlowStore.getState().setLatestCheckin(result);
    return delay(result);
  },
  getReport: (challengeId: string) => {
    const challenge = useFlowStore.getState().challengesById[challengeId];
    const scenario = challenge ? scenarioFromAny(challenge.graphId) : scenarioFromAny(challengeId);
    return delay(reports.find((item) => item.challengeId === challengeId) ?? createReport(scenario, challengeId));
  },
};
