# Sentinel-Eye Backend (Laravel 11)

Real-time threat logging API with WebSocket broadcasting.

## Features

- **REST API** for threat ingestion from Hunter engine
- **Real-time Broadcasting** via Laravel Reverb (WebSockets)
- **Threat Analytics** endpoints for dashboard statistics
- **SQLite Database** for quick demo setup

## Setup

### 1. Install Dependencies
```bash
cd backend
composer install
```

### 2. Run Database Migrations
```bash
php artisan migrate
```

### 3. Start the API Server
```bash
php artisan serve
```
Server runs on: `http://localhost:8000`

### 4. Start Reverb WebSocket Server
```bash
php artisan reverb:start
```
WebSocket server runs on: `ws://localhost:8080`

## API Endpoints

### POST /api/threats
**Receive threat from Hunter engine**

Request:
```json
{
  "ip_address": "192.168.1.100",
  "geo_location": "Los Angeles, USA",
  "attack_signature": "PORT_SCAN_DETECTED",
  "attack_type": "port_scan",
  "risk_score": 75,
  "ai_analysis": "Aggressive port scanning detected...",
  "metadata": "{\"syn_count\": 25}"
}
```

Response:
```json
{
  "success": true,
  "message": "Threat logged successfully",
  "threat_id": 1
}
```

### GET /api/threats/recent?limit=100
**Get recent threats**

Response:
```json
{
  "success": true,
  "count": 15,
  "threats": [...]
}
```

### GET /api/threats/stats
**Get threat statistics**

Response:
```json
{
  "success": true,
  "stats": {
    "total_threats": 150,
    "recent_threats": 25,
    "high_risk_threats": 10,
    "by_type": [...],
    "velocity": [...],
    "top_ips": [...]
  }
}
```

### GET /api/threats/map
**Get threats with geo-location for map**

Response:
```json
{
  "success": true,
  "locations": [...]
}
```

## WebSocket Events

**Channel:** `threats`

**Event:** `threat.detected`

Payload:
```json
{
  "id": 1,
  "ip_address": "192.168.1.100",
  "geo_location": "Los Angeles, USA",
  "attack_signature": "PORT_SCAN_DETECTED",
  "attack_type": "port_scan",
  "risk_score": 75,
  "ai_analysis": "...",
  "metadata": {...},
  "created_at": "2026-02-06T09:30:00.000Z"
}
```

## Database Schema

**Table:** `threat_logs`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| ip_address | varchar | Attacker IP address |
| geo_location | varchar | Geographic location |
| attack_signature | varchar | Attack identifier |
| attack_type | varchar | port_scan, arp_spoof, etc. |
| risk_score | integer | 1-100 risk level |
| ai_analysis | text | AI-generated explanation |
| metadata | json | Additional packet details |
| created_at | timestamp | Detection time |
| updated_at | timestamp | Last update |

## For Judges (Demo)

### Start Both Servers:
```bash
# Terminal 1: API Server
php artisan serve

# Terminal 2: WebSocket Server
php artisan reverb:start
```

### Test API:
```bash
curl -X POST http://localhost:8000/api/threats \
  -H "Content-Type: application/json" \
  -d '{"ip_address":"192.168.1.100","attack_signature":"TEST_ATTACK","attack_type":"port_scan","risk_score":75}'
```

### Watch Live in Frontend:
Open the War Room dashboard - threats will appear instantly via WebSocket!

## Architecture

```
Hunter (Python) 
    ↓ HTTP POST
ThreatController::store()
    ↓ Creates
ThreatLog Model
    ↓ Triggers
ThreatDetected Event
    ↓ Broadcasts via
Laravel Reverb (WebSocket)
    ↓ Received by
Frontend Dashboard
```
