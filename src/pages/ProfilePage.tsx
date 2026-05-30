import { Bot, Brain, Eye, Leaf, Lock, Medal, Moon, Palette, Shirt, Sparkles, Sprout, StretchHorizontal, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { Button, Card, PageShell, ProgressBar } from '../shared/components';

const earnedBadges = [
  {
    title: '肩颈松弛练习生',
    condition: '完成 7 天久坐舒展挑战后获得',
    icon: StretchHorizontal,
    tone: 'mint',
  },
  {
    title: '微习惯启动者',
    condition: '开启第一条 7 天微行动路径',
    icon: Leaf,
    tone: 'coral',
  },
  {
    title: '呼吸找回者',
    condition: '完成一次呼吸调节微行动',
    icon: Wind,
    tone: 'blue',
  },
];

const upcomingBadges = [
  {
    title: '护眼观察员',
    condition: '还差 1 次眼部休息',
    icon: Eye,
  },
  {
    title: '睡前降噪者',
    condition: '完成 7 天睡眠修复后获得',
    icon: Moon,
  },
];

const unlockables = [
  { title: '温柔陪伴语气', icon: Bot },
  { title: '夜光小芽皮肤', icon: Shirt },
  { title: '星光睡眠图谱主题', icon: Palette },
];

const litNodes = [
  { title: '久坐风险', tone: 'blue' },
  { title: '颈部拉伸', tone: 'mint' },
  { title: '肩背放松', tone: 'coral' },
  { title: '呼吸调节', tone: 'blue' },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const latestChallengeId = useFlowStore((state) => state.latestChallengeId);
  const todayChallengeId = latestChallengeId || 'challenge_sedentary_7d_001';

  return (
    <PageShell title="微章">
      <div className="profile-center stack-lg">
        <Card className="companion-card">
          <div className="companion-orbit">
            <div className="sprout companion-sprout float">
              <Sprout size={64} fill="currentColor" />
            </div>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            <div className="row space-between">
              <div>
                <p className="label" style={{ color: 'var(--primary)' }}>微光伙伴</p>
                <h1 className="headline-xl">小芽</h1>
              </div>
              <span className="level-pill"><Sparkles size={14} />Lv.2 发光小芽</span>
            </div>
            <p className="body">你每完成一个微行动，小芽都会多一点微光。</p>
            <div className="energy-panel">
              <div className="row space-between">
                <span className="label">本周微光能量</span>
                <span className="label" style={{ color: 'var(--primary)' }}>120 / 180</span>
              </div>
              <ProgressBar value={120} total={180} />
              <p className="tiny">再点亮 2 个节点，小芽就能升级</p>
            </div>
          </div>
        </Card>

        <Card className="today-goal-card">
          <div className="row space-between">
            <div className="row">
              <span className="soft-icon mint"><Sparkles size={18} /></span>
              <h2 className="headline-md">今日小目标</h2>
            </div>
            <span className="tiny">轻轻完成就好</span>
          </div>
          <p className="body">再做 30 秒肩颈舒展，点亮「肩背放松」。</p>
          <Button onClick={() => navigate(`/challenge/${todayChallengeId}/today`)}>去完成今日行动</Button>
        </Card>

        <section className="stack">
          <div>
            <p className="label" style={{ color: 'var(--primary)' }}>收集中的微光</p>
            <h2 className="headline-md">已获得徽章</h2>
          </div>
          <div className="badge-grid">
            {earnedBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <Card className={`badge-card badge-${badge.tone}`} key={badge.title}>
                  <span className={`soft-icon ${badge.tone}`}><Icon size={19} /></span>
                  <div>
                    <h3 className="label">{badge.title}</h3>
                    <p className="tiny">{badge.condition}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="stack">
          <div>
            <p className="label" style={{ color: 'var(--coral-deep)' }}>下一束光</p>
            <h2 className="headline-md">即将解锁</h2>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {upcomingBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <Card className="locked-badge-card" key={badge.title}>
                  <span className="soft-icon locked"><Icon size={19} /></span>
                  <div>
                    <h3 className="label">{badge.title}</h3>
                    <p className="tiny">{badge.condition}</p>
                  </div>
                  <Lock size={16} color="var(--muted)" />
                </Card>
              );
            })}
          </div>
        </section>

        <Card className="points-card">
          <div className="row space-between">
            <div>
              <p className="label" style={{ color: 'var(--primary)' }}>微光积分</p>
              <p className="points-number">120</p>
            </div>
            <span className="soft-icon coral"><Sparkles size={22} /></span>
          </div>
          <p className="body">可用于解锁陪伴风格、角色皮肤和图谱主题。</p>
          <div className="unlock-grid">
            {unlockables.map((item) => {
              const Icon = item.icon;
              return (
                <div className="unlock-item" key={item.title}>
                  <Icon size={18} />
                  <span>{item.title}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="row">
            <span className="soft-icon mint"><Medal size={18} /></span>
            <h2 className="headline-md">已点亮健康节点</h2>
          </div>
          <div className="node-chip-row">
            {litNodes.map((node) => (
              <span className={`node-chip ${node.tone}`} key={node.title}>{node.title}</span>
            ))}
          </div>
        </Card>

        <Card className="insight-card">
          <div className="row">
            <span className="soft-icon blue"><Brain size={19} /></span>
            <h2 className="headline-md">AI 发现</h2>
          </div>
          <p className="body">你更容易在午饭后完成低门槛行动。下一轮建议继续选择 1-2 分钟的微习惯挑战。</p>
        </Card>
      </div>
    </PageShell>
  );
}
