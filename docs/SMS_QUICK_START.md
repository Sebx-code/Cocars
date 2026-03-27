# 🚀 Guide Rapide - Système SMS Twilio pour CoCars

## ✅ Qu'est-ce qui a été installé ?

Un système complet de notification par SMS via **Twilio** pour l'application CoCars, permettant d'envoyer des SMS automatisés lors de:

- ✉️ Nouvelle réservation (notification au conducteur)
- ✅ Confirmation de réservation (notification au passager)
- ❌ Annulation de réservation/trajet
- 🔔 Rappels de trajet (24h avant, 2h avant, au départ)
- 💰 Confirmations de paiement et remboursement
- 🎓 Approuvatione/rejet de vérification de profil

## 📦 Fichiers Installés

### Services
- `app/Services/SmsNotificationService.php` - Service principal pour envoyer les SMS
- `config/twilio.php` - Configuration Twilio

### Jobs Queue
- `app/Jobs/SendSmsNotification.php` - Job pour SMS individual
- `app/Jobs/SendBatchSmsNotification.php` - Job pour SMS en masse

### Contrôleurs API
- `app/Http/Controllers/Api/SmsController.php` - API utilisateur et admin SMS
- `app/Http/Controllers/Api/SmsAdminController.php` - Dashboard admin SMS

### Modèles
- `app/Models/SmsLog.php` - Model pour tracker les SMS envoyés

### Commandes Artisan
- `app/Console/Commands/TestSmsNotification.php` - Commande pour tester

### Migrations
- `database/migrations/2024_03_21_000001_add_sms_preferences_to_users.php` - Préférences SMS
- `database/migrations/2024_03_21_000002_create_sms_logs_table.php` - Logs SMS

### Routes API
- `routes/api.php` - Routes SMS (utilisateur + admin)

### Documentation
- `docs/SMS_NOTIFICATIONS_SETUP.md` - Documentation complète

## 🚀 Démarrage Rapide

### Étape 1: Installer les dépendances
```bash
cd cocar-backend
composer require twilio/sdk
```

### Étape 2: Configurer Twilio

1. Allez sur [twilio.com](https://www.twilio.com)
2. Créez un compte gratuit (crédit de ~$15 gratuit)
3. Obtenez vos credentials:
   - Account SID
   - Auth Token
   - Numéro de téléphone Twilio

4. Mettez à jour votre `.env`:
```env
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+1234567890
SMS_NOTIFICATIONS_ENABLED=true
SMS_LOG_ENABLED=true
```

### Étape 3: Exécuter les migrations
```bash
php artisan migrate
```

### Étape 4: Tester l'intégration
```bash
# Test simple
php artisan sms:test "+33612345678"

# Test avec message personnalisé
php artisan sms:test "+33612345678" --message="Test CoCars SMS!"
```

## 📱 API Endpoints

### Pour les utilisateurs

#### Vérifier le statut SMS
```
GET /api/sms/status
```
Response:
```json
{
  "enabled": true,
  "configured": true,
  "user_phone_verified": true,
  "user_phone": "*****5678"
}
```

#### Envoyer un SMS de test
```
POST /api/sms/test
Body: { "message": "Mon message de test" }
```

### Pour les admins

#### Envoyer un SMS à un utilisateur
```
POST /api/admin/sms/send
Body:
{
  "user_id": 1,
  "message": "Bienvenue sur CoCars!"
}
```

#### Envoyer des SMS en masse
```
POST /api/admin/sms/send-batch
Body:
{
  "user_ids": [1, 2, 3, 4, 5],
  "message": "Notification importante"
}
```

#### Voir les logs SMS
```
GET /api/admin/sms/logs?status=sent&per_page=50
```

#### Résumé des SMS
```
GET /api/admin/sms/summary?date_from=2024-03-01&date_to=2024-03-31
```

#### Logs d'un utilisateur
```
GET /api/admin/sms/users/{user_id}/logs
```

## 🔧 Configuration Avancée

### Contrôler quels types de notifications sont envoyés par SMS

Dans `config/twilio.php`:
```php
'notification_types' => [
    'booking_new' => true,           // Nouvelles réservations
    'booking_confirmed' => true,      // Confirmations
    'booking_cancelled' => true,      // Annulations
    'trip_reminder' => true,          // Rappels de trajet
    'payment_received' => true,       // Paiements reçus
    'payment_refund' => true,         // Remboursements
    'verification_approved' => true,  // Vérification approuvée
    'verification_rejected' => true,  // Vérification refusée
    'message_new' => false,           // Nouveaux messages (désactivé par défaut)
],
```

### Activer/Désactiver les SMS globalement
```env
SMS_NOTIFICATIONS_ENABLED=false  # Mettre à false pour désactiver
```

## 📊 Intégration automatique

Les SMS sont automatiquement envoyés quand:

1. Une réservation est créée → SMS au conducteur
2. Une réservation est acceptée → SMS au passager
3. Un trajet est annulé → SMS à tous les passagers
4. Un rappel est déclenché → SMS au conducteur et passagers
5. Un paiement est reçu → SMS au destinataire
6. Un profil est vérifié/rejeté → SMS à l'utilisateur

**Aucune configuration supplémentaire n'est nécessaire !** L'intégration se fait automatiquement dans le `NotificationService`.

## 💰 Coûts Twilio

- SMS sortant: ~$0.0075 par message
- Numéro Twilio: ~$1/mois
- Crédit gratuit: ~$15 (pour ~2000 SMS)

## 🐛 Dépannage

### Les SMS ne sont pas envoyés?

1. Vérifiez que `SMS_NOTIFICATIONS_ENABLED=true`
2. Vérifiez vos credentials Twilio
3. Testez avec la commande Artisan:
   ```bash
   php artisan sms:test "+33612345678"
   ```
4. Vérifiez les logs:
   ```bash
   tail -f storage/logs/laravel.log
   ```

### Les SMS n'arrivent pas aux utilisateurs

- Vérifiez que le numéro de téléphone est au format international (+33...)
- Vérifiez que `phone_verified = true` pour l'utilisateur
- Vérifiez les logs SMS dans la base de données:
  ```bash
  php artisan tinker
  >>> \App\Models\SmsLog::latest()->limit(10)->get();
  ```

### Quota Twilio dépassé?

- Consultez votre console Twilio pour le statut
- Achetez du crédit Twilio si nécessaire
- Vérifiez votre numéro de téléphone (frais varient par pays)

## 📚 Documentation Complète

Pour une documentation détaillée, consultez:
`docs/SMS_NOTIFICATIONS_SETUP.md`

## 🎯 Prochaines étapes

1. ✅ Installer et configurer Twilio
2. ✅ Mettre à jour `.env` avec les credentials
3. ✅ Exécuter les migrations
4. ✅ Tester avec la commande Artisan
5. ✅ Tester via l'API
6. ✅ Déployer en production

## 📞 Support

Pour toute question sur l'intégration SMS:
- Consultez `docs/SMS_NOTIFICATIONS_SETUP.md`
- Vérifiez les logs dans `storage/logs/laravel.log`
- Testez avec `php artisan sms:test "+33..."`

---

**Status**: ✅ Installation Complète  
**Version**: 1.0  
**Date**: 2024-03-21
