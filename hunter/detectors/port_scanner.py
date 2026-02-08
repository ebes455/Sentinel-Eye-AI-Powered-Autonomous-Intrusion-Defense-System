"""
Port Scan Detector
Detects rapid SYN packets from a single IP (potential port scanning activity)
"""

import time
from collections import defaultdict, deque
from threading import Lock
from scapy.all import IP, TCP
import config


class PortScanDetector:
    """
    Detects port scanning by tracking SYN packet velocity from each IP.
    Uses a sliding window approach to count packets over time.
    
    Demo: Run 'nmap -sS -p 1-1000 <target_ip>' to trigger this detector
    """
    
    def __init__(self):
        self.syn_tracker = defaultdict(deque)  # IP -> [(timestamp, port), ...]
        self.lock = Lock()
        self.threshold = config.PORT_SCAN_THRESHOLD
        self.window = config.PORT_SCAN_WINDOW
        self.detected_ips = set()  # Avoid duplicate alerts
    
    def analyze(self, packet):
        """
        Analyze packet for port scanning behavior.
        Returns threat data if scanning detected, None otherwise.
        """
        if not packet.haslayer(IP) or not packet.haslayer(TCP):
            return None
        
        ip_layer = packet[IP]
        tcp_layer = packet[TCP]
        
        # Check for SYN flag without ACK (new connection attempt)
        if tcp_layer.flags & 0x02 and not (tcp_layer.flags & 0x10):
            src_ip = ip_layer.src
            dst_port = tcp_layer.dport
            current_time = time.time()
            
            with self.lock:
                # Add to tracker
                self.syn_tracker[src_ip].append((current_time, dst_port))
                
                # Remove old entries outside the time window
                while (self.syn_tracker[src_ip] and 
                       current_time - self.syn_tracker[src_ip][0][0] > self.window):
                    self.syn_tracker[src_ip].popleft()
                
                # Check if threshold exceeded
                syn_count = len(self.syn_tracker[src_ip])
                
                if syn_count >= self.threshold and src_ip not in self.detected_ips:
                    self.detected_ips.add(src_ip)
                    
                    # Get unique ports scanned
                    unique_ports = set([port for _, port in self.syn_tracker[src_ip]])
                    
                    return {
                        "ip_address": src_ip,
                        "attack_signature": "PORT_SCAN_DETECTED",
                        "attack_type": "port_scan",
                        "risk_score": config.RISK_SCORES.get("port_scan", 75),
                        "metadata": {
                            "syn_count": syn_count,
                            "unique_ports": len(unique_ports),
                            "ports_sample": list(unique_ports)[:10],
                            "time_window": self.window,
                            "detection_reason": f"{syn_count} SYN packets to {len(unique_ports)} ports in {self.window}s"
                        }
                    }
        
        return None
    
    def reset_tracking(self, ip):
        """Reset tracking for an IP after alert is sent"""
        with self.lock:
            if ip in self.detected_ips:
                self.detected_ips.remove(ip)
            if ip in self.syn_tracker:
                self.syn_tracker[ip].clear()
