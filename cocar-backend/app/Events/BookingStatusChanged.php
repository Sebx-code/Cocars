<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Booking $booking;
    public string $oldStatus;
    public string $newStatus;

    /**
     * Create a new event instance.
     */
    public function __construct(Booking $booking, string $oldStatus, string $newStatus)
    {
        $this->booking = $booking;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [
            // Notifier le passager
            new PrivateChannel('user.' . $this->booking->passenger_id),
        ];

        // Notifier aussi le conducteur
        if ($this->booking->trip && $this->booking->trip->driver_id) {
            $channels[] = new PrivateChannel('user.' . $this->booking->trip->driver_id);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'booking.status_changed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->booking->load(['trip', 'passenger']);
        
        return [
            'booking_id' => $this->booking->id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'trip' => [
                'id' => $this->booking->trip->id,
                'departure_city' => $this->booking->trip->departure_city,
                'arrival_city' => $this->booking->trip->arrival_city,
                'departure_date' => $this->booking->trip->departure_date,
                'departure_time' => $this->booking->trip->departure_time,
            ],
            'passenger' => [
                'id' => $this->booking->passenger->id,
                'name' => $this->booking->passenger->name,
            ],
            'seats_booked' => $this->booking->seats_booked,
            'total_price' => $this->booking->total_price,
            'updated_at' => $this->booking->updated_at->toISOString(),
        ];
    }
}
