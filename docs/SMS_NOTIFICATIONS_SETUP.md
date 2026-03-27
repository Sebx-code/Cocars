# Système de Notification SMS via Twilio

## Overview
Le système de notification SMS CoCars permet d'envoyer des notifications importantes aux utilisateurs via SMS en utilisant Twilio.

## Configuration

### 1. Installation des dépendances
```bash
composer require twilio/sdk
```

### 2. Variables d'environnement (.env)
Ajoutez ces variables à votre fichier `.env`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
SMS_NOTIFICATIONS_ENABLED=true
SMS_LOG_ENABLED=true
SMS_LOG_CHANNEL=stack
```

#### Obtenir les credentials Twilio:

1. Allez sur [twilio.com](https://www.twilio.com)
2. Créez un compte gratuit
3. Accédez à [console.twilio.com](https://console.twilio.com)
4. Copiez votre:
   - **Account SID**: Visible dans le dashboard
   - **Auth Token**: Visible dans le dashboard (caché par défaut)
   - **Phone Number**: Achetez un numéro Twilio (ex: +1 555 XXX XXXX)

### 3. Configuration Laravel

Le fichier `config/twilio.php` contient la configuration:

```php
'notification_types' => [
    'booking_new' => true,
    'booking_confirmed' => true,
    'booking_cancelled' => true,
    'trip_reminder' => true,
    'payment_received' => true,
    'payment_refund' => true,
    'verification_approved' => true,
],
```

Modifiez les types de notifications qu'on wants to send par SMS.

## Utilisation

### Service principal: SmsNotificationService

#### Envoyer un SMS simple
```php
$smsService = app(SmsNotificationService::class);
$result = $smsService->send('+33612345678', 'Votre message');
```

#### Envoyer un SMS à un utilisateur
```php
$user = User::find(1);
$result = $smsService->sendToUser($user, 'Message');
```

#### Envoyer des SMS en masse
```php
$users = User::whereIn('id', [1, 2, 3])->get();
$results = $smsService->sendBatch($users, 'Message');

// $results contient:
// [
//   'success' => 2,
//   'failed' => 1,
//   'skipped' => 0,
//   'details' => [...]
// ]
```

#### Notifications spécialisées
```php
// Nouvelle réservation
$smsService->notifyNewBooking($booking);

// Confirmation de réservation
$smsService->notifyBookingConfirmed($booking);

// Annulation
$smsService->notifyBookingCancelled($booking, 'passenger');

// Rappel de trajet
$smsService->sendTripReminder($trip, 'h24'); // h24, h2, ou departure

// Paiement
$smsService->notifyPaymentReceived($payment);
$smsService->notifyRefund($payment);
```

### Service secondaire: NotificationService

Le NotificationService est maintenant intégré au SmsNotificationService. Quand une notification est créée:

```php
$notificationService->send(
    userId: 1,
    type: 'booking_confirmed',
    title: 'Réservation confirmée',
    message: 'Votre réservation a été confirmée',
    sendSms: true  // Envoie automatiquement un SMS si activé
);
```

## API Routes

### Routes Utilisateur (Protégées)

#### Vérifier le statut SMS
```
GET /api/sms/status
Response:
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
Body: { "message": "Test SMS" }
Response: { "success": true, "message": "SMS envoyé avec succès" }
```

#### Configurer les préférences
```
POST /api/sms/preferences
Body: { "opt_in": true }
Response: { "success": true }
```

### Routes Admin (Protégées)

#### Envoyer un SMS à un utilisateur
```
POST /api/admin/sms/send
Body:
{
  "user_id": 1,
  "message": "Message important"
}
```

#### Envoyer des SMS en masse
```
POST /api/admin/sms/send-batch
Body:
{
  "user_ids": [1, 2, 3],
  "message": "Notification importante"
}
Response:
{
  "success": true,
  "results": {
    "success": 3,
    "failed": 0,
    "skipped": 0
  }
}
```

## Commandes Artisan

### Tester un SMS
```bash
php artisan sms:test "+33612345678" --message="Votre message test"
```

Exemple avec message par défaut:
```bash
php artisan sms:test "+33612345678"
```

## Job Queue

Les SMS sont envoyés en arrière-plan via des Jobs:

### SendSmsNotification
Envoie un SMS à un utilisateur unique:
```php
SendSmsNotification::dispatch($userId, $message, ['metadata' => 'value']);
```

### SendBatchSmsNotification
Envoie des SMS à plusieurs utilisateurs:
```php
SendBatchSmsNotification::dispatch($userIds, $message, ['metadata' => 'value']);
```

Configuration dans `config/queue.php`:
```php
'default' => env('QUEUE_CONNECTION', 'sync'), // 'sync' immediate, 'database' en arrière-plan
```

## Intégration avec les Événements

Les SMS sont automatiquement envoyés quand:

1. **Nouvelle Réservation**: Conducteur reçoit un SMS
   - Message: "Nouvelle réservation! [Passager] demande [X] place(s)..."

2. **Réservation Confirmée**: Passager reçoit un SMS
   - Message: "Réservation confirmée! [Conducteur] a accepté..."

3. **Annulation**: Notification SMS à la partie concernée

4. **Rappel de Trajet**: SMS 24h avant, 2h avant, et au départ

5. **Paiement**: Confirmations de paiement et remboursement

6. **Vérification**: Approbation ou rejet de profil

## Logging

Les SMS sont loggés dans:
- **Channel**: Configuré par `SMS_LOG_CHANNEL` (par défaut: 'stack')
- **Fichier**: `storage/logs/laravel.log`

Exemple d'entrée log:
```
[2024-03-21 14:32:15] local.INFO: SMS sent {"phone":"*****5678","message_length":160,"status":"sent","sid":"SMaaaabbbbccccddddeeee","timestamp":"2024-03-21T14:32:15+00:00"}
```

## Dépannage

### SMS non envoyés

1. **Vérifier si activé**:
   ```bash
   php artisan tinker
   >>> app('sms')->isEnabled()
   >>> app('sms')->isConfigured()
   ```

2. **Vérifier les logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

3. **Tester avec la commande**:
   ```bash
   php artisan sms:test "+33612345678" --message="Test"
   ```

### Numéros de téléphone non vérifiés
- SMS aux usuarios sauf si `phone_verified = true`
- Les utilisateurs doivent d'abord vérifier leur numéro via l'API de vérification

### Dépassement du quota Twilio
- Twilio offre un crédit gratuit (~$15)
- Consultez votre console Twilio pour le statut du compte

## Bonnes Pratiques

1. **Limiter les SMS**: Activez uniquement pour les notifications critiques
2. **Vérifier les numéros**: Assurez-vous que `phone_verified = true`
3. **Monitoring**: Surveiller les logs et les erreurs
4. **Testing**: Utilisez `SMS_NOTIFICATIONS_ENABLED=false` en développement
5. **Queue**: Utilisez un driver de queue (database, redis) en production

## Coûts

- **SMS sortant**: ~$0.0075 par message (varie selon le pays)
- **Numéro Twilio**: ~$1 par mois
- **Crédit gratuit**: ~$15 au démarrage (suffisant pour ~2000 SMS)

## Support Multilingue

Les messages SMS sont actuellement en français. Pour ajouter le support d'autres langues:

1. Modifiez `SmsNotificationService.php`
2. Utilisez les traductions Laravel (`__()`)
3. Configurez les locales dans `config/app.php`

## Webhooks Twilio (Optionnel)

Pour supporter les SMS entrants ou les statuts de livraison:

1. Configurez un webhook dans Twilio Console
2. Créez une route webhook dans `routes/api.php`
3. Traitez les données entrants dans le contrôleur

Exemple:
```php
Route::post('/webhooks/sms', [SmsController::class, 'webhook']);
```

## Résumé des fichiers ajoutés

- `config/twilio.php` - Configuration
- `app/Services/SmsNotificationService.php` - Service principal
- `app/Jobs/SendSmsNotification.php` - Job pour un SMS
- `app/Jobs/SendBatchSmsNotification.php` - Job pour SMS en masse
- `app/Http/Controllers/Api/SmsController.php` - API
- `app/Console/Commands/TestSmsNotification.php` - Commande Artisan
- `routes/api.php` - Routes (mises à jour)
- `.env.example` - Variables d'environnement (mises à jour)

## Prochaines Étapes

1. Configurer les credentials Twilio
2. Activer SMS_NOTIFICATIONS_ENABLED=true
3. Tester avec `php artisan sms:test "+33..."`
4. Monitor les logs
5. Déployer en production

---

**Version**: 1.0  
**Date**: 2024-03-21  
**Auteur**: CoCars Development Team
