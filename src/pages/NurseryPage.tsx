import { useMutation, useQuery } from '@tanstack/react-query';
import { Lock, Sparkles, Sprout } from 'lucide-react';
import { api } from '../mocks/api';
import { queryClient } from '../app/queryClient';
import { Button, Card, PageShell } from '../shared/components';

export function NurseryPage() {
  const { data: wallet } = useQuery({ queryKey: ['wallet'], queryFn: api.getWallet });
  const { data: buddies } = useQuery({ queryKey: ['buddies'], queryFn: api.getBuddies });
  const draw = useMutation({
    mutationFn: api.drawSeedling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
  const plant = useMutation({
    mutationFn: api.plantSeedling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
  const drawCost = buddies?.drawCost ?? 60;
  const canDraw = (wallet?.balance ?? 0) >= drawCost;

  return (
    <PageShell title="微光苗圃" showBack>
      <div className="stack-lg nursery-page">
        <Card className="nursery-hero-card">
          <div className="row space-between">
            <div>
              <p className="label" style={{ color: 'var(--primary)' }}>下一轮陪伴</p>
              <h1 className="headline-xl">种下一颗刚刚好的小芽</h1>
            </div>
            <span className="soft-icon mint"><Sprout size={22} /></span>
          </div>
          <p className="body">用微光换一颗新种子，再把它陪进下一轮健康微行动。</p>
          <div className="nursery-wallet">
            <span><Sparkles size={16} />当前 {wallet?.balance ?? 0} 微光</span>
            <span>苗圃一次 {drawCost}</span>
          </div>
          <Button disabled={!canDraw || draw.isPending} onClick={() => draw.mutate()}>{draw.isPending ? '正在发芽...' : '获得一颗小芽'}</Button>
          {!canDraw ? <p className="tiny">再完成几次微行动，就能来苗圃选择新的陪伴。</p> : null}
          {draw.data ? <p className="companion-bubble">{String((draw.data as { message?: string }).message ?? '新的小芽已经进苗圃了。')}</p> : null}
        </Card>

        {buddies?.active ? (
          <Card>
            <div className="row">
              <span className="soft-icon blue">{buddies.active.emoji}</span>
              <div>
                <p className="label">当前已有成长中的伙伴</p>
                <h2 className="headline-md">{buddies.active.name}</h2>
              </div>
            </div>
            <p className="body" style={{ marginTop: 10 }}>先陪它完成这一轮，再种下新的小芽。</p>
          </Card>
        ) : null}

        <section className="stack">
          <h2 className="headline-md">我的小芽</h2>
          {buddies && buddies.inventory.length > 0 ? (
            <div className="nursery-grid">
              {buddies.inventory.map((item) => (
                <Card className={`seedling-card rarity-${item.seedling.rarity}`} key={item.seedling.id}>
                  <div className="row space-between">
                    <span className="buddy-emoji">{item.seedling.emoji}</span>
                    <span className="chip">x{item.quantity}</span>
                  </div>
                  <h3 className="headline-md">{item.seedling.name}</h3>
                  <p className="tiny">{item.seedling.description}</p>
                  <Button
                    variant="secondary"
                    disabled={Boolean(buddies.active) || plant.isPending}
                    onClick={() => plant.mutate({ seedlingId: item.seedling.id })}
                  >
                    {buddies.active ? <Lock size={16} /> : <Sprout size={16} />}种下
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="empty-soft-card">
              <p className="body">苗圃里还没有待种下的小芽。获得一颗后，它会出现在这里。</p>
            </Card>
          )}
        </section>
      </div>
    </PageShell>
  );
}
