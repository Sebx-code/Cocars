import React from 'react'
import { Payment } from '../../types'

interface PaymentDetailsProps {
  payment: Payment
  userRole: 'passenger' | 'driver'
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ payment, userRole }) => {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'completed': 'Complété',
      'pending': 'En attente',
      'processing': 'En cours',
      'failed': 'Échoué',
      'refunded': 'Remboursé'
    }
    return labels[status] || status
  }

  const getEscrowStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'none': 'Aucun',
      'held': '🔒 Sécurisé',
      'released': '✓ Libéré',
      'refunded': '↩️ Remboursé',
      'partial_refund': '↩️ Remboursement partiel'
    }
    return labels[status] || status
  }

  const getStatusColorWithDark = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300',
      'pending': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300',
      'processing': 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300',
      'failed': 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300',
      'refunded': 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300'
    }
    return colors[status] || 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white'
  }

  const getEscrowStatusColorWithDark = (status: string) => {
    const colors: Record<string, string> = {
      'none': 'text-gray-600 dark:text-white/50',
      'held': 'text-blue-600 dark:text-blue-400',
      'released': 'text-green-600 dark:text-green-400',
      'refunded': 'text-purple-600 dark:text-purple-400',
      'partial_refund': 'text-orange-600 dark:text-orange-400'
    }
    return colors[status] || 'text-gray-600 dark:text-white/50'
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'cash': 'Espèces',
      'mobile_money': 'Mobile Money',
      'orange_money': 'Orange Money',
      'mtn_money': 'MTN Mobile Money'
    }
    return labels[method] || method
  }

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-lg dark:border dark:border-white/[0.07] shadow-md dark:shadow-none p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Détails du Paiement
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColorWithDark(payment.status)}`}>
          {getStatusLabel(payment.status)}
        </span>
      </div>
      
      <div className="space-y-4">
        {/* Montant principal */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-white/10">
          <span className="text-gray-600 dark:text-white/60">Montant</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{payment.amount.toLocaleString()} FCFA</span>
        </div>

        {/* Méthode de paiement */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-white/60">Méthode</span>
          <span className="font-semibold text-gray-800 dark:text-white">{getPaymentMethodLabel(payment.payment_method)}</span>
        </div>

        {/* ID Transaction */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-white/60">Transaction ID</span>
          <span className="font-mono text-sm text-gray-600 dark:text-white/50">{payment.transaction_id}</span>
        </div>

        {/* Statut Escrow */}
        {payment.escrow_status !== 'none' && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-white/60">Sécurité (Escrow)</span>
            <span className={`font-semibold ${getEscrowStatusColorWithDark(payment.escrow_status)}`}>
              {getEscrowStatusLabel(payment.escrow_status)}
            </span>
          </div>
        )}

        {/* Date de paiement */}
        {payment.paid_at && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-white/50">Payé le</span>
            <span className="text-gray-600 dark:text-white/60">
              {new Date(payment.paid_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}

        {/* Pour le chauffeur: Commission et montant net */}
        {userRole === 'driver' && payment.escrow_status === 'released' && (
          <div className="mt-6 pt-4 border-t-2 border-gray-200 dark:border-white/10 bg-gradient-to-br from-green-50 dark:from-green-500/10 to-emerald-50 dark:to-emerald-500/10 -mx-6 -mb-6 p-6 rounded-b-lg">
            <h4 className="font-bold text-green-800 dark:text-green-300 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Détails du Paiement Reçu
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-white/70">Montant total</span>
                <span className="text-gray-800 dark:text-white font-medium">{payment.amount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                <span>Commission plateforme (10%)</span>
                <span className="font-medium">- {payment.commission_amount?.toLocaleString() || 0} FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-green-200 dark:border-green-500/30">
                <span className="text-green-700 dark:text-green-300">Vous recevez (90%)</span>
                <span className="text-green-700 dark:text-green-300">{payment.driver_amount?.toLocaleString() || 0} FCFA</span>
              </div>
            </div>
            {payment.escrow_released_at && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-3">
                ✓ Versé le {new Date(payment.escrow_released_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        )}

        {/* Pour le passager: Pénalité et remboursement */}
        {userRole === 'passenger' && (payment.escrow_status === 'refunded' || payment.escrow_status === 'partial_refund') && (
          <div className="mt-6 pt-4 border-t-2 border-gray-200 dark:border-white/10 bg-gradient-to-br from-blue-50 dark:from-blue-500/10 to-indigo-50 dark:to-indigo-500/10 -mx-6 -mb-6 p-6 rounded-b-lg">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Détails du Remboursement
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-white/70">Montant initial</span>
                <span className="text-gray-800 dark:text-white font-medium">{payment.amount.toLocaleString()} FCFA</span>
              </div>
              {payment.penalty_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-600 dark:text-red-400">Pénalité</span>
                  <span className="text-red-600 dark:text-red-400 font-medium">- {payment.penalty_amount.toLocaleString()} FCFA</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-blue-200">
                <span className="text-blue-700">Remboursement</span>
                <span className="text-blue-700">{payment.refund_amount?.toLocaleString() || 0} FCFA</span>
              </div>
            </div>
            {payment.penalty_amount > 0 && (
              <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded text-xs text-orange-800">
                ⚠️ Pénalité de {payment.penalty_amount} FCFA appliquée pour annulation tardive ou absence
              </div>
            )}
            {payment.refunded_at && (
              <p className="text-xs text-blue-600 mt-3">
                ✓ Remboursé le {new Date(payment.refunded_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        )}

        {/* Escrow en attente */}
        {payment.escrow_status === 'held' && (
          <div className="mt-6 pt-4 border-t-2 border-gray-200 dark:border-white/10 bg-gradient-to-br from-yellow-50 dark:from-yellow-500/10 to-amber-50 dark:to-amber-500/10 -mx-6 -mb-6 p-6 rounded-b-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-1">Paiement Sécurisé</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {userRole === 'passenger' 
                    ? "Votre paiement est sécurisé. Il sera transféré au conducteur une fois le voyage confirmé par les deux parties."
                    : "Ce paiement est sécurisé et vous sera versé une fois le voyage confirmé par les deux parties."
                  }
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  Montant sécurisé : {payment.escrow_amount?.toLocaleString() || payment.amount.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
