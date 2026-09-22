import{describe,it,expect}from"vitest";
import{rankVendors,hardFit,vendors}from"./main.jsx";

const base={providers:3,locations:1,clinical:"basic",appointments:"mid",memberships:true,marketing:false,inventory:false,eprescribe:false,injectableTracking:false,photos:false,integrations:false,switching:false,migration:"normal",support:"normal",flexibility:"normal",budget:"mid"};
const names=f=>rankVendors({...base,...f}).slice(0,3).map(x=>x.name);

describe("recommendation regression cases",()=>{
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
   expect(ranked[0].name).toBe("Zenoti");
   expect(ranked[0].gate.eligible).toBe(true);
   for(const v of ranked.filter(v=>v.name!=="Zenoti"))expect(v.gate.eligible).toBe(false);
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
 it("ranking is deterministic",()=>{
   const f={...base,providers:4,clinical:"advanced",switching:true};
   expect(rankVendors(f).map(x=>x.name)).toEqual(rankVendors(f).map(x=>x.name));
 });
});
