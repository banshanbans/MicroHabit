import { useMutation } from '@tanstack/react-query';
import { Activity, Bed, Link as LinkIcon, PlayCircle, Sparkles, Sprout } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { api } from '../mocks/api';
import { Button, Card, PageShell } from '../shared/components';
import { VideoScenario } from '../shared/types';

const scenarios: { id: VideoScenario; title: string; desc: string; icon: typeof Activity; tint: string }[] = [
  { id: 'sedentary', title: '久坐舒展', desc: '推荐主 Demo', icon: Activity, tint: 'tint-coral' },
  { id: 'sleep', title: '睡眠修复', desc: '睡前放下手机', icon: Bed, tint: '' },
  { id: 'emotion', title: '情绪放松', desc: '60 秒呼吸锚点', icon: Sprout, tint: 'tint-mint' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const setScenario = useFlowStore((s) => s.setScenario);
  const parse = useMutation({
    mutationFn: api.parseVideo,
    onSuccess: (video) => {
      setScenario(video.scenario);
      navigate(`/analyzing/${video.id}`);
    },
  });

  const start = (scenario?: VideoScenario) => parse.mutate({ url, scenario });

  return (
    <PageShell>
      <div className="stack-lg">
        <section className="hero stack">
          <div className="sprout float">
            <Sprout size={34} fill="currentColor" />
          </div>
          <h1 className="headline-xl">把健康视频，<br />变成 7 天<br />微习惯挑战</h1>
          <p className="body">粘贴一条健康视频链接，AI 会帮你提取微行动、生成健康图谱，并陪你一点点点亮。</p>
        </section>

        <Card className="tint-mint">
          <div className="stack">
            <div className="row">
              <LinkIcon size={19} color="var(--primary)" />
              <input
                className="input"
                placeholder="粘贴抖音健康视频链接"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </div>
            <Button onClick={() => start()}>
              <Sparkles size={18} />
              开始解析
            </Button>
            <Button variant="ghost" onClick={() => start('sedentary')}>
              <PlayCircle size={17} />
              试试看 Demo 视频
            </Button>
          </div>
        </Card>

        <section className="stack">
          <div className="row">
            <Sparkles size={18} color="var(--primary)" />
            <h2 className="headline-md">探索微行动</h2>
          </div>
          <div className="scenario-grid">
            {scenarios.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} className={`card scenario-card ${item.tint}`} onClick={() => start(item.id)}>
                  <div className="row space-between">
                    <div className="row">
                      <span className="sprout" style={{ width: 48, height: 48 }}>
                        <Icon size={24} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <p className="tiny">{item.desc}</p>
                      </span>
                    </div>
                    <PlayCircle size={20} color="var(--primary)" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
