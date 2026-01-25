import { useState, useEffect } from 'react'
import { vehiclesApi } from '../../services/api'
import { Vehicle } from '../../types'
import { Car, Plus, Edit, Trash2, Star, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ brand: '', model: '', color: '', registration_number: '', seats: '4', year: '' })

  useEffect(() => { loadVehicles() }, [])

  const loadVehicles = async () => {
    try {
      const response = await vehiclesApi.getAll()
      setVehicles(response.data.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await vehiclesApi.create(formData)
      toast.success('Véhicule ajouté')
      setShowForm(false)
      setFormData({ brand: '', model: '', color: '', registration_number: '', seats: '4', year: '' })
      loadVehicles()
    } catch (error) {
      toast.error('Erreur lors de l\'ajout')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce véhicule ?')) return
    try {
      await vehiclesApi.delete(id)
      setVehicles(vehicles.filter(v => v.id !== id))
      toast.success('Véhicule supprimé')
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const setDefault = async (id: number) => {
    try {
      await vehiclesApi.setDefault(id)
      loadVehicles()
      toast.success('Véhicule par défaut défini')
    } catch (error) {
      toast.error('Erreur')
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes véhicules</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus className="w-5 h-5" /> Ajouter</button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Nouveau véhicule</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="Marque" className="input" required />
            <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} placeholder="Modèle" className="input" required />
            <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="Couleur" className="input" required />
            <input type="text" value={formData.registration_number} onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })} placeholder="Immatriculation" className="input" required />
            <select value={formData.seats} onChange={(e) => setFormData({ ...formData, seats: e.target.value })} className="input">
              {[2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} places</option>)}
            </select>
            <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} placeholder="Année" className="input" />
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Ajouter</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                    <Car className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{vehicle.color} • {vehicle.seats} places</p>
                    <p className="text-sm text-gray-500">{vehicle.registration_number}</p>
                  </div>
                </div>
                {vehicle.is_default && <span className="badge badge-success"><Star className="w-3 h-3" /> Par défaut</span>}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                {!vehicle.is_default && <button onClick={() => setDefault(vehicle.id)} className="btn-outline text-sm py-2">Définir par défaut</button>}
                <button onClick={() => handleDelete(vehicle.id)} className="btn-outline text-sm py-2 text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Car className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun véhicule</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Ajoutez votre premier véhicule</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Ajouter un véhicule</button>
        </div>
      )}
    </div>
  )
}
