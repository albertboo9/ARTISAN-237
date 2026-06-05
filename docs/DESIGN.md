---
name: Artisan Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#5c5f61'
  on-tertiary: '#ffffff'
  tertiary-container: '#a0a3a5'
  on-tertiary-container: '#36393b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.01em
  mono-label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  bento-gap: 16px
---

## Brand & Style

This design system embodies "Soft-Futurism," a philosophy that marries the high-precision engineering of modern SaaS with a human-centric, tactile elegance. It is designed to bridge the gap between elite technology and traditional craftsmanship in the Cameroonian market. 

The aesthetic is defined by **Elite Minimalism**—drawing inspiration from the clarity of Apple and the structural rigor of Linear. The interface should feel expensive yet approachable, utilizing vast whitespace, ultra-thin hairlines, and subtle glassmorphism to create a sense of layered depth. The emotional goal is to evoke unwavering trust, professional excellence, and the feeling of a premium concierge service.

## Colors

The palette is anchored by **Emerald Green**, used strategically as a signal for trust, success, and artisan growth. This is balanced against **Slate Grey**, which provides the structural "ink" for the system—used for typography and deep interactive states.

- **Primary (Emerald):** Reserved for high-value actions, success indicators, and "Match" percentages.
- **Neutral (Slate/White):** The foundation of the UI. Backgrounds should remain Pure White to maintain an airy, high-end feel.
- **Glass/Translucency:** Used for floating navigation and overlay panels to maintain context and depth.

## Typography

This design system utilizes **Inter** exclusively to achieve a systematic, utilitarian aesthetic that remains highly legible across all device tiers. 

The typographic hierarchy relies on tight letter spacing for large displays to create a "compact-premium" look, while body copy maintains generous line height (1.6) for readability. Labels and "Match" tags use a slightly heavier weight and increased tracking to differentiate functional data from editorial content.

## Layout & Spacing

The system employs a **Rigid Grid Architecture**. Dashboards utilize a **Bento Grid** model, where content is compartmentalized into cards of varying sizes that snap to a 12-column layout. 

Spacing is governed by a 4px base unit. Margins are generous to prevent visual clutter, ensuring that even data-heavy artisan profiles feel "breathable." The layout should transition from a single-column stack on mobile to a multi-tiered bento arrangement on desktop, maintaining consistent 16px or 24px gaps (gutters) between all cards.

## Elevation & Depth

Depth in this design system is achieved through **Ambient Diffusion** rather than harsh shadows. 

1.  **Ultra-Fine Borders:** Use 1px or 0.5px strokes in a light slate tint (`#E2E8F0`) to define boundaries.
2.  **Glassmorphism:** Navigation bars and "Command Bar" overlays should use a `20px` backdrop blur with a `70%` white opacity.
3.  **Soft Shadows:** Use multi-layered, low-opacity shadows (e.g., `y: 4px, blur: 20px, color: rgba(30, 41, 59, 0.05)`) to lift primary cards off the white background.
4.  **Tonal Layering:** Use Slate Grey at very low opacities (2-4%) for subtle section nesting within bento cards.

## Shapes

The shape language is **Refined-Rounded**. A radius of 0.5rem (8px) is the standard for most components, providing a modern, friendly feel that isn't overly "bubbly." 

Large containers and bento cards should scale up to `rounded-xl` (24px) to create a soft outer frame. Buttons and input fields follow the standard `rounded-lg` (16px) to maintain a tactile, easy-to-tap appearance. Small tags, such as "Match 98%," use a pill-shape to distinguish them as discrete status indicators.

## Components

- **Bento Cards:** High-level containers with subtle 1px borders and soft shadows. Use these for artisan stats, portfolios, and XP tracking.
- **Command Bar:** A centered, floating search interface using glassmorphism and `Inter` medium for quick artisan discovery.
- **Match Tags:** Discrete pill badges using a light Emerald background (`#D1FAE5`) and Emerald text. Often accompanied by a small "Sparkle" or "AI" icon.
- **Steppers:** Minimalist linear indicators for onboarding artisans. Use a fine 2px line that fills with Emerald as steps are completed.
- **Gamification Badges:** Geometric shapes (Hexagons or Diamonds) that house XP levels. Use Slate for base levels and Emerald for "Elite" status.
- **Buttons:** 
    - *Primary:* Solid Emerald with white text, no gradient.
    - *Secondary:* White background, 1px Slate border, Slate text.
- **Input Fields:** Large, clean fields with 16px padding. On focus, the border transitions from light Slate to Emerald with a soft outer glow.