import { useMutation, useQuery } from '@tanstack/react-query';
import { Bot, Brain, Flower2, Leaf, Lock, Medal, Palette, Shirt, Sparkles, Sprout, Volume2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../mocks/api';
import { Button, Card, PageShell, ProgressBar } from '../shared/components';
import { ProfileBadge, ProfileSummary } from '../shared/types';

const fallbackProfile: ProfileSummary = {
  companion: {
    name: '小芽',
    level: 1,
    levelLabel: 'Lv.1 发光小芽',
    totalPoints: 0,
    weeklyPoints: 0,
    weeklyTarget: 180,
    nextLevelPoints: 100,
    pointsToNextLevel: 100,
  },
  todayGoal: {
    state: 'empty',
    dayLabel: '轻轻开始就好',
    body: '还没有今日行动。先选择一个健康视频，让 AI 帮你生成第一条微习惯路径。',
    actionLabel: '创建我的挑战',
    route: '/',
  },
  stats: {
    streakDays: 0,
    favoriteExecutionTime: '暂未形成固定时间',
    completionRate: 0,
    weeklyLitNodes: 0,
  },
  wallet: { balance: 0, currentPoints: 0, transactions: [] },
  buddy: {
    active: null,
    inventory: [],
    collection: [],
    seedlings: [],
    drawCost: 60,
  },
  garden: {
    collectionCount: 0,
    inventoryCount: 0,
    drawCost: 60,
  },
  badges: {
    earned: [],
    upcoming: [
      { id: 'starter', title: '微习惯启动者', condition: '开启第一条微行动路径', tone: 'mint' },
      { id: 'weekly', title: '稳定点亮者', condition: '本周收集 180 点微光', tone: 'blue' },
    ],
  },
  unlockables: [
    { id: 'voice', title: '温柔陪伴语气', requiredPoints: 30, unlocked: false },
    { id: 'skin', title: '夜光小芽皮肤', requiredPoints: 100, unlocked: false },
    { id: 'theme', title: '星光健康图谱主题', requiredPoints: 180, unlocked: false },
  ],
  litNodes: [],
  insight: { title: 'AI 发现', body: '第一次建议选择 7 天路径，把动作控制在 1-2 分钟内。' },
};

export function ProfilePage() {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [companionText, setCompanionText] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: api.getProfile });
  const profile = data ?? fallbackProfile;
  const speak = useMutation({
    mutationFn: () => api.speakCompanion({ intent: 'daily_goal' }),
    onMutate: () => {
      setVoiceError('');
      setCompanionText('');
      audioRef.current?.pause();
    },
    onSuccess: async ({ blob, text }) => {
      setCompanionText(text);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    },
    onError: (error) => {
      const detail = (error as { detail?: { message?: string; text?: string } }).detail;
      setVoiceError(detail?.message ?? '语音暂时不可用');
      setCompanionText(detail?.text ?? profile.todayGoal.body);
    },
  });

  return (
    <PageShell title="微光">
      <div className="profile-center stack-lg">
        <div className="profile-left-panel stack">
          <Card className="companion-card">
            <button
              type="button"
              className={`companion-orbit companion-button ${speak.isPending ? 'speaking' : ''}`}
              aria-label="播放小芽鼓励"
              onClick={() => speak.mutate()}
            >
              <div className="sprout companion-sprout float">
                <Sprout size={64} fill="currentColor" />
              </div>
              <span className="voice-chip"><Volume2 size={14} />点击听小芽</span>
            </button>
            <div className="stack" style={{ gap: 12 }}>
              <div className="row space-between">
                <div>
                  <p className="label" style={{ color: 'var(--primary)' }}>微光伙伴</p>
                  <h1 className="headline-xl">{profile.companion.name}</h1>
                </div>
                <span className="level-pill"><Sparkles size={14} />{profile.companion.levelLabel}</span>
              </div>
              <p className="body">你每完成一个微行动，小芽都会多一点微光。</p>
              {profile.buddy.active ? (
                <div className="buddy-growth-panel">
                  <div className="row space-between">
                    <span className="label">{profile.buddy.active.emoji} {profile.buddy.active.name}</span>
                    <span className="chip active">{profile.buddy.active.stageLabel}</span>
                  </div>
                  <ProgressBar value={profile.buddy.active.completedCheckins} total={profile.buddy.active.targetCheckins} />
                  <p className="tiny">{profile.buddy.active.message}</p>
                </div>
              ) : (
                <div className="buddy-growth-panel">
                  <p className="label">等待种下新的小芽</p>
                  <p className="tiny">完成一次今日行动，或去苗圃选择下一轮陪伴。</p>
                </div>
              )}
              {companionText ? <p className="companion-bubble">{companionText}</p> : null}
              {voiceError ? <p className="tiny" style={{ color: 'var(--coral-deep)' }}>{voiceError}</p> : null}
              <div className="energy-panel">
                <div className="row space-between">
                  <span className="label">本周微光能量</span>
                  <span className="label" style={{ color: 'var(--primary)' }}>
                    {profile.companion.weeklyPoints} / {profile.companion.weeklyTarget}
                  </span>
                </div>
                <ProgressBar value={profile.companion.weeklyPoints} total={profile.companion.weeklyTarget} />
                <p className="tiny">
                  {profile.companion.pointsToNextLevel > 0
                    ? `再收集 ${profile.companion.pointsToNextLevel} 点微光，小芽就能升级`
                    : '小芽已经准备好进入下一阶段'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="today-goal-card">
            <div className="row space-between">
              <div className="row">
                <span className="soft-icon mint"><Sparkles size={18} /></span>
                <h2 className="headline-md">今日小目标</h2>
              </div>
              <span className="tiny">{isLoading ? '同步中' : profile.todayGoal.dayLabel}</span>
            </div>
            <p className="body">{isLoading ? '正在同步你的今日行动...' : profile.todayGoal.body}</p>
            <Button onClick={() => navigate(profile.todayGoal.route)}>{profile.todayGoal.actionLabel}</Button>
          </Card>

          <Card className="points-card">
            <div className="row space-between">
              <div>
                <p className="label" style={{ color: 'var(--primary)' }}>微光积分</p>
                <p className="points-number">{profile.companion.totalPoints}</p>
              </div>
              <span className="soft-icon coral"><Sparkles size={22} /></span>
            </div>
            <p className="body">可用于解锁陪伴风格、角色皮肤和图谱主题。</p>
            <div className="unlock-grid">
              {profile.unlockables.map((item) => {
                const Icon = unlockIcon(item.id);
                return (
                  <div className={`unlock-item ${item.unlocked ? 'unlocked' : ''}`} key={item.id}>
                    <Icon size={18} />
                    <span>{item.title}</span>
                    <span className="tiny">{item.unlocked ? '已解锁' : `${item.requiredPoints} 分`}</span>
                  </div>
                );
              })}
            </div>
            <div className="profile-action-row">
              <Button variant="secondary" onClick={() => navigate('/nursery')}><Sprout size={17} />去苗圃</Button>
              <Button variant="ghost" onClick={() => navigate('/garden')}><Flower2 size={17} />看花园</Button>
            </div>
          </Card>
        </div>

        <div className="profile-right-panel stack">
          <section className="profile-stats-grid">
            <Card className="stat-card">
              <p className="label">连续打卡</p>
              <strong>{profile.stats.streakDays} 天</strong>
            </Card>
            <Card className="stat-card">
              <p className="label">常用时间</p>
              <strong>{profile.stats.favoriteExecutionTime}</strong>
            </Card>
            <Card className="stat-card">
              <p className="label">完成率</p>
              <strong>{Math.round(profile.stats.completionRate * 100)}%</strong>
            </Card>
            <Card className="stat-card">
              <p className="label">本周点亮</p>
              <strong>{profile.stats.weeklyLitNodes} 个</strong>
            </Card>
          </section>

          <section className="stack">
            <div>
              <p className="label" style={{ color: 'var(--coral-deep)' }}>下一束光</p>
              <h2 className="headline-md">即将解锁</h2>
            </div>
            <div className="profile-card-grid">
              {profile.badges.upcoming.map((badge) => <LockedBadge badge={badge} key={badge.id} />)}
            </div>
          </section>

          <section className="stack">
            <div>
              <p className="label" style={{ color: 'var(--primary)' }}>收集中的微光</p>
              <h2 className="headline-md">已获得微光</h2>
            </div>
            {profile.badges.earned.length > 0 ? (
              <div className="profile-card-grid">
                {profile.badges.earned.map((badge) => <BadgeCard badge={badge} key={badge.id} />)}
              </div>
            ) : (
              <Card>
                <p className="body">完成挑战后会获得第一枚徽章。</p>
              </Card>
            )}
          </section>

          <Card className="garden-summary-card">
            <div className="row space-between">
              <div className="row">
                <span className="soft-icon mint"><Flower2 size={18} /></span>
                <h2 className="headline-md">微光花园</h2>
              </div>
              <span className="chip active">{profile.garden.collectionCount} 位伙伴</span>
            </div>
            <p className="body">已经成熟的伙伴会留在这里，记录你每一轮微习惯成长。</p>
            <div className="node-chip-row">
              <span className="node-chip mint">库存 {profile.garden.inventoryCount}</span>
              <span className="node-chip blue">苗圃 {profile.garden.drawCost} 微光/次</span>
            </div>
          </Card>

          <Card>
            <div className="row">
              <span className="soft-icon mint"><Medal size={18} /></span>
              <h2 className="headline-md">已点亮健康节点</h2>
            </div>
            {profile.litNodes.length > 0 ? (
              <div className="node-chip-row">
                {profile.litNodes.map((node) => (
                  <span className={`node-chip ${node.tone}`} key={node.id}>{node.title}</span>
                ))}
              </div>
            ) : (
              <p className="body" style={{ marginTop: 12 }}>完成一次今日行动后，点亮的节点会出现在这里。</p>
            )}
          </Card>

          <Card className="insight-card">
            <div className="row">
              <span className="soft-icon blue"><Brain size={19} /></span>
              <h2 className="headline-md">{profile.insight.title}</h2>
            </div>
            <p className="body">{profile.insight.body}</p>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function BadgeCard({ badge }: { badge: ProfileBadge }) {
  return (
    <Card className={`badge-card badge-${badge.tone}`}>
      <span className={`soft-icon ${badge.tone}`}><Leaf size={19} /></span>
      <div>
        <h3 className="label">{badge.title}</h3>
        <p className="tiny">{badge.condition}</p>
      </div>
    </Card>
  );
}

function LockedBadge({ badge }: { badge: ProfileBadge }) {
  return (
    <Card className="locked-badge-card">
      <span className="soft-icon locked"><Sparkles size={19} /></span>
      <div>
        <h3 className="label">{badge.title}</h3>
        <p className="tiny">{badge.condition}</p>
      </div>
      <Lock size={16} color="var(--muted)" />
    </Card>
  );
}

function unlockIcon(id: string) {
  if (id === 'voice') return Bot;
  if (id === 'skin') return Shirt;
  if (id === 'theme') return Palette;
  return Sparkles;
}
