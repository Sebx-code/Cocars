// src/components/animations/AnimatedCard.tsx - Card avec animations GSAP
import { ReactNode, useEffect, useRef } from "react";
import { hoverLift } from "../../utils/animations";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

export function AnimatedCard({ children, className = "", onClick, delay = 0 }: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      hoverLift(cardRef.current);
    }
  }, []);

  return (
    <div ref={cardRef} className={className} onClick={onClick}>
      {children}
    </div>
  );
}

export default AnimatedCard;
