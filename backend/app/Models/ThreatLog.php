<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThreatLog extends Model
{
    protected $fillable = [
        'ip_address',
        'geo_location',
        'attack_signature',
        'attack_type',
        'risk_score',
        'ai_analysis',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'risk_score' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope to get recent threats
     */
    public function scopeRecent($query, $limit = 100)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    /**
     * Scope to get threats by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('attack_type', $type);
    }

    /**
     * Scope to get high-risk threats
     */
    public function scopeHighRisk($query, $threshold = 70)
    {
        return $query->where('risk_score', '>=', $threshold);
    }
}
