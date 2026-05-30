import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { queryClient } from '../app/queryClient';
import { api } from '../mocks/api';
import { Button, Card, HealthGraphCanvas, PageShell, ProgressBar } from '../shared/components';
import { CheckinResult } from '../shared/types';

export function CheckinSuccessPage() {
  const { id = 'challenge_sedentary_7d_001' } = useParams();
  const navigate = useNavigate();
  const completedType = useFlowStore((s) => s.completedType);
  const pendingCheckinDay = useFlowStore((s) => s.pendingCheckinDay);
  const storeChallenge = useFlowStore((s) => s.challengesById[id]);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const startedRef = useRef(false);
  const checkin = useMutation({
    mutationFn: api.completeCheckin,
    onSuccess: (nextResult) => {
      setResult(nextResult);
      const updated = useFlowStore.getState().challengesById[id];
      queryClient.setQueryData(['challenge', id], updated);
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
  const { data: challenge } = useQuery({ queryKey: ['challenge', id], queryFn: () => api.getChallenge(id) });
  const activeChallenge = storeChallenge ?? challenge;
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

  if (!graph || !result) return <PageShell title="点亮中" showBack><p className="body">节点正在点亮...</p></PageShell>;
  return (
    <PageShell title="点亮成功" showBack>
      <div className="stack-lg">
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
              <p className="tiny">中心是主题，外圈显示你点亮的路径。</p>
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
        <Button variant="secondary" onClick={() => navigate(`/challenge/${id}/today`)}>{result.nextDay ? '明天继续' : '挑战完成'}</Button>
        <Button variant="ghost" onClick={() => navigate(`/report/${id}`)}><BarChart3 size={18} />查看 7 天复盘</Button>
      </div>
    </PageShell>
  );
}
