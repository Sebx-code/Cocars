# Rideshare Backend API

API Backend Laravel pour l'application de covoiturage Rideshare.

## 🚀 Installation

### Prérequis
- PHP 8.1+
- Composer
- MySQL ou SQLite
- Node.js (pour le frontend)

### Étapes d'installation

1. **Cloner et installer les dépendances**
```bash
cd cocar-backend
composer install
```

2. **Configurer l'environnement**
```bash
cp .env.example .env
php artisan key:generate
```

3. **Configurer la base de données**
Modifier le fichier `.env` :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rideshare
DB_USERNAME=root
DB_PASSWORD=
```

4. **Exécuter les migrations et seeders**
```bash
php artisan migrate
php artisan db:seed
```

5. **Lancer le serveur**
```bash
php artisan serve
```

L'API sera accessible sur `http://localhost:8000`

## 📚 Documentation API

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/user` | Utilisateur connecté |
| PUT | `/api/auth/profile` | Mettre à jour profil |

### Trajets

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/trips` | Liste des trajets |
| GET | `/api/trips/search` | Rechercher trajets |
| GET | `/api/trips/{id}` | Détail d'un trajet |
| POST | `/api/trips` | Créer un trajet |
| PUT | `/api/trips/{id}` | Modifier un trajet |
| DELETE | `/api/trips/{id}` | Supprimer un trajet |
| GET | `/api/trips/my-trips` | Mes trajets (conducteur) |

### Réservations

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/bookings` | Liste réservations (conducteur) |
| GET | `/api/bookings/my-bookings` | Mes réservations (passager) |
| POST | `/api/bookings` | Créer une réservation |
| POST | `/api/bookings/{id}/confirm` | Confirmer |
| POST | `/api/bookings/{id}/reject` | Rejeter |
| POST | `/api/bookings/{id}/cancel` | Annuler |

### Paiements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/payments/methods` | Méthodes disponibles |
| POST | `/api/payments/process` | Traiter un paiement |
| GET | `/api/payments/history` | Historique |

### Évaluations

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/ratings` | Créer une évaluation |
| GET | `/api/ratings/user/{id}` | Notes d'un utilisateur |

### Notifications

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notifications` | Liste notifications |
| POST | `/api/notifications/{id}/read` | Marquer comme lu |
| POST | `/api/notifications/read-all` | Tout marquer lu |

## 🔐 Authentification

L'API utilise Laravel Sanctum pour l'authentification.

Inclure le token dans les headers :
```
Authorization: Bearer {token}
```

## 👥 Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@rideshare.cm | password | Admin |
| jean@example.com | password | Utilisateur |
| marie@example.com | password | Utilisateur |
| paul@example.com | password | Utilisateur |

## 🏗️ Structure du projet

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AuthController.php
│   │       ├── TripController.php
│   │       ├── BookingController.php
│   │       ├── PaymentController.php
│   │       ├── RatingController.php
│   │       ├── NotificationController.php
│   │       └── VehicleController.php
│   └── Middleware/
├── Models/
│   ├── User.php
│   ├── Trip.php
│   ├── Booking.php
│   ├── Payment.php
│   ├── Rating.php
│   ├── Vehicle.php
│   └── Notification.php
├── Providers/
database/
├── migrations/
└── seeders/
routes/
└── api.php
```

## 📄 License

MIT
