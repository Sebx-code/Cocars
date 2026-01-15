// cocar-frontend/cocars/src/pages/admin/AdminUsers.tsx
import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { User } from "../../types";
import { adminService } from "../../services/adminService";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [currentPage, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers(currentPage, search || undefined);
      if (response.success) {
        setUsers(response.data);
        setTotalPages(response.meta.last_page);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput);
  };

  const filteredUsers = users;

  const handleVerify = async (userId: number) => {
    try {
      const response = await adminService.verifyUser(userId);
      if (response.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_verified: true } : u));
      }
    } catch (error) {
      console.error('Erreur vérification:', error);
      alert('Erreur lors de la vérification');
    }
  };

  const handleDelete = async (userId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        const response = await adminService.deleteUser(userId);
        if (response.success) {
          setUsers(users.filter(u => u.id !== userId));
        }
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Utilisateurs</h1>
          <p className="text-theme-tertiary">Gérez les utilisateurs de la plateforme</p>
        </div>
        
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

      {/* Table */}
      <div className="card-theme rounded-3xl border-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-theme-secondary border-b-2 border-theme">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Utilisateur</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Rôle</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Note</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-tertiary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-theme-tertiary">
                    Chargement...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-theme-tertiary">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover-theme">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                          <span className="font-bold text-black text-sm">
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-theme-primary">{user.name}</p>
                          <p className="text-sm text-theme-tertiary">Inscrit le {user.created_at}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-theme-primary">{user.email}</p>
                      <p className="text-sm text-theme-tertiary">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin" 
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      }`}>
                        {user.role === "admin" ? "Admin" : "Utilisateur"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Vérifié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                          <XCircle className="w-3.5 h-3.5" />
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-theme-primary">⭐ {user.rating || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover-theme rounded-lg" title="Voir">
                          <Eye className="w-4 h-4 text-theme-secondary" />
                        </button>
                        {!user.is_verified && (
                          <button 
                            onClick={() => handleVerify(user.id)}
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" 
                            title="Vérifier"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        {user.role !== "admin" && (
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" 
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
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
            Affichage de {filteredUsers.length} sur {total} utilisateur(s)
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
