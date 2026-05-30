import { useMutation } from '@tanstack/react-query';
import { Check, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../mocks/api';
import { Card, PageShell, SectionTitle } from '../shared/components';

const stages = ['正在读取视频信息', '正在识别健康主题', '正在提取微行动', '正在检查内容风险', '正在生成健康图谱'];

export function AnalyzingPage() {
  const { videoId = 'video_sedentary_001' } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const analysis = useMutation({
    mutationFn: api.startAnalysis,
    onSuccess: (result) => window.setTimeout(() => navigate(`/result/${result.analysisId}`), 3200),
  });

  useEffect(() => {
    analysis.mutate({ videoId });
  }, [videoId]);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => Math.min(stages.length, value + 1)), 620);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <PageShell title="AI 分析" showBack>
      <div className="stack-lg">
        <SectionTitle
          title="正在把视频拆成可以执行的小行动..."
          body="这一步会识别视频里的健康知识、动作建议、适用场景和注意事项。"
        />
        <Card className="tint-mint">
          <div className="timeline">
            {stages.map((stage, index) => {
              const done = index < active;
              return (
                <div className="timeline-step" key={stage}>
                  <span className={`dot ${done ? 'done' : index === active ? 'active' : ''}`}>
                    {done ? <Check size={16} /> : <Sparkles size={14} />}
                  </span>
                  <div>
                    <p className="label">{stage}</p>
                    <p className="tiny">{done ? '已点亮' : index === active ? '微光处理中' : '等待中'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <p className="body">AI Coach 正在把“知道了”的内容，整理成接下来真的能发生的小行动。</p>
        </Card>
      </div>
    </PageShell>
  );
}
