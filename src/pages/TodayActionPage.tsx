import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { api } from '../mocks/api';
import { Button, Card, PageShell } from '../shared/components';

export function TodayActionPage() {
  const { id = 'challenge_sedentary_7d_001' } = useParams();
  const navigate = useNavigate();
  const setCompletedType = useFlowStore((s) => s.setCompletedType);
  const setPendingCheckinDay = useFlowStore((s) => s.setPendingCheckinDay);
  const storeChallenge = useFlowStore((s) => s.challengesById[id]);
  const { data } = useQuery({ queryKey: ['challenge', id], queryFn: () => api.getChallenge(id) });
  const challenge = storeChallenge ?? data;
  const today = challenge?.days.find((day) => day.status === 'today') ?? challenge?.days.find((day) => day.day === challenge.currentDay);
  if (!challenge) return <PageShell title="今日行动" showBack><p className="body">加载中...</p></PageShell>;
  if (!today || challenge.status === 'completed') {
    return (
      <PageShell title="今日行动" showBack>
        <div className="stack-lg">
          <Card className="tint-mint">
            <h1 className="headline-lg">这个挑战已经完成</h1>
            <p className="body" style={{ marginTop: 8 }}>你已经点亮了这条健康路径，可以去查看复盘报告。</p>
          </Card>
          <Button onClick={() => navigate(`/report/${id}`)}>查看复盘报告</Button>
        </div>
      </PageShell>
    );
  }
  const done = (type: 'full' | 'tiny') => {
    setCompletedType(type);
    setPendingCheckinDay(today.day);
    navigate(`/checkin/success/${id}`);
  };
  return (
    <PageShell title={today.title} showBack hideNav>
      <div className="stack-lg">
        <section className="hero stack">
          <div className="sprout float" style={{ width: 136, height: 136 }}>
            <CheckCircle2 size={64} />
          </div>
          <p className="label" style={{ color: 'var(--primary)' }}>今日节点：{today.title}</p>
          <h1 className="headline-xl">{today.microAction}</h1>
          <p className="body">{today.why}</p>
        </section>
        <Card>
          <h2 className="headline-md">怎么做</h2>
          <div className="stack" style={{ marginTop: 12 }}>
            {today.howTo.map((step, index) => (
              <div className="row" key={step}>
                <span className="dot done">{index + 1}</span>
                <p className="body">{step}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="safety">
          <h3 className="headline-md">注意事项</h3>
          {today.precautions.map((item) => <p className="body" key={item} style={{ color: 'var(--coral-deep)', marginTop: 8 }}>{item}</p>)}
        </Card>
        <div className="stack">
          <Button onClick={() => done('full')}>我完成了</Button>
          <Button variant="ghost" onClick={() => done('tiny')}>今天只做了 30 秒</Button>
        </div>
      </div>
    </PageShell>
  );
}
