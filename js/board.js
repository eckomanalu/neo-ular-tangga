/* ===== Board, snakes, ladders (drawn and animated every frame) ===== */
const M=18,TK=192;
let WW=720,WH=720,Sx=68.4,Sy=68.4,VW=720,VH=720,ZIN=2,ZOUT=1,AR=1;
/* Board shape: tall tiles (ratio 0.7) in portrait, square in landscape. Re-run before each new game. */
function setDims(){
  const land=window.innerWidth>window.innerHeight;
  AR=land?1:0.7;
  const box=land?Math.min(window.innerHeight-16,window.innerWidth-360):Math.min(900,window.innerWidth-32);
  VW=Math.round(Math.max(720,Math.min(land?1080:960,box*Math.min(window.devicePixelRatio||1,2.5)))/10)*10;
  WW=720;WH=Math.round(WW/AR);VH=Math.round(VW/AR);
  Sx=(WW-2*M)/10;Sy=(WH-2*M)/10;ZOUT=VW/WW;ZIN=ZOUT*2;
  document.documentElement.style.setProperty('--ar',String(AR));
}
setDims();
const LADDERS={4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};
const SNAKES={16:6,47:26,49:11,62:19,87:24,93:73,95:75,98:78};
const GIFTS=[12,25,33,45,58,66,77,89];
const SCOL=[['#2ec4a6','#1b8f7a'],['#ff5d73','#c93a52'],['#ffb703','#d98e00'],['#8e7dff','#5f4fd1'],
  ['#7bd94a','#4ea022'],['#ff8fab','#d95f84'],['#4cc9f0','#2793b8'],['#f78c4b','#c7611f']];
const PW={dbl:'Dobel Giliran',ss:'Anti-Ular',ts:'Anti-Tembak'};
const G={scene:null,players:[],cur:0,session:0,over:false};
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
    G.scene=this;const sid=++G.session;this.T=0;this.toks=[];
    if(!this.textures.exists('gift'))this.textures.addCanvas('gift',makeGift(160));
    this.drawBoard();this.makeSL();this.makeGifts();this.makeDice();
    const cam=this.cameras.main;cam.setBounds(0,0,WW,WH);cam.setZoom(ZOUT);cam.centerOn(WW/2,WH/2);
    if(this.cfg.players&&this.cfg.players.length)this.startGame(this.cfg.players,sid);
  }
  drawBoard(){
    const g=this.add.graphics().setDepth(0);
    g.fillStyle(0x4a2f17,1);g.fillRect(0,0,WW,WH);
    g.fillStyle(0x6b4423,1);g.fillRoundedRect(4,4,WW-8,WH-8,16);
    g.fillStyle(0x8a5a2b,1);g.fillRoundedRect(10,10,WW-20,WH-20,10);
    const st={fontFamily:'"Lilita One","Trebuchet MS",sans-serif',fontSize:'23px',color:'#8a6330',resolution:4};
    for(let n=1;n<=100;n++){
      const c=cell(n),x0=c.x-Sx/2,y0=c.y-Sy/2;
      let col=(c.row+c.col)%2?0xfff1c9:0xffdf9e;
      if(LADDERS[n])col=0xcdeebb;else if(SNAKES[n])col=0xffc9c9;else if(n===1)col=0xbfe3ff;else if(n===100)col=0xffe58f;
      g.fillStyle(col,1);g.fillRect(x0+.5,y0+.5,Sx-1,Sy-1);
      this.add.text(x0+4,y0+2,String(n),st).setDepth(1);
    }
    const lab={fontFamily:st.fontFamily,fontSize:'13px',color:'#3b6ea8',resolution:4};
    const c1=cell(1);this.add.text(c1.x,c1.y+Sy/2-4,'MULAI',lab).setOrigin(.5,1).setDepth(1);
    const c100=cell(100);lab.color='#a97500';this.add.text(c100.x,c100.y+Sy/2-4,'FINISH',lab).setOrigin(.5,1).setDepth(1);
  }
  makeSL(){
    this.lad=Object.entries(LADDERS).map(([a,b])=>({a:+a,b:+b,A:cell(+a),B:cell(+b),lit:-1,pulse:0}));
    this.snk=Object.entries(SNAKES).map(([h,t],i)=>{
      const H=cell(+h),T=cell(+t),len=Math.hypot(H.x-T.x,H.y-T.y);
      return{h:+h,t:+t,H,T,len,amp:Math.max(8,Math.min(28,len*0.1)),waves:Math.max(1.5,Math.round(len/120*2)/2+1),
        speed:2+(i%3)*0.4,ph:i*1.7,col:SCOL[i%SCOL.length],excite:0,mouth:0,front:false};
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
      const pul=0.5+0.4*Math.sin(T*4);
      if(t.p.ss>0){a.lineStyle(3,0x2ec4a6,pul);a.strokeCircle(0,0,29);}
      if(t.p.ts>0){a.lineStyle(3,0x4cc9f0,pul);a.strokeCircle(0,0,t.p.ss>0?34:29);}
    });
  }
  drawLadder(g,L){
    const dx=L.B.x-L.A.x,dy=L.B.y-L.A.y,len=Math.hypot(dx,dy),nx=dx/len,ny=dy/len,px=-ny,py=nx,off=11+L.pulse*2,cnt=ladderRungs(L);
    for(const s of[-1,1]){g.lineStyle(7,0x000000,0.2);g.lineBetween(L.A.x+px*off*s+3,L.A.y+py*off*s+5,L.B.x+px*off*s+3,L.B.y+py*off*s+5);}
    if(L.pulse>0){for(const s of[-1,1]){g.lineStyle(15,0xffe58f,0.3*L.pulse);g.lineBetween(L.A.x+px*off*s,L.A.y+py*off*s,L.B.x+px*off*s,L.B.y+py*off*s);}}
    for(const s of[-1,1]){
      g.lineStyle(7,0x8b5a2b,1);g.lineBetween(L.A.x+px*off*s,L.A.y+py*off*s,L.B.x+px*off*s,L.B.y+py*off*s);
      g.lineStyle(2.5,0xd7a066,1);g.lineBetween(L.A.x+px*(off*s-1.5),L.A.y+py*(off*s-1.5),L.B.x+px*(off*s-1.5),L.B.y+py*(off*s-1.5));
    }
    for(let k=1;k<=cnt;k++){
      const f=k/(cnt+1),cx=L.A.x+dx*f,cy=L.A.y+dy*f,lit=L.lit>=f;
      g.lineStyle(6,lit?0xffd166:0xa86f35,1);g.lineBetween(cx-px*off,cy-py*off,cx+px*off,cy+py*off);
      if(lit){g.fillStyle(0xffe9a3,0.5);g.fillCircle(cx,cy,12);}
    }
  }
  snakePts(sn,time){
    const N=Math.max(24,Math.ceil(sn.len/6)),dx=sn.T.x-sn.H.x,dy=sn.T.y-sn.H.y,L=sn.len||1,px=-dy/L,py=dx/L,out=[];
    const amp=sn.amp*(1+sn.excite*0.9),sp=sn.speed*(1+sn.excite*2.2);
    for(let i=0;i<=N;i++){
      const t=i/N,env=Math.pow(Math.sin(Math.PI*t),0.7)*0.9+0.1*(1-t)+0.06;
      const off=Math.sin(t*sn.waves*Math.PI*2-time*sp+sn.ph)*amp*env;
      out.push({x:sn.H.x+dx*t+px*off,y:sn.H.y+dy*t+py*off,r:t<0.03?13:13-9.5*Math.pow(t,0.7)});
    }
    return out;
  }
  drawSnake(g,sn,time){
    const pts=this.snakePts(sn,time),n=pts.length-1;
    g.fillStyle(0x000000,0.17);for(let i=n;i>=0;i-=2){const p=pts[i];g.fillCircle(p.x+3,p.y+5,p.r);}
    for(let i=n;i>=0;i--){const p=pts[i];g.fillStyle(hx(Math.floor(i/4)%2?sn.col[0]:sn.col[1]),1);g.fillCircle(p.x,p.y,p.r);}
    g.fillStyle(0xffffff,0.2);for(let i=n;i>=2;i-=3){const p=pts[i];g.fillCircle(p.x-p.r*0.25,p.y-p.r*0.3,p.r*0.38);}
    const p0=pts[0],p1=pts[Math.min(3,n)];let ax=p0.x-p1.x,ay=p0.y-p1.y;const al=Math.hypot(ax,ay)||1;ax/=al;ay/=al;
    const bx=-ay,by=ax,r=p0.r+2,o=sn.mouth,ang=Math.atan2(ay,ax),hc={x:p0.x+ax*r*0.35,y:p0.y+ay*r*0.35};
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
    const cam=this.cameras.main;
    cam.startFollow(t.c,false,0.12,0.12);
    cam.zoomTo(ZIN,dur,'Sine.easeInOut',true);
    await wait(dur+40);
  }
  async focusOut(dur){
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
  confetti(){
    const cols=['#ff5d73','#4cc9f0','#ffb703','#2ec4a6','#ffffff','#8e7dff'],wv=this.cameras.main.worldView;
    for(let i=0;i<110;i++){
      const r=this.add.rectangle(wv.x+Math.random()*wv.width,wv.y-20-Math.random()*200,8+Math.random()*6,12,hx(cols[i%cols.length])).setDepth(40);
      this.tweens.add({targets:r,y:wv.bottom+30,x:r.x+(Math.random()-.5)*160,angle:Math.random()*900,duration:1800+Math.random()*1800,ease:'Sine.easeIn',onComplete:()=>r.destroy()});
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
    UI.lock();
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
    const t=this.toks[p.i];t.busy=true;
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
    t.busy=false;
    if(p.pos===100)await this.win(p);
  }
  async climb(t,p){
    const L=this.lad.find(l=>l.a===p.pos),cnt=ladderRungs(L),dest=LADDERS[p.pos];
    UI.toast('Naik tangga!','good');await this.focusIn(t,550);Sound.ladder(1.5,cnt);
    this.tweens.add({targets:L,pulse:1,duration:300});
    const pr={u:0};
    await tw({targets:pr,u:1,duration:1500,ease:'Sine.easeInOut',onUpdate:()=>{
      const f=pr.u;t.c.setPosition(lerp(L.A.x,L.B.x,f),lerp(L.A.y,L.B.y,f));L.lit=f;
      t.body.y=-6-Math.abs(Math.sin(f*Math.PI*cnt))*9;
      if(Math.random()<0.25)this.burst(t.c.x,t.c.y+10,'#ffe58f',1,16,400);}});
    t.body.y=0;p.pos=dest;UI.render();this.burst(t.c.x,t.c.y,'#ffd166',16,50,600);this.ring(t.c.x,t.c.y,'#ffd166');
    await wait(400);
    this.tweens.add({targets:L,lit:-1,pulse:0,duration:500});L.lit=-1;await this.focusOut(650);
  }
  async bitten(t,p){
    const sn=this.snk.find(s=>s.h===p.pos);sn.front=true;await this.focusIn(t,500);
    Sound.hiss();await tw({targets:sn,excite:1,mouth:1,duration:380});
    if(p.ss>0){
      p.ss--;Sound.shield();UI.toast('Anti-Ular! Aman','power');this.ring(t.c.x,t.c.y,'#2ec4a6');this.burst(t.c.x,t.c.y,'#2ec4a6',16,50,600);
      await wait(500);await tw({targets:sn,excite:0,mouth:0,duration:500});sn.front=false;UI.render();await this.focusOut(600);return;
    }
    Sound.bite();UI.toast('Digigit ular!','bad');this.cameras.main.shake(280,0.009);
    t.body.setTint(0xff5555);this.burst(t.c.x,t.c.y,'#ff5d73',14,45,500);await wait(450);t.body.clearTint();
    Sound.slide();const pr={u:0};
    await tw({targets:pr,u:1,duration:1400,ease:'Sine.easeIn',onUpdate:()=>{
      const pts=this.snakePts(sn,this.T),pp=pts[Math.min(pts.length-1,Math.floor(pr.u*(pts.length-1)))];
      t.c.setPosition(pp.x,pp.y);t.body.rotation=pr.u*12;t.body.setScale(t.base*(1-0.25*Math.sin(pr.u*Math.PI)));}});
    t.body.rotation=0;t.body.setScale(t.base);p.pos=SNAKES[p.pos];UI.render();
    this.dust(t.c.x,t.c.y+10);this.ring(t.c.x,t.c.y,'#ff5d73');
    await tw({targets:sn,excite:0,mouth:0,duration:600});sn.front=false;await this.focusOut(650);
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
