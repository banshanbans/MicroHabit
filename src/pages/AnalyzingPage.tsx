import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Check, RotateCcw, Sparkles, Sprout, Upload, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../mocks/api';
import { Button, Card, PageShell, ProgressBar, SectionTitle } from '../shared/components';
import { AnalysisStage, AnalysisTask } from '../shared/types';

const stageLabels: Record<AnalysisStage, string> = {
  queued: '正在排队准备分析',
  extracting_media: '正在准备视频内容',
  transcribing_audio: '正在准备视频内容',
  analyzing_frames: '正在识别画面里的健康动作',
  generating_graph: '正在生成健康图谱和挑战计划',
  completed: '分析完成',
  failed: '分析失败',
};

const stages: AnalysisStage[] = ['queued', 'analyzing_frames', 'generating_graph', 'completed'];
const stageOrder: Record<AnalysisStage, number> = {
  queued: 0,
  extracting_media: 1,
  transcribing_audio: 2,
  analyzing_frames: 3,
  generating_graph: 4,
  completed: 5,
  failed: 5,
};

const waitingLines = [
  '小芽正在整理第一颗节点。',
  '图谱快长出来了。',
  '先停一口气，微光在路上。',
  '正在给第一天留一个很轻的入口。',
  '快好了，节点会一个个亮起来。',
  '小芽还在检查哪些动作最适合开始。',
];

export function AnalyzingPage() {
  const { videoId = 'video_stretch_001' } = useParams();
  const navigate = useNavigate();
  const startedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [task, setTask] = useState<AnalysisTask | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [voiceText, setVoiceText] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const analysis = useMutation({
    mutationFn: api.startAnalysis,
    onSuccess: (result) => {
      setTask(result);
      if (result.status === 'completed' && result.analysisId) {
        window.setTimeout(() => navigate(`/result/${result.analysisId}`), 650);
      }
    },
  });
  const retry = () => {
    setTask(null);
    setVoiceError('');
    setVoiceText('');
    analysis.reset();
    startedRef.current = true;
    analysis.mutate({ videoId });
  };
  const speak = useMutation({
    mutationFn: () => api.speakCompanion({ intent: 'analysis_waiting' }),
    onMutate: () => {
      setVoiceError('');
      audioRef.current?.pause();
    },
    onSuccess: async ({ blob, text }) => {
      setVoiceText(text);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    },
    onError: (error) => {
      const detail = (error as { detail?: { message?: string; text?: string } }).detail;
      setVoiceError(detail?.message ?? '语音暂时不可用');
      setVoiceText(detail?.text ?? waitingLines[lineIndex]);
    },
  });

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    analysis.mutate({ videoId });
  }, [videoId]);

  useEffect(() => {
    if (!task?.taskId || task.status === 'completed' || task.status === 'failed') return;
    const timer = window.setInterval(async () => {
      try {
        const latest = await api.getAnalysisTask(task.taskId);
        setTask(latest);
        if (latest.status === 'completed' && latest.analysisId) {
          window.clearInterval(timer);
          navigate(`/result/${latest.analysisId}`);
        }
      } catch (error) {
        setTask((current) => current ? { ...current, status: 'failed', stage: 'failed', progress: 100, errorMessage: error instanceof Error ? error.message : '分析任务查询失败' } : current);
      }
    }, 1300);
    return () => window.clearInterval(timer);
  }, [task?.taskId, task?.status, navigate]);

  useEffect(() => {
    if (task?.status === 'failed' || task?.status === 'completed') return;
    const timer = window.setInterval(() => {
      setLineIndex((value) => (value + 1) % waitingLines.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [task?.status]);

  const activeStage = task?.stage ?? 'queued';
  const activeOrder = stageOrder[activeStage];
  const active = stages.reduce((latest, stage, index) => (stageOrder[stage] <= activeOrder ? index : latest), 0);
  const errorMessage = task?.errorMessage || (analysis.error instanceof Error ? analysis.error.message : '');

  return (
    <PageShell title="AI 分析" showBack>
      <div className="stack-lg analysis-layout">
        <SectionTitle
          title={task?.status === 'failed' ? '这次分析没有完成' : '正在把视频拆成可以执行的小行动...'}
          body={task?.status === 'failed' ? '可以重试当前视频，或回到首页重新上传。' : '系统正在分析视频内容，并生成健康图谱与挑战计划。'}
        />
        {task?.status !== 'failed' ? (
          <Card className="analysis-buddy-card">
            <div className="analysis-buddy">
              <button
                type="button"
                className={`analysis-buddy-orbit ${speak.isPending ? 'speaking' : ''}`}
                aria-label="播放小芽等待提示"
                onClick={() => speak.mutate()}
              >
                <div className="sprout analysis-buddy-sprout float">
                  <Sprout size={42} fill="currentColor" />
                </div>
                <span className="voice-chip analysis-voice-chip">
                  <Volume2 size={14} />
                  {speak.isPending ? '播放中' : '听小芽'}
                </span>
              </button>
              <div className="analysis-buddy-copy">
                <p className="label" style={{ color: 'var(--primary)' }}>微光小芽</p>
                <p className="companion-bubble">{voiceText || waitingLines[lineIndex]}</p>
                {voiceError ? <p className="tiny" style={{ color: 'var(--coral-deep)' }}>{voiceError}</p> : null}
              </div>
            </div>
          </Card>
        ) : null}
        <Card className="tint-mint">
          <div className="stack">
            <ProgressBar value={task?.progress ?? 6} total={100} />
            <div className="timeline">
            {stages.map((stage, index) => {
              const done = task?.status === 'completed' || index < active;
              return (
                <div className="timeline-step" key={stage}>
                  <span className={`dot ${done ? 'done' : index === active ? 'active' : ''}`}>
                    {done ? <Check size={16} /> : <Sparkles size={14} />}
                  </span>
                  <div>
                    <p className="label">{stageLabels[stage]}</p>
                    <p className="tiny">{done ? '已完成' : index === active ? '处理中' : '等待中'}</p>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </Card>
        {task?.status === 'failed' || analysis.isError ? (
          <Card className="tint-coral">
            <div className="stack">
              <div className="inline-alert">
                <AlertCircle size={16} />
                <span>{errorMessage || 'AI 分析失败'}</span>
              </div>
              <div className="row">
                <Button variant="secondary" onClick={retry}>
                  <RotateCcw size={17} />
                  重试
                </Button>
                <Button variant="ghost" onClick={() => navigate('/')}>
                  <Upload size={17} />
                  重新上传
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
          <p className="body">马上就能看到你的健康图谱。</p>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
