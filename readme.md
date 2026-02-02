# Application de covoiturage : cocar

## Description

cocar est une solution web qui sert a ameliorer le deplacement longue distance(voyage), en creant une relation entre chauffeur et passager.
Il reduit les depenses lier au voyage.

## Prerequis et installation

### Prérequis backend
- PHP 8.1+
- Composer
- MySQL ou SQLite
- React.js (pour le frontend)

#### Étapes d'installation

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

### Prérequis frontend
- PHP 8.1+
- Composer
- MySQL ou SQLite
- React.js (pour le frontend)

#### Étapes d'installation

1. **Cloner et installer les dépendances**
```bash
cd cocar-frontend
npm install

2. **Lancer le serveur**
```bash
npm run dev
```

L'API sera accessible sur `http://localhost:5173`