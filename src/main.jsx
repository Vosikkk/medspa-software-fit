import React,{useState}from"react";import{createRoot}from"react-dom/client";import"./style.css";
const vendors=[
{name:"Mangomint",base:72,cost:"From ~$120/location + users",strengths:["small-to-growing teams","memberships & inventory","HIPAA-oriented forms/charting"],clinical:2,multi:3,budget:2,crm:4},
{name:"AestheticsPro",base:70,cost:"Published plans from ~$160/mo",strengths:["aesthetics-specific workflows","photos & patient records","growing practices"],clinical:4,multi:3,budget:2,crm:3},
{name:"PatientNow",base:68,cost:"Custom quote",strengths:["medical-aesthetics workflows","patient engagement","clinical + business stack"],clinical:5,multi:4,budget:4,crm:5},
{name:"Phorest",base:68,cost:"Custom quote",strengths:["3+ staff","marketing & memberships","multi-location operations"],clinical:3,multi:4,budget:3,crm:5},
{name:"Vagaro",base:68,cost:"Lower-cost entry tier",strengths:["small practices","booking & memberships","simple operations"],clinical:1,multi:2,budget:1,crm:3},
{name:"Zenoti",base:64,cost:"Custom quote",strengths:["complex clinical workflows","multi-location management","advanced operations"],clinical:5,multi:5,budget:5,crm:5}];
function score(v,f){let s=v.base;
if(f.providers<=2){if(["Vagaro","Mangomint","AestheticsPro"].includes(v.name))s+=10;if(["Zenoti","PatientNow"].includes(v.name))s-=10}
else if(f.providers<=5){if(["Mangomint","AestheticsPro","Phorest","PatientNow"].includes(v.name))s+=7}
else{if(["Zenoti","PatientNow","Phorest"].includes(v.name))s+=12;if(v.name==="Vagaro")s-=10}
if(f.locations>=2)s+=(v.multi-2)*6;if(f.locations>=3&&v.multi>=4)s+=5;
if(f.clinical==="advanced")s+=(v.clinical-2)*6;else if(v.clinical>=5)s-=7;
if(f.budget==="low")s-=(v.budget-1)*6;if(f.budget==="high"&&v.budget>=4)s+=3;
if(f.memberships&&["Mangomint","Phorest","Vagaro","Zenoti"].includes(v.name))s+=4;
if(f.marketing)s+=(v.crm-3)*3;if(f.inventory&&["Mangomint","AestheticsPro","Zenoti","Phorest"].includes(v.name))s+=3;
return Math.max(30,Math.min(97,s))}
function bestFor(r,f){const map={
Vagaro:f.providers<=2?"a simple, lower-cost start":"teams prioritizing straightforward booking and operations",
Mangomint:f.providers<=2?"a small practice that wants room to grow":"growing teams that care about polished day-to-day operations",
AestheticsPro:f.clinical==="advanced"?"aesthetics-specific clinical workflows":"practices wanting more med-spa-specific workflows",
PatientNow:"medical aesthetics practices combining clinical and business workflows",
Phorest:f.locations>=2?"growing or multi-location practices with strong marketing needs":"established teams focused on retention and marketing",
Zenoti:f.locations>=2?"complex multi-location operations":"larger practices with advanced operational and clinical needs"};return map[r.name]}
function tradeoff(r,f){const map={
Vagaro:f.clinical==="advanced"?"may be too lightweight for advanced clinical workflows":"may feel limiting as operational complexity grows",
Mangomint:f.clinical==="advanced"?"not the strongest match when deep medical workflows drive the decision":"cost can rise with users and locations; verify the full quote",
AestheticsPro:f.budget==="low"?"can stretch a sub-$200 budget depending on the plan you need":"verify user/provider limits and the exact plan needed",
PatientNow:f.providers<=2?"may be more platform than a small, simple practice needs":"custom pricing makes total cost harder to compare upfront",
Phorest:f.providers<=2?"may be more than a solo or very small practice needs":"verify whether its clinical depth matches your exact treatments",
Zenoti:f.providers<=2?"likely overkill for a simple single-provider setup":"enterprise-style complexity and custom pricing deserve a careful demo"};return map[r.name]}
function reason(r,f){const a=[];if(f.providers<=2&&["Vagaro","Mangomint","AestheticsPro"].includes(r.name))a.push("fits a small team without forcing enterprise complexity");if(f.providers>=6&&["Zenoti","PatientNow","Phorest"].includes(r.name))a.push("better aligned with a larger operating team");if(f.locations>=2&&r.multi>=4)a.push("stronger multi-location fit");if(f.clinical==="advanced"&&r.clinical>=4)a.push("supports a more clinical workflow");if(f.budget==="low"&&r.budget<=2)a.push("closer to your stated budget");if(f.marketing&&r.crm>=4)a.push("stronger CRM/marketing fit");return a.slice(0,3)}
function App(){const[f,setF]=useState({providers:3,locations:1,clinical:"basic",memberships:true,marketing:false,inventory:false,budget:"mid"});const[done,setDone]=useState(false);const results=vendors.map(v=>({...v,score:score(v,f),reasons:reason(v,f)})).sort((a,b)=>b.score-a.score).slice(0,3);
return <main><header><span className="eyebrow">INDEPENDENT SOFTWARE FIT CHECK</span><h1>Which med spa software actually fits your practice?</h1><p>Tell us how your practice operates. We’ll narrow six common platforms to the three worth investigating first.</p></header>
<section className="card"><div className="grid"><label>Providers<input type="number" min="1" max="50" value={f.providers} onChange={e=>setF({...f,providers:Math.max(1,+e.target.value)})}/></label><label>Locations<input type="number" min="1" max="20" value={f.locations} onChange={e=>setF({...f,locations:Math.max(1,+e.target.value)})}/></label><label>Clinical workflow<select value={f.clinical} onChange={e=>setF({...f,clinical:e.target.value})}><option value="basic">Booking + basic aesthetics</option><option value="advanced">Injectables / advanced medical</option></select></label><label>Monthly software budget<select value={f.budget} onChange={e=>setF({...f,budget:e.target.value})}><option value="low">Under $200</option><option value="mid">$200–$500</option><option value="high">$500+</option></select></label>
<label className="check"><input type="checkbox" checked={f.memberships} onChange={e=>setF({...f,memberships:e.target.checked})}/> Memberships / packages</label><label className="check"><input type="checkbox" checked={f.marketing} onChange={e=>setF({...f,marketing:e.target.checked})}/> CRM / marketing automation matters</label><label className="check"><input type="checkbox" checked={f.inventory} onChange={e=>setF({...f,inventory:e.target.checked})}/> Inventory tracking matters</label></div><button type="button" onClick={()=>{setDone(true);setTimeout(()=>document.getElementById("results")?.scrollIntoView({behavior:"smooth",block:"start"}),50)}}>Find my best fit →</button></section>
{done&&<section id="results"><h2>Your best-fit shortlist</h2><p className="muted">Profile: {f.providers} providers · {f.locations} location{f.locations>1?"s":""} · {f.clinical==="advanced"?"advanced clinical":"basic aesthetic"} workflow.</p><div className="results">{results.map((r,i)=><article className="result" key={r.name}><small>#{i+1} MATCH</small><h3>{r.name}</h3><strong>{r.score}% fit</strong><p>{r.cost}</p><div className="decision"><b>Best if</b><p>{bestFor(r,f)}.</p><b>Watch out</b><p>{tradeoff(r,f)}.</p></div>{r.reasons.length>0&&<><b>Why it matched</b><ul>{r.reasons.map(x=><li key={x}>{x}</li>)}</ul></>}<b>Worth verifying</b><ul>{r.strengths.map(x=><li key={x}>{x}</li>)}</ul><p className="explain">Pricing, contracts and feature availability can change. Verify the exact workflow and total cost in a vendor demo.</p></article>)}</div></section>}
<section className="note"><b>What the score means</b><p>This is a transparent decision-support score based on practice size, locations, clinical complexity, budget and selected workflows. It is not a clinical recommendation or vendor endorsement.</p></section></main>}
createRoot(document.getElementById("root")).render(<App/>);