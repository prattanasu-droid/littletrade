import world from './world-data.json' with {type:'json'};

export const CREATURES={
 slime:{name:'สไลม์',hp:2,speed:53,range:190,respawnMs:60000,group:'monster'},
 mushroom:{name:'เห็ดเด้ง',hp:2,speed:49,range:190,respawnMs:75000,group:'monster'},
 golem:{name:'โกเลมหิน',hp:3,speed:38,range:200,respawnMs:90000,group:'monster'},
 chicken:{name:'ไก่ป่า',hp:2,speed:107,range:150,respawnMs:60000,group:'wildlife',meat:1},
 boar:{name:'หมูป่า',hp:3,speed:58,range:225,respawnMs:85000,group:'wildlife',meat:2}
};
export const HUNT_SPAWNS=[
 {id:'chicken1',kind:'chicken',x:1220,y:610},
 {id:'chicken2',kind:'chicken',x:1640,y:620},
 {id:'boar1',kind:'boar',x:1344,y:930},
 {id:'boar2',kind:'boar',x:1760,y:800}
];
export const SPAWNS=[...world.monsters,...HUNT_SPAWNS].map((s,i)=>({...s,...CREATURES[s.kind],respawnMs:Math.min(90000,CREATURES[s.kind].respawnMs+(i%2)*5000)}));
export const SPAWN_BY_ID=Object.fromEntries(SPAWNS.map(s=>[s.id,s]));
export const SAFE_SPAWN_DISTANCE=180;
export const SPAWN_WARNING_MS=3000;

export function encounterState(state,id){
 const def=SPAWN_BY_ID[id];if(!def)return null;
 const saved=state.encounters?.[id];
 if(saved)return saved;
 const dead=state.defeated?.includes(id)||false;
 return {cycle:0,alive:!dead,remainingMs:dead?def.respawnMs:0};
}
export function restoreEncounters(raw,defeated=[]){
 const result={};
 for(const def of SPAWNS){const row=raw?.[def.id];
  if(!row||typeof row!=='object'){if(defeated.includes(def.id))result[def.id]={cycle:0,alive:false,remainingMs:def.respawnMs};continue;}
  const alive=row.alive!==false;
  result[def.id]={cycle:Number.isFinite(row.cycle)?Math.max(0,Math.min(1000000,Math.floor(row.cycle))):0,alive,remainingMs:alive?0:Number.isFinite(row.remainingMs)?Math.max(0,Math.min(def.respawnMs,row.remainingMs)):def.respawnMs};
 }return result;
}
export function advanceEcology(state,elapsed){
 const step=Math.max(0,Math.min(2000,Number(elapsed)||0));if(!step)return state;
 let changed=false;const encounters={...state.encounters};
 for(const def of SPAWNS){const e=encounterState(state,def.id);if(e.alive||e.remainingMs<=0)continue;encounters[def.id]={...e,remainingMs:Math.max(0,e.remainingMs-step)};changed=true;}
 return changed?{...state,encounters}:state;
}
