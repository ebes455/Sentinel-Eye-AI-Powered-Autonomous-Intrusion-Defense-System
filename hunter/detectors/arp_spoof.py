"""
ARP Spoofing Detector
Detects ARP poisoning attacks (Man-in-the-Middle attempts)
"""

from collections import defaultdict
from threading import Lock
from scapy.all import ARP, Ether
import config


class ARPSpoofDetector:
    """
    Detects ARP spoofing by monitoring MAC-IP bindings.
    If an IP suddenly claims a different MAC address, it's suspicious.
    
    Demo: Use 'arpspoof' or 'ettercap' tools to trigger this (ONLY on your own network!)
    """
    
    def __init__(self):
        self.arp_table = {}  # IP -> MAC mapping
        self.lock = Lock()
        self.max_cache = config.ARP_CACHE_SIZE
    
    def analyze(self, packet):
        """
        Analyze ARP packets for spoofing attempts.
        Returns threat data if spoofing detected, None otherwise.
        """
        if not packet.haslayer(ARP):
            return None
        
        arp_layer = packet[ARP]
        
        # We're interested in ARP replies (is-at)
        if arp_layer.op == 2:  # ARP reply
            sender_ip = arp_layer.psrc
            sender_mac = arp_layer.hwsrc
            
            with self.lock:
                # Check if we've seen this IP before with different MAC
                if sender_ip in self.arp_table:
                    stored_mac = self.arp_table[sender_ip]
                    
                    if stored_mac != sender_mac:
                        # MAC address changed for this IP - POTENTIAL SPOOF!
                        return {
                            "ip_address": sender_ip,
                            "attack_signature": "ARP_SPOOFING_DETECTED",
                            "attack_type": "arp_spoof",
                            "risk_score": config.RISK_SCORES.get("arp_spoof", 90),
                            "metadata": {
                                "original_mac": stored_mac,
                                "spoofed_mac": sender_mac,
                                "target_ip": arp_layer.pdst if hasattr(arp_layer, 'pdst') else "unknown",
                                "detection_reason": f"IP {sender_ip} changed MAC from {stored_mac} to {sender_mac}"
                            }
                        }
                else:
                    # New IP, store it
                    if len(self.arp_table) >= self.max_cache:
                        # Simple cache eviction (remove oldest)
                        oldest_ip = next(iter(self.arp_table))
                        del self.arp_table[oldest_ip]
                    
                    self.arp_table[sender_ip] = sender_mac
        
        # Also check for gratuitous ARP (broadcast updates) which can be suspicious
        elif arp_layer.op == 1:  # ARP request
            if arp_layer.psrc == arp_layer.pdst:  # Gratuitous ARP
                sender_ip = arp_layer.psrc
                sender_mac = arp_layer.hwsrc
                
                with self.lock:
                    if sender_ip in self.arp_table and self.arp_table[sender_ip] != sender_mac:
                        return {
                            "ip_address": sender_ip,
                            "attack_signature": "GRATUITOUS_ARP_SPOOF",
                            "attack_type": "arp_spoof",
                            "risk_score": config.RISK_SCORES.get("arp_spoof", 90) - 10,
                            "metadata": {
                                "original_mac": self.arp_table[sender_ip],
                                "new_mac": sender_mac,
                                "arp_type": "gratuitous",
                                "detection_reason": f"Gratuitous ARP with MAC change detected"
                            }
                        }
        
        return None
