/* ===== Board, snakes, ladders (drawn and animated every frame) ===== */
const M=6,TK=192;
let WW=720,WH=720,Sx=68.4,Sy=68.4,VW=720,VH=720,ZIN=2,ZOUT=1,AR=1;
/* Board shape: tall tiles (ratio 0.7) in portrait, square in landscape. Re-run before each new game. */
function setDims(){
  const land=window.innerWidth>window.innerHeight,bh=Math.max(window.innerHeight/15,46);
  AR=Math.max(0.4,Math.min(1.9,window.innerWidth/Math.max(100,window.innerHeight-bh)));
  const box=Math.min(window.innerWidth,(window.innerHeight-bh)*AR);
  VW=Math.round(Math.max(720,Math.min(land?1080:960,box*Math.min(window.devicePixelRatio||1,2.5)))/10)*10;
  WW=720;WH=Math.round(WW/AR);VH=Math.round(VW/AR);
  Sx=(WW-2*M)/10;Sy=(WH-2*M)/10;ZOUT=VW/WW;ZIN=ZOUT*2;
  document.documentElement.style.setProperty('--ar',String(AR));
}
setDims();
const LADDERS={},SNAKES={},GIFTS=[];
const DIFF={easy:{L:9,S:5,G:10},medium:{L:7,S:7,G:8},hard:{L:5,S:9,G:5}};
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function ptSeg(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function segDist(a,b,c,d){
  const o=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
  if(o(a,b,c)*o(a,b,d)<0&&o(c,d,a)*o(c,d,b)<0)return 0;
  return Math.min(ptSeg(a,c,d),ptSeg(b,c,d),ptSeg(c,a,b),ptSeg(d,a,b));
}
/* Ladders, snakes and gift boxes on distinct cells, with ladders and snakes kept apart so none cross.
   rand=false gives the same layout every time for a difficulty; rand=true a fresh one. */
function applyLayout(rand,diff){
  const D=DIFF[diff]||DIFF.medium,rng=rand?Math.random:mulberry(7+Object.keys(DIFF).indexOf(diff in DIFF?diff:'medium')*101),
    ri=(a,b)=>a+Math.floor(rng()*(b-a+1)),row=n=>Math.floor((n-1)/10);
  let best=null;
  for(const thr of[46,38,30,22,14,6]){
    const L={},S={},Gf=[],used=new Set([1,100]),segs=[];
    const fits=(n1,n2,snake)=>{const A=cell(n1),B=cell(n2);
      return segs.every(sg=>segDist(A,B,sg.A,sg.B)>=thr+(snake?14:0)+(sg.snake?14:0));};
    const add=(n1,n2,snake)=>{segs.push({A:cell(n1),B:cell(n2),snake});used.add(n1);used.add(n2);};
    let k=0;
    while(Object.keys(L).length<D.L&&k++<2500){const a=ri(2,88),b=a+ri(10,32);if(b>99||row(b)<=row(a)||used.has(a)||used.has(b)||!fits(a,b,false))continue;L[a]=b;add(a,b,false);}
    k=0;while(Object.keys(S).length<D.S&&k++<2500){const h=ri(14,99),t=h-ri(10,32);if(t<2||row(h)<=row(t)||used.has(h)||used.has(t)||!fits(h,t,true))continue;S[h]=t;add(h,t,true);}
    k=0;while(Gf.length<D.G&&k++<2500){const g=ri(3,98),C=cell(g);if(used.has(g)||segs.some(sg=>ptSeg(C,sg.A,sg.B)<26))continue;Gf.push(g);used.add(g);}
    const sc=Object.keys(L).length+Object.keys(S).length;
    if(!best||sc>best.sc)best={L,S,Gf,sc};
    if(sc===D.L+D.S&&Gf.length===D.G)break;
  }
  [LADDERS,SNAKES].forEach(o=>Object.keys(o).forEach(key=>delete o[key]));
  Object.assign(LADDERS,best.L);Object.assign(SNAKES,best.S);GIFTS.splice(0,GIFTS.length,...best.Gf);
}
applyLayout(false,'medium');
const SPAL=[['#4cc24f','#2f9a35','#1d5f27'],['#ff9f43','#d9731a','#7a3a0a'],['#9b6bff','#6a3fd1','#3d1f8a'],['#2ec4a6','#1b8f7a','#0d5a4a'],
  ['#ff6b81','#c93a52','#7a1d2e'],['#ffd54a','#e0a800','#8a6a00'],['#4cc9f0','#2793b8','#115a78']];
const SPAT=['spots','stripes','diamond','dots'],SWID=[1,0.85,1.15,0.95,1.1,0.9];
const LSTY=[{k:'wood',rail:[0x5b3a18,0xc98b45,0xf0c78a],rung:[0x5b3a18,0xe0a860],off:11},
  {k:'bamboo',rail:[0x4d6b1f,0xa8cf4a,0xe3f5a0],rung:[0x4d6b1f,0xc7e063],off:10},
  {k:'rope',rail:[0x6e5a3a,0xe8d8b0,0xffffff],rung:[0x5b3a18,0xb07a3a],off:12},
  {k:'vine',rail:[0x1f5a2a,0x3fa44a,0x8be08a],rung:[0x5b3a18,0xa8743a],off:11},
  {k:'toy',rail:[0x7a1d4a,0xff6fa8,0xffc0dc],rung:[0x7a1d4a,0xffd23f],off:13}];
const PW={dbl:'Dobel Giliran',ss:'Anti-Ular',ts:'Anti-Tembak'};
const G={scene:null,players:[],cur:0,session:0,over:false,rolled:false,diff:'medium'};
const hx=s=>parseInt(s.slice(1),16);
const lerp=(a,b,t)=>a+(b-a)*t;
function cell(n){const i=n-1,row=Math.floor(i/10);let col=i%10;if(row%2)col=9-col;return{x:M+col*Sx+Sx/2,y:WH-M-row*Sy-Sy/2,row,col};}
const wait=ms=>new Promise(r=>G.scene.time.delayedCall(ms,r));
const tw=cfg=>new Promise(res=>G.scene.tweens.add(Object.assign({},cfg,{onComplete:()=>res()})));
function ellPts(cx,cy,rx,ry,ang){const o=[],ca=Math.cos(ang),sa=Math.sin(ang);
  for(let k=0;k<18;k++){const t=k/18*Math.PI*2,lx=Math.cos(t)*rx,ly=Math.sin(t)*ry;o.push({x:cx+lx*ca-ly*sa,y:cy+lx*sa+ly*ca});}return o;}
function ladderRungs(L){return Math.max(3,Math.floor(Math.hypot(L.B.x-L.A.x,L.B.y-L.A.y)/24));}

class BoardScene extends Phaser.Scene{
  constructor(){super('board');}
  init(d){this.cfg=d||{players:[]};}
  create(){
    G.scene=this;const sid=++G.session;this.T=0;this.toks=[];this.zoomed=false;applyLayout(!!this.cfg.rand,this.cfg.diff||'medium');G.diff=this.cfg.diff||'medium';G.rolled=false;
    if(!this.textures.exists('gift'))this.textures.addCanvas('gift',makeGift(160));
    this.drawBoard();this.makeSL();this.makeGifts();this.makeDice();
    const cam=this.cameras.main;cam.setBounds(0,0,WW,WH);cam.setZoom(ZOUT);cam.centerOn(WW/2,WH/2);
    if(this.cfg.players&&this.cfg.players.length)this.startGame(this.cfg.players,sid);
  }
  /* jungle doodles in the corner of a cell */
  doodle(g,n,x0,y0){
    const type=(n*5+Math.floor(n/10))%7,s=Sx*0.17,px=x0+(n%2?Sx*0.25:Sx*0.75),py=y0+Sy*(Sy>Sx*1.3?0.86:0.78);
    switch(type){
      case 0:g.fillStyle(0x5cb85c,0.95);g.fillPoints(ellPts(px,py,s*1.15,s*0.55,-0.6),true);g.lineStyle(1.6,0x2f7a3a,1);g.lineBetween(px-s*0.9,py+s*0.5,px+s*0.9,py-s*0.5);break;
      case 1:for(let k=0;k<5;k++){const an=k*1.2566;g.fillStyle(0xff8fab,1);g.fillCircle(px+Math.cos(an)*s*0.55,py+Math.sin(an)*s*0.55,s*0.42);}g.fillStyle(0xffd54a,1);g.fillCircle(px,py,s*0.33);break;
      case 2:g.fillStyle(0xfff0d8,1);g.fillRect(px-s*0.22,py,s*0.44,s*0.7);g.fillStyle(0xe8574f,1);g.fillPoints(ellPts(px,py,s*0.95,s*0.62,0),true);g.fillStyle(0xffffff,1);g.fillCircle(px-s*0.35,py-s*0.12,s*0.14);g.fillCircle(px+s*0.3,py+s*0.05,s*0.12);break;
      case 3:g.fillStyle(0x8a5a2b,0.85);g.fillPoints(ellPts(px,py+s*0.3,s*0.6,s*0.48,0),true);[[-0.62,-0.25],[-0.22,-0.62],[0.22,-0.62],[0.62,-0.25]].forEach(([a,b])=>g.fillCircle(px+a*s,py+b*s,s*0.2));break;
      case 4:g.lineStyle(s*0.5,0xffd54a,1);g.beginPath();g.arc(px,py-s*0.3,s*0.85,0.15*Math.PI,0.85*Math.PI,false);g.strokePath();g.fillStyle(0x6b4423,1);g.fillCircle(px+Math.cos(0.15*Math.PI)*s*0.85,py-s*0.3+Math.sin(0.15*Math.PI)*s*0.85,s*0.15);break;
      case 5:g.lineStyle(2.4,0x3f9a4a,1);for(let k=-2;k<=2;k++){g.lineBetween(px,py+s*0.7,px+k*s*0.45,py-s*0.6+Math.abs(k)*s*0.25);}break;
      default:g.fillStyle(0x8e7dff,0.95);g.fillCircle(px-s*0.45,py-s*0.1,s*0.5);g.fillCircle(px+s*0.45,py-s*0.1,s*0.5);g.fillStyle(0xffb703,0.95);g.fillCircle(px-s*0.38,py+s*0.4,s*0.34);g.fillCircle(px+s*0.38,py+s*0.4,s*0.34);g.lineStyle(2,0x2a1f33,1);g.lineBetween(px,py-s*0.6,px,py+s*0.7);
    }
  }
  /* wooden sign with an up arrow marks the foot of a ladder */
  signUp(g,c){
    const y=c.y+Sy*0.04;
    g.fillStyle(0x6b4423,1);g.fillRect(c.x-2.5,y,5,Math.min(Sy*0.3,34));
    g.fillStyle(0x3f9a4a,1);g.fillTriangle(c.x-20,y+Math.min(Sy*0.3,34),c.x-4,y+Math.min(Sy*0.3,34)-14,c.x-4,y+Math.min(Sy*0.3,34));g.fillTriangle(c.x+20,y+Math.min(Sy*0.3,34),c.x+4,y+Math.min(Sy*0.3,34)-14,c.x+4,y+Math.min(Sy*0.3,34));
    g.fillStyle(0xd7a066,1);g.fillRoundedRect(c.x-18,y-16,36,24,5);g.lineStyle(2,0x6b4423,1);g.strokeRoundedRect(c.x-18,y-16,36,24,5);
    g.fillStyle(0x2f9a3a,1);g.fillTriangle(c.x,y-13,c.x-9,y+2,c.x+9,y+2);g.fillRect(c.x-3,y+1,6,5);
  }
  /* dark snake den with glowing eyes and a toxic mushroom marks a snake head */
  den(g,c){
    const y=c.y+Sy*0.2;
    g.fillStyle(0x7a5a3a,1);g.fillPoints(ellPts(c.x,y+3,25,14,0),true);
    g.fillStyle(0x24160e,1);g.fillPoints(ellPts(c.x,y,21,11,0),true);
    g.fillStyle(0xffe14a,1);g.fillCircle(c.x-6,y-1,3);g.fillCircle(c.x+6,y-1,3);g.fillStyle(0x14233d,1);g.fillCircle(c.x-6,y-1,1.2);g.fillCircle(c.x+6,y-1,1.2);
    g.fillStyle(0xfff0d8,1);g.fillRect(c.x+25,y+7,4,9);g.fillStyle(0x9b59b6,1);g.fillPoints(ellPts(c.x+27,y+7,9,6,0),true);g.fillStyle(0xffffff,1);g.fillCircle(c.x+24,y+6,1.6);g.fillCircle(c.x+30,y+7,1.4);
  }
  drawBoard(){
    const g=this.add.graphics().setDepth(0);
    g.fillStyle(0x14402a,1);g.fillRect(0,0,WW,WH);
    const st={fontFamily:'"Lilita One","Trebuchet MS",sans-serif',fontSize:'22px',color:'#2f6b3a',resolution:4};
    const foot=new Set(Object.keys(LADDERS).map(Number)),head=new Set(Object.keys(SNAKES).map(Number));
    for(let n=1;n<=100;n++){
      const c=cell(n),x0=c.x-Sx/2,y0=c.y-Sy/2,special=foot.has(n)||head.has(n);
      g.fillStyle(foot.has(n)?0xe0f59a:head.has(n)?0xf5cdb4:(c.row+c.col)%2?0xf6f1d4:0xcdeab0,1);g.fillRect(x0,y0,Sx,Sy);
      if(n<100&&!special){
        const up=n%10===0,dir=c.row%2?-1:1,cx=c.x,cy=c.y-Sy*0.04,w=Sx*0.14;
        g.lineStyle(4,0x8fbf72,0.7);g.beginPath();
        if(up){g.moveTo(cx-w,cy+w*0.5);g.lineTo(cx,cy-w*0.7);g.lineTo(cx+w,cy+w*0.5);}
        else{g.moveTo(cx-dir*w*0.6,cy-w);g.lineTo(cx+dir*w*0.6,cy);g.lineTo(cx-dir*w*0.6,cy+w);}
        g.strokePath();
      }
      if(foot.has(n))this.signUp(g,c);else if(head.has(n))this.den(g,c);
      else if(n!==1&&n!==100)this.doodle(g,n,x0,y0);
      this.add.text(c.x,y0+3,String(n),st).setOrigin(.5,0).setDepth(1);
    }
    const c1=cell(1),c100=cell(100);
    /* house on cell 1 */
    g.fillStyle(0xe8574f,1);g.fillTriangle(c1.x-17,c1.y+Sy*0.18,c1.x,c1.y-Sy*0.02,c1.x+17,c1.y+Sy*0.18);
    g.fillStyle(0xfff0c8,1);g.fillRect(c1.x-12,c1.y+Sy*0.18,24,17);
    g.fillStyle(0x8a5a2b,1);g.fillRect(c1.x-4,c1.y+Sy*0.18+6,8,11);
    /* flag on cell 100 */
    const fx=c100.x-8,fy=c100.y-Sy*0.04;
    g.fillStyle(0x6b4423,1);g.fillRect(fx-1.5,fy-8,3,34);
    for(let r=0;r<3;r++)for(let q=0;q<4;q++){g.fillStyle((r+q)%2?0x222222:0xffffff,1);g.fillRect(fx+1.5+q*7,fy-8+r*7,7,7);}
    g.lineStyle(1.5,0x222222,1);g.strokeRect(fx+1.5,fy-8,28,21);
  }
  makeSL(){
    this.lad=Object.entries(LADDERS).map(([a,b],i)=>({a:+a,b:+b,A:cell(+a),B:cell(+b),lit:-1,pulse:0,st:LSTY[(i+Math.floor(+a/7))%LSTY.length]}));
    this.snk=Object.entries(SNAKES).map(([h,t],i)=>{
      const H=cell(+h),T=cell(+t),len=Math.hypot(H.x-T.x,H.y-T.y);
      return{h:+h,t:+t,H,T,len,amp:Math.max(8,Math.min(28,len*0.1)),waves:Math.max(1.5,Math.round(len/120*2)/2+1),
        speed:2+(i%3)*0.4,ph:i*1.7,col:SPAL[(i+Math.floor(+h/9))%SPAL.length].slice(0,2),spot:SPAL[(i+Math.floor(+h/9))%SPAL.length][2],pat:SPAT[(i+Math.floor(+t/5))%4],w:SWID[(i*5+Math.floor(+h/3))%SWID.length],horn:(i+Math.floor(+h/4))%3===1,excite:0,mouth:0,front:false};
    });
    this.ladG=this.add.graphics().setDepth(2);
    this.snkB=this.add.graphics().setDepth(3);
    this.snkF=this.add.graphics().setDepth(12);
  }
  makeGifts(){
    GIFTS.forEach((n,i)=>{
      const c=cell(n),im=this.add.image(c.x,c.y+4,'gift').setDisplaySize(40,40).setDepth(1.5);
      this.tweens.add({targets:im,scale:im.scale*1.12,duration:700+i*40,yoyo:true,repeat:-1,ease:'Sine.easeInOut',delay:i*90});
    });
  }
  makeDice(){
    const c=this.add.container(VW/2,VH/2).setDepth(30).setScrollFactor(0).setVisible(false);
    const sh=this.add.ellipse(VW/2,VH/2+78,90,22,0x000000,.35).setDepth(29).setScrollFactor(0).setVisible(false);
    const g=this.add.graphics();c.add(g);this.dice={c,g,sh};
  }
  drawDie(v){
    const g=this.dice.g;g.clear();
    g.fillStyle(0xffffff,1);g.fillRoundedRect(-50,-50,100,100,20);
    g.lineStyle(4,0x14233d,1);g.strokeRoundedRect(-50,-50,100,100,20);
    const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],
      5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
    P[v].forEach(([a,b])=>{g.fillStyle(v===1?0xff5d73:0x14233d,1);g.fillCircle(a*25,b*25,v===1?13:9);});
  }
  /* ----- per-frame drawing ----- */
  update(time){
    this.T=time/1000;const T=this.T;
    this.ladG.clear();this.snkB.clear();this.snkF.clear();
    this.lad.forEach(L=>this.drawLadder(this.ladG,L));
    this.snk.forEach(s=>this.drawSnake((s.excite>0.02||s.front)?this.snkF:this.snkB,s,T));
    if(this.toks)this.toks.forEach((t,i)=>{
      const act=G.players[G.cur]===t.p&&!G.over,a=t.aura;a.clear();
      if(act&&!t.busy){t.body.y=-Math.abs(Math.sin(T*5))*5;
        const b=Math.sin(T*5)*3;a.fillStyle(0xffb703,1);a.fillTriangle(-8,-38+b,8,-38+b,0,-27+b);}
      else if(!t.busy)t.body.y=0;
      if(t.dizzy)for(let k=0;k<3;k++){const an=T*7+k*2.094,sx=Math.cos(an)*19,sy=-30+Math.sin(an)*6;a.fillStyle(0xffe14a,1);a.fillCircle(sx,sy,4.5);a.fillStyle(0xffffff,0.9);a.fillCircle(sx-1,sy-1,1.7);}
      const pul=0.5+0.4*Math.sin(T*4);
      if(t.p.ss>0){a.lineStyle(3,0x2ec4a6,pul);a.strokeCircle(0,0,29);}
      if(t.p.ts>0){a.lineStyle(3,0x4cc9f0,pul);a.strokeCircle(0,0,t.p.ss>0?34:29);}
    });
  }
  drawLadder(g,L){
    const st=L.st,dx=L.B.x-L.A.x,dy=L.B.y-L.A.y,len=Math.hypot(dx,dy),nx=dx/len,ny=dy/len,px=-ny,py=nx,off=st.off+L.pulse*2,cnt=ladderRungs(L);
    const P=(f,s)=>({x:L.A.x+dx*f+px*off*s,y:L.A.y+dy*f+py*off*s});
    for(const s of[-1,1]){g.lineStyle(8,0x000000,0.18);g.lineBetween(L.A.x+px*off*s+3,L.A.y+py*off*s+5,L.B.x+px*off*s+3,L.B.y+py*off*s+5);}
    if(L.pulse>0){for(const s of[-1,1]){g.lineStyle(16,0xffe58f,0.35*L.pulse);g.lineBetween(L.A.x+px*off*s,L.A.y+py*off*s,L.B.x+px*off*s,L.B.y+py*off*s);}}
    for(let k=1;k<=cnt;k++){
      const f=k/(cnt+1),cx=L.A.x+dx*f,cy=L.A.y+dy*f,lit=L.lit>=f;
      g.lineStyle(8,lit?0xffb703:st.rung[0],1);g.lineBetween(cx-px*off,cy-py*off,cx+px*off,cy+py*off);
      g.lineStyle(4.5,lit?0xffe58f:st.rung[1],1);g.lineBetween(cx-px*off,cy-py*off,cx+px*off,cy+py*off);
    }
    const wo=st.k==='rope'?6:st.k==='toy'?10:9,wi=st.k==='rope'?3.2:st.k==='toy'?6:5;
    for(const s of[-1,1]){
      g.lineStyle(wo,st.rail[0],1);g.lineBetween(L.A.x+px*off*s,L.A.y+py*off*s,L.B.x+px*off*s,L.B.y+py*off*s);
      g.lineStyle(wi,st.rail[1],1);g.lineBetween(L.A.x+px*off*s,L.A.y+py*off*s,L.B.x+px*off*s,L.B.y+py*off*s);
      g.lineStyle(1.8,st.rail[2],1);g.lineBetween(L.A.x+px*(off*s-1.2),L.A.y+py*(off*s-1.2),L.B.x+px*(off*s-1.2),L.B.y+py*(off*s-1.2));
      const n=Math.floor(len/(st.k==='bamboo'?26:st.k==='rope'?10:34));
      for(let q=1;q<n;q++){const f=q/n,c=P(f,s);
        if(st.k==='bamboo'){g.lineStyle(2.2,st.rail[0],1);g.lineBetween(c.x-px*5,c.y-py*5,c.x+px*5,c.y+py*5);}
        else if(st.k==='rope'){g.fillStyle(st.rail[0],0.7);g.fillCircle(c.x,c.y,1.5);}
        else if(st.k==='vine'){g.fillStyle(q%2?0x57c957:0x2f9a3a,1);
          const sx=q%2?s:-s,lx=c.x+px*sx*7,ly=c.y+py*sx*7;g.fillTriangle(c.x,c.y,lx+nx*4,ly+ny*4,lx-nx*4,ly-ny*4);}
      }
      if(st.k==='toy'){for(const e of[0,1]){const c=P(e,s);g.fillStyle(st.rail[1],1);g.fillCircle(c.x,c.y,6.5);g.lineStyle(2,st.rail[0],1);g.strokeCircle(c.x,c.y,6.5);}}
    }
  }
  snakePts(sn,time){
    const N=Math.max(24,Math.ceil(sn.len/6)),dx=sn.T.x-sn.H.x,dy=sn.T.y-sn.H.y,L=sn.len||1,px=-dy/L,py=dx/L,out=[];
    const amp=sn.amp*(1+sn.excite*0.9),sp=sn.speed*(1+sn.excite*2.2);
    for(let i=0;i<=N;i++){
      const t=i/N,env=Math.pow(Math.sin(Math.PI*t),0.7)*0.9+0.1*(1-t)+0.06;
      const off=Math.sin(t*sn.waves*Math.PI*2-time*sp+sn.ph)*amp*env;
      out.push({x:sn.H.x+dx*t+px*off,y:sn.H.y+dy*t+py*off,r:(t<0.03?13:13-9.5*Math.pow(t,0.7))*sn.w});
    }
    return out;
  }
  drawSnake(g,sn,time){
    const pts=this.snakePts(sn,time),n=pts.length-1;
    g.fillStyle(0x000000,0.17);for(let i=n;i>=0;i-=2){const p=pts[i];g.fillCircle(p.x+3,p.y+5,p.r);}
    for(let i=n;i>=0;i--){const p=pts[i];g.fillStyle(hx(Math.floor(i/4)%2?sn.col[0]:sn.col[1]),1);g.fillCircle(p.x,p.y,p.r);}
    const spc=hx(sn.spot);
    if(sn.pat==='spots'){g.fillStyle(spc,0.85);for(let i=n-1;i>=3;i-=4){const p=pts[i];g.fillCircle(p.x,p.y,p.r*0.42);}
      g.fillStyle(0xf6e27a,0.9);for(let i=n-3;i>=4;i-=8){const p=pts[i];g.fillCircle(p.x,p.y,p.r*0.2);}}
    else if(sn.pat==='stripes'){g.fillStyle(spc,0.8);for(let i=n-1;i>=3;i--){if(Math.floor(i/3)%3===0){const p=pts[i];g.fillCircle(p.x,p.y,p.r*0.9);}}}
    else if(sn.pat==='diamond'){for(let i=n-2;i>=4;i-=6){const p=pts[i],q=pts[i-1];let ux=p.x-q.x,uy=p.y-q.y;const ul=Math.hypot(ux,uy)||1;ux/=ul;uy/=ul;
      const vx=-uy,vy=ux,rr=p.r;g.fillStyle(0xffffff,0.6);g.fillPoints([{x:p.x+ux*rr*0.9,y:p.y+uy*rr*0.9},{x:p.x+vx*rr*0.6,y:p.y+vy*rr*0.6},{x:p.x-ux*rr*0.9,y:p.y-uy*rr*0.9},{x:p.x-vx*rr*0.6,y:p.y-vy*rr*0.6}],true);
      g.fillStyle(spc,0.9);g.fillCircle(p.x,p.y,rr*0.22);}}
    else{for(let i=n-1;i>=3;i-=3){const p=pts[i];g.fillStyle(i%2?0xffffff:spc,i%2?0.55:0.8);g.fillCircle(p.x,p.y,p.r*0.3);}}
    const p0=pts[0],p1=pts[Math.min(3,n)];let ax=p0.x-p1.x,ay=p0.y-p1.y;const al=Math.hypot(ax,ay)||1;ax/=al;ay/=al;
    const bx=-ay,by=ax,r=p0.r+2,o=sn.mouth,ang=Math.atan2(ay,ax),hc={x:p0.x+ax*r*0.35,y:p0.y+ay*r*0.35};
    if(sn.horn){g.fillStyle(spc,1);for(const s of[-1,1]){const bx0=hc.x+bx*s*r*0.7,by0=hc.y+by*s*r*0.7;g.fillTriangle(bx0+ax*3,by0+ay*3,bx0-ax*4,by0-ay*4,bx0+bx*s*r*0.5-ax*r*0.9,by0+by*s*r*0.5-ay*r*0.9);}}
    g.fillStyle(hx(sn.col[0]),1);g.fillPoints(ellPts(hc.x,hc.y,r*1.35,r*1.1,ang),true);
    if(o>0.05){
      g.fillStyle(0x7a0f25,1);g.fillPoints(ellPts(hc.x+ax*r*1.0,hc.y+ay*r*1.0,r*0.8*o+1,r*0.7*o+1,ang),true);
      g.fillStyle(0xffffff,1);
      for(const s of[-1,1]){const fx=hc.x+ax*r*1.25+bx*s*r*0.45*o,fy=hc.y+ay*r*1.25+by*s*r*0.45*o;
        g.fillTriangle(fx-bx*3,fy-by*3,fx+bx*3,fy+by*3,fx+ax*r*0.45,fy+ay*r*0.45);}
    }else{
      const tl=r*(0.9+0.8*Math.max(0,Math.sin(time*9+sn.ph))),sx=hc.x+ax*r*1.3,sy=hc.y+ay*r*1.3,ex=sx+ax*tl,ey=sy+ay*tl;
      g.lineStyle(2.5,0xff3355,1);g.lineBetween(sx,sy,ex,ey);
      g.lineBetween(ex,ey,ex+ax*5+bx*5,ey+ay*5+by*5);g.lineBetween(ex,ey,ex+ax*5-bx*5,ey+ay*5-by*5);
    }
    for(const s of[-1,1]){
      const ex=hc.x+bx*s*r*0.55+ax*r*0.2,ey=hc.y+by*s*r*0.55+ay*r*0.2;
      g.fillStyle(0xffffff,1);g.fillCircle(ex,ey,r*0.36);g.fillStyle(0x14233d,1);g.fillCircle(ex+ax*r*0.1,ey+ay*r*0.1,r*0.18+o*r*0.05);
    }
  }

  /* ----- camera: the whole board stays in view; zoom in only for ladder climbs and snake bites ----- */
  async focusIn(t,dur){
    if(this.zoomed)return;this.zoomed=true;
    const cam=this.cameras.main;
    cam.startFollow(t.c,false,0.12,0.12);
    cam.zoomTo(ZIN,dur,'Sine.easeInOut',true);
    await wait(dur+40);
  }
  async focusOut(dur){
    if(!this.zoomed)return;this.zoomed=false;
    const cam=this.cameras.main;
    cam.zoomTo(ZOUT,dur,'Sine.easeInOut',true);
    await wait(dur+40);
    cam.stopFollow();cam.centerOn(WW/2,WH/2);
  }
  /* ----- effects ----- */
  burst(x,y,color,n,spd,life){
    n=n||12;spd=spd||60;life=life||500;
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2,d=spd*(0.4+Math.random()*0.9);
      const c=this.add.circle(x,y,2+Math.random()*3,hx(color)).setDepth(20);
      this.tweens.add({targets:c,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,scale:0.2,duration:life*(0.6+Math.random()*0.6),ease:'Cubic.easeOut',onComplete:()=>c.destroy()});
    }
  }
  dust(x,y){this.burst(x,y,'#f2e3bd',4,18,300);}
  ring(x,y,color){
    const r=this.add.circle(x,y,10).setStrokeStyle(4,hx(color)).setDepth(20);
    this.tweens.add({targets:r,scale:4.5,alpha:0,duration:550,ease:'Cubic.easeOut',onComplete:()=>r.destroy()});
  }
  floatText(x,y,str,color){
    const t=this.add.text(x,y,str,{fontFamily:'"Lilita One","Trebuchet MS",sans-serif',fontSize:'17px',color:color||'#ffffff',stroke:'#14233d',strokeThickness:4,resolution:4}).setOrigin(.5).setDepth(25);
    this.tweens.add({targets:t,y:y-34,alpha:0,duration:1000,ease:'Cubic.easeOut',onComplete:()=>t.destroy()});
  }
  confetti(cx,cy,n){
    const cols=['#ff5d73','#4cc9f0','#ffb703','#2ec4a6','#ffffff','#8e7dff'],wv=this.cameras.main.worldView,loc=cx!=null;
    for(let i=0;i<(n||110);i++){
      const r=this.add.rectangle(loc?cx+(Math.random()-.5)*130:wv.x+Math.random()*wv.width,loc?cy-90-Math.random()*60:wv.y-20-Math.random()*200,8+Math.random()*6,12,hx(cols[i%cols.length])).setDepth(40);
      this.tweens.add({targets:r,y:loc?cy+70:wv.bottom+30,x:r.x+(Math.random()-.5)*160,angle:Math.random()*900,duration:1800+Math.random()*1800,ease:'Sine.easeIn',onComplete:()=>r.destroy()});
    }
  }
  /* ----- tokens ----- */
  startGame(list,sid){
    G.players=list.map((p,i)=>Object.assign({},p,{i,pos:1,dbl:0,ss:0,ts:0,armed:false}));
    G.cur=0;G.over=false;
    G.players.forEach(p=>{const k='tok'+p.i;if(this.textures.exists(k))this.textures.remove(k);this.textures.addCanvas(k,makeToken(p.icon,p.color,TK,p.img));
      p.avUrl=makeToken(p.icon,p.color,84,p.img).toDataURL();});
    this.toks=G.players.map(p=>{
      const c=this.add.container(0,0).setDepth(10),sh=this.add.ellipse(0,16,32,11,0x000000,0.3),aura=this.add.graphics();
      const body=this.add.image(0,0,'tok'+p.i),base=46/TK;body.setScale(base);c.add([sh,aura,body]);
      return{c,sh,aura,body,p,base,busy:false};
    });
    this.settle(true);const cam=this.cameras.main;cam.setZoom(ZOUT);cam.centerOn(WW/2,WH/2);
    this.loop(sid);
  }
  async settle(instant){
    const groups={};this.toks.forEach(t=>{(groups[t.p.pos]=groups[t.p.pos]||[]).push(t);});
    const O={1:[[0,0]],2:[[-17,2],[17,2]],3:[[-17,8],[17,8],[0,-13]],4:[[-17,-11],[17,-11],[-17,13],[17,13]]};
    Object.keys(groups).forEach(k=>{
      const arr=groups[k],c=cell(+k),n=arr.length;
      arr.forEach((t,j)=>{
        const o=O[n][j],sc=t.base*(n===1?1:n===2?0.82:0.72);
        if(instant){t.c.setPosition(c.x+o[0],c.y+o[1]);t.body.setScale(sc);}
        else{this.tweens.add({targets:t.c,x:c.x+o[0],y:c.y+o[1],duration:190,ease:'Sine.easeOut'});this.tweens.add({targets:t.body,scaleX:sc,scaleY:sc,duration:190});}
      });
    });
    if(!instant)await wait(210);
  }
  updateDepth(){this.toks.forEach(t=>t.c.setDepth(G.players[G.cur]===t.p?11:10));}
  /* ----- main loop ----- */
  async loop(sid){
    UI.render();await wait(500);
    while(G.session===sid&&!G.over){
      const p=G.players[G.cur];this.updateDepth();
      let more=true;
      while(more&&!G.over&&G.session===sid){
        more=await this.takeTurn(p);
        if(more&&!G.over){UI.toast(this.again||'Giliran lagi!','power');Sound.extra();await wait(800);}
      }
      if(G.over||G.session!==sid)break;
      G.cur=(G.cur+1)%G.players.length;UI.render();Sound.turn();await wait(250);
    }
  }
  armDouble(p){
    if(!p||p.dbl<1||p.armed)return;
    p.dbl--;p.armed=true;Sound.power();UI.toast('Dobel Giliran aktif!','power');UI.render();
    this.ring(this.toks[p.i].c.x,this.toks[p.i].c.y,'#ffb703');
  }
  async takeTurn(p){
    UI.turn(p);
    if(p.type==='human'){await UI.waitRoll();}
    else{await wait(700);if(p.dbl>0&&!p.armed&&Math.random()<0.5){this.armDouble(p);await wait(500);}await wait(300);}
    UI.lock();G.rolled=true;UI.render();
    const v=(G.force&&G.force.length)?G.force.shift():1+Math.floor(Math.random()*6);
    await this.rollDice(v,p);
    await this.moveBy(p,v);
    if(G.over)return false;
    const dbl=p.armed,more=dbl||v===6;p.armed=false;this.again=dbl?'Dobel giliran!':'Dapat 6! Lempar lagi';UI.render();
    return more;
  }
  async rollDice(v,pl){
    const d=this.dice,c=d.c,cam=this.cameras.main,u=VW/1080/cam.zoom,ds=2*u,Vx=VW/2,Vy=VH/2,y0=Vy-170*u,yUp=y0-80*u;
    c.setPosition(Vx,y0).setScale(0).setAlpha(1).setRotation(0).setVisible(true);
    d.sh.setPosition(Vx,y0+150*u).setVisible(true).setAlpha(0.1).setScale(ds*0.6);
    this.drawDie(1+Math.floor(Math.random()*6));Sound.rattle(1.15);if(pl)UI.rollStart(pl);
    this.tweens.add({targets:c,scale:ds*1.2,duration:220,ease:'Back.easeOut'});
    this.tweens.add({targets:c,rotation:Math.PI*6*(Math.random()<0.5?1:-1),duration:1150,ease:'Cubic.easeOut'});
    this.tweens.add({targets:c,y:yUp,duration:380,ease:'Quad.easeOut'});
    this.tweens.add({targets:c,y:y0,duration:770,delay:380,ease:'Bounce.easeOut'});
    this.tweens.add({targets:d.sh,alpha:0.35,scale:ds,duration:700,delay:380});
    const iv=this.time.addEvent({delay:75,loop:true,callback:()=>this.drawDie(1+Math.floor(Math.random()*6))});
    await wait(1150);iv.remove();c.setRotation(0);this.drawDie(v);Sound.land();if(pl)UI.rollEnd(pl,v);
    this.tweens.add({targets:c,scale:ds*1.45,duration:90,yoyo:true});
    this.cameras.main.shake(120,0.003);await wait(650);
    await Promise.all([tw({targets:c,scale:ds*0.5,alpha:0,duration:260,ease:'Back.easeIn'}),tw({targets:d.sh,alpha:0,duration:260})]);
    c.setVisible(false);d.sh.setVisible(false);
  }
  async hop(t,x,y,dur){
    dur=dur||230;
    this.tweens.add({targets:t.body,y:-24,duration:dur/2,yoyo:true,ease:'Quad.easeOut'});
    await tw({targets:t.c,x,y,duration:dur,ease:'Sine.easeInOut'});
    this.tweens.add({targets:t.body,scaleX:t.base*1.2,scaleY:t.base*0.8,duration:70,yoyo:true});
    this.dust(x,y+12);
  }
  passFx(sq,last){
    if(last)return;
    const L=this.lad.find(l=>l.a===sq);
    if(L)this.tweens.add({targets:L,pulse:1,duration:260,yoyo:true});
    const s=this.snk.find(k=>k.h===sq);
    if(s)this.tweens.add({targets:s,excite:0.6,mouth:0.5,duration:260,yoyo:true});
  }
  async moveBy(p,v){
    const t=this.toks[p.i];t.busy=true;await this.focusIn(t,450);
    let pos=p.pos,dir=1;const path=[];
    for(let i=0;i<v;i++){if(pos+dir>100)dir=-1;pos+=dir;path.push(pos);}
    this.floatText(t.c.x,t.c.y-40,'+'+v,'#ffe58f');
    for(let i=0;i<path.length;i++){
      const c=cell(path[i]);Sound.step(i);
      await this.hop(t,c.x,c.y);p.pos=path[i];UI.render();this.passFx(path[i],i===path.length-1);
    }
    if(LADDERS[p.pos])await this.climb(t,p);
    else if(SNAKES[p.pos])await this.bitten(t,p);
    await this.settle();
    await this.combat(p,t);
    if(p.pos!==100&&GIFTS.includes(p.pos))await this.gift(p,t);
    t.busy=false;await this.focusOut(550);
    if(p.pos===100)await this.win(p);
  }
  cheer(t){
    const x=t.c.x,y=t.c.y,cols=['#ff5d73','#4cc9f0','#ffb703','#2ec4a6','#ffffff','#8e7dff','#ff8fab'];
    cols.forEach((c,i)=>this.time.delayedCall(i*70,()=>this.ring(x,y,c)));
    for(let i=0;i<4;i++)this.burst(x,y,cols[i*2%cols.length],10,70,800);
    this.confetti(x,y,60);this.floatText(x,y-46,'Yeay!','#ffe58f');
  }
  async climb(t,p){
    const L=this.lad.find(l=>l.a===p.pos),cnt=ladderRungs(L),dest=LADDERS[p.pos],rb=['#ff5d73','#ffb703','#7bd94a','#4cc9f0','#8e7dff'];
    UI.toast('Naik tangga!','good');await this.focusIn(t,550);Sound.ladder(1.5,cnt);
    this.tweens.add({targets:L,pulse:1,duration:300});
    const pr={u:0};
    await tw({targets:pr,u:1,duration:1500,ease:'Sine.easeInOut',onUpdate:()=>{
      const f=pr.u;t.c.setPosition(lerp(L.A.x,L.B.x,f),lerp(L.A.y,L.B.y,f));L.lit=f;
      t.body.y=-6-Math.abs(Math.sin(f*Math.PI*cnt))*9;
      if(Math.random()<0.5)this.burst(t.c.x,t.c.y+10,rb[Math.floor(Math.random()*rb.length)],2,22,500);}});
    t.body.y=0;p.pos=dest;UI.render();Sound.cheer();UI.toast('Yeay! Naik ke '+dest,'good');this.cheer(t);
    this.tweens.add({targets:t.body,rotation:Math.PI*2,duration:900,ease:'Cubic.easeOut',onComplete:()=>{t.body.rotation=0;}});
    for(let k=0;k<3;k++){
      this.tweens.add({targets:t.body,y:-26,duration:150,yoyo:true,ease:'Quad.easeOut'});
      await wait(300);
    }
    await wait(250);
    this.tweens.add({targets:L,lit:-1,pulse:0,duration:500});L.lit=-1;
  }
  async bitten(t,p){
    const sn=this.snk.find(s=>s.h===p.pos);sn.front=true;await this.focusIn(t,500);
    Sound.hiss();await tw({targets:sn,excite:1,mouth:1,duration:380});
    if(p.ss>0){
      p.ss--;Sound.shield();UI.toast('Anti-Ular! Aman','power');this.ring(t.c.x,t.c.y,'#2ec4a6');this.burst(t.c.x,t.c.y,'#2ec4a6',16,50,600);
      await wait(500);await tw({targets:sn,excite:0,mouth:0,duration:500});sn.front=false;UI.render();return;
    }
    const cam=this.cameras.main;
    Sound.bite();Sound.poison();UI.toast('Digigit! Kena racun','bad');cam.shake(280,0.009);cam.flash(380,90,255,70);
    t.body.setTint(0x7dff6a);t.dizzy=true;
    this.burst(t.c.x,t.c.y,'#7dff4a',22,55,800);this.burst(t.c.x,t.c.y,'#2ec24a',12,40,700);this.ring(t.c.x,t.c.y,'#7dff4a');
    await wait(450);
    Sound.dizzy(1.9);const pr={u:0};
    await tw({targets:pr,u:1,duration:1400,ease:'Sine.easeIn',onUpdate:()=>{
      const pts=this.snakePts(sn,this.T),pp=pts[Math.min(pts.length-1,Math.floor(pr.u*(pts.length-1)))];
      t.c.setPosition(pp.x+Math.sin(pr.u*34)*7,pp.y);t.body.rotation=Math.sin(pr.u*30)*0.75;t.body.setScale(t.base*(1-0.25*Math.sin(pr.u*Math.PI)));
      if(Math.random()<0.4)this.burst(t.c.x,t.c.y-8,'#7dff4a',1,24,550);}});
    t.body.rotation=0;t.body.setScale(t.base);p.pos=SNAKES[p.pos];UI.render();
    this.dust(t.c.x,t.c.y+10);this.ring(t.c.x,t.c.y,'#7dff4a');
    await tw({targets:sn,excite:0,mouth:0,duration:600});sn.front=false;
    await wait(500);t.body.clearTint();t.dizzy=false;
  }
  async combat(p,t){
    if(p.pos===1||p.pos===100)return;
    const victims=G.players.filter(o=>o!==p&&o.pos===p.pos);
    for(const v of victims){
      const vt=this.toks[v.i];
      if(v.ts>0){
        v.ts--;Sound.shield();UI.toast(v.name+' kebal tembakan!','power');this.ring(vt.c.x,vt.c.y,'#4cc9f0');
        this.burst(vt.c.x,vt.c.y,'#4cc9f0',14,45,500);await wait(700);UI.render();continue;
      }
      await this.shoot(t,vt);
      const to=Math.max(1,v.pos-10);
      UI.toast(v.name+' tertembak! -'+(v.pos-to),'bad');
      await tw({targets:vt.body,rotation:Math.PI*6,scale:0,duration:480,ease:'Cubic.easeIn'});
      v.pos=to;UI.render();const c=cell(to);vt.c.setPosition(c.x,c.y);vt.body.rotation=0;
      await tw({targets:vt.body,scale:vt.base,duration:320,ease:'Back.easeOut'});
      this.burst(c.x,c.y,'#ffffff',12,40,500);await this.settle();
    }
  }
  async shoot(a,v){
    Sound.pew();
    const b=this.add.circle(a.c.x,a.c.y,8,hx(a.p.color)).setDepth(22).setStrokeStyle(3,0xffffff);
    this.tweens.add({targets:a.body,scaleX:a.base*0.8,scaleY:a.base*1.15,duration:90,yoyo:true});
    await tw({targets:b,x:v.c.x,y:v.c.y,duration:300,ease:'Quad.easeIn'});
    b.destroy();Sound.boom();this.cameras.main.shake(300,0.012);
    this.burst(v.c.x,v.c.y,'#ffb703',22,70,600);this.burst(v.c.x,v.c.y,'#ff5d73',12,50,500);this.ring(v.c.x,v.c.y,'#ffb703');
    v.body.setTint(0xff5555);await wait(180);v.body.clearTint();
  }
  async gift(p,t){
    const kinds=['dbl','ss','ts'].filter(k=>p[k]<3);if(!kinds.length)return;
    const k=kinds[Math.floor(Math.random()*kinds.length)];p[k]++;
    Sound.gift();this.burst(t.c.x,t.c.y,'#ffd166',20,60,700);this.ring(t.c.x,t.c.y,'#ffd166');
    this.floatText(t.c.x,t.c.y-34,'+ '+PW[k],'#ffe58f');UI.toast(p.name+' dapat '+PW[k]+'!','power');UI.render();await wait(900);
  }
  async win(p){
    G.over=true;const t=this.toks[p.i];Sound.fanfare();UI.render();this.confetti();
    UI.toast(p.name+' menang!','good');
    this.tweens.add({targets:t.body,y:-30,duration:300,yoyo:true,repeat:5});
    await wait(2200);UI.showWin(p);
  }
}
