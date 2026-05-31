import { VideoSource } from '../../shared/types';

export const videos: VideoSource[] = [
  {
    id: 'video_meditation_001',
    source: 'demo',
    scenario: 'meditation',
    title: '10 分钟提升专注力，放下焦虑的 0 基础冥想',
    coverUrl: '/seed-covers/meditation.jpg',
    creatorName: '微光冥想室',
    durationSec: 686,
    rawDescription: '室内静坐冥想，包含呼吸和身体觉察引导，适合被拆成低门槛专注恢复路径。',
  },
  {
    id: 'video_stretch_001',
    source: 'demo',
    scenario: 'stretch',
    title: '拉伸跟练：扣膝转体、背部拉伸和侧向拉伸',
    coverUrl: '/seed-covers/stretch.jpg',
    creatorName: '大璐拉伸',
    durationSec: 418,
    rawDescription: '跟练式全身拉伸，关键动作包含扣膝转体、伏地背部拉伸、侧向拉伸加转体。',
  },
  {
    id: 'video_eye_yoga_001',
    source: 'demo',
    scenario: 'eye_yoga',
    title: '每天 2 分钟眼部瑜伽，眼周放松跟练',
    coverUrl: '/seed-covers/eye-yoga.jpg',
    creatorName: '眼周放松练习',
    durationSec: 158,
    rawDescription: '带计时的眼部瑜伽跟练，包含眉眼周围按压和放松动作，适合屏幕后做一次轻恢复。',
  },
];
