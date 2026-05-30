import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Challenge, ChallengeDuration, CheckinResult, VideoScenario } from '../shared/types';

interface FlowState {
  scenario: VideoScenario;
  selectedDuration: ChallengeDuration;
  currentVideoId?: string;
  currentAnalysisId?: string;
  currentGraphId?: string;
  latestChallengeId: string;
  completedType: 'full' | 'tiny';
  pendingCheckinDay?: number;
  challengesById: Record<string, Challenge>;
  latestCheckin?: CheckinResult;
  setScenario: (scenario: VideoScenario) => void;
  setDuration: (duration: ChallengeDuration) => void;
  setCurrentVideo: (id: string) => void;
  setCurrentAnalysis: (id: string) => void;
  setCurrentGraph: (id: string) => void;
  setLatestChallenge: (id: string) => void;
  setCompletedType: (type: 'full' | 'tiny') => void;
  setPendingCheckinDay: (day: number) => void;
  upsertChallenge: (challenge: Challenge) => void;
  setLatestCheckin: (result: CheckinResult) => void;
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
      scenario: 'sedentary',
      selectedDuration: 7,
      currentVideoId: 'video_sedentary_001',
      currentAnalysisId: 'analysis_sedentary_001',
      currentGraphId: 'graph_sedentary_001',
      latestChallengeId: 'challenge_sedentary_7d_001',
      completedType: 'full',
      pendingCheckinDay: undefined,
      challengesById: {},
      setScenario: (scenario) => set({ scenario }),
      setDuration: (selectedDuration) => set({ selectedDuration }),
      setCurrentVideo: (currentVideoId) => set({ currentVideoId }),
      setCurrentAnalysis: (currentAnalysisId) => set({ currentAnalysisId }),
      setCurrentGraph: (currentGraphId) => set({ currentGraphId }),
      setLatestChallenge: (latestChallengeId) => set({ latestChallengeId }),
      setCompletedType: (completedType) => set({ completedType }),
      setPendingCheckinDay: (pendingCheckinDay) => set({ pendingCheckinDay }),
      upsertChallenge: (challenge) =>
        set((state) => ({
          challengesById: {
            ...state.challengesById,
            [challenge.id]: challenge,
          },
          latestChallengeId: challenge.id,
          currentGraphId: challenge.graphId,
        })),
      setLatestCheckin: (latestCheckin) => set({ latestCheckin }),
    }),
    {
      name: 'microhabit-flow',
      version: 1,
    },
  ),
);
