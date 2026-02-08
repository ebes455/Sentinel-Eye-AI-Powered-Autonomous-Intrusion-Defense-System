import requests
import time

API_URL = "http://localhost:8000/api/threats"

# Send one simple test threat
threat = {
    "ip_address": "192.168.1.100",
    "attack_signature": "TEST THREAT - Port Scan Detected",
    "attack_type": "port_scan",
    "risk_score": 85,
    "geo_location": "Test Location",
    "ai_analysis": "This is a test threat to verify the system is working"
}

print("Sending test threat...")
response = requests.post(API_URL, json=threat)
print(f"Response: {response.status_code}")
print(f"Body: {response.text}")
