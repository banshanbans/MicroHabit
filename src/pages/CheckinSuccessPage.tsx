import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Home, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { queryClient } from '../app/queryClient';
import { api } from '../mocks/api';
import { Button, Card, HealthGraphCanvas, PageShell, ProgressBar } from '../shared/components';
import { CheckinResult } from '../shared/types';

export function CheckinSuccessPage() {
  const { id = 'challenge_stretch_7d_001' } = useParams();
  const navigate = useNavigate();
  const completedType = useFlowStore((s) => s.completedType);
  const pendingCheckinDay = useFlowStore((s) => s.pendingCheckinDay);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const startedRef = useRef(false);
  const checkin = useMutation({
    mutationFn: api.completeCheckin,
    onSuccess: (nextResult) => {
      setResult(nextResult);
      const updated = useFlowStore.getState().challengesById[id];
      if (updated) queryClient.setQueryData(['challenge', id], updated);
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
  const { data: challenge, isError: challengeError } = useQuery({ queryKey: ['challenge', id], queryFn: () => api.getChallenge(id), retry: false });
  const activeChallenge = challenge;
  const { data: graph } = useQuery({ queryKey: ['graph', activeChallenge?.graphId], queryFn: () => api.getGraph(activeChallenge!.graphId), enabled: Boolean(activeChallenge) });

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    checkin.mutate({ challengeId: id, day: pendingCheckinDay ?? 1, completedType });
  }, [id, completedType, pendingCheckinDay]);

  const completedDay = useMemo(
    () => activeChallenge?.days.find((day) => day.day === result?.completedDay),
    [activeChallenge, result],
  );
  const currentNodeId = activeChallenge?.days.find((day) => day.status === 'today')?.graphNodeId;
  const title = completedDay?.title ?? activeChallenge?.days.find((day) => day.graphNodeId === result?.litNodeId)?.title ?? '微行动';

  if (challengeError || checkin.isError) {
    return (
      <PageShell title="点亮中" showBack>
        <div className="stack-lg checkin-success-layout">
          <Card className="tint-coral">
            <h1 className="headline-lg">没有找到这个挑战</h1>
            <p className="body" style={{ marginTop: 8 }}>这个挑战可能来自旧的本地数据。请回到挑战列表选择真实挑战。</p>
          </Card>
          <Button onClick={() => navigate('/challenges')}>查看我的挑战</Button>
          <Button variant="ghost" onClick={() => navigate('/')}><Home size={18} />回到首页</Button>
        </div>
      </PageShell>
    );
  }
  if (!graph || !result) return <PageShell title="点亮中" showBack><p className="body">节点正在点亮...</p></PageShell>;
  return (
    <PageShell title="点亮成功" showBack>
      <div className="stack-lg checkin-success-layout">
        <section className="hero stack">
          <motion.div className="badge-burst" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 160 }}>
            <Sparkles size={52} />
          </motion.div>
          <h1 className="headline-xl">你点亮了「{title}」</h1>
          <p className="body">{result.encouragement}</p>
          <span className="chip active">+{result.points} 微光积分</span>
        </section>
        <Card className="graph-card tint-mint">
          <div className="row space-between">
            <div>
              <h2 className="headline-md">健康图谱进度</h2>
              <p className="tiny">今天的节点已点亮。</p>
            </div>
            <span className="chip active">{result.progress.completedDays}/{result.progress.totalDays}</span>
          </div>
          <HealthGraphCanvas
            graph={graph}
            completedNodeIds={activeChallenge?.progress.completedNodeIds}
            currentNodeId={currentNodeId}
            litNodeId={result.litNodeId}
            variant="success"
          />
          <div className="row space-between">
            <p className="label">进度</p>
            <p className="label">{result.progress.completedDays} / {result.progress.totalDays}</p>
          </div>
          <ProgressBar value={result.progress.completedDays} total={result.progress.totalDays} />
        </Card>
        {result.buddyGrowth ? (
          <Card className="buddy-checkin-card">
            <div className="row space-between">
              <div>
                <p className="label" style={{ color: 'var(--primary)' }}>微光伙伴</p>
                <h2 className="headline-md">{result.buddyGrowth.current.emoji} {result.buddyGrowth.current.name}</h2>
              </div>
              <span className="chip active">+{result.buddyGrowth.energyDelta} 能量</span>
            </div>
            <p className="body" style={{ marginTop: 10 }}>{result.buddyGrowth.message}</p>
            <div className="row space-between" style={{ marginTop: 12 }}>
              <p className="label">{result.buddyGrowth.current.stageLabel}</p>
              <p className="label">{result.buddyGrowth.current.completedCheckins} / {result.buddyGrowth.current.targetCheckins}</p>
            </div>
            <ProgressBar value={result.buddyGrowth.current.completedCheckins} total={result.buddyGrowth.current.targetCheckins} />
          </Card>
        ) : null}
        {result.mintedBuddy ? (
          <Card className="minted-buddy-card">
            <div className="row">
              <span className="soft-icon coral">{result.mintedBuddy.emoji}</span>
              <div>
                <p className="label">新伙伴已加入花园</p>
                <h2 className="headline-md">{result.mintedBuddy.name}</h2>
              </div>
            </div>
            <p className="body" style={{ marginTop: 10 }}>{result.mintedBuddy.description}</p>
          </Card>
        ) : null}
        {completedDay ? (
          <Card>
            <div className="row space-between">
              <p className="label">今日行动摘要</p>
              <span className="chip active">{result.completedType === 'tiny' ? '30 秒完成' : '完整完成'}</span>
            </div>
            <p className="body" style={{ marginTop: 10 }}>{completedDay.microAction}</p>
            <div className="chip-row" style={{ marginTop: 12 }}>
              {completedDay.howTo.slice(0, 3).map((step) => <span className="chip" key={step}>{step}</span>)}
            </div>
          </Card>
        ) : null}
        <Button onClick={() => navigate('/challenges')}><ArrowRight size={18} />查看挑战进度</Button>
        <Button variant="secondary" onClick={() => navigate('/profile')}><Sparkles size={18} />回到微光中心</Button>
        <Button variant="secondary" onClick={() => navigate(`/challenge/${id}/today`)}>{result.nextDay ? '明天继续' : '挑战完成'}</Button>
        <Button variant="ghost" onClick={() => navigate(`/report/${id}`)}><BarChart3 size={18} />查看 7 天复盘</Button>
      </div>
    </PageShell>
  );
}
