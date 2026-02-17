import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  Award, 
  Star,
  Crown,
  Shield,
  Loader2
} from 'lucide-react'
import { CredibilityStats } from '../../types'
import { CredibilityStars } from '../../components/credibility/CredibilityStars'
import { CredibilityBadge } from '../../components/credibility/CredibilityBadge'
import { analyticsApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminCredibility() {
  const [stats, setStats] = useState<CredibilityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Appel API réel
      const response = await analyticsApi.credibilityStats()
      setStats(response.data.data)
      
      /* Données de démonstration (à supprimer après tests)
      const mockStats: CredibilityStats = {
        total_users: 1234,
        average_points: 156,
        distribution: {
          stars_1: 89,
          stars_2: 245,
          stars_3: 567,
          stars_4: 256,
          stars_5: 77
        },
        top_users: [
          {
            id: 1,
            name: 'Jean Dupont',
            avatar: undefined,
            credibility_points: 520,
            credibility_stars: 5,
            total_trips_as_driver: 156
          },
          {
            id: 2,
            name: 'Marie Martin',
            avatar: undefined,
            credibility_points: 480,
            credibility_stars: 5,
            total_trips_as_driver: 142
          },
          {
            id: 3,
            name: 'Paul Bernard',
            avatar: undefined,
            credibility_points: 450,
            credibility_stars: 5,
            total_trips_as_driver: 138
          },
          {
            id: 4,
            name: 'Sophie Lefebvre',
            avatar: undefined,
            credibility_points: 380,
            credibility_stars: 4,
            total_trips_as_driver: 95
          },
          {
            id: 5,
            name: 'Luc Moreau',
            avatar: undefined,
            credibility_points: 350,
            credibility_stars: 4,
            total_trips_as_driver: 88
          }
        ]
      }
      setStats(mockStats)
    } catch (error: any) {
      console.error('Erreur chargement stats', error)
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    )
  }

  const totalDistribution = Object.values(stats.distribution).reduce((a, b) => a + b, 0)
  const getPercentage = (count: number) => ((count / totalDistribution) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques de Crédibilité</h1>
          <p className="text-gray-600 mt-1">Analyse des niveaux et performance des utilisateurs</p>
        </div>
        <button
          onClick={loadStats}
          className="btn-primary"
        >
          <TrendingUp className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Cartes de statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total utilisateurs */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-sm opacity-90">Total Utilisateurs</p>
              <p className="text-3xl font-bold">{stats.total_users.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-sm opacity-75">Utilisateurs actifs avec crédibilité</p>
        </div>

        {/* Points moyens */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Star className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-sm opacity-90">Points Moyens</p>
              <p className="text-3xl font-bold">{stats.average_points}</p>
            </div>
          </div>
          <p className="text-sm opacity-75">Moyenne de crédibilité globale</p>
        </div>

        {/* Utilisateurs Elite */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Crown className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-sm opacity-90">Chauffeurs Elite</p>
              <p className="text-3xl font-bold">{stats.distribution.stars_5}</p>
            </div>
          </div>
          <p className="text-sm opacity-75">5 étoiles (400+ points)</p>
        </div>
      </div>

      {/* Distribution des étoiles */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600" />
          Distribution des Niveaux
        </h2>

        <div className="space-y-4">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.distribution[`stars_${stars}` as keyof typeof stats.distribution]
            const percentage = getPercentage(count)
            
            return (
              <div key={stars} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CredibilityStars stars={stars} size="sm" showLabel />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-600">
                      {count} utilisateurs ({percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      stars === 5 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      stars === 4 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                      stars === 3 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      stars === 2 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                      'bg-gradient-to-r from-gray-500 to-slate-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Résumé visuel */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-5 gap-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[`stars_${stars}` as keyof typeof stats.distribution]
              const percentage = parseFloat(getPercentage(count))
              
              return (
                <div key={stars} className="text-center">
                  <div 
                    className={`rounded-lg p-4 ${
                      stars === 5 ? 'bg-purple-100' :
                      stars === 4 ? 'bg-blue-100' :
                      stars === 3 ? 'bg-green-100' :
                      stars === 2 ? 'bg-orange-100' :
                      'bg-gray-100'
                    }`}
                    style={{ height: `${Math.max(50, percentage * 2)}px` }}
                  >
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {stars} ⭐
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top utilisateurs */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-500" />
          Top 5 des Utilisateurs
        </h2>

        <div className="space-y-3">
          {stats.top_users.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' :
                index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300' :
                index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300' :
                'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Position */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-500 text-white' :
                'bg-gray-300 text-gray-700'
              }`}>
                {index === 0 ? '🏆' : index + 1}
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-bold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.total_trips_as_driver} trajets complétés</p>
              </div>

              {/* Badge */}
              <div className="flex items-center gap-3">
                <CredibilityBadge 
                  stars={user.credibility_stars}
                  points={user.credibility_points}
                  size="md"
                />
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{user.credibility_points}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Légende et informations */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Système de Niveaux
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          {[
            { stars: 5, name: 'Elite', range: '400+ points', color: 'text-purple-700' },
            { stars: 4, name: 'Expert', range: '200-399 points', color: 'text-blue-700' },
            { stars: 3, name: 'Confirmé', range: '100-199 points', color: 'text-green-700' },
            { stars: 2, name: 'Apprenti', range: '50-99 points', color: 'text-orange-700' },
            { stars: 1, name: 'Débutant', range: '0-49 points', color: 'text-gray-700' }
          ].map((level) => (
            <div key={level.stars} className="text-center">
              <CredibilityBadge stars={level.stars} size="sm" />
              <p className={`font-semibold mt-2 ${level.color}`}>{level.name}</p>
              <p className="text-xs text-gray-600 mt-1">{level.range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
