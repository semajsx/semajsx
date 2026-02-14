/**
 * Apple-inspired design system for SemaJSX docs
 *
 * Design principles:
 * - Generous whitespace and breathing room
 * - Consistent Apple color palette (#0071e3, #1d1d1f, #6e6e73, #86868b)
 * - SF Pro-like typography with tight heading line-heights
 * - Frosted glass (vibrancy) effects
 * - Subtle micro-interactions and smooth cubic-bezier transitions
 * - Refined shadows and border treatments
 */
import { rule, rules, classes } from "semajsx/style";

const c = classes([
  // Layout
  "glassNav",
  "glassCard",
  "gradientBg",
  "heroBg",

  // Typography
  "heroTitle",
  "heroSubtitle",
  "sectionTitle",
  "sectionSubtitle",

  // Components
  "primaryButton",
  "secondaryButton",
  "featureCard",
  "docCard",
  "calloutCard",

  // Effects
  "smoothTransition",
  "hoverLift",
  "fadeIn",
]);

// ============================================
// Global Styles
// ============================================

export const globalStyles = rules(
  // System font stack (SF Pro-like)
  rule`:root {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }`,

  // Smooth scrolling
  rule`html {
    scroll-behavior: smooth;
  }`,

  // Body background
  rule`body {
    background: #fbfbfd;
    color: #1d1d1f;
  }`,

  // Selection color
  rule`::selection {
    background: rgba(0, 113, 227, 0.2);
    color: #1d1d1f;
  }`,
);

// ============================================
// Frosted Glass Effects
// ============================================

export const glassNav = rule`${c.glassNav} {
  background: rgba(251, 251, 253, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
}`;

export const glassCard = rule`${c.glassCard} {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 0.5px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}`;

// ============================================
// Gradient Backgrounds
// ============================================

export const gradientBg = rule`${c.gradientBg} {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}`;

export const heroBg = rule`${c.heroBg} {
  background: linear-gradient(
    180deg,
    #fbfbfd 0%,
    #f5f5f7 40%,
    #fbfbfd 100%
  );
  position: relative;
}`;

// Subtle radial glow overlay
export const heroBgOverlay = rule`${c.heroBg}::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse 60% 50% at 50% 40%,
    rgba(0, 113, 227, 0.06) 0%,
    rgba(251, 251, 253, 0) 70%
  );
  pointer-events: none;
}`;

// ============================================
// Typography
// ============================================

export const heroTitle = rule`${c.heroTitle} {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #1d1d1f 30%, #6e6e73 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.25rem;
}`;

export const heroSubtitle = rule`${c.heroSubtitle} {
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 400;
  line-height: 1.5;
  color: #6e6e73;
  max-width: 40rem;
  margin: 0 auto 2.5rem;
  letter-spacing: -0.005em;
}`;

export const sectionTitle = rule`${c.sectionTitle} {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: #1d1d1f;
  margin-bottom: 0.75rem;
}`;

export const sectionSubtitle = rule`${c.sectionSubtitle} {
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 400;
  line-height: 1.5;
  color: #6e6e73;
  max-width: 36rem;
  margin: 0 auto 3rem;
}`;

// ============================================
// Buttons
// ============================================

export const primaryButton = rule`${c.primaryButton} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1.75rem;
  background: #0071e3;
  color: white;
  border-radius: 980px;
  font-size: 1.0625rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  border: none;
  cursor: pointer;
  letter-spacing: -0.005em;
}`;

export const primaryButtonHover = rule`${c.primaryButton}:hover {
  background: #0077ed;
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 113, 227, 0.3);
}`;

export const secondaryButton = rule`${c.secondaryButton} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1.75rem;
  background: transparent;
  color: #0071e3;
  border: 1.5px solid #0071e3;
  border-radius: 980px;
  font-size: 1.0625rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  cursor: pointer;
  letter-spacing: -0.005em;
}`;

export const secondaryButtonHover = rule`${c.secondaryButton}:hover {
  background: #0071e3;
  color: white;
  transform: scale(1.02);
}`;

// ============================================
// Cards
// ============================================

export const featureCard = rule`${c.featureCard} {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  border: 0.5px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}`;

export const featureCardHover = rule`${c.featureCard}:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
}`;

export const docCard = rule`${c.docCard} {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  border: 0.5px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  text-decoration: none;
  display: block;
}`;

export const docCardHover = rule`${c.docCard}:hover {
  border-color: rgba(0, 113, 227, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}`;

// ============================================
// Callout Card
// ============================================

export const calloutCard = rule`${c.calloutCard} {
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  margin: 1.5rem 0;
  border: 0.5px solid rgba(0, 0, 0, 0.04);
}`;

// ============================================
// Utility Effects
// ============================================

export const smoothTransition = rule`${c.smoothTransition} {
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}`;

export const hoverLift = rule`${c.hoverLift}:hover {
  transform: translateY(-2px);
}`;

export const fadeIn = rule`${c.fadeIn} {
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) both;
}`;

export const fadeInKeyframes = rule`@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`;

// ============================================
// Navigation Links
// ============================================

export const navLinkHover = rule`.nav-link:hover {
  color: #0071e3 !important;
}`;

// ============================================
// Export All Styles
// ============================================

export const appleTheme = {
  // Global
  globalStyles,

  // Glass effects
  glassNav,
  glassCard,

  // Backgrounds
  gradientBg,
  heroBg,
  heroBgOverlay,

  // Typography
  heroTitle,
  heroSubtitle,
  sectionTitle,
  sectionSubtitle,

  // Buttons
  primaryButton,
  primaryButtonHover,
  secondaryButton,
  secondaryButtonHover,

  // Cards
  featureCard,
  featureCardHover,
  docCard,
  docCardHover,
  calloutCard,

  // Navigation
  navLinkHover,

  // Effects
  smoothTransition,
  hoverLift,
  fadeIn,
  fadeInKeyframes,
};
