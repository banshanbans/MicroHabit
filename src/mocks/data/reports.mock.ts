import { ReviewReport, VideoScenario } from '../../shared/types';

const badgeMap: Record<VideoScenario, string> = {
  sedentary: '肩颈松弛练习生',
  sleep: '睡前降噪者',
  emotion: '呼吸找回者',
};

export function createReport(scenario: VideoScenario, challengeId: string): ReviewReport {
  const isSleep = scenario === 'sleep';
  const isEmotion = scenario === 'emotion';
  return {
    id: `report_${challengeId}`,
    challengeId,
    title: isSleep ? '你完成了 7 天睡眠修复挑战' : isEmotion ? '你完成了 7 天情绪放松挑战' : '你完成了 7 天久坐舒展挑战',
    completedDays: 7,
    totalDays: 7,
    completedNodes: (isSleep
      ? ['睡眠观察', '蓝光影响', '入睡仪式', '固定作息', '咖啡因影响', '情绪放松', '睡眠复盘']
      : isEmotion
        ? ['情绪觉察', '呼吸节奏', '注意力锚点', '身体扫描', '睡前放松', '压力场景', '情绪复盘']
        : ['久坐风险', '颈部拉伸', '肩背放松', '腰背激活', '眼部休息', '呼吸调节', '久坐复盘']
    ).map((title, index) => ({ id: `${challengeId}_node_${index}`, title, type: index === 6 ? 'reflection' : 'action' })),
    strongestExecutionScene: isSleep ? '睡前洗漱后' : isEmotion ? '会议开始前' : '午饭后回到工位',
    easiestAction: isSleep ? '把手机放到床外' : isEmotion ? '三次自然呼吸' : '颈部拉伸',
    interruptionMoment: isSleep ? '临时加班后的睡前时间' : isEmotion ? '连续会议之间' : '下午临时会议前后',
    aiFeedback: isSleep
      ? '你最稳定完成的是睡前降噪，这说明固定流程比单纯提醒更适合你。下一轮可以继续保留放下手机，再加入更轻的入睡仪式。'
      : isEmotion
        ? '你最稳定完成的是压力前的呼吸锚点。下一轮可以继续保留这个动作，再尝试记录压力最常出现的场景。'
        : '你最稳定完成的是午饭后的肩颈舒展，这说明固定场景比单纯提醒更适合你。下一轮可以继续保留这个动作，再尝试加入眼部休息或腰背激活。',
    reward: {
      badgeName: badgeMap[scenario],
      badgeDescription: '完成 7 天微行动路径后获得',
      points: 120,
      skinUnlocked: '微光薄荷节点皮肤',
    },
    nextRecommendations: [
      { id: 'continue', title: '继续 7 天挑战', description: '保留最稳定的执行场景。', type: 'continue' },
      { id: 'related', title: isSleep ? '解锁「情绪放松」视频' : '解锁「眼部休息」视频', description: '把相邻节点变成下一轮挑战。', type: 'related_video' },
      { id: 'switch', title: isEmotion ? '切换到「睡眠修复」挑战' : '切换到「情绪放松」挑战', description: '换一个生活场景继续点亮。', type: 'related_node' },
      { id: 'light', title: '降级为每周轻提醒', description: '不想继续挑战时，也保留一个低压入口。', type: 'light_reminder' },
    ],
  };
}

export const reports = [
  createReport('sedentary', 'challenge_sedentary_7d_001'),
  createReport('sleep', 'challenge_sleep_7d_001'),
  createReport('emotion', 'challenge_emotion_7d_001'),
];
