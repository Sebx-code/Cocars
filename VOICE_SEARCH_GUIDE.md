# 🎙️ Fonctionnalité de Recherche Vocale de Trajets - CoCar

## Vue d'ensemble

La fonctionnalité de **recherche vocale** permet aux utilisateurs de chercher des trajets en parlant une phrase naturelle (transcrite en texte), plutôt que de remplir des formulaires complexes.

### Exemple d'utilisation
```
Utilisateur: "Je recherche un trajet de Douala à Yaoundé demain à 16h, j'ai 4000 francs"

Système retourne: Les trajets disponibles matchant ces critères, triés par pertinence
```

---

## 🏗️ Architecture

### Service : `VoiceSearchService`
**Fichier** : `app/Services/VoiceSearchService.php`

Responsabilités:
- Parser une phrase vocale en composants structurés
- Extraire: villes, date, heure, budget
- Valider contre une liste prédéfinie de villes
- Normaliser les variantes (accents, casse, etc.)

**Villes supportées** (Cameroun):
- Douala, Yaoundé, Bamenda, Limbe, Kribi
- Buea, Garoua, Ngaoundéré, Bertoua, Ebolowa
- Dschang, Bafoussam

**Variantes de villes** (normalisées):
- `yaounde`, `ydé`, `yao` → `Yaoundé`
- `douala`, `dla` → `Douala`
- Et autres variantes

### Contrôleur : `VoiceSearchController`
**Fichier** : `app/Http/Controllers/Api/VoiceSearchController.php`

Endpoint: `POST /api/voice-search`

Responsabilités:
- Recevoir la phrase vocale
- Appeler le service pour parser
- Rechercher les trajets corresponants
- Trier par pertinence

---

## 📋 Spécifications Techniques

### Parsing de la phrase vocale

**Entrée** (phrase naturelle):
```
"je recherche un trajet douala yaounde demain a 16h j'ai 4000"
```

**Sortie** (objet JSON):
```json
{
  "departure": "Douala",
  "destination": "Yaoundé",
  "date": "2026-04-10",
  "time": "16:00",
  "budget": 4000
}
```

### Extraction des composants

#### 1️⃣ **Villes** (EXACTES)
- Première ville trouvée = départ
- Deuxième ville trouvée = destination
- Doit être dans la liste prédéfinie
- Supporte variantes et accents

#### 2️⃣ **Date** (Flexible)
Patterns supportés:
- Mots-clés: `demain`, `aujourd'hui`, `après-demain`
- Formats: `10/04`, `10-04`, `10 avril`
- Par défaut: aujourd'hui si non spécifiée

#### 3️⃣ **Heure** (Optionnelle)
Patterns supportés:
- `16h`, `16h30`, `16:30`
- Format HH:MM en sortie

#### 4️⃣ **Budget** (Optionnel)
Patterns supportés:
- `j'ai 4000`, `j ai 4000`
- `budget 4000`, `prix 4000`
- Nombre standalone (ex: `4000 francs`)

### Filtrage des trajets

| Critère | Règle |
|---------|-------|
| **Départ** | ✅ EXACT (case-sensitive) |
| **Destination** | ✅ EXACT (case-sensitive) |
| **Date** | ✅ EXACT |
| **Prix** | ✅ Tolérance +20% du budget |
| | Min: `budget × 0.8` |
| | Max: `budget × 1.2` |

### Tri des résultats

**Ordre de priorité** (avec budget):
1. Prix le plus proche du budget
2. Crédibilité du chauffeur (en cas d'égalité)

**Cas sans budget**:
1. Date de départ
2. Crédibilité du chauffeur

---

## 🔌 API Endpoint

### POST `/api/voice-search`

**Requête**:
```json
{
  "query": "je recherche un trajet douala yaounde demain a 16h j'ai 4000"
}
```

**Réponse (succès)** - 200 OK:
```json
{
  "success": true,
  "message": "Trajets trouvés",
  "parsed_query": {
    "departure": "Douala",
    "destination": "Yaoundé",
    "date": "2026-04-10",
    "time": "16:00",
    "budget": 4000
  },
  "trips_count": 3,
  "trips": [
    {
      "id": 1,
      "driver_id": 5,
      "departure_city": "Douala",
      "arrival_city": "Yaoundé",
      "departure_date": "2026-04-10",
      "departure_time": "16:00",
      "price_per_seat": 4000,
      "available_seats": 2,
      "driver": {
        "id": 5,
        "name": "Jean Chauffeur",
        "avatar": "...",
        "rating": 4.8,
        "credibility_points": 95
      },
      "vehicle": {
        "id": 3,
        "brand": "Toyota",
        "model": "Prius",
        "color": "blanc",
        "registration_number": "CM-2024-ABC123"
      }
    },
    ...
  ]
}
```

**Réponse (erreur - villes non trouvées)** - 400 Bad Request:
```json
{
  "success": false,
  "message": "Les villes de départ et destination n'ont pas pu être extraites",
  "parsed_query": {
    "departure": null,
    "destination": null,
    "date": "2026-04-10",
    "time": null,
    "budget": null
  }
}
```

**Réponse (erreur - validation)** - 422 Unprocessable Entity:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "query": ["The query field is required."]
  }
}
```

---

## 🧪 Tests

### Tests Unitaires
**Fichier**: `tests/Unit/Services/VoiceSearchServiceTest.php`

Exécuter:
```bash
php artisan test tests/Unit/Services/VoiceSearchServiceTest.php
```

**Tests inclus**:
- ✅ Parsing simple d'une phrase vocale
- ✅ Variantes de villes
- ✅ Extraction du budget (multiples formats)
- ✅ Extraction de l'heure
- ✅ Extraction de la date (keywords)
- ✅ Validation des paramètres
- ✅ Conversion en paramètres de query DB
- ✅ Phrases complexes et "bruyantes"
- ✅ Villes non reconnues
- ✅ Cas limites (heure invalide, prix négatif)

### Tests d'API
**Fichier**: `tests/Feature/VoiceSearchApiTest.php`

Exécuter:
```bash
php artisan test tests/Feature/VoiceSearchApiTest.php
```

**Tests inclus**:
- ✅ Recherche vocale avec résultats
- ✅ Recherche sans résultats
- ✅ Erreur de validation
- ✅ Filtre prix avec tolérance 20%
- ✅ Filtre heure approximatif (±1h)
- ✅ Variantes de villes
- ✅ Retour des infos conducteur/véhicule

---

## 📝 Exemples d'utilisation

### Exemple 1: Recherche simple
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "douala yaounde demain"}'
```

### Exemple 2: Recherche avec tous les critères
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "je veux aller de douala a yaounde demain a 14h30, j'\''ai 3500 francs"}'
```

### Exemple 3: Avec variantes de ville
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "trajet de dla vers yde apres demain"}'
```

---

## 🚀 Intégration Frontend

### React Example
```jsx
import { useState } from 'react';

export function VoiceSearch() {
  const [voiceQuery, setVoiceQuery] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voice-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: voiceQuery })
      });

      const data = await response.json();
      if (data.success) {
        setTrips(data.trips);
      } else {
        alert(data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={voiceQuery}
        onChange={(e) => setVoiceQuery(e.target.value)}
        placeholder="Dites votre recherche..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Recherche...' : 'Chercher'}
      </button>

      <div className="trips">
        {trips.map(trip => (
          <div key={trip.id} className="trip-card">
            <h3>{trip.driver.name}</h3>
            <p>{trip.departure_city} → {trip.arrival_city}</p>
            <p>Temps: {trip.departure_time}</p>
            <p>Prix: {trip.price_per_seat} FCFA</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📚 Liste des Villes Supportées

```
Cameroun:
- Douala (variantes: dla)
- Yaoundé (variantes: ydé, yaounde, yao)
- Bamenda
- Limbe
- Kribi
- Buea
- Garoua
- Ngaoundéré
- Bertoua
- Ebolowa
- Dschang
- Bafoussam
```

---

## 🔐 Sécurité

- ✅ Validation stricte des entrées
- ✅ Pas d'injection SQL (ORM Laravel)
- ✅ Rate limiting recommandé
- ✅ Pas d'accès sensible (route publique)

---

## 📦 Fichiers Créés/Modifiés

```
cocar-backend/
├── app/
│   ├── Services/
│   │   └── VoiceSearchService.php          (✨ NEW)
│   └── Http/Controllers/Api/
│       └── VoiceSearchController.php       (✨ NEW)
├── routes/
│   └── api.php                              (✏️ MODIFIED - route ajoutée)
└── tests/
    ├── Unit/Services/
    │   └── VoiceSearchServiceTest.php       (✨ NEW)
    └── Feature/
        └── VoiceSearchApiTest.php           (✨ NEW)
```

---

## 🛠️ Troubleshooting

### "Villes non trouvées"
- Vérifier l'orthographe de la phrase
- Supp vérifier une variante est bien reconnue
- Ajouter la nouvelle variante dans `CITIES_MAP`

### "Pas de trajets retournés"
- Vérifier que des trajets existent en base
- Vérifier les noms des villes exactement
- Vérifier la date (pas dans le passé)
- Vérifier le budget (prix maximal dépassé)

### "Heure pas extraite correctement"
- Utiliser format: `14h`, `14h30`, ou `14:30`
- Éviter les formats comme "14 heures"

---

## 🚦 Prochaines améliorations possibles

- [ ] Support des durées ("2h de route")
- [ ] Support des passagers ("je suis 3")
- [ ] Préférences véhicule ("climatisation", "pets allowed")
- [ ] Intégration Google Cloud Speech-to-Text
- [ ] Cache des résultats
- [ ] Analytics des requêtes vocales
- [ ] Support multilangue (anglais, pidgin)

---

**Créé**: 2026-04-10
**Version**: 1.0
**Statut**: ✅ Production Ready
