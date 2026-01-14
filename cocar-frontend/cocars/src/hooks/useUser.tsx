import { useContext } from 'react';
import { UserContext } from '../contexts/userContext';


// Hook personnalisé
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}