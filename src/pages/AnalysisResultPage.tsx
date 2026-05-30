import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Lightbulb, Network } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../mocks/api';
import { Button, Card, PageShell, SectionTitle } from '../shared/components';

export function AnalysisResultPage() {
  const { analysisId = 'analysis_sedentary_001' } = useParams();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ['analysis', analysisId], queryFn: () => api.getAnalysis(analysisId) });
  if (!data) return <PageShell title="解析结果" showBack><p className="body">加载中...</p></PageShell>;
  return (
    <PageShell title="解析结果" showBack>
      <div className="stack-lg">
        <SectionTitle eyebrow="视频主题" title={data.theme} body={data.summary} />
        <Card className="tint-mint">
          <div className="stack">
            <div className="row"><Lightbulb size={20} color="var(--primary)" /><p className="label">核心微行动</p></div>
            <h2 className="headline-lg">{data.coreMicroAction.title}</h2>
            <p className="body">{data.coreMicroAction.description}</p>
          </div>
        </Card>
        <Card>
          <h3 className="headline-md">为什么值得做</h3>
          <p className="body" style={{ marginTop: 8 }}>{data.whyWorthDoing}</p>
        </Card>
        <InfoList title="行动要点" items={data.actionTips} />
        <InfoList title="使用场景" items={data.useCases} />
        <Card className="safety">
          <div className="row"><AlertTriangle size={18} color="var(--coral-deep)" /><h3 className="headline-md">{data.risk.label}</h3></div>
          <p className="body" style={{ marginTop: 8, color: 'var(--coral-deep)' }}>{data.risk.message}</p>
          <div className="chip-row" style={{ marginTop: 12 }}>
            {data.risk.reasons.map((reason) => <span className="chip" key={reason}>{reason}</span>)}
          </div>
        </Card>
        <Button onClick={() => navigate(`/graph/${data.graphId}`)}>
          <Network size={18} />
          查看健康图谱
        </Button>
      </div>
    </PageShell>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h3 className="headline-md">{title}</h3>
      <div className="stack" style={{ marginTop: 12 }}>
        {items.map((item) => (
          <div className="row" key={item}>
            <CheckCircle2 size={17} color="var(--primary)" />
            <p className="body">{item}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
