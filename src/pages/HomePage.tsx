import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Brain, Eye, FileVideo, PlayCircle, Sparkles, Sprout, StretchHorizontal, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { api } from '../mocks/api';
import { Button, Card, PageShell } from '../shared/components';
import { VideoScenario } from '../shared/types';

const scenarios: { id: VideoScenario; title: string; desc: string; icon: typeof Brain; tint: string; cover: string }[] = [
  { id: 'meditation', title: '冥想训练', desc: '5-10 分钟平复焦虑，找回专注', icon: Brain, tint: 'tint-mint', cover: '/seed-covers/meditation.jpg' },
  { id: 'stretch', title: '拉伸', desc: '每天 2 分钟，让身体从久坐里松开', icon: StretchHorizontal, tint: 'tint-coral', cover: '/seed-covers/stretch.jpg' },
  { id: 'eye_yoga', title: '眼部瑜伽', desc: '1 分钟眼周放松，缓解屏幕疲劳', icon: Eye, tint: '', cover: '/seed-covers/eye-yoga.jpg' },
];

export function HomePage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const setScenario = useFlowStore((s) => s.setScenario);
  const parse = useMutation({
    mutationFn: api.parseVideo,
    onSuccess: (video) => {
      setScenario(video.scenario);
      navigate(`/analyzing/${video.id}`);
    },
  });
  const upload = useMutation({
    mutationFn: api.uploadVideo,
    onSuccess: (video) => {
      setScenario(video.scenario);
      navigate(`/analyzing/${video.id}`);
    },
  });

  const start = (scenario?: VideoScenario) => parse.mutate({ scenario });
  const uploadError = upload.error instanceof Error ? upload.error.message : '';

  const handleFileChange = (file?: File) => {
    if (!file) return;
    setSelectedFileName(file.name);
    upload.mutate({ file });
  };

  return (
    <PageShell>
      <div className="stack-lg home-layout">
        <section className="hero stack">
          <div className="sprout float">
            <Sprout size={34} fill="currentColor" />
          </div>
          <h1 className="headline-xl">把健康视频，<br />变成 7 天<br />微习惯挑战</h1>
          <p className="body">上传已下载或录屏的抖音健康视频，AI 会提取微行动、生成健康图谱，并陪你一点点点亮。</p>
        </section>

        <Card className="tint-mint">
          <div className="stack">
            <input
              ref={inputRef}
              className="file-input"
              type="file"
              accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
              onChange={(event) => handleFileChange(event.target.files?.[0])}
            />
            <div className="upload-drop">
              <span className="upload-icon">
                <FileVideo size={24} />
              </span>
              <div>
                <p className="label">{selectedFileName || '选择抖音视频文件'}</p>
                <p className="tiny">支持 MP4、MOV、AVI。</p>
              </div>
            </div>
            {uploadError ? (
              <div className="inline-alert">
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            ) : null}
            <Button onClick={() => inputRef.current?.click()}>
              <Upload size={18} />
              {upload.isPending ? '上传中...' : '上传并开始分析'}
            </Button>
            <Button variant="ghost" onClick={() => start('stretch')}>
              <PlayCircle size={17} />
              无视频时试试看 Seed 视频
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
              return (
                <button key={item.id} className={`card scenario-card seed-card ${item.tint}`} onClick={() => start(item.id)}>
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
                        <p className="tiny">{item.desc}</p>
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
