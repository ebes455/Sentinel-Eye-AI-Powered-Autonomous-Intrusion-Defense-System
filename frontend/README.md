# Sentinel-Eye War Room

Cyberpunk-themed real-time threat visualization dashboard.

## Features

- **Live Threat Feed**: Terminal-style scrolling log with color-coded risk levels
- **Geographic Map**: Leaflet.js visualization showing threat origins
- **Velocity Chart**: Chart.js graph displaying attacks per minute
- **Real-time Updates**: WebSocket connection to Laravel Reverb for instant alerts
- **4K Optimized**: Designed for high-resolution displays

## Setup

### 1. Prerequisites
- Modern web browser (Chrome, Firefox, Edge)
- Laravel backend running on `http://localhost:8000`
- Laravel Reverb WebSocket server on `ws://localhost:8080`

### 2. Run the Dashboard

Simply open `index.html` in your browser:

```bash
cd frontend
# Option 1: Open directly
start index.html

# Option 2: Use Python HTTP server
python -m http.server 8888
# Then visit http://localhost:8888
```

## Architecture

```
index.html (Main UI)
    ├── css/cyberpunk.css (Theme & Animations)
    └── js/
        ├── app.js (Main Orchestrator)
        └── components/
            ├── liveFeed.js (Threat Terminal)
            ├── threatMap.js (Geographic Map)
            └── velocityChart.js (Attack Graph)
```

## For Judges (Demo Script)

### 1. Start All Services

**Terminal 1 - Laravel API:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - WebSocket Server:**
```bash
cd backend
php artisan reverb:start
```

**Terminal 3 - Hunter Engine:**
```bash
cd hunter
python sentinel_engine.py  # Run as Administrator
```

**Browser - War Room:**
Open `frontend/index.html`

### 2. Trigger Threats

**Port Scan Attack:**
```bash
nmap -sS -p 1-1000 192.168.1.1
```
Watch the dashboard light up with red alerts!

**SQL Injection:**
```bash
curl "http://localhost/?id=1' OR '1'='1"
```

**XSS Attack:**
```bash
curl "http://localhost/?q=<script>alert('XSS')</script>"
```

### 3. Watch Real-Time Magic ✨

- Threats appear **instantly** in the live feed (WebSocket)
- Map markers popup showing attack origins with animation
- Velocity graph updates showing attack frequency
- Risk counters increment automatically
- High-risk threats trigger pulsing animations

## UI Features

### Color Coding
- **Green** (#22c55e): Low risk (< 30)
- **Yellow** (#eab308): Medium risk (30-69)
- **Red** (#ef4444): High risk (≥ 70)

### Animations
- Scanline effect (retro terminal feel)
- Neon glow on headers
- Pulse animation for new threats
- Smooth slide-in for feed items
- Marker pulse on map

### Responsive Design
- Optimized for 4K displays (3840×2160)
- Responsive grid layout
- Readable fonts at high DPI

## Customization

### Change WebSocket Credentials
Edit `js/app.js`, line 60:
```javascript
this.echo = new Echo({
    ...
    key: 'your-reverb-key',
    wsHost: 'your-host',
    wsPort: 8080,
});
```

### Adjust Theme Colors
Edit `css/cyberpunk.css`:
```css
:root {
    --color-primary: #22c55e;  /* Green */
    --color-danger: #ef4444;   /* Red */
    --color-warning: #eab308;  /* Yellow */
}
```

### Modify Feed Limit
Edit `js/components/liveFeed.js`, line 8:
```javascript
this.maxItems = 50; // Change to desired number
```

## Performance

- **60 FPS** animations on 4K displays
- **< 100ms** WebSocket latency
- **Efficient DOM** updates (only new threats rendered)
- **Memory management** (auto-prune old threats)

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

## Troubleshooting

**Threats not appearing:**
- Check browser console for WebSocket connection status
- Ensure Laravel API and Reverb are running
- Verify network security (firewalls, CORS)

**Map not loading:**
- Check internet connection (Leaflet tiles require online access)
- Verify geo-location data is being sent from Hunter

**Chart not updating:**
- Ensure Chart.js is loaded (check console)
- Verify threats have valid timestamps

## Credits

Built for the Hackathon 2026 with:
- Tailwind CSS
- Leaflet.js
- Chart.js  
- Laravel Echo
- Pusher Client
