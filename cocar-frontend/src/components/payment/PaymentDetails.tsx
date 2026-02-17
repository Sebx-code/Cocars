import React from 'react'
import { Payment } from '../../types'

interface PaymentDetailsProps {
  payment: Payment
  userRole: 'passenger' | 'driver'
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ payment, userRole }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

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

  const getEscrowStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'none': 'text-gray-600',
      'held': 'text-blue-600',
      'released': 'text-green-600',
      'refunded': 'text-purple-600',
      'partial_refund': 'text-orange-600'
    }
    return colors[status] || 'text-gray-600'
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Détails du Paiement
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(payment.status)}`}>
          {getStatusLabel(payment.status)}
        </span>
      </div>
      
      <div className="space-y-4">
        {/* Montant principal */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <span className="text-gray-600">Montant</span>
          <span className="text-2xl font-bold text-gray-800">{payment.amount.toLocaleString()} FCFA</span>
        </div>

        {/* Méthode de paiement */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Méthode</span>
          <span className="font-semibold text-gray-800">{getPaymentMethodLabel(payment.payment_method)}</span>
        </div>

        {/* ID Transaction */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Transaction ID</span>
          <span className="font-mono text-sm text-gray-600">{payment.transaction_id}</span>
        </div>

        {/* Statut Escrow */}
        {payment.escrow_status !== 'none' && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Sécurité (Escrow)</span>
            <span className={`font-semibold ${getEscrowStatusColor(payment.escrow_status)}`}>
              {getEscrowStatusLabel(payment.escrow_status)}
            </span>
          </div>
        )}

        {/* Date de paiement */}
        {payment.paid_at && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Payé le</span>
            <span className="text-gray-600">
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
          <div className="mt-6 pt-4 border-t-2 border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 -mx-6 -mb-6 p-6 rounded-b-lg">
            <h4 className="font-bold text-green-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Détails du Paiement Reçu
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Montant total</span>
                <span className="text-gray-800 font-medium">{payment.amount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Commission plateforme (10%)</span>
                <span className="font-medium">- {payment.commission_amount?.toLocaleString() || 0} FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-green-200">
                <span className="text-green-700">Vous recevez (90%)</span>
                <span className="text-green-700">{payment.driver_amount?.toLocaleString() || 0} FCFA</span>
              </div>
            </div>
            {payment.escrow_released_at && (
              <p className="text-xs text-green-600 mt-3">
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
          <div className="mt-6 pt-4 border-t-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 -mx-6 -mb-6 p-6 rounded-b-lg">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Détails du Remboursement
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Montant initial</span>
                <span className="text-gray-800 font-medium">{payment.amount.toLocaleString()} FCFA</span>
              </div>
              {payment.penalty_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Pénalité</span>
                  <span className="text-red-600 font-medium">- {payment.penalty_amount.toLocaleString()} FCFA</span>
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
          <div className="mt-6 pt-4 border-t-2 border-gray-200 bg-gradient-to-br from-yellow-50 to-amber-50 -mx-6 -mb-6 p-6 rounded-b-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h4 className="font-bold text-yellow-800 mb-1">Paiement Sécurisé</h4>
                <p className="text-sm text-yellow-700">
                  {userRole === 'passenger' 
                    ? "Votre paiement est sécurisé. Il sera transféré au conducteur une fois le voyage confirmé par les deux parties."
                    : "Ce paiement est sécurisé et vous sera versé une fois le voyage confirmé par les deux parties."
                  }
                </p>
                <p className="text-xs text-yellow-600 mt-2">
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
