# 🎨 Guide d'Intégration Frontend - Système de Paiement

## 🎯 Vue d'ensemble

Ce guide vous aide à intégrer les nouvelles fonctionnalités du système de paiement dans le frontend React/TypeScript.

---

## 🆕 Nouvelles Fonctionnalités à Intégrer

### 1. Affichage du Code Passager

Chaque réservation confirmée a maintenant un `passenger_code` (1, 2, 3...).

**Dans `Booking` type (src/types/index.ts):**
```typescript
export interface Booking {
  id: number;
  trip_id: number;
  passenger_id: number;
  seats_booked: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'in_progress';
  passenger_code?: number; // ⭐ NOUVEAU
  driver_confirmed_departure: boolean;
  passenger_confirmed_departure: boolean;
  trip_started: boolean;
  passenger_no_show: boolean;
  driver_no_show: boolean;
  // ... autres champs
}
```

**Composant d'affichage pour le passager:**
```tsx
// src/components/booking/PassengerCodeCard.tsx
import React from 'react';

interface PassengerCodeCardProps {
  booking: Booking;
}

export const PassengerCodeCard: React.FC<PassengerCodeCardProps> = ({ booking }) => {
  if (!booking.passenger_code || booking.status !== 'confirmed') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-xl">
      <div className="text-center">
        <p className="text-sm opacity-90 mb-2">Votre Code Passager</p>
        <div className="text-6xl font-bold my-4">
          {booking.passenger_code}
        </div>
        <p className="text-sm opacity-90 mt-2">
          Présentez ce code au chauffeur lors du départ
        </p>
        <div className="mt-4 p-3 bg-white bg-opacity-20 rounded">
          <p className="text-xs">
            ⚠️ N'oubliez pas de confirmer votre présence dans l'application
          </p>
        </div>
      </div>
    </div>
  );
};
```

---

### 2. Validation du Départ par le Chauffeur

**Service API (src/services/api.ts):**
```typescript
export interface ValidateDepartureRequest {
  total_passengers: number;
  passenger_codes: number[];
}

export interface ValidateDepartureResponse {
  present_count: number;
  absent_count: number;
  present_passengers: Array<{
    booking_id: number;
    passenger_code: number;
    passenger_name: string;
    trip_started: boolean;
  }>;
  absent_passengers: Array<{
    booking_id: number;
    passenger_code: number;
    passenger_name: string;
    refund_amount: number;
  }>;
}

// Nouvelle méthode
export const validateTripDeparture = async (
  tripId: number,
  data: ValidateDepartureRequest
): Promise<ValidateDepartureResponse> => {
  const response = await api.post(`/trips/${tripId}/validate-departure`, data);
  return response.data.data;
};
```

**Composant de validation:**
```tsx
// src/components/driver/DepartureValidation.tsx
import React, { useState, useEffect } from 'react';
import { validateTripDeparture } from '../../services/api';

interface DepartureValidationProps {
  trip: Trip;
  bookings: Booking[];
  onValidated: () => void;
}

export const DepartureValidation: React.FC<DepartureValidationProps> = ({
  trip,
  bookings,
  onValidated
}) => {
  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtrer uniquement les réservations confirmées et payées
  const validBookings = bookings.filter(
    b => b.status === 'confirmed' && b.payment?.status === 'completed'
  );

  const handleToggle = (code: number) => {
    setSelectedCodes(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleValidate = async () => {
    if (selectedCodes.length === 0) {
      alert('Veuillez sélectionner au moins un passager');
      return;
    }

    try {
      setLoading(true);
      const result = await validateTripDeparture(trip.id, {
        total_passengers: selectedCodes.length,
        passenger_codes: selectedCodes
      });

      // Afficher le résumé
      alert(`Départ validé !
        
Passagers présents: ${result.present_count}
Passagers absents: ${result.absent_count}

${result.absent_count > 0 ? 
  `Les passagers absents ont été remboursés avec une pénalité de 500 FCFA.` : 
  'Tous les passagers sont présents !'}
      `);

      onValidated();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">🚗 Validation du Départ</h3>
      
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">
          Cochez les passagers présents dans le véhicule. Les passagers non cochés 
          seront marqués absents et remboursés avec une pénalité de 500 FCFA.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {validBookings.map(booking => (
          <label
            key={booking.id}
            className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
            style={{
              borderColor: selectedCodes.includes(booking.passenger_code!)
                ? '#10b981'
                : '#e5e7eb'
            }}
          >
            <input
              type="checkbox"
              checked={selectedCodes.includes(booking.passenger_code!)}
              onChange={() => handleToggle(booking.passenger_code!)}
              className="w-5 h-5 mr-4"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  #{booking.passenger_code}
                </span>
                <span className="font-semibold">{booking.passenger.name}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {booking.seats_booked} place{booking.seats_booked > 1 ? 's' : ''} • {booking.total_price} FCFA
              </p>
            </div>
            {selectedCodes.includes(booking.passenger_code!) && (
              <span className="text-green-600 font-semibold">✓ Présent</span>
            )}
          </label>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Passagers sélectionnés:</span>
          <span className="text-2xl font-bold text-blue-600">
            {selectedCodes.length} / {validBookings.length}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setSelectedCodes([])}
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          Tout Désélectionner
        </button>
        <button
          onClick={handleValidate}
          disabled={loading || selectedCodes.length === 0}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Validation...' : '✓ Valider le Départ'}
        </button>
      </div>
    </div>
  );
};
```

---

### 3. Confirmation Individuelle du Passager

**Composant de confirmation:**
```tsx
// src/components/booking/PassengerDepartureConfirmation.tsx
import React, { useState } from 'react';
import { confirmDepartureByPassenger } from '../../services/api';

interface PassengerDepartureConfirmationProps {
  booking: Booking;
  onConfirmed: () => void;
}

export const PassengerDepartureConfirmation: React.FC<PassengerDepartureConfirmationProps> = ({
  booking,
  onConfirmed
}) => {
  const [loading, setLoading] = useState(false);

  if (booking.passenger_confirmed_departure) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
        <p className="text-green-700 font-semibold">✓ Vous avez confirmé votre présence</p>
        {booking.trip_started && (
          <p className="text-sm text-green-600 mt-2">Le voyage est en cours. Bon trajet !</p>
        )}
      </div>
    );
  }

  // Vérifier si c'est le jour du voyage
  const isDepartureDay = new Date(booking.trip.departure_date).toDateString() === new Date().toDateString();

  if (!isDepartureDay) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600">
          La confirmation sera disponible le jour du voyage
        </p>
      </div>
    );
  }

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await confirmDepartureByPassenger(booking.id);
      onConfirmed();
      alert('✓ Présence confirmée ! En attente de la confirmation du chauffeur.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la confirmation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">⚠️ Confirmation Requise</h3>
        <p className="mb-4">
          Êtes-vous en route pour ce trajet ?
        </p>
        <div className="bg-white bg-opacity-20 rounded p-3 mb-4 text-sm">
          <p>
            ⚠️ Si vous ne confirmez pas votre présence, vous serez remboursé 
            avec une pénalité de <strong>500 FCFA</strong>
          </p>
        </div>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? 'Confirmation...' : '✓ Je suis en route'}
        </button>
      </div>
    </div>
  );
};
```

---

### 4. Affichage des Informations de Paiement

**Composant détails paiement:**
```tsx
// src/components/payment/PaymentDetails.tsx
import React from 'react';

interface PaymentDetailsProps {
  payment: Payment;
  userRole: 'passenger' | 'driver';
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ payment, userRole }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getEscrowStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'none': 'Aucun',
      'held': '🔒 Sécurisé',
      'released': '✓ Libéré',
      'refunded': '↩️ Remboursé',
      'partial_refund': '↩️ Remboursement partiel'
    };
    return labels[status] || status;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">💰 Détails du Paiement</h3>
      
      <div className="space-y-3">
        {/* Montant principal */}
        <div className="flex justify-between items-center pb-3 border-b">
          <span className="text-gray-600">Montant</span>
          <span className="text-2xl font-bold">{payment.amount.toLocaleString()} FCFA</span>
        </div>

        {/* Statut */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Statut</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(payment.status)}`}>
            {payment.status}
          </span>
        </div>

        {/* Escrow */}
        {payment.escrow_status !== 'none' && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Sécurité</span>
            <span className="font-semibold">
              {getEscrowStatusLabel(payment.escrow_status)}
            </span>
          </div>
        )}

        {/* Pour le chauffeur: Commission et montant net */}
        {userRole === 'driver' && payment.escrow_status === 'released' && (
          <div className="mt-4 pt-4 border-t bg-green-50 -mx-6 -mb-6 p-6 rounded-b-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Montant total</span>
                <span>{payment.amount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Commission plateforme (10%)</span>
                <span>- {payment.commission_amount?.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span className="text-green-700">Vous recevez (90%)</span>
                <span className="text-green-700">{payment.driver_amount?.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        )}

        {/* Pour le passager: Pénalité et remboursement */}
        {userRole === 'passenger' && (payment.escrow_status === 'refunded' || payment.escrow_status === 'partial_refund') && (
          <div className="mt-4 pt-4 border-t bg-blue-50 -mx-6 -mb-6 p-6 rounded-b-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Montant initial</span>
                <span>{payment.amount.toLocaleString()} FCFA</span>
              </div>
              {payment.penalty_amount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Pénalité</span>
                  <span>- {payment.penalty_amount.toLocaleString()} FCFA</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span className="text-blue-700">Remboursement</span>
                <span className="text-blue-700">{payment.refund_amount?.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### 5. Statistiques Chauffeur

**Composant dashboard financier:**
```tsx
// src/components/driver/FinancialDashboard.tsx
import React, { useEffect, useState } from 'react';
import { getDriverFinancialStats } from '../../services/api';

export const FinancialDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      const data = await getDriverFinancialStats(period);
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats', error);
    }
  };

  if (!stats) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Filtres période */}
      <div className="flex gap-2">
        {['week', 'month', 'year'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            className={`px-4 py-2 rounded ${
              period === p ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
          </button>
        ))}
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90">Revenu Net (90%)</p>
          <p className="text-3xl font-bold mt-2">
            {stats.net_income.toLocaleString()} FCFA
          </p>
          <p className="text-sm mt-2 opacity-75">
            Sur {stats.total_trips} trajets
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90">En Attente</p>
          <p className="text-3xl font-bold mt-2">
            {stats.pending_payments.toLocaleString()} FCFA
          </p>
          <p className="text-sm mt-2 opacity-75">
            Escrow en cours
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90">Commission Plateforme (10%)</p>
          <p className="text-3xl font-bold mt-2">
            {stats.total_commission.toLocaleString()} FCFA
          </p>
          <p className="text-sm mt-2 opacity-75">
            Moyenne: {stats.average_per_trip.toLocaleString()} / trajet
          </p>
        </div>
      </div>

      {/* Détails */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4">Détails des Transactions</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Trajets complétés</p>
            <p className="text-xl font-bold">{stats.breakdown.completed_trips}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trajets annulés</p>
            <p className="text-xl font-bold">{stats.breakdown.cancelled_trips}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Passagers no-show</p>
            <p className="text-xl font-bold">{stats.breakdown.no_show_passengers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Solde Wallet</p>
            <p className="text-xl font-bold text-green-600">
              {stats.wallet_balance.toLocaleString()} FCFA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 📱 Exemples d'Intégration dans les Pages

### Page Dashboard Chauffeur

```tsx
// src/pages/dashboard/DriverBookings.tsx
import { DepartureValidation } from '../../components/driver/DepartureValidation';

// Dans le composant
const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
const [bookings, setBookings] = useState<Booking[]>([]);

// Afficher le modal de validation
{selectedTrip && (
  <Modal onClose={() => setSelectedTrip(null)}>
    <DepartureValidation
      trip={selectedTrip}
      bookings={bookings}
      onValidated={() => {
        setSelectedTrip(null);
        refreshBookings();
      }}
    />
  </Modal>
)}
```

### Page Mes Réservations (Passager)

```tsx
// src/pages/dashboard/MyBookings.tsx
import { PassengerCodeCard } from '../../components/booking/PassengerCodeCard';
import { PassengerDepartureConfirmation } from '../../components/booking/PassengerDepartureConfirmation';

// Pour chaque réservation
{booking.status === 'confirmed' && (
  <>
    <PassengerCodeCard booking={booking} />
    <PassengerDepartureConfirmation
      booking={booking}
      onConfirmed={refreshBookings}
    />
  </>
)}
```

---

## 🎨 Styles Tailwind Recommandés

```css
/* Codes couleurs */
.code-badge {
  @apply bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold;
}

.status-confirmed {
  @apply bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold;
}

.status-pending {
  @apply bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold;
}

.penalty-warning {
  @apply bg-red-50 border-2 border-red-200 rounded p-3 text-red-700 text-sm;
}
```

---

## ✅ Checklist d'Intégration

- [ ] Ajouter `passenger_code` au type `Booking`
- [ ] Créer le composant `PassengerCodeCard`
- [ ] Créer le composant `DepartureValidation` (chauffeur)
- [ ] Créer le composant `PassengerDepartureConfirmation`
- [ ] Créer le composant `PaymentDetails`
- [ ] Créer le composant `FinancialDashboard`
- [ ] Ajouter la fonction `validateTripDeparture` dans `api.ts`
- [ ] Intégrer dans la page du chauffeur
- [ ] Intégrer dans la page du passager
- [ ] Tester tous les scénarios

---

**Besoin d'aide ?** Consultez `docs/AMELIORATIONS_SYSTEME_PAIEMENT.md` pour plus de détails sur l'API.
