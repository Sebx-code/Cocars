import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
};

export default function ActionButton({ children, onClick, href, variant = "primary", className = "" }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all hover:scale-[1.01] active:scale-[0.99]";
  const styles =
    variant === "primary"
      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-theme-md px-6 py-3"
      : "border-2 border-theme-strong hover:border-emerald-400 hover:bg-theme-secondary text-theme-primary px-6 py-3";

  if (href) {
    return (
      <a href={href} className={`${base} ${styles} ${className}`.trim()}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`.trim()}>
      {children}
    </button>
  );
}
