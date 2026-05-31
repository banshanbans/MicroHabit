import { VideoScenario } from './types';

export interface DemoVideo {
  scenario: VideoScenario;
  videoId: string;
  title: string;
  shortTitle: string;
  description: string;
  durationLabel: string;
  videoUrl: string;
  coverUrl: string;
  keywords: string[];
  linkHints: string[];
  focusCopy: string;
  fallbackText: string;
}

export const demoVideos: Record<VideoScenario, DemoVideo> = {
  meditation: {
    scenario: 'meditation',
    videoId: 'video_meditation_001',
    title: '10 分钟提升专注力，放下焦虑的 0 基础冥想',
    shortTitle: '冥想训练',
    description: '5-10 分钟平复焦虑，找回专注',
    durationLabel: '约 10 分钟',
    videoUrl: '/demo-videos/meditation.mp4',
    coverUrl: '/seed-covers/meditation.jpg',
    keywords: ['冥想', '专注', '焦虑', '浮躁', '呼吸', '静坐', '白噪音', '放松', '情绪', 'meditation'],
    linkHints: ['meditation', 'mindfulness', 'breath'],
    focusCopy: '先完成一遍完整动作，把注意力重点放在当下状态和呼吸觉察。',
    fallbackText: '来不及的时候，先做 3 次自然呼吸。',
  },
  stretch: {
    scenario: 'stretch',
    videoId: 'video_stretch_001',
    title: '拉伸跟练：扣膝转体、背部拉伸和侧向拉伸',
    shortTitle: '拉伸',
    description: '每天 2 分钟，让身体从久坐里松开',
    durationLabel: '约 7 分钟',
    videoUrl: '/demo-videos/stretch.mp4',
    coverUrl: '/seed-covers/stretch.jpg',
    keywords: ['拉伸', '久坐', '转体', '背部', '侧向', '肩背', '腰背', '身体', 'stretch'],
    linkHints: ['stretch', 'body', 'mobility'],
    focusCopy: '先完成一遍完整动作，把注意力重点放在对应身体区域。',
    fallbackText: '来不及的时候，选一个最轻的动作做 30 秒。',
  },
  eye_yoga: {
    scenario: 'eye_yoga',
    videoId: 'video_eye_yoga_001',
    title: '每天 2 分钟眼部瑜伽，眼周放松跟练',
    shortTitle: '眼部瑜伽',
    description: '屏幕后放松眼周，缓解疲劳感',
    durationLabel: '约 2 分钟',
    videoUrl: '/demo-videos/eye-yoga.mp4',
    coverUrl: '/seed-covers/eye-yoga.jpg',
    keywords: ['眼部瑜伽', '护眼', '眼周', '大眼', '肿眼泡', '星星眼', '眨眼', '远眺', '屏幕', 'eye'],
    linkHints: ['eye', 'yoga', 'eyes'],
    focusCopy: '先完成一遍完整动作，把注意力重点放在屏幕后眼周放松。',
    fallbackText: '来不及的时候，先远眺 20 秒，再自然眨眼 5 次。',
  },
};

export const demoVideoList = [demoVideos.meditation, demoVideos.stretch, demoVideos.eye_yoga];

export function getDemoVideoByScenario(scenario: VideoScenario) {
  return demoVideos[scenario];
}

export function getDemoVideoByVideoId(videoId?: string) {
  return demoVideoList.find((video) => video.videoId === videoId);
}

export function getDemoVideoForChallenge({
  videoId,
  graphId,
  title,
}: {
  videoId?: string;
  graphId?: string;
  title?: string;
}) {
  const exact = getDemoVideoByVideoId(videoId);
  if (exact) return exact;
  return matchDemoVideo([videoId, graphId, title].filter(Boolean).join(' ')).video;
}

export function extractFirstUrl(input: string) {
  const match = input.match(/https?:\/\/[^\s，。！？；、)）】」]+/i);
  return match?.[0] ?? '';
}

export function matchDemoVideo(input: string) {
  const text = input.toLowerCase();
  const extractedUrl = extractFirstUrl(input);
  const linkText = extractedUrl.toLowerCase();
  const linkMatch = demoVideoList.find((video) => video.linkHints.some((hint) => linkText.includes(hint)));
  if (linkMatch) return { video: linkMatch, extractedUrl };

  let best = { video: null as DemoVideo | null, score: 0 };
  for (const video of demoVideoList) {
    const score = video.keywords.reduce((total, keyword) => total + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0);
    if (score > best.score) best = { video, score };
  }

  return { video: best.video, extractedUrl };
}
