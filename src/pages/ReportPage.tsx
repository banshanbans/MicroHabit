import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarDays, Medal, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../mocks/api';
import { Button, Card, PageShell, ProgressBar, SectionTitle } from '../shared/components';

export function ReportPage() {
  const { challengeId = 'challenge_stretch_7d_001' } = useParams();
  const navigate = useNavigate();
  const { data, isError } = useQuery({ queryKey: ['report', challengeId], queryFn: () => api.getReport(challengeId), retry: false });
  if (isError) {
    return (
      <PageShell title="复盘报告" showBack>
        <div className="stack-lg">
          <Card className="tint-coral">
            <h1 className="headline-lg">还没有可复盘的挑战</h1>
            <p className="body" style={{ marginTop: 8 }}>这个挑战记录不存在，可能是旧的本地演示数据。先从挑战列表选择一个真实挑战，或重新创建挑战。</p>
          </Card>
          <Button onClick={() => navigate('/challenges')}><CalendarDays size={18} />查看我的挑战</Button>
          <Button variant="ghost" onClick={() => navigate('/')}>回到首页</Button>
        </div>
      </PageShell>
    );
  }
  if (!data) return <PageShell title="复盘报告" showBack><p className="body">报告生成中...</p></PageShell>;
  return (
    <PageShell title="复盘报告" showBack>
      <div className="stack-lg report-layout">
        <div className="report-summary-panel stack">
          <SectionTitle title={data.title} body="这份报告连接你的行动、点亮节点和下一步推荐。" />
          <Card className="tint-mint">
            <div className="row space-between"><p className="label">完成总览</p><p className="label">{data.completedDays}/{data.totalDays}</p></div>
            <div style={{ marginTop: 12 }}><ProgressBar value={data.completedDays} total={data.totalDays} /></div>
          </Card>
          <AnimatedCard index={0}>
            <h2 className="headline-md">点亮节点</h2>
            <div className="chip-row" style={{ marginTop: 12 }}>{data.completedNodes.map((node) => <span className="chip active" key={node.id}>{node.title}</span>)}</div>
          </AnimatedCard>
          <motion.section className="card tint-coral" initial={{ scale: 0.86, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.45, type: 'spring' }}>
            <div className="badge-burst"><Medal size={48} /></div>
            <div className="hero stack" style={{ paddingTop: 16 }}>
              <h2 className="headline-lg">{data.reward.badgeName}</h2>
              <p className="body">{data.reward.badgeDescription}</p>
              <span className="chip active">+{data.reward.points} 微光积分</span>
            </div>
          </motion.section>
        </div>

        <div className="report-insight-panel stack">
          <Card>
            <div className="row"><Sparkles size={19} color="var(--primary)" /><h2 className="headline-md">AI 鼓励反馈</h2></div>
            <p className="body" style={{ marginTop: 8 }}>{data.aiFeedback}</p>
          </Card>
          <section className="stack">
            <h2 className="headline-md">下一步推荐</h2>
            <div className="report-recommendation-grid">
              {data.nextRecommendations.map((item) => (
                <Card key={item.id}>
                  <p className="label">{item.title}</p>
                  <p className="body">{item.description}</p>
                </Card>
              ))}
            </div>
          </section>
          {data.personalizedStats ? (
            <AnimatedCard index={2}>
              <h2 className="headline-md">真实执行节奏</h2>
              <div className="chip-row" style={{ marginTop: 12 }}>
                <span className="chip active">完整 {data.personalizedStats.fullCheckins} 次</span>
                <span className="chip active">轻量 {data.personalizedStats.tinyCheckins} 次</span>
                <span className="chip active">{data.personalizedStats.favoriteCheckinTime}</span>
                <span className="chip active">{Math.round(data.personalizedStats.completionRate * 100)}%</span>
              </div>
            </AnimatedCard>
          ) : null}
          {data.realMoments?.length ? (
            <AnimatedCard index={3}>
              <h2 className="headline-md">真实记录</h2>
              <div className="report-moment-grid">
                {data.realMoments.map((moment) => (
                  <Card key={moment.id}>
                    <div className="row space-between">
                      <p className="label">Day {moment.day}</p>
                      <span className="chip active">{moment.completedType === 'tiny' ? '30 秒版本' : '完整完成'}</span>
                    </div>
                    <p className="body" style={{ marginTop: 8 }}>{moment.optionalNote || new Date(moment.createdAt).toLocaleString('zh-CN')}</p>
                  </Card>
                ))}
              </div>
            </AnimatedCard>
          ) : null}
          <AnimatedCard index={4}>
            <h2 className="headline-md">最稳定的执行场景</h2>
            <p className="body">{data.strongestExecutionScene}</p>
            <h2 className="headline-md" style={{ marginTop: 16 }}>容易中断的时刻</h2>
            <p className="body">{data.interruptionMoment}</p>
          </AnimatedCard>
        </div>
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
