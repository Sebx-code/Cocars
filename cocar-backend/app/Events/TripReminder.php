<?php

namespace App\Events;

use App\Models\Trip;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TripReminder implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Trip $trip;
    public int $userId;
    public string $reminderType; // 'h24', 'h2', 'departure'

    /**
     * Create a new event instance.
     */
    public function __construct(Trip $trip, int $userId, string $reminderType)
    {
        $this->trip = $trip;
        $this->userId = $userId;
        $this->reminderType = $reminderType;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'trip.reminder';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'trip_id' => $this->trip->id,
            'reminder_type' => $this->reminderType,
            'departure_city' => $this->trip->departure_city,
            'arrival_city' => $this->trip->arrival_city,
            'departure_date' => $this->trip->departure_date,
            'departure_time' => $this->trip->departure_time,
            'driver' => [
                'id' => $this->trip->driver->id,
                'name' => $this->trip->driver->name,
                'phone' => $this->trip->driver->phone,
            ],
        ];
    }
}
