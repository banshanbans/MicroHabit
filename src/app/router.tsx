import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';

const HomePage = lazy(() => import('../pages/HomePage').then((module) => ({ default: module.HomePage })));
const AnalyzingPage = lazy(() => import('../pages/AnalyzingPage').then((module) => ({ default: module.AnalyzingPage })));
const AnalysisResultPage = lazy(() => import('../pages/AnalysisResultPage').then((module) => ({ default: module.AnalysisResultPage })));
const GraphPreviewPage = lazy(() => import('../pages/GraphPreviewPage').then((module) => ({ default: module.GraphPreviewPage })));
const ChallengeCreatePage = lazy(() => import('../pages/ChallengeCreatePage').then((module) => ({ default: module.ChallengeCreatePage })));
const ChallengeSetupPage = lazy(() => import('../pages/ChallengeSetupPage').then((module) => ({ default: module.ChallengeSetupPage })));
const ChallengePlanPage = lazy(() => import('../pages/ChallengePlanPage').then((module) => ({ default: module.ChallengePlanPage })));
const TodayActionPage = lazy(() => import('../pages/TodayActionPage').then((module) => ({ default: module.TodayActionPage })));
const CheckinSuccessPage = lazy(() => import('../pages/CheckinSuccessPage').then((module) => ({ default: module.CheckinSuccessPage })));
const ChallengeListPage = lazy(() => import('../pages/ChallengeListPage').then((module) => ({ default: module.ChallengeListPage })));
const ReportPage = lazy(() => import('../pages/ReportPage').then((module) => ({ default: module.ReportPage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const GardenPage = lazy(() => import('../pages/GardenPage').then((module) => ({ default: module.GardenPage })));
const NurseryPage = lazy(() => import('../pages/NurseryPage').then((module) => ({ default: module.NurseryPage })));

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<div className="app-page"><div className="phone"><main className="content"><div className="page-inner"><p className="body">加载中...</p></div></main></div></div>}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  { path: '/', element: withSuspense(<HomePage />) },
  { path: '/analyzing/:videoId', element: withSuspense(<AnalyzingPage />) },
  { path: '/result/:analysisId', element: withSuspense(<AnalysisResultPage />) },
  { path: '/graph/:graphId', element: withSuspense(<GraphPreviewPage />) },
  { path: '/challenge/new/:graphId', element: withSuspense(<ChallengeCreatePage />) },
  { path: '/challenge/setup/:id', element: withSuspense(<ChallengeSetupPage />) },
  { path: '/challenge/plan/:id', element: withSuspense(<ChallengePlanPage />) },
  { path: '/challenge/:id/today', element: withSuspense(<TodayActionPage />) },
  { path: '/checkin/success/:id', element: withSuspense(<CheckinSuccessPage />) },
  { path: '/challenges', element: withSuspense(<ChallengeListPage />) },
  { path: '/report/:challengeId', element: withSuspense(<ReportPage />) },
  { path: '/profile', element: withSuspense(<ProfilePage />) },
  { path: '/garden', element: withSuspense(<GardenPage />) },
  { path: '/nursery', element: withSuspense(<NurseryPage />) },
]);
