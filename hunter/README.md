# Sentinel-Eye Hunter Engine

Multi-threaded network intrusion detection system with AI-powered threat analysis.

## Features

- **Port Scan Detection**: Identifies rapid SYN packet floods
- **ARP Spoofing Detection**: Catches Man-in-the-Middle attempts
- **Payload Inspection**: Scans HTTP traffic for SQL Injection and XSS
- **AI Analysis**: Gemini API integration for threat explanations
- **Real-time Reporting**: Sends threats to Laravel backend via REST API

## Installation

### Requirements
- Python 3.10+
- Administrator/root privileges (required for packet capture)
- Windows: [Npcap](https://npcap.com/#download) or WinPcap

### Setup

```bash
cd hunter
pip install -r requirements.txt
```

## Configuration

Edit `config.py` to adjust:
- Detection thresholds
- API endpoint URL
- Gemini API key (for real AI integration)
- Network interface (or leave as `None` for auto-detect)

## Usage

### Start the Hunter

**Windows (Run as Administrator):**
```powershell
python sentinel_engine.py
```

**Linux/Mac:**
```bash
sudo python3 sentinel_engine.py
```

### Demo for Judges

The Hunter will automatically send threats to `http://localhost:8000/api/threats`. Make sure your Laravel backend is running!

**Test Port Scan Detection:**
```bash
# Run Nmap against your own network
nmap -sS -p 1-1000 192.168.1.1
```

**Test SQL Injection Detection:**
```bash
curl "http://localhost/?id=1' OR '1'='1"
curl "http://localhost/?search=UNION SELECT * FROM users--"
```

**Test XSS Detection:**
```bash
curl "http://localhost/?q=<script>alert('XSS')</script>"
```

**Test ARP Spoofing:**
```bash
# ONLY on your own network!
# Use tools like arpspoof or ettercap
```

## Architecture

```
sentinel_engine.py (Main Orchestrator)
    ├── Packet Capture (Scapy AsyncSniffer)
    ├── Detection Modules
    │   ├── PortScanDetector (SYN flood tracking)
    │   ├── ARPSpoofDetector (MAC-IP binding monitor)
    │   └── PayloadInspector (Regex pattern matching)
    ├── Threat Queue (Thread-safe)
    └── Worker Threads
        ├── AI Analysis (Gemini API)
        ├── Geo-location Enrichment
        └── API Reporter (POST to Laravel)
```

## Performance

- Processes 1000+ packets/second on Ryzen 5 5600
- Multi-threaded design for concurrent detection
- Queue-based architecture prevents packet loss
- Configurable worker thread pool

## Security Notes

⚠️ **Run only on networks you own or have permission to monitor**
⚠️ **Packet capture requires elevated privileges**
⚠️ **Do not perform attacks against external systems**

## Troubleshooting

**No packets captured:**
- Ensure you're running with admin/root privileges
- Check `NETWORK_INTERFACE` in config.py
- Verify Npcap/WinPcap is installed (Windows)

**API connection failed:**
- Ensure Laravel backend is running on port 8000
- Check `LARAVEL_API_URL` in config.py
- Verify firewall isn't blocking localhost connections

**Import errors:**
- Run `pip install -r requirements.txt`
- Ensure Python 3.10+ is installed
