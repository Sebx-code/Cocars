// cocar-frontend/cocars/src/pages/admin/AdminTrips.tsx
import { useCallback, useEffect, useState } from "react";
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, MapPin, Calendar, Clock } from "lucide-react";
import { Trip } from "../../types";
import { adminService } from "../../services/adminService";

export default function AdminTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getTrips(currentPage, {
        status: statusFilter,
        search: search || undefined,
      });
      if (response.success) {
        setTrips(response.data);
        setTotalPages(response.meta.last_page);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error("Erreur chargement trajets:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput);
  };

  const filteredTrips = trips;

  const handleDelete = async (tripId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce trajet ?")) {
      try {
        const response = await adminService.deleteTrip(tripId);
        if (response.success) {
          setTrips(trips.filter(t => t.id !== tripId));
        }
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      completed: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      cancelled: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    };
    const labels: Record<string, string> = {
      active: "Actif",
      completed: "Terminé",
      cancelled: "Annulé",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.active}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Trajets</h1>
          <p className="text-theme-tertiary">Gérez les trajets de la plateforme</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-theme px-4 py-2.5 rounded-xl border-2 focus:outline-none focus:border-yellow-400"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="completed">Terminés</option>
            <option value="cancelled">Annulés</option>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Trajet</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Conducteur</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Prix</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Places</th>
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
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-theme-tertiary">
                    Aucun trajet trouvé
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover-theme">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-theme-primary">{trip.departure_city}</p>
                          <p className="text-sm text-theme-tertiary">→ {trip.arrival_city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-theme-tertiary" />
                        <span className="text-theme-primary">{trip.departure_date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-theme-tertiary" />
                        <span className="text-sm text-theme-tertiary">{trip.departure_time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-theme-primary font-medium">{trip.driver?.name || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-theme-primary">{trip.price_per_seat?.toLocaleString()} FCFA</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${trip.available_seats === 0 ? "text-red-500" : "text-theme-primary"}`}>
                        {trip.available_seats} place(s)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(trip.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover-theme rounded-lg" title="Voir">
                          <Eye className="w-4 h-4 text-theme-secondary" />
                        </button>
                        <button 
                          onClick={() => handleDelete(trip.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" 
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-theme">
          <p className="text-sm text-theme-tertiary">
            Affichage de {filteredTrips.length} sur {total} trajet(s)
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
