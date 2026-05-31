import { useMutation } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { queryClient } from '../app/queryClient';
import { api } from '../mocks/api';
import { Button, Card, PageShell, SectionTitle } from '../shared/components';

const times = ['午饭后', '下午', '下班后', '睡前', '早起后'];
const places = ['卧室', '办公室', '通勤路上', '书桌前'];
const styles = ['温柔陪伴', '清爽教练', '轻松吐槽', '极简提醒'];

export function ChallengeSetupPage() {
  const { id: graphId = 'graph_stretch_001' } = useParams();
  const navigate = useNavigate();
  const duration = useFlowStore((s) => s.selectedDuration);
  const setLatestChallenge = useFlowStore((s) => s.setLatestChallenge);
  const defaults = useMemo(() => {
    if (graphId.includes('meditation') || graphId.includes('emotion')) {
      return { time: '午饭后', place: '书桌前', plan: '我想每天午饭后，在书桌前做 1 分钟呼吸觉察。' };
    }
    if (graphId.includes('eye')) {
      return { time: '下午', place: '书桌前', plan: '我想每天看屏幕后，在书桌前做 1 分钟眼周放松。' };
    }
    return { time: '下班后', place: '卧室', plan: '我想每天下班后，在卧室做 2 分钟轻拉伸。' };
  }, [graphId]);
  const [time, setTime] = useState(defaults.time);
  const [place, setPlace] = useState(defaults.place);
  const [style, setStyle] = useState('温柔陪伴');
  const [plan, setPlan] = useState(defaults.plan);
  const create = useMutation({
    mutationFn: api.createChallenge,
    onSuccess: ({ challengeId }) => {
      setLatestChallenge(challengeId);
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      navigate(`/challenge/plan/${challengeId}`);
    },
  });
  const submit = (status: 'active' | 'saved' = 'active') =>
    create.mutate({ graphId, durationDays: duration, plan: { preferredTime: time, preferredPlace: place, naturalLanguagePlan: plan }, status });

  return (
    <PageShell title="执行计划" showBack>
      <div className="stack-lg setup-layout">
        <SectionTitle title="先替明天的你铺好路" body="提前想好时间、地点和可能的阻碍，会让一个微行动更容易真的发生。你可以简单填一下，也可以直接跳过。" />
        <Card className="tint-mint">
          <textarea className="input" rows={4} value={plan} onChange={(event) => setPlan(event.target.value)} placeholder="例如：我想每天下班后，在卧室做 2 分钟轻拉伸。" />
        </Card>
        <ChipSet title="时间" items={times} value={time} onChange={setTime} />
        <ChipSet title="地点" items={places} value={place} onChange={setPlace} />
        <ChipSet title="提醒风格" items={styles} value={style} onChange={setStyle} />
        <Card className="tint-coral">
          <p className="label">备用方案</p>
          <p className="body">如果今天做不到 2 分钟，就做 30 秒，也算完成。</p>
        </Card>
        <Button onClick={() => submit('active')}><Sparkles size={18} />帮我安排好</Button>
        <Button variant="secondary" onClick={() => submit('active')}>先轻松开始</Button>
        <Button variant="ghost" onClick={() => submit('saved')}>保存稍后开始</Button>
      </div>
    </PageShell>
  );
}

function ChipSet({ title, items, value, onChange }: { title: string; items: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <section className="stack" style={{ gap: 10 }}>
      <h3 className="label">{title}</h3>
      <div className="chip-row">
        {items.map((item) => (
          <button className={`chip ${value === item ? 'active' : ''}`} key={item} onClick={() => onChange(item)}>{item}</button>
        ))}
      </div>
    </section>
  );
}
