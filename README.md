# MicroHabit Demo

MicroHabit is a mobile-first wellness prototype that turns health video ideas into 7-day micro-action challenges, health graph progress, badges, points, and companion growth feedback.

The current demo focuses on a soft, playful wellness experience for habit formation:

- AI-style video analysis flow
- Health graph preview and node lighting
- 7-day challenge setup and daily actions
- Check-in success and review report screens
- Micro badge / companion growth center

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Framer Motion
- Lucide React

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```text
src/
  app/        App shell, router, query client, and flow store
  mocks/      Demo API handlers and scenario data
  pages/      Mobile prototype pages
  shared/     Shared components, types, and global styles
```

Prototype references are kept under:

```text
stitch_microhabit_wellness_prototype/
```

## Notes

- This is a demo prototype with local mock data.
- Runtime flow state is persisted in browser storage through Zustand.
- The app is designed around a 390px mobile viewport while still running in a desktop browser.
