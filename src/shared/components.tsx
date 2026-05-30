import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Check, Home, Medal, Network, Play, Sparkles, Sprout } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFlowStore } from '../app/flowStore';
import { HealthGraph, HealthGraphNode } from './types';

export function PageShell({
  title,
  children,
  showBack = false,
  hideNav = false,
}: {
  title?: string;
  children: ReactNode;
  showBack?: boolean;
  hideNav?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="app-page">
      <div className="phone">
        <header className="topbar">
          {showBack ? (
            <button className="icon-button" aria-label="返回" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </button>
          ) : (
            <Link to="/" className="brand">
              <Sprout size={22} fill="currentColor" />
              <span>MicroHabit</span>
            </Link>
          )}
          {title ? <div className="topbar-title">{title}</div> : <div />}
          <Link to="/profile" className="icon-button" aria-label="个人中心">
            <Sparkles size={18} />
          </Link>
        </header>
        <main className="content">
          <motion.div className="page-inner" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {children}
          </motion.div>
        </main>
        {!hideNav ? <BottomNav /> : null}
      </div>
    </div>
  );
}

function BottomNav() {
  const { pathname } = useLocation();
  const latestChallengeId = useFlowStore((state) => state.latestChallengeId);
  const items = [
    { to: '/', label: '首页', icon: Home, active: pathname === '/' },
    { to: '/challenges', label: '挑战', icon: Network, active: pathname.includes('challenge') || pathname.includes('checkin') },
    { to: `/report/${latestChallengeId || 'challenge_sedentary_7d_001'}`, label: '复盘', icon: BarChart3, active: pathname.includes('report') },
    { to: '/profile', label: '微章', icon: Medal, active: pathname.includes('profile') },
  ];
  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link className={`nav-item ${item.active ? 'active' : ''}`} key={item.to} to={item.to}>
            <Icon size={19} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  className = '',
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}) {
  return (
    <button type={type} className={`button ${variant} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function SectionTitle({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="stack" style={{ gap: 8 }}>
      {eyebrow ? <p className="label" style={{ color: 'var(--primary)' }}>{eyebrow}</p> : null}
      <h1 className="headline-lg">{title}</h1>
      {body ? <p className="body">{body}</p> : null}
    </div>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(100, (value / total) * 100)}%` }} />
    </div>
  );
}

const nodeIcon = (type: HealthGraphNode['type']) => {
  if (type === 'topic') return <Sprout size={24} />;
  if (type === 'reflection') return <Medal size={18} />;
  if (type === 'knowledge') return <Sparkles size={17} />;
  return <Play size={17} />;
};

const nodeTypeLabel: Record<HealthGraphNode['type'], string> = {
  topic: '主题',
  knowledge: '知识',
  action: '行动',
  reflection: '复盘',
  reward: '奖励',
};

export function HealthGraphCanvas({
  graph,
  completedNodeIds,
  currentNodeId,
  litNodeId,
  variant = 'preview',
}: {
  graph: HealthGraph;
  completedNodeIds?: string[];
  currentNodeId?: string;
  litNodeId?: string;
  variant?: 'preview' | 'success';
}) {
  const [selected, setSelected] = useState<HealthGraphNode | null>(null);
  const pathNodes = graph.nodes
    .filter((node) => node.linkedDay)
    .sort((a, b) => (a.linkedDay ?? 0) - (b.linkedDay ?? 0));
  const topicNode = graph.nodes.find((node) => node.type === 'topic');
  const completed = new Set(completedNodeIds);
  const getNodeStatus = (node: HealthGraphNode) => {
    if (node.type === 'topic') return 'active';
    if (node.id === litNodeId || node.id === currentNodeId) return 'active';
    if (completed.has(node.id)) return 'completed';
    return completedNodeIds ? 'locked' : node.status;
  };
  return (
    <>
      <div className="graph-legend">
        <span><i className="legend-dot legend-knowledge" />知识</span>
        <span><i className="legend-dot legend-action" />行动</span>
        <span><i className="legend-dot legend-current" />当前</span>
        <span><i className="legend-dot legend-done" />已点亮</span>
      </div>
      <div className={`graph-area ${variant === 'success' ? 'graph-area-success' : ''}`}>
        <svg className="graph-svg" viewBox="0 0 100 100">
          {topicNode
            ? graph.nodes
                .filter((node) => node.id !== topicNode.id)
                .map((target) => (
                  <motion.path
                    key={`rel_${target.id}`}
                    d={`M ${topicNode.position.x} ${topicNode.position.y} L ${target.position.x} ${target.position.y}`}
                    fill="none"
                    stroke="#c0c8c3"
                    strokeWidth={0.55}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.28 }}
                    transition={{ duration: 0.6 }}
                  />
                ))
            : null}
          {pathNodes.slice(0, -1).map((source, index) => {
            const target = pathNodes[index + 1];
            const targetCompleted = completed.has(target.id) || target.id === litNodeId;
            const targetCurrent = target.id === currentNodeId;
            const active = targetCompleted || targetCurrent;
            return (
              <motion.path
                key={`day_${source.id}_${target.id}`}
                d={`M ${source.position.x} ${source.position.y} C ${(source.position.x + target.position.x) / 2} ${source.position.y}, ${(source.position.x + target.position.x) / 2} ${target.position.y}, ${target.position.x} ${target.position.y}`}
                fill="none"
                stroke={active ? '#83baa1' : '#d8d4cb'}
                strokeWidth={active ? 1.9 : 1.1}
                strokeLinecap="round"
                strokeDasharray={active ? undefined : '3 4'}
                className={targetCurrent ? 'flow-line' : ''}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: active ? 0.92 : 0.54 }}
                transition={{ duration: 0.8 }}
              />
            );
          })}
        </svg>
        {graph.nodes.map((node) => {
          const lit = node.id === litNodeId;
          const status = getNodeStatus(node);
          const isCurrent = node.id === currentNodeId;
          return (
            <div
              key={node.id}
              className="graph-node"
              style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
            >
              <motion.button
                type="button"
                className={`graph-node-button ${node.type} ${status} ${lit ? 'lit' : ''}`}
                onClick={() => setSelected(node)}
                whileTap={{ scale: 0.92 }}
                animate={lit ? { scale: [1, 1.16, 1] } : status === 'active' ? { y: [0, -3, 0] } : undefined}
                transition={lit ? { duration: 0.8 } : { duration: 2.4, repeat: Infinity }}
              >
                {node.linkedDay ? <span className="node-day">D{node.linkedDay}</span> : null}
                <span className="node-orb">{lit ? <Check size={18} /> : nodeIcon(node.type)}</span>
                {isCurrent ? <span className="node-current-tag">今日</span> : null}
                <span className="node-title">{node.title}</span>
              </motion.button>
            </div>
          );
        })}
      </div>
      {selected ? (
        <motion.div className="drawer" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="row space-between">
              <div>
                <p className="label" style={{ color: 'var(--primary)' }}>{nodeTypeLabel[selected.type]}</p>
                <h3 className="headline-md">{selected.title}</h3>
              </div>
              <button className="icon-button" onClick={() => setSelected(null)}>×</button>
            </div>
            {selected.linkedDay ? <span className="chip active" style={{ marginTop: 10 }}>Day {selected.linkedDay}{selected.id === currentNodeId ? ' · 今日行动' : ''}</span> : null}
            <p className="body" style={{ marginTop: 10 }}>{selected.description}</p>
          </Card>
        </motion.div>
      ) : null}
    </>
  );
}
