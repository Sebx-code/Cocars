// taxiYa-main/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'driver' | 'admin';
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  // Rediriger si non authentifié
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Vérifier le rôle si requis
  if (requiredRole && user?.role !== requiredRole) {
    // Rediriger vers la page appropriée selon le rôle
    const roleRedirects: Record<string, string> = {
      user: '/user',
      driver: '/driver',
      admin: '/admin',
    };
    
    // Vérifier si user.role existe et est dans roleRedirects
    const userRole = user?.role;
    const redirectPath = userRole && roleRedirects[userRole] 
      ? roleRedirects[userRole] 
      : '/user'; // Valeur par défaut
    
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
}