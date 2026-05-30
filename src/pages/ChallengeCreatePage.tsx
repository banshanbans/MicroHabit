import { CalendarDays, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { Button, Card, PageShell, SectionTitle } from '../shared/components';
import { ChallengeDuration } from '../shared/types';

const options: { days: ChallengeDuration; title: string; desc: string }[] = [
  { days: 7, title: '7 天', desc: '轻量启动，第一次推荐' },
  { days: 15, title: '15 天', desc: '稳定练习' },
  { days: 21, title: '21 天', desc: '习惯养成' },
];

export function ChallengeCreatePage() {
  const { graphId = 'graph_sedentary_001' } = useParams();
  const navigate = useNavigate();
  const duration = useFlowStore((s) => s.selectedDuration);
  const setDuration = useFlowStore((s) => s.setDuration);
  return (
    <PageShell title="挑战周期" showBack>
      <div className="stack-lg">
        <SectionTitle title="你想用多久点亮这个习惯？" body="第一次建议从 7 天开始，先建立一个不费力的开始。" />
        <div className="stack">
          {options.map((option) => (
            <button key={option.days} className={`card scenario-card ${duration === option.days ? 'tint-mint' : ''}`} onClick={() => setDuration(option.days)}>
              <div className="row space-between">
                <div className="row">
                  <span className={`dot ${duration === option.days ? 'done' : ''}`}><CalendarDays size={16} /></span>
                  <span><strong>{option.title}</strong><p className="tiny">{option.desc}</p></span>
                </div>
                {duration === option.days ? <span className="chip active">已选择</span> : null}
              </div>
            </button>
          ))}
        </div>
        <Button onClick={() => navigate(`/challenge/setup/${graphId}`)}>
          <Sparkles size={18} />
          生成我的挑战
        </Button>
      </div>
    </PageShell>
  );
}
