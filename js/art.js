/* ===== Art: every token icon and the gift box is drawn here in code ===== */
const PCOL=['#ff5d73','#4cc9f0','#ffb703','#2ec4a6'];
const ICONS=[{id:'horse',n:'Kuda'},{id:'cat',n:'Kucing'},{id:'dog',n:'Anjing'},{id:'rabbit',n:'Kelinci'},{id:'fish',n:'Ikan'},
  {id:'chick',n:'Ayam'},{id:'star',n:'Bintang'},{id:'heart',n:'Hati'},{id:'crown',n:'Mahkota'},{id:'rocket',n:'Roket'}];
const INK='#14233d';
const poly=(c,p)=>{c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();c.fill();};
const ell=(c,x,y,rx,ry,rot)=>{c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,Math.PI*2);c.fill();};
const dot=(c,x,y,r)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
const DRAW={
  horse(c){
    c.fillStyle='#fff';c.beginPath();c.moveTo(30,92);c.lineTo(33,52);c.lineTo(38,24);c.lineTo(46,10);c.lineTo(52,26);c.lineTo(62,30);
    c.quadraticCurveTo(76,40,86,58);c.quadraticCurveTo(90,68,80,72);c.lineTo(68,68);c.quadraticCurveTo(60,76,62,92);c.closePath();c.fill();
    c.fillStyle=INK;c.globalAlpha=.8;poly(c,[30,92,33,52,38,24,46,10,44,40,40,62,42,92]);c.globalAlpha=1;
    dot(c,60,42,3.6);dot(c,80,62,2.2);
  },
  cat(c){
    c.fillStyle='#fff';poly(c,[22,44,26,10,46,28]);poly(c,[78,44,74,10,54,28]);dot(c,50,58,30);
    c.fillStyle='#ffb3c1';poly(c,[30,36,31,22,40,30]);poly(c,[70,36,69,22,60,30]);
    c.fillStyle=INK;dot(c,39,54,4.2);dot(c,61,54,4.2);poly(c,[45,63,55,63,50,69]);
    c.strokeStyle=INK;c.lineWidth=2;c.lineCap='round';c.beginPath();
    c.moveTo(30,64);c.lineTo(11,60);c.moveTo(30,70);c.lineTo(11,74);c.moveTo(70,64);c.lineTo(89,60);c.moveTo(70,70);c.lineTo(89,74);c.stroke();
  },
  dog(c){
    c.fillStyle=INK;ell(c,22,52,10,22,.25);ell(c,78,52,10,22,-.25);
    c.fillStyle='#fff';ell(c,50,52,25,28);c.fillStyle='#dfe8f5';ell(c,50,68,14,11);
    c.fillStyle=INK;dot(c,40,46,4);dot(c,60,46,4);ell(c,50,62,6.5,4.5);
    c.fillStyle='#ff8fa3';ell(c,50,78,4.5,5);
  },
  rabbit(c){
    c.fillStyle='#fff';ell(c,37,26,8.5,24,-.12);ell(c,63,26,8.5,24,.12);ell(c,50,64,25,24);
    c.fillStyle='#ffb3c1';ell(c,37,27,4,17,-.12);ell(c,63,27,4,17,.12);dot(c,50,70,3.4);
    c.fillStyle=INK;dot(c,41,62,3.8);dot(c,59,62,3.8);
  },
  fish(c){
    c.fillStyle='#fff';ell(c,44,50,31,21);poly(c,[68,50,94,26,94,74]);poly(c,[40,32,56,32,50,17]);poly(c,[42,68,56,68,50,82]);
    c.fillStyle=INK;dot(c,27,44,4);c.strokeStyle=INK;c.lineWidth=3;c.lineCap='round';c.beginPath();c.arc(38,50,13,-0.9,0.9);c.stroke();
  },
  chick(c){
    c.fillStyle='#fff';dot(c,50,56,32);poly(c,[46,26,50,8,56,26]);poly(c,[38,28,36,14,46,26]);
    c.fillStyle='#ffb703';poly(c,[42,58,58,58,50,71]);
    c.fillStyle=INK;dot(c,38,46,4);dot(c,62,46,4);c.fillStyle='#ffc4cf';ell(c,27,60,6,4);ell(c,73,60,6,4);
  },
  star(c){
    c.fillStyle='#fff';c.beginPath();
    for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?21:47,x=50+Math.cos(a)*r,y=55+Math.sin(a)*r;if(i)c.lineTo(x,y);else c.moveTo(x,y);}
    c.closePath();c.fill();
  },
  heart(c){
    c.fillStyle='#fff';c.beginPath();c.moveTo(50,86);c.bezierCurveTo(8,56,12,18,38,18);c.bezierCurveTo(46,18,50,26,50,32);
    c.bezierCurveTo(50,26,54,18,62,18);c.bezierCurveTo(88,18,92,56,50,86);c.closePath();c.fill();
  },
  crown(c){
    c.fillStyle='#fff';poly(c,[12,74,8,30,32,50,50,20,68,50,92,30,88,74]);c.fillRect(12,74,76,12);
    c.fillStyle=INK;dot(c,50,58,4.5);dot(c,28,64,3.4);dot(c,72,64,3.4);
  },
  rocket(c){
    c.fillStyle='#ffb703';poly(c,[42,74,58,74,50,95]);
    c.fillStyle='#fff';poly(c,[34,58,16,80,34,76]);poly(c,[66,58,84,80,66,76]);
    c.beginPath();c.moveTo(50,8);c.quadraticCurveTo(76,34,68,74);c.lineTo(32,74);c.quadraticCurveTo(24,34,50,8);c.closePath();c.fill();
    c.fillStyle=INK;dot(c,50,42,9.5);c.fillStyle='#4cc9f0';dot(c,50,42,6);
  }
};
function makeToken(icon,color,size,img){
  const cv=document.createElement('canvas');cv.width=cv.height=size;const c=cv.getContext('2d'),R=size/2;
  c.fillStyle='#ffffff';dot(c,R,R,R-1);
  c.fillStyle=color;dot(c,R,R,R-size*0.05);
  if(img){
    c.save();c.beginPath();c.arc(R,R,R-size*0.09,0,Math.PI*2);c.clip();
    const s=Math.min(img.width,img.height),sx=(img.width-s)/2,sy=(img.height-s)/2;
    c.drawImage(img,sx,sy,s,s,size*0.09,size*0.09,size*0.82,size*0.82);c.restore();
  }else if(DRAW[icon]){
    c.save();const k=(size*0.62)/100;c.translate(R-50*k,R-50*k+size*0.01);c.scale(k,k);DRAW[icon](c);c.restore();
  }
  c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=Math.max(1.5,size*0.03);c.beginPath();c.arc(R,R,R-size*0.05,0,Math.PI*2);c.stroke();
  c.fillStyle='rgba(255,255,255,.2)';c.beginPath();c.ellipse(R*0.78,R*0.5,R*0.5,R*0.26,-0.5,0,Math.PI*2);c.fill();
  return cv;
}
function makeGift(size){
  const cv=document.createElement('canvas');cv.width=cv.height=size;const c=cv.getContext('2d'),k=size/100;c.scale(k,k);
  c.fillStyle='rgba(0,0,0,.2)';ell(c,52,90,34,7);
  c.fillStyle='#ff5d73';c.fillRect(16,44,68,42);c.fillStyle='#e0445c';c.fillRect(16,76,68,10);
  c.fillStyle='#ff7a8c';c.fillRect(10,32,80,18);
  c.fillStyle='#ffd166';c.fillRect(44,32,12,54);
  c.beginPath();c.ellipse(36,24,15,10,-.5,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(64,24,15,10,.5,0,Math.PI*2);c.fill();
  c.fillStyle='#ffb703';dot(c,50,28,7);
  c.fillStyle='#fff';c.globalAlpha=.9;ell(c,28,60,4,9,.2);c.globalAlpha=1;
  return cv;
}
function cropPhoto(img){
  const cv=document.createElement('canvas');cv.width=cv.height=192;const c=cv.getContext('2d');
  const s=Math.min(img.width,img.height);c.drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,192,192);return cv;
}

/* Dice face drawn inside a player's corner panel */
function drawDieFace(cv,v,ready){
  const c=cv.getContext('2d'),s=cv.width,k=s/100;
  c.clearRect(0,0,s,s);c.save();c.scale(k,k);
  const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],
    5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
  if(ready)c.globalAlpha=0.16;
  (P[v]||[]).forEach(([x,y])=>{c.fillStyle=v===1?'#ff5d73':'#14233d';c.beginPath();c.arc(50+x*26,50+y*26,v===1?14:10,0,Math.PI*2);c.fill();});
  c.globalAlpha=1;
  if(ready){c.fillStyle='#14233d';c.font='800 21px Nunito,system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('LEMPAR',50,52);}
  c.restore();
}
