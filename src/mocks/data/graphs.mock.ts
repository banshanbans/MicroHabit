import { HealthGraph, HealthGraphNode, VideoScenario } from '../../shared/types';

const node = (
  id: string,
  type: HealthGraphNode['type'],
  title: string,
  description: string,
  x: number,
  y: number,
  linkedDay?: number,
  status: HealthGraphNode['status'] = linkedDay && linkedDay > 2 ? 'locked' : linkedDay === 2 ? 'active' : 'completed',
): HealthGraphNode => ({ id, type, title, description, status, position: { x, y }, linkedDay });

const graphMap: Record<VideoScenario, HealthGraph> = {
  meditation: {
    id: 'graph_meditation_001',
    videoId: 'video_meditation_001',
    title: '专注微冥想',
    description: '从观察思绪开始，逐步点亮呼吸、身体觉察和专注重启节点。',
    nodes: [
      node('node_meditation_topic', 'topic', '专注微冥想', '把 10 分钟冥想拆成每天可完成的短练习。', 50, 50, undefined, 'active'),
      node('node_thought_observe', 'knowledge', '思绪观察', '先发现脑中正在出现的念头，不急着赶走。', 26, 20, 1),
      node('node_breath_anchor', 'action', '呼吸节奏', '观察 3 次自然吸气和呼气。', 70, 20, 2),
      node('node_attention_anchor', 'action', '注意力锚点', '把注意力轻轻放回身体或环境声音。', 78, 45, 3),
      node('node_body_awareness', 'action', '身体扫描', '从肩膀到腹部感受身体经过呼吸。', 72, 70, 4),
      node('node_focus_restart', 'action', '午后专注重启', '用 1 分钟冥想重新进入学习或工作。', 50, 82, 5),
      node('node_bedtime_meditation', 'action', '睡前放松', '睡前只保留 3 次自然呼吸。', 22, 70, 6),
      node('node_meditation_review', 'reflection', '冥想复盘', '记录最容易安静下来的场景。', 50, 16, 7, 'locked'),
    ],
    edges: [],
    progress: { totalNodes: 8, completedNodes: 2 },
  },
  stretch: {
    id: 'graph_stretch_001',
    videoId: 'video_stretch_001',
    title: '身体松弛拉伸',
    description: '从久坐风险开始，点亮转体、背部、侧向拉伸和呼吸收尾。',
    nodes: [
      node('node_stretch_topic', 'topic', '身体松弛拉伸', '把拉伸跟练拆成低压、短时、可复用的微行动。', 50, 50, undefined, 'active'),
      node('node_sedentary_risk', 'knowledge', '久坐风险', '认识长时间固定姿势带来的紧绷。', 26, 20, 1),
      node('node_knee_twist', 'action', '扣膝转体', '用小幅度转体让腰背从久坐里松开。', 70, 20, 2),
      node('node_back_stretch', 'action', '背部拉伸', '选择一个伏地或坐姿背部伸展。', 78, 45, 3),
      node('node_side_stretch', 'action', '侧向拉伸', '轻轻拉开身体侧面，不追求极限。', 72, 70, 4),
      node('node_shoulder_release', 'action', '肩背放松', '让肩膀和上背部从屏幕姿势里回位。', 50, 82, 5),
      node('node_breath_finish', 'action', '呼吸收尾', '用 3 轮自然呼吸结束拉伸。', 22, 70, 6),
      node('node_stretch_review', 'reflection', '拉伸复盘', '找到最适合你的低门槛拉伸动作。', 50, 16, 7, 'locked'),
    ],
    edges: [],
    progress: { totalNodes: 8, completedNodes: 2 },
  },
  eye_yoga: {
    id: 'graph_eye_yoga_001',
    videoId: 'video_eye_yoga_001',
    title: '护眼微行动',
    description: '从屏幕疲劳识别开始，点亮远眺、眨眼和眼周放松节点。',
    nodes: [
      node('node_eye_topic', 'topic', '护眼微行动', '把眼部瑜伽转成屏幕后的一分钟恢复。', 50, 50, undefined, 'active'),
      node('node_screen_fatigue', 'knowledge', '屏幕疲劳识别', '发现眼干、眯眼或眉眼紧绷的信号。', 26, 20, 1),
      node('node_far_gaze', 'action', '远眺 20 秒', '看向远处，让眼睛从近距离屏幕切换出来。', 70, 20, 2),
      node('node_blink_restore', 'action', '眨眼恢复', '自然眨眼 5 次，提醒眼睛补一次湿润。', 78, 45, 3),
      node('node_eye_area_relax', 'action', '眼周放松', '轻柔放松眉眼周围，不按压眼球。', 72, 70, 4),
      node('node_brow_release', 'action', '眉眼舒展', '放松额头和眉心，让表情慢慢松开。', 50, 82, 5),
      node('node_bedtime_eye_rest', 'action', '睡前眼部休息', '放下手机后给眼睛一个安静收尾。', 22, 70, 6),
      node('node_eye_review', 'reflection', '护眼复盘', '记录哪一种休息最容易发生。', 50, 16, 7, 'locked'),
    ],
    edges: [],
    progress: { totalNodes: 8, completedNodes: 2 },
  },
};

for (const graph of Object.values(graphMap)) {
  graph.edges = graph.nodes.slice(1).map((n, i) => ({
    id: `${graph.id}_edge_${i}`,
    source: i === 0 ? graph.nodes[0].id : graph.nodes[i].id,
    target: n.id,
    status: i < 2 ? 'completed' : i === 2 ? 'active' : 'inactive',
  }));
}

export const graphs = Object.values(graphMap);
