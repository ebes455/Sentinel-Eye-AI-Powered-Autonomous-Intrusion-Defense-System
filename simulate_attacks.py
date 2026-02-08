import requests
import time
import random

API_URL = "http://localhost:8000/api/threats"

threats = [
    {
        "ip_address": "192.168.1.105",
        "attack_signature": "TCP SYN Flood detected (Port Scan)",
        "attack_type": "port_scan",
        "risk_score": 75,
        "location": "Unknown"
    },
    {
        "ip_address": "45.33.22.11",
        "attack_signature": "SQL Injection Pattern Detected: ' OR '1'='1",
        "attack_type": "sql_injection",
        "risk_score": 90,
        "location": "China"
    },
    {
        "ip_address": "10.0.0.55",
        "attack_signature": "ARP Spoofing Detected: MAC 00:11:22:33:44:55 trying to claim 192.168.1.1",
        "attack_type": "arp_spoof",
        "risk_score": 85,
        "location": "Local Network"
    },
    {
        "ip_address": "185.22.1.4",
        "attack_signature": "XSS Payload Detected: <script>alert(1)</script>",
        "attack_type": "xss",
        "risk_score": 60,
        "location": "Russia"
    }
]

print("Starting threat simulation...")
while True:  # Run infinitely
    threat = random.choice(threats)
    # Add some randomness to risk score
    threat["risk_score"] = min(100, max(0, threat["risk_score"] + random.randint(-10, 10)))
    
    try:
        response = requests.post(API_URL, json=threat)
        print(f"Sent threat: {threat['attack_type']}, Status: {response.status_code}")
    except Exception as e:
        print(f"Error sending threat: {e}")
    
    time.sleep(random.uniform(1, 3))

print("Simulation complete.")
