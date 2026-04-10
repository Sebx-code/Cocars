# Exemples de Requêtes : Recherche Vocale

## Configuration

**URL de base :** `http://localhost:8000/api` (ou selon votre configuration)

**Headers requis :**
```
Content-Type: application/json
```

---

## Exemple 1 : Requête Complète (Douala → Yaoundé)

Phrase vocale :
```
"Je recherche un trajet de Douala à Yaoundé demain à 16h, j'ai 4000"
```

**Requête cURL :**
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Je recherche un trajet de Douala à Yaoundé demain à 16h, j'"'"'ai 4000"
  }'
```

**Réponse attendue :**
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
  "trips_count": 2,
  "trips": [
    {
      "id": 2,
      "driver_id": 2,
      "departure_city": "Douala",
      "arrival_city": "Yaoundé",
      "departure_date": "2026-04-11",
      "departure_time": "16:00",
      "price_per_seat": 3800,
      "available_seats": 1
    }
  ]
}
```

---

## Exemple 2 : Recherche Minimale (Sans heure ni budget)

Phrase vocale :
```
"Douala à Bamenda"
```

**Requête cURL :**
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Douala à Bamenda"}'
```

**Réponse :**
```json
{
  "success": true,
  "message": "Trajets trouvés",
  "parsed_query": {
    "departure": "Douala",
    "destination": "Bamenda",
    "date": null,
    "time": null,
    "budget": null,
    "error": null
  },
  "trips_count": 1,
  "trips": [...]
}
```

---

## Exemple 3 : Recherche avec Variante de Ville

Phrase vocale :
```
"ydé vers Douala demain à 14h"
```

**Requête cURL :**
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "ydé vers Douala demain à 14h"}'
```

**Note :** `ydé` est reconnu comme `Yaoundé`

---

## Exemple 4 : Recherche avec Mot-clé "Budget"

Phrase vocale :
```
"je veux aller de Douala à Yaoundé demain budget 3500"
```

**Requête cURL :**
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "je veux aller de Douala à Yaoundé demain budget 3500"}'
```

---

## Exemple 5 : Recherche avec Date JJ/MM

Phrase vocale :
```
"Douala Yaoundé 14/04 à 10h j'"'"'ai 4500"
```

**Requête cURL :**
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Douala Yaoundé 14/04 à 10h j'"'"'ai 4500"}'
```

---

## Exemple 6 : Recherche "Aujourd'hui"

Phrase vocale :
```
"aujourd'"'"'hui Douala vers Yaoundé à 14h30 prix 3800"
```

**Requête cURL :**
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "aujourd'"'"'hui Douala vers Yaoundé à 14h30 prix 3800"}'
```

---

## Exemple 7 : Format Heure HH:MM

Phrase vocale :
```
"Douala Yaoundé demain 16:30 j'"'"'ai 4000"
```

**Requête cURL :**
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Douala Yaoundé demain 16:30 j'"'"'ai 4000"}'
```

---

## Exemple 8 : Erreur - Villes Manquantes

Phrase vocale :
```
"demain à 16h j'"'"'ai 5000"
```

**Requête cURL :**
```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "demain à 16h j'"'"'ai 5000"}'
```

**Réponse (erreur) :**
```json
{
  "success": false,
  "message": "Les villes de départ et destination n'ont pas pu être extraites",
  "parsed_query": {
    "departure": null,
    "destination": null,
    "date": "2026-04-11",
    "time": "16:00",
    "budget": 5000,
    "error": "Villes de départ ou destination non trouvées"
  }
}
```

---

## Exemple 9 : Avec Python Requests

```python
import requests
import json

url = "http://localhost:8000/api/voice-search"
payload = {
    "query": "Je recherche un trajet de Douala à Yaoundé demain à 16h, j'ai 4000"
}

response = requests.post(url, json=payload)
data = response.json()

print("Succès :", data['success'])
print("Nombre de trajets :", data['trips_count'])

for trip in data['trips']:
    print(f"\nTrajet {trip['id']} :")
    print(f"  De {trip['departure_city']} à {trip['arrival_city']}")
    print(f"  Prix : {trip['price_per_seat']} FCFA")
    print(f"  Places disponibles : {trip['available_seats']}")
```

---

## Exemple 10 : Avec JavaScript/Fetch

```javascript
async function searchTrips() {
  const query = "Je recherche un trajet de Douala à Yaoundé demain à 16h, j'ai 4000";
  
  const response = await fetch('http://localhost:8000/api/voice-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();

  if (data.success) {
    console.log(`${data.trips_count} trajet(s) trouvé(s)`);
    data.trips.forEach(trip => {
      console.log(`${trip.departure_city} → ${trip.arrival_city} : ${trip.price_per_seat} FCFA`);
    });
  } else {
    console.error(data.message);
  }
}

searchTrips();
```

---

## Testing avec Postman

1. Ouvrez Postman
2. Créez une nouvelle requête POST
3. URL : `http://localhost:8000/api/voice-search`
4. Headers : `Content-Type: application/json`
5. Body (raw JSON) :

```json
{
  "query": "Je recherche un trajet de Douala à Yaoundé demain à 16h, j'ai 4000"
}
```

6. Cliquez sur "Send"

---

## Commandes Utiles

### Créer les données de test

```bash
cd /Users/seb/dev/Cocars-main/cocar-backend
php artisan db:seed --class=VoiceSearchTestTripsSeeder
```

### Exécuter les tests unitaires

```bash
php artisan test tests/Unit/VoiceSearchServiceTest.php
```

### Tester avec tinker (CLI Laravel)

```bash
php artisan tinker

# Une fois dans tinker :
$service = app(\App\Services\VoiceSearchService::class);
$result = $service->parseSearchQuery("Douala Yaoundé demain à 16h j'ai 4000");
dd($result);
```

---

## Notes Importantes

⚠️ **Format sans apostrophe :** Si vous avez un problème avec les apostrophes en JSON, remplacez-les :
- `j'ai` → `j ai`
- `aujourd'hui` → `aujourd hui`

✅ **Accents :** Les accents sont automatiquement normalisés :
- `yaounde` est reconnu comme `Yaoundé`
- `ydé` est reconnu comme `Yaoundé`

📍 **Budget approximatif :** Une tolérance de +20% est appliquée :
- Budget `4000` → Prix acceptés jusqu'à `4800` FCFA

🔍 **Tri des résultats :**
- Avec budget : triés par prix le plus proche
- Sans budget : triés par date puis crédibilité du chauffeur

✅ **Validation des villes :** Les villes doivent correspondre exactement à la liste supportée
