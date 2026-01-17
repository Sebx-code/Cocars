import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: Props) {
  return (
    <div className={`card-theme rounded-3xl border border-theme shadow-theme-sm ${className}`.trim()}>
      {children}
    </div>
  );
}
