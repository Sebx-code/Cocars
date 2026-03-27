import React from 'react'
import { TrendingUp, Award } from 'lucide-react'
import { CredibilityProgress as CredibilityProgressType } from '../../types'
import { CredibilityStars } from './CredibilityStars'

interface CredibilityProgressProps {
  progress: CredibilityProgressType
  totalPositivePoints?: number
  totalNegativePoints?: number
  showTips?: boolean
  compact?: boolean
}

export const CredibilityProgress: React.FC<CredibilityProgressProps> = ({
  progress,
  totalPositivePoints,
  totalNegativePoints,
  showTips = true,
  compact = false
}) => {
  const getLevelName = (stars: number) => {
    const levels = ['', 'Débutant', 'Apprenti', 'Confirmé', 'Expert', 'Elite']
    return levels[stars] || ''
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-50 dark:from-blue-500/10 to-indigo-50 dark:to-indigo-500/10 rounded-lg p-4 border border-blue-100 dark:border-blue-500/30">
        <div className="flex items-center justify-between mb-2">
          <CredibilityStars stars={progress.current_stars} size="md" showLabel />
          <span className="text-sm font-semibold text-gray-700 dark:text-white/70">
            {progress.current_points} pts
          </span>
        </div>
        
        {!progress.max_level && (
          <>
            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mb-1">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, progress.progress_percent)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-white/50 text-center">
              {progress.points_needed} pts pour {getLevelName(progress.next_stars)}
            </p>
          </>
        )}
        
        {progress.max_level && (
          <div className="text-center">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
              <Award className="w-3 h-3" />
              Niveau Maximum Atteint !
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-xl shadow-md dark:shadow-none p-6 border border-gray-100 dark:border-white/[0.07]">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Votre Niveau de Crédibilité
        </h3>
        <CredibilityStars stars={progress.current_stars} size="lg" showLabel />
      </div>

      {/* Points actuels */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-white/60">Points de crédibilité</span>
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {progress.current_points}
          </span>
        </div>
        
        {/* Historique des points */}
        {(totalPositivePoints !== undefined || totalNegativePoints !== undefined) && (
          <div className="flex items-center gap-4 text-xs mt-2">
            {totalPositivePoints !== undefined && (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="font-semibold">+{totalPositivePoints}</span>
                <span>gagnés</span>
              </span>
            )}
            {totalNegativePoints !== undefined && totalNegativePoints > 0 && (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                <span className="font-semibold">-{totalNegativePoints}</span>
                <span>perdus</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progression vers niveau suivant */}
      {!progress.max_level ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-white/70">
              Progression vers {getLevelName(progress.next_stars)}
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {Math.round(progress.progress_percent)}%
            </span>
          </div>
          
          {/* Barre de progression */}
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative"
                style={{ width: `${Math.min(100, progress.progress_percent)}%` }}
              >
                {progress.progress_percent > 10 && (
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
                )}
              </div>
            </div>
          </div>
          
          {/* Informations sur les points nécessaires */}
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/30">
            <p className="text-sm text-center text-blue-800 dark:text-blue-300">
              <span className="font-semibold">Encore {progress.points_needed} points</span>
              {' '}pour atteindre{' '}
              <span className="font-semibold">
                {progress.next_stars} étoiles - {getLevelName(progress.next_stars)}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gradient-to-r from-purple-50 dark:from-purple-500/10 to-pink-50 dark:to-pink-500/10 rounded-lg border-2 border-purple-200 dark:border-purple-500/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <p className="text-lg font-bold text-purple-800 dark:text-purple-300">
              Niveau Maximum Atteint !
            </p>
          </div>
          <p className="text-sm text-center text-purple-700 dark:text-purple-300">
            Vous êtes au sommet ! Continuez à offrir un excellent service pour maintenir votre position.
          </p>
        </div>
      )}

      {/* Conseils pour gagner des points */}
      {showTips && !progress.max_level && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
          <p className="text-sm font-semibold text-gray-700 dark:text-white/70 mb-3">
            💡 Comment gagner des points :
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-white/60">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">+10</span>
              <span>Complétez chaque trajet avec succès</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">+20</span>
              <span>Recevez une note excellente (5/5)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">+10</span>
              <span>Recevez une bonne note (4/5)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 dark:text-red-400 font-bold">-10</span>
              <span>À éviter : être absent le jour du voyage</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
