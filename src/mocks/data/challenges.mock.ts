import { Challenge, ChallengeDay, VideoScenario } from '../../shared/types';

type DaySeed = [title: string, microAction: string, why: string, graphNodeId: string, estimatedMinutes: number];

const howToByScenario: Record<VideoScenario, string[]> = {
  meditation: ['找到舒服坐姿', '不追求放空', '走神时轻轻回来', '不舒服就睁眼停止'],
  stretch: ['动作保持小幅度', '自然呼吸', '不要追求最大幅度', '疼痛或眩晕就停下'],
  eye_yoga: ['先洗手', '不要按压眼球', '动作保持轻柔', '眼部不适时跳过'],
};

const precautionsByScenario: Record<VideoScenario, string[]> = {
  meditation: ['该内容适合日常放松，不替代心理咨询或医疗建议。'],
  stretch: ['如果出现疼痛、眩晕或明显不适，请停止。'],
  eye_yoga: ['如有眼痛、视力变化或炎症，请停止并寻求专业帮助。'],
};

const daySets: Record<VideoScenario, DaySeed[]> = {
  meditation: [
    ['思绪观察', '给当前状态一个词：紧、乱、困或平静。', '先看见状态，比立刻改变更温柔。', 'node_thought_observe', 1],
    ['呼吸节奏', '观察 3 次自然吸气和呼气。', '把注意力放回一个稳定入口。', 'node_breath_anchor', 1],
    ['注意力锚点', '把注意力放在身体接触地面的感觉 30 秒。', '锚点能帮你从杂念里轻轻回来。', 'node_attention_anchor', 1],
    ['身体扫描', '从肩膀到腹部感受一次身体经过呼吸。', '身体觉察能降低练习门槛。', 'node_body_awareness', 2],
    ['午后专注重启', '开始学习或工作前，做 1 分钟静坐。', '用短暂停顿给注意力重新开机。', 'node_focus_restart', 1],
    ['睡前放松', '睡前只做 3 次自然呼吸。', '让一天有一个不费力的收尾。', 'node_bedtime_meditation', 1],
    ['冥想复盘', '写下最容易安静下来的时间或地点。', '把适合你的场景留下来。', 'node_meditation_review', 1],
  ],
  stretch: [
    ['久坐风险', '观察今天连续坐着超过 45 分钟的时刻。', '先看见习惯，才容易温柔地调整。', 'node_sedentary_risk', 1],
    ['扣膝转体', '坐姿或躺姿做一次小幅度转体。', '让腰背从固定方向里松开一点。', 'node_knee_twist', 2],
    ['背部拉伸', '选择一个伏地或坐姿背部伸展，保持 20 秒。', '给背部一次慢慢展开的机会。', 'node_back_stretch', 2],
    ['侧向拉伸', '身体向一侧轻轻延展，再换边。', '照顾平时很少被拉开的身体侧面。', 'node_side_stretch', 2],
    ['肩背放松', '肩膀向后绕圈 8 次，再自然垂下。', '给上背部一次轻柔重启。', 'node_shoulder_release', 2],
    ['呼吸收尾', '完成 3 轮自然呼吸，让动作慢慢结束。', '让拉伸不只是动作，也是一段放松。', 'node_breath_finish', 1],
    ['拉伸复盘', '写下今天最舒服的一个动作。', '下一轮只保留最适合你的轻版本。', 'node_stretch_review', 1],
  ],
  eye_yoga: [
    ['屏幕疲劳识别', '观察眼睛是否干涩、眯眼或眉心紧。', '先发现眼睛累了，才更容易暂停。', 'node_screen_fatigue', 1],
    ['远眺 20 秒', '看向 6 米外或窗外 20 秒。', '让眼睛从近距离屏幕里切换出来。', 'node_far_gaze', 1],
    ['眨眼恢复', '自然眨眼 5 次，再闭眼休息 5 秒。', '给眼睛一次轻微湿润和暂停。', 'node_blink_restore', 1],
    ['眼周放松', '用指腹轻柔放松眉眼周围，不碰眼球。', '让紧绷的眼周慢慢松开。', 'node_eye_area_relax', 1],
    ['眉眼舒展', '放松额头和眉心，配合一次慢呼气。', '表情松一点，眼神也会更舒展。', 'node_brow_release', 1],
    ['睡前眼部休息', '放下手机后闭眼 20 秒。', '给睡前的眼睛一个安静收尾。', 'node_bedtime_eye_rest', 1],
    ['护眼复盘', '记录最容易暂停看屏幕的时刻。', '把护眼动作放进真实生活场景。', 'node_eye_review', 1],
  ],
};

export function createChallenge(scenario: VideoScenario, durationDays = 7): Challenge {
  const titleMap: Record<VideoScenario, string> = {
    meditation: `${durationDays} 天专注微冥想`,
    stretch: `${durationDays} 天身体松弛拉伸`,
    eye_yoga: `${durationDays} 天护眼微行动`,
  };
  const graphMap: Record<VideoScenario, string> = {
    meditation: 'graph_meditation_001',
    stretch: 'graph_stretch_001',
    eye_yoga: 'graph_eye_yoga_001',
  };
  const videoMap: Record<VideoScenario, string> = {
    meditation: 'video_meditation_001',
    stretch: 'video_stretch_001',
    eye_yoga: 'video_eye_yoga_001',
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
      preferredTime: scenario === 'eye_yoga' ? '下午看屏幕后' : scenario === 'meditation' ? '午饭后' : '下班后',
      preferredPlace: scenario === 'eye_yoga' ? '书桌前' : scenario === 'meditation' ? '安静角落' : '卧室',
      reminderStyle: 'gentle',
      naturalLanguagePlan:
        scenario === 'eye_yoga'
          ? '我想每天看屏幕后，在书桌前做 1 分钟眼周放松。'
          : scenario === 'meditation'
            ? '我想每天午饭后，在安静角落做 1 分钟呼吸觉察。'
            : '我想每天下班后，在卧室做 2 分钟轻拉伸。',
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

export const challenges = [createChallenge('meditation'), createChallenge('stretch'), createChallenge('eye_yoga')];

function buildDaysForDuration(scenario: VideoScenario, durationDays: number): Omit<ChallengeDay, 'status'>[] {
  const base = daySets[scenario].map(([title, microAction, why, graphNodeId, estimatedMinutes], index) => ({
    day: index + 1,
    title,
    microAction,
    why,
    howTo: howToByScenario[scenario],
    precautions: precautionsByScenario[scenario],
    graphNodeId,
    estimatedMinutes,
  }));
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
