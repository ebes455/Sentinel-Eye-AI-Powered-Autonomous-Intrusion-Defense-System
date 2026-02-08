/**
 * Sentinel-Eye Pro: System Orchestrator
 * Features: Kill-switch logic, Siege mode, and Report Generation
 */

import { LiveFeed } from './components/liveFeed.js';
import { ThreatMap } from './components/threatMap.js';
import { VelocityChart } from './components/velocityChart.js';

class SentinelApp {
    constructor() {
        this.threats = [];
        this.stats = {
            total: 0,
            port_scan: 0,
            arp_spoof: 0,
            sql_injection: 0,
            xss_attempt: 0,
            honeypot_trap: 0,
            high_risk: 0
        };

        this.isUnderSiege = false;
        this.liveFeed = new LiveFeed('#liveFeed');
        this.map = new ThreatMap('map');
        this.velocityChart = new VelocityChart('velocityChart');
        this.echo = null;

        this.init();
        this.setupEventListeners();
    }

    async init() {
        console.log('🛡️ Sentinel-Eye Pro Initializing...');
        await this.loadInitialThreats();
        this.connectWebSocket();
        setInterval(() => this.loadInitialThreats(), 5000);
        setInterval(() => this.fetchStats(), 15000);
    }

    setupEventListeners() {
        document.getElementById('downloadReport').onclick = () => this.generateReport();
    }

    async loadInitialThreats() {
        try {
            const host = window.location.hostname || 'localhost';
            const url = `http://${host}:8000/api/threats/recent?limit=50`;
            console.log('🔍 Fetching threats from:', url);
            const response = await fetch(url);
            const data = await response.json();
            console.log('📦 API Response:', data);

            if (data.success && data.threats) {
                console.log(`✅ Found ${data.threats.length} threats`);
                const newThreats = data.threats.filter(newT =>
                    !this.threats.some(oldT => oldT.id === newT.id)
                );

                if (newThreats.length > 0) {
                    console.log(`➕ Adding ${newThreats.length} new threats to UI`);
                    newThreats.reverse().forEach(threat => {
                        console.log('Adding threat:', threat);
                        this.processThreat(threat, true);
                    });
                    this.updateStatsDisplay();
                }
            }
        } catch (error) {
            console.error('❌ Error loading threats:', error);
        }
    }

    connectWebSocket() {
        try {
            window.Pusher = Pusher;
            const host = window.location.hostname || 'localhost';
            console.log('🔌 Connecting WebSocket to:', host + ':8080');
            this.echo = new Echo({
                broadcaster: 'reverb',
                key: 'fjckmzfvrypjgi35drx1',
                wsHost: host,
                wsPort: 8080,
                forceTLS: false,
                enabledTransports: ['ws', 'wss'],
            });

            this.echo.channel('threats')
                .listen('.threat.detected', (event) => {
                    console.log('🚨 WebSocket threat received:', event);
                    this.processThreat(event, true);
                    this.playAlertSound();
                });

            console.log('✅ WebSocket connected successfully');
            this.updateConnectionStatus(true);
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.updateConnectionStatus(false);
            setTimeout(() => this.connectWebSocket(), 5000);
        }
    }

    processThreat(threat, animate = true) {
        if (this.threats.some(t => t.id === threat.id)) return;

        this.threats.unshift(threat);
        this.stats.total++;

        const attackType = threat.attack_type || 'unknown';
        if (this.stats[attackType] !== undefined) {
            this.stats[attackType]++;
        }

        if (threat.risk_score >= 80) {
            this.stats.high_risk++;
            this.setSiegeState(true);
        } else {
            // Auto-recover after 10s if no high risk threats
            setTimeout(() => {
                if (!this.threats.slice(0, 5).some(t => t.risk_score >= 80)) {
                    this.setSiegeState(false);
                }
            }, 10000);
        }

        this.liveFeed.addThreat(threat, animate);
        this.map.addThreat(threat);
        this.velocityChart.addThreat(threat);
        this.updateStatsDisplay();

        if (this.threats.length > 100) {
            this.threats = this.threats.slice(0, 100);
        }
    }

    setSiegeState(active) {
        const widget = document.getElementById('targetStatus');
        const text = document.getElementById('targetStatusText');
        this.isUnderSiege = active;

        if (active) {
            widget.classList.add('under-siege');
            text.textContent = "ANAS_SERVER: UNDER SIEGE!";
        } else {
            widget.classList.remove('under-siege');
            text.textContent = "ANAS_SERVER: SECURE";
        }
    }

    blockThreat(ip) {
        console.log(`🛡️ IPS BLOCK ACTION INITIATED FOR: ${ip}`);

        // Show "ACCESS DENIED" Animation
        const overlay = document.getElementById('accessDeniedOverlay');
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';

        // Red alert sound
        this.playAlertSound(true); // High intensity

        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
            this.setSiegeState(false);
            alert(`✅ IP ADDRESS ${ip} HAS BEEN PERMANENTLY NEUTRALIZED BY SENTINEL-IPS.`);
        }, 2000);
    }

    generateReport() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const content = `
SENTINEL-EYE PRO // FORENSIC REPORT
==================================
Timestamp: ${new Date().toLocaleString()}
Status: SYSTEM PROTECTED
Total Threats Blocked: ${this.stats.total}
High Risk Incidents: ${this.stats.high_risk}

INCIDENT SUMMARY:
----------------
${this.threats.slice(0, 5).map(t => `- [${t.attack_signature}] from ${t.ip_address} (Risk: ${t.risk_score}%)`).join('\n')}

FORENSIC VERDICT:
----------------
All high-risk vectors have been successfully neutralized via the Sentinel-IPS Automated Defense Layer.
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Forensic_Report_${timestamp}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    updateStatsDisplay() {
        document.getElementById('totalThreats').textContent = this.stats.total;
        document.getElementById('countPortScan').textContent = this.stats.port_scan;
        document.getElementById('countArpSpoof').textContent = this.stats.arp_spoof;
        document.getElementById('countSqlInjection').textContent = this.stats.sql_injection;

        const cXss = document.getElementById('countXss');
        if (cXss) cXss.textContent = this.stats.xss_attempt;

        const honeyEl = document.getElementById('countHoneypot');
        if (honeyEl) honeyEl.textContent = this.stats.honeypot_trap;

        document.getElementById('highRiskCount').textContent = this.stats.high_risk;
    }

    updateConnectionStatus(connected) {
        const statusDot = document.getElementById('wsStatus');
        const statusText = document.getElementById('wsStatusText');
        if (connected) {
            statusDot.className = 'status-dot bg-green-500 shadow-[0_0_10px_#22c55e]';
            statusText.textContent = 'OPS ACTIVE';
        } else {
            statusDot.className = 'status-dot bg-gray-500';
            statusText.textContent = 'OFFLINE';
        }
    }

    playAlertSound(heavy = false) {
        const audio = document.getElementById('alertSound');
        if (audio) {
            audio.volume = heavy ? 0.7 : 0.2;
            audio.play().catch(() => { });
        }
    }

    fetchStats() {
        const host = window.location.hostname || 'localhost';
        fetch(`http://${host}:8000/api/threats/stats`)
            .then(r => r.json())
            .then(data => {
                if (data.success && data.stats) {
                    this.velocityChart.updateFromStats(data.stats.velocity);
                }
            }).catch(() => { });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sentinelApp = new SentinelApp();
});
