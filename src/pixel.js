// Layered 48×64 chibi sprites. Keep palette and silhouette editable at runtime.
export const PERSON_WIDTH=48,PERSON_HEIGHT=64,PERSON_SCALE=1.05;
function tone(hex,target,amount){const a=hex.replace('#',''),b=target.replace('#','');return '#'+[0,2,4].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-amount)+parseInt(b.slice(i,i+2),16)*amount).toString(16).padStart(2,'0')).join('');}
export function drawPerson(ctx,look={},frame=0,dir='down'){
 const {skin='#edb98d',hair='#513a30',shirt='#77a58d',pants='#44576c',hairstyle='short',outfit='tunic',accessory='none'}=look;
 const ink='#49392f',cream='#fff0ce',leather='#94613c',gold='#edc767';
 const hs=tone(hair,'#382a30',.34),hl=tone(hair,'#efc586',.32),hm=tone(hair,'#e6b374',.15),ss=tone(skin,'#9f5d50',.28),sl=tone(skin,'#fff1d0',.28),cs=tone(shirt,'#35483c',.3),cl=tone(shirt,'#fff1bf',.28),ps=tone(pants,'#2f3037',.3);
 const side=dir==='left'||dir==='right',back=dir==='up',flip=dir==='left',bob=frame===2?-1:0,step=frame===1?1:frame===2?-1:0;
 ctx.clearRect(0,0,PERSON_WIDTH,PERSON_HEIGHT);
 let part='head';
 const r=(x,y,w,h,c)=>{const scale=part==='head'?1.1:.94,tx=v=>Math.round(24+(v-24)*scale),ty=v=>Math.round(part==='head'?4+v*1.12:42+(v-34)*.7);const left=tx(x),right=tx(x+w),top=ty(y),bottom=ty(y+h);ctx.fillStyle=c;ctx.fillRect(flip?48-right:left,top,Math.max(1,right-left),Math.max(1,bottom-top));};
 // Integer scanlines keep edges crisp, including the diagonal bag strap and hair tufts.
 function poly(points,color,dy=0){const min=Math.min(...points.map(p=>p[1])),max=Math.max(...points.map(p=>p[1]));for(let y=min;y<max;y++){const cuts=[];for(let i=0;i<points.length;i++){const [x1,y1]=points[i],[x2,y2]=points[(i+1)%points.length];if((y1<=y+.5&&y2>y+.5)||(y2<=y+.5&&y1>y+.5))cuts.push(x1+(y+.5-y1)/(y2-y1)*(x2-x1));}cuts.sort((a,b)=>a-b);for(let i=0;i<cuts.length;i+=2)r(Math.ceil(cuts[i]),y+dy,Math.floor(cuts[i+1])-Math.ceil(cuts[i])+1,1,color);}}
 const body=(points,color)=>poly(points,color,bob),b=(x,y,w,h,c)=>r(x,y+bob,w,h,c);
 // Hair behind shoulders and head.
 if(hairstyle==='long'){
  body([[9,12],[38,12],[39,25],[42,44],[36,47],[31,44],[13,45],[7,42]],ink);
  body([[11,14],[36,14],[37,28],[39,42],[34,44],[31,40],[13,43],[9,40]],hs);b(11,25,3,14,hm);b(35,26,2,13,hair);
 }
 if(hairstyle==='ponytail'){
  body([[32,10],[41,12],[45,21],[43,32],[39,39],[33,35],[36,24],[32,19]],ink);
  body([[34,12],[40,14],[43,21],[41,31],[38,36],[35,34],[38,23]],hair);b(39,18,2,10,hl);b(34,15,8,3,gold);
 }
 if(hairstyle==='pigtails')for(const x of [2,36]){
  body([[x+1,15],[x+8,13],[x+11,20],[x+9,31],[x+6,37],[x+1,34],[x,24]],ink);
  body([[x+2,17],[x+7,15],[x+9,21],[x+7,31],[x+5,34],[x+2,32]],hair);b(x+3,19,2,10,hl);b(x+1,18,9,3,'#e68c84');b(x+3,18,3,1,'#ffd8bb');
 }
 part='body';
 // Boots and trousers have alternating walk poses without changing the foot anchor.
 for(const [x,s]of [[15,Math.max(0,step)],[26,Math.max(0,-step)]]){
  r(x,49,8,9+s,ink);r(x+1,49,6,6,pants);r(x+5,50,2,6,ps);
  r(x-1,55+s,10,7,ink);r(x,55+s,8,5,leather);r(x,55+s,7,1,'#c29460');r(x-1,60+s,10,2,'#543e32');r(x,59+s,3,1,'#b17e4d');
 }
 // Cream sleeves, shaded cuffs, small mitten hands.
 for(const [x,s]of [[7,step],[35,-step]]){
  body([[x+3,35+s],[x+7,36+s],[x+8,43+s],[x+6,47+s],[x,46+s],[x-1,42+s]],ink);
  b(x+1,37+s,6,7,cream);b(x+5,39+s,2,5,'#d7ba92');b(x,43+s,7,2,'#ead6b0');
  b(x+1,45+s,6,5,ss);b(x+1,45+s,5,3,skin);b(x+2,45+s,2,1,sl);
 }
 // Body, collar and tailored outfit.
 body([[17,32],[31,32],[36,37],[35,51],[13,51],[12,38]],ink);
 b(17,33,14,4,ss);body([[17,35],[30,35],[34,39],[33,50],[15,50],[14,39]],shirt);b(16,38,4,9,cl);b(30,39,3,11,cs);
 if(outfit==='tunic'){
  body([[17,34],[23,37],[20,42],[15,38]],cream);body([[30,34],[24,37],[27,41],[33,38]],cream);
  b(23,38,2,12,cs);b(24,40,1,1,gold);b(24,44,1,1,gold);
  b(14,48,20,3,ink);b(15,48,18,2,leather);b(22,48,4,3,gold);b(23,49,2,1,'#805638');
  // Cross-body strap and a leaf-marked satchel.
  if(!back){body([[29,34],[32,35],[19,51],[16,49]],ink);body([[29,35],[31,36],[18,50],[17,49]],leather);
   b(10,47,11,9,ink);b(11,48,9,7,'#c79a57');b(11,48,9,2,'#ebc578');b(13,51,5,3,'#69925c');b(14,51,3,1,'#9dbe73');b(15,50,1,4,'#d9d99a');}
 }else if(outfit==='overalls'){
  b(17,35,3,12,ps);b(29,35,3,12,ps);b(18,36,1,7,tone(pants,'#f0e2af',.35));
  b(18,41,13,10,pants);b(28,42,3,9,ps);b(19,42,2,2,gold);b(28,42,2,2,gold);b(22,45,6,4,ps);b(22,45,6,1,tone(pants,'#f5dfaf',.42));
 }else{
  body([[16,43],[32,43],[38,54],[35,56],[12,56],[10,54]],ink);
  body([[17,43],[31,43],[35,53],[32,54],[14,54],[12,53]],shirt);b(14,51,3,3,cl);b(31,50,3,4,cs);
  body([[20,38],[29,38],[30,48],[33,53],[17,53],[19,48]],cream);b(29,43,1,8,'#dcc9a3');b(20,47,8,1,'#dac8a4');
  b(16,42,17,2,'#f1d69b');b(22,41,5,4,cs);b(20,41,3,3,cl);b(27,41,3,3,cl);
 }
 if(back){b(17,35,14,12,'#9a7047');b(18,36,12,3,'#cea15e');b(20,40,8,5,'#b1844f');b(23,39,2,5,gold);b(17,46,14,2,ink);}
 if(look.id==='ray'&&!back){body([[15,34],[33,34],[28,39],[22,38]],'#dfad62');b(29,37,3,6,'#edc575');}
 if(look.id==='phum'&&!back){b(19,37,11,12,cream);b(19,37,2,12,'#e4cfa9');b(22,43,6,3,'#dac69f');}
 if(look.id==='fah'&&!back){b(31,46,5,7,leather);b(33,42,2,7,'#b5bfba');b(31,41,6,2,'#d8e0cd');}
 if(look.id==='dao'&&!back){b(23,37,4,4,'#d8bd6a');b(24,38,2,2,'#7bb49c');}
 part='head';
 // Rounded, oversized head; warm shadow to the right and under the cheeks.
 body([[13,9],[34,9],[40,16],[40,27],[36,32],[31,35],[17,35],[11,32],[7,26],[7,17]],ink);
 body([[14,10],[33,10],[38,16],[38,27],[34,31],[30,33],[18,33],[12,30],[9,25],[9,17]],skin);
 b(12,15,3,9,sl);b(15,13,15,3,sl);b(36,18,2,10,ss);b(13,30,5,2,ss);b(18,32,13,1,ss);
 b(6,21,4,6,ink);b(7,22,3,4,skin);b(8,23,1,2,ss);b(38,21,4,6,ink);b(38,22,3,4,skin);b(39,23,1,2,ss);
 // Hair crown uses stepped clusters with a light source at the upper left.
 body([[8,21],[5,16],[7,10],[11,6],[16,6],[18,3],[24,5],[29,3],[29,6],[35,6],[40,10],[39,14],[41,17],[38,23],[33,18],[12,22]],ink);
 body([[9,19],[7,16],[9,11],[13,8],[17,8],[19,5],[24,7],[28,5],[28,8],[34,8],[38,11],[37,15],[39,17],[37,21],[32,16],[13,20]],hair);
 body([[12,11],[17,9],[18,6],[22,8],[28,6],[28,9],[33,8],[31,12],[23,13],[18,16],[12,15]],hm);
 b(13,10,5,2,hl);b(20,7,4,2,hl);b(25,9,4,2,hl);b(10,13,3,2,hm);
 if(back){body([[10,15],[36,14],[38,23],[35,29],[30,32],[17,32],[11,28]],hair);b(13,19,3,9,hm);b(17,29,14,3,hs);b(33,19,3,9,hs);b(18,16,9,2,hl);}
 else{
  if(hairstyle==='short'){body([[10,15],[19,13],[18,19],[22,17],[24,12],[29,14],[30,20],[34,17],[37,19],[35,23],[32,22],[31,19],[26,20],[23,18],[20,22],[17,20],[14,23],[12,20],[9,23]],hs);body([[10,15],[19,13],[17,19],[21,17],[24,12],[29,14],[30,19],[34,16],[37,18],[34,21],[31,18],[27,18],[23,16],[19,20],[16,18],[12,21]],hair);}
  else{body([[10,14],[20,12],[30,13],[37,16],[36,23],[32,21],[31,16],[29,21],[24,19],[21,17],[18,22],[14,20],[11,25],[9,23]],hs);body([[11,14],[20,12],[29,13],[36,16],[35,21],[32,19],[31,15],[28,19],[24,17],[21,15],[18,20],[14,18],[11,23]],hair);b(12,16,2,4,hm);}
  if(side){b(11,18,10,11,hair);b(12,18,4,9,hm);b(20,23,2,4,hs);b(29,23,3,5,'#332e32');b(29,23,1,1,'#fff4d7');b(36,28,2,2,'#c78370');b(33,30,2,1,'#915b53');}
  else{
   b(15,23,2,5,'#332e32');b(29,23,2,5,'#332e32');b(15,23,1,1,'#fff4d7');b(29,23,1,1,'#fff4d7');
   b(11,28,5,2,tone(skin,'#e98180',.54));b(32,28,5,2,tone(skin,'#e98180',.54));b(22,29,6,1,'#86554d');b(23,30,4,2,'#af6962');b(24,31,2,1,'#efaa95');
   if(look.age==='elder'){b(13,22,6,1,hs);b(28,22,6,1,hs);b(14,28,3,1,ss);b(30,28,3,1,ss);}
  }
 }
 if(hairstyle==='bun'){
  body([[18,3],[19,0],[28,0],[31,3],[30,8],[20,8]],ink);b(20,2,8,5,hair);b(21,2,5,2,hl);b(19,7,12,2,gold);
 }
 if(look.id==='mina'){b(8,16,7,3,'#f4bbbd');b(9,14,3,7,'#f4bbbd');b(10,16,3,2,'#fff0d2');}
 if(look.id==='mali'){b(34,17,5,3,'#fff0c7');b(35,16,3,5,'#fff0c7');b(35,18,2,2,gold);}
 // Oversized accessories are shared by portraits and every movement direction.
 if(accessory==='straw'){
  body([[13,3],[33,3],[36,9],[43,11],[44,15],[38,17],[9,17],[3,15],[4,12],[10,10]],ink);
  body([[14,4],[32,4],[35,11],[40,12],[41,14],[37,15],[10,15],[5,14],[6,13],[12,11]],'#e7bb72');
  b(14,5,16,2,'#ffe2a0');b(11,10,25,3,'#8b6742');b(10,13,29,1,'#ffe4a2');b(30,9,5,4,'#8fb25e');b(32,8,3,2,'#bedb80');
 }
 if(accessory==='leafcap'){
  body([[8,12],[10,6],[16,2],[31,2],[37,6],[39,12],[43,15],[39,18],[29,15],[11,16]],ink);
  body([[10,12],[12,7],[17,4],[30,4],[35,7],[37,12],[40,15],[37,16],[29,13],[12,14]],'#498450');
  b(15,5,14,2,'#74ae67');b(11,12,27,3,'#edc676');
  body([[12,8],[8,5],[4,5],[7,8],[12,10],[16,10]],'#fff0c7');b(7,6,5,1,'#dfc49a');
  body([[27,7],[31,4],[36,4],[34,8],[28,10]],'#b5d774');b(29,8,5,1,'#477e4e');
 }
 if(accessory==='goggles'){
  b(7,9,33,4,ink);b(8,10,31,2,leather);
  for(const x of [10,26]){b(x,6,12,11,ink);b(x+1,7,10,9,'#d8ab61');b(x+3,8,7,6,'#88c9da');b(x+3,8,6,2,'#e3fcf6');b(x+8,10,2,4,'#5da2bf');}b(22,10,4,2,gold);
 }
 if(accessory==='ribbon'){
  b(7,12,32,3,'#fff0db');body([[11,11],[6,7],[3,8],[4,14],[11,15]],'#a64d65');body([[12,11],[16,7],[20,8],[19,14],[12,15]],'#a64d65');
  b(5,9,5,4,'#ed9da9');b(14,9,4,4,'#f5b2bb');b(10,10,4,5,'#c56e88');b(11,10,2,2,'#ffcfcc');
 }
}

export function personCanvas(look,frame,dir){const c=document.createElement('canvas');c.width=PERSON_WIDTH;c.height=PERSON_HEIGHT;drawPerson(c.getContext('2d'),look,frame,dir);return c;}
export function propCanvas(kind){const c=document.createElement('canvas');c.width=24;c.height=24;const g=c.getContext('2d'),r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};r(3,21,18,2,'#264e352d');
 switch(kind){
 case 'berry':r(4,8,16,12,'#508756');r(2,12,20,6,'#6d9b5b');for(const [x,y]of [[6,11],[13,9],[16,15],[9,17]]){r(x,y,3,3,'#bd6e74');r(x,y,1,1,'#f0a58f');}break;
 case 'wheat':for(let x=5;x<22;x+=6){r(x,7,1,15,'#ab8d49');for(let y=6;y<15;y+=3){r(x-2,y,2,2,'#e1c16c');r(x+1,y+1,2,2,'#d1ad5f');}}break;
 case 'wood':r(3,11,18,9,'#8b694b');r(4,10,15,3,'#aa8355');r(3,11,5,9,'#d3af76');r(4,13,3,5,'#997748');r(10,14,10,1,'#644e3d');break;
 case 'herb':r(11,11,2,10,'#638c56');r(3,10,8,4,'#80a86c');r(13,6,8,5,'#86af74');r(6,4,6,5,'#a0c485');break;
 case 'fiber':r(11,8,1,14,'#698d55');r(6,12,5,3,'#87aa67');r(9,3,6,7,'#dbc3c6');r(7,6,10,4,'#ede1cc');r(11,5,2,3,'#dbbe76');break;
 case 'ore':r(3,13,18,8,'#818f89');r(6,9,12,11,'#a6b2a3');r(8,6,5,10,'#b3a3cf');r(13,10,4,9,'#d1c4de');r(9,7,1,6,'#e8e2f2');break;
 case 'water':r(4,13,16,8,'#99b9b6');r(3,11,18,3,'#c1c7aa');r(7,12,10,3,'#78afb8');r(11,3,3,7,'#b0d4dc');r(10,6,5,4,'#87bcc8');break;
 case 'slime':r(4,11,16,9,'#5f9e7a');r(6,7,12,12,'#87c49b');r(8,6,8,12,'#a7d3a7');r(8,12,2,2,'#3d6150');r(14,12,2,2,'#3d6150');r(6,16,3,1,'#d0dca4');r(15,16,3,1,'#d0dca4');break;
 case 'mushroom':r(8,12,9,9,'#dfd7b9');r(4,6,17,8,'#b97f88');r(2,10,21,4,'#cf9594');r(7,7,3,2,'#f0d5b7');r(15,9,3,2,'#f0d5b7');r(10,16,1,2,'#6c5a51');r(15,16,1,2,'#6c5a51');break;
 case 'golem':r(5,6,15,14,'#949f96');r(8,3,9,6,'#adb4a1');r(3,10,4,8,'#7e9184');r(19,10,3,8,'#7e9184');r(8,20,4,3,'#6c8177');r(15,20,4,3,'#6c8177');r(9,10,2,2,'#c7b58c');r(15,10,2,2,'#c7b58c');r(12,15,4,1,'#53695d');break;
 case 'chicken':r(5,12,14,8,'#bb9d6d');r(8,9,10,10,'#dfc59a');r(13,6,7,8,'#edd8b3');r(13,4,3,3,'#be7564');r(17,4,2,4,'#cc8971');r(19,10,4,2,'#d7a557');r(17,8,1,2,'#4e5540');r(5,10,5,5,'#a57e58');r(3,8,4,4,'#805f49');r(8,20,1,3,'#af8850');r(15,20,1,3,'#af8850');r(9,14,5,3,'#bda06d');break;
 case 'boar':r(4,10,15,10,'#7d6653');r(5,8,12,10,'#9a7f60');r(15,11,7,8,'#8c735a');r(19,14,5,5,'#bb9b75');r(5,18,3,5,'#5a5142');r(14,18,3,5,'#5a5142');r(6,6,3,5,'#755b49');r(14,7,3,4,'#755b49');r(17,12,2,2,'#3c4439');r(20,15,1,2,'#65513f');r(17,18,2,3,'#e7d9b6');r(3,11,2,5,'#624e40');r(7,10,7,2,'#b29770');break;
 case 'bunny':r(6,13,12,8,'#dcd9c1');r(7,9,10,9,'#f0e9d3');r(7,3,3,9,'#e6dfc9');r(13,3,3,9,'#e6dfc9');r(8,5,1,5,'#d4a4a4');r(14,5,1,5,'#d4a4a4');r(9,14,1,1,'#6c6759');r(15,14,1,1,'#6c6759');r(12,17,1,1,'#b9908a');break;
 case 'deer':r(6,12,13,6,'#ba9b74');r(4,8,6,8,'#caad83');r(4,6,2,4,'#bda17a');r(9,6,2,4,'#bda17a');r(7,17,2,6,'#8e7859');r(16,17,2,6,'#8e7859');r(5,10,1,1,'#4d5945');r(11,13,2,1,'#eedabc');break;
 case 'bird':r(7,12,11,6,'#7f9eaf');r(12,9,6,6,'#9cb7bb');r(17,12,3,2,'#d8b96d');r(15,10,1,1,'#455f65');r(5,13,7,3,'#638294');r(11,17,1,3,'#9a8d6d');break;
 case 'butterfly':r(4,7,6,6,'#c6a4cf');r(14,7,6,6,'#c6a4cf');r(6,13,4,5,'#ddbed8');r(14,13,4,5,'#ddbed8');r(11,9,2,10,'#837894');break;
 }return c;}
