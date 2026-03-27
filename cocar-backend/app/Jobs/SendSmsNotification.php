<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\SmsNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Exception;
use Illuminate\Support\Facades\Log;

class SendSmsNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $userId;
    protected string $message;
    protected array $metadata;

    /**
     * Create a new job instance.
     */
    public function __construct(int $userId, string $message, array $metadata = [])
    {
        $this->userId = $userId;
        $this->message = $message;
        $this->metadata = $metadata;
    }

    /**
     * Execute the job.
     */
    public function handle(SmsNotificationService $smsService): void
    {
        try {
            $user = User::findOrFail($this->userId);

            if (!$user->phone || !$user->phone_verified) {
                Log::info('SMS notification skipped - no verified phone', [
                    'user_id' => $this->userId,
                ]);
                return;
            }

            $smsService->sendToUser($user, $this->message);

            Log::info('SMS notification sent successfully', [
                'user_id' => $this->userId,
                'metadata' => $this->metadata,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to send SMS notification', [
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Specify the time in seconds before a job should be marked as failed.
     */
    public function timeout(): int
    {
        return 30;
    }

    /**
     * Determine the time at which the job should timeout.
     */
    public function retryUntil()
    {
        return now()->addMinutes(5);
    }
}
