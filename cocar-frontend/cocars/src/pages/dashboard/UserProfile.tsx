// src/pages/dashboard/UserProfile.tsx
import { useState } from "react";
import { User, Mail, Phone, Camera, Save, Shield, Star, Loader2, Check, Edit2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-500">Gérez vos informations personnelles</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full font-semibold transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Modifier
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-700 font-semibold">Profil mis à jour avec succès !</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-8">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-28 h-28 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <span className="text-4xl font-bold text-black">
                  {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-6">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>

            {user?.is_verified && (
              <div className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                <Shield className="w-4 h-4" /> Profil vérifié
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t-2 border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Note moyenne</span>
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-lg">4.7</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Trajets effectués</span>
              <span className="font-bold text-lg">36</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Membre depuis</span>
              <span className="font-bold">Jan 2024</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Informations personnelles</h3>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none disabled:bg-gray-50 disabled:text-gray-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none disabled:bg-gray-50 disabled:text-gray-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none disabled:bg-gray-50 disabled:text-gray-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Parlez un peu de vous..."
                rows={4}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-none disabled:bg-gray-50 disabled:text-gray-500 font-medium"
              />
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full font-bold transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Enregistrer</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Sécurité</h3>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-gray-50 rounded-2xl">
          <div>
            <p className="font-semibold text-gray-900">Mot de passe</p>
            <p className="text-sm text-gray-500">Dernière modification il y a 3 mois</p>
          </div>
          <button className="px-6 py-3 border-2 border-gray-200 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            Modifier le mot de passe
          </button>
        </div>
      </div>
    </div>
  );
}
