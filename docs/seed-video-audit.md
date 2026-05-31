# Seed Video Audit

This note records the local review used to build MicroHabit seed analysis data. The original MP4 files stay outside the repository at `/Users/carrey/Downloads/MicroHabit(1)`.

## Method

- Used macOS AVFoundation to read duration and sample frames.
- Used Vision OCR on sampled frames to capture visible captions/action labels.
- Generated lightweight JPEG covers from real video frames into `public/seed-covers/`.

## Meditation

- Source file: `10分钟提升专注力放下焦虑...mp4`
- Duration: `685.6s`
- Visual read: indoor mat-based seated meditation; calm posture; breath/body awareness guidance.
- OCR evidence: `经过我们的身体`
- Product interpretation: everyday focus recovery and gentle body/breath awareness.
- Safety boundary: do not promise anxiety treatment; position as daily relaxation and attention reset.
- Cover: `public/seed-covers/meditation.jpg`

## Eye Yoga

- Source file: `每天2分钟，小眼变大眼...眼部瑜伽.mp4`
- Duration: `157.6s`
- Visual read: direct follow-along eye-area routine with timer; forehead/eyebrow/eye-area hand placements.
- OCR evidence: `那咱们直接开练！`, `把内双都练成外双了`, `都会觉得眼部这块很放松`
- Product interpretation: eye-area relaxation, blinking/near-screen recovery, and gentle screen-fatigue relief.
- Safety boundary: do not promise bigger eyes, double eyelids, or appearance change; reframe as eye-area comfort and relaxed expression.
- Cover: `public/seed-covers/eye-yoga.jpg`

## Stretch

- Source file: `拉伸.mp4`
- Duration: `417.6s`
- Visual read: follow-along stretch routine with full-body mat/bed movements and on-screen timers.
- OCR evidence: `扣膝+转体`, `伏地背部拉伸`, `侧向拉伸+转体`
- Product interpretation: low-pressure back, side-body, and twist-based mobility for sedentary recovery.
- Safety boundary: keep range small, stop for pain/dizziness, and avoid medical treatment claims.
- Cover: `public/seed-covers/stretch.jpg`
