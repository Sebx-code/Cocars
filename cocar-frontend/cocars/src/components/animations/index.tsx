// src/components/animations/index.tsx
// Composants d'animation réutilisables avec Framer Motion

import { animate, motion, useMotionValue, useTransform, HTMLMotionProps, Variants } from "framer-motion";
import { ReactNode, useEffect } from "react";

// ============ VARIANTS D'ANIMATION ============

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

// ============ COMPOSANTS DE BASE ============

interface AnimatedProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Fade In Up
export function FadeInUp({ children, className = "", delay = 0, ...props }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade In Down
export function FadeInDown({ children, className = "", delay = 0, ...props }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade In Left
export function FadeInLeft({ children, className = "", delay = 0, ...props }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade In Right
export function FadeInRight({ children, className = "", delay = 0, ...props }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scale In
export function ScaleIn({ children, className = "", delay = 0, ...props }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger Container
interface StaggerContainerProps extends AnimatedProps {
  staggerDelay?: number;
}

export function StaggerContainer({ children, className = "", staggerDelay = 0.1, ...props }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger Item
export function StaggerItem({ children, className = "", ...props }: AnimatedProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============ COMPOSANTS INTERACTIFS ============

// Hover Scale
interface HoverScaleProps extends AnimatedProps {
  scale?: number;
}

export function HoverScale({ children, className = "", scale = 1.05, ...props }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Hover Lift (avec ombre)
export function HoverLift({ children, className = "", ...props }: AnimatedProps) {
  return (
    <motion.div
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Bouton animé
interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export function AnimatedButton({ 
  children, 
  className = "", 
  variant = "primary",
  ...props 
}: AnimatedButtonProps) {
  const baseClasses = "relative overflow-hidden font-semibold transition-colors";
  
  const variantClasses = {
    primary: "bg-yellow-400 hover:bg-yellow-500 text-black",
    secondary: "bg-black hover:bg-gray-900 text-white",
    outline: "border-2 border-gray-200 hover:border-black text-gray-900",
    ghost: "hover:bg-gray-100 text-gray-700"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// ============ COMPOSANTS DE PAGE ============

// Page Transition Wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Section animée
export function AnimatedSection({ children, className = "", delay = 0, ...props }: AnimatedProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}

// ============ COMPOSANTS SPÉCIAUX ============

// Texte animé lettre par lettre
interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedText({ text, className = "", delay = 0 }: AnimatedTextProps) {
  const words = text.split(" ");
  
  return (
    <motion.span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.5, 
            delay: delay + i * 0.1,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Compteur animé
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  className = "",
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });
    return controls.stop;
  }, [motionValue, value, duration]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className={className}
    >
      {prefix}
      <motion.span>
        {rounded}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

// Floating Animation (pour éléments décoratifs)
interface FloatingProps extends AnimatedProps {
  amplitude?: number;
  duration?: number;
}

export function Floating({ 
  children, 
  className = "", 
  amplitude = 10, 
  duration = 3,
  ...props 
}: FloatingProps) {
  return (
    <motion.div
      animate={{ 
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{ 
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Pulse Animation
export function Pulse({ children, className = "", ...props }: AnimatedProps) {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Card avec animation de survol
interface AnimatedCardProps extends AnimatedProps {
  hoverEffect?: "lift" | "scale" | "glow" | "border";
}

export function AnimatedCard({ 
  children, 
  className = "", 
  hoverEffect = "lift",
  ...props 
}: AnimatedCardProps) {
  const hoverVariants = {
    lift: { y: -8, transition: { duration: 0.3 } },
    scale: { scale: 1.02, transition: { duration: 0.3 } },
    glow: { boxShadow: "0 0 30px rgba(250, 204, 21, 0.3)", transition: { duration: 0.3 } },
    border: { borderColor: "#000", transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={hoverVariants[hoverEffect]}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Reveal on scroll (avec masque)
export function RevealOnScroll({ children, className = "", ...props }: AnimatedProps) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Blur In
export function BlurIn({ children, className = "", delay = 0, ...props }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Export motion pour utilisation directe
export { motion };
