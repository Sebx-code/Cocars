import React from 'react'
import { Award, Crown, Shield, TrendingUp, Star } from 'lucide-react'

interface CredibilityBadgeProps {
  stars: number
  points?: number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showText?: boolean
  className?: string
}

export const CredibilityBadge: React.FC<CredibilityBadgeProps> = ({
  stars,
  points,
  size = 'md',
  showIcon = true,
  showText = true,
  className = ''
}) => {
  const getBadgeConfig = (stars: number) => {
    switch (stars) {
      case 5:
        return {
          icon: Crown,
          label: 'Elite',
          colors: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
          borderColor: 'border-purple-400',
          glowColor: 'shadow-purple-400/50'
        }
      case 4:
        return {
          icon: Award,
          label: 'Expert',
          colors: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
          borderColor: 'border-blue-400',
          glowColor: 'shadow-blue-400/50'
        }
      case 3:
        return {
          icon: Shield,
          label: 'Confirmé',
          colors: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
          borderColor: 'border-green-400',
          glowColor: 'shadow-green-400/50'
        }
      case 2:
        return {
          icon: TrendingUp,
          label: 'Apprenti',
          colors: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
          borderColor: 'border-orange-400',
          glowColor: 'shadow-orange-400/50'
        }
      case 1:
      default:
        return {
          icon: Star,
          label: 'Débutant',
          colors: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white',
          borderColor: 'border-gray-400',
          glowColor: 'shadow-gray-400/50'
        }
    }
  }

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs gap-1',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5 text-sm gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2 text-base gap-2',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  }

  const config = getBadgeConfig(stars)
  const Icon = config.icon
  const sizes = sizeClasses[size]

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full font-bold
        ${config.colors}
        ${sizes.container}
        border-2 ${config.borderColor}
        shadow-lg ${config.glowColor}
        ${className}
      `}
    >
      {showIcon && (
        <Icon className={sizes.icon} />
      )}
      {showText && (
        <span className={sizes.text}>
          {config.label}
          {points !== undefined && size !== 'sm' && ` (${points})`}
        </span>
      )}
    </div>
  )
}
