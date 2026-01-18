// cocar-frontend/cocars/src/components/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/themeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'button';
}

export default function ThemeToggle({ className = '', variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-secondary hover:bg-theme border border-theme transition-colors ${className}`}
        aria-label={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
      >
        {theme === 'light' ? (
          <>
            <Moon className="w-5 h-5 text-theme-secondary" />
            <span className="text-sm font-semibold text-theme-primary">Mode sombre</span>
          </>
        ) : (
          <>
            <Sun className="w-5 h-5 text-theme-secondary" />
            <span className="text-sm font-semibold text-theme-primary">Mode clair</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-xl hover:bg-theme-secondary border border-theme transition-colors ${className}`}
      aria-label={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-theme-secondary" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-500" />
      )}
    </button>
  );
}
