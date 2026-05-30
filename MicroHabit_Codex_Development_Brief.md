# MicroHabit 健康图谱挑战 - Codex 开发 Brief

> 用途：把本文件放到项目根目录，交给 Codex / AI Coding Agent 作为开发说明。
> 项目目标：基于 React 实现一个可演示的 MicroHabit Demo：把精选健康视频重构成可点亮的微行动健康图谱。

---

## 0. 项目定位

MicroHabit 是一个面向年轻用户的健康微习惯挑战 Demo 产品。

一句话定位：

**把精选健康视频，变成可点亮的 7 天微行动健康图谱。**

它不是普通打卡 App，也不是普通视频总结工具。

核心表达：

1. 用户粘贴一条健康视频链接。
2. AI 模拟分析视频内容。
3. 系统提取健康主题、核心微行动、适用场景、注意事项和风险判断。
4. 系统生成一张轻量健康图谱。
5. 用户选择 7 / 15 / 21 天挑战。
6. 用户每天完成一个微行动。
7. 每完成一次，点亮一个图谱节点。
8. 挑战结束后生成复盘报告、徽章、积分和下一个挑战推荐。

Demo 阶段不需要真实接入抖音，不需要真实 AI 后端，不需要真实健康数据库。所有 AI、图谱、打卡、复盘、奖励均使用 mock 数据和前端动效模拟。

---

## 1. 技术栈要求

必须使用：

- React
- TypeScript
- Vite

推荐使用：

- React Router：页面路由
- TanStack Query：请求、缓存、loading、error 状态
- Zustand：本地流程状态、当前场景、选中节点、动效状态
- Tailwind CSS：样式
- Motion for React / Framer Motion：动效
- MSW 或本地 mock service：模拟 API
- React Flow 或自定义 SVG：健康图谱渲染

如果为了快速 Demo，可以不用真实 React Flow，先用自定义 SVG / absolute positioned nodes 实现固定布局图谱。

---

## 2. Demo 目标

请优先实现一个完整、流畅、可现场展示的移动端 Web Demo。

优先移动端 390px 宽度体验，同时桌面浏览器中居中展示手机尺寸容器。

Demo 主链路：

```text
首页
→ AI 分析中
→ 视频解析结果
→ 健康图谱预览
→ 挑战周期选择
→ 执行计划确认
→ 挑战生成
→ 今日行动
→ 节点点亮反馈
→ 我的挑战
→ 7 天复盘报告
```

核心不是做很多功能，而是让这个闭环看起来完整、可信、有趣。

---

## 3. 视觉方向

整体气质：

```text
年轻、轻健康、有呼吸感、温柔、有趣、稍微游戏化，但不要像重度游戏。
```

关键词：

- health graph
- micro habit
- playful wellness
- soft gamification
- glowing nodes
- AI coach
- progress map
- Gen Z
- light mint
- warm coral
- cream white
- soft blue
- rounded cards
- cute but clean

不要做成：

- 严肃医疗 App
- 高压健身 App
- 传统打卡工具
- 复杂学习平台
- 过度游戏化任务系统

建议视觉元素：

1. 轻量健康图谱：中心主题节点 + 周围知识节点 / 行动节点 / 复盘节点。
2. 节点点亮动效：灰色节点变成绿色 / 珊瑚色 / 暖黄色发光节点。
3. 微光积分：用小光点、星尘、能量豆表现，不要太夸张。
4. 角色陪伴：可以有一个小小的健康伙伴形象，例如「小芽」「Glow Buddy」「微光兔」，但不要抢主视觉。
5. 今日任务卡片：像一张轻便任务卡，不要像医疗处方。
6. AI 分析：用分阶段点亮，而不是普通 loading spinner。
7. 复盘报告：像故事总结，不像成绩单。

---

## 4. 信息架构与路由

建议路由：

```text
/                         HomePage
/analyzing/:videoId        AnalyzingPage
/result/:analysisId        AnalysisResultPage
/graph/:graphId            GraphPreviewPage
/challenge/new/:graphId    ChallengeCreatePage
/challenge/setup/:id       ChallengeSetupPage
/challenge/plan/:id        ChallengePlanPage
/challenge/:id/today       TodayActionPage
/checkin/success/:id       CheckinSuccessPage
/challenges                ChallengeListPage
/report/:challengeId       ReportPage
/profile                   ProfilePage，可选
```

如果实现时间紧，可以用单页 state 切换模拟路由，但 URL 路由更好。

---

## 5. 页面需求

### 5.1 首页 HomePage

目标：让用户明白“粘贴健康视频链接 → 生成微习惯挑战”。

页面内容：

- Logo：MicroHabit
- 标语：把健康视频，变成 7 天微习惯挑战
- 副标题：粘贴一条健康视频链接，AI 会帮你提取微行动、生成健康图谱，并陪你一点点点亮。
- 输入框 placeholder：粘贴抖音健康视频链接
- 主按钮：开始解析
- 辅助按钮：试试看 Demo 视频
- 三个 Demo 场景卡片：
  - 久坐舒展，推荐主 Demo
  - 睡眠修复
  - 情绪放松

交互：

- 点击“开始解析”或 Demo 场景后进入 `/analyzing/:videoId`
- 默认 demo 使用久坐舒展场景

---

### 5.2 AI 分析中 AnalyzingPage

目标：模拟 AI 正在把视频重构成健康行动系统。

页面文案：

- 标题：正在把视频拆成可以执行的小行动...
- 副标题：这一步会识别视频里的健康知识、动作建议、适用场景和注意事项。

分析阶段：

1. 正在读取视频信息
2. 正在识别健康主题
3. 正在提取微行动
4. 正在检查内容风险
5. 正在生成健康图谱

交互：

- 每 500-800ms 点亮一个阶段。
- 2-4 秒后自动跳转到 `/result/:analysisId`。
- 阶段点亮需要有小圆点、连接线或微光动画。

---

### 5.3 视频解析结果 AnalysisResultPage

目标：把视频从“内容”变成“一个可以执行的微行动”。

页面结构：

1. 视频主题卡
2. 核心微行动卡
3. 为什么值得做
4. 行动要点
5. 使用场景
6. 注意事项
7. 内容可信度 / 风险判断
8. 主按钮：查看健康图谱

久坐舒展示例：

- 主题：通勤与办公久坐改善
- 核心微行动：每天做 2 分钟肩颈舒展
- 为什么值得做：它能帮助你从长时间屏幕姿势中短暂抽离，缓解肩颈紧绷，并建立“坐久了就活动一下”的身体提醒。
- 行动要点：
  - 动作幅度要小，不追求拉到最深
  - 保持自然呼吸
  - 出现疼痛时立刻停止
- 使用场景：
  - 上午打开电脑前
  - 午饭后回到工位
  - 下午感觉肩颈紧绷时
- 风险提示：
  - 适合日常健康习惯
  - 颈椎疾病、急性疼痛、眩晕人群应谨慎

点击主按钮进入 `/graph/:graphId`

---

### 5.4 健康图谱预览 GraphPreviewPage

目标：展示这条视频被重构成可点亮路径。

页面文案：

- 标题：你的健康图谱已生成
- 副标题：这不是一张总结卡，而是你接下来要点亮的健康路径。

图谱结构：

- 1 个主题节点
- 3-6 个知识节点
- 3-6 个行动节点
- 1 个复盘节点

节点状态：

- locked：锁定 / 灰色
- available：可开始 / 半亮
- active：当前节点 / 发光
- completed：已点亮

交互：

- 点击节点打开底部抽屉，显示节点说明。
- 底部按钮：选择挑战周期
- 点击进入 `/challenge/new/:graphId`

视觉：

- 中心节点大一些
- 行动节点颜色更明亮
- 知识节点颜色更柔和
- 复盘节点像一个终点徽章
- 可以加入小光线连接节点

---

### 5.5 挑战周期选择 ChallengeCreatePage

页面文案：

- 标题：你想用多久点亮这个习惯？
- 副标题：第一次建议从 7 天开始，先建立一个不费力的开始。

选项：

1. 7 天：轻量启动，默认选中
2. 15 天：稳定练习
3. 21 天：习惯养成

主按钮：

- 生成我的挑战

点击后进入 `/challenge/setup/:id`

---

### 5.6 执行计划确认 ChallengeSetupPage

目标：让用户提前想好时间、地点、备用方案，但不能像复杂表单。

页面文案：

- 标题：先替明天的你铺好路
- 副标题：提前想好时间、地点和可能的阻碍，会让一个微行动更容易真的发生。你可以简单填一下，也可以直接跳过。

输入方式：

- 自然语言输入框：
  - placeholder：例如：我想每天午饭后，在工位做 2 分钟肩颈舒展。
- 快捷 chips：
  - 时间：睡前、午饭后、下班后、早起后
  - 地点：卧室、办公室、通勤路上、书桌前
  - 提醒风格：温柔陪伴、清爽教练、轻松吐槽、极简提醒

备用方案卡：

- 如果今天做不到 2 分钟，就做 30 秒，也算完成。

按钮：

- 主按钮：帮我安排好
- 次按钮：先轻松开始

点击后进入 `/challenge/plan/:id`

---

### 5.7 挑战生成 ChallengePlanPage

目标：展示系统生成的 7 天挑战。

页面结构：

- 挑战标题
- 来源视频主题
- 周期：7 天
- 每日任务时间线
- 当前进度：0 / 7
- 主按钮：开始 Day 1
- 次按钮：先保存到我的挑战

久坐舒展 7 天计划：

1. Day 1：坐姿观察，点亮「久坐风险」
2. Day 2：颈部拉伸，点亮「颈部拉伸」
3. Day 3：肩背放松，点亮「肩背放松」
4. Day 4：腰背激活，点亮「腰背激活」
5. Day 5：眼部休息，点亮「眼部休息」
6. Day 6：呼吸调节，点亮「呼吸调节」
7. Day 7：久坐复盘，点亮「久坐复盘」

点击开始进入 `/challenge/:id/today`

---

### 5.8 今日行动 TodayActionPage

目标：一个页面只强调一个今日微行动。

页面结构：

- 今日节点
- 今日微行动
- 为什么做
- 怎么做步骤
- 注意事项
- 主按钮：我完成了
- 次按钮：今天只做了 30 秒

示例 Day 2：

- 今日节点：颈部拉伸
- 今日微行动：坐直，缓慢左右转头各 5 次。
- 怎么做：
  1. 坐在椅子前 1/2 处
  2. 肩膀放松
  3. 转头时保持慢速
  4. 不要追求最大幅度
- 注意事项：如果出现疼痛、眩晕或明显不适，请停止。

点击完成进入 `/checkin/success/:id`

---

### 5.9 节点点亮 CheckinSuccessPage

目标：区别于普通打卡 App，强调“点亮了健康图谱节点”。

页面文案：

- 标题：你点亮了「颈部拉伸」
- 鼓励语：今天不是完成了一个任务，而是让身体记住了一次从屏幕前松开的感觉。
- 进度：2 / 7
- 奖励：+15 微光积分

视觉：

- 显示一个节点从灰色点亮
- 相邻节点出现微光连接
- 可以有小光点粒子动画

按钮：

- 查看挑战进度
- 明天继续
- 查看 7 天复盘，Demo 可直接跳转报告

---

### 5.10 我的挑战 ChallengeListPage

页面结构：

- 标题：我的健康图谱
- 正在进行
- 已保存
- 已完成

挑战卡字段：

- 挑战标题
- 来源视频主题
- 当前进度
- 已点亮节点数量
- 今日任务
- 状态标签

示例：

- 通勤久坐改善
- 来源：久坐肩颈舒展视频
- 进度：Day 3 / 7
- 已点亮：3 个节点
- 今日：肩背放松
- 状态：今日待完成

---

### 5.11 复盘报告 ReportPage

目标：把行动、节点和下一步推荐连接起来。

页面结构：

1. 完成总览
2. 点亮节点
3. 最稳定的执行场景
4. 容易中断的时刻
5. AI 鼓励反馈
6. 徽章与积分奖励
7. 下一步推荐

示例文案：

标题：

- 你完成了 7 天久坐舒展挑战

AI 复盘：

- 你最稳定完成的是午饭后的肩颈舒展，这说明固定场景比单纯提醒更适合你。下一轮可以继续保留这个动作，再尝试加入眼部休息或腰背激活。

徽章：

- 肩颈松弛练习生

积分：

- +120 微光积分

推荐：

- 继续 7 天久坐舒展
- 解锁「眼部休息」视频
- 切换到「睡眠修复」挑战
- 降级为每周轻提醒

---

## 6. Mock 数据模型

请在 `src/mocks/data` 中创建 mock 数据。

### 6.1 VideoSource

```ts
export type VideoScenario = 'sleep' | 'sedentary' | 'emotion';

export interface VideoSource {
  id: string;
  source: 'douyin' | 'demo';
  url?: string;
  scenario: VideoScenario;
  title: string;
  coverUrl: string;
  creatorName?: string;
  durationSec?: number;
  rawDescription?: string;
}
```

### 6.2 AnalysisResult

```ts
export interface AnalysisResult {
  id: string;
  videoId: string;
  scenario: VideoScenario;

  theme: string;
  summary: string;

  coreMicroAction: {
    title: string;
    description: string;
    estimatedMinutes: number;
  };

  whyWorthDoing: string;

  actionTips: string[];
  useCases: string[];
  precautions: string[];

  risk: RiskAssessment;

  graphId: string;
  recommendedDuration: ChallengeDuration;
}
```

### 6.3 RiskAssessment

```ts
export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskAssessment {
  level: RiskLevel;
  label: string;
  message: string;
  reasons: string[];
  allowedToGenerateChallenge: boolean;
  saferAlternative?: string;
}
```

### 6.4 HealthGraph

```ts
export interface HealthGraph {
  id: string;
  videoId: string;
  title: string;
  description: string;
  nodes: HealthGraphNode[];
  edges: HealthGraphEdge[];
  progress: {
    totalNodes: number;
    completedNodes: number;
  };
}

export interface HealthGraphNode {
  id: string;
  type: 'topic' | 'knowledge' | 'action' | 'reflection' | 'reward';
  title: string;
  description: string;
  status: 'locked' | 'available' | 'active' | 'completed';
  position: {
    x: number;
    y: number;
  };
  linkedDay?: number;
}

export interface HealthGraphEdge {
  id: string;
  source: string;
  target: string;
  status: 'inactive' | 'active' | 'completed';
}
```

### 6.5 Challenge

```ts
export type ChallengeDuration = 7 | 15 | 21;

export type ChallengeStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'saved';

export interface Challenge {
  id: string;
  graphId: string;
  videoId: string;

  title: string;
  durationDays: ChallengeDuration;
  status: ChallengeStatus;

  currentDay: number;
  startedAt?: string;
  completedAt?: string;

  plan: ExecutionPlan;
  days: ChallengeDay[];

  progress: {
    completedDays: number;
    totalDays: number;
    completedNodeIds: string[];
  };
}

export interface ExecutionPlan {
  preferredTime?: string;
  preferredPlace?: string;
  reminderStyle?: 'gentle' | 'coach' | 'minimal' | 'funny';
  naturalLanguagePlan?: string;
  fallbackPlan: string;
}

export interface ChallengeDay {
  day: number;
  title: string;
  microAction: string;
  why: string;
  howTo: string[];
  precautions: string[];
  graphNodeId: string;
  estimatedMinutes: number;
  status: 'locked' | 'today' | 'completed' | 'missed';
}
```

### 6.6 Checkin

```ts
export interface Checkin {
  id: string;
  challengeId: string;
  day: number;
  graphNodeId: string;

  completedType: 'full' | 'tiny';
  optionalNote?: string;

  encouragement: string;
  createdAt: string;
}
```

### 6.7 ReviewReport

```ts
export interface ReviewReport {
  id: string;
  challengeId: string;

  title: string;
  completedDays: number;
  totalDays: number;

  completedNodes: {
    id: string;
    title: string;
    type: string;
  }[];

  strongestExecutionScene: string;
  easiestAction: string;
  interruptionMoment?: string;

  aiFeedback: string;

  reward: {
    badgeName: string;
    badgeDescription: string;
    points: number;
    skinUnlocked?: string;
  };

  nextRecommendations: Recommendation[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'continue' | 'related_video' | 'related_node' | 'light_reminder';
}
```

---

## 7. 三套 Demo Scenario

请至少实现 3 套 mock scenario。

### 7.1 sedentary 主 Demo

视频标题：

- 久坐 2 分钟肩颈舒展，缓解屏幕前的紧绷感

主题：

- 通勤与办公久坐改善

核心微行动：

- 每天做 2 分钟肩颈舒展

图谱节点：

- 中心主题：通勤久坐改善
- 知识：久坐风险、坐姿观察
- 行动：颈部拉伸、肩背放松、腰背激活、眼部休息、呼吸调节
- 复盘：久坐复盘

徽章：

- 肩颈松弛练习生

---

### 7.2 sleep Demo

视频标题：

- 睡前 15 分钟，帮大脑进入休息状态

主题：

- 睡眠修复

核心微行动：

- 睡前 15 分钟放下手机

图谱节点：

- 睡眠观察
- 蓝光影响
- 入睡仪式
- 固定作息
- 咖啡因影响
- 情绪放松
- 睡眠复盘

徽章：

- 睡前降噪者

---

### 7.3 emotion Demo

视频标题：

- 压力大的时候，用 60 秒呼吸把注意力拉回来

主题：

- 情绪放松

核心微行动：

- 每天固定 1 分钟呼吸

图谱节点：

- 情绪觉察
- 呼吸节奏
- 注意力锚点
- 身体扫描
- 睡前放松
- 压力场景
- 情绪复盘

风险提示：

- 该内容适合日常放松，不替代专业心理咨询或医疗建议。

徽章：

- 呼吸找回者

---

## 8. API Contract

即使使用 mock，也请保持 API 调用形式，方便未来替换真实后端。

### 8.1 解析视频

```http
POST /api/videos/parse
```

Request:

```json
{
  "url": "https://v.douyin.com/demo"
}
```

Response:

```json
{
  "videoId": "video_sedentary_001",
  "source": "demo",
  "scenario": "sedentary",
  "title": "久坐 2 分钟肩颈舒展，缓解屏幕前的紧绷感"
}
```

### 8.2 启动 AI 分析

```http
POST /api/analysis
```

Request:

```json
{
  "videoId": "video_sedentary_001"
}
```

Response:

```json
{
  "analysisId": "analysis_sedentary_001",
  "status": "completed"
}
```

### 8.3 获取分析结果

```http
GET /api/analysis/:analysisId
```

### 8.4 获取健康图谱

```http
GET /api/graphs/:graphId
```

### 8.5 创建挑战

```http
POST /api/challenges
```

Request:

```json
{
  "graphId": "graph_sedentary_001",
  "durationDays": 7,
  "plan": {
    "preferredTime": "午饭后",
    "preferredPlace": "办公室",
    "naturalLanguagePlan": "我想每天午饭后在工位做 2 分钟肩颈舒展。"
  }
}
```

Response:

```json
{
  "challengeId": "challenge_sedentary_7d_001"
}
```

### 8.6 获取挑战

```http
GET /api/challenges/:challengeId
```

### 8.7 完成今日行动

```http
POST /api/checkins
```

Request:

```json
{
  "challengeId": "challenge_sedentary_7d_001",
  "day": 2,
  "completedType": "tiny",
  "optionalNote": "今天只做了 30 秒"
}
```

Response:

```json
{
  "checkinId": "checkin_001",
  "litNodeId": "node_neck_stretch",
  "encouragement": "今天不是完成了一个任务，而是让身体记住了一次从屏幕前松开的感觉。",
  "progress": {
    "completedDays": 2,
    "totalDays": 7
  }
}
```

### 8.8 获取复盘报告

```http
GET /api/reports/:challengeId
```

---

## 9. 推荐项目目录

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   ├── providers.tsx
│   └── queryClient.ts
│
├── pages/
│   ├── HomePage.tsx
│   ├── AnalyzingPage.tsx
│   ├── AnalysisResultPage.tsx
│   ├── GraphPreviewPage.tsx
│   ├── ChallengeCreatePage.tsx
│   ├── ChallengeSetupPage.tsx
│   ├── ChallengePlanPage.tsx
│   ├── TodayActionPage.tsx
│   ├── CheckinSuccessPage.tsx
│   ├── ChallengeListPage.tsx
│   ├── ReportPage.tsx
│   └── ProfilePage.tsx
│
├── features/
│   ├── video-intake/
│   ├── ai-analysis/
│   ├── risk-guard/
│   ├── health-graph/
│   ├── challenge/
│   ├── checkin/
│   ├── report/
│   ├── reward/
│   └── recommendation/
│
├── entities/
│   ├── video/
│   ├── analysis/
│   ├── graph/
│   ├── challenge/
│   ├── checkin/
│   ├── report/
│   └── reward/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   ├── styles/
│   └── types/
│
├── mocks/
│   ├── browser.ts
│   ├── handlers.ts
│   ├── data/
│   │   ├── videos.mock.ts
│   │   ├── analysis.mock.ts
│   │   ├── graphs.mock.ts
│   │   ├── challenges.mock.ts
│   │   ├── checkins.mock.ts
│   │   ├── reports.mock.ts
│   │   └── rewards.mock.ts
│   └── scenarios/
│       ├── sedentary.scenario.ts
│       ├── sleep.scenario.ts
│       └── emotion.scenario.ts
│
└── main.tsx
```

---

## 10. 组件建议

基础组件：

```text
PageShell
MobileFrame
Button
Card
Badge
ProgressBar
Stepper
BottomSheet
Toast
Tabs
NodeBadge
GlowOrb
```

业务组件：

```text
VideoPasteInput
DemoScenarioCard
AnalysisStageTimeline
AnalysisResultCard
RiskNoticeCard
HealthGraphCanvas
HealthGraphNode
NodeDetailDrawer
DurationSelector
ExecutionPlanCoach
ChallengeDayTimeline
TodayActionCard
NodeLightUpAnimation
ChallengeCard
ReviewReportCard
RewardBadgeCard
RecommendationCard
```

---

## 11. 关键动效

请重点实现以下动效：

1. AI 分析阶段逐个点亮。
2. 健康图谱节点 hover / tap 发光。
3. 打卡成功后节点从灰色变亮。
4. 图谱边线出现微光流动。
5. 复盘报告生成时卡片依次进入。
6. 徽章获得时轻微弹出。
7. 微光积分增加时显示 +15 / +120。

动效原则：

- 轻，不要太花。
- 柔和，不要像游戏爆炸特效。
- 节点点亮是核心视觉反馈。

---

## 12. 文案语气

AI 教练语气：

- 温柔
- 有陪伴感
- 鼓励用户降低门槛
- 不制造焦虑
- 不做医疗承诺

示例文案：

```text
今天不是完成了一个任务，而是让身体记住了一次从屏幕前松开的感觉。
```

```text
做不到完整 2 分钟也没关系，30 秒也是一次有效的开始。
```

```text
这不是一张总结卡，而是你接下来要点亮的健康路径。
```

```text
先替明天的你铺好路。
```

---

## 13. 风险提示原则

健康内容必须有边界感。

低风险：

```text
适合日常健康习惯
```

中风险：

```text
请把它当作日常放松建议，而不是诊断或治疗方案。若你有持续疼痛、眩晕、睡眠障碍或明显情绪困扰，请优先寻求专业帮助。
```

不要出现：

- 保证治疗
- 治愈疾病
- 夸大效果
- 替代医生建议

---

## 14. 开发优先级

### P0 必须完成

```text
React + Vite + TypeScript 项目
移动端容器
首页
AI 分析中页
解析结果页
健康图谱页
挑战周期选择页
执行计划确认页
挑战计划页
今日行动页
节点点亮反馈页
复盘报告页
sedentary 主 Demo 数据
基础动效
```

### P1 建议完成

```text
sleep / emotion 两套 Demo 场景
我的挑战列表
徽章和积分
角色陪伴入口
风险提示中风险案例
节点详情抽屉
```

### P2 可选

```text
真实 API 替换
登录
通知提醒
真实视频解析
更复杂图谱布局
```

---

## 15. 实现建议

1. 先搭页面骨架和路由。
2. 再写 mock 数据。
3. 再接 mock service。
4. 再做主链路。
5. 最后打磨视觉和动效。

不要一开始写复杂后端。

Demo 成败关键：

```text
是否能让用户感受到：
健康视频不是被总结，而是被重构成了一条可以点亮的行动路径。
```

---

## 16. 验收标准

完成后，应该可以在浏览器中演示：

1. 首页点击 Demo 视频。
2. 进入 AI 分析动效。
3. 看到 AI 解析结果。
4. 看到健康图谱。
5. 选择 7 天挑战。
6. 确认执行计划。
7. 查看 7 天计划。
8. 完成今日行动。
9. 看到节点点亮。
10. 查看复盘报告。
11. 获得徽章和微光积分。
12. 看到下一步推荐。

整体体验要像一个完整产品，而不是静态页面集合。

---

## 17. 可选：Stitch / 原型工具关键词

如果需要生成 UI 原型，请使用这些关键词：

```text
Gen Z playful wellness app, mobile first, soft mint and cream background, glowing health graph, micro habit challenge, AI coach, rounded cards, soft shadows, cute but minimal companion character, node lighting animation, calm but fun, not medical, not fitness hardcore, gentle gamification
```

---

## 18. 最终产品表达

MicroHabit 的核心不是打卡，而是：

```text
视频健康知识图谱化 + 微行动挑战 + 节点点亮反馈。
```

用户每完成一个行动，不只是完成一次打卡，而是在点亮一个从视频中提取出来的健康知识节点。

最终表达：

**MicroHabit 把健康视频里的“知道了”，转化成用户生活里真的发生过的小改变。**
