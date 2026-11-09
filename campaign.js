import {QUESTS,ITEMS,FINALE_QUIZ} from './content.js';
const IDS=QUESTS.filter(q=>q.chapter>1).map(q=>q.id);
export const emptyStory=()=>({completed:[],stages:{},expeditionBaseline:null,planChoice:null,grandSupplied:false});
export function restoreStory(raw){const story=emptyStory();if(!raw||typeof raw!=='object')return story;story.completed=Array.isArray(raw.completed)?[...new Set(raw.completed.filter(id=>IDS.includes(id)))]:[];for(const key of ['medicine_route','supply_chain','expedition'])if(typeof raw.stages?.[key]==='string'&&['carrying','delivered','first','second','active','reported'].includes(raw.stages[key]))story.stages[key]=raw.stages[key];if(raw.expeditionBaseline&&Number.isFinite(raw.expeditionBaseline.golem)&&Number.isFinite(raw.expeditionBaseline.boar))story.expeditionBaseline={golem:Math.max(0,raw.expeditionBaseline.golem),boar:Math.max(0,raw.expeditionBaseline.boar)};story.planChoice=[0,1,2].includes(raw.planChoice)?raw.planChoice:null;story.grandSupplied=raw.grandSupplied===true;return story;}
export const storyDone=(s,id)=>s.story?.completed?.includes(id)||false;
export const COSTS={provisions:{grilledMeat:2,water:2},forge_tools:{tool:1,wood:3},medicine_route:{herb:3,water:1},supply_chain:{bread:3,stew:1,tool:1},grand_market:{bread:3,grilledMeat:2,potion:1,tool:1}};
const itemRequirements=(s,items)=>Object.entries(items).map(([id,n])=>({text:`${ITEMS[id].name} ${n} ชิ้น (มี ${s.inventory[id]||0})`,done:(s.inventory[id]||0)>=n}));
export function expeditionProgress(s){const baseline=s.story?.expeditionBaseline||{golem:0,boar:0};return {golem:Math.max(0,(s.monsterKinds?.golem||0)-baseline.golem),boar:Math.max(0,(s.huntKinds?.boar||0)-baseline.boar)};}
export function questView(s,quest){if(!quest)return null;const q={...quest},stage=s.story?.stages?.[q.id];
 if(q.id==='medicine_route'&&stage==='carrying'){q.target='mali';q.desc='รับพัสดุยาจากวาว้าแล้ว เดินไปส่งให้เชนทางตะวันตกเฉียงใต้ของหมู่บ้าน';}
 if(q.id==='supply_chain'&&stage==='first'){q.target='fah';q.desc='รับสินค้าแล้ว นำเครื่องมือไปส่งจีโน่ที่หน้าร้านช่างไม้';}
 if(q.id==='supply_chain'&&stage==='second'){q.target='phum';q.desc='ส่งให้จีโน่แล้ว นำอาหารไปส่งเมญ่าที่ร้านขนมปัง';}
 if(q.id==='expedition'&&stage==='active'){const p=expeditionProgress(s);q.target=p.golem<1?'deepforest':p.boar<1?'boar_clearing':'fah';q.desc=p.golem<1?'ไปถ้ำชายป่า ปราบโกเลม 1 ตัวหลังรับภารกิจ':p.boar<1?'ล่าหมูป่า 1 ตัวหลังรับภารกิจ':'สำรวจสำเร็จแล้ว กลับไปคุยกับจีโน่เพื่อรายงานผล';}
 if(q.id==='grand_market'&&s.story?.grandSupplied)q.desc='ส่งสินค้าครบแล้ว ตอบคำถามสรุปตลาดใหญ่ 3 ข้อกับไมค์';
 return q;
}
export function storyRequirements(s,id){const stage=s.story?.stages?.[id];switch(id){
 case 'provisions':return [{text:`ล่าสัตว์สะสม 2 ตัว (${Math.min(2,s.hunted||0)}/2)`,done:(s.hunted||0)>=2},...itemRequirements(s,COSTS[id])];
 case 'forge_tools':return [{text:'ผลิตเครื่องมือด้วยตนเอง 1 ชิ้น',done:(s.crafted.tool||0)>=1},...itemRequirements(s,COSTS[id])];
 case 'medicine_route':return stage==='carrying'?[{text:'นำพัสดุยาที่รับจากวาว้ามาส่งให้เชน',done:true}]:itemRequirements(s,COSTS[id]);
 case 'trade_plan':return [{text:`ขายสินค้าอย่างน้อย 2 ชนิด (${Math.min(2,Object.values(s.sold||{}).filter(n=>n>0).length)}/2)`,done:Object.values(s.sold||{}).filter(n=>n>0).length>=2},{text:`เงินอย่างน้อย 40 เหรียญ (มี ${s.coins})`,done:s.coins>=40},{text:'เลือกแผนผลิตโดยดูความต้องการและต้นทุน',done:s.story?.planChoice===1}];
 case 'supply_chain':return stage==='first'?[{text:'นำเครื่องมือในพัสดุมาส่งให้จีโน่',done:true}]:stage==='second'?[{text:'นำอาหารในพัสดุมาส่งให้เมญ่า',done:true}]:itemRequirements(s,COSTS[id]);
 case 'expedition':{const p=expeditionProgress(s);return stage==='active'?[{text:`โกเลมหลังรับภารกิจ ${Math.min(1,p.golem)}/1 ตัว`,done:p.golem>=1},{text:`หมูป่าหลังรับภารกิจ ${Math.min(1,p.boar)}/1 ตัว`,done:p.boar>=1}]:[{text:'รับภารกิจสำรวจจากจีโน่ ก่อนนับการต่อสู้รอบใหม่',done:true}];}
 case 'grand_market':return s.story?.grandSupplied?[{text:`คำถามสรุป ${s.finaleQuiz?.length||0}/3 ข้อ`,done:s.finaleQuiz?.length===3}]:itemRequirements(s,COSTS[id]);
 default:return [];
}}
export function storyActionLabel(s,id){const stage=s.story?.stages?.[id];return {provisions:'ส่งเสบียงภารกิจหลัก',forge_tools:'ส่งเครื่องมือให้จีโน่',medicine_route:stage==='carrying'?'ส่งพัสดุยาให้เชน':'รับพัสดุยาจากวาว้า',trade_plan:'ยืนยันแผนร้านค้า',supply_chain:stage==='first'?'ส่งเครื่องมือให้จีโน่':stage==='second'?'ส่งอาหารให้เมญ่า':'รับงานส่งสินค้าจากเค้ก',expedition:stage==='active'?'รายงานผลสำรวจ':'รับภารกิจสำรวจป่าลึก',grand_market:'ส่งสินค้าให้ตลาดใหญ่'}[id]||'ส่งเควส';}
export function campaignTransition(s,a,active,{bag,result,lesson}){
 const story={...emptyStory(),...s.story,stages:{...s.story?.stages},completed:[...(s.story?.completed||[])]};
 if(a.type==='FINALE_ANSWER'){
  const q=FINALE_QUIZ.find(q=>q.id===a.id);if(!q||!story.grandSupplied||active?.id!=='grand_market'||storyDone(s,'grand_market'))return s;
  if(q.correct!==a.answer)return result(s,{},`ลองใหม่ได้ ไม่หักคะแนน — ${q.explain}`);if(s.finaleQuiz.includes(q.id))return s;
  const finaleQuiz=[...s.finaleQuiz,q.id];if(finaleQuiz.length===FINALE_QUIZ.length)story.completed.push('grand_market');
  return result(s,{story,finaleQuiz,coins:s.coins+10,journal:lesson(s,q.id,q.explain)},finaleQuiz.length===3?'สำเร็จทั้ง 3 บท! ได้รับตรานักค้าขายแห่งหมู่บ้าน':`ถูกต้อง! +10 เหรียญ — ${q.explain}`);
 }
 if(!active||active.id!==a.id||active.chapter<2)return result(s,{},'ทำเควสหลักก่อนหน้าให้ครบก่อน แล้วกลับมารับภารกิจนี้นะ');
 const q=questView(s,active);const allowedNpc=q.target===a.npc||(q.id==='expedition'&&a.npc==='fah');if(!allowedNpc)return result(s,{},'นำภารกิจนี้ไปคุยกับเพื่อนบ้านที่แผนที่ชี้ไว้ก่อนนะ');
 if(a.type==='STORY_PLAN_ANSWER'){if(a.id!=='trade_plan'||![0,1,2].includes(a.answer))return s;story.planChoice=a.answer;return result(s,{story},a.answer===1?'แผนนี้เหมาะสม! ดูความต้องการซื้อและต้นทุนก่อนเลือกผลิต':'ลองคิดอีกครั้ง ผู้ผลิตควรดูความต้องการและต้นทุนก่อนตัดสินใจ');}
 if(a.type!=='STORY_TURN_IN')return s;
 if(q.id==='grand_market'&&story.grandSupplied)return result(s,{},'ส่งสินค้าแล้ว ตอบคำถามสรุปเพื่อปิดภารกิจได้เลย');
 if(!storyRequirements(s,q.id).every(r=>r.done))return result(s,{},'เงื่อนไขยังไม่ครบ ดูรายการในบทสนทนาหรือสมุดเควสได้เลย');
 const spend=items=>bag(s,Object.fromEntries(Object.entries(items).map(([id,n])=>[id,-n])));
 const finish=(reward,text,inventory=s.inventory)=>result(s,{story:{...story,completed:[...story.completed,q.id]},inventory,coins:s.coins+reward,journal:lesson(s,q.id,q.lesson)},`${text} +${reward} เหรียญ`);
 switch(q.id){
 case 'provisions':return finish(30,'ส่งเสบียงสำเร็จ!',spend(COSTS.provisions));
 case 'forge_tools':return finish(35,'ส่งเครื่องมือสำเร็จ!',spend(COSTS.forge_tools));
 case 'medicine_route':if(story.stages.medicine_route==='carrying')return finish(40,'ส่งยาให้เชนแล้ว!');story.stages.medicine_route='carrying';return result(s,{story,inventory:spend(COSTS.medicine_route)},'รับพัสดุยาแล้ว! เดินไปส่งให้เชน ตามลูกศรได้เลย');
 case 'trade_plan':return finish(25,'วางแผนร้านค้าสำเร็จ!');
 case 'supply_chain':if(story.stages.supply_chain==='second')return finish(45,'ส่งสินค้าครบทั้งสองบ้านแล้ว!');if(story.stages.supply_chain==='first'){story.stages.supply_chain='second';return result(s,{story},'จีโน่ได้รับเครื่องมือแล้ว เดินไปส่งอาหารให้เมญ่าต่อได้เลย');}story.stages.supply_chain='first';return result(s,{story,inventory:spend(COSTS.supply_chain)},'รับงานส่งสินค้าแล้ว! จุดแรกนำเครื่องมือไปส่งจีโน่');
 case 'expedition':if(story.stages.expedition==='active')return finish(50,'สำรวจป่าลึกสำเร็จ!');story.stages.expedition='active';story.expeditionBaseline={golem:s.monsterKinds?.golem||0,boar:s.huntKinds?.boar||0};return result(s,{story},'รับภารกิจแล้ว! ปราบโกเลมและล่าหมูป่าอย่างละ 1 ตัว แล้วกลับมารายงานจีโน่');
 case 'grand_market':story.grandSupplied=true;return result(s,{story,inventory:spend(COSTS.grand_market),coins:s.coins+75,journal:lesson(s,q.id,q.lesson)},'ตลาดใหญ่พร้อมแล้ว! +75 เหรียญ ตอบคำถามสรุปกับไมค์เพื่อจบบทที่ 3');
 default:return s;
 }
}
