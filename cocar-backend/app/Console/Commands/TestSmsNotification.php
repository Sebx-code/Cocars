<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\SmsNotificationService;
use Illuminate\Console\Command;

class TestSmsNotification extends Command
{
    protected $signature = 'sms:test {phone : Le numéro de téléphone} {--message=Test SMS from CoCar application}';
    protected $description = 'Envoyer un SMS de test';

    protected SmsNotificationService $smsService;

    public function __construct(SmsNotificationService $smsService)
    {
        parent::__construct();
        $this->smsService = $smsService;
    }

    public function handle(): int
    {
        $phone = $this->argument('phone');
        $message = $this->option('message');

        $this->info("Envoi d'un SMS de test...");
        $this->line("Numéro: $phone");
        $this->line("Message: $message");

        if (!$this->smsService->isConfigured()) {
            $this->error('Twilio n\'est pas configuré. Vérifiez votre fichier .env');
            return 1;
        }

        if (!$this->smsService->isEnabled()) {
            $this->error('Les notifications SMS ne sont pas activées');
            return 1;
        }

        $result = $this->smsService->send($phone, $message);

        if ($result) {
            $this->info('✓ SMS envoyé avec succès!');
            return 0;
        } else {
            $this->error('✗ Échec de l\'envoi du SMS');
            return 1;
        }
    }
}
