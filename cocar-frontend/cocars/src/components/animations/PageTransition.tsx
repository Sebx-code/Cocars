// src/components/animations/PageTransition.tsx - Transitions de page GSAP
import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Animation d'entrée
      gsap.fromTo(
        container,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }

    // Cleanup
    return () => {
      if (container) {
        gsap.killTweensOf(container);
      }
    };
  }, [children]);

  return <div ref={containerRef}>{children}</div>;
}

export default PageTransition;
