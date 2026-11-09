// Friendly village animals are scenery and interactions, separate from huntable wildlife.
export const VILLAGE_PETS=[
 {id:'mochi',name:'โมจิ · คอร์กี้',kind:'corgi',x:750,y:850,scale:1.2,message:'โมจิกระดิกหางอย่างดีใจ!'},
 {id:'pudding',name:'พุดดิ้ง · แมวน้อย',kind:'kitten',x:600,y:820,scale:1.15,message:'พุดดิ้งส่งเสียงครางเบา ๆ แล้วนอนขดต่อ'},
 {id:'cotton',name:'ปุยฝ้าย · กระต่าย',kind:'petbunny',x:560,y:1150,scale:1.1,message:'ปุยฝ้ายกระดิกหูทักทายคุณ'},
 {id:'mama_duck',name:'ก๊าบก๊าบ · แม่เป็ด',kind:'duck',x:1560,y:1220,scale:1.15,message:'ก๊าบก๊าบ! แม่เป็ดทักทายอย่างอารมณ์ดี'},
 {id:'duckling_a',name:'จิ๊บ · ลูกเป็ด',kind:'duckling',x:1510,y:1230,scale:.85,message:'จิ๊บ ๆ ลูกเป็ดตัวน้อยดีใจที่ได้เจอคุณ'},
 {id:'duckling_b',name:'จ้อย · ลูกเป็ด',kind:'duckling',x:1538,y:1250,scale:.85,message:'จ้อยเดินเตาะแตะมาทักทาย'}
];
export const PET_WIDTH=48,PET_HEIGHT=40;
export function drawPet(ctx,kind,frame=0){
 ctx.clearRect(0,0,PET_WIDTH,PET_HEIGHT);const ink='#614b3b',cream='#fff2d7',shade='#dfc5a3',pink='#e5a19b',orange='#e8a357';
 const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 function p(points,c){for(let y=Math.min(...points.map(p=>p[1]));y<Math.max(...points.map(p=>p[1]));y++){const cuts=[];for(let i=0;i<points.length;i++){const [x1,y1]=points[i],[x2,y2]=points[(i+1)%points.length];if((y1<=y+.5&&y2>y+.5)||(y2<=y+.5&&y1>y+.5))cuts.push(x1+(y+.5-y1)/(y2-y1)*(x2-x1));}cuts.sort((a,b)=>a-b);for(let i=0;i<cuts.length;i+=2)r(Math.ceil(cuts[i]),y,Math.floor(cuts[i+1])-Math.ceil(cuts[i])+1,1,c);}}
 if(kind==='corgi'){
  p([[6,18],[12,16],[30,17],[36,23],[34,34],[10,35],[5,30]],ink);p([[8,20],[13,18],[29,19],[33,24],[31,32],[11,33],[7,29]],orange);
  r(9,28,22,5,cream);r(10,32,7,5,ink);r(11,32,5,3,cream);r(27,32,7,5,ink);r(28,32,5,3,cream);
  p([[8,23],[3,22-(frame?3:0)],[2,17-(frame?3:0)],[5,15-(frame?3:0)],[10,20]],ink);r(4,18-(frame?3:0),4,4,cream);
  p([[23,17],[22,6],[25,3],[31,10],[35,9],[40,3],[43,5],[43,19],[45,23],[42,29],[34,32],[26,30],[21,25]],ink);
  p([[25,17],[24,7],[26,6],[31,12],[36,11],[40,6],[41,7],[41,20],[43,23],[40,27],[34,30],[27,28],[23,24]],orange);
  r(25,9,2,6,pink);r(39,9,2,6,pink);p([[32,12],[35,12],[36,21],[41,22],[41,27],[34,30],[27,27],[27,22],[31,20]],cream);
  r(27,19,2,4,ink);r(38,19,2,4,ink);r(33,24,3,2,ink);r(32,27,5,1,ink);r(34,28,2,2,pink);
  r(24,24,3,2,pink);r(40,24,2,2,pink);r(26,30,13,2,'#bd6c68');r(32,31,3,3,'#efcd72');r(13,21,7,2,'#f5c588');
 }else if(kind==='kitten'){
  p([[16,18],[28,15],[38,18],[44,24],[44,30],[39,35],[18,36],[10,32]],ink);p([[17,20],[28,17],[37,20],[42,25],[42,30],[38,33],[19,34],[13,31]],cream);
  p([[39,22],[45,23],[46,28],[43,32],[32,33],[28,29],[31,26],[36,28],[40,28]],ink);p([[39,24],[43,25],[44,28],[41,30],[33,31],[30,29],[32,28],[36,30],[41,28]],shade);
  p([[5,20],[5,8],[8,5],[15,11],[20,10],[25,5],[28,8],[28,20],[30,26],[24,31],[12,32],[5,28],[3,24]],ink);
  p([[7,20],[7,10],[9,8],[14,14],[21,12],[25,8],[26,10],[26,21],[28,25],[23,29],[12,30],[7,27],[5,24]],cream);
  r(8,11,3,5,pink);r(23,11,3,5,pink);r(14,13,3,5,shade);r(18,12,2,5,shade);
  if(frame){r(10,21,2,3,ink);r(23,21,2,3,ink);}else{r(9,23,4,1,ink);r(10,22,2,1,ink);r(21,23,4,1,ink);r(22,22,2,1,ink);}
  r(16,24,3,2,pink);r(17,26,1,1,ink);r(15,27,5,1,ink);r(7,25,4,1,pink);r(23,25,4,1,pink);r(11,30,8,3,shade);r(12,30,6,2,cream);
 }else if(kind==='petbunny'){
  p([[12,22],[10,9],[12,2],[16,2],[20,17],[26,18],[29,3],[33,3],[36,10],[32,23],[36,29],[33,36],[13,37],[8,32]],ink);
  p([[14,22],[12,9],[13,4],[15,4],[18,20],[28,20],[31,5],[32,5],[34,10],[30,24],[34,29],[31,34],[14,35],[10,31]],cream);
  r(14,7,2,10,pink);r(31,8,2,10,pink);r(15,25,2,4,ink);r(27,25,2,4,ink);r(20,29,4,2,pink);r(21,31,2,1,ink);r(11,29,4,2,pink);r(28,29,4,2,pink);r(14,34,7,2,shade);r(27,33,5,2,shade);if(frame)r(34,27,4,4,cream);
 }else if(kind==='duck'||kind==='duckling'){
  const baby=kind==='duckling',feather=baby?'#f6d56c':cream,shadow=baby?'#dca94e':shade;
  p([[9,22],[12,17],[26,16],[29,10],[33,7],[40,8],[43,12],[42,21],[45,23],[42,26],[35,27],[31,34],[17,36],[8,32],[5,26],[4,21]],ink);
  p([[10,24],[14,19],[28,18],[31,11],[34,9],[39,10],[41,13],[40,22],[36,25],[30,32],[17,34],[10,30],[7,25],[7,24]],feather);
  r(40,20,7,3,orange);r(37,15,2,3,ink);r(34,21,3,2,pink);
  p([[13,23],[23,21],[28,24],[26,29],[18,31],[13,28]],shadow);r(15,23,8,2,feather);r(16,35,8,2,orange);r(27,34,7,2,orange);if(frame)r(7,22,4,2,feather);
 }
}
export function petCanvas(kind,frame=0){const c=document.createElement('canvas');c.width=PET_WIDTH;c.height=PET_HEIGHT;drawPet(c.getContext('2d'),kind,frame);return c;}
