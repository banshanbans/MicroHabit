import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../mocks/api';
import { useFlowStore } from '../app/flowStore';
import { Button, Card, HealthGraphCanvas, PageShell, ProgressBar, SectionTitle } from '../shared/components';

export function GraphPreviewPage() {
  const { graphId = 'graph_sedentary_001' } = useParams();
  const navigate = useNavigate();
  const challenge = useFlowStore((state) => Object.values(state.challengesById).find((item) => item.graphId === graphId));
  const { data } = useQuery({ queryKey: ['graph', graphId], queryFn: () => api.getGraph(graphId) });
  if (!data) return <PageShell title="健康图谱" showBack><p className="body">加载中...</p></PageShell>;
  const completedNodes = challenge?.progress.completedDays ?? data.progress.completedNodes;
  const totalNodes = challenge?.progress.totalDays ?? data.progress.totalNodes;
  return (
    <PageShell title="健康图谱" showBack>
      <div className="stack-lg">
        <SectionTitle title="你的健康图谱已生成" body="这不是一张总结卡，而是你接下来要点亮的健康路径。" />
        <Card className="graph-card tint-mint">
          <div className="row space-between">
            <div>
              <h2 className="headline-md">{data.title}</h2>
              <p className="tiny">{data.description}</p>
              <p className="tiny">中心是主题，外圈是接下来要点亮的 7 天节点。</p>
            </div>
            <span className="chip active">{completedNodes}/{totalNodes}</span>
          </div>
          <HealthGraphCanvas
            graph={data}
            completedNodeIds={challenge?.progress.completedNodeIds}
            currentNodeId={challenge?.days.find((day) => day.status === 'today')?.graphNodeId}
          />
          <ProgressBar value={completedNodes} total={totalNodes} />
        </Card>
        <Button onClick={() => navigate(`/challenge/new/${graphId}`)}>
          <CalendarDays size={18} />
          选择挑战周期
        </Button>
      </div>
    </PageShell>
  );
}
