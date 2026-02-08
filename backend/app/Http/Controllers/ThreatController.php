<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ThreatLog;
use App\Events\ThreatDetected;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ThreatController extends Controller
{
    /**
     * Store a new threat from the Hunter engine
     * POST /api/threats
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ip_address' => 'required|string|max:255',
            'attack_signature' => 'required|string|max:255',
            'attack_type' => 'required|string|max:255',
            'risk_score' => 'required|integer|min:1|max:100',
            'geo_location' => 'nullable|string|max:255',
            'ai_analysis' => 'nullable|string',
            'metadata' => 'nullable|string', // JSON string
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Parse metadata if it's a JSON string
        $metadata = $request->input('metadata');
        if (is_string($metadata)) {
            $metadata = json_decode($metadata, true);
        }

        $threat = ThreatLog::create([
            'ip_address' => $request->input('ip_address'),
            'geo_location' => $request->input('geo_location', 'Unknown'),
            'attack_signature' => $request->input('attack_signature'),
            'attack_type' => $request->input('attack_type'),
            'risk_score' => $request->input('risk_score'),
            'ai_analysis' => $request->input('ai_analysis'),
            'metadata' => $metadata,
        ]);

        // Broadcast real-time event to frontend
        broadcast(new ThreatDetected($threat))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Threat logged successfully',
            'threat_id' => $threat->id,
        ], 201);
    }

    /**
     * Get recent threats
     * GET /api/threats/recent?limit=100
     */
    public function recent(Request $request)
    {
        $limit = $request->input('limit', 100);
        $threats = ThreatLog::recent($limit)->get();

        return response()->json([
            'success' => true,
            'count' => $threats->count(),
            'threats' => $threats,
        ]);
    }

    /**
     * Get threat statistics for the dashboard
     * GET /api/threats/stats
     */
    public function stats(Request $request)
    {
        $minutes = $request->input('minutes', 60); // Last 60 minutes by default

        // Total threats
        $total = ThreatLog::count();

        // Recent threats (last N minutes)
        $recent_count = ThreatLog::where('created_at', '>=', now()->subMinutes($minutes))->count();

        // Threats by type
        $by_type = ThreatLog::select('attack_type', DB::raw('count(*) as count'))
            ->groupBy('attack_type')
            ->get();

        // High-risk threats
        $high_risk_count = ThreatLog::highRisk()->count();

        // Attacks per minute (for velocity chart)
        $velocity = ThreatLog::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:00") as minute'),
            DB::raw('count(*) as count')
        )
            ->where('created_at', '>=', now()->subMinutes($minutes))
            ->groupBy('minute')
            ->orderBy('minute')
            ->get();

        // Top attacking IPs
        $top_ips = ThreatLog::select('ip_address', DB::raw('count(*) as count'))
            ->groupBy('ip_address')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_threats' => $total,
                'recent_threats' => $recent_count,
                'high_risk_threats' => $high_risk_count,
                'by_type' => $by_type,
                'velocity' => $velocity,
                'top_ips' => $top_ips,
            ],
        ]);
    }

    /**
     * Get threats for map visualization
     * GET /api/threats/map
     */
    public function map()
    {
        // Get unique locations with threat counts
        $threats = ThreatLog::select('geo_location', 'ip_address', DB::raw('MAX(risk_score) as max_risk'), DB::raw('count(*) as count'))
            ->whereNotNull('geo_location')
            ->where('geo_location', '!=', 'Unknown Location')
            ->where('geo_location', '!=', 'Local Network')
            ->groupBy('geo_location', 'ip_address')
            ->get();

        return response()->json([
            'success' => true,
            'locations' => $threats,
        ]);
    }
}
