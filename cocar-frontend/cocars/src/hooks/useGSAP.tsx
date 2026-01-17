// src/hooks/useGSAP.tsx - Hook React pour animations GSAP
import { useEffect, useRef, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook pour animer un élément au montage
 */
export function useGSAPAnimation<T extends HTMLElement>(
  animation: (element: T) => void | (() => void),
  deps: any[] = []
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      const cleanup = animation(ref.current);
      return () => {
        if (cleanup && typeof cleanup === "function") {
          cleanup();
        }
        if (ref.current) {
          gsap.killTweensOf(ref.current);
        }
      };
    }
  }, deps);

  return ref;
}

/**
 * Hook pour animation au scroll (ScrollTrigger)
 */
export function useScrollAnimation<T extends HTMLElement>(
  animation: (element: T) => gsap.core.Tween | gsap.core.Timeline,
  deps: any[] = []
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      const anim = animation(ref.current);

      return () => {
        anim.kill();
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === ref.current) {
            trigger.kill();
          }
        });
      };
    }
  }, deps);

  return ref;
}

/**
 * Hook pour animation de hover
 */
export function useHoverAnimation<T extends HTMLElement>(
  onEnter: (element: T) => void,
  onLeave: (element: T) => void
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleEnter = () => onEnter(element);
    const handleLeave = () => onLeave(element);

    element.addEventListener("mouseenter", handleEnter);
    element.addEventListener("mouseleave", handleLeave);

    return () => {
      element.removeEventListener("mouseenter", handleEnter);
      element.removeEventListener("mouseleave", handleLeave);
      gsap.killTweensOf(element);
    };
  }, [onEnter, onLeave]);

  return ref;
}

/**
 * Hook pour stagger animation (liste d'éléments)
 */
export function useStaggerAnimation<T extends HTMLElement>(
  selector: string,
  animation: (elements: Element[]) => void,
  deps: any[] = []
): RefObject<T> {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = Array.from(containerRef.current.querySelectorAll(selector));
      if (elements.length > 0) {
        animation(elements);
      }

      return () => {
        elements.forEach((el) => gsap.killTweensOf(el));
      };
    }
  }, deps);

  return containerRef;
}

/**
 * Hook pour timeline GSAP
 */
export function useTimeline<T extends HTMLElement>(
  createTimeline: (element: T) => gsap.core.Timeline,
  deps: any[] = []
): RefObject<T> {
  const ref = useRef<T>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (ref.current) {
      timelineRef.current = createTimeline(ref.current);

      return () => {
        if (timelineRef.current) {
          timelineRef.current.kill();
        }
      };
    }
  }, deps);

  return ref;
}

export default {
  useGSAPAnimation,
  useScrollAnimation,
  useHoverAnimation,
  useStaggerAnimation,
  useTimeline,
};
