/**
 * Sentinel-Eye Pro: Live Threat Feed
 * Features: Block Kill-switch, Decoded forensics, and UI highlights
 */

export class LiveFeed {
    constructor(selector) {
        this.container = document.querySelector(selector);
        this.maxItems = 50;
    }

    addThreat(threat, animate = true) {
        const item = this.createThreatElement(threat);
        const placeholder = this.container.querySelector('.text-center');
        if (placeholder) placeholder.remove();

        this.container.insertBefore(item, this.container.firstChild);

        if (animate) {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                item.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 10);
        }

        while (this.container.children.length > this.maxItems) {
            this.container.removeChild(this.container.lastChild);
        }
    }

    createThreatElement(threat) {
        const div = document.createElement('div');
        const score = threat.risk_score || 0;
        const riskClass = score >= 70 ? 'high-risk' : (score >= 40 ? 'med-risk' : 'low-risk');

        let meta = {};
        try {
            meta = typeof threat.metadata === 'string' ? JSON.parse(threat.metadata) : threat.metadata;
        } catch (e) { meta = threat.metadata || {}; }

        div.className = `threat-item p-4 mb-3 border-l-4 ${riskClass} bg-slate-900/80 backdrop-blur-sm relative group overflow-hidden`;

        const ipsLabel = meta.ips_action === 'BLOCKED'
            ? '<span class="px-2 py-0.5 bg-red-600 text-[9px] font-bold rounded text-white shadow-[0_0_10px_#ef4444]">BLOCKED</span>'
            : '<span class="px-2 py-0.5 bg-blue-600/20 text-[9px] rounded text-blue-400 font-bold border border-blue-500/30">MONITOR</span>';

        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-[9px] opacity-40 font-mono tracking-widest uppercase">${new Intl.DateTimeFormat('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())}</span>
                <div class="flex gap-2">
                    ${ipsLabel}
                    <button class="btn-block-threat" onclick="event.stopPropagation(); window.sentinelApp.blockThreat('${threat.ip_address}')">BLOCK NOW</button>
                </div>
            </div>
            <div class="font-black text-xs tracking-tight text-white mb-1 uppercase">${threat.attack_signature}</div>
            <div class="text-[10px] text-green-500/70 mb-2">SRC: ${threat.ip_address} <span class="opacity-30">|</span> DST: ${meta.victim_name || 'ANAS_PC'}</div>
            
            <div class="mt-3 flex justify-between items-center">
                <div class="text-[10px] font-bold text-white/40">RISK: <span class="${score >= 70 ? 'text-red-500' : 'text-green-500'}">${score}%</span></div>
                <div class="text-[9px] text-green-500 underline decoration-green-500/30 font-bold group-hover:text-white transition-colors">OPEN CASE FILE →</div>
            </div>
            
            <!-- Background Decoration -->
            <div class="absolute -right-4 -bottom-4 opacity-[0.03] text-5xl font-black pointer-events-none group-hover:scale-110 transition-transform">
                ${threat.attack_type.substring(0, 3).toUpperCase()}
            </div>
        `;

        div.onclick = () => this.showForensics(threat, meta);
        return div;
    }

    showForensics(threat, meta) {
        const modal = document.createElement('div');
        modal.className = "fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[101] p-6 backdrop-blur-xl animate-in fade-in duration-300";
        modal.onclick = () => modal.remove();

        // Command decoding logic
        const decoded = meta.decoded_payload || "No text data extracted from packet headers.";
        const isMalicious = decoded.includes('SELECT') || decoded.includes('<script') || decoded.includes('fetch');

        let explanation = "Packet contains standard protocol flags.";
        if (decoded.includes('SELECT')) explanation = "SQL Command detected. Attacker is attempting to bypass authentication and steal private database records.";
        if (decoded.includes('<script')) explanation = "XSS Payload found. Malicious script injection aiming to hijack user sessions via browser cookies.";
        if (decoded.includes('SYN_SCAN')) explanation = "Reconnaissance detected. Remote host is probing for open doors to exploit your infrastructure.";

        modal.innerHTML = `
            <div class="max-w-4xl w-full bg-slate-900 border border-green-500/50 shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]" onclick="event.stopPropagation()">
                <!-- Header -->
                <div class="p-6 border-b border-green-500/20 flex justify-between items-center bg-black/30">
                    <div>
                        <div class="text-[10px] text-green-500 font-bold tracking-[0.3em] mb-1">SENTINEL-EYE PRO // FORENSIC CASE FILE</div>
                        <div class="text-2xl font-black text-white italic">${threat.attack_signature}</div>
                    </div>
                    <button class="text-4xl text-green-500/50 hover:text-white" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>

                <div class="flex flex-1 overflow-hidden">
                    <!-- Left: Raw Evidence -->
                    <div class="w-1/2 p-6 border-r border-green-500/10 flex flex-col">
                        <div class="text-[10px] font-bold text-white/30 mb-3 tracking-widest uppercase">Byte-Level Evidence (Hex Dump)</div>
                        <div class="flex-1 bg-black p-4 font-mono text-[11px] leading-relaxed text-green-500/60 overflow-y-auto custom-scrollbar border border-white/5 shadow-inner">
                            ${meta.raw_payload || 'NO RAW DATA CAPTURED.'}
                        </div>
                        <div class="mt-4 p-4 bg-slate-800/50 border-l-2 border-slate-500">
                            <div class="text-[9px] opacity-50 mb-1">METADATA</div>
                            <div class="text-xs text-white/70">Packet ID: #SNT-${meta.packet_id || '9921'} | TTL: 64 | Origin: ${threat.geo_location}</div>
                        </div>
                    </div>

                    <!-- Right: Human Analysis -->
                    <div class="w-1/2 p-6 flex flex-col space-y-6">
                        <section>
                            <div class="text-[10px] font-bold text-white/30 mb-3 tracking-widest uppercase italic">The "Decoder" View</div>
                            <div class="bg-slate-800/50 p-5 border border-white/5 rounded-sm">
                                <div class="text-[10px] opacity-40 mb-2">DECODED COMMAND STRING:</div>
                                <div class="font-mono text-sm ${isMalicious ? 'text-red-400' : 'text-green-400'} break-all">
                                    ${this.highlightKeywords(decoded)}
                                </div>
                            </div>
                        </section>

                        <section>
                            <div class="text-[10px] font-bold text-white/30 mb-3 tracking-widest uppercase italic">AI Security Assessment</div>
                            <div class="p-5 bg-green-500/5 border-l-4 border-green-500 rounded-sm">
                                <div class="text-xs text-white leading-relaxed italic mb-4">
                                    "${threat.ai_analysis}"
                                </div>
                                <div class="bg-black/20 p-3 rounded">
                                    <div class="text-[9px] font-bold text-green-500 mb-1">IMPACT EXPLANATION:</div>
                                    <div class="text-[11px] text-white/60">${explanation}</div>
                                </div>
                            </div>
                        </section>

                        <div class="mt-auto flex gap-4">
                            <button class="flex-1 py-3 bg-red-600 text-white font-black hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]" onclick="window.sentinelApp.blockThreat('${threat.ip_address}')">KILL CONNECTION</button>
                            <button class="px-6 py-3 border border-white/10 text-white font-bold opacity-50 hover:opacity-100" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">CLOSE</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    highlightKeywords(text) {
        if (!text) return text;
        const keywords = ['SELECT', 'FROM', 'UNION', 'WHERE', 'script', 'fetch', 'cookie'];
        let highlighted = text;
        keywords.forEach(kw => {
            const regex = new RegExp(kw, 'gi');
            highlighted = highlighted.replace(regex, `<span class="text-red-600 font-black italic shadow-[0_0_5px_rgba(220,38,38,0.5)] border-b border-red-900">${kw}</span>`);
        });
        return highlighted;
    }
}
