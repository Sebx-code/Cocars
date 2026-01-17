// src/utils/animations.ts - Système d'animations GSAP centralisé
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Enregistrer les plugins
gsap.registerPlugin(ScrollTrigger);

// ============= CONFIGURATIONS GLOBALES =============
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.3,
    normal: 0.5,
    slow: 0.8,
    verySlow: 1.2,
  },
  ease: {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.5)",
    expo: "expo.out",
  },
};

// ============= ANIMATIONS DE BASE =============

/**
 * Fade In simple
 */
export const fadeIn = (element: HTMLElement | null, delay = 0) => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0 },
    {
      opacity: 1,
      duration: ANIMATION_CONFIG.duration.normal,
      delay,
      ease: ANIMATION_CONFIG.ease.smooth,
    }
  );
};

/**
 * Fade In depuis le bas (slide up)
 */
export const fadeInUp = (element: HTMLElement | null, delay = 0) => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: ANIMATION_CONFIG.duration.normal,
      delay,
      ease: ANIMATION_CONFIG.ease.smooth,
    }
  );
};

/**
 * Fade In depuis la gauche
 */
export const fadeInLeft = (element: HTMLElement | null, delay = 0) => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, x: -30 },
    {
      opacity: 1,
      x: 0,
      duration: ANIMATION_CONFIG.duration.normal,
      delay,
      ease: ANIMATION_CONFIG.ease.smooth,
    }
  );
};

/**
 * Fade In depuis la droite
 */
export const fadeInRight = (element: HTMLElement | null, delay = 0) => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, x: 30 },
    {
      opacity: 1,
      x: 0,
      duration: ANIMATION_CONFIG.duration.normal,
      delay,
      ease: ANIMATION_CONFIG.ease.smooth,
    }
  );
};

/**
 * Scale In (zoom in)
 */
export const scaleIn = (element: HTMLElement | null, delay = 0) => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, scale: 0.8 },
    {
      opacity: 1,
      scale: 1,
      duration: ANIMATION_CONFIG.duration.normal,
      delay,
      ease: ANIMATION_CONFIG.ease.bounce,
    }
  );
};

// ============= MICRO-INTERACTIONS =============

/**
 * Hover lift (élévation au survol)
 */
export const hoverLift = (element: HTMLElement | null) => {
  if (!element) return;

  element.addEventListener("mouseenter", () => {
    gsap.to(element, {
      y: -4,
      scale: 1.02,
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.smooth,
    });
  });

  element.addEventListener("mouseleave", () => {
    gsap.to(element, {
      y: 0,
      scale: 1,
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.smooth,
    });
  });
};

/**
 * Hover glow (effet lumineux au survol)
 */
export const hoverGlow = (element: HTMLElement | null, color = "rgba(16, 185, 129, 0.3)") => {
  if (!element) return;

  element.addEventListener("mouseenter", () => {
    gsap.to(element, {
      boxShadow: `0 0 20px ${color}`,
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.smooth,
    });
  });

  element.addEventListener("mouseleave", () => {
    gsap.to(element, {
      boxShadow: "none",
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.smooth,
    });
  });
};

/**
 * Button press (feedback tactile)
 */
export const buttonPress = (element: HTMLElement | null) => {
  if (!element) return;

  element.addEventListener("mousedown", () => {
    gsap.to(element, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.out",
    });
  });

  element.addEventListener("mouseup", () => {
    gsap.to(element, {
      scale: 1,
      duration: 0.2,
      ease: "elastic.out(1, 0.3)",
    });
  });

  element.addEventListener("mouseleave", () => {
    gsap.to(element, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  });
};

/**
 * Ripple effect (onde au clic)
 */
export const rippleEffect = (element: HTMLElement, event: MouseEvent) => {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ripple = document.createElement("span");
  ripple.style.position = "absolute";
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = "0";
  ripple.style.height = "0";
  ripple.style.borderRadius = "50%";
  ripple.style.background = "rgba(255, 255, 255, 0.5)";
  ripple.style.transform = "translate(-50%, -50%)";
  ripple.style.pointerEvents = "none";

  element.style.position = "relative";
  element.style.overflow = "hidden";
  element.appendChild(ripple);

  gsap.to(ripple, {
    width: 300,
    height: 300,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
    onComplete: () => ripple.remove(),
  });
};

// ============= ANIMATIONS AU SCROLL =============

/**
 * Reveal on scroll (apparition au défilement)
 */
export const revealOnScroll = (element: HTMLElement | string, options = {}) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "top 60%",
        toggleActions: "play none none reverse",
        ...options,
      },
    }
  );
};

/**
 * Stagger reveal (révélation en cascade)
 */
export const staggerReveal = (elements: NodeListOf<Element> | Element[], delay = 0.1) => {
  gsap.fromTo(
    elements,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
      stagger: delay,
      scrollTrigger: {
        trigger: elements[0],
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    }
  );
};

/**
 * Parallax effect (effet de profondeur)
 */
export const parallaxScroll = (element: HTMLElement | string, speed = 0.5) => {
  gsap.to(element, {
    y: () => window.innerHeight * speed,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
};

// ============= ANIMATIONS DE PAGE =============

/**
 * Page transition (entrée de page)
 */
export const pageEnter = (element: HTMLElement | null) => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    }
  );
};

/**
 * Page transition (sortie de page)
 */
export const pageExit = (element: HTMLElement | null) => {
  if (!element) return;
  return gsap.to(element, {
    opacity: 0,
    y: -20,
    duration: ANIMATION_CONFIG.duration.fast,
    ease: ANIMATION_CONFIG.ease.smooth,
  });
};

// ============= ANIMATIONS DE LOADING =============

/**
 * Pulse (pulsation continue)
 */
export const pulse = (element: HTMLElement | null) => {
  if (!element) return;
  gsap.to(element, {
    scale: 1.05,
    duration: 0.8,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });
};

/**
 * Rotate (rotation continue)
 */
export const rotate = (element: HTMLElement | null, duration = 1) => {
  if (!element) return;
  gsap.to(element, {
    rotation: 360,
    duration,
    repeat: -1,
    ease: "none",
  });
};

// ============= UTILITAIRES =============

/**
 * Kill all animations on element
 */
export const killAnimations = (element: HTMLElement | string) => {
  gsap.killTweensOf(element);
  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger.trigger === element) {
      trigger.kill();
    }
  });
};

/**
 * Refresh ScrollTrigger (après changement de layout)
 */
export const refreshScrollTrigger = () => {
  ScrollTrigger.refresh();
};

export default {
  fadeIn,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  hoverLift,
  hoverGlow,
  buttonPress,
  rippleEffect,
  revealOnScroll,
  staggerReveal,
  parallaxScroll,
  pageEnter,
  pageExit,
  pulse,
  rotate,
  killAnimations,
  refreshScrollTrigger,
  ANIMATION_CONFIG,
};
