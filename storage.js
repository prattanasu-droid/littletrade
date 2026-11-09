import {migrateSave} from './engine.js';
const LEGACY='little-trade-profiles-v1';
const keyFor=accountId=>accountId?`little-trade-profiles-v2:${accountId}`:LEGACY;
export function loadProfiles(accountId){try{const raw=JSON.parse(localStorage.getItem(keyFor(accountId))||'[]');return Array.isArray(raw)?raw.map(migrateSave).filter(s=>s?.id&&s.name):[];}catch{return [];}}
export function storeProfile(state,accountId){if(!state.id)return;const list=loadProfiles(accountId).filter(s=>s.id!==state.id);list.unshift({...state,updatedAt:Date.now()});localStorage.setItem(keyFor(accountId),JSON.stringify(list.slice(0,20)));}
export function claimLegacyProfiles(accountId){if(localStorage.getItem(keyFor(accountId)))return;const profiles=loadProfiles();if(profiles.length)localStorage.setItem(keyFor(accountId),JSON.stringify(profiles));}
export function downloadSave(state){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`little-trade-${state.id}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);}
