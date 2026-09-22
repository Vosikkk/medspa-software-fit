export const vendors=[
{name:"Mangomint",membershipsCap:5,inventoryCap:4,marketingCap:4,integrationsCap:5,scaleFit:4,multiOps:4,highVolume:3,base:72,migrationSupport:4,humanSupport:4,contractFlex:5,cost:"$120/location + $10/user",strengths:["HIPAA-capable forms & charting with BAA","memberships, inventory & integrations","free onboarding/data transfer; cancel anytime"],clinical:3,multi:3,budget:2,crm:4,eprescribe:false,advancedClinical:false,charting:true,photos:true,injectableTracking:false,deepMedical:false},
{name:"AestheticsPro",membershipsCap:4,inventoryCap:5,marketingCap:3,integrationsCap:3,scaleFit:3,multiOps:3,highVolume:3,base:70,migrationSupport:2,humanSupport:2,contractFlex:2,cost:"$160 Pro-Plus; $285 Executive; $350 Enterprise",strengths:["med-spa EMR, photos & 500+ forms","e-prescribing and inventory","Executive/Enterprise support multi-location"],clinical:5,multi:4,budget:2,crm:3,eprescribe:true,advancedClinical:true,charting:true,photos:true,injectableTracking:false,deepMedical:true},
{name:"PatientNow",membershipsCap:4,inventoryCap:5,marketingCap:5,integrationsCap:5,scaleFit:4,multiOps:4,highVolume:4,base:68,migrationSupport:5,humanSupport:5,contractFlex:5,cost:"Custom quote",strengths:["aesthetic EMR, photos & inventory","memberships, marketing & practice management","free onboarding/migration; no long-term contract"],clinical:5,multi:4,budget:4,crm:5,eprescribe:true,advancedClinical:true,charting:true,photos:true,injectableTracking:false,deepMedical:true},
{name:"Phorest",membershipsCap:5,inventoryCap:5,marketingCap:5,integrationsCap:4,scaleFit:5,multiOps:5,highVolume:5,base:68,migrationSupport:5,humanSupport:5,contractFlex:2,cost:"Custom quote",strengths:["HIPAA charting, consent & before/after photos","marketing, memberships & inventory","centralized multi-location reporting"],clinical:3,multi:5,budget:3,crm:5,eprescribe:false,advancedClinical:false,charting:true,photos:true,injectableTracking:false,deepMedical:false},
{name:"Vagaro",membershipsCap:5,inventoryCap:4,marketingCap:3,integrationsCap:4,scaleFit:3,multiOps:4,highVolume:3,base:68,migrationSupport:2,humanSupport:2,contractFlex:3,cost:"US base from $23.99/mo + calendars/add-ons",strengths:["HIPAA EMR, SOAP notes & before/after photos","e-prescribing, memberships & inventory","multi-location management available"],clinical:4,multi:4,budget:1,crm:3,eprescribe:true,advancedClinical:true,charting:true,photos:true,injectableTracking:false,deepMedical:true},
{name:"Zenoti",membershipsCap:5,inventoryCap:5,marketingCap:5,integrationsCap:5,scaleFit:5,multiOps:5,highVolume:5,base:64,migrationSupport:4,humanSupport:3,contractFlex:2,cost:"Custom quote",strengths:["complex clinical workflows","multi-location management","advanced operations"],clinical:5,multi:5,budget:5,crm:5,eprescribe:true,advancedClinical:true,charting:true,photos:true,injectableTracking:true,deepMedical:true}];
export function hardFit(v,f){const misses=[];if(f.eprescribe&&!v.eprescribe)misses.push("e-prescribing");if(f.clinical==="advanced"&&!v.deepMedical)misses.push("advanced clinical workflow");if(f.injectableTracking&&!v.injectableTracking)misses.push("injectable / batch tracking");return {eligible:misses.length===0,misses}}
export function score(v,f){const gate=hardFit(v,f);let s=v.base;if(!gate.eligible)s-=35;
if(f.providers<=2)s+=(4-v.scaleFit)*3;
else if(f.providers<=5)s+=(v.scaleFit-3)*3;
else s+=(v.scaleFit-3)*6;
if(f.locations>=2)s+=(v.multiOps-2)*5;
if(f.locations>=3)s+=(v.multiOps-3)*5;
if(f.providers>=10&&f.locations>=3)s+=(v.scaleFit-3)*7;
if(f.clinical==="advanced")s+=(v.clinical-2)*6;else if(v.clinical>=5)s-=7;
if(f.budget==="low")s-=(v.budget-1)*6;if(f.budget==="high"&&v.budget>=4)s+=3;
if(f.memberships)s+=(v.membershipsCap-3)*2;
if(f.marketing)s+=(v.marketingCap-3)*3;if(f.inventory)s+=(v.inventoryCap-3)*2;
if(f.eprescribe&&v.eprescribe)s+=6;if(f.injectableTracking&&v.injectableTracking)s+=10;
if(f.photos&&v.photos)s+=4;
if(f.integrations)s+=(v.integrationsCap-3)*2;
if(f.appointments==="high")s+=(v.highVolume-3)*5;
if(f.switching)s+=(v.migrationSupport-2)*2;
if(f.switching&&f.migration==="important")s+=(v.migrationSupport-2)*3;
if(f.support==="important")s+=(v.humanSupport-2)*3;
if(f.flexibility==="important")s+=(v.contractFlex-2)*3;
return s}
export function fitLabel(score,margin=0,gate={eligible:true}){if(!gate.eligible)return "Does not meet a required need";if(score>=82&&margin>=5)return "Strong fit";if(score>=70)return "Good fit";return "Possible fit"}
export function rankVendors(f){const ranked=vendors.map(v=>({...v,score:score(v,f),gate:hardFit(v,f)})).sort((a,b)=>(b.gate.eligible-a.gate.eligible)||(b.score-a.score));return ranked.map((v,i)=>({...v,margin:i<ranked.length-1&&ranked[i+1].gate.eligible===v.gate.eligible?v.score-ranked[i+1].score:0}))}
