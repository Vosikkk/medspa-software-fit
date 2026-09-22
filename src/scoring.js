export const vendors=[
{name:"Mangomint",membershipsCap:5,inventoryCap:4,marketingCap:4,integrationsCap:5,scaleFit:4,multiOps:4,highVolume:3,base:72,migrationSupport:4,humanSupport:4,contractFlex:5,cost:"$120/location + $10/user",strengths:["HIPAA-capable forms & charting with BAA","memberships, inventory & integrations","free onboarding/data transfer; cancel anytime"],clinical:3,multi:3,budget:2,crm:4,eprescribe:false,advancedClinical:false,charting:true,photos:true,injectableTracking:false,deepMedical:false},
{name:"AestheticsPro",membershipsCap:4,inventoryCap:5,marketingCap:3,integrationsCap:3,scaleFit:3,multiOps:3,highVolume:3,base:70,migrationSupport:2,humanSupport:2,contractFlex:2,cost:"$160 Pro-Plus; $285 Executive; $350 Enterprise",strengths:["med-spa EMR, photos & 500+ forms","e-prescribing and inventory","Executive/Enterprise support multi-location"],clinical:5,multi:4,budget:2,crm:3,eprescribe:true,advancedClinical:true,charting:true,photos:true,injectableTracking:true,deepMedical:true},
{name:"PatientNow",membershipsCap:4,inventoryCap:5,marketingCap:5,integrationsCap:5,scaleFit:4,multiOps:4,highVolume:4,base:68,migrationSupport:5,humanSupport:5,contractFlex:5,cost:"Custom quote",strengths:["aesthetic EMR, photos & inventory","memberships, marketing & practice management","free onboarding/migration; no long-term contract"],clinical:5,multi:4,budget:4,crm:5,eprescribe:true,advancedClinical:true,charting:true,photos:true,injectableTracking:false,deepMedical:true},
{name:"Phorest",membershipsCap:5,inventoryCap:5,marketingCap:5,integrationsCap:4,scaleFit:5,multiOps:5,highVolume:5,base:68,migrationSupport:5,humanSupport:5,contractFlex:2,cost:"Custom quote",strengths:["HIPAA charting, consent & before/after photos","marketing, memberships & inventory","centralized multi-location reporting"],clinical:3,multi:5,budget:3,crm:5,eprescribe:false,advancedClinical:false,charting:true,photos:true,injectableTracking:false,deepMedical:false},
{name:"Vagaro",membershipsCap:5,inventoryCap:4,marketingCap:3,integrationsCap:4,scaleFit:3,multiOps:4,highVolume:3,base:68,migrationSupport:2,humanSupport:2,contractFlex:3,cost:"US base from $23.99/mo + calendars/add-ons",strengths:["HIPAA EMR, SOAP notes & before/after photos","e-prescribing, memberships & inventory","multi-location management available"],clinical:4,multi:4,budget:1,crm:3,eprescribe:true,advancedClinical:true,charting:true,photos:true,injectableTracking:true,deepMedical:true},
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
export function recommendationState(ranked){const eligible=ranked.filter(v=>v.gate.eligible);if(!eligible.length)return {type:"none",message:"No vendor in the current dataset meets every required need."};if(eligible.length<3)return {type:"limited",message:`Only ${eligible.length} vendor${eligible.length===1?"":"s"} in the current dataset meet every required need.`};const gap=eligible[0].score-eligible[1].score;if(gap<5)return {type:"close",message:"The leading options are close. Compare trade-offs rather than treating #1 as a clear winner."};return {type:"clear",message:"The first option separates from the rest on the preferences you selected."}}
export function rankVendors(f){const ranked=vendors.map(v=>({...v,score:score(v,f),gate:hardFit(v,f)})).sort((a,b)=>(b.gate.eligible-a.gate.eligible)||(b.score-a.score));return ranked.map((v,i)=>({...v,margin:i<ranked.length-1&&ranked[i+1].gate.eligible===v.gate.eligible?v.score-ranked[i+1].score:0}))}

export function demoQuestions(f,ranked){
 const top=ranked.filter(v=>v.gate.eligible).slice(0,3),q=[];
 if(f.switching)q.push("Exactly what data will you migrate for us—client profiles, notes, forms, photos, packages, memberships, gift cards and payment details—and what will not transfer?");
 if(f.eprescribe)q.push("Show the e-prescribing workflow live. Which states, prescribers, controlled substances and pharmacy-network limitations apply?");
 if(f.injectableTracking)q.push("Show how you record injectable lot numbers, expiration dates and treatment details, and how a recall is traced back to affected clients.");
 if(f.locations>=2)q.push("Show how staff, inventory, memberships, client records and reporting work across all locations without duplicate setup.");
 if(f.marketing)q.push("Which CRM and marketing automations are included in our quoted plan, and which require paid add-ons or external integrations?");
 if(f.integrations)q.push("Which of our required integrations are native, which use an API or middleware, and what extra fees apply?");
 if(f.memberships)q.push("Show how memberships, packages, freezes, cancellations, failed payments and cross-location redemption work.");
 if(f.inventory)q.push("Show inventory depletion from treatment through reorder, including multi-location transfers if applicable.");
 if(f.photos)q.push("Show the before/after photo workflow, consent handling, storage, access controls and export process.");
 if(f.support==="important")q.push("After onboarding, who handles support, what are the support hours and escalation path, and is priority support an extra charge?");
 if(f.flexibility==="important")q.push("What is the exact contract term, renewal process, cancellation notice and early-termination cost?");
 if(f.budget!=="high")q.push("Give us the all-in monthly and first-year cost for our exact provider/location count, including onboarding, add-ons, payment fees and required modules.");
 if(q.length<5)q.push("What important workflow in our profile is not included in the quoted plan by default?");
 return q.slice(0,5);
}

export function resultGuidance(v,f){
 const best=[];
 if(f.providers<=2&&v.scaleFit<=4)best.push("smaller practices avoiding enterprise complexity");
 if(f.providers>=6&&v.scaleFit>=4)best.push("larger operating teams");
 if(f.locations>=2&&v.multiOps>=4)best.push("multi-location operations");
 if(f.clinical==="advanced"&&v.deepMedical)best.push("advanced clinical workflows");
 if(f.marketing&&v.marketingCap>=4)best.push("CRM and marketing-heavy workflows");
 if(f.switching&&v.migrationSupport>=4)best.push("practices where migration support matters");
 const watch=[];
 if(f.clinical==="advanced"&&!v.deepMedical)watch.push("does not meet the advanced clinical requirement");
 if(f.injectableTracking&&!v.injectableTracking)watch.push("does not meet the injectable / batch tracking requirement");
 if(f.eprescribe&&!v.eprescribe)watch.push("does not meet the e-prescribing requirement");
 if(f.providers<=2&&v.scaleFit>=5)watch.push("may add more operational complexity than a very small practice needs");
 if(f.locations>=3&&v.multiOps<4)watch.push("verify multi-location controls for your exact setup");
 if(f.budget==="low"&&v.budget>=3)watch.push("verify the all-in quote against your sub-$200 budget");
 if(f.switching&&v.migrationSupport<4)watch.push("verify exactly what data migration is included");
 if(f.flexibility==="important"&&v.contractFlex<4)watch.push("verify contract term, renewal and cancellation conditions");
 return {bestIf:best.slice(0,2),watchOut:watch.slice(0,2)};
}

export const evidence={
 PatientNow:{
  eprescribe:{status:"verified",source:"https://www.patientnow.com/pricing",checkedAt:"2026-09-22",note:"e-Prescribing is listed as an optional add-on; availability varies by package/edition."},
  migrationSupport:{status:"verified",source:"https://www.patientnow.com/",checkedAt:"2026-09-22",note:"Vendor states onboarding handles data migration, staff training and setup at no extra cost."},
  contractFlex:{status:"verified",source:"https://www.patientnow.com/",checkedAt:"2026-09-22",note:"Vendor states no long-term contract."},
  photos:{status:"verified",source:"https://www.patientnow.com/",checkedAt:"2026-09-22",note:"Vendor describes before-and-after photo management for aesthetic practices."}
 },
 Zenoti:{
  eprescribe:{status:"verified",source:"https://www.zenoti.com/medical-spa-software/clinical-features_v1",checkedAt:"2026-09-22",note:"Vendor documents Surescripts e-prescription integration."},
  injectableTracking:{status:"verified",source:"https://www.zenoti.com/medical-spa-software/injectable-tracking",checkedAt:"2026-09-22",note:"Vendor documents vial/lot registration, expiration dates, dispensing records and recall tracing."},
  photos:{status:"verified",source:"https://www.zenoti.com/medical-spa-software/clinical-features_v1",checkedAt:"2026-09-22",note:"Vendor documents HIPAA-compliant before/after photo management."},
  charting:{status:"verified",source:"https://www.zenoti.com/medical-spa-software/clinical-features_v1",checkedAt:"2026-09-22",note:"Vendor documents procedure-specific clinical charting."}
 }
};

Object.assign(evidence,{
 Mangomint:{
  charting:{status:"verified",source:"https://www.mangomint.com/cartessa/",checkedAt:"2026-09-22",note:"Vendor documents HIPAA-compliant SOAP notes and charting."},
  photos:{status:"verified",source:"https://www.mangomint.com/cartessa/",checkedAt:"2026-09-22",note:"Vendor documents image markup and before/after photo tracking."},
  migrationSupport:{status:"verified",source:"https://www.mangomint.com/cartessa/",checkedAt:"2026-09-22",note:"Vendor documents white-glove onboarding and data migration for this partner offer; verify applicability to the quoted plan."}
 },
 Phorest:{
  charting:{status:"verified",source:"https://www.phorest.com/us/industry/medical-spa-software/",checkedAt:"2026-09-22",note:"Vendor documents HIPAA-compliant charting, consultation forms and treatment plans."},
  photos:{status:"verified",source:"https://www.phorest.com/us/industry/medical-spa-software/",checkedAt:"2026-09-22",note:"Vendor documents before/after photo management and comparison views."},
  multiOps:{status:"verified",source:"https://www.phorest.com/us/industry/multi-location/",checkedAt:"2026-09-22",note:"Vendor documents centralized reporting, shared client records, cross-location staff controls and memberships."}
 },
 Vagaro:{
  eprescribe:{status:"verified",source:"https://www.vagaro.com/pro/medical-spa-software",checkedAt:"2026-09-22",note:"Vendor documents electronic prescriptions to partner pharmacies."},
  charting:{status:"verified",source:"https://www.vagaro.com/pro/medical-spa-software",checkedAt:"2026-09-22",note:"Vendor documents HIPAA-compliant charting and SOAP notes."},
  photos:{status:"verified",source:"https://www.vagaro.com/pro/medical-spa-software",checkedAt:"2026-09-22",note:"Vendor documents secure before/after photos."},
  multiOps:{status:"verified",source:"https://www.vagaro.com/pro/multi-location",checkedAt:"2026-09-22",note:"Vendor documents unified multi-location scheduling, client data, reporting and cross-location memberships."},
  inventoryCap:{status:"verified",source:"https://www.vagaro.com/pro/inventory",checkedAt:"2026-09-22",note:"Vendor documents real-time inventory, purchase orders, reorder alerts and location/storage assignment."},
  injectableTracking:{status:"verified",source:"https://support.vagaro.com/hc/en-us/articles/41206452277787",checkedAt:"2026-09-22",note:"Vendor support docs explicitly cover Botox/partial-use products with vial, lot ID, serial number and expiration-date tracking. Recall tracing is not explicitly documented and should be verified in demo."}
 }
});

Object.assign(evidence,{
 AestheticsPro:{
  eprescribe:{status:"verified",source:"https://www.aestheticspro.com/Software-Pricing/",checkedAt:"2026-09-22",note:"Vendor lists E-Prescribe in Pro-Plus and higher; some features may require an additional fee."},
  charting:{status:"verified",source:"https://www.aestheticspro.com/Medical-Spa-Software/",checkedAt:"2026-09-22",note:"Vendor documents HIPAA-compliant EMR, charting, digital forms and client records."},
  photos:{status:"verified",source:"https://www.aestheticspro.com/Software-Features/",checkedAt:"2026-09-22",note:"AP Photo documents HIPAA-compliant progress photos, alignment, markup and side-by-side comparison."},
  inventoryCap:{status:"verified",source:"https://www.aestheticspro.com/Software-Pricing/",checkedAt:"2026-09-22",note:"Vendor documents inventory management and low-inventory alerts."},
  integrationsCap:{status:"verified",source:"https://www.aestheticspro.com/Medical-Spa-Software/",checkedAt:"2026-09-22",note:"Vendor documents native integrations plus webhooks; Executive and Enterprise advertise advanced integrations."},
  multiOps:{status:"verified",source:"https://www.aestheticspro.com/Software-Pricing/",checkedAt:"2026-09-22",note:"Executive and Enterprise plans explicitly support multi-location practices."},
  migrationSupport:{status:"verified",source:"https://www.aestheticspro.com/Medspa-Software/",checkedAt:"2026-09-22",note:"Vendor states it helps configure the system, migrate data and prepare the practice to go live."},
  humanSupport:{status:"verified",source:"https://www.aestheticspro.com/Getting-Started/",checkedAt:"2026-09-22",note:"Vendor documents dedicated onboarding, customized training, Client Success Manager and ongoing support."},
  injectableTracking:{status:"verified",source:"https://www.aestheticspro.com/Blog/med-spa-software-features/",checkedAt:"2026-09-22",note:"Vendor-authored 2026 feature guidance describes integrated EMR injectable charting by units, areas and lot numbers plus inventory tracking by lot number and expiration date. Recall workflow is not explicitly documented and should still be verified in demo."}
 }
});
export function evidenceFor(v,field){return evidence[v.name]?.[field]||{status:"unknown",source:null,checkedAt:null,note:"Not yet independently mapped to current vendor documentation."}}
