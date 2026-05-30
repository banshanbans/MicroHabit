---
name: MicroHabit
colors:
  surface: '#fdf9f0'
  surface-dim: '#dddad1'
  surface-bright: '#fdf9f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ea'
  surface-container: '#f1eee5'
  surface-container-high: '#ece8df'
  surface-container-highest: '#e6e2d9'
  on-surface: '#1c1c17'
  on-surface-variant: '#404945'
  inverse-surface: '#31312b'
  inverse-on-surface: '#f4f0e8'
  outline: '#717975'
  outline-variant: '#c0c8c3'
  surface-tint: '#3a6758'
  primary: '#3a6758'
  on-primary: '#ffffff'
  primary-container: '#a7d7c5'
  on-primary-container: '#325f51'
  inverse-primary: '#a1d1bf'
  secondary: '#855049'
  on-secondary: '#ffffff'
  secondary-container: '#feb8af'
  on-secondary-container: '#7a4640'
  tertiary: '#236678'
  on-tertiary: '#ffffff'
  tertiary-container: '#98d6ea'
  on-tertiary-container: '#175e6f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcedda'
  primary-fixed-dim: '#a1d1bf'
  on-primary-fixed: '#002118'
  on-primary-fixed-variant: '#214f41'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#fbb5ac'
  on-secondary-fixed: '#350f0b'
  on-secondary-fixed-variant: '#6a3933'
  tertiary-fixed: '#b1ecff'
  tertiary-fixed-dim: '#92d0e4'
  on-tertiary-fixed: '#001f27'
  on-tertiary-fixed-variant: '#004e5e'
  background: '#fdf9f0'
  on-background: '#1c1c17'
  surface-variant: '#e6e2d9'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 24px
  gutter-mobile: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style
The design system is centered on "Gentle Growth." It targets a Gen Z audience seeking wellness without the pressure of "hustle culture" or clinical intensity. The personality is nurturing, optimistic, and low-friction, utilizing a **Playful Minimalism** style mixed with **Soft Tactility**. 

The UI should feel like a safe, sun-drenched garden. We avoid harsh edges and high-stress alerts, opting instead for celebration and steady progress. The emotional response is one of "calm accomplishment"—making the smallest habit feel like a significant win.

## Colors
The palette is rooted in soft, organic tones that suggest nature and warmth.
- **Primary (Soft Mint):** Used for growth-related actions, completion states, and the primary "sprout" companion.
- **Secondary (Warm Coral):** Used for interactive elements needing attention and "energy" habits.
- **Tertiary (Light Blue):** Used for mindfulness, hydration, and restorative tasks.
- **Neutral (Cream White):** The base canvas. Avoid pure #FFFFFF to reduce eye strain and maintain a "paper-like" warmth.
- **Glow (Soft Yellow):** Reserved for achievement highlights, active nodes in the Health Graph, and background aura effects.

## Typography
We use **Plus Jakarta Sans** across all levels to maintain a friendly, modern, and open feel. Its rounded terminals complement the "soft" brand identity. 
- **Headlines:** Use Bold weights with tight letter spacing for a "hugged" feel.
- **Body:** Use Regular weights with generous line height to ensure readability and an "airy" sensation.
- **Labels:** Used for navigation and small metadata; these should remain legible but never feel clinical.

## Layout & Spacing
This design system follows a **Fluid Mobile-First** model optimized for a 390px width.
- **Margins:** A generous 24px side margin creates a "contained" and safe feeling for content.
- **The Health Graph:** Central layout feature using a non-linear, organic placement of nodes connected by thin (1px) curved strokes with 30% opacity.
- **Airy Rhythm:** Vertical spacing should prioritize breathing room. Use 40px gaps between major sections to prevent the interface from feeling "busy" or overwhelming.

## Elevation & Depth
Depth is achieved through **Tonal Layers** and **Ambient Shadows** rather than stark borders.
- **Surfaces:** Main content cards sit on the Cream White background. Use a subtle 10% opacity version of the primary or tertiary color for card backgrounds to suggest a "glow" from within.
- **Shadows:** Use extremely soft, long-spread shadows. `Box-shadow: 0 10px 30px rgba(0,0,0,0.04)`.
- **Gradients:** Use very subtle linear gradients (top-down) from white to the primary/secondary pastel to give cards a 3D "pillowy" volume.
- **The Health Graph:** Nodes should have a soft outer glow (`drop-shadow`) using the `accent_glow_hex` color to indicate they are "living" elements.

## Shapes
The shape language is dominated by high-radius curves.
- **Cards:** Standardized at a **24px corner radius** to evoke a friendly, pebble-like quality.
- **Buttons:** Fully pill-shaped (circular ends) to encourage tapping and reduce visual tension.
- **The Sprout Companion:** Character design should avoid sharp angles; use teardrop and organic circular forms.

## Components
- **Habit Cards:** 24px rounded corners. Include a progress "aura" (a soft gradient ring) behind the habit icon rather than a traditional linear progress bar.
- **Action Buttons:** Pill-shaped. Primary buttons use a gradient of Soft Mint to a slightly darker mint. Shadow depth increases by 2px on hover/active states to feel "squishy."
- **Health Graph Nodes:** Circular icons with a 4px "glow" border. Active nodes pulse slightly. Connecting lines are "S" curves, never straight lines.
- **Input Fields:** Soft Cream background with a 1px Mint border that only appears on focus. 16px rounded corners.
- **Selection Chips:** Use "Active" states where the chip transforms from a ghost outline to a solid Pastel Blue/Mint fill.
- **The Sprout:** A persistent floating action element or header mascot that reacts (tilts or glows) when the user completes a task.