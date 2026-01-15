// src/components/layout/Layout.tsx
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  className?: string;
}

export default function Layout({ children, showFooter = true, className = "" }: LayoutProps) {
  return (
    <div className="min-h-screen bg-theme-primary flex flex-col">
      <Navbar />
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
