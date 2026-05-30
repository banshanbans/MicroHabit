import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../mocks/api';
import { Card, PageShell, ProgressBar, SectionTitle } from '../shared/components';

export function ChallengeListPage() {
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ['challenges'], queryFn: api.listChallenges });
  return (
    <PageShell title="我的挑战">
      <div className="stack-lg">
        <SectionTitle title="我的健康图谱" body="正在进行、已保存和已完成的微行动路径都会在这里汇合。" />
        <section className="stack">
          <h2 className="headline-md">正在进行</h2>
          {data.map((challenge) => {
            const today = challenge.days.find((day) => day.status === 'today') ?? challenge.days[0];
            return (
              <button key={challenge.id} className="card scenario-card" onClick={() => navigate(`/challenge/${challenge.id}/today`)}>
                <div className="stack">
                  <div className="row space-between">
                    <div className="row">
                      <span className="dot active"><Network size={16} /></span>
                      <span><strong>{challenge.title}</strong><p className="tiny">来源：{challenge.videoId.replace('video_', '').replace('_001', '')}</p></span>
                    </div>
                    <ArrowRight size={18} color="var(--primary)" />
                  </div>
                  <ProgressBar value={challenge.progress.completedDays} total={challenge.progress.totalDays} />
                  <div className="row space-between">
                    <span className="tiny">Day {challenge.currentDay} / {challenge.durationDays}</span>
                    <span className="chip active">今日：{today.title}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </section>
        <Card>
          <h2 className="headline-md">已保存</h2>
          <p className="body">睡前降噪挑战已保存，可以在今晚开始。</p>
        </Card>
        <Card className="tint-coral">
          <h2 className="headline-md">已完成</h2>
          <p className="body">完成挑战后会在这里显示徽章、积分和复盘入口。</p>
        </Card>
      </div>
    </PageShell>
  );
}
