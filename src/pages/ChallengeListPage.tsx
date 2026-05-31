import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, Home, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../mocks/api';
import { Button, Card, PageShell, ProgressBar, SectionTitle } from '../shared/components';
import { Challenge } from '../shared/types';

export function ChallengeListPage() {
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ['challenges'], queryFn: api.listChallenges });
  const activeChallenges = data.filter((challenge) => challenge.status === 'active' || challenge.status === 'paused');
  const savedChallenges = data.filter((challenge) => challenge.status === 'saved' || challenge.status === 'draft');
  const completedChallenges = data.filter((challenge) => challenge.status === 'completed');
  return (
    <PageShell title="我的挑战">
      <div className="stack-lg challenge-list-layout">
        <SectionTitle title="我的健康图谱" body="正在进行、已保存和已完成的微行动路径都会在这里汇合。" />
        <ChallengeSection
          title="正在进行"
          challenges={activeChallenges}
          empty={
            <EmptyCard
              title="还没有进行中的挑战"
              body="从首页选择一个健康视频，生成图谱后就可以开始第一条微行动路径。"
              action={<Button onClick={() => navigate('/')}><Home size={18} />回到首页</Button>}
            />
          }
          renderChallenge={(challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              icon={<Network size={16} />}
              onClick={() => navigate(`/challenge/${challenge.id}/today`)}
              footer={<ActiveFooter challenge={challenge} />}
            />
          )}
        />
        <ChallengeSection
          title="已保存"
          challenges={savedChallenges}
          empty={<EmptyCard title="暂无保存的挑战" body="保存后的挑战会在这里等待你选择开始时间。" />}
          renderChallenge={(challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              icon={<CalendarDays size={16} />}
              onClick={() => navigate(`/challenge/plan/${challenge.id}`)}
              footer={<SavedFooter challenge={challenge} />}
            />
          )}
        />
        <ChallengeSection
          title="已完成"
          challenges={completedChallenges}
          empty={<EmptyCard title="暂无已完成挑战" body="完成挑战后，徽章、积分和复盘入口会出现在这里。" tone="coral" />}
          renderChallenge={(challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              icon={<Network size={16} />}
              onClick={() => navigate(`/report/${challenge.id}`)}
              footer={<CompletedFooter challenge={challenge} />}
              tone="coral"
            />
          )}
        />
      </div>
    </PageShell>
  );
}

function ChallengeSection({
  title,
  challenges,
  empty,
  renderChallenge,
}: {
  title: string;
  challenges: Challenge[];
  empty: React.ReactNode;
  renderChallenge: (challenge: Challenge) => React.ReactNode;
}) {
  return (
    <section className="stack">
      <h2 className="headline-md">{title}</h2>
      {challenges.length > 0 ? challenges.map(renderChallenge) : empty}
    </section>
  );
}

function ChallengeCard({
  challenge,
  icon,
  footer,
  onClick,
  tone = '',
}: {
  challenge: Challenge;
  icon: React.ReactNode;
  footer: React.ReactNode;
  onClick: () => void;
  tone?: 'coral' | '';
}) {
  return (
    <button className={`card scenario-card ${tone === 'coral' ? 'tint-coral' : ''}`} onClick={onClick}>
      <div className="stack">
        <div className="row space-between">
          <div className="row">
            <span className={`dot ${challenge.status === 'completed' ? 'done' : 'active'}`}>{icon}</span>
            <span>
              <strong>{challenge.title}</strong>
              <p className="tiny">来源：{formatVideoSource(challenge.videoId)}</p>
            </span>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </div>
        <ProgressBar value={challenge.progress.completedDays} total={challenge.progress.totalDays} />
        {footer}
      </div>
    </button>
  );
}

function ActiveFooter({ challenge }: { challenge: Challenge }) {
  const today = challenge.days.find((day) => day.status === 'today') ?? challenge.days.find((day) => day.day === challenge.currentDay) ?? challenge.days[0];
  return (
    <div className="row space-between">
      <span className="tiny">Day {challenge.currentDay} / {challenge.durationDays}</span>
      <span className="chip active">今日：{today.title}</span>
    </div>
  );
}

function SavedFooter({ challenge }: { challenge: Challenge }) {
  const time = challenge.plan.preferredTime ?? '未设置时间';
  const place = challenge.plan.preferredPlace ?? '未设置地点';
  return (
    <div className="row space-between">
      <span className="tiny">{challenge.durationDays} 天路径</span>
      <span className="chip active">{time} · {place}</span>
    </div>
  );
}

function CompletedFooter({ challenge }: { challenge: Challenge }) {
  const completedAt = challenge.completedAt ? new Date(challenge.completedAt).toLocaleDateString('zh-CN') : '已完成';
  return (
    <div className="row space-between">
      <span className="tiny">{completedAt}</span>
      <span className="chip active">查看复盘</span>
    </div>
  );
}

function EmptyCard({
  title,
  body,
  action,
  tone = '',
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
  tone?: 'coral' | '';
}) {
  return (
    <Card className={tone === 'coral' ? 'tint-coral' : ''}>
      <div className="stack">
        <h3 className="headline-md">{title}</h3>
        <p className="body">{body}</p>
        {action}
      </div>
    </Card>
  );
}

function formatVideoSource(videoId: string) {
  const source = videoId.replace('video_', '').replace('_001', '');
  if (source === 'meditation') return '冥想训练';
  if (source === 'stretch' || source === 'sedentary') return '拉伸';
  if (source === 'eye_yoga') return '眼部瑜伽';
  if (source === 'emotion') return '冥想训练';
  if (source === 'sleep') return '睡眠修复';
  return source;
}
