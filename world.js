import Phaser from 'phaser';
import layout from './world-data.json';
import {NPCS,ITEMS} from './content';
import {personCanvas,propCanvas,PERSON_SCALE} from './pixel';
import {questDone} from './engine';
import {VILLAGE_PETS,petCanvas} from './village-pets';
import {SPAWNS,encounterState,SAFE_SPAWN_DISTANCE,SPAWN_WARNING_MS} from './ecology';
import {zoneAt,blocked,findPath} from './navigation';
export class TradeScene extends Phaser.Scene{
 constructor(bridge){super('TradeWorld');this.bridge=bridge;this.lastPos=0;this.lastNear=0;this.attackAt=-450;this.activeTime=0;this.ecologyElapsed=0;this.hurtAt=0;this.dir='down';this.spawnDay=0;this.lookKey='';this.lastRescue=0;this.entityHealth={};}
 preload(){this.load.image('world','/art/world.png');}
 create(){
 this.cameras.main.setBackgroundColor('#91b87b');this.add.image(0,0,'world').setOrigin(0).setScale(2);
 this.physics.world.setBounds(18,26,layout.width-36,layout.height-44);
 const walls=this.physics.add.staticGroup();for(const o of [...layout.obstacles,{x:1610,y:950,w:270,h:220}]){const wall=this.add.zone(o.x+o.w/2,o.y+o.h/2,o.w,o.h);this.physics.add.existing(wall,true);walls.add(wall);}
 this.createHero();this.physics.add.collider(this.hero,walls);this.heroShadow=this.add.ellipse(this.hero.x+6,this.hero.y+2,30,10,0x254936,.23).setAngle(12);
 this.npcs=NPCS.map(n=>{const key='npc-'+n.id;this.textures.addCanvas(key,personCanvas(n));const sprite=this.add.image(n.x*2,n.y*2,key).setOrigin(.5,1).setScale(n.age==='child'?0.94:PERSON_SCALE);const shadow=this.add.ellipse(n.x*2+5,n.y*2+2,31,10,0x274c3d,.24).setAngle(12);shadow.setDepth(2);sprite.setDepth(n.y*2+10);const name=this.add.text(n.x*2,n.y*2-88,n.name,{fontFamily:'Noto Sans Thai Variable',fontSize:'12px',color:'#111111',backgroundColor:'#fff6dc',padding:{x:5,y:3}}).setOrigin(.5);name.setDepth(2000);const marker=this.add.text(n.x*2+15,n.y*2-108,'!',{fontFamily:'monospace',fontSize:'15px',color:'#fff1af',stroke:'#967e4d',strokeThickness:3}).setOrigin(.5).setDepth(2001);this.tweens.add({targets:marker,y:marker.y-4,duration:900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});return {...n,x:n.x*2,y:n.y*2,displayName:n.name,sprite,nameLabel:name,marker,type:'npc'};});
 for(const kind of ['berry','wheat','wood','herb','fiber','ore','water','slime','mushroom','golem','bunny','deer','bird','butterfly','chicken','boar'])this.textures.addCanvas(kind,propCanvas(kind));
 this.nodes=layout.resources.map(r=>({...r,type:'resource',sprite:this.add.image(r.x,r.y,r.item).setOrigin(.5,1).setScale(2).setDepth(r.y+1)}));
 this.animals=layout.animals.map((a,i)=>{const sprite=this.add.image(a.x,a.y,a.kind).setScale(a.kind==='butterfly'?1.4:1.8).setOrigin(.5,1).setDepth(a.y);return {...a,sprite,index:i};});
 for(const kind of new Set(VILLAGE_PETS.map(p=>p.kind)))for(let frame=0;frame<2;frame++)this.textures.addCanvas(`pet-${kind}-${frame}`,petCanvas(kind,frame));
 this.pets=VILLAGE_PETS.map(p=>({...p,type:'pet',happyUntil:0,lastPetAt:-2000,sprite:this.add.image(p.x,p.y,`pet-${p.kind}-0`).setOrigin(.5,1).setScale(p.scale).setDepth(p.y),shadow:this.add.ellipse(p.x+3,p.y,30,8,0x294c32,.16).setDepth(p.y-1)}));
 this.creatures=SPAWNS.map(def=>this.createCreature(def,walls));
 this.monsters=this.creatures.filter(c=>c.group==='monster');this.wildlife=this.creatures.filter(c=>c.group==='wildlife');this.syncCreatures();
 this.locations=[{id:'market',type:'place',name:'ตลาดหมู่บ้าน',x:650,y:620},{id:'workshop',type:'place',name:'โต๊ะผลิตสินค้า',x:920,y:616},{id:'home',type:'place',name:'บ้านและจุดพัก',x:482,y:1120}];
 for(const p of this.locations){this.add.text(p.x,p.y-18,p.id==='workshop'?'⚒':p.id==='market'?'ตลาด':'⌂',{fontFamily:'Noto Sans Thai Variable',fontSize:'11px',color:'#fff0c9',backgroundColor:'#586a4abb',padding:{x:6,y:3}}).setOrigin(.5).setDepth(1900);}
 this.waymark=this.add.graphics().setDepth(1950);this.cursor=this.input.keyboard.createCursorKeys();this.keys=this.input.keyboard.addKeys('W,A,S,D,E,SPACE');this.cameras.main.setBounds(0,0,layout.width,layout.height);this.cameras.main.startFollow(this.hero,true,.13,.13);this.cameras.main.setRoundPixels(true);const resizeZoom=()=>this.cameras.main.setZoom(Math.min(1.4,Math.max(1,this.scale.height/760)));resizeZoom();this.scale.on('resize',resizeZoom);this.events.once('shutdown',()=>this.scale.off('resize',resizeZoom));
 this.input.on('pointerdown',p=>this.handleWorldTap(this.cameras.main.getWorldPoint(p.x,p.y)));
 this.ready=true;this.bridge.ready?.();
 }
 createHero(){const s=this.bridge.state();const pos=blocked(s.position.x,s.position.y)?{x:700,y:780}:s.position;const key='hero-initial';this.textures.addCanvas(key,personCanvas(s.look));this.hero=this.physics.add.sprite(pos.x,pos.y,key).setOrigin(.5,1).setScale(PERSON_SCALE).setCollideWorldBounds(true);this.hero.body.setSize(16,10).setOffset(16,53);}
 heroTexture(look,frame,dir){const base=Object.values(look).join('-');const key=`hero-${base}-${frame}-${dir}`;if(!this.textures.exists(key))this.textures.addCanvas(key,personCanvas(look,frame,dir));return key;}
 findNearest(){const s=this.bridge.state(),target=this.bridge.input().target;return [...this.npcs,...this.pets,...this.locations,...this.nodes.filter(n=>!s.harvested.includes(n.id))].map(e=>({...e,d:Math.hypot(e.x-this.hero.x,e.y-this.hero.y)})).filter(e=>e.d<=100).sort((a,b)=>((a.type==='npc'&&a.id===target)?-1:0)-((b.type==='npc'&&b.id===target)?-1:0)||a.d-b.d)[0];}
 refreshNearest(){const s=this.bridge.state();for(const n of this.npcs){const id={ton:'barter',mali:'service',mina:'festival'}[n.id];const done=id&&questDone(s,id);n.marker.setText(this.bridge.input().target===n.id?'!':done?'✓':'↔').setColor(this.bridge.input().target===n.id?'#ffe89a':done?'#b7ed8a':'#e2f5cf');}this.nearest=this.findNearest();const e=this.nearest;const key=e?`${e.type}:${e.id}`:'';if(key!==this.nearKey){this.nearKey=key;this.bridge.near(e?{id:e.id,type:e.type,name:e.name||ITEMS[e.item]?.name}:null);}}
 hitEntity(point){const s=this.bridge.state();return [...this.npcs,...this.pets,...this.nodes.filter(n=>!s.harvested.includes(n.id)),...this.locations].filter(e=>{const bounds=e.sprite?.getBounds();const name=e.type==='npc'?e.nameLabel?.getBounds?.():null;return (bounds&&point.x>=bounds.left-12&&point.x<=bounds.right+12&&point.y>=bounds.top-10&&point.y<=bounds.bottom+10)||(name&&point.x>=name.left-7&&point.x<=name.right+7&&point.y>=name.top-7&&point.y<=name.bottom+7)||Math.hypot(e.x-point.x,e.y-point.y)<32;}).sort((a,b)=>(a.type==='npc'?0:1)-(b.type==='npc'?0:1)||Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y))[0];}
 handleWorldTap(point){if(!this.bridge.state().id||this.bridge.input().paused)return;const entity=this.hitEntity(point);this.pendingInteraction=null;if(entity&&Math.hypot(entity.x-this.hero.x,entity.y-this.hero.y)<=100){this.interact(entity);return;}this.pendingInteraction=entity||null;const goal=entity?{x:entity.x,y:entity.y}:point;this.path=findPath({x:this.hero.x,y:this.hero.y},goal);this.destination=this.path.shift()||null;if(entity&&!this.destination){this.pendingInteraction=null;this.bridge.action({type:'NOTICE',message:'ยังเข้าไม่ถึงจุดนี้ ลองเดินเข้าไปใกล้ตัวละครอีกนิดนะ'});}}
 interact(e){if(!e||Math.hypot(e.x-this.hero.x,e.y-this.hero.y)>100)return false;this.pendingInteraction=null;this.destination=null;this.path=[];this.hero.setVelocity(0);this.bridge.action({type:'MOVE',position:{x:Math.round(this.hero.x),y:Math.round(this.hero.y)},zone:zoneAt(this.hero.x,this.hero.y)});const s=this.bridge.state();if(e.type==='resource'){if(!s.harvested.includes(e.id)){this.bridge.action({type:'GATHER',id:e.id,item:e.item,count:e.count});this.floatText(e.x,e.y-35,`+${e.count} ${ITEMS[e.item].name}`,'#fff0be');}}else if(e.type==='pet'){const pet=this.pets.find(p=>p.id===e.id);if(this.activeTime-pet.lastPetAt>=1200){pet.lastPetAt=this.activeTime;pet.happyUntil=this.activeTime+2400;this.floatText(pet.x,pet.y-46,'♥','#f798ad');this.bridge.action({type:'NOTICE',message:pet.message});}}else if(e.type==='npc')this.bridge.interact({type:'npc',id:e.id});else this.bridge.interact({type:e.id});return true;}
 floatText(x,y,text,color='#ffe8a5'){const t=this.add.text(x,y,text,{fontFamily:'Noto Sans Thai Variable',fontSize:'12px',color,stroke:'#51684c',strokeThickness:3}).setOrigin(.5).setDepth(3000);this.tweens.add({targets:t,y:y-30,alpha:0,duration:1100,onComplete:()=>t.destroy()});}
 createCreature(def,walls){
 const sprite=this.physics.add.sprite(def.x,def.y,def.kind).setOrigin(.5,1).setScale(def.kind==='golem'?2.5:def.kind==='boar'?2.2:2).setCollideWorldBounds(true);
 sprite.body.setSize(12,8).setOffset(6,15);this.physics.add.collider(sprite,walls);
 const shadow=this.add.ellipse(def.x+5,def.y+2,31,10,0x254936,.2).setAngle(12);
 const bar=this.add.graphics().setDepth(2000),indicator=this.add.graphics().setDepth(1900);
 const label=this.add.text(def.x,def.y-57,def.name,{fontFamily:'Noto Sans Thai Variable',fontSize:'10px',color:'#111111',backgroundColor:'#fff4de',padding:{x:4,y:2}}).setOrigin(.5).setDepth(2001);
 return {...def,sprite,shadow,bar,indicator,label,hp:def.hp,maxHp:def.hp,phase:'idle',nextChargeAt:0,warningSeenMs:0};
 }
 syncCreatures(){for(const m of this.creatures){const e=encounterState(this.bridge.state(),m.id),key=`${e.cycle}:${e.alive}`;
  if(m.lifeKey===key)continue;m.lifeKey=key;m.cycle=e.cycle;m.hp=e.alive?m.maxHp:0;m.phase='idle';m.nextChargeAt=this.activeTime+700;m.warningSeenMs=0;m.respawnRequestedCycle=null;
  m.sprite.setPosition(m.x,m.y).setVelocity(0).setVisible(e.alive);m.sprite.body.enable=e.alive;m.shadow.setVisible(e.alive);m.bar.clear();m.indicator.clear();m.label.setVisible(true);
 }}
 updateEcology(delta,paused){if(paused)return;const elapsed=Math.min(100,Math.max(0,delta));this.activeTime+=elapsed;
  const waiting=this.creatures.some(m=>!encounterState(this.bridge.state(),m.id).alive);
  if(waiting){this.ecologyElapsed+=elapsed;if(this.ecologyElapsed>=1000){const step=Math.min(2000,Math.floor(this.ecologyElapsed));this.ecologyElapsed-=step;this.bridge.action({type:'ECOLOGY_TICK',elapsed:step});}}
  else this.ecologyElapsed=0;
 }
 renderWaiting(m,delta,paused){const e=encounterState(this.bridge.state(),m.id);m.sprite.setVelocity(0);m.shadow.setVisible(false);m.bar.clear();m.indicator.clear();
  if(!e.alive){const seconds=Math.ceil(e.remainingMs/1000),warning=e.remainingMs<=SPAWN_WARNING_MS;
   m.label.setPosition(m.x,m.y-24).setText(warning?`${m.name} · กำลังเกิด!`:`${m.name} · อีก ${seconds} วิ`).setAlpha(warning?1:.78);
   m.indicator.lineStyle(warning?3:1,warning?0xf4b95f:0xd6dcb0,warning?.9:.4);m.indicator.strokeEllipse(m.x,m.y-3,warning?46+Math.sin(this.activeTime/120)*5:34,warning?24:14);
   if(warning&&!paused)m.warningSeenMs+=Math.min(100,Math.max(0,delta));
   if(!paused&&e.remainingMs<=0&&m.warningSeenMs>=SPAWN_WARNING_MS&&Phaser.Math.Distance.Between(this.hero.x,this.hero.y,m.x,m.y)>SAFE_SPAWN_DISTANCE&&m.respawnRequestedCycle!==e.cycle){m.respawnRequestedCycle=e.cycle;this.bridge.action({type:'RESPAWN',id:m.id,cycle:e.cycle});}
  }
 }
 updateCreature(m,delta,paused){
  if(!m.sprite.visible){this.renderWaiting(m,delta,paused);return;}m.indicator.clear();m.bar.clear();m.shadow.setVisible(true).setPosition(m.sprite.x+5,m.sprite.y+2).setDepth(m.sprite.y-2);
  m.label.setPosition(m.sprite.x,m.sprite.y-58).setText(m.group==='wildlife'?`${m.name} · 🥩${m.meat}`:m.name).setAlpha(1);
  m.bar.fillStyle(0x435a43,.7).fillRect(m.sprite.x-16,m.sprite.y-43,32,5);m.bar.fillStyle(m.group==='wildlife'?0xeab979:0xb9d686).fillRect(m.sprite.x-15,m.sprite.y-42,m.hp/m.maxHp*30,3);
  m.sprite.setDepth(m.sprite.y+8);if(paused){m.sprite.setVelocity(0);return;}
  const dx=this.hero.x-m.sprite.x,dy=this.hero.y-m.sprite.y,dist=Math.hypot(dx,dy),homeDist=Math.hypot(m.sprite.x-m.x,m.sprite.y-m.y),clock=this.activeTime;
  if(homeDist>(m.kind==='chicken'?150:245)){m.phase='idle';this.physics.moveTo(m.sprite,m.x,m.y,75);}
  else if(m.kind==='chicken'){
   if(dist<m.range){const angle=Math.atan2(dy,dx)+Math.PI;const nx=m.sprite.x+Math.cos(angle)*25,ny=m.sprite.y+Math.sin(angle)*25;if(!blocked(nx,ny)&&nx>1185)m.sprite.setVelocity(Math.cos(angle)*m.speed,Math.sin(angle)*m.speed);else{const turn=angle+Math.PI/2;m.sprite.setVelocity(Math.cos(turn)*m.speed*.7,Math.sin(turn)*m.speed*.7);}}
   else{const angle=Math.sin(clock/1800+m.x)*Math.PI;m.sprite.setVelocity(Math.cos(angle)*14,Math.sin(angle)*9);}
  }else if(m.kind==='boar'){
   if(m.phase==='windup'){
    m.sprite.setVelocity(0);m.indicator.lineStyle(4,0xf0ad57,.9);m.indicator.lineBetween(m.sprite.x,m.sprite.y-12,m.sprite.x+Math.cos(m.chargeAngle)*105,m.sprite.y-12+Math.sin(m.chargeAngle)*105);m.indicator.strokeCircle(m.sprite.x,m.sprite.y-12,27);
    if(clock>=m.phaseUntil){m.phase='charge';m.phaseUntil=clock+330;}
   }else if(m.phase==='charge'){
    m.sprite.setVelocity(Math.cos(m.chargeAngle)*255,Math.sin(m.chargeAngle)*255);if(clock>=m.phaseUntil){m.phase='idle';m.nextChargeAt=clock+1300;}
   }else if(dist<m.range&&clock>=m.nextChargeAt){m.phase='windup';m.phaseUntil=clock+750;m.chargeAngle=Math.atan2(dy,dx);m.sprite.setVelocity(0);}
   else if(dist<230&&dist>65)this.physics.moveToObject(m.sprite,this.hero,m.speed);else m.sprite.setVelocity(0);
  }else if(dist<m.range&&dist>30)this.physics.moveToObject(m.sprite,this.hero,m.speed);else m.sprite.setVelocity(0);
  if(m.sprite.x<1180){m.sprite.setX(1180);m.sprite.setVelocityX(Math.max(0,m.sprite.body.velocity.x));}
  const dangerous=m.kind!=='chicken'&&(m.kind!=='boar'||m.phase==='charge');
  if(dangerous&&dist<36&&clock-this.hurtAt>1300&&clock-this.attackAt>250){this.hurtAt=clock;this.bridge.action({type:'DAMAGE',amount:m.kind==='boar'?2:1});if(this.bridge.input().effects!==false)this.cameras.main.shake(90,.002);this.hero.setTint(0xe9aba0);this.time.delayedCall(250,()=>this.hero.clearTint());}
 }
 attack(){const time=this.activeTime;if(time-this.attackAt<450)return;this.attackAt=time;this.pendingInteraction=null;this.destination=null;this.path=[];const x=this.hero.x,y=this.hero.y-14;const arc=this.add.graphics().setDepth(y+100);arc.lineStyle(5,0xffe4a2,.95);const angle={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[this.dir];arc.beginPath();arc.arc(x,y,45,angle-.9,angle+.9);arc.strokePath();this.tweens.add({targets:arc,alpha:0,duration:180,onComplete:()=>arc.destroy()});
 for(const m of this.creatures){if(!m.sprite.active||!m.sprite.visible)continue;const dist=Phaser.Math.Distance.Between(x,y,m.sprite.x,m.sprite.y-12);if(dist<85){m.hp--;m.sprite.setTintFill(0xf7edc7);this.time.delayedCall(100,()=>m.sprite.clearTint());this.floatText(m.sprite.x,m.sprite.y-42,'−1');if(m.hp<=0){m.sprite.setVisible(false).setVelocity(0);m.sprite.body.enable=false;m.shadow.setVisible(false);m.bar.clear();m.indicator.clear();this.bridge.action({type:m.group==='wildlife'?'HUNT':'KILL',id:m.id,kind:m.kind,cycle:m.cycle});this.floatText(m.sprite.x,m.sprite.y-30,m.group==='wildlife'?`✦ เนื้อดิบ +${m.meat}`:'✦ ได้วัตถุดิบ!');}else{const a=Phaser.Math.Angle.Between(x,y,m.sprite.x,m.sprite.y);const nx=m.sprite.x+Math.cos(a)*22,ny=m.sprite.y+Math.sin(a)*22;if(!blocked(nx,ny))m.sprite.setPosition(nx,ny);}}}}
 update(time,delta){if(!this.ready)return;const s=this.bridge.state(),inp=this.bridge.input();if((s.rescued||0)!==this.lastRescue){this.lastRescue=s.rescued||0;this.hero.setPosition(s.position.x,s.position.y);this.destination=null;this.path=[];this.pendingInteraction=null;}
 this.syncCreatures();
 for(const n of this.nodes)n.sprite.setAlpha(s.harvested.includes(n.id)?.25:1);
 const paused=inp.paused||!s.id||document.hidden||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);if(paused!==this.wasPaused){this.input.keyboard.resetKeys();this.wasPaused=paused;}this.input.keyboard.enabled=!paused;this.input.keyboard.manager.enabled=!paused;let vx=0,vy=0;this.updateEcology(delta,paused);
 if(!paused){vx=(this.cursor.right.isDown||this.keys.D.isDown?1:0)-(this.cursor.left.isDown||this.keys.A.isDown?1:0)+(inp.x||0);vy=(this.cursor.down.isDown||this.keys.S.isDown?1:0)-(this.cursor.up.isDown||this.keys.W.isDown?1:0)+(inp.y||0);if(vx||vy){this.destination=null;this.path=[];this.pendingInteraction=null;}else if(this.destination){const dx=this.destination.x-this.hero.x,dy=this.destination.y-this.hero.y,dist=Math.hypot(dx,dy);if(dist<9)this.destination=this.path?.shift()||null;else{vx=dx/dist;vy=dy/dist;}}const len=Math.hypot(vx,vy);if(len>1){vx/=len;vy/=len;}if(inp.attack||Phaser.Input.Keyboard.JustDown(this.keys.SPACE)){this.attack();inp.attack=false;}if(inp.interact||Phaser.Input.Keyboard.JustDown(this.keys.E)){this.refreshNearest();this.interact(this.nearest);inp.interact=false;}}
 this.hero.setVelocity(vx*170,vy*170);if(vx||vy)this.dir=Math.abs(vx)>Math.abs(vy)?vx>0?'right':'left':vy>0?'down':'up';this.hero.setTexture(this.heroTexture(s.look,(vx||vy)?1+Math.floor(time/140)%2:0,this.dir));this.hero.setDepth(this.hero.y+10);this.heroShadow.setPosition(this.hero.x+6,this.hero.y+2).setDepth(this.hero.y-2);
 for(const a of this.animals){const offset=paused?0:Math.sin(time/2200+a.index)*9;a.sprite.x=a.x+offset;a.sprite.y=a.y+(a.kind==='bird'||a.kind==='butterfly'?Math.sin(time/500+a.index)*5:Math.sin(time/1600+a.index)*2);a.sprite.setFlipX(offset<0);}
 for(const p of this.pets){const happy=this.activeTime<p.happyUntil,frame=paused?0:Math.floor(this.activeTime/(happy?180:650))%2;
  p.sprite.setTexture(`pet-${p.kind}-${p.kind==='kitten'&&!happy?0:frame}`);p.sprite.y=p.y-(paused?0:happy?Math.max(0,Math.sin(this.activeTime/110))*3:Math.sin(this.activeTime/700+p.x)*.7);p.sprite.setDepth(p.y);}
 for(const m of this.creatures)this.updateCreature(m,delta,paused);
 if(!paused&&this.pendingInteraction&&Math.hypot(this.pendingInteraction.x-this.hero.x,this.pendingInteraction.y-this.hero.y)<=96)this.interact(this.pendingInteraction);
 if(time-this.lastNear>170){this.lastNear=time;this.refreshNearest();}
 if(!paused&&time-this.lastPos>650){this.lastPos=time;this.bridge.action({type:'MOVE',position:{x:Math.round(this.hero.x),y:Math.round(this.hero.y)},zone:zoneAt(this.hero.x,this.hero.y)});}
 this.waymark.clear();const target=inp.target;if(target){const n=NPCS.find(n=>n.id===target);const p=n?{x:n.x*2,y:n.y*2}:target==='deepforest'?{x:1860,y:420}:target==='boar_clearing'?{x:1344,y:930}:target==='forest'?{x:1304,y:730}:target==='hunting'?{x:1220,y:610}:target==='workshop'?{x:920,y:616}:null;if(p){this.waymark.lineStyle(2,0xffedac,.8);this.waymark.strokeCircle(p.x,p.y-12,25+Math.sin(time/300)*3);if(Math.hypot(this.hero.x-p.x,this.hero.y-p.y)>180){const angle=Math.atan2(p.y-this.hero.y,p.x-this.hero.x);const ax=this.hero.x+Math.cos(angle)*55,ay=this.hero.y-15+Math.sin(angle)*55;this.waymark.fillStyle(0xffe5a0,.9);this.waymark.fillTriangle(ax+Math.cos(angle)*8,ay+Math.sin(angle)*8,ax+Math.cos(angle+2.3)*7,ay+Math.sin(angle+2.3)*7,ax+Math.cos(angle-2.3)*7,ay+Math.sin(angle-2.3)*7);}}}
 }
}
