# 🌟 Système de Notation et Crédibilité - COCAR

**Date:** 2026-02-07  
**Statut:** ✅ **COMPLET ET OPÉRATIONNEL**

---

## 📋 Vue d'ensemble

Le système de notation de COCAR combine deux mécanismes complémentaires :
1. **Notes traditionnelles (1-5 ⭐)** - Moyenne des évaluations reçues
2. **Points de crédibilité** - Système gamifié influençant le classement des trajets

---

## 🎯 Objectifs

Selon le `scenario.md` :
> "La position d'un trajet dans le fil des trajets dépend du niveau de crédibilité d'un chauffeur. Plus on a de points, plus on a d'étoiles et plus on est en haut de la liste. Le nombre de points de crédibilité influence le nombre d'étoiles que chaque chauffeur reçoit ; et le nombre d'étoiles influence la position des trajets publiés par un chauffeur sur le fil des trajets."

**Résultat:** ✅ Les trajets sont maintenant triés par crédibilité par défaut

---

## ⭐ Système d'Étoiles de Crédibilité

### **Niveaux de Crédibilité**

| Étoiles | Points Requis | Description |
|---------|---------------|-------------|
| ⭐ 1 étoile | 0 - 49 points | Débutant - Peu d'expérience |
| ⭐⭐ 2 étoiles | 50 - 99 points | Apprenti - En progression |
| ⭐⭐⭐ 3 étoiles | 100 - 199 points | Confirmé - Bon niveau (**Par défaut**) |
| ⭐⭐⭐⭐ 4 étoiles | 200 - 399 points | Expert - Très fiable |
| ⭐⭐⭐⭐⭐ 5 étoiles | 400+ points | Elite - Référence absolue |

**Point de départ:** Tous les utilisateurs commencent avec **100 points** = **3 étoiles** ⭐⭐⭐

---

## 💯 Gains et Pertes de Points

### **Actions Positives** ✅

| Action | Points Gagnés | Description |
|--------|---------------|-------------|
| **Trajet complété** | +10 | Chaque trajet terminé avec succès |
| **Note excellente (5/5)** | +20 | Évaluation parfaite reçue |
| **Bonne note (4/5)** | +10 | Bonne évaluation reçue |
| **Départ à l'heure** | +5 | Ponctualité (à implémenter) |

### **Actions Négatives** ❌

| Action | Points Perdus | Description |
|--------|---------------|-------------|
| **Chauffeur absent** | -50 | No-show du chauffeur (≈ -1 étoile) |
| **Passager absent** | -10 | No-show du passager |
| **Mauvaise note (1-2/5)** | -15 | Évaluation négative reçue |
| **Annulation trajet** | -5 | Trajet annulé par le chauffeur |
| **Plaintes multiples** | -30 | Plusieurs signalements |

### **Actions Neutres** ⚪

| Action | Points | Description |
|--------|--------|-------------|
| **Note moyenne (3/5)** | 0 | Pas de changement |
| **Annulation anticipée** | 0 | Avant le jour du voyage |

---

## 🔄 Flux Automatique

### **Scénario 1: Voyage Réussi** 🎉

```
1. Passager et chauffeur confirment le départ
   └─ Voyage démarre

2. Voyage se termine
   └─ Booking.complete() appelé
   
3. Actions automatiques:
   ├─ Chauffeur: +10 points ("Trajet complété")
   ├─ Passager: +10 points ("Trajet complété")
   └─ Stats mises à jour

4. Évaluations échangées
   ├─ Note 5/5 au chauffeur → +20 points supplémentaires
   └─ Note 4/5 au passager → +10 points supplémentaires

Total chauffeur: +30 points (10 + 20)
Total passager: +20 points (10 + 10)
```

### **Scénario 2: Passager Absent** ❌

```
1. Chauffeur signale l'absence (markAsNoShow)

2. Actions automatiques:
   ├─ Passager: -10 points de crédibilité
   ├─ Remboursement: Montant - 500 FCFA
   └─ Notification envoyée

Exemple:
Avant: 100 points → 3 étoiles
Après: 90 points → 2 étoiles
```

### **Scénario 3: Chauffeur Absent** 🚫

```
1. Passager signale l'absence (markDriverAsNoShow)

2. Actions automatiques:
   ├─ Chauffeur: -50 points (équivalent -1 étoile)
   ├─ Passager: Remboursement 100% (sans pénalité)
   └─ Notifications envoyées

Exemple:
Avant: 150 points → 3 étoiles
Après: 100 points → 3 étoiles (juste à la limite)

Avant: 120 points → 3 étoiles
Après: 70 points → 2 étoiles (perte d'une étoile)
```

### **Scénario 4: Évaluation Reçue** ⭐

```
1. Utilisateur reçoit une note

2. Rating.created() → adjustCredibilityPoints()

3. Ajustement automatique:
   ├─ Note 5/5 → +20 points
   ├─ Note 4/5 → +10 points
   ├─ Note 3/5 → 0 point (neutre)
   └─ Note 1-2/5 → -15 points

4. Notifications envoyées selon le changement
```

---

## 📊 Progression et Gamification

### **Calcul de Progression**

Méthode: `User::getCredibilityProgress()`

```php
// Exemple: Utilisateur avec 150 points (3 étoiles)
[
    'current_stars' => 3,
    'next_stars' => 4,
    'current_points' => 150,
    'points_needed' => 50,  // 200 - 150
    'progress_percent' => 50,  // (150 - 100) / (200 - 100) * 100
    'max_level' => false
]
```

### **Interface Utilisateur Suggérée**

```
┌─────────────────────────────────────────┐
│ 🌟 Votre Crédibilité                    │
├─────────────────────────────────────────┤
│                                         │
│ ⭐⭐⭐ 3 Étoiles - Confirmé             │
│                                         │
│ 150 / 200 points                        │
│ [████████████░░░░░░░░] 50%              │
│                                         │
│ Encore 50 points pour atteindre         │
│ ⭐⭐⭐⭐ 4 Étoiles - Expert              │
│                                         │
│ 💡 Conseils:                            │
│ • Complétez plus de trajets (+10)       │
│ • Obtenez des notes 5/5 (+20)           │
│ • Soyez ponctuel (+5)                   │
└─────────────────────────────────────────┘
```

---

## 🗃️ Structure de Base de Données

### **Migration: `add_credibility_points_to_users_table`**

```sql
ALTER TABLE users ADD COLUMN credibility_points INT DEFAULT 100 
  COMMENT 'Points de crédibilité (100 par défaut, influence les étoiles)';

ALTER TABLE users ADD COLUMN total_positive_points INT DEFAULT 0
  COMMENT 'Total des points positifs gagnés';

ALTER TABLE users ADD COLUMN total_negative_points INT DEFAULT 0
  COMMENT 'Total des points négatifs perdus';
```

### **Champs du Modèle User**

```php
protected $fillable = [
    // ...
    'credibility_points',
    'total_positive_points',
    'total_negative_points',
];

protected $casts = [
    'credibility_points' => 'integer',
    'total_positive_points' => 'integer',
    'total_negative_points' => 'integer',
];
```

---

## 🔧 API et Méthodes

### **Méthodes du Modèle User**

```php
// Calculer les étoiles de crédibilité
public function getCredibilityStars(): int

// Ajouter des points
public function addCredibilityPoints(int $points, string $reason = null): void

// Retirer des points
public function removeCredibilityPoints(int $points, string $reason = null): void

// Progression vers niveau suivant
public function getCredibilityProgress(): array
```

### **Endpoints API**

#### **1. Profil Utilisateur**
```http
GET /api/users/{id}/profile
```

**Réponse:**
```json
{
  "id": 123,
  "name": "Jean Dupont",
  "rating": 4.8,
  "credibility_stars": 4,
  "credibility_points": 250,
  "trips_as_driver_count": 45
}
```

#### **2. Statistiques Utilisateur**
```http
GET /api/user/stats
```

**Réponse:**
```json
{
  "credibility_points": 250,
  "credibility_stars": 4,
  "credibility_progress": {
    "current_stars": 4,
    "next_stars": 5,
    "current_points": 250,
    "points_needed": 150,
    "progress_percent": 25,
    "max_level": false
  },
  "total_positive_points": 340,
  "total_negative_points": 90
}
```

#### **3. Liste des Trajets (Tri par Crédibilité)**
```http
GET /api/trips?sort_by=credibility&sort_order=desc
```

**Par défaut:** Les trajets sont triés par crédibilité (descendant)

---

## 📈 Classement des Trajets

### **Ordre de Tri par Défaut**

```sql
SELECT trips.* 
FROM trips 
JOIN users ON trips.driver_id = users.id
WHERE trips.status = 'confirmed'
  AND trips.available_seats > 0
ORDER BY 
  users.credibility_points DESC,  -- Plus haut en premier
  trips.departure_date ASC,
  trips.departure_time ASC
```

### **Résultat Visuel**

```
┌────────────────────────────────────────┐
│ Fil des Trajets                        │
├────────────────────────────────────────┤
│ 1. ⭐⭐⭐⭐⭐ Chauffeur Elite (450 pts) │
│    Yaoundé → Douala - 5,000 FCFA       │
│                                        │
│ 2. ⭐⭐⭐⭐ Chauffeur Expert (280 pts)  │
│    Yaoundé → Douala - 4,500 FCFA       │
│                                        │
│ 3. ⭐⭐⭐ Chauffeur Confirmé (150 pts)  │
│    Yaoundé → Douala - 4,000 FCFA       │
│                                        │
│ 4. ⭐⭐ Chauffeur Apprenti (75 pts)     │
│    Yaoundé → Douala - 3,500 FCFA       │
└────────────────────────────────────────┘
```

**Avantage:** Les chauffeurs fiables et expérimentés ont plus de visibilité

---

## 🔔 Notifications Automatiques

### **Gain de Points**
```json
{
  "type": "credibility_increased",
  "title": "Points de crédibilité gagnés !",
  "message": "Vous avez gagné +10 points de crédibilité. Trajet complété: Yaoundé → Douala",
  "data": {
    "points": 10,
    "reason": "Trajet complété"
  }
}
```

### **Perte de Points**
```json
{
  "type": "credibility_decreased",
  "title": "Perte de crédibilité",
  "message": "Vous avez perdu -50 points de crédibilité. Absence signalée pour le trajet Yaoundé → Douala",
  "data": {
    "points": -50,
    "reason": "Chauffeur absent",
    "old_stars": 4,
    "new_stars": 3
  }
}
```

### **Perte d'Étoile(s)**
```json
{
  "type": "star_lost",
  "title": "⭐ Étoile perdue",
  "message": "Votre niveau de crédibilité est passé de 4 à 3 étoile(s).",
  "data": {
    "old_stars": 4,
    "new_stars": 3
  }
}
```

---

## 📝 Logs et Traçabilité

Toutes les actions sont loggées pour audit :

```php
// Ajout de points
Log::info("Crédibilité ajoutée", [
    'user_id' => 123,
    'points' => 10,
    'reason' => 'Trajet complété',
    'new_total' => 110,
    'stars' => 3
]);

// Retrait de points
Log::warning("Crédibilité retirée", [
    'user_id' => 123,
    'points' => -50,
    'reason' => 'Chauffeur absent',
    'new_total' => 60,
    'old_stars' => 3,
    'new_stars' => 2
]);
```

---

## 🎮 Exemples de Scénarios Complets

### **Parcours d'un Nouveau Chauffeur**

```
Jour 1: Inscription
└─ Points: 100 → ⭐⭐⭐ (3 étoiles)

Jour 2: Premier trajet complété
├─ +10 points (trajet complété)
└─ Points: 110 → ⭐⭐⭐ (3 étoiles)

Jour 3: Reçoit note 5/5
├─ +20 points (excellente note)
└─ Points: 130 → ⭐⭐⭐ (3 étoiles)

Semaine 2: 5 trajets complétés + 3 notes 5/5
├─ +50 points (5 trajets)
├─ +60 points (3 notes 5/5)
└─ Points: 240 → ⭐⭐⭐⭐ (4 étoiles) 🎉

Mois 3: Expert avec 300 points
└─ Ses trajets apparaissent en haut du fil
```

### **Impact d'un No-Show Chauffeur**

```
Chauffeur expérimenté:
Avant: 280 points → ⭐⭐⭐⭐ (4 étoiles)

Incident: Absence signalée
├─ -50 points
└─ Points: 230 → ⭐⭐⭐⭐ (4 étoiles - reste à 4)

Mais: Perd sa position dans le classement
(passe de 280 à 230 points)
```

---

## 📊 Statistiques Dashboard Admin

### **Endpoint Admin**
```http
GET /api/admin/analytics/credibility
```

**Métriques:**
- Distribution des étoiles (combien d'users par niveau)
- Points moyens par rôle (chauffeur vs passager)
- Top 10 des utilisateurs les plus crédibles
- Évolution de la crédibilité dans le temps
- Actions ayant le plus d'impact

---

## ✅ Conformité avec scenario.md

| Exigence | Statut | Implémentation |
|----------|--------|----------------|
| Points de crédibilité | ✅ | 100 points par défaut |
| Influence sur étoiles | ✅ | 5 niveaux (0-400+ points) |
| Position dans le fil | ✅ | Tri par `credibility_points DESC` |
| Pénalité chauffeur absent | ✅ | -50 points (≈ -1 étoile) |
| Bonus trajets complétés | ✅ | +10 points par trajet |
| Bonus bonnes notes | ✅ | +20 (5/5), +10 (4/5) |
| Pénalité mauvaises notes | ✅ | -15 points (1-2/5) |

---

## 🚀 Prochaines Améliorations Possibles

1. **Badges et Récompenses**
   - Badge "100 trajets" → +50 points bonus
   - Badge "Jamais en retard" → +30 points
   - Badge "Ponctualité parfaite" → +40 points

2. **Système de Leagues**
   - Bronze (0-99 pts)
   - Argent (100-199 pts)
   - Or (200-399 pts)
   - Platine (400+ pts)

3. **Bonus Mensuels**
   - Chauffeur du mois → +100 points
   - Passager modèle → +50 points

4. **Pénalités Graduelles**
   - 1er no-show → -10 pts
   - 2ème no-show → -25 pts
   - 3ème no-show → -50 pts

5. **Récupération de Points**
   - Après suspension, période de probation
   - Missions spéciales pour regagner des points

---

## 💡 Conseils aux Utilisateurs

### **Pour Gagner des Points (Chauffeur)**
1. ✅ Complétez tous vos trajets (+10 par trajet)
2. ✅ Soyez ponctuel et professionnel
3. ✅ Offrez un excellent service (notes 5/5)
4. ✅ Répondez rapidement aux réservations
5. ✅ Maintenez votre véhicule propre

### **Pour Éviter de Perdre des Points**
1. ❌ Ne soyez jamais absent sans annuler (-50 pts)
2. ❌ N'annulez pas les trajets au dernier moment (-5 pts)
3. ❌ Évitez les comportements à risque (mauvaises notes)
4. ❌ Communiquez en cas de problème

---

## 📞 Support

Pour toute question sur le système de crédibilité :
- Documentation complète : `docs/SYSTEME_NOTATION_CREDIBILITE.md`
- Code source : `app/Models/User.php` (méthodes de crédibilité)
- Logs : `storage/logs/laravel.log`

---

**Date de création:** 2026-02-07  
**Version:** 1.0  
**Statut:** ✅ Opérationnel  
**Migrations:** ✅ Exécutées

---

*Le système de crédibilité rend COCAR plus juste, transparent et motivant pour tous les utilisateurs !* 🌟
