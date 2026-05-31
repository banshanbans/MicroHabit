import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Brain, Eye, Link2, PlayCircle, Search, Sparkles, Sprout, StretchHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { api } from '../mocks/api';
import { Button, Card, PageShell } from '../shared/components';
import { demoVideoList, matchDemoVideo } from '../shared/demoVideos';
import { VideoScenario } from '../shared/types';

const scenarios: { id: VideoScenario; title: string; desc: string; icon: typeof Brain; tint: string; cover: string }[] = [
  { id: 'meditation', title: '冥想训练', desc: '5-10 分钟平复焦虑，找回专注', icon: Brain, tint: 'tint-mint', cover: '/seed-covers/meditation.jpg' },
  { id: 'stretch', title: '拉伸', desc: '每天 2 分钟，让身体从久坐里松开', icon: StretchHorizontal, tint: 'tint-coral', cover: '/seed-covers/stretch.jpg' },
  { id: 'eye_yoga', title: '眼部瑜伽', desc: '1 分钟眼周放松，缓解屏幕疲劳', icon: Eye, tint: '', cover: '/seed-covers/eye-yoga.jpg' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [shareText, setShareText] = useState('');
  const [matchFailed, setMatchFailed] = useState(false);
  const setScenario = useFlowStore((s) => s.setScenario);
  const parse = useMutation({
    mutationFn: api.parseVideo,
    onSuccess: (video) => {
      setScenario(video.scenario);
      navigate(`/analyzing/${video.id}`);
    },
  });

  const start = (scenario?: VideoScenario, url?: string) => {
    setMatchFailed(false);
    parse.mutate({ scenario, url });
  };
  const parseError = parse.error instanceof Error ? parse.error.message : '';
  const submitShareText = () => {
    const { video, extractedUrl } = matchDemoVideo(shareText);
    if (!video) {
      setMatchFailed(true);
      return;
    }
    start(video.scenario, extractedUrl || shareText.trim());
  };

  return (
    <PageShell>
      <div className="stack-lg home-layout">
        <section className="hero stack">
          <div className="sprout float">
            <Sprout size={34} fill="currentColor" />
          </div>
          <h1 className="headline-xl">把健康视频，<br />变成 7 天<br />微习惯挑战</h1>
          <p className="body">粘贴抖音分享文案或链接，AI 会提取微行动、生成健康图谱，并陪你一点点点亮。</p>
        </section>

        <Card className="tint-mint">
          <div className="stack">
            <div className="upload-drop">
              <span className="upload-icon">
                <Link2 size={24} />
              </span>
              <div>
                <p className="label">粘贴抖音分享文案</p>
                <p className="tiny">支持从大段文字中自动提取链接。</p>
              </div>
            </div>
            <textarea
              className="input"
              rows={5}
              value={shareText}
              onChange={(event) => {
                setShareText(event.target.value);
                setMatchFailed(false);
              }}
              placeholder="例如：复制抖音分享文案，包含标题、描述和链接都可以。"
            />
            {matchFailed ? (
              <div className="inline-alert">
                <AlertCircle size={16} />
                <span>暂时没识别出对应视频，可以从下方选择一个演示视频继续。</span>
              </div>
            ) : null}
            {parseError ? (
              <div className="inline-alert">
                <AlertCircle size={16} />
                <span>{parseError}</span>
              </div>
            ) : null}
            <Button onClick={submitShareText} disabled={!shareText.trim() || parse.isPending}>
              <Search size={18} />
              {parse.isPending ? '识别中...' : '识别并开始分析'}
            </Button>
            <Button variant="ghost" onClick={() => start('stretch')} disabled={parse.isPending}>
              <PlayCircle size={17} />
              直接试试看演示视频
            </Button>
          </div>
        </Card>

        <section className="stack">
          <div className="row">
            <Sparkles size={18} color="var(--primary)" />
            <h2 className="headline-md">探索微行动</h2>
          </div>
          <div className="scenario-grid seed-grid">
            {scenarios.map((item) => {
              const Icon = item.icon;
              const demoVideo = demoVideoList.find((video) => video.scenario === item.id);
              return (
                <button key={item.id} className={`card scenario-card seed-card ${item.tint}`} onClick={() => start(item.id)} disabled={parse.isPending}>
                  <img className="seed-cover" src={item.cover} alt="" />
                  <span className="seed-play" aria-hidden="true">
                    <PlayCircle size={18} />
                  </span>
                  <div className="seed-card-body">
                    <div className="seed-card-content">
                      <span className="seed-icon">
                        <Icon size={24} />
                      </span>
                      <span className="seed-copy">
                        <strong>{item.title}</strong>
                        <p className="tiny">{demoVideo?.durationLabel ?? item.desc} · {item.desc}</p>
                      </span>
                    </div>
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
