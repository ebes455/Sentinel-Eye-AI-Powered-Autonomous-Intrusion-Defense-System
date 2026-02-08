/**
 * Sentinel-Eye Pro: Advanced Tactical Map
 * Features: Laser Attack Beams targeting Pakistan, Origin-Destination Ripples
 */

export class ThreatMap {
    constructor(containerId) {
        this.map = L.map(containerId, {
            zoomControl: false,
            attributionControl: false
        }).setView([20, 0], 2);

        // Dark holographic map tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 18
        }).addTo(this.map);

        this.markers = L.layerGroup().addTo(this.map);
        this.beams = L.layerGroup().addTo(this.map);

        // Target Location: Pakistan
        this.targetCoords = [30.3753, 69.3451];
        this.initTargetPulse();
    }

    initTargetPulse() {
        // Static neon marker for Pakistan (The Victim)
        const targetIcon = L.divIcon({
            className: 'target-marker',
            html: `
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-6 h-6 bg-green-500/20 rounded-full animate-ping"></div>
                    <div class="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-[0_0_15px_#22c55e]"></div>
                </div>
            `,
            iconSize: [20, 20]
        });
        L.marker(this.targetCoords, { icon: targetIcon, zIndexOffset: 1000 }).addTo(this.map);
    }

    addThreat(threat) {
        const coords = this.getRandomCoordsForLocation(threat.geo_location);

        // 1. Draw Origin Pulse (Where the attack started)
        const pulse = L.divIcon({
            className: 'threat-pulse',
            html: `<div class="w-4 h-4 bg-red-600 rounded-full animate-ping shadow-[0_0_10px_#ef4444]"></div>`,
            iconSize: [16, 16]
        });
        const originMarker = L.marker(coords, { icon: pulse }).addTo(this.markers);

        // 2. Draw Attack Laser Beam (Origin -> Pakistan)
        this.drawLaserBeam(coords, this.targetCoords, threat.risk_score);

        // Auto-cleanup markers to avoid lag
        setTimeout(() => {
            this.map.removeLayer(originMarker);
        }, 10000);
    }

    drawLaserBeam(start, end, risk) {
        const color = risk >= 80 ? '#FF0000' : '#FFD700'; // Red for high risk, Gold for medium
        const weight = risk >= 80 ? 3 : 1;

        // Draw Curved Path (Laser Beam)
        // Note: Simple straight line for base Leaflet, but we'll add shadow for 'laser' effect
        const laser = L.polyline([start, end], {
            color: color,
            weight: weight,
            opacity: 0,
            dashArray: '10, 10',
            className: 'laser-beam'
        }).addTo(this.beams);

        // Animation logic: Appear, pulse, disappear
        let opacity = 0;
        const fadeIn = setInterval(() => {
            opacity += 0.1;
            laser.setStyle({ opacity: opacity });
            if (opacity >= 0.8) {
                clearInterval(fadeIn);
                // Trigger Target Ripple when beam 'reaches'
                this.triggerTargetRipple(risk >= 80);

                setTimeout(() => {
                    const fadeOut = setInterval(() => {
                        opacity -= 0.1;
                        laser.setStyle({ opacity: opacity });
                        if (opacity <= 0) {
                            clearInterval(fadeOut);
                            this.map.removeLayer(laser);
                        }
                    }, 50);
                }, 1000);
            }
        }, 30);
    }

    triggerTargetRipple(isHighRisk) {
        const ripple = L.divIcon({
            className: 'ripple',
            html: `<div class="w-12 h-12 border-2 ${isHighRisk ? 'border-red-600' : 'border-yellow-500'} rounded-full animate-ping"></div>`,
            iconSize: [48, 48]
        });
        const rippleMarker = L.marker(this.targetCoords, { icon: ripple }).addTo(this.map);
        setTimeout(() => this.map.removeLayer(rippleMarker), 2000);
    }

    getRandomCoordsForLocation(location) {
        // Location-based coordinate mapping
        const locations = {
            'Global Web': [Math.random() * 120 - 60, Math.random() * 360 - 180],
            'USA': [37.0902, -95.7129],
            'Russia': [61.5240, 105.3188],
            'China': [35.8617, 104.1954],
            'Germany': [51.1657, 10.4515],
            'UK': [55.3781, -3.4360],
            'Brazil': [-14.235, -51.9253],
            'Australia': [-25.2744, 133.7751]
        };

        // Pick specific coords or random if location is unknown
        const base = locations[location] || [Math.random() * 140 - 70, Math.random() * 360 - 180];
        return [base[0] + (Math.random() - 0.5) * 5, base[1] + (Math.random() - 0.5) * 5];
    }
}
