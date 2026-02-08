"""
Sentinel-Eye Configuration
Adjust thresholds and API settings here
"""

# Network Configuration
NETWORK_INTERFACE = None  # None = auto-detect, or specify like "eth0" or "Ethernet"
PROMISCUOUS_MODE = True

# Detection Thresholds
PORT_SCAN_THRESHOLD = 20  # SYN packets per second from single IP
PORT_SCAN_WINDOW = 10  # Time window in seconds
ARP_CACHE_SIZE = 100  # Max ARP entries to track
HTTP_INSPECT_DEPTH = 1000  # Max bytes to inspect in HTTP payload

# 🛡️ IPS (Intrusion Prevention) Settings
IPS_BLOCKING_ENABLED = True  # Simulation: Log "BLOCKING..." when high-risk
IPS_BLOCK_THRESHOLD = 80      # Risk score at which auto-block triggers

# 🍯 Honeypot (Deception) Settings
HONEYPOT_ENABLED = True
HONEYPOT_PORTS = [21, 23, 3389, 445]  # FTP, Telnet, RDP, SMB traps
HONEYPOT_RISK_SCORE = 95             # Touching honeypot is high risk

# Attack Patterns
SQL_INJECTION_PATTERNS = [
    r"(\bunion\b.*\bselect\b)",
    r"(\bselect\b.*\bfrom\b)",
    r"(\'.*or.*\'.*=.*\')",
    r"(--|\#|\/\*)",
    r"(\bexec\b|\bexecute\b)",
    r"(\bdrop\b.*\btable\b)",
]

XSS_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"javascript:",
    r"onerror\s*=",
    r"onload\s*=",
    r"<iframe",
    r"eval\(",
]

# Forensic Data Capture
CAPTURE_RAW_PAYLOAD = True
MAX_PAYLOAD_SIZE = 512  # Bytes to store for forensics

# Risk Scoring
RISK_SCORES = {
    "port_scan": 75,
    "arp_spoof": 90,
    "sql_injection": 85,
    "xss_attempt": 70,
    "suspicious_payload": 60,
}

# API Configuration
LARAVEL_API_URL = "http://localhost:8000/api/threats"
API_TIMEOUT = 5  # seconds
API_RETRY = 3

# Gemini AI Configuration (for real integration)
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"  # Replace with actual key
# AI Analysis Settings
USE_MOCK_AI = True  # Set to False to use actual Gemini API
AI_MODEL_NAME = "gemini-1.5-flash"

# Hackathon / Demo Settings
SIMULATION_MODE = True  # Set to True if you don't have Npcap/WinPcap installed
SIMULATION_INTERVAL = 30  # Seconds between simulated threats

# Logging Configuration
LOG_LEVEL = "INFO"  # DEBUG, INFO, WARNING, ERROR
LOG_FILE = "sentinel.log"

# Performance
MAX_QUEUE_SIZE = 1000
WORKER_THREADS = 4
PACKET_BUFFER = 512
