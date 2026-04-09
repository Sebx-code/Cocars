import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tripsApi, vehiclesApi } from '../../services/api'
import { Vehicle } from '../../types'
import { MapPin, Calendar, Clock, Users, Loader2, ArrowLeft, ArrowRight, Car, Tag, Cigarette, Music, PawPrint, Luggage, ImagePlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateTrip() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | ''>('')
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

  // Minimum date = today
  const today = new Date().toISOString().split('T')[0]

  // Load user vehicles on mount
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await vehiclesApi.getAll()
        const list = response.data.data || []
        setVehicles(list)
        // Auto-select the default vehicle if any
        const defaultVehicle = list.find((v: Vehicle) => v.is_default) || list[0]
        if (defaultVehicle) {
          setSelectedVehicleId(defaultVehicle.id)
          prefillVehicleFields(defaultVehicle)
        }
      } catch {
        // Vehicles not critical - continue without them
      }
    }
    loadVehicles()
  }, [])

  const prefillVehicleFields = (vehicle: Vehicle) => {
    setFormData(prev => ({
      ...prev,
      vehicle_registration: vehicle.registration_number || '',
      vehicle_brand: vehicle.brand || '',
      vehicle_color: vehicle.color || '',
      available_seats: vehicle.seats ? String(Math.min(vehicle.seats - 1, 6)) : prev.available_seats,
    }))
  }

  const handleVehicleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value === '' ? '' : Number(e.target.value)
    setSelectedVehicleId(id as number | '')
    if (id !== '') {
      const vehicle = vehicles.find(v => v.id === Number(id))
      if (vehicle) prefillVehicleFields(vehicle)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
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

      fd.append('smoking_allowed', formData.preferences.smoking ? '1' : '0')
      fd.append('music_allowed', formData.preferences.music ? '1' : '0')
      fd.append('pets_allowed', formData.preferences.pets ? '1' : '0')

      fd.append('vehicle_registration', formData.vehicle_registration)
      fd.append('vehicle_brand', formData.vehicle_brand)
      fd.append('vehicle_color', formData.vehicle_color)

      if (selectedVehicleId !== '') {
        fd.append('vehicle_id', String(selectedVehicleId))
      }

      vehiclePhotos.forEach((file) => {
        fd.append('vehicle_photos[]', file)
      })

      await tripsApi.create(fd as any)

      toast.success('Trajet créé avec succès !')
      navigate('/my-trips')
    } catch (error: unknown) {
      const err = error as any
      const message = err?.response?.data?.message

      const errors = err?.response?.data?.errors as Record<string, string[]> | undefined
      const firstError = errors ? Object.values(errors)?.flat()?.[0] : undefined

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

  const stepLabels = ['Itinéraire', 'Horaires & Prix', 'Options', 'Véhicule']

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn pb-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
          <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Publier un trajet</h1>
          <p className="text-gray-500 dark:text-white/40 text-sm">Partagez votre trajet et trouvez des passagers</p>
        </div>
      </div>

      {/* Vehicle quick-select (if user has vehicles) */}
      {vehicles.length > 0 && (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-2xl p-4 mb-6">
          <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">
            <Car className="inline w-4 h-4 mr-1.5" />
            Utiliser un de mes véhicules enregistrés
          </label>
          <select
            value={selectedVehicleId}
            onChange={handleVehicleSelect}
            className="input"
          >
            <option value="">— Saisir manuellement —</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model} · {v.color} · {v.registration_number}
                {v.is_default ? ' (par défaut)' : ''}
              </option>
            ))}
          </select>
          {selectedVehicleId !== '' && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">
              ✓ Les champs du véhicule ont été pré-remplis automatiquement
            </p>
          )}
        </div>
      )}

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, i) => {
          const s = i + 1
          const isActive = s === step
          const isDone = s < step
          return (
            <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`h-1.5 w-full rounded-full transition-colors ${isDone || isActive ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/[0.07]'}`} />
              <span className={`text-xs font-medium hidden sm:block transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : isDone ? 'text-gray-500 dark:text-white/40' : 'text-gray-400 dark:text-white/20'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Form card */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">

        {/* Step 1: Itinéraire */}
        {step === 1 && (
          <>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-gray-900 dark:text-white font-bold">Itinéraire</h2>
                  <p className="text-gray-500 dark:text-white/40 text-sm">Définissez votre point de départ et d'arrivée</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Ville de départ *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="text"
                      value={formData.departure_city}
                      onChange={(e) => setFormData({ ...formData, departure_city: e.target.value })}
                      placeholder="Ex: Douala"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Ville d'arrivée *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="text"
                      value={formData.arrival_city}
                      onChange={(e) => setFormData({ ...formData, arrival_city: e.target.value })}
                      placeholder="Ex: Yaoundé"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Adresse de départ</label>
                  <input
                    type="text"
                    value={formData.departure_address}
                    onChange={(e) => setFormData({ ...formData, departure_address: e.target.value })}
                    placeholder="Optionnel"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Adresse d'arrivée</label>
                  <input
                    type="text"
                    value={formData.arrival_address}
                    onChange={(e) => setFormData({ ...formData, arrival_address: e.target.value })}
                    placeholder="Optionnel"
                    className="input"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Horaires & Prix */}
        {step === 2 && (
          <>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-gray-900 dark:text-white font-bold">Détails du trajet</h2>
                  <p className="text-gray-500 dark:text-white/40 text-sm">Date, heure, places et tarif</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Date & time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="date"
                      value={formData.departure_date}
                      onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                      className="input pl-10"
                      min={today}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Heure *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="time"
                      value={formData.departure_time}
                      onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-100 dark:border-white/[0.07]" />

              {/* Seats & price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Places disponibles</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <select
                      value={formData.available_seats}
                      onChange={(e) => setFormData({ ...formData, available_seats: e.target.value })}
                      className="input pl-10"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Prix par place (FCFA) *</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="number"
                      value={formData.price_per_seat}
                      onChange={(e) => setFormData({ ...formData, price_per_seat: e.target.value })}
                      placeholder="5000"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-100 dark:border-white/[0.07]" />

              {/* Description */}
              <div>
                <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Informations supplémentaires sur votre trajet..."
                  className="input min-h-[100px] resize-none"
                />
              </div>
            </div>
          </>
        )}

        {/* Step 3: Options */}
        {step === 3 && (
          <>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <Luggage className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-gray-900 dark:text-white font-bold">Options du trajet</h2>
                  <p className="text-gray-500 dark:text-white/40 text-sm">Préférences et commodités</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-gray-600 dark:text-white/55 text-sm font-medium">Préférences de voyage</p>
              <div className="space-y-2">
                {[
                  { key: 'smoking', label: 'Fumeur accepté', icon: Cigarette },
                  { key: 'music', label: 'Musique pendant le trajet', icon: Music },
                  { key: 'pets', label: 'Animaux acceptés', icon: PawPrint },
                ].map((pref) => {
                  const Icon = pref.icon
                  const checked = formData.preferences[pref.key as keyof typeof formData.preferences] as boolean
                  return (
                    <label
                      key={pref.key}
                      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-500 dark:text-white/40" />
                      </div>
                      <span className="flex-1 text-gray-700 dark:text-white/70 text-sm font-medium">{pref.label}</span>
                      <div className={`w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${checked ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10'}`}
                        onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, [pref.key]: !checked } })}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${checked ? 'translate-x-5' : ''}`} />
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, [pref.key]: e.target.checked } })}
                        className="sr-only"
                      />
                    </label>
                  )
                })}
              </div>

              <div className="border-b border-gray-100 dark:border-white/[0.07]" />

              <div>
                <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Taille des bagages acceptée</label>
                <select
                  value={formData.preferences.luggage}
                  onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, luggage: e.target.value } })}
                  className="input"
                >
                  <option value="small">Petit (sac à dos)</option>
                  <option value="medium">Moyen (valise cabine)</option>
                  <option value="large">Grand (valise standard)</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Step 4: Véhicule */}
        {step === 4 && (
          <>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-gray-900 dark:text-white font-bold">Véhicule</h2>
                  <p className="text-gray-500 dark:text-white/40 text-sm">Informations sur votre voiture</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Immatriculation *</label>
                  <input
                    type="text"
                    value={formData.vehicle_registration}
                    onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value })}
                    placeholder="Ex: LT 1234 A"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Marque *</label>
                  <input
                    type="text"
                    value={formData.vehicle_brand}
                    onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                    placeholder="Ex: Toyota"
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Couleur *</label>
                <input
                  type="text"
                  value={formData.vehicle_color}
                  onChange={(e) => setFormData({ ...formData, vehicle_color: e.target.value })}
                  placeholder="Ex: Blanc"
                  className="input"
                />
              </div>

              <div className="border-b border-gray-100 dark:border-white/[0.07]" />

              <div className="space-y-3">
                <label className="block text-gray-600 dark:text-white/55 text-sm font-medium">
                  <ImagePlus className="inline w-4 h-4 mr-1.5" />
                  Photos du véhicule
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setVehiclePhotos(files.slice(0, 6))
                  }}
                  className="input"
                />
                <p className="text-xs text-gray-500 dark:text-white/40">
                  Jusqu'à 6 photos (JPEG/PNG/WebP). La première sera utilisée comme photo principale.
                </p>

                {vehiclePhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {vehiclePhotos.map((f, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.03]">
                        <div className="p-2 text-xs text-gray-600 dark:text-white/40 truncate">{f.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="px-6 py-5 border-t border-gray-100 dark:border-white/[0.07] flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-outline flex-1"
            >
              <ArrowLeft className="w-4 h-4" /> Précédent
            </button>
          )}
          {step < 4 ? (
            <button onClick={nextStep} className="btn-primary flex-1">
              Suivant <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isLoading} className="btn-primary flex-1">
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Création en cours...</>
                : <><Car className="w-4 h-4" /> Publier le trajet</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
