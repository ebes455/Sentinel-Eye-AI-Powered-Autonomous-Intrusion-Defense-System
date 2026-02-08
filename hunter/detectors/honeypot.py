from scapy.all import IP, TCP
import logging
import config

logger = logging.getLogger('HoneypotDetector')

class HoneypotDetector:
    """
    Deception module. Detects interactions with high-value decoy ports.
    """
    def __init__(self):
        self.trap_ports = config.HONEYPOT_PORTS
        logger.info(f"Honeypot active on ports: {self.trap_ports}")

    def analyze(self, packet):
        if not config.HONEYPOT_ENABLED:
            return None

        if packet.haslayer(TCP) and packet.haslayer(IP):
            dst_port = packet[TCP].dport
            if dst_port in self.trap_ports:
                src_ip = packet[IP].src
                logger.warning(f"\U0001f36f HONEYPOT TRIGGERED! {src_ip} touched port {dst_port}")
                
                return {
                    'ip_address': src_ip,
                    'attack_signature': f"HONEYPOT_TRAP_TRIGGERED (Port {dst_port})",
                    'attack_type': "honeypot_trap",
                    'risk_score': config.HONEYPOT_RISK_SCORE,
                    'metadata': {
                        'trap_port': dst_port,
                        'protocol': 'TCP',
                        'deception_type': 'Port Trap'
                    }
                }
        return None
