"use client";
import { useEffect, useState } from "react";

const APPS = [
  {
    id: "marathon",
    href: "https://marathon.shashank.app",
    emoji: "🏅",
    label: "Marathon",
    sub: "TCS London · 26 Apr",
    desc: "Race schedule, nutrition plan, handbook & packing.",
    color: "#c8a45e",
    bg: "rgba(200,164,94,0.10)",
    border: "rgba(200,164,94,0.28)",
  },
  {
    id: "finance",
    href: "https://finance.shashank.app",
    emoji: "📊",
    label: "Finance",
    sub: "Wealth tracker",
    desc: "Portfolio, net worth, savings & goals at a glance.",
    color: "#5eb8c8",
    bg: "rgba(94,184,200,0.10)",
    border: "rgba(94,184,200,0.28)",
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Still up,";
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [pressed, setPressed] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const raceDate = new Date("2026-04-26T10:00:00+01:00");
  const daysToRace = Math.ceil((raceDate - new Date()) / 86400000);
  const showRaceBadge = daysToRace > 0 && daysToRace < 60;

  const today = mounted
    ? new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    : "";

  return (
    <div style={{ minHeight:"100vh", background:"#080710", color:"#e2ddd6", fontFamily:"Georgia,'Times New Roman',serif", position:"relative", overflowX:"hidden" }}>

      {/* Ambient glow */}
      <div style={{ position:"fixed", top:-200, left:-200, width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(60,40,120,0.15) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }} />

      <div style={{ position:"relative", zIndex:1, maxWidth:480, margin:"0 auto", padding:"0 24px 60px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:20 }}>
          <span style={{ fontSize:10, fontFamily:"monospace", color:"#2e2850", letterSpacing:"0.22em" }}>SHASHANK.APP</span>
          <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#c8a45e,#8a5f20)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:"bold", color:"#07060e", flexShrink:0 }}>S</div>
        </div>

        {/* Greeting */}
        <div style={{ marginTop:48 }}>
          <p style={{ margin:0, fontSize:13, color:"#3e3468", fontFamily:"monospace", letterSpacing:"0.05em" }}>
            {mounted ? getGreeting() : ""}
          </p>
          <h1 style={{ margin:"6px 0 0", fontSize:36, fontWeight:"normal", color:"#f0ebe2", lineHeight:1.15, letterSpacing:"-0.01em" }}>
            Shashank
          </h1>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"#3e3468" }}>{today}</span>
            {showRaceBadge && (
              <span style={{ fontSize:10, fontFamily:"monospace", background:"rgba(200,164,94,0.12)", color:"#c8a45e", padding:"3px 10px", borderRadius:20, border:"1px solid rgba(200,164,94,0.3)", letterSpacing:"0.08em" }}>
                {daysToRace}d to race
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:"0.5px", background:"linear-gradient(90deg,transparent,#1e1840,transparent)", margin:"40px 0 36px" }} />

        {/* App cards */}
        <p style={{ margin:"0 0 20px", fontSize:10, fontFamily:"monospace", color:"#2e2850", letterSpacing:"0.22em" }}>YOUR APPS</p>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {APPS.map(app => {
            const isH = hovered === app.id;
            const isP = pressed === app.id;
            return (
              <a
                key={app.id}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration:"none" }}
                onMouseEnter={() => setHovered(app.id)}
                onMouseLeave={() => { setHovered(null); setPressed(null); }}
                onPointerDown={() => setPressed(app.id)}
                onPointerUp={() => setPressed(null)}
              >
                <div style={{
                  background: isH ? app.bg : "rgba(255,255,255,0.025)",
                  border: `1px solid ${isH ? app.border : "rgba(255,255,255,0.06)"}`,
                  borderRadius:18, padding:"20px 22px", cursor:"pointer",
                  transform: isP ? "scale(0.975)" : isH ? "translateY(-2px)" : "none",
                  transition:"all 0.18s ease",
                  display:"flex", alignItems:"center", gap:18,
                }}>
                  <div style={{ width:56, height:56, borderRadius:16, flexShrink:0, background:app.bg, border:`1px solid ${app.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>
                    {app.emoji}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                      <span style={{ fontSize:16, color:"#f0ebe2" }}>{app.label}</span>
                      <span style={{ fontSize:11, color:"#3e3468", fontFamily:"monospace" }}>{app.sub}</span>
                    </div>
                    <p style={{ margin:"4px 0 0", fontSize:12, color:"#4a4268", lineHeight:1.5 }}>{app.desc}</p>
                  </div>
                  <div style={{ fontSize:18, color: isH ? app.color : "#2a2448", transition:"all 0.18s ease", transform: isH ? "translateX(2px)" : "none", flexShrink:0 }}>›</div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Quick grid */}
        <div style={{ marginTop:44 }}>
          <p style={{ margin:"0 0 16px", fontSize:10, fontFamily:"monospace", color:"#2e2850", letterSpacing:"0.22em" }}>QUICK LAUNCH</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {APPS.map(app => {
              const qid = "q_"+app.id;
              return (
                <a key={app.id} href={app.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                  <div
                    onMouseEnter={() => setHovered(qid)}
                    onMouseLeave={() => setHovered(null)}
                    onPointerDown={() => setPressed(qid)}
                    onPointerUp={() => setPressed(null)}
                    style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}
                  >
                    <div style={{
                      width:"100%", aspectRatio:"1", borderRadius:20,
                      background: hovered===qid ? app.bg : "rgba(255,255,255,0.03)",
                      border:`1px solid ${hovered===qid ? app.border : "rgba(255,255,255,0.06)"}`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
                      transform: pressed===qid ? "scale(0.88)" : "scale(1)",
                      transition:"all 0.12s ease",
                    }}>
                      {app.emoji}
                    </div>
                    <span style={{ fontSize:11, color:"#4a4268", textAlign:"center" }}>{app.label}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop:64, textAlign:"center" }}>
          <div style={{ fontSize:9, fontFamily:"monospace", color:"#1a1530", letterSpacing:"0.22em" }}>BUILT WITH CLAUDE · {new Date().getFullYear()}</div>
        </div>

      </div>
    </div>
  );
}
