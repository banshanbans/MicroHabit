import { VideoSource } from '../../shared/types';

export const videos: VideoSource[] = [
  {
    id: 'video_sedentary_001',
    source: 'demo',
    scenario: 'sedentary',
    title: '久坐 2 分钟肩颈舒展，缓解屏幕前的紧绷感',
    coverUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
    creatorName: '微光健康室',
    durationSec: 128,
    rawDescription: '适合通勤和办公室人群的低门槛肩颈舒展。',
  },
  {
    id: 'video_sleep_001',
    source: 'demo',
    scenario: 'sleep',
    title: '睡前 15 分钟，帮大脑进入休息状态',
    coverUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?auto=format&fit=crop&w=800&q=80',
    creatorName: '晚安练习册',
    durationSec: 96,
    rawDescription: '用一个简单睡前仪式替代无意识刷手机。',
  },
  {
    id: 'video_emotion_001',
    source: 'demo',
    scenario: 'emotion',
    title: '压力大的时候，用 60 秒呼吸把注意力拉回来',
    coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    creatorName: '柔软呼吸所',
    durationSec: 78,
    rawDescription: '适合日常压力场景的一分钟呼吸练习。',
  },
];
