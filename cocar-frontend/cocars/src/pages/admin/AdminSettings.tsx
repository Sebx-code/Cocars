// cocar-frontend/cocars/src/pages/admin/AdminSettings.tsx
import { useState } from "react";
import { Save, Bell, Shield, Globe, Palette } from "lucide-react";
import { useTheme } from "../../contexts/themeContext";

export default function AdminSettings() {
  const { isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    siteName: "Rideshare",
    contactEmail: "contact@rideshare.cm",
    commissionRate: 10,
    minPrice: 500,
    maxSeats: 8,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
  });

  const handleSave = () => {
    // TODO: Sauvegarder les paramètres via l'API
    alert("Paramètres sauvegardés !");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-theme-primary">Paramètres</h1>
        <p className="text-theme-tertiary">Configurez les paramètres de la plateforme</p>
      </div>

      {/* General Settings */}
      <div className="card-theme rounded-3xl border-2 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-theme-primary">Paramètres généraux</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Nom du site
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="input-theme w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Email de contact
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="input-theme w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Commission (%)
              </label>
              <input
                type="number"
                value={settings.commissionRate}
                onChange={(e) => setSettings({ ...settings, commissionRate: parseInt(e.target.value) })}
                className="input-theme w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Prix minimum (FCFA)
              </label>
              <input
                type="number"
                value={settings.minPrice}
                onChange={(e) => setSettings({ ...settings, minPrice: parseInt(e.target.value) })}
                className="input-theme w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Places max par trajet
              </label>
              <input
                type="number"
                value={settings.maxSeats}
                onChange={(e) => setSettings({ ...settings, maxSeats: parseInt(e.target.value) })}
                className="input-theme w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card-theme rounded-3xl border-2 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-lg font-bold text-theme-primary">Apparence</h2>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-theme">
          <div>
            <p className="font-medium text-theme-primary">Mode sombre</p>
            <p className="text-sm text-theme-tertiary">Activer le thème sombre pour l'interface</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isDark ? "bg-yellow-400" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                isDark ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card-theme rounded-3xl border-2 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-bold text-theme-primary">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-theme">
            <div>
              <p className="font-medium text-theme-primary">Notifications par email</p>
              <p className="text-sm text-theme-tertiary">Recevoir les alertes par email</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.emailNotifications ? "bg-yellow-400" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings.emailNotifications ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-theme-primary">Notifications SMS</p>
              <p className="text-sm text-theme-tertiary">Recevoir les alertes par SMS</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, smsNotifications: !settings.smsNotifications })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.smsNotifications ? "bg-yellow-400" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings.smsNotifications ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card-theme rounded-3xl border-2 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-theme-primary">Sécurité</h2>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium text-theme-primary">Mode maintenance</p>
            <p className="text-sm text-theme-tertiary">Désactiver temporairement le site</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.maintenanceMode ? "bg-red-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                settings.maintenanceMode ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full font-bold transition-all hover:scale-105"
        >
          <Save className="w-5 h-5" />
          Sauvegarder les paramètres
        </button>
      </div>
    </div>
  );
}
