import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../mocks/api';
import { Button, Card, HealthGraphCanvas, HealthGraphNodeDetail, PageShell, ProgressBar, SectionTitle } from '../shared/components';
import { HealthGraphNode } from '../shared/types';

export function GraphPreviewPage() {
  const { graphId = 'graph_stretch_001' } = useParams();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<HealthGraphNode | null>(null);
  const { data } = useQuery({ queryKey: ['graph', graphId], queryFn: () => api.getGraph(graphId) });
  if (!data) return <PageShell title="健康图谱" showBack><p className="body">加载中...</p></PageShell>;
  const completedNodes = data.progress.completedNodes;
  const totalNodes = data.progress.totalNodes;
  return (
    <PageShell title="健康图谱" showBack>
      <div className="stack-lg graph-preview-layout">
        <SectionTitle title="你的健康图谱已生成" body="从第一个节点开始。" />
        <Card className="graph-card tint-mint">
          <div className="row space-between">
            <div>
              <h2 className="headline-md">{data.title}</h2>
              <p className="tiny">7 天节点已就绪。</p>
            </div>
            <span className="chip active">{completedNodes}/{totalNodes}</span>
          </div>
          <HealthGraphCanvas
            graph={data}
            selectedNode={selectedNode}
            onSelectedNodeChange={setSelectedNode}
            showNodeDetail={false}
          />
          <ProgressBar value={completedNodes} total={totalNodes} />
        </Card>
        <Button onClick={() => navigate(`/challenge/new/${graphId}`)}>
          <CalendarDays size={18} />
          选择挑战周期
        </Button>
        {selectedNode ? (
          <HealthGraphNodeDetail
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            className="graph-preview-detail"
          />
        ) : null}
      </div>
    </PageShell>
  );
}
