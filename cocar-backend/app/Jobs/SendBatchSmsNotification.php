<?php

namespace App\Jobs;

use App\Services\SmsNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Exception;
use Illuminate\Support\Facades\Log;

class SendBatchSmsNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $userIds;
    protected string $message;
    protected array $metadata;

    /**
     * Create a new job instance.
     */
    public function __construct(array $userIds, string $message, array $metadata = [])
    {
        $this->userIds = $userIds;
        $this->message = $message;
        $this->metadata = $metadata;
    }

    /**
     * Execute the job.
     */
    public function handle(SmsNotificationService $smsService): void
    {
        try {
            $users = \App\Models\User::whereIn('id', $this->userIds)->get();

            $results = $smsService->sendBatch($users, $this->message);

            Log::info('Batch SMS notifications completed', [
                'batch_size' => count($this->userIds),
                'results' => $results,
                'metadata' => $this->metadata,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to send batch SMS notification', [
                'error' => $e->getMessage(),
                'batch_size' => count($this->userIds),
            ]);
            throw $e;
        }
    }

    /**
     * Specify the time in seconds before a job should be marked as failed.
     */
    public function timeout(): int
    {
        return 60;
    }

    /**
     * Determine the time at which the job should timeout.
     */
    public function retryUntil()
    {
        return now()->addMinutes(10);
    }
}
