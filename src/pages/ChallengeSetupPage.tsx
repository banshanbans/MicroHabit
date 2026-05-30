import { useMutation } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { api } from '../mocks/api';
import { Button, Card, PageShell, SectionTitle } from '../shared/components';

const times = ['睡前', '午饭后', '下班后', '早起后'];
const places = ['卧室', '办公室', '通勤路上', '书桌前'];
const styles = ['温柔陪伴', '清爽教练', '轻松吐槽', '极简提醒'];

export function ChallengeSetupPage() {
  const { id: graphId = 'graph_sedentary_001' } = useParams();
  const navigate = useNavigate();
  const duration = useFlowStore((s) => s.selectedDuration);
  const setLatestChallenge = useFlowStore((s) => s.setLatestChallenge);
  const defaults = useMemo(() => {
    if (graphId.includes('sleep')) {
      return { time: '睡前', place: '卧室', plan: '我想每天睡前，在卧室提前 15 分钟放下手机。' };
    }
    if (graphId.includes('emotion')) {
      return { time: '下班后', place: '书桌前', plan: '我想每天压力明显的时候，在书桌前做 1 分钟呼吸。' };
    }
    return { time: '午饭后', place: '办公室', plan: '我想每天午饭后，在工位做 2 分钟肩颈舒展。' };
  }, [graphId]);
  const [time, setTime] = useState(defaults.time);
  const [place, setPlace] = useState(defaults.place);
  const [style, setStyle] = useState('温柔陪伴');
  const [plan, setPlan] = useState(defaults.plan);
  const create = useMutation({
    mutationFn: api.createChallenge,
    onSuccess: ({ challengeId }) => {
      setLatestChallenge(challengeId);
      navigate(`/challenge/plan/${challengeId}`);
    },
  });
  const submit = () => create.mutate({ graphId, durationDays: duration, plan: { preferredTime: time, preferredPlace: place, naturalLanguagePlan: plan } });

  return (
    <PageShell title="执行计划" showBack>
      <div className="stack-lg">
        <SectionTitle title="先替明天的你铺好路" body="提前想好时间、地点和可能的阻碍，会让一个微行动更容易真的发生。你可以简单填一下，也可以直接跳过。" />
        <Card className="tint-mint">
          <textarea className="input" rows={4} value={plan} onChange={(event) => setPlan(event.target.value)} placeholder="例如：我想每天午饭后，在工位做 2 分钟肩颈舒展。" />
        </Card>
        <ChipSet title="时间" items={times} value={time} onChange={setTime} />
        <ChipSet title="地点" items={places} value={place} onChange={setPlace} />
        <ChipSet title="提醒风格" items={styles} value={style} onChange={setStyle} />
        <Card className="tint-coral">
          <p className="label">备用方案</p>
          <p className="body">如果今天做不到 2 分钟，就做 30 秒，也算完成。</p>
        </Card>
        <Button onClick={submit}><Sparkles size={18} />帮我安排好</Button>
        <Button variant="ghost" onClick={submit}>先轻松开始</Button>
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
