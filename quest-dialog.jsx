import React from 'react';
import {ArrowRight,CheckCircle2,Flag,Package} from 'lucide-react';
import {QUESTS,ITEMS} from './content';
import {needLeft} from './engine';

export function NpcQuestAction({npc,state,dispatch,onQuiz}){
 let quest,requirements=[],finished=false,label,action;
 if(npc.id==='ton'){
  quest=QUESTS[0];finished=!!state.flags.barter;
  requirements=[{text:`ผลไม้ป่า 2 ชิ้น (มี ${state.inventory.berry||0})`,done:(state.inventory.berry||0)>=2},{text:'ทิวยังต้องการผลไม้',done:needLeft(state,npc)>=2}];
  label='ส่งเควส: แลกผลไม้';action=()=>dispatch({type:'TRADE',npc:'ton'});
 }else if(npc.id==='mali'){
  quest=QUESTS[1];finished=!!state.flags.service;
  requirements=[{text:'แลกของกับทิวเรียบร้อยแล้ว',done:!!state.flags.barter},{text:`ขนมปัง 1 ชิ้น (มี ${state.inventory.bread||0})`,done:(state.inventory.bread||0)>=1}];
  label='ช่วยส่งขนมปัง';action=()=>dispatch({type:'SERVICE',id:'delivery'});
 }else if(npc.id==='mina'){
  quest=QUESTS[4];finished=!!state.flags.festival&&state.quiz.length===3;
  if(state.flags.festival)return <section className="npc-quest-action quest-ready"><span className="npc-quest-eyebrow"><Flag size={13}/> เควสหลัก · {quest.title}</span><h3>{finished?'สำเร็จแล้ว: ผู้พิทักษ์ตลาด!':'ส่งขนมปังเรียบร้อยแล้ว!'}</h3><p>{finished?'จบบทแรกแล้ว! เปิดสมุดเควสเพื่อทำภารกิจใหม่ในบทที่ 2 และ 3 ต่อได้เลย':'เหลือคำถามสรุปบทเรียน 3 ข้อ ตอบผิดลองใหม่ได้โดยไม่เสียคะแนน'}</p><button className="primary" onClick={onQuiz}>{finished?'ทบทวนสิ่งที่เรียนรู้':'ตอบคำถามสรุปบทเรียน'}<ArrowRight size={15}/></button></section>;
  requirements=[{text:'ช่วยเชนส่งขนมปังแล้ว',done:!!state.flags.service},{text:`ผลิตขนมปังครบ 2 ชิ้น (${Math.min(2,state.crafted.bread||0)}/2)`,done:(state.crafted.bread||0)>=2},{text:`เปิดเส้นทาง: มอนสเตอร์ ${Math.min(2,state.kills)}/2 ตัว`,done:!!state.flags.routeOpen},{text:`มีขนมปังสำหรับงาน 2 ชิ้น (มี ${state.inventory.bread||0})`,done:(state.inventory.bread||0)>=2}];
  label='ส่งขนมปังให้งานเทศกาล';action=()=>dispatch({type:'FESTIVAL'});
 }else return null;
 return <section className={`npc-quest-action ${finished?'quest-finished':''}`}><span className="npc-quest-eyebrow"><Flag size={13}/> เควสหลัก</span><h3>{quest.title}</h3>{finished?<p className="quest-turn-in-done"><CheckCircle2 size={16}/> {npc.id==='mali'?'ส่งของเรียบร้อยแล้ว รับค่าบริการแล้ว':'แลกเปลี่ยนสำเร็จแล้ว! เปิดสมุดเควสเพื่อดูภารกิจถัดไป'}</p>:<><div className="quest-requirements">{requirements.map(r=><span key={r.text} className={r.done?'requirement-done':''}><i>{r.done?'✓':'○'}</i>{r.text}</span>)}</div><button className="primary" disabled={!state.id||!requirements.every(r=>r.done)} onClick={action}>{label}<Package size={15}/></button>{!requirements.every(r=>r.done)&&<p className="quest-missing-hint">ทำรายการที่ยังเป็น ○ ให้ครบ แล้วกลับมากดส่งเควสได้เลย</p>}</>}</section>;
}
