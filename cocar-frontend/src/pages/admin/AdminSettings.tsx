import { useState } from 'react'
import { Settings, Shield, Bell, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

function Section({ icon, title, description, children }: SectionProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.07] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-gray-600 dark:text-white/60">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-xs text-gray-400 dark:text-white/30">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
        {children}
      </div>
    </div>
  )
}

interface SettingRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function SettingRow({ label, description, checked, onChange }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    // Général
    maintenanceMode: false,
    registrationsOpen: true,
    emailVerificationRequired: true,
    autoApproveTrips: false,
    // Sécurité
    twoFactorAdmin: true,
    sessionTimeout: true,
    ipWhitelist: false,
    loginAlerts: true,
    // Notifications
    emailNewUser: true,
    emailNewTrip: false,
    emailPayment: true,
    emailRefund: true,
    smsAlerts: false,
    // Système
    debugMode: false,
    analyticsEnabled: true,
    cacheEnabled: true,
    apiRateLimit: true,
  })

  const set = (key: keyof typeof settings) => (value: boolean) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  const handleSave = () => {
    toast.success('Paramètres enregistrés avec succès')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres Admin</h1>
          <p className="text-sm text-gray-500 dark:text-white/40 mt-1">Configuration globale de la plateforme</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Settings className="w-4 h-4" />
          Enregistrer les modifications
        </button>
      </div>

      {/* Configuration générale */}
      <Section
        icon={<Settings className="w-4 h-4" />}
        title="Configuration générale"
        description="Paramètres globaux de la plateforme"
      >
        <SettingRow
          label="Mode maintenance"
          description="Affiche une page de maintenance aux utilisateurs non-admin"
          checked={settings.maintenanceMode}
          onChange={set('maintenanceMode')}
        />
        <SettingRow
          label="Inscriptions ouvertes"
          description="Autoriser les nouveaux utilisateurs à s'inscrire"
          checked={settings.registrationsOpen}
          onChange={set('registrationsOpen')}
        />
        <SettingRow
          label="Vérification email obligatoire"
          description="Les utilisateurs doivent vérifier leur email avant de pouvoir utiliser la plateforme"
          checked={settings.emailVerificationRequired}
          onChange={set('emailVerificationRequired')}
        />
        <SettingRow
          label="Approbation automatique des trajets"
          description="Les trajets publiés sont approuvés automatiquement sans révision admin"
          checked={settings.autoApproveTrips}
          onChange={set('autoApproveTrips')}
        />
      </Section>

      {/* Sécurité */}
      <Section
        icon={<Shield className="w-4 h-4" />}
        title="Sécurité"
        description="Options de sécurité et d'authentification"
      >
        <SettingRow
          label="Double authentification (admin)"
          description="Exiger la 2FA pour tous les comptes administrateur"
          checked={settings.twoFactorAdmin}
          onChange={set('twoFactorAdmin')}
        />
        <SettingRow
          label="Expiration de session"
          description="Déconnecter automatiquement après 30 minutes d'inactivité"
          checked={settings.sessionTimeout}
          onChange={set('sessionTimeout')}
        />
        <SettingRow
          label="Liste blanche IP"
          description="Restreindre l'accès admin à des adresses IP spécifiques"
          checked={settings.ipWhitelist}
          onChange={set('ipWhitelist')}
        />
        <SettingRow
          label="Alertes de connexion"
          description="Envoyer un email lors d'une connexion admin depuis un nouvel appareil"
          checked={settings.loginAlerts}
          onChange={set('loginAlerts')}
        />
      </Section>

      {/* Notifications */}
      <Section
        icon={<Bell className="w-4 h-4" />}
        title="Notifications"
        description="Configurer les notifications envoyées par la plateforme"
      >
        <SettingRow
          label="Email — Nouvel utilisateur"
          description="Notifier l'admin lors de chaque nouvelle inscription"
          checked={settings.emailNewUser}
          onChange={set('emailNewUser')}
        />
        <SettingRow
          label="Email — Nouveau trajet"
          description="Notifier l'admin lors de chaque nouveau trajet publié"
          checked={settings.emailNewTrip}
          onChange={set('emailNewTrip')}
        />
        <SettingRow
          label="Email — Paiement reçu"
          description="Envoyer un récapitulatif email pour chaque paiement"
          checked={settings.emailPayment}
          onChange={set('emailPayment')}
        />
        <SettingRow
          label="Email — Remboursement"
          description="Notifier l'admin lors de chaque demande de remboursement"
          checked={settings.emailRefund}
          onChange={set('emailRefund')}
        />
        <SettingRow
          label="Alertes SMS"
          description="Envoyer des SMS pour les événements critiques"
          checked={settings.smsAlerts}
          onChange={set('smsAlerts')}
        />
      </Section>

      {/* Système */}
      <Section
        icon={<Activity className="w-4 h-4" />}
        title="Système"
        description="Options techniques et performances"
      >
        <SettingRow
          label="Mode débogage"
          description="Activer les logs détaillés (ne pas utiliser en production)"
          checked={settings.debugMode}
          onChange={set('debugMode')}
        />
        <SettingRow
          label="Analytics activées"
          description="Collecter des données d'utilisation anonymisées"
          checked={settings.analyticsEnabled}
          onChange={set('analyticsEnabled')}
        />
        <SettingRow
          label="Cache activé"
          description="Mettre en cache les requêtes fréquentes pour de meilleures performances"
          checked={settings.cacheEnabled}
          onChange={set('cacheEnabled')}
        />
        <SettingRow
          label="Limitation du taux API"
          description="Appliquer des limites de requêtes par utilisateur pour l'API"
          checked={settings.apiRateLimit}
          onChange={set('apiRateLimit')}
        />
      </Section>
    </div>
  )
}
