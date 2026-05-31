import { useQuery } from '@tanstack/react-query';
import { Flower2, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../mocks/api';
import { Button, Card, PageShell, ProgressBar } from '../shared/components';

export function GardenPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['buddies'], queryFn: api.getBuddies });

  return (
    <PageShell title="微光花园" showBack>
      <div className="stack-lg garden-page">
        <Card className="garden-hero-card">
          <div className="row space-between">
            <div>
              <p className="label" style={{ color: 'var(--primary)' }}>成长收藏</p>
              <h1 className="headline-xl">你的健康习惯正在开花</h1>
            </div>
            <span className="soft-icon mint"><Flower2 size={22} /></span>
          </div>
          <p className="body">每一位成熟伙伴，都来自你认真完成过的一轮微行动。</p>
        </Card>

        {data?.active ? (
          <Card className="buddy-growth-panel">
            <div className="row space-between">
              <div>
                <p className="label">成长中</p>
                <h2 className="headline-md">{data.active.emoji} {data.active.name}</h2>
              </div>
              <span className="chip active">{data.active.stageLabel}</span>
            </div>
            <ProgressBar value={data.active.completedCheckins} total={data.active.targetCheckins} />
            <p className="tiny">{data.active.message}</p>
          </Card>
        ) : null}

        <section className="stack">
          <div className="row space-between">
            <h2 className="headline-md">已成熟伙伴</h2>
            <span className="chip">{data?.collection.length ?? 0} 位</span>
          </div>
          {isLoading ? <p className="body">正在同步花园...</p> : null}
          {data && data.collection.length > 0 ? (
            <div className="garden-grid">
              {data.collection.map((buddy) => (
                <Card className={`garden-buddy-card rarity-${buddy.rarity}`} key={buddy.id}>
                  <span className="buddy-emoji">{buddy.emoji}</span>
                  <h3 className="label">{buddy.name}</h3>
                  <p className="tiny">{buddy.description}</p>
                  <span className="chip">{rarityLabel(buddy.rarity)}</span>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="empty-soft-card">
              <p className="body">花园还在等待第一位成熟伙伴。先完成几次今日行动，小芽会慢慢长出来。</p>
              <Button variant="secondary" onClick={() => navigate('/challenges')}><Sprout size={17} />继续挑战</Button>
            </Card>
          )}
        </section>
      </div>
    </PageShell>
  );
}

function rarityLabel(rarity: string) {
  if (rarity === 'epic') return '星光';
  if (rarity === 'rare') return '稀有';
  return '普通';
}
