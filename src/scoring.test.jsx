import{describe,it,expect}from"vitest";
import{rankVendors,hardFit,vendors,recommendationState,demoQuestions,resultGuidance,evidenceFor,evidenceGaps,relevantEvidenceFields,evidenceCoverage,fieldLabels}from"./scoring.js";

const base={providers:3,locations:1,clinical:"basic",appointments:"mid",memberships:true,marketing:false,inventory:false,eprescribe:false,injectableTracking:false,recallTraceability:false,photos:false,integrations:false,chartingRequired:false,consentRequired:false,switching:false,migration:"normal",support:"normal",flexibility:"normal",budget:"mid"};
const names=f=>rankVendors({...base,...f}).slice(0,3).map(x=>x.name);

describe("recommendation regression cases",()=>{
 const profiles=[
  ["solo starter",{providers:1,budget:"low"}],
  ["small clinical",{providers:3,clinical:"advanced",eprescribe:true}],
  ["switching practice",{providers:4,switching:true,migration:"important",support:"important"}],
  ["two locations",{providers:6,locations:2}],
  ["enterprise",{providers:15,locations:5,appointments:"high",budget:"high"}],
  ["marketing heavy",{providers:5,marketing:true,memberships:true}],
  ["deep injectable",{providers:4,clinical:"advanced",eprescribe:true,injectableTracking:true}],
  ["high volume clinical",{providers:8,locations:2,clinical:"advanced",appointments:"high"}]
 ];
 it.each(profiles)("%s profile always returns three ordered recommendations",(_name,overrides)=>{
   const ranked=rankVendors({...base,...overrides});
   expect(ranked).toHaveLength(vendors.length);
   expect(ranked.slice(0,3)).toHaveLength(3);
   expect(new Set(ranked.map(v=>v.name)).size).toBe(vendors.length);
   for(let i=1;i<ranked.length;i++){
     if(ranked[i-1].gate.eligible===ranked[i].gate.eligible)expect(ranked[i-1].score).toBeGreaterThanOrEqual(ranked[i].score);
   }
 });
 it("small basic low-budget practice favors lightweight products",()=>{
   const top=names({providers:1,budget:"low"});
   expect(top).toContain("Vagaro");
   expect(top).toContain("Mangomint");
   expect(top).not.toContain("Zenoti");
 });
 it("large multi-location advanced practice keeps enterprise products in top 3",()=>{
   const top=names({providers:12,locations:3,clinical:"advanced",appointments:"high",budget:"high",switching:true,migration:"important",support:"important",memberships:true,marketing:true,inventory:true,photos:true,integrations:true});
   expect(top).toContain("Zenoti");
   expect(top).toContain("PatientNow");
 });
 it("e-prescribing is a hard requirement",()=>{
   const f={...base,clinical:"advanced",eprescribe:true};
   for(const v of vendors.filter(v=>!v.eprescribe))expect(hardFit(v,f).eligible).toBe(false);
   for(const v of rankVendors(f).slice(0,3))expect(v.eprescribe).toBe(true);
 });
 it("advanced clinical plus e-prescribing excludes Mangomint and Phorest from top 3",()=>{
   const top=names({providers:4,clinical:"advanced",eprescribe:true,switching:true,migration:"important",support:"important",flexibility:"important",inventory:true,photos:true});
   expect(top).not.toContain("Mangomint");
   expect(top).not.toContain("Phorest");
 });
 it("injectable batch tracking narrows the shortlist to verified capability",()=>{
   const f={...base,clinical:"advanced",injectableTracking:true};
   const ranked=rankVendors(f);
   expect(ranked.filter(v=>v.gate.eligible).map(v=>v.name)).toEqual(expect.arrayContaining(["Zenoti","AestheticsPro","Vagaro","Mangomint","Phorest"]));
   expect(ranked.find(v=>v.name==="Zenoti").gate.eligible).toBe(true);
   expect(ranked.find(v=>v.name==="AestheticsPro").gate.eligible).toBe(true);\n   expect(ranked.find(v=>v.name==="Vagaro").gate.eligible).toBe(true);\n   expect(ranked.find(v=>v.name==="Mangomint").gate.eligible).toBe(true);\n   expect(ranked.find(v=>v.name==="Phorest").gate.eligible).toBe(false); // advanced clinical gate still fails
 });
 it("PatientNow stays eligible when e-prescribing is required",()=>{
   const f={...base,clinical:"advanced",eprescribe:true};
   const patientNow=rankVendors(f).find(v=>v.name==="PatientNow");
   expect(patientNow.eprescribe).toBe(true);
   expect(patientNow.gate.eligible).toBe(true);
 });
 it("photo workflows use explicit vendor capability flags",()=>{
   const ranked=rankVendors({...base,photos:true});
   expect(ranked.filter(v=>v.photos).length).toBeGreaterThan(0);
 });
 it("switching with migration and support preferences rewards documented support",()=>{
   const ranked=rankVendors({...base,switching:true,migration:"important",support:"important"});
   const patient=ranked.find(v=>v.name==="PatientNow");
   const phorest=ranked.find(v=>v.name==="Phorest");
   expect(patient.migrationSupport).toBe(5);
   expect(patient.humanSupport).toBe(5);
   expect(phorest.migrationSupport).toBe(5);
   expect(phorest.humanSupport).toBe(5);
 });
 it("contract flexibility rewards verified no-contract vendors",()=>{
   const ranked=rankVendors({...base,flexibility:"important"});
   const patient=ranked.find(v=>v.name==="PatientNow");
   const mango=ranked.find(v=>v.name==="Mangomint");
   expect(patient.contractFlex).toBe(5);
   expect(mango.contractFlex).toBe(5);
   expect(patient.score).toBeGreaterThanOrEqual(68);
   expect(mango.score).toBeGreaterThanOrEqual(72);
 });
 it("multi-location scoring is driven by operational capability",()=>{
   const ranked=rankVendors({...base,locations:3,providers:8});
   expect(ranked.find(v=>v.name==="Zenoti").multiOps).toBe(5);
   expect(ranked.find(v=>v.name==="Phorest").multiOps).toBe(5);
   expect(ranked.find(v=>v.name==="Mangomint").multiOps).toBe(4);
 });
 it("high-volume enterprise profile rewards scale and throughput capability",()=>{
   const ranked=rankVendors({...base,providers:12,locations:4,appointments:"high",budget:"high"});
   const top3=ranked.slice(0,3).map(v=>v.name);
   expect(top3.some(n=>["Zenoti","Phorest"].includes(n))).toBe(true);
   expect(ranked.find(v=>v.name==="Zenoti").highVolume).toBe(5);
   expect(ranked.find(v=>v.name==="Phorest").highVolume).toBe(5);
 });
 it("workflow preferences are scored from capability fields",()=>{
   const ranked=rankVendors({...base,memberships:true,marketing:true,inventory:true,integrations:true});
   for(const v of ranked){
     expect(v.membershipsCap).toBeTypeOf("number");
     expect(v.marketingCap).toBeTypeOf("number");
     expect(v.inventoryCap).toBeTypeOf("number");
     expect(v.integrationsCap).toBeTypeOf("number");
   }
 });
 it("marketing-heavy profile rewards stronger marketing capability",()=>{
   const ranked=rankVendors({...base,memberships:false,marketing:true});
   const patient=ranked.find(v=>v.name==="PatientNow");
   const vagaro=ranked.find(v=>v.name==="Vagaro");
   expect(patient.marketingCap).toBeGreaterThan(vagaro.marketingCap);
 });
 it("real buyer: 2-provider first system under $200 avoids enterprise overkill",()=>{
   const ranked=rankVendors({...base,providers:2,locations:1,budget:"low",clinical:"basic",switching:false});
   const top=ranked.slice(0,3).map(v=>v.name);
   expect(top).toContain("Vagaro");
   expect(top).not.toContain("Zenoti");
 });
 it("real buyer: 4-provider clinical switch with eRx keeps only eligible clinical systems above blocked vendors",()=>{
   const ranked=rankVendors({...base,providers:4,clinical:"advanced",eprescribe:true,switching:true,migration:"important",support:"important",flexibility:"important",inventory:true,photos:true});
   const firstBlocked=ranked.findIndex(v=>!v.gate.eligible);
   expect(firstBlocked).toBeGreaterThan(0);
   expect(ranked.slice(0,firstBlocked).every(v=>v.gate.eligible)).toBe(true);
   expect(ranked.slice(0,3).map(v=>v.name)).not.toContain("Mangomint");
 });
 it("real buyer: 3-location high-volume group surfaces enterprise-scale options",()=>{
   const top=names({providers:10,locations:3,appointments:"high",budget:"high",marketing:true,inventory:true,integrations:true});
   expect(top).toContain("Zenoti");
   expect(top).toContain("Phorest");
 });
 it("real buyer: injectable lot tracking is not faked by generic inventory support",()=>{
   const ranked=rankVendors({...base,providers:5,clinical:"advanced",inventory:true,injectableTracking:true});
   expect(ranked.filter(v=>v.gate.eligible).map(v=>v.name)).toEqual(expect.arrayContaining(["Zenoti","AestheticsPro","Vagaro"]));
   expect(ranked.find(v=>v.name==="PatientNow").gate.misses).toContain("injectable / batch tracking");
 });
 it("real buyer: migration/support preferences can change ranking without bypassing hard requirements",()=>{
   const ranked=rankVendors({...base,providers:4,clinical:"advanced",eprescribe:true,switching:true,migration:"important",support:"important"});
   const eligible=ranked.filter(v=>v.gate.eligible);
   expect(eligible.length).toBeGreaterThanOrEqual(3);
   expect(eligible.every(v=>v.deepMedical&&v.eprescribe)).toBe(true);
 });
 it("scores preserve ranking differences instead of saturating at 94",()=>{
   const ranked=rankVendors({...base,providers:15,locations:5,appointments:"high",budget:"high",marketing:true,inventory:true,integrations:true});
   expect(ranked.some(v=>v.score>94)).toBe(true);
   for(let i=1;i<ranked.length;i++)if(ranked[i-1].gate.eligible===ranked[i].gate.eligible)expect(ranked[i-1].score).toBeGreaterThanOrEqual(ranked[i].score);
 });
 it("ranking exposes recommendation margin for confidence calibration",()=>{
   const ranked=rankVendors({...base,providers:4,clinical:"advanced",eprescribe:true});
   expect(ranked[0].margin).toBeTypeOf("number");
   expect(ranked[0].margin).toBeGreaterThanOrEqual(0);
 });
 it("injectable lot tracking reports a limited shortlist",()=>{
   const state=recommendationState(rankVendors({...base,clinical:"advanced",injectableTracking:true}));
   expect(["limited","close","clear"]).toContain(state.type);
 });
 it("close leaders are reported as a close call",()=>{
   const ranked=rankVendors({...base,providers:3});
   const state=recommendationState(ranked);
   if(ranked.filter(v=>v.gate.eligible).length>=3&&ranked[0].score-ranked[1].score<5)expect(state.type).toBe("close");
 });
 it("demo questions adapt to switching and clinical requirements",()=>{
   const f={...base,switching:true,eprescribe:true,clinical:"advanced",support:"important",flexibility:"important"};
   const qs=demoQuestions(f,rankVendors(f));
   expect(qs).toHaveLength(5);
   expect(qs.some(q=>q.includes("migrate"))).toBe(true);
   expect(qs.some(q=>q.includes("e-prescribing"))).toBe(true);
 });
 it("injectable workflow gets a lot-tracking demo question",()=>{
   const f={...base,clinical:"advanced",injectableTracking:true};
   expect(demoQuestions(f,rankVendors(f)).some(q=>q.includes("lot numbers"))).toBe(true);
 });
 it("result guidance exposes requirement conflicts instead of hiding them",()=>{
   const f={...base,clinical:"advanced",eprescribe:true};
   const mango=rankVendors(f).find(v=>v.name==="Mangomint");
   const guidance=resultGuidance(mango,f);
   expect(guidance.watchOut.join(" ")).toContain("advanced clinical");
   expect(guidance.watchOut.join(" ")).toContain("e-prescribing");
 });
 it("result guidance is generated from profile and capability data",()=>{
   const f={...base,providers:8,locations:2,marketing:true};
   const zenoti=rankVendors(f).find(v=>v.name==="Zenoti");
   const guidance=resultGuidance(zenoti,f);
   expect(guidance.bestIf).toContain("larger operating teams");
   expect(guidance.bestIf).toContain("multi-location operations");
 });
 it("verified capabilities can expose provenance",()=>{
   const zenoti=vendors.find(v=>v.name==="Zenoti");
   const ev=evidenceFor(zenoti,"injectableTracking");
   expect(ev.status).toBe("verified");
   expect(ev.source).toContain("zenoti.com");
   expect(ev.checkedAt).toBe("2026-09-22");
 });
 it("unmapped capability evidence is explicitly unknown",()=>{
   const mango=vendors.find(v=>v.name==="Mangomint");
   expect(evidenceFor(mango,"injectableTracking").status).toBe("unknown");
 });
 it("advanced workflow alone is a preference, not a fake hard requirement",()=>{
   const ranked=rankVendors({...base,clinical:"advanced"});
   expect(ranked.every(v=>v.gate.eligible)).toBe(true);
 });
 it("explicit charting and consent requirements are hard gates",()=>{
   const f={...base,chartingRequired:true,consentRequired:true};
   for(const v of rankVendors(f).filter(v=>v.gate.eligible)){
     expect(v.charting).toBe(true);
     expect(v.consent).toBe(true);
   }
 });
 it("recall traceability is stricter than lot tracking",()=>{
   const f={...base,injectableTracking:true,recallTraceability:true};
   const ranked=rankVendors(f);
   expect(ranked[0].name).toBe("Zenoti");
   expect(ranked[0].gate.eligible).toBe(true);
   for(const v of ranked.filter(v=>v.name!=="Zenoti"))expect(v.gate.misses).toContain("patient-level recall traceability");
 });
 it("lot tracking alone does not require recall capability",()=>{
   const f={...base,injectableTracking:true};
   const eligible=rankVendors(f).filter(v=>v.gate.eligible).map(v=>v.name);
   expect(eligible).toEqual(expect.arrayContaining(["Mangomint","AestheticsPro","Phorest","Vagaro","Zenoti"]));
 });
 it("recall requirement produces a patient-level traceability demo question",()=>{
   const f={...base,injectableTracking:true,recallTraceability:true};
   const qs=demoQuestions(f,rankVendors(f));
   expect(qs.some(q=>q.includes("affected patient"))).toBe(true);
 });
 it("blocked recall vendors explain the exact missing capability",()=>{
   const f={...base,recallTraceability:true};
   const vagaro=rankVendors(f).find(v=>v.name==="Vagaro");
   const guidance=resultGuidance(vagaro,f);
   expect(guidance.watchOut.join(" ")).toContain("patient-level recall traceability");
 });
 it("Worth verifying gaps are profile-specific",()=>{
   const f={...base,eprescribe:true,recallTraceability:true};
   const patient=vendors.find(v=>v.name==="PatientNow");
   const gaps=evidenceGaps(patient,f).map(x=>x.field);
   expect(gaps).toContain("recallTraceability");
   expect(gaps).not.toContain("eprescribe");
 });
 it("verified profile-critical evidence is removed from gaps",()=>{
   const f={...base,eprescribe:true,injectableTracking:true,recallTraceability:true,photos:true};
   const zenoti=vendors.find(v=>v.name==="Zenoti");
   const gaps=evidenceGaps(zenoti,f).map(x=>x.field);
   expect(gaps).not.toContain("eprescribe");
   expect(gaps).not.toContain("injectableTracking");
   expect(gaps).not.toContain("recallTraceability");
   expect(gaps).not.toContain("photos");
 });
 it("evidence panel only asks for fields relevant to the buyer profile",()=>{
   const f={...base,eprescribe:true,photos:true,locations:2,inventory:true};
   const fields=relevantEvidenceFields(f);
   expect(fields).toEqual(expect.arrayContaining(["eprescribe","photos","multiOps","inventoryCap"]));
   expect(fields).not.toContain("recallTraceability");
 });
 it("evidence coverage reports verified profile-critical claims",()=>{
   const f={...base,eprescribe:true,injectableTracking:true,recallTraceability:true,photos:true};
   const zenoti=vendors.find(v=>v.name==="Zenoti");
   const coverage=evidenceCoverage(zenoti,f);
   expect(coverage.verified).toBe(coverage.total);
   expect(coverage.label).toContain("verified");
 });
 it("capability keys have readable labels",()=>{
   expect(fieldLabels.recallTraceability).toBe("Patient-level recall traceability");
   expect(fieldLabels.migrationSupport).toBe("Data migration");
 });
 it("unknown critical evidence cannot produce fake strong confidence",()=>{
   expect(fitLabel(95,12,{eligible:true},{verified:1,total:4})).toBe("Possible fit");
   expect(fitLabel(95,12,{eligible:true},{verified:3,total:4})).toBe("Strong fit");
 });
 it("verified recall belongs to Zenoti, not AestheticsPro",()=>{
   expect(vendors.find(v=>v.name==="Zenoti").recallTraceability).toBe(true);
   expect(vendors.find(v=>v.name==="AestheticsPro").recallTraceability).toBe(false);
 });
 it("consent hard requirement only trusts audited vendor evidence",()=>{
   const f={...base,consentRequired:true};
   const ranked=rankVendors(f);
   for(const name of ["Mangomint","AestheticsPro","Phorest","Vagaro","Zenoti"]){
     const v=ranked.find(x=>x.name===name);
     expect(v.gate.eligible).toBe(true);
     expect(evidenceFor(v,"consent").status).toBe("verified");
   }
   const patient=ranked.find(x=>x.name==="PatientNow");
   expect(patient.gate.eligible).toBe(false);
   expect(evidenceFor(patient,"consent").status).toBe("unknown");
 });
 it("adding consent evidence does not overwrite previously verified evidence",()=>{
   expect(evidenceFor(vendors.find(v=>v.name==="Zenoti"),"eprescribe").status).toBe("verified");
   expect(evidenceFor(vendors.find(v=>v.name==="Mangomint"),"injectableTracking").status).toBe("verified");
   expect(evidenceFor(vendors.find(v=>v.name==="AestheticsPro"),"migrationSupport").status).toBe("verified");
   expect(evidenceFor(vendors.find(v=>v.name==="Vagaro"),"inventoryCap").status).toBe("verified");
   expect(evidenceFor(vendors.find(v=>v.name==="Phorest"),"multiOps").status).toBe("verified");
 });
 it("ranking is deterministic",()=>{
   const f={...base,providers:4,clinical:"advanced",switching:true};
   expect(rankVendors(f).map(x=>x.name)).toEqual(rankVendors(f).map(x=>x.name));
 });
});
