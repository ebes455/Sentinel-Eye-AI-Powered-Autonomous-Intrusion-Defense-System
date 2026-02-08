"""
Payload Inspector
Scans HTTP traffic for SQL Injection and XSS attack patterns
"""

import re
from scapy.all import IP, TCP, Raw
import config


class PayloadInspector:
    """
    Deep packet inspection for web application attacks.
    Searches for SQL injection and XSS patterns in HTTP payloads.
    
    Demo: Send a curl request like:
    curl "http://localhost/?id=1' OR '1'='1"
    curl "http://localhost/?search=<script>alert('XSS')</script>"
    """
    
    def __init__(self):
        # Compile regex patterns for performance
        self.sql_patterns = [re.compile(p, re.IGNORECASE) for p in config.SQL_INJECTION_PATTERNS]
        self.xss_patterns = [re.compile(p, re.IGNORECASE) for p in config.XSS_PATTERNS]
        self.max_depth = config.HTTP_INSPECT_DEPTH
    
    def analyze(self, packet):
        """
        Analyze HTTP payloads for malicious patterns.
        Returns threat data if attack detected, None otherwise.
        """
        if not packet.haslayer(IP) or not packet.haslayer(TCP) or not packet.haslayer(Raw):
            return None
        
        ip_layer = packet[IP]
        tcp_layer = packet[TCP]
        
        # Check if it's HTTP traffic (ports 80, 8000, 8080, 3000, etc.)
        if tcp_layer.dport not in [80, 8000, 8080, 3000, 8888] and tcp_layer.sport not in [80, 8000, 8080, 3000, 8888]:
            return None
        
        try:
            payload = packet[Raw].load.decode('utf-8', errors='ignore')[:self.max_depth]
            
            # Check for SQL Injection
            sql_match = self._check_sql_injection(payload)
            if sql_match:
                return {
                    "ip_address": ip_layer.src,
                    "attack_signature": "SQL_INJECTION_ATTEMPT",
                    "attack_type": "sql_injection",
                    "risk_score": config.RISK_SCORES.get("sql_injection", 85),
                    "metadata": {
                        "matched_pattern": sql_match,
                        "payload_sample": payload[:200],
                        "destination_ip": ip_layer.dst,
                        "destination_port": tcp_layer.dport,
                        "detection_reason": f"SQL injection pattern detected: {sql_match}"
                    }
                }
            
            # Check for XSS
            xss_match = self._check_xss(payload)
            if xss_match:
                return {
                    "ip_address": ip_layer.src,
                    "attack_signature": "XSS_ATTEMPT",
                    "attack_type": "xss_attempt",
                    "risk_score": config.RISK_SCORES.get("xss_attempt", 70),
                    "metadata": {
                        "matched_pattern": xss_match,
                        "payload_sample": payload[:200],
                        "destination_ip": ip_layer.dst,
                        "destination_port": tcp_layer.dport,
                        "detection_reason": f"XSS pattern detected: {xss_match}"
                    }
                }
        
        except Exception as e:
            # Ignore decoding errors, malformed packets, etc.
            pass
        
        return None
    
    def _check_sql_injection(self, payload):
        """Check payload against SQL injection patterns"""
        for pattern in self.sql_patterns:
            match = pattern.search(payload)
            if match:
                return match.group(0)[:50]  # Return matched pattern (truncated)
        return None
    
    def _check_xss(self, payload):
        """Check payload against XSS patterns"""
        for pattern in self.xss_patterns:
            match = pattern.search(payload)
            if match:
                return match.group(0)[:50]  # Return matched pattern (truncated)
        return None
