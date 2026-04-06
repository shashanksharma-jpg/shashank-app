"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function SignIn() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async () => {
    setLoading(true); setError(false);
    const res = await fetch("/api/auth/verify", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ password }) });
    if (res.ok) { router.push("/"); router.refresh(); } else { setError(true); setLoading(false); }
  };
  return (
    <div style={{ minHeight:"100vh", background:"#08070f", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif", padding:"24px" }}>
      <div style={{ width:"100%", maxWidth:360, textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:48, height:48, borderRadius:12, marginBottom:20, background:"linear-gradient(135deg,#c8a45e,#9a6f30)" }}>
          <span style={{ fontSize:22, fontFamily:"monospace", fontWeight:"bold", color:"#07060e" }}>S</span>
        </div>
        <div style={{ fontSize:10, fontFamily:"monospace", color:"#42d692", letterSpacing:"0.3em", marginBottom:10 }}>SHASHANK.APP</div>
        <h1 style={{ margin:"0 0 8px", fontSize:24, fontWeight:"normal", color:"#f0ebe2" }}>Personal <span style={{ color:"#c8a45e", fontStyle:"italic" }}>Workspace</span></h1>
        <p style={{ margin:"0 0 28px", fontSize:13, color:"#4a4260" }}>Enter your password to continue.</p>
        {error && <div style={{ marginBottom:16, padding:"8px 12px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, fontSize:12, color:"#ef4444" }}>Incorrect password.</div>}
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
          style={{ width:"100%", boxSizing:"border-box", padding:"12px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid #1c1830", borderRadius:8, color:"#e2ddd6", fontSize:14, fontFamily:"Georgia,serif", outline:"none", marginBottom:10 }} />
        <button onClick={handleSubmit} disabled={loading||!password}
          style={{ width:"100%", padding:"12px", background:"rgba(200,164,94,0.15)", border:"1px solid rgba(200,164,94,0.4)", borderRadius:8, color:"#c8a45e", fontSize:13, fontFamily:"Georgia,serif", cursor:loading||!password?"not-allowed":"pointer", opacity:loading||!password?0.5:1 }}>
          {loading?"Checking…":"Enter →"}
        </button>
      </div>
    </div>
  );
}