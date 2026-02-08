<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\ThreatLog;

class ThreatDetected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $threat;

    /**
     * Create a new event instance.
     */
    public function __construct(ThreatLog $threat)
    {
        $this->threat = $threat;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('threats'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'threat.detected';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->threat->id,
            'ip_address' => $this->threat->ip_address,
            'geo_location' => $this->threat->geo_location,
            'attack_signature' => $this->threat->attack_signature,
            'attack_type' => $this->threat->attack_type,
            'risk_score' => $this->threat->risk_score,
            'ai_analysis' => $this->threat->ai_analysis,
            'metadata' => $this->threat->metadata,
            'created_at' => $this->threat->created_at->toISOString(),
        ];
    }
}
