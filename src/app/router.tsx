import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { AnalyzingPage } from '../pages/AnalyzingPage';
import { AnalysisResultPage } from '../pages/AnalysisResultPage';
import { GraphPreviewPage } from '../pages/GraphPreviewPage';
import { ChallengeCreatePage } from '../pages/ChallengeCreatePage';
import { ChallengeSetupPage } from '../pages/ChallengeSetupPage';
import { ChallengePlanPage } from '../pages/ChallengePlanPage';
import { TodayActionPage } from '../pages/TodayActionPage';
import { CheckinSuccessPage } from '../pages/CheckinSuccessPage';
import { ChallengeListPage } from '../pages/ChallengeListPage';
import { ReportPage } from '../pages/ReportPage';
import { ProfilePage } from '../pages/ProfilePage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/analyzing/:videoId', element: <AnalyzingPage /> },
  { path: '/result/:analysisId', element: <AnalysisResultPage /> },
  { path: '/graph/:graphId', element: <GraphPreviewPage /> },
  { path: '/challenge/new/:graphId', element: <ChallengeCreatePage /> },
  { path: '/challenge/setup/:id', element: <ChallengeSetupPage /> },
  { path: '/challenge/plan/:id', element: <ChallengePlanPage /> },
  { path: '/challenge/:id/today', element: <TodayActionPage /> },
  { path: '/checkin/success/:id', element: <CheckinSuccessPage /> },
  { path: '/challenges', element: <ChallengeListPage /> },
  { path: '/report/:challengeId', element: <ReportPage /> },
  { path: '/profile', element: <ProfilePage /> },
]);
