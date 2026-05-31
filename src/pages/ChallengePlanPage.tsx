import { useMutation, useQuery } from '@tanstack/react-query';
import { Home, PlayCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { queryClient } from '../app/queryClient';
import { api } from '../mocks/api';
import { Button, Card, PageShell, ProgressBar, SectionTitle } from '../shared/components';

export function ChallengePlanPage() {
  const { id = 'challenge_stretch_7d_001' } = useParams();
  const navigate = useNavigate();
  const { data, isError } = useQuery({ queryKey: ['challenge', id], queryFn: () => api.getChallenge(id), retry: false });
  const start = useMutation({
    mutationFn: api.startChallenge,
    onSuccess: (updated) => {
      queryClient.setQueryData(['challenge', id], updated);
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      navigate(`/challenge/${id}/today`);
    },
  });
  const challenge = data;
  if (isError) {
    return (
      <PageShell title="挑战计划" showBack>
        <div className="stack-lg challenge-plan-layout">
          <Card className="tint-coral">
            <h1 className="headline-lg">没有找到这个挑战</h1>
            <p className="body" style={{ marginTop: 8 }}>这个链接可能来自旧的本地 mock 数据。请从挑战列表进入真实挑战，或重新创建一个挑战。</p>
          </Card>
          <Button onClick={() => navigate('/challenges')}>查看我的挑战</Button>
          <Button variant="ghost" onClick={() => navigate('/')}><Home size={18} />回到首页</Button>
        </div>
      </PageShell>
    );
  }
  if (!challenge) return <PageShell title="挑战计划" showBack><p className="body">加载中...</p></PageShell>;
  return (
    <PageShell title="挑战计划" showBack>
      <div className="stack-lg challenge-plan-layout">
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
        <Button onClick={() => {
          if (challenge.status === 'completed') navigate(`/report/${id}`);
          else if (challenge.status === 'saved' || challenge.status === 'draft') start.mutate(id);
          else navigate(`/challenge/${id}/today`);
        }}>
          <PlayCircle size={18} />
          {challenge.status === 'completed' ? '查看复盘' : challenge.status === 'saved' || challenge.status === 'draft' ? '开始挑战' : `开始 Day ${challenge.currentDay}`}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/challenges')}>返回我的挑战</Button>
      </div>
    </PageShell>
  );
}
