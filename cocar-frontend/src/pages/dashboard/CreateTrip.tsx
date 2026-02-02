import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tripsApi } from '../../services/api'
import { MapPin, Calendar, Clock, Users, DollarSign, Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateTrip() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    departure_city: '',
    departure_address: '',
    arrival_city: '',
    arrival_address: '',
    departure_date: '',
    departure_time: '',
    available_seats: '3',
    price_per_seat: '',
    description: '',
    preferences: { smoking: false, music: true, pets: false, luggage: 'medium' },
    vehicle_registration: '',
    vehicle_brand: '',
    vehicle_color: ''
  })

  const [vehiclePhotos, setVehiclePhotos] = useState<File[]>([])

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Multipart (FormData) pour envoyer aussi les photos du véhicule
      const fd = new FormData()

      fd.append('departure_city', formData.departure_city)
      fd.append('departure_address', formData.departure_address)
      fd.append('arrival_city', formData.arrival_city)
      fd.append('arrival_address', formData.arrival_address)
      fd.append('departure_date', formData.departure_date)
      fd.append('departure_time', formData.departure_time)
      fd.append('available_seats', String(Number(formData.available_seats)))
      fd.append('price_per_seat', String(Number(formData.price_per_seat)))
      if (formData.description) fd.append('description', formData.description)

      // mapping prefs -> backend fields
      // Laravel validation boolean accepte de façon fiable 1/0 (plutôt que "true"/"false")
      fd.append('smoking_allowed', formData.preferences.smoking ? '1' : '0')
      fd.append('music_allowed', formData.preferences.music ? '1' : '0')
      fd.append('pets_allowed', formData.preferences.pets ? '1' : '0')
      // luggage/air_conditioning non gérés explicitement ici (valeurs backend par défaut)

      fd.append('vehicle_registration', formData.vehicle_registration)
      fd.append('vehicle_brand', formData.vehicle_brand)
      fd.append('vehicle_color', formData.vehicle_color)

      vehiclePhotos.forEach((file) => {
        fd.append('vehicle_photos[]', file)
      })

      await tripsApi.create(fd as any)

      toast.success('Trajet créé avec succès !')
      navigate('/my-trips')
    } catch (error: unknown) {
      const err = error as any
      const message = err?.response?.data?.message

      // Laravel renvoie souvent { success:false, message, errors: { field: [msg] } }
      const errors = err?.response?.data?.errors as Record<string, string[]> | undefined
      const firstError = errors ? Object.values(errors)?.flat()?.[0] : undefined

      // Debug utile (422 validation, etc.)
      // eslint-disable-next-line no-console
      console.error('CreateTrip error:', err?.response?.status, err?.response?.data || err)

      const allErrors = errors ? Object.values(errors).flat().join(' • ') : undefined

      toast.error(firstError || allErrors || message || 'Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && (!formData.departure_city || !formData.arrival_city)) {
      toast.error('Veuillez remplir les villes de départ et d\'arrivée')
      return
    }
    if (step === 2 && (!formData.departure_date || !formData.departure_time)) {
      toast.error('Veuillez remplir la date et l\'heure')
      return
    }
    setStep(step + 1)
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-5 h-5" /> Retour
      </button>

      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Créer un trajet</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Étape {step} sur 4</p>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'}`} />
          ))}
        </div>

        {/* Step 1: Route */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ville de départ *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={formData.departure_city} onChange={(e) => setFormData({ ...formData, departure_city: e.target.value })} placeholder="Ex: Douala" className="input pl-10" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse de départ</label>
              <input type="text" value={formData.departure_address} onChange={(e) => setFormData({ ...formData, departure_address: e.target.value })} placeholder="Optionnel" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ville d'arrivée *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={formData.arrival_city} onChange={(e) => setFormData({ ...formData, arrival_city: e.target.value })} placeholder="Ex: Yaoundé" className="input pl-10" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse d'arrivée</label>
              <input type="text" value={formData.arrival_address} onChange={(e) => setFormData({ ...formData, arrival_address: e.target.value })} placeholder="Optionnel" className="input" />
            </div>
          </div>
        )}

        {/* Step 2: Date & Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="date" value={formData.departure_date} onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })} className="input pl-10" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Heure *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="time" value={formData.departure_time} onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })} className="input pl-10" required />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Places disponibles</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select value={formData.available_seats} onChange={(e) => setFormData({ ...formData, available_seats: e.target.value })} className="input pl-10">
                    {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prix par place (FCFA) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="number" value={formData.price_per_seat} onChange={(e) => setFormData({ ...formData, price_per_seat: e.target.value })} placeholder="5000" className="input pl-10" required />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Informations supplémentaires..." className="input min-h-[100px]" />
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Préférences de voyage</h3>
            <div className="space-y-4">
              {[
                { key: 'smoking', label: 'Fumeur accepté' },
                { key: 'music', label: 'Musique pendant le trajet' },
                { key: 'pets', label: 'Animaux acceptés' },
              ].map((pref) => (
                <label key={pref.key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.preferences[pref.key as keyof typeof formData.preferences] as boolean} onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, [pref.key]: e.target.checked } })} className="w-5 h-5 rounded text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">{pref.label}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taille des bagages</label>
              <select value={formData.preferences.luggage} onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, luggage: e.target.value } })} className="input">
                <option value="small">Petit</option>
                <option value="medium">Moyen</option>
                <option value="large">Grand</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Vehicules */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Véhicule</h3>
            <div className="space-y-4">
              <label htmlFor="">Immatriculation du vehicule</label>
              <input type="text" value={formData.vehicle_registration} onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value })} placeholder="Obligatoire" className="input" />

            </div>
            <div className="space-y-4">
              <label htmlFor="">Marque du vehicule</label>
              <input type="text" value={formData.vehicle_brand} onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })} placeholder="Obligatoire" className="input" />

            </div>
            <div className="space-y-4">
              <label htmlFor="">Couleur du vehicule</label>
              <input type="text" value={formData.vehicle_color} onChange={(e) => setFormData({ ...formData, vehicle_color: e.target.value })} placeholder="Obligatoire" className="input" />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photos du véhicule</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  // limite UI simple
                  setVehiclePhotos(files.slice(0, 6))
                }}
                className="input"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Vous pouvez ajouter jusqu’à 6 photos (JPEG/PNG/WebP). La première sera utilisée comme photo principale.
              </p>

              {vehiclePhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {vehiclePhotos.map((f, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
                      <div className="p-2 text-xs text-gray-600 dark:text-gray-300 truncate">{f.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          {step > 1 && <button onClick={() => setStep(step - 1)} className="btn-outline flex-1">Précédent</button>}
          {step < 4 ? (
            <button onClick={nextStep} className="btn-primary flex-1">Suivant <ArrowRight className="w-5 h-5" /></button>
          ) : (
            <button onClick={handleSubmit} disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Création...</> : 'Publier le trajet'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
