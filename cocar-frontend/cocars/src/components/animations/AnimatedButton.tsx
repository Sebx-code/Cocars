// src/components/animations/AnimatedButton.tsx - Bouton avec animations GSAP
import { ReactNode, useEffect, useRef, ButtonHTMLAttributes } from "react";
import { buttonPress } from "../../utils/animations";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function AnimatedButton({ children, className = "", ...props }: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      buttonPress(buttonRef.current);
    }
  }, []);

  return (
    <button ref={buttonRef} className={className} {...props}>
      {children}
    </button>
  );
}

export default AnimatedButton;
