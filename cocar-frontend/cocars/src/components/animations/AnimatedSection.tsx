// src/components/animations/AnimatedSection.tsx - Section qui apparaît au scroll
import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "top" | "left" | "right" | "scale";
}

export function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0,
  from = "bottom" 
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      const fromProps: any = { opacity: 0 };
      
      switch (from) {
        case "bottom":
          fromProps.y = 50;
          break;
        case "top":
          fromProps.y = -50;
          break;
        case "left":
          fromProps.x = -50;
          break;
        case "right":
          fromProps.x = 50;
          break;
        case "scale":
          fromProps.scale = 0.9;
          break;
      }

      gsap.fromTo(
        sectionRef.current,
        fromProps,
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.8,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === sectionRef.current) {
          trigger.kill();
        }
      });
    };
  }, [delay, from]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
}

export default AnimatedSection;
