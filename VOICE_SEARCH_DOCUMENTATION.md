# Documentation : Recherche Vocale de Trajets

## Vue d'ensemble

La fonctionnalité de recherche vocale permet aux utilisateurs de trouver des trajets en utilisant des phrases parlées transformées en texte. Le système parse automatiquement la requête pour extraire :

- **Ville de départ** (exacte)
- **Ville de destination** (exacte)
- **Date du trajet**
- **Heure approximative**
- **Budget disponible**

## Exemple de phrase vocale

```
"je recherche un trajet douala yaounde demain a 16h j'ai 4000"
```

Résultat parsé :

```json
{
  "departure": "Douala",
  "destination": "Yaoundé",
  "date": "2026-04-11",
  "time": "16:00",
  "budget": 4000
}
```

## Endpoint API

### POST `/api/voice-search`

**Headers :**
```
Content-Type: application/json
```

**Payload :**
```json
{
  "query": "je recherche un trajet douala yaounde demain a 16h j'ai 4000"
}
```

**Réponse (succès) :**
```json
{
  "success": true,
  "message": "Trajets trouvés",
  "parsed_query": {
    "departure": "Douala",
    "destination": "Yaoundé",
    "date": "2026-04-11",
    "time": "16:00",
    "budget": 4000,
    "error": null
  },
  "trips_count": 3,
  "trips": [
    {
      "id": 1,
      "driver_id": 5,
      "vehicle_id": 2,
      "departure_city": "Douala",
      "arrival_city": "Yaoundé",
      "departure_date": "2026-04-11",
      "departure_time": "16:00",
      "price_per_seat": 3800,
      "available_seats": 2,
      "total_seats": 4,
      "driver": {
        "id": 5,
        "name": "Jean Dupont",
        "avatar": "https://...",
        "rating": 4.8,
        "credibility_points": 450
      },
      "vehicle": {
        "id": 2,
        "brand": "Toyota",
        "model": "Corolla",
        "color": "Noir",
        "registration_number": "CM-8974-AU"
      }
    }
  ]
}
```

**Réponse (erreur) :**
```json
{
  "success": false,
  "message": "Les villes de départ et destination n'ont pas pu être extraites",
  "parsed_query": {
    "departure": null,
    "destination": null,
    "date": null,
    "time": null,
    "budget": null,
    "error": "Villes de départ ou destination non trouvées"
  }
}
```

## Villes Supportées

Les villes suivantes sont reconnues (y compris leurs variantes) :

- **Douala** → `douala`
- **Yaoundé** → `yaounde`, `ydé`, `yaoundé`
- **Bamenda** → `bamenda`
- **Limbe** → `limbe`
- **Kribi** → `kribi`
- **Buea** → `buea`
- **Garoua** → `garoua`
- **Ngaoundéré** → `ngaoundere`, `ngaoundéré`
- **Bertoua** → `bertoua`
- **Ebolowa** → `ebolowa`
- **Dschang** → `dschang`
- **Bafoussam** → `bafoussam`

## Critères de Filtrage

### 1. Villes (EXACT)

- La ville de départ doit **exactement** correspondre à une ville dans la liste supportée
- La ville d'arrivée doit **exactement** correspondre à une ville dans la liste supportée
- Les correspondances ne sont pas sensibles aux accents grâce aux variantes

### 2. Date (Si fournie)

Formats supportés :
- **Mot-clé "demain"** : définit la date à J+1
- **Mot-clé "aujourd'hui"** : définit la date à J
- **Format JJ/MM ou JJ-MM** : ex. "14/04" ou "14-04"

Si aucune date n'est trouvée, le filtre date est ignoré.

### 3. Heure (À titre informatif)

Formats supportés :
- `16h` → `16:00`
- `14h30` → `14:30`
- `14:00` → `14:00`

L'heure est extraite mais **n'est pas utilisée pour filtrer** les trajets (elle est à titre informatif).

### 4. Budget (Tolérance de +20%)

- Si un budget est fourni, seuls les trajets avec un prix ≤ `budget * 1.2` sont retournés
- Les résultats sont **triés par pertinence** (prix le plus proche du budget)

Le budget peut être extrait depuis :
- `j'ai 4000`
- `budget 5000`
- `prix 3500`
- `j ai 4000` (sans apostrophe)
- Dernier nombre de 3-6 chiffres de la phrase (fallback)

## Exemples d'Utilisation

### Exemple 1 : Recherche complète

**Requête vocale :**
```
"Je recherche un trajet de Douala à Yaoundé demain à 16h. J'ai 4000 FCFA"
```

**Appel API :**
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Je recherche un trajet de Douala à Yaoundé demain à 16h. J'"'"'ai 4000 FCFA"}'
```

---

### Exemple 2 : Recherche minimale (sans heure ni budget)

**Requête vocale :**
```
"Douala vers Bamenda"
```

Résultat : Tous les trajets disponibles de Douala à Bamenda, triés par crédibilité du chauffeur.

---

### Exemple 3 : Recherche avec variante de ville

**Requête vocale :**
```
"ydé vers Douala demain j'ai 3500"
```

Le système reconnait `ydé` comme `Yaoundé`.

---

### Exemple 4 : Recherche avec différents formats d'heure et budget

**Requête vocale :**
```
"De Douala à Bafoussam le 15/04 à 14h30 prix 2500"
```

Résultat : Trajets de Douala à Bafoussam le 15 avril avec prix ≤ 3000 FCFA (2500 * 1.2).

## Architecture du Code

### Service : `VoiceSearchService`

**Localisation :** `/app/Services/VoiceSearchService.php`

Méthodes publiques :

```php
// Parse une requête vocale
parseSearchQuery(string $query): array

// Valide une ville
validateCity(string $city): ?string

// Retourne la liste des villes supportées
getSupportedCities(): array
```

### Contrôleur : `VoiceSearchController`

**Localisation :** `/app/Http/Controllers/Api/VoiceSearchController.php`

Actions :

```php
// Recherche les trajets basée sur une requête vocale
search(Request $request): JsonResponse

// Retourne la liste des villes supportées
getSupportedCities(): JsonResponse
```

### Route

```php
// Route publique (pas d'authentification requise)
Route::post('/voice-search', [VoiceSearchController::class, 'search']);
```

## Algorithme de Parsing

### 1. Normalisation
- Convertir toute la phrase en minuscules
- Supprimer les espaces inutiles

### 2. Extraction des villes
- Itérer sur la `CITIES_MAP` pour trouver les variantes présentes dans la requête
- Assigner la première ville à `departure` et la deuxième à `destination`

### 3. Extraction de la date
- Chercher les mots-clés "demain" et "aujourd'hui"
- Chercher les patterns JJ/MM ou JJ-MM (regex)
- Convertir en date ISO (YYYY-MM-DD)

### 4. Extraction de l'heure
- Chercher les patterns `HHh`, `HHhMM`, `HH:MM` (regex)
- Valider les plages (0-23 heures, 0-59 minutes)
- Convertir en format HH:MM

### 5. Extraction du budget
- Chercher les mots-clés ("j'ai", "budget", "prix", etc.)
- Chercher les nombres de 3-6 chiffres (fallback)
- Prendre le dernier nombre trouvé

### 6. Tri des résultats
- Si budget fourni : trier par proximité du budget (prix le plus proche)
- Sinon : trier par date de départ, puis par crédibilité du chauffeur

## Régex Utilisées

```php
// Extraction des heures (HHh, HHhMM)
/(\d{1,2})h(\d{2})?/

// Extraction des heures (HH:MM)
/(\d{1,2}):(\d{2})/

// Extraction des dates (JJ/MM ou JJ-MM)
/(\d{1,2})[\/\-](\d{1,2})/

// Extraction du budget avec mots-clés
/(j'ai|j ai|budget|prix|cout|coût|montant)\s+(\d{1,6})/

// Extraction des nombres à fallback
/(\d{3,6})(?!h)/
```

## Tests Unitaires

**Localisation :** `/tests/Unit/VoiceSearchServiceTest.php`

Exécuter les tests :

```bash
php artisan test tests/Unit/VoiceSearchServiceTest.php
```

Tests couverts :
- Parsing complet d'une phrase vocale
- Extraction des villes avec variantes
- Extraction de dates (demain, aujourd'hui, JJ/MM)
- Extraction des heures (formats multiples)
- Extraction du budget
- Validation des villes
- Gestion des erreurs

## Contraintes et Limitations

### Respectées ✅

1. **Villes exactes** : Les villes doivent correspondre à la liste prédéfinie
2. **Prix approximatif** : Tolérance de +20% respectée
3. **Liste prédéfinie** : 15 villes camerounaises supportées
4. **Logique simple/regex** : Utilise uniquement regex et logique simple
5. **Tri par pertinence** : Triés par proximité du budget

### Limitations ⚠️

1. **Pas de reconnaissance vocale native** : La requête doit être un texte
2. **Pas de géolocalisation** : Pas de recherche par proximité GPS
3. **Pas de filtres avancés** : Pas de filtres pour fumeurs/animaux/musique
4. **Heure non filtrée** : L'heure est extraite mais pas utilisée pour filtrer

## Points Bonus Réalisés ✨

1. ✅ Support de variantes simples de villes (Yaounde, ydé)
2. ✅ Tri des résultats par proximité du budget
3. ✅ Normalisation des accents et casse
4. ✅ Tests unitaires complets
5. ✅ Gestion d'erreurs robuste

## Prochaines Améliorations (Optionnelles)

- Intégration avec une API de reconnaissance vocale (Google Speech-to-Text, Azure)
- Filtrage par heure de départ (±30 minutes)
- Support des filtres de confort (fumeurs, animaux, musique)
- Géolocalisation pour recherche proximité
- Cache des résultats populaires
- Analytics sur les requêtes vocales
