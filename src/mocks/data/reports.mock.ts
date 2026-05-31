import { ReviewReport, VideoScenario } from '../../shared/types';

const scenarioMeta: Record<VideoScenario, {
  badge: string;
  title: string;
  scene: string;
  easiestAction: string;
  interruptionMoment: string;
  aiFeedback: string;
  nodes: string[];
  relatedLabel: string;
  switchLabel: string;
}> = {
  meditation: {
    badge: '专注微光练习生',
    title: '你完成了 7 天专注微冥想',
    scene: '午饭后安静角落',
    easiestAction: '呼吸节奏',
    interruptionMoment: '临时消息打断后的重新开始',
    aiFeedback: '你最稳定完成的是短呼吸觉察，这说明不用完整冥想也能建立专注入口。下一轮可以保留 1 分钟版本，再加入身体扫描。',
    nodes: ['思绪观察', '呼吸节奏', '注意力锚点', '身体扫描', '午后专注重启', '睡前放松', '冥想复盘'],
    relatedLabel: '护眼微行动',
    switchLabel: '身体松弛拉伸',
  },
  stretch: {
    badge: '身体松弛练习生',
    title: '你完成了 7 天身体松弛拉伸',
    scene: '下班后卧室',
    easiestAction: '扣膝转体',
    interruptionMoment: '下午连续久坐之后',
    aiFeedback: '你最稳定完成的是小幅度转体，这说明身体松开的关键不是动作难度，而是先从一个不会抗拒的入口开始。',
    nodes: ['久坐风险', '扣膝转体', '背部拉伸', '侧向拉伸', '肩背放松', '呼吸收尾', '拉伸复盘'],
    relatedLabel: '专注微冥想',
    switchLabel: '护眼微行动',
  },
  eye_yoga: {
    badge: '护眼观察员',
    title: '你完成了 7 天护眼微行动',
    scene: '下午看屏幕后',
    easiestAction: '远眺 20 秒',
    interruptionMoment: '长时间刷屏之后',
    aiFeedback: '你最稳定完成的是远眺和眨眼恢复，这说明护眼动作越轻越容易被记住。下一轮可以继续把它放在屏幕间隙里。',
    nodes: ['屏幕疲劳识别', '远眺 20 秒', '眨眼恢复', '眼周放松', '眉眼舒展', '睡前眼部休息', '护眼复盘'],
    relatedLabel: '身体松弛拉伸',
    switchLabel: '专注微冥想',
  },
};

export function createReport(scenario: VideoScenario, challengeId: string): ReviewReport {
  const meta = scenarioMeta[scenario];
  return {
    id: `report_${challengeId}`,
    challengeId,
    title: meta.title,
    completedDays: 7,
    totalDays: 7,
    completedNodes: meta.nodes.map((title, index) => ({ id: `${challengeId}_node_${index}`, title, type: index === 6 ? 'reflection' : 'action' })),
    strongestExecutionScene: meta.scene,
    easiestAction: meta.easiestAction,
    interruptionMoment: meta.interruptionMoment,
    aiFeedback: meta.aiFeedback,
    reward: {
      badgeName: meta.badge,
      badgeDescription: '完成 7 天微行动路径后获得',
      points: 120,
      skinUnlocked: '微光薄荷节点皮肤',
    },
    nextRecommendations: [
      { id: `continue_${challengeId}`, title: `延续「${meta.easiestAction}」`, description: `继续把它放在${meta.scene}，先跑 7 天，不增加动作难度。`, type: 'continue' },
      { id: `related_${scenario}`, title: `解锁「${meta.relatedLabel}」视频`, description: '从当前路径的相邻节点延伸，不用重新设计全部计划。', type: 'related_video' },
      { id: `switch_${scenario}`, title: `切到「${meta.switchLabel}」`, description: '换一个生活场景继续点亮，保留 1 分钟低门槛版本。', type: 'related_node' },
      { id: `light_${challengeId}`, title: '保留低压轻提醒', description: '适合改成每周一次提醒，避免把微习惯变成压力。', type: 'light_reminder' },
    ],
  };
}

export const reports = [
  createReport('meditation', 'challenge_meditation_7d_001'),
  createReport('stretch', 'challenge_stretch_7d_001'),
  createReport('eye_yoga', 'challenge_eye_yoga_7d_001'),
];
