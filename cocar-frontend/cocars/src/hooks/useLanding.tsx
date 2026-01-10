import { useContext } from 'react';
import { LandingContext } from '../contexts/landingContext';


// Hook personnalisé
export function useLanding() {
  const context = useContext(LandingContext);
  if (context === undefined) {
    throw new Error('useLanding must be used within a LandingProvider');
  }
  return context;
}