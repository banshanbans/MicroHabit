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
  sedentary: {
    id: 'graph_sedentary_001',
    videoId: 'video_sedentary_001',
    title: '通勤久坐改善',
    description: '从观察久坐开始，逐步点亮肩颈、腰背、眼部和呼吸节点。',
    nodes: [
      node('node_sedentary_topic', 'topic', '通勤久坐改善', '这条路径把久坐提醒变成 7 天微行动。', 50, 50, undefined, 'active'),
      node('node_sedentary_risk', 'knowledge', '久坐风险', '认识长时间不动带来的紧绷和疲惫。', 26, 20, 1),
      node('node_posture_observe', 'knowledge', '坐姿观察', '先观察肩膀、脖子和屏幕距离。', 70, 20, undefined, 'available'),
      node('node_neck_stretch', 'action', '颈部拉伸', '坐直，缓慢左右转头各 5 次。', 78, 42, 2),
      node('node_shoulder_release', 'action', '肩背放松', '肩膀向后绕圈，让上背部松开。', 72, 66, 3),
      node('node_back_activate', 'action', '腰背激活', '站起后轻轻后伸，提醒腰背参与。', 50, 80, 4),
      node('node_eye_rest', 'action', '眼部休息', '看向远处 20 秒，给眼睛一次切换。', 22, 66, 5),
      node('node_breath_adjust', 'action', '呼吸调节', '三轮自然呼吸，让动作收尾。', 16, 42, 6),
      node('node_sedentary_review', 'reflection', '久坐复盘', '回看哪一个场景最容易发生。', 50, 18, 7, 'locked'),
    ],
    edges: [
      { id: 'e1', source: 'node_sedentary_topic', target: 'node_sedentary_risk', status: 'completed' },
      { id: 'e2', source: 'node_sedentary_topic', target: 'node_posture_observe', status: 'completed' },
      { id: 'e3', source: 'node_sedentary_topic', target: 'node_neck_stretch', status: 'active' },
      { id: 'e4', source: 'node_sedentary_topic', target: 'node_shoulder_release', status: 'inactive' },
      { id: 'e5', source: 'node_sedentary_topic', target: 'node_back_activate', status: 'inactive' },
      { id: 'e6', source: 'node_sedentary_topic', target: 'node_eye_rest', status: 'inactive' },
      { id: 'e7', source: 'node_sedentary_topic', target: 'node_breath_adjust', status: 'inactive' },
      { id: 'e8', source: 'node_sedentary_topic', target: 'node_sedentary_review', status: 'inactive' },
    ],
    progress: { totalNodes: 9, completedNodes: 2 },
  },
  sleep: {
    id: 'graph_sleep_001',
    videoId: 'video_sleep_001',
    title: '睡眠修复',
    description: '用睡前降噪、固定作息和入睡仪式点亮恢复路径。',
    nodes: [
      node('node_sleep_topic', 'topic', '睡眠修复', '把睡前 15 分钟变成温柔的结束仪式。', 50, 50, undefined, 'active'),
      node('node_sleep_observe', 'knowledge', '睡眠观察', '记录刷手机和入睡时间的关系。', 26, 20, 1),
      node('node_blue_light', 'knowledge', '蓝光影响', '减少睡前刺激输入。', 70, 20, 2),
      node('node_sleep_ritual', 'action', '入睡仪式', '固定一个轻动作告诉大脑可以休息。', 78, 45, 3),
      node('node_schedule', 'action', '固定作息', '给睡眠保留稳定入口。', 72, 70, 4),
      node('node_caffeine', 'knowledge', '咖啡因影响', '观察下午咖啡和夜间清醒的关系。', 50, 82, 5),
      node('node_emotion_relax', 'action', '情绪放松', '用轻呼吸收掉最后一段紧绷。', 22, 70, 6),
      node('node_sleep_review', 'reflection', '睡眠复盘', '找到最适合你的降噪动作。', 50, 16, 7, 'locked'),
    ],
    edges: [],
    progress: { totalNodes: 8, completedNodes: 2 },
  },
  emotion: {
    id: 'graph_emotion_001',
    videoId: 'video_emotion_001',
    title: '情绪放松',
    description: '把压力时刻拆成觉察、呼吸、锚点和复盘。',
    nodes: [
      node('node_emotion_topic', 'topic', '情绪放松', '用一分钟给压力留出缓冲。', 50, 50, undefined, 'active'),
      node('node_awareness', 'knowledge', '情绪觉察', '先发现压力正在升高。', 26, 20, 1),
      node('node_breath_rate', 'action', '呼吸节奏', '用自然节奏完成 3 次呼吸。', 70, 20, 2),
      node('node_attention_anchor', 'action', '注意力锚点', '把注意力放回脚底或手心。', 78, 45, 3),
      node('node_body_scan', 'action', '身体扫描', '从肩膀到手臂轻轻扫一遍。', 72, 70, 4),
      node('node_bed_relax', 'action', '睡前放松', '用低门槛动作结束一天。', 50, 82, 5),
      node('node_stress_scene', 'knowledge', '压力场景', '找到最常触发紧张的时刻。', 22, 70, 6),
      node('node_emotion_review', 'reflection', '情绪复盘', '保留对你最有效的锚点。', 50, 16, 7, 'locked'),
    ],
    edges: [],
    progress: { totalNodes: 8, completedNodes: 2 },
  },
};

for (const graph of Object.values(graphMap)) {
  if (graph.edges.length === 0) {
    graph.edges = graph.nodes.slice(1).map((n, i) => ({
      id: `${graph.id}_edge_${i}`,
      source: i === 0 ? graph.nodes[0].id : graph.nodes[i].id,
      target: n.id,
      status: i < 2 ? 'completed' : i === 2 ? 'active' : 'inactive',
    }));
  }
}

export const graphs = Object.values(graphMap);
