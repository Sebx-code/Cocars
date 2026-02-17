import React from 'react'
import { Star } from 'lucide-react'

interface CredibilityStarsProps {
  stars: number
  points?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showPoints?: boolean
  showLabel?: boolean
  className?: string
}

export const CredibilityStars: React.FC<CredibilityStarsProps> = ({
  stars,
  points,
  size = 'md',
  showPoints = false,
  showLabel = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  const starSize = sizeClasses[size]
  const textSize = textSizeClasses[size]

  const getStarColor = (starNumber: number) => {
    if (starNumber <= stars) {
      return 'text-yellow-400 fill-yellow-400'
    }
    return 'text-gray-300'
  }

  const getLevelLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return 'Elite'
      case 4:
        return 'Expert'
      case 3:
        return 'Confirmé'
      case 2:
        return 'Apprenti'
      case 1:
      default:
        return 'Débutant'
    }
  }

  const getLevelColor = (stars: number) => {
    switch (stars) {
      case 5:
        return 'text-purple-600 bg-purple-100'
      case 4:
        return 'text-blue-600 bg-blue-100'
      case 3:
        return 'text-green-600 bg-green-100'
      case 2:
        return 'text-orange-600 bg-orange-100'
      case 1:
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Étoiles */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starNumber) => (
          <Star
            key={starNumber}
            className={`${starSize} ${getStarColor(starNumber)} transition-all`}
          />
        ))}
      </div>

      {/* Label du niveau */}
      {showLabel && (
        <span className={`px-2 py-0.5 rounded-full font-semibold ${textSize} ${getLevelColor(stars)}`}>
          {getLevelLabel(stars)}
        </span>
      )}

      {/* Points de crédibilité */}
      {showPoints && points !== undefined && (
        <span className={`${textSize} text-gray-600 font-medium`}>
          ({points} pts)
        </span>
      )}
    </div>
  )
}
