/**
 * Apple-inspired design system for SemaJSX docs
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

  // Components
  "primaryButton",
  "secondaryButton",
  "featureCard",
  "docCard",

  // Effects
  "smoothTransition",
  "hoverLift",
]);

// ============================================
// Global Styles
// ============================================

export const globalStyles = rules(
  // System font stack (SF Pro-like)
  rule`:root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }`,

  // Smooth scrolling
  rule`html {
    scroll-behavior: smooth;
  }`,

  // Body background
  rule`body {
    background: #f5f5f7;
    color: #1d1d1f;
  }`,
);

// ============================================
// Frosted Glass Effects
// ============================================

export const glassNav = rule`${c.glassNav} {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}`;

export const glassCard = rule`${c.glassCard} {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
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
    #f5f5f7 0%,
    #e8e8ed 50%,
    #f5f5f7 100%
  );
  position: relative;
}`;

// Add radial gradient overlay
export const heroBgOverlay = rule`${c.heroBg}::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    rgba(102, 126, 234, 0.15) 0%,
    rgba(245, 245, 247, 0) 70%
  );
  pointer-events: none;
}`;

// ============================================
// Typography
// ============================================

export const heroTitle = rule`${c.heroTitle} {
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #1d1d1f 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
}`;

export const heroSubtitle = rule`${c.heroSubtitle} {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 400;
  line-height: 1.4;
  color: #6e6e73;
  max-width: 44rem;
  margin: 0 auto 3rem;
}`;

export const sectionTitle = rule`${c.sectionTitle} {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #1d1d1f;
  margin-bottom: 2rem;
}`;

// ============================================
// Buttons
// ============================================

export const primaryButton = rule`${c.primaryButton} {
  display: inline-block;
  padding: 1rem 2rem;
  background: #0071e3;
  color: white;
  border-radius: 980px;
  font-size: 1.125rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}`;

export const primaryButtonHover = rule`${c.primaryButton}:hover {
  background: #0077ed;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 113, 227, 0.4);
}`;

export const secondaryButton = rule`${c.secondaryButton} {
  display: inline-block;
  padding: 1rem 2rem;
  background: transparent;
  color: #0071e3;
  border: 2px solid #0071e3;
  border-radius: 980px;
  font-size: 1.125rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}`;

export const secondaryButtonHover = rule`${c.secondaryButton}:hover {
  background: #0071e3;
  color: white;
  transform: translateY(-2px);
}`;

// ============================================
// Cards
// ============================================

export const featureCard = rule`${c.featureCard} {
  background: white;
  border-radius: 18px;
  padding: 2.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}`;

export const featureCardHover = rule`${c.featureCard}:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}`;

export const docCard = rule`${c.docCard} {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e8e8ed;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  display: block;
}`;

export const docCardHover = rule`${c.docCard}:hover {
  border-color: #0071e3;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}`;

// ============================================
// Utility Effects
// ============================================

export const smoothTransition = rule`${c.smoothTransition} {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}`;

export const hoverLift = rule`${c.hoverLift}:hover {
  transform: translateY(-4px);
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

  // Navigation
  navLinkHover,

  // Effects
  smoothTransition,
  hoverLift,
};
