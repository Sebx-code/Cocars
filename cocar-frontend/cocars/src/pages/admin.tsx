import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Car,
  MapPin,
  DollarSign,
  Settings,
  Bell,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Navigation,
  Phone,
  Maximize2,
} from "lucide-react";

declare global {
  interface Window {
    L: any;
    selectDriver: (id: number) => void;
  }
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const mapRef = useRef<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<{
    id: number;
    driver: string;
    status: "available" | "busy" | "offline";
    lat: number;
    lng: number;
    speed: number;
    battery: number;
    trips: number;
    rating: number;
    phone: string;
  } | null>(null);
  const [showMapFullscreen, setShowMapFullscreen] = useState(false);

  // Données des taxis en temps réel
  const activeTaxis: Array<{
    id: number;
    driver: string;
    status: "available" | "busy" | "offline";
    lat: number;
    lng: number;
    speed: number;
    battery: number;
    trips: number;
    rating: number;
    phone: string;
  }> = [
    {
      id: 1,
      driver: "Pierre Martin",
      status: "available",
      lat: 3.848,
      lng: 11.5021,
      speed: 0,
      battery: 95,
      trips: 12,
      rating: 4.9,
      phone: "+237 6 XX XX XX XX",
    },
    {
      id: 2,
      driver: "Jacques Fotso",
      status: "busy",
      lat: 3.858,
      lng: 11.5121,
      speed: 45,
      battery: 78,
      trips: 8,
      rating: 4.7,
      phone: "+237 6 XX XX XX XX",
    },
    {
      id: 3,
      driver: "Thomas Ndi",
      status: "available",
      lat: 3.838,
      lng: 11.4921,
      speed: 0,
      battery: 88,
      trips: 15,
      rating: 5.0,
      phone: "+237 6 XX XX XX XX",
    },
    {
      id: 4,
      driver: "Paul Mbida",
      status: "busy",
      lat: 3.868,
      lng: 11.5221,
      speed: 35,
      battery: 65,
      trips: 10,
      rating: 4.8,
      phone: "+237 6 XX XX XX XX",
    },
    {
      id: 5,
      driver: "Emmanuel Ngouo",
      status: "offline",
      lat: 3.828,
      lng: 11.4821,
      speed: 0,
      battery: 45,
      trips: 6,
      rating: 4.6,
      phone: "+237 6 XX XX XX XX",
    },
  ];

  const stats = [
    {
      title: "Courses totales",
      value: "1,284",
      change: "+12.5%",
      trend: "up",
      color: "bg-blue-500",
    },
    {
      title: "Revenus",
      value: "2.4M FCFA",
      change: "+8.2%",
      trend: "up",
      color: "bg-emerald-500",
    },
    {
      title: "Utilisateurs actifs",
      value: "5,247",
      change: "+23.1%",
      trend: "up",
      color: "bg-amber-500",
    },
    {
      title: "Chauffeurs",
      value: "142",
      change: "-2.4%",
      trend: "down",
      color: "bg-purple-500",
    },
  ];

  const recentBookings = [
    {
      id: "#TXY-1284",
      client: "Jean Dupont",
      driver: "Pierre Martin",
      from: "Yaoundé Centre",
      to: "Bastos",
      status: "completed",
      price: "2,500 FCFA",
      time: "10 min",
    },
    {
      id: "#TXY-1283",
      client: "Marie Kouam",
      driver: "En attente",
      from: "Nsimeyong",
      to: "Omnisport",
      status: "pending",
      price: "1,800 FCFA",
      time: "15 min",
    },
    {
      id: "#TXY-1282",
      client: "Paul Ngouo",
      driver: "Jacques Fotso",
      from: "Mvan",
      to: "Nlongkak",
      status: "in_progress",
      price: "3,200 FCFA",
      time: "25 min",
    },
  ];

  useEffect(() => {
    // Charger Leaflet
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      // Si la carte est déjà initialisée, ne rien faire
      if (mapRef.current) return;
      if (!window.L) return;

      const mapContainer = document.getElementById("map");
      if (!mapContainer) return;

      // Vérifier si Leaflet a déjà initialisé ce conteneur
      if ((mapContainer as any)._leaflet_id !== undefined) {
        return;
      }

      const map = window.L.map("map").setView([3.848, 11.5021], 13);
      mapRef.current = map;

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Icônes personnalisées
      const createTaxiIcon = (status: "available" | "busy" | "offline") => {
        const colors = {
          available: "#10b981",
          busy: "#f59e0b",
          offline: "#94a3b8",
        };

        return window.L.divIcon({
          html: `
            <div style="position: relative;">
              <div style="
                width: 40px;
                height: 40px;
                background: ${colors[status]};
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-size: 18px;
              ">🚕</div>
              ${
                status === "busy"
                  ? `
                <div style="
                  position: absolute;
                  top: -8px;
                  right: -8px;
                  width: 20px;
                  height: 20px;
                  background: #ef4444;
                  border: 2px solid white;
                  border-radius: 50%;
                  animation: pulse 2s infinite;
                "></div>
              `
                  : ""
              }
            </div>
          `,
          className: "custom-taxi-icon",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
      };

      // Ajouter les marqueurs
      activeTaxis.forEach((taxi) => {
        const marker = window.L.marker([taxi.lat, taxi.lng], {
          icon: createTaxiIcon(taxi.status),
        }).addTo(map);

        const statusText = {
          available: "Disponible",
          busy: "En course",
          offline: "Hors ligne",
        };

        marker.bindPopup(`
          <div style="font-family: system-ui; min-width: 200px;">
            <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1e293b;">
              ${taxi.driver}
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Statut:</span>
                <span style="
                  padding: 2px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                font-weight: 600;
                background: ${
                  taxi.status === "available"
                    ? "#d1fae5"
                    : taxi.status === "busy"
                    ? "#fef3c7"
                    : "#f1f5f9"
                };
                color: ${
                  taxi.status === "available"
                    ? "#065f46"
                    : taxi.status === "busy"
                    ? "#92400e"
                    : "#475569"
                };
              ">${statusText[taxi.status]}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Courses:</span>
              <span style="font-weight: 600; color: #1e293b;">${
                taxi.trips
              } aujourd'hui</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Note:</span>
              <span style="font-weight: 600; color: #f59e0b;">⭐ ${
                taxi.rating
              }/5</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Batterie:</span>
              <span style="font-weight: 600; color: ${
                taxi.battery > 70
                  ? "#10b981"
                  : taxi.battery > 30
                  ? "#f59e0b"
                  : "#ef4444"
              };">
                🔋 ${taxi.battery}%
              </span>
            </div>
            ${
              taxi.speed > 0
                ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Vitesse:</span>
                <span style="font-weight: 600; color: #1e293b;">🚗 ${taxi.speed} km/h</span>
              </div>
            `
                : ""
            }
          </div>
          <button onclick="window.selectDriver(${taxi.id})" style="
            width: 100%;
            margin-top: 12px;
            padding: 8px;
            background: linear-gradient(to right, #fbbf24, #f59e0b);
            color: #1e293b;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
          ">Voir les détails</button>
          </div>
        `);
      });

      // Ajouter un cercle pour la zone de couverture
      window.L.circle([3.848, 11.5021], {
        color: "#fbbf24",
        fillColor: "#fef3c7",
        fillOpacity: 0.2,
        radius: 5000,
      }).addTo(map);

      window.selectDriver = (id) => {
        const driver = activeTaxis.find((t) => t.id === id);
        if (driver) {
          setSelectedDriver(driver);
        }
      };
    };

    if (!window.L) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", Icon: LayoutDashboard },
    { id: "bookings", label: "Courses", Icon: MapPin },
    { id: "users", label: "Utilisateurs", Icon: Users },
    { id: "drivers", label: "Chauffeurs", Icon: Car },
    { id: "revenue", label: "Revenus", Icon: DollarSign },
    { id: "settings", label: "Paramètres", Icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-tip {
          display: none !important;
        }
      `}</style>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-linear-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-30 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-slate-900">T</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold">TaxiYa</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            )}
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveMenu(id)}
              className={`w-full text-sm flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeMenu === id
                  ? "bg-amber-400 text-slate-900"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 w-64 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-slate-100 rounded-lg">
                <Bell className="w-6 h-6 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    Admin TaxiYa
                  </p>
                  <p className="text-xs text-slate-500">Administrateur</p>
                </div>
                <div className="w-10 h-10 bg-linear-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">A</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="bg-linear-to-r from-amber-400 to-amber-500 rounded-2xl p-6 text-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Bienvenue sur TaxiYa Admin 👋
                </h2>
                <p className="text-slate-800">
                  Voici un aperçu de votre activité aujourd'hui
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">09 Décembre 2024</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}
                  >
                    {i === 0 && <MapPin className="w-6 h-6 text-white" />}
                    {i === 1 && <DollarSign className="w-6 h-6 text-white" />}
                    {i === 2 && <Users className="w-6 h-6 text-white" />}
                    {i === 3 && <Car className="w-6 h-6 text-white" />}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Map & Active Taxis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900">
                    Taxis en temps réel
                  </h3>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    {activeTaxis.filter((t) => t.status !== "offline").length}{" "}
                    actifs
                  </span>
                </div>
                <button
                  onClick={() => setShowMapFullscreen(!showMapFullscreen)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <Maximize2 className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <div id="map" className="w-full h-96"></div>
              <div className="p-4 bg-slate-50 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-700">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-700">En course</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
                  <span className="text-slate-700">Hors ligne</span>
                </div>
              </div>
            </div>

            {/* Active Taxis List */}
            <div className="bg-white rounded-2xl border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">Chauffeurs actifs</h3>
              </div>
              <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                {activeTaxis.map((taxi) => (
                  <div
                    key={taxi.id}
                    className="p-4 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedDriver(taxi)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {taxi.driver
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {taxi.driver}
                          </p>
                          <p className="text-xs text-slate-500">
                            {taxi.trips} courses
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          taxi.status === "available"
                            ? "bg-emerald-100 text-emerald-700"
                            : taxi.status === "busy"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {taxi.status === "available"
                          ? "Disponible"
                          : taxi.status === "busy"
                          ? "En course"
                          : "Hors ligne"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>⭐ {taxi.rating}</span>
                      <span>🔋 {taxi.battery}%</span>
                      {taxi.speed > 0 && <span>🚗 {taxi.speed} km/h</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-200">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  Courses récentes
                </h3>
                <button className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                  Voir tout
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "ID Course",
                      "Client",
                      "Chauffeur",
                      "Trajet",
                      "Statut",
                      "Prix",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {b.id}
                        </span>
                        <p className="text-xs text-slate-500">
                          Il y a {b.time}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {b.client[0]}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900">
                            {b.client}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600">{b.driver}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-slate-900 font-medium text-sm">
                            {b.from}
                          </p>
                          <p className="text-slate-500 text-sm">→ {b.to}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {b.status === "completed" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Terminée
                          </span>
                        )}
                        {b.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Clock className="w-3.5 h-3.5" />
                            En attente
                          </span>
                        )}
                        {b.status === "in_progress" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <AlertCircle className="w-3.5 h-3.5" />
                            En cours
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {b.price}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-slate-100 rounded-lg">
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 rounded-lg">
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDriver(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">
                Détails du chauffeur
              </h3>
              <button
                onClick={() => setSelectedDriver(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {selectedDriver.driver
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900">
                  {selectedDriver.driver}
                </p>
                <p className="text-sm text-slate-600">{selectedDriver.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 mb-1">Statut</p>
                <p
                  className={`font-semibold ${
                    selectedDriver.status === "available"
                      ? "text-emerald-600"
                      : selectedDriver.status === "busy"
                      ? "text-amber-600"
                      : "text-slate-600"
                  }`}
                >
                  {selectedDriver.status === "available"
                    ? "Disponible"
                    : selectedDriver.status === "busy"
                    ? "En course"
                    : "Hors ligne"}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 mb-1">
                  Courses aujourd'hui
                </p>
                <p className="font-semibold text-slate-900">
                  {selectedDriver.trips}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 mb-1">Note moyenne</p>
                <p className="font-semibold text-amber-600">
                  ⭐ {selectedDriver.rating}/5
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 mb-1">Batterie</p>
                <p
                  className={`font-semibold ${
                    selectedDriver.battery > 70
                      ? "text-emerald-600"
                      : selectedDriver.battery > 30
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  🔋 {selectedDriver.battery}%
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Appeler
              </button>
              <button className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                <Navigation className="w-5 h-5" />
                Localiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
