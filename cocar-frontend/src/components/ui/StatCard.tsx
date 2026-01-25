import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  iconColor?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan'
}

export default function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'blue',
}: StatCardProps) {
  const changeColors = {
    positive: 'text-emerald-500',
    negative: 'text-red-500',
    neutral: 'text-gray-500',
  }

  const iconGradients: Record<string, string> = {
    blue: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    green: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    orange: 'bg-gradient-to-br from-orange-400 to-red-500',
    red: 'bg-gradient-to-br from-red-400 to-pink-500',
    purple: 'bg-gradient-to-br from-purple-400 to-indigo-500',
    cyan: 'bg-gradient-to-br from-cyan-400 to-teal-500',
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-6 border border-gray-100 dark:border-slate-700 hover:shadow-argon-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {value}
          </p>
          {change && (
            <p className={`text-sm font-medium mt-2 flex items-center gap-1 ${changeColors[changeType]}`}>
              {changeType === 'positive' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {changeType === 'negative' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span>{change}</span>
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full ${iconGradients[iconColor]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
