import { Challenge, ChallengeDay, VideoScenario } from '../../shared/types';

const daySets: Record<VideoScenario, Omit<ChallengeDay, 'status'>[]> = {
  sedentary: [
    ['久坐风险', '观察今天连续坐着超过 45 分钟的时刻。', '先看见习惯，才容易温柔地调整。', 'node_sedentary_risk'],
    ['颈部拉伸', '坐直，缓慢左右转头各 5 次。', '让肩颈从屏幕姿势里短暂松开。', 'node_neck_stretch'],
    ['肩背放松', '肩膀向后绕圈 8 次，再自然垂下。', '给上背部一次轻柔重启。', 'node_shoulder_release'],
    ['腰背激活', '站起来轻轻后伸 3 次。', '提醒腰背不必一直固定在坐姿里。', 'node_back_activate'],
    ['眼部休息', '看向 6 米外 20 秒。', '让眼睛从近距离屏幕里切换出来。', 'node_eye_rest'],
    ['呼吸调节', '完成 3 轮自然呼吸。', '让舒展动作有一个平稳收尾。', 'node_breath_adjust'],
    ['久坐复盘', '写下最容易完成舒展的场景。', '把一次挑战变成下一轮更轻松的开始。', 'node_sedentary_review'],
  ].map(([title, microAction, why, graphNodeId], index) => ({
    day: index + 1,
    title,
    microAction,
    why,
    howTo:
      index === 1
        ? ['坐在椅子前 1/2 处', '肩膀放松', '转头时保持慢速', '不要追求最大幅度']
        : ['找到一个稳定坐姿或站姿', '动作保持小幅度', '自然呼吸', '不舒服就停下'],
    precautions: ['如果出现疼痛、眩晕或明显不适，请停止。'],
    graphNodeId,
    estimatedMinutes: index === 0 || index === 6 ? 1 : 2,
  })),
  sleep: [
    ['睡眠观察', '记录今晚准备睡觉和实际放下手机的时间。', '观察比强迫改变更容易开始。', 'node_sleep_observe'],
    ['蓝光影响', '睡前 15 分钟把手机放到床外。', '减少最后一段高刺激输入。', 'node_blue_light'],
    ['入睡仪式', '用同一个轻动作结束睡前流程。', '固定仪式能帮助大脑识别休息信号。', 'node_sleep_ritual'],
    ['固定作息', '今晚尽量在同一时间关灯。', '稳定入口比临时补救更轻。', 'node_schedule'],
    ['咖啡因影响', '下午后不新增咖啡因饮品。', '给晚间休息减少干扰。', 'node_caffeine'],
    ['情绪放松', '睡前做 3 次自然呼吸。', '把白天的紧绷慢慢放下。', 'node_emotion_relax'],
    ['睡眠复盘', '选出最容易坚持的睡前动作。', '留下真正适合你的降噪方法。', 'node_sleep_review'],
  ].map(([title, microAction, why, graphNodeId], index) => ({
    day: index + 1,
    title,
    microAction,
    why,
    howTo: ['把动作降到很小', '固定在睡前流程里', '不追求立刻睡着', '只记录一次真实体验'],
    precautions: ['若长期失眠或白天明显受影响，请寻求专业帮助。'],
    graphNodeId,
    estimatedMinutes: index === 1 ? 15 : 2,
  })),
  emotion: [
    ['情绪觉察', '给当前压力打一个 1-5 分。', '命名压力会让它更容易被看见。', 'node_awareness'],
    ['呼吸节奏', '完成 3 次自然吸气和呼气。', '你不需要立刻平静，只需要多一个缓冲。', 'node_breath_rate'],
    ['注意力锚点', '把注意力放在脚底 30 秒。', '身体锚点能帮注意力回来一点。', 'node_attention_anchor'],
    ['身体扫描', '从肩膀到手臂轻轻扫描紧绷。', '先发现紧绷，再决定是否需要放松。', 'node_body_scan'],
    ['睡前放松', '睡前做 1 分钟安静呼吸。', '给一天一个柔和收尾。', 'node_bed_relax'],
    ['压力场景', '写下今天最容易紧张的一个场景。', '场景比意志力更值得被调整。', 'node_stress_scene'],
    ['情绪复盘', '留下对你最有效的一个锚点。', '下一次压力来时，你已经有了入口。', 'node_emotion_review'],
  ].map(([title, microAction, why, graphNodeId], index) => ({
    day: index + 1,
    title,
    microAction,
    why,
    howTo: ['找一个相对安静的位置', '不压制情绪', '完成一小轮就可以', '需要时向专业人士求助'],
    precautions: ['该内容适合日常放松，不替代专业心理咨询或医疗建议。'],
    graphNodeId,
    estimatedMinutes: 1,
  })),
};

export function createChallenge(scenario: VideoScenario, durationDays = 7): Challenge {
  const titleMap = {
    sedentary: `${durationDays} 天通勤久坐改善`,
    sleep: `${durationDays} 天睡前降噪挑战`,
    emotion: `${durationDays} 天情绪放松挑战`,
  };
  const graphMap = {
    sedentary: 'graph_sedentary_001',
    sleep: 'graph_sleep_001',
    emotion: 'graph_emotion_001',
  };
  const videoMap = {
    sedentary: 'video_sedentary_001',
    sleep: 'video_sleep_001',
    emotion: 'video_emotion_001',
  };
  return {
    id: `challenge_${scenario}_${durationDays}d_001`,
    graphId: graphMap[scenario],
    videoId: videoMap[scenario],
    title: titleMap[scenario],
    durationDays: durationDays as 7 | 15 | 21,
    status: 'active',
    currentDay: 1,
    startedAt: '2026-05-30',
    plan: {
      preferredTime: scenario === 'sleep' ? '睡前' : scenario === 'emotion' ? '会议前' : '午饭后',
      preferredPlace: scenario === 'sleep' ? '卧室' : '办公室',
      reminderStyle: 'gentle',
      naturalLanguagePlan:
        scenario === 'sedentary'
          ? '我想每天午饭后，在工位做 2 分钟肩颈舒展。'
          : '我想把这个微行动放进每天最容易发生的固定场景里。',
      fallbackPlan: '如果今天做不到完整版本，就做 30 秒，也算完成。',
    },
    days: buildDaysForDuration(scenario, durationDays).map((day) => ({
      ...day,
      status: day.day === 1 ? 'today' : 'locked',
    })),
    progress: {
      completedDays: 0,
      totalDays: durationDays,
      completedNodeIds: [],
    },
  };
}

export const challenges = [createChallenge('sedentary'), createChallenge('sleep'), createChallenge('emotion')];

function buildDaysForDuration(scenario: VideoScenario, durationDays: number): Omit<ChallengeDay, 'status'>[] {
  const base = daySets[scenario];
  if (durationDays <= base.length) return base.slice(0, durationDays);
  const extra = Array.from({ length: durationDays - base.length }, (_, index) => {
    const source = base[(index + 1) % (base.length - 1)];
    const day = base.length + index + 1;
    return {
      ...source,
      day,
      title: `巩固练习 ${day}`,
      microAction: `复习「${source.title}」，只做一个最轻版本。`,
      why: '延长周期的重点不是加压，而是让动作更稳定地出现在生活里。',
    };
  });
  return [...base, ...extra];
}
