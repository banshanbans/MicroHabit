import { useQuery } from '@tanstack/react-query';
import { PlayCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { api } from '../mocks/api';
import { Button, Card, PageShell, ProgressBar, SectionTitle } from '../shared/components';

export function ChallengePlanPage() {
  const { id = 'challenge_sedentary_7d_001' } = useParams();
  const navigate = useNavigate();
  const storeChallenge = useFlowStore((state) => state.challengesById[id]);
  const { data } = useQuery({ queryKey: ['challenge', id], queryFn: () => api.getChallenge(id) });
  const challenge = storeChallenge ?? data;
  if (!challenge) return <PageShell title="挑战计划" showBack><p className="body">加载中...</p></PageShell>;
  return (
    <PageShell title="挑战计划" showBack>
      <div className="stack-lg">
        <SectionTitle title={challenge.title} body={`来源视频主题 · 周期 ${challenge.durationDays} 天`} />
        <Card className="tint-mint">
          <div className="row space-between">
            <p className="label">当前进度</p>
            <p className="label">{challenge.progress.completedDays} / {challenge.progress.totalDays}</p>
          </div>
          <div style={{ marginTop: 12 }}><ProgressBar value={challenge.progress.completedDays} total={challenge.progress.totalDays} /></div>
        </Card>
        <div className="timeline">
          {challenge.days.map((day) => (
            <Card key={day.day}>
              <div className="timeline-step">
                <span className={`dot ${day.status === 'completed' ? 'done' : day.status === 'today' ? 'active' : ''}`}>{day.day}</span>
                <div>
                  <h3 className="headline-md">Day {day.day}：{day.title}</h3>
                  <p className="body">{day.microAction}</p>
                  <p className="tiny">点亮「{day.title}」</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Button onClick={() => navigate(challenge.status === 'completed' ? `/report/${id}` : `/challenge/${id}/today`)}>
          <PlayCircle size={18} />
          {challenge.status === 'completed' ? '查看复盘' : `开始 Day ${challenge.currentDay}`}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/challenges')}>先保存到我的挑战</Button>
      </div>
    </PageShell>
  );
}
