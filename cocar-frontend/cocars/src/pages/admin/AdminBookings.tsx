// cocar-frontend/cocars/src/pages/admin/AdminBookings.tsx
import { useCallback, useEffect, useState } from "react";
import { Search, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, MapPin, User as UserIcon } from "lucide-react";
import type { Booking, Trip, User as AppUser } from "../../types";
import { adminService } from "../../services/adminService";

type BookingWithRelations = Booking & { trip?: Trip; passenger?: AppUser };

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getBookings(currentPage, {
        status: statusFilter,
        search: search || undefined,
      });
      if (response.success) {
        setBookings(response.data);
        setTotalPages(response.meta.last_page);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error("Erreur chargement réservations:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput);
  };

  const handleConfirm = async (bookingId: number) => {
    try {
      const response = await adminService.confirmBooking(bookingId);
      if (response.success) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
      }
    } catch (error) {
      console.error('Erreur confirmation:', error);
      alert('Erreur lors de la confirmation');
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      try {
        const response = await adminService.cancelBooking(bookingId);
        if (response.success) {
          setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
        }
      } catch (error) {
        console.error('Erreur annulation:', error);
        alert('Erreur lors de l\'annulation');
      }
    }
  };

  const filteredBookings = bookings;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      completed: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      cancelled: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    };
    const labels: Record<string, string> = {
      pending: "En attente",
      confirmed: "Confirmée",
      completed: "Terminée",
      cancelled: "Annulée",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Réservations</h1>
          <p className="text-theme-tertiary">Gérez les réservations de la plateforme</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-theme px-4 py-2.5 rounded-xl border-2 focus:outline-none focus:border-yellow-400"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="completed">Terminées</option>
            <option value="cancelled">Annulées</option>
          </select>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-theme pl-10 pr-4 py-2.5 w-full sm:w-64 rounded-xl border-2 focus:outline-none focus:border-yellow-400"
            />
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card-theme rounded-3xl border-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-theme-secondary border-b-2 border-theme">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Trajet</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Passager</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Places</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-theme-tertiary">
                    Chargement...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-theme-tertiary">
                    Aucune réservation trouvée
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const bookingWithRelations = booking as BookingWithRelations;
                  const trip = bookingWithRelations.trip;
                  const passenger = bookingWithRelations.passenger;
                  return (
                    <tr key={booking.id} className="hover-theme">
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-theme-primary">#{booking.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-theme-primary">{trip?.departure_city} → {trip?.arrival_city}</p>
                            <p className="text-sm text-theme-tertiary">{trip?.departure_date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-theme-primary font-medium">{passenger?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-theme-primary font-semibold">{booking.seats_booked}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-theme-primary">{booking.total_price?.toLocaleString()} FCFA</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover-theme rounded-lg" title="Voir">
                            <Eye className="w-4 h-4 text-theme-secondary" />
                          </button>
                          {booking.status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleConfirm(booking.id)}
                                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" 
                                title="Confirmer"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </button>
                              <button 
                                onClick={() => handleCancel(booking.id)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" 
                                title="Annuler"
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-theme">
          <p className="text-sm text-theme-tertiary">
            Affichage de {filteredBookings.length} sur {total} réservation(s)
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover-theme rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5 text-theme-secondary" />
            </button>
            <span className="px-4 py-2 text-theme-primary font-medium">{currentPage} / {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 hover-theme rounded-lg disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5 text-theme-secondary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
