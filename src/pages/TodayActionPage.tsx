import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock3, Home, PlayCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { api } from '../mocks/api';
import { Button, Card, PageShell } from '../shared/components';
import { getDemoVideoForChallenge } from '../shared/demoVideos';

export function TodayActionPage() {
  const { id = 'challenge_stretch_7d_001' } = useParams();
  const navigate = useNavigate();
  const setCompletedType = useFlowStore((s) => s.setCompletedType);
  const setPendingCheckinDay = useFlowStore((s) => s.setPendingCheckinDay);
  const { data, isError } = useQuery({ queryKey: ['challenge', id], queryFn: () => api.getChallenge(id), retry: false });
  const challenge = data;
  const today = challenge?.days.find((day) => day.status === 'today') ?? challenge?.days.find((day) => day.day === challenge.currentDay);
  const demoVideo = getDemoVideoForChallenge({ videoId: challenge?.videoId, graphId: challenge?.graphId, title: challenge?.title });
  if (isError) {
    return (
      <PageShell title="今日行动" showBack>
        <div className="stack-lg today-action-layout">
          <Card className="tint-coral">
            <h1 className="headline-lg">没有找到这个挑战</h1>
            <p className="body" style={{ marginTop: 8 }}>这个挑战 id 不是当前后端里的真实记录。请从挑战列表进入，或重新创建一个挑战。</p>
          </Card>
          <Button onClick={() => navigate('/challenges')}>查看我的挑战</Button>
          <Button variant="ghost" onClick={() => navigate('/')}><Home size={18} />回到首页</Button>
        </div>
      </PageShell>
    );
  }
  if (!challenge) return <PageShell title="今日行动" showBack><p className="body">加载中...</p></PageShell>;
  if (!today || challenge.status === 'completed') {
    return (
      <PageShell title="今日行动" showBack>
        <div className="stack-lg today-action-layout">
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
      <div className="stack-lg today-action-layout">
        <section className="hero stack today-task-hero">
          <div className="sprout float" style={{ width: 136, height: 136 }}>
            <CheckCircle2 size={64} />
          </div>
          <p className="label" style={{ color: 'var(--primary)' }}>Day {today.day} · 今日重点</p>
          <h1 className="headline-xl">{today.title}</h1>
          <p className="body">{demoVideo?.focusCopy ?? '先完成一遍完整动作，把注意力重点放在今天这个节点。'}</p>
          <div className="chip-row">
            <span className="chip active">{demoVideo?.durationLabel ?? `${today.estimatedMinutes} 分钟`}</span>
            <span className="chip">点亮「{today.title}」</span>
          </div>
        </section>
        <Card className="practice-video-card tint-mint">
          <div className="row space-between">
            <div>
              <p className="label" style={{ color: 'var(--primary)' }}>来源参考</p>
              <h2 className="headline-md">{demoVideo?.shortTitle ?? challenge.title}</h2>
            </div>
            <span className="chip active"><Clock3 size={14} />{demoVideo?.durationLabel ?? `${today.estimatedMinutes} 分钟`}</span>
          </div>
          {demoVideo ? (
            <video className="practice-video" src={demoVideo.videoUrl} poster={demoVideo.coverUrl} controls playsInline preload="metadata" />
          ) : (
            <div className="practice-video-fallback">
              <PlayCircle size={34} />
              <p className="label">暂无来源参考</p>
            </div>
          )}
          <p className="tiny practice-video-title">{demoVideo ? `参考来源：${demoVideo.title}` : '参考来源会在内容匹配后显示。'}</p>
        </Card>
        <Card className="daily-sequence-card">
          <div className="row space-between">
            <div>
              <p className="label" style={{ color: 'var(--primary)' }}>完整动作</p>
              <h2 className="headline-md">Day 1-Day {challenge.durationDays}</h2>
            </div>
            <span className="chip active">{challenge.progress.completedDays}/{challenge.progress.totalDays}</span>
          </div>
          <p className="body">每天都做一遍这组动作，今天重点完成 Day {today.day}。</p>
          <div className="daily-sequence-list">
            {challenge.days.map((day) => (
              <div className={`daily-sequence-item ${day.day === today.day ? 'active' : ''}`} key={day.day}>
                <span className="daily-sequence-day">D{day.day}</span>
                <div>
                  <p className="label">{day.title}</p>
                  <p className="tiny">{day.microAction}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="today-focus-card">
          <h2 className="headline-md">今日重点任务</h2>
          <p className="body" style={{ marginTop: 8 }}>{today.microAction}</p>
          <p className="body" style={{ marginTop: 8 }}>{today.why}</p>
        </Card>
        <Card className="today-how-card">
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
          <Button variant="ghost" onClick={() => done('tiny')}>{demoVideo?.fallbackText ?? '今天只做了 30 秒'}</Button>
        </div>
      </div>
    </PageShell>
  );
}
