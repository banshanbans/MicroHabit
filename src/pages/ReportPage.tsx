import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Medal, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { api } from '../mocks/api';
import { Card, PageShell, ProgressBar, SectionTitle } from '../shared/components';

export function ReportPage() {
  const { challengeId = 'challenge_sedentary_7d_001' } = useParams();
  const { data } = useQuery({ queryKey: ['report', challengeId], queryFn: () => api.getReport(challengeId) });
  if (!data) return <PageShell title="复盘报告" showBack><p className="body">报告生成中...</p></PageShell>;
  return (
    <PageShell title="复盘报告" showBack>
      <div className="stack-lg">
        <SectionTitle title={data.title} body="这份报告连接你的行动、点亮节点和下一步推荐。" />
        <Card className="tint-mint">
          <div className="row space-between"><p className="label">完成总览</p><p className="label">{data.completedDays}/{data.totalDays}</p></div>
          <div style={{ marginTop: 12 }}><ProgressBar value={data.completedDays} total={data.totalDays} /></div>
        </Card>
        <AnimatedCard index={0}>
          <h2 className="headline-md">点亮节点</h2>
          <div className="chip-row" style={{ marginTop: 12 }}>{data.completedNodes.map((node) => <span className="chip active" key={node.id}>{node.title}</span>)}</div>
        </AnimatedCard>
        <AnimatedCard index={1}>
          <h2 className="headline-md">最稳定的执行场景</h2>
          <p className="body">{data.strongestExecutionScene}</p>
          <h2 className="headline-md" style={{ marginTop: 16 }}>容易中断的时刻</h2>
          <p className="body">{data.interruptionMoment}</p>
        </AnimatedCard>
        <AnimatedCard index={2}>
          <div className="row"><Sparkles size={19} color="var(--primary)" /><h2 className="headline-md">AI 鼓励反馈</h2></div>
          <p className="body" style={{ marginTop: 8 }}>{data.aiFeedback}</p>
        </AnimatedCard>
        <motion.section className="card tint-coral" initial={{ scale: 0.86, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.45, type: 'spring' }}>
          <div className="badge-burst"><Medal size={48} /></div>
          <div className="hero stack" style={{ paddingTop: 16 }}>
            <h2 className="headline-lg">{data.reward.badgeName}</h2>
            <p className="body">{data.reward.badgeDescription}</p>
            <span className="chip active">+{data.reward.points} 微光积分</span>
          </div>
        </motion.section>
        <section className="stack">
          <h2 className="headline-md">下一步推荐</h2>
          {data.nextRecommendations.map((item) => (
            <Card key={item.id}>
              <p className="label">{item.title}</p>
              <p className="body">{item.description}</p>
            </Card>
          ))}
        </section>
      </div>
    </PageShell>
  );
}

function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.section className="card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.14 }}>
      {children}
    </motion.section>
  );
}
