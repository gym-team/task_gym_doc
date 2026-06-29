"use client";
import { Navigation } from "@/components/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageSquare, Zap, Users, BookOpen, Phone, Sparkles, Trash2 } from "lucide-react";

// ── API ──────────────────────────────────────────────────────
const API_BASE = "https://ihateskil-fitzone-chatbot.hf.space";
const API_KEY  = "3sygZYEuW_Kqz8sUp-HqGTHAI6wAQAO5ZpuDN_Lz4cU";
const HF_TOKEN = "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";
const MAX_CHARS = 1800;
// Unsplash — dark gym/fitness background
const BG_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80&auto=format&fit=crop";
// localStorage key for chat history persistence
const STORAGE_KEY = "fitzone_ai_chat_history";

interface ApiMsg { role: "user" | "assistant"; content: string; }
function truncate(t: string) { return t.length <= MAX_CHARS ? t : t.slice(0, MAX_CHARS - 3) + "..."; }

async function streamChat(
  message: string, history: ApiMsg[],
  onChunk: (full: string) => void,
  onError: (e: string) => void,
  onDone: () => void
) {
  try {
    const res = await fetch(`${API_BASE}/v1/chat/stream`, {
      method: "POST",
      headers: { "Content-Type":"application/json", "X-API-Key":API_KEY, Authorization:`Bearer ${HF_TOKEN}` },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    if (!res.body) throw new Error("Empty body");
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let acc = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      acc += dec.decode(value, { stream: true });
      onChunk(acc);
    }
    acc += dec.decode();
    onChunk(acc);
    onDone();
  } catch (e: unknown) { onError(e instanceof Error ? e.message : "Connection failed"); }
}

// ── Markdown → HTML (pure string, no React, no re-render) ─────
function ri(raw: string) {
  return raw
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.+?)\*\*/g,`<strong style="font-weight:700;color:#84FF00">$1</strong>`)
    .replace(/\*(.+?)\*/g,    `<em style="font-style:italic;color:rgba(255,255,255,.55)">$1</em>`)
    .replace(/`(.+?)`/g,      `<code style="background:rgba(0,217,255,.13);border-radius:4px;padding:1px 6px;font-family:monospace;font-size:11px;color:#00D9FF">$1</code>`);
}
function md2html(md: string) {
  return md.split("\n").map(line => {
    if (!line.trim()) return `<div style="height:5px"></div>`;
    let m: RegExpMatchArray|null;
    if ((m=line.match(/^###\s+(.+)/))) return `<p style="font-size:10px;font-weight:800;color:#84FF00;letter-spacing:.1em;text-transform:uppercase;margin:11px 0 2px">${ri(m[1])}</p>`;
    if ((m=line.match(/^##\s+(.+)/)))  return `<p style="font-size:13px;font-weight:700;color:#fff;margin:13px 0 3px;padding-bottom:3px;border-bottom:1px solid rgba(255,255,255,.07)">${ri(m[1])}</p>`;
    if ((m=line.match(/^#\s+(.+)/)))   return `<p style="font-size:15px;font-weight:800;color:#fff;margin:15px 0 5px">${ri(m[1])}</p>`;
    if ((m=line.match(/^(\s*)[\*\-•]\s+(.+)/))) {
      const ml=m[1].length>0?"margin-left:14px":"", dc=m[1].length>0?"rgba(132,255,0,.45)":"#84FF00";
      return `<div style="display:flex;gap:7px;align-items:flex-start;${ml};margin:2px 0"><span style="margin-top:7px;width:5px;height:5px;border-radius:50%;background:${dc};flex-shrink:0"></span><span style="font-size:13px;color:rgba(255,255,255,.82);line-height:1.6">${ri(m[2])}</span></div>`;
    }
    if ((m=line.match(/^(\s*)(\d+)\.\s+(.+)/))) return `<div style="display:flex;gap:7px;align-items:flex-start;margin:2px 0"><span style="font-size:11px;font-weight:700;color:#84FF00;min-width:16px;text-align:right;margin-top:2px;flex-shrink:0">${m[2]}.</span><span style="font-size:13px;color:rgba(255,255,255,.82);line-height:1.6">${ri(m[3])}</span></div>`;
    if (line.match(/^---+$/)) return `<hr style="border:none;border-top:1px solid rgba(255,255,255,.07);margin:6px 0">`;
    return `<p style="font-size:13px;color:rgba(255,255,255,.82);line-height:1.65;margin:1px 0">${ri(line)}</p>`;
  }).join("");
}

interface Msg { id: string; role: "user"|"assistant"; content: string; ts: string; done: boolean; }

// ── Default welcome message (used when there's no saved history) ──
function makeWelcomeMsg(): Msg {
  return {
    id: "0", role: "assistant", done: true,
    ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    content: "Hey! I'm your **FitZone AI Assistant** — elite fitness intelligence.\n\nI can help with workout plans, nutrition, trainer booking, and more. What are your goals today?",
  };
}

// ── Safe localStorage helpers ───────────────────────────────────
function loadHistory(): Msg[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    // Only keep messages that finished streaming (avoid resuming a half-typed bubble)
    return parsed.filter((m: Msg) => m.done);
  } catch {
    return null;
  }
}
function saveHistory(msgs: Msg[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {
    // localStorage might be full or unavailable (private mode) — fail silently
  }
}

export default function AIAssistantPage() {
  // Start with the welcome message on the server-rendered pass; real history (if any)
  // is loaded from localStorage in an effect right after mount.
  const [msgs, setMsgs] = useState<Msg[]>([makeWelcomeMsg()]);
  const [input, setInput] = useState("");
  const [busy,  setBusy]  = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const bufRef    = useRef<Record<string,string>>({});

  // Load saved chat history once, right after mount (client-only, avoids SSR mismatch)
  useEffect(() => {
    const saved = loadHistory();
    if (saved && saved.length > 0) setMsgs(saved);
    setHydrated(true);
  }, []);

  // Persist history to localStorage whenever it changes (after initial hydration)
  useEffect(() => {
    if (!hydrated) return;
    // Don't persist mid-stream bubbles; only the finished ones
    saveHistory(msgs.filter(m => m.done));
  }, [msgs, hydrated]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  // Write ONLY to DOM — absolutely zero React re-render during streaming
  const domWrite = useCallback((id: string, html: string) => {
    const el = document.getElementById(`sb-${id}`);
    if (el) {
      // key trick: set a fixed min-height so the bubble never shrinks/jumps
      el.innerHTML = html;
    }
    // hide dots once text arrives
    const dots = document.getElementById(`dots-${id}`);
    if (dots) dots.style.display = "none";
  }, []);

  const send = useCallback((text: string) => {
    if (!text.trim() || busy) return;
    const ts = () => new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    const bid = `b${Date.now()}`;
    bufRef.current[bid] = "";

    const userMsg: Msg = { id:`u${Date.now()}`, role:"user",      content:text, ts:ts(), done:true };
    const botMsg:  Msg = { id:bid,              role:"assistant",  content:"",   ts:ts(), done:false };

    setMsgs(prev => {
      const history = prev.map(m=>({role:m.role, content:truncate(m.content)}));
      const next = [...prev, userMsg, botMsg];
      requestAnimationFrame(() => {
        setBusy(true);
        streamChat(text, history,
          (full) => {
            bufRef.current[bid] = full;
            domWrite(bid, md2html(full));
          },
          (err) => {
            domWrite(bid, `<p style="color:#FF6B00;font-size:13px">⚠️ ${err}</p>`);
            setMsgs(c=>c.map(m=>m.id===bid?{...m,content:`⚠️ ${err}`,done:true}:m));
            setBusy(false);
          },
          () => {
            const final = bufRef.current[bid]||"";
            delete bufRef.current[bid];
            // freeze into React state — exactly one re-render, after stream ends
            setMsgs(c=>c.map(m=>m.id===bid?{...m,content:final,done:true}:m));
            setBusy(false);
          }
        );
      });
      return next;
    });
    setInput("");
  }, [busy, domWrite]);

  // Clear saved history and reset to the welcome message
  const clearChat = useCallback(() => {
    if (busy) return;
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    setMsgs([makeWelcomeMsg()]);
  }, [busy]);

  const quick = [
    { icon:Zap,      label:"Workout Tips",  q:"Give me a quick 30-min full body workout routine" },
    { icon:BookOpen, label:"Diet Plan",     q:"Create a detailed meal plan for muscle gain" },
    { icon:Users,    label:"Book Trainer",  q:"Help me find and book a personal trainer" },
    { icon:Phone,    label:"Support",       q:"I need to contact FitZone support" },
  ];

  return (
    <>
      <style>{`
        /* ── Animations ── */
        @keyframes grid-drift { to { background-position: 0 56px; } }
        @keyframes scan-line {
          0%   { top:-3px; opacity:0; }
          5%   { opacity:.5; }
          95%  { opacity:.5; }
          100% { top:100%; opacity:0; }
        }
        @keyframes orb-pulse { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:.28;transform:scale(1.1)} }
        @keyframes msg-in  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dot-up  { 0%,80%,100%{transform:translateY(0);opacity:.35} 40%{transform:translateY(-5px);opacity:1} }
        @keyframes header-glow { 0%,100%{text-shadow:0 0 20px rgba(132,255,0,.4)} 50%{text-shadow:0 0 40px rgba(132,255,0,.8)} }
        @keyframes icon-halo { 0%,100%{box-shadow:0 0 0 0 rgba(132,255,0,0)} 50%{box-shadow:0 0 0 8px rgba(132,255,0,0)} }
        /* dumbbell curl animation */
        @keyframes curl {
          0%   { transform: rotate(-15deg) translateY(0px); }
          25%  { transform: rotate(10deg)  translateY(-3px); }
          50%  { transform: rotate(-15deg) translateY(0px); }
          75%  { transform: rotate(10deg)  translateY(-3px); }
          100% { transform: rotate(-15deg) translateY(0px); }
        }
        @keyframes dumbbell-float {
          0%,100% { transform: translateY(0) rotate(-8deg); }
          50%     { transform: translateY(-12px) rotate(8deg); }
        }
        @keyframes dumbbell-glow {
          0%,100% { filter: drop-shadow(0 0 6px rgba(132,255,0,.5)); }
          50%     { filter: drop-shadow(0 0 18px rgba(132,255,0,1)); }
        }
        @keyframes plate-spin {
          0%   { transform: scaleY(1); }
          50%  { transform: scaleY(0.7); }
          100% { transform: scaleY(1); }
        }

        .msg-in   { animation: msg-in .3s ease-out both; }
        .dot      { display:inline-block;width:7px;height:7px;border-radius:50%;background:#84FF00; }
        .dot:nth-child(1){ animation:dot-up 1.2s ease-in-out 0s   infinite }
        .dot:nth-child(2){ animation:dot-up 1.2s ease-in-out .15s infinite }
        .dot:nth-child(3){ animation:dot-up 1.2s ease-in-out .30s infinite }
        input::placeholder { color:rgba(255,255,255,.28)!important }
        *::-webkit-scrollbar       { width:3px }
        *::-webkit-scrollbar-track { background:transparent }
        *::-webkit-scrollbar-thumb { background:rgba(132,255,0,.2);border-radius:3px }

        /* streaming bubble: overflow hidden + min-height prevents layout jump */
        .stream-bubble {
          overflow: hidden;
          /* height grows naturally but never shrinks mid-stream */
          min-height: 0;
        }
        /* once content exists, height is driven by content — no jitter */
        .stream-bubble > div { overflow-anchor: none; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", paddingTop:72, position:"relative", overflow:"hidden", background:"#050505" }}>

        {/* ── Unsplash BG ── */}
        <div style={{
          position:"fixed", inset:0, zIndex:0,
          backgroundImage:`url(${BG_IMAGE})`,
          backgroundSize:"cover", backgroundPosition:"center 30%",
          opacity:.22,
        }} />
        {/* Dark overlay */}
        <div style={{ position:"fixed", inset:0, zIndex:1, background:"linear-gradient(to bottom,rgba(5,5,5,.82) 0%,rgba(5,5,5,.65) 50%,rgba(5,5,5,.92) 100%)" }} />
        {/* Green gradient overlay */}
        <div style={{ position:"fixed", inset:0, zIndex:2, background:"linear-gradient(to bottom,rgba(132,255,0,.08) 0%,transparent 40%,rgba(5,5,5,.3) 100%)" }} />

        {/* ── Animated grid ── */}
        <div style={{
          position:"fixed", inset:0, zIndex:3,
          backgroundImage:"linear-gradient(rgba(132,255,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(132,255,0,.04) 1px,transparent 1px)",
          backgroundSize:"56px 56px",
          animation:"grid-drift 4s linear infinite",
          pointerEvents:"none",
        }} />

        {/* ── Scan line ── */}
        <div style={{ position:"fixed", left:0, right:0, height:2, background:"linear-gradient(90deg,transparent 0%,rgba(132,255,0,.35) 50%,transparent 100%)", zIndex:4, animation:"scan-line 5s linear infinite", pointerEvents:"none" }} />

        {/* ── Glow orbs ── */}
        <div style={{ position:"fixed", top:"-15%", left:"-8%",  width:640, height:640, borderRadius:"50%", background:"radial-gradient(circle,rgba(132,255,0,.14) 0%,transparent 65%)", zIndex:3, animation:"orb-pulse 7s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:"-12%", right:"-6%", width:520, height:520, borderRadius:"50%", background:"radial-gradient(circle,rgba(132,255,0,.09) 0%,transparent 65%)", zIndex:3, animation:"orb-pulse 9s ease-in-out 2s infinite", pointerEvents:"none" }} />
        <div style={{ position:"fixed", top:"40%", left:"60%", width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,217,255,.05) 0%,transparent 65%)", zIndex:3, animation:"orb-pulse 11s ease-in-out 1s infinite", pointerEvents:"none" }} />

        <Navigation />

        {/* ── Dumbbell hero cell ── */}
        <div style={{ position:"relative", zIndex:5, display:"flex", flexDirection:"column", alignItems:"center", padding:"18px 16px 10px", gap:6 }}>
          {/* animated dumbbell */}
          <div style={{ animation:"dumbbell-float 3s ease-in-out infinite", marginBottom:4 }}>
            <div style={{ animation:"dumbbell-glow 3s ease-in-out infinite" }}>
              <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:90, height:30 }}>
                {/* left outer plate */}
                <rect x="0"  y="6"  width="12" height="28" rx="3" fill="#84FF00" opacity="0.95"/>
                {/* left inner plate */}
                <rect x="12" y="11" width="7"  height="18" rx="2" fill="#84FF00" opacity="0.75"/>
                {/* collar left */}
                <rect x="19" y="14" width="4"  height="12" rx="1.5" fill="#84FF00" opacity="0.55"/>
                {/* bar */}
                <rect x="23" y="16" width="74" height="8" rx="3" fill="#84FF00" opacity="0.45"/>
                {/* collar right */}
                <rect x="97" y="14" width="4"  height="12" rx="1.5" fill="#84FF00" opacity="0.55"/>
                {/* right inner plate */}
                <rect x="101" y="11" width="7" height="18" rx="2" fill="#84FF00" opacity="0.75"/>
                {/* right outer plate */}
                <rect x="108" y="6"  width="12" height="28" rx="3" fill="#84FF00" opacity="0.95"/>
                {/* shine */}
                <rect x="25" y="17" width="70" height="2" rx="1" fill="rgba(255,255,255,.18)"/>
              </svg>
            </div>
          </div>

          {/* Header text */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#84FF00,#00D9FF)", display:"flex", alignItems:"center", justifyContent:"center", animation:"icon-halo 3s ease-in-out infinite", boxShadow:"0 0 22px rgba(132,255,0,.5)" }}>
              <Sparkles size={19} color="#000" />
            </div>
            <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:".05em", margin:0, textTransform:"uppercase", animation:"header-glow 3s ease-in-out infinite" }}>
              FitZone <span style={{ color:"#84FF00" }}>AI</span>
            </h1>
          </div>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.35)", margin:0, letterSpacing:".12em", textTransform:"uppercase" }}>Elite Fitness Intelligence System</p>
        </div>

        {/* ── Chat container ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", maxWidth:860, width:"100%", margin:"0 auto", position:"relative", zIndex:5, minHeight:0 }}>

          {/* Clear chat — only show once there's an actual conversation to clear */}
          {msgs.length>1 && (
            <div style={{ display:"flex", justifyContent:"flex-end", padding:"4px 16px 0" }}>
              <button
                onClick={clearChat}
                disabled={busy}
                style={{
                  display:"flex", alignItems:"center", gap:5,
                  background:"transparent", border:"1px solid rgba(255,255,255,.08)",
                  borderRadius:20, padding:"5px 11px", cursor:busy?"not-allowed":"pointer",
                  color:"rgba(255,255,255,.4)", fontSize:11, fontWeight:600,
                  letterSpacing:".03em", transition:"all .2s ease", opacity:busy?.4:1,
                }}
                onMouseEnter={e=>{ if(busy) return; const b=e.currentTarget; b.style.borderColor="rgba(255,107,0,.5)"; b.style.color="#FF6B00"; }}
                onMouseLeave={e=>{ const b=e.currentTarget; b.style.borderColor="rgba(255,255,255,.08)"; b.style.color="rgba(255,255,255,.4)"; }}
              >
                <Trash2 size={12}/> Clear chat
              </button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"10px 16px 6px", display:"flex", flexDirection:"column", gap:12 }}>
            {msgs.map(m => (
              <div key={m.id} className="msg-in" style={{ display:"flex", gap:10, alignItems:"flex-start", flexDirection:m.role==="user"?"row-reverse":"row" }}>
                {/* Avatar */}
                {m.role==="assistant"
                  ? <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#84FF00,#00D9FF)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 0 14px rgba(132,255,0,.4)" }}><MessageSquare size={15} color="#000"/></div>
                  : <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#84FF00,#5cc200)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><span style={{ color:"#000", fontWeight:900, fontSize:12 }}>U</span></div>
                }

                <div style={{ display:"flex", flexDirection:"column", gap:3, maxWidth:"79%", alignItems:m.role==="user"?"flex-end":"flex-start" }}>
                  <div style={{
                    borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",
                    padding:"9px 13px",
                    background:m.role==="user"
                      ? "linear-gradient(135deg,#84FF00,#5cc200)"
                      : "linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.022))",
                    border:m.role==="user"?"none":"1px solid rgba(255,255,255,.09)",
                    backdropFilter:m.role==="assistant"?"blur(16px)":"none",
                    WebkitBackdropFilter:m.role==="assistant"?"blur(16px)":"none",
                  }}>
                    {m.role==="user" ? (
                      <p style={{ fontSize:13, color:"#000", margin:0, lineHeight:1.6, fontWeight:600 }}>{m.content}</p>
                    ) : !m.done ? (
                      // ── STREAMING: two sibling divs, no wrapper that resizes ──
                      // The outer bubble div has a stable border/padding.
                      // Only sb-{id} innerHTML changes — written directly from domWrite.
                      // The dots div is hidden as soon as text arrives.
                      <div className="stream-bubble">
                        <div id={`sb-${m.id}`} />
                        <div id={`dots-${m.id}`} style={{ display:"flex", gap:5, padding:"3px 0" }}>
                          <span className="dot"/><span className="dot"/><span className="dot"/>
                        </div>
                      </div>
                    ) : (
                      // ── DONE: static render via dangerouslySetInnerHTML ──
                      <div dangerouslySetInnerHTML={{ __html: md2html(m.content) }} />
                    )}
                  </div>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,.25)", paddingInline:3 }}>{m.ts}</span>
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>

          {/* Quick Actions — only on first load */}
          {msgs.length<=1 && !busy && (
            <div style={{ padding:"0 16px 12px" }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,.3)", marginBottom:8, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase" }}>Quick Start</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(135px,1fr))", gap:8 }}>
                {quick.map((s,i)=>(
                  <button key={i} onClick={()=>send(s.q)}
                    style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"12px 10px", background:"linear-gradient(135deg,rgba(255,255,255,.045),rgba(255,255,255,.015))", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, cursor:"pointer", transition:"all .22s ease", color:"#fff" }}
                    onMouseEnter={e=>{const b=e.currentTarget;b.style.borderColor="rgba(132,255,0,.45)";b.style.background="rgba(132,255,0,.08)";b.style.transform="translateY(-3px)";b.style.boxShadow="0 8px 24px rgba(132,255,0,.15)";}}
                    onMouseLeave={e=>{const b=e.currentTarget;b.style.borderColor="rgba(255,255,255,.08)";b.style.background="linear-gradient(135deg,rgba(255,255,255,.045),rgba(255,255,255,.015))";b.style.transform="translateY(0)";b.style.boxShadow="none";}}
                  >
                    <s.icon size={19} color="#84FF00"/>
                    <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.8)", letterSpacing:".02em" }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,.05)", background:"rgba(5,5,5,.88)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", padding:"11px 16px 13px" }}>
            <div style={{ display:"flex", gap:8, alignItems:"center", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:50, padding:"4px 4px 4px 16px", transition:"border-color .2s" }}
              onFocusCapture={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(132,255,0,.4)"}
              onBlurCapture ={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,.08)"}
            >
              <input
                type="text" placeholder="Ask me anything about fitness..."
                value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send(input)}
                disabled={busy}
                style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:14, color:"#fff", opacity:busy?.5:1 }}
              />
              <button onClick={()=>send(input)} disabled={busy||!input.trim()}
                style={{ width:36, height:36, borderRadius:"50%", border:"none", background:busy||!input.trim()?"rgba(132,255,0,.2)":"linear-gradient(135deg,#84FF00,#5cc200)", display:"flex", alignItems:"center", justifyContent:"center", cursor:busy||!input.trim()?"not-allowed":"pointer", flexShrink:0, transition:"all .2s", boxShadow:busy||!input.trim()?"none":"0 0 16px rgba(132,255,0,.45)" }}
              >
                <Send size={14} color="#000"/>
              </button>
            </div>
            <p style={{ fontSize:10, color:"rgba(255,255,255,.18)", textAlign:"center", marginTop:7, marginBottom:0, letterSpacing:".04em" }}>
              FitZone AI · Always consult a professional for medical advice
            </p>
          </div>
        </div>
      </div>
    </>
  );
}