
/* ===== UI: player corner panels, toasts, setup sheet, bootstrap ===== */
const $=s=>document.querySelector(s);
let game=null,inGame=false,lastPlayers=null;
const mk=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
const PIN_SVG='<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="currentColor" stroke="#fff" stroke-width="1.5"/></svg>';
const UI={
  _roll:null,_iv:null,_rolling:-1,paused:false,
  render(){
    for(let i=0;i<4;i++){
      const el=document.getElementById('pp'+i),p=G.players[i];
      el.textContent='';
      if(!p){el.className='pp empty';continue;}
      const active=G.cur===i&&!G.over,mine=active&&p.type==='human'&&!!this._roll;
      el.className='pp'+(active?' on':'');el.style.setProperty('--c',p.color);
      const lab=mk('div','lab');lab.append(mk('span','nm',p.name),mk('span','sq','Kotak '+p.pos));
      const wd=mk('div','wd');
      const pin=mk('div','pin');pin.innerHTML=PIN_SVG;
      const av=mk('img','av');av.src=p.avUrl;av.alt='';pin.appendChild(av);
      const d=mk('button','dice');d.type='button';
      const cv=document.createElement('canvas');cv.width=cv.height=120;drawDieFace(cv,p.last,mine);d.appendChild(cv);
      if(mine){d.classList.add('ready');d.setAttribute('aria-label','Lempar dadu');d.addEventListener('click',()=>UI.tapRoll());}
      else{d.disabled=true;d.tabIndex=-1;d.setAttribute('aria-label','Dadu '+p.name);}
      if(this._rolling===i)d.classList.add('rolling');
      wd.append(pin,d,mk('span','arr'));
      const pl=mk('div','pills');
      if(p.armed)pl.appendChild(mk('span','pill d on','Dobel aktif'));
      [['dbl','d','Dobel'],['ss','s','Anti-ular'],['ts','t','Anti-tembak']].forEach(([k,c,l])=>{
        if(p[k]<=0)return;
        const use=k==='dbl'&&mine&&!p.armed;
        const s=mk(use?'button':'span','pill '+c,l+' '+p[k]);
        if(use){s.type='button';s.addEventListener('click',()=>{if(!UI.paused)G.scene.armDouble(p);});}
        pl.appendChild(s);
      });
      if(pl.childNodes.length)lab.appendChild(pl);
      el.append(lab,wd);
    }
  },
  status(t){$('#status').textContent=t;},
  turn(p){
    this.render();
    this.status(p.type==='human'?p.name+', giliranmu. Ketuk dadumu untuk melempar!':p.name+' sedang bermain...');
  },
  waitRoll(){return new Promise(res=>{this._roll=res;this.render();});},
  lock(){this._roll=null;this.render();},
  tapRoll(){const r=this._roll;if(r&&!this.paused){this._roll=null;Sound.click();this.render();r();}},
  rollStart(p){
    clearInterval(this._iv);this._rolling=p.i;this.render();
    this._iv=setInterval(()=>{const c=document.querySelector('#pp'+p.i+' canvas');if(c)drawDieFace(c,1+Math.floor(Math.random()*6),false);},90);
  },
  rollEnd(p,v){clearInterval(this._iv);this._rolling=-1;p.last=v;this.render();},
  toast(msg,kind){
    const w=$('#stageWrap');w.querySelectorAll('.toast').forEach(e=>e.remove());
    const d=document.createElement('div');d.className='toast '+(kind||'');d.textContent=msg;w.appendChild(d);
    setTimeout(()=>d.remove(),1700);
  },
  showWin(p){
    $('#winAv').src=p.avUrl;$('#winName').textContent=p.name+' menang!';
    $('#winSub').textContent=p.type==='cpu'?'Komputer sampai duluan di kotak 100. Coba lagi!':'Kamu sampai duluan di kotak 100.';
    $('#end').hidden=false;
  }
};
document.addEventListener('keydown',e=>{
  if(e.code==='Space'&&$('#setup').hidden&&$('#end').hidden&&UI._roll&&document.activeElement.tagName!=='INPUT'){e.preventDefault();UI.tapRoll();}
});

/* sound toggles */
function syncSnd(){
  document.querySelectorAll('[data-snd]').forEach(b=>{
    const m=b.dataset.snd==='music',on=m?Sound.isMusic():Sound.isSfx();
    b.setAttribute('aria-pressed',String(on));b.textContent=(m?'Musik ':'Efek ')+(on?'nyala':'mati');
  });
}
document.querySelectorAll('[data-snd]').forEach(b=>b.addEventListener('click',()=>{
  Sound.init();
  if(b.dataset.snd==='music')Sound.setMusic(!Sound.isMusic());else Sound.setSfx(!Sound.isSfx());
  syncSnd();Sound.click();
}));

/* setup sheet */
const cfg={n:3,slots:[
  {name:'Pemain 1',type:'human',icon:'horse',img:null},
  {name:'Komputer 1',type:'cpu',icon:'cat',img:null},
  {name:'Komputer 2',type:'cpu',icon:'dog',img:null},
  {name:'Komputer 3',type:'cpu',icon:'rabbit',img:null}]};
function rowEl(i){
  const s=cfg.slots[i],r=document.createElement('div');r.className='prow';r.style.setProperty('--c',PCOL[i]);
  const hd=document.createElement('div');hd.className='phead';
  const inp=document.createElement('input');inp.className='pname';inp.maxLength=14;inp.value=s.name;inp.id='pn'+i;
  inp.setAttribute('aria-label','Nama pemain '+(i+1));inp.addEventListener('input',()=>{s.name=inp.value;});
  const seg=document.createElement('div');seg.className='seg';
  [['human','Manusia'],['cpu','Komputer']].forEach(([t,l])=>{
    const b=document.createElement('button');b.type='button';b.textContent=l;b.setAttribute('aria-pressed',String(s.type===t));
    if(i===0)b.disabled=true;
    b.addEventListener('click',()=>{
      if(i===0||s.type===t)return;s.type=t;
      if(/^(Pemain|Komputer) \d$/.test(s.name))s.name=t==='cpu'?'Komputer '+i:'Pemain '+(i+1);
      renderSetup();
    });
    seg.appendChild(b);
  });
  hd.append(inp,seg);
  const chips=document.createElement('div');chips.className='chips';
  if(s.img){const b=document.createElement('button');b.type='button';b.className='tk';b.setAttribute('aria-pressed','true');b.setAttribute('aria-label','Foto kamu');
    b.appendChild(makeToken(null,PCOL[i],76,s.img));chips.appendChild(b);}
  ICONS.forEach(ic=>{
    const b=document.createElement('button');b.type='button';b.className='tk';b.setAttribute('aria-label',ic.n);
    b.setAttribute('aria-pressed',String(!s.img&&s.icon===ic.id));b.appendChild(makeToken(ic.id,PCOL[i],76));
    b.addEventListener('click',()=>{s.icon=ic.id;s.img=null;renderSetup();});chips.appendChild(b);
  });
  const up=document.createElement('label');up.className='upl';up.append(document.createTextNode(s.img?'Ganti foto':'Unggah foto'));
  const fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.id='ph'+i;
  fi.addEventListener('change',()=>{
    const f=fi.files&&fi.files[0];if(!f)return;
    const url=URL.createObjectURL(f),im=new Image();
    im.onload=()=>{s.img=cropPhoto(im);s.icon='photo';URL.revokeObjectURL(url);renderSetup();};
    im.onerror=()=>URL.revokeObjectURL(url);im.src=url;
  });
  up.appendChild(fi);chips.appendChild(up);
  r.append(hd,chips);return r;
}
function renderSetup(){
  const sg=$('#segN');sg.textContent='';
  [2,3,4].forEach(n=>{const b=document.createElement('button');b.type='button';b.textContent=n+' pemain';b.setAttribute('aria-pressed',String(cfg.n===n));
    b.addEventListener('click',()=>{cfg.n=n;renderSetup();});sg.appendChild(b);});
  const rows=$('#rows');rows.textContent='';
  for(let i=0;i<cfg.n;i++)rows.appendChild(rowEl(i));
}
function openSetup(){
  const running=inGame&&!G.over;
  if(running&&game)game.scene.pause('board');
  $('#btnResume').hidden=!running;$('#setup').hidden=false;renderSetup();
}
function startNew(players){
  Sound.init();syncSnd();
  UI._roll=null;clearInterval(UI._iv);UI._rolling=-1;
  lastPlayers=players;inGame=true;$('#setup').hidden=true;$('#end').hidden=true;
  setDims();game.scale.resize(VW,VH);requestAnimationFrame(()=>game.scale.refresh());
  const sc=game.scene.getScene('board');game.scene.resume('board');sc.scene.restart({players});
}
$('#btnGo').addEventListener('click',()=>{
  if(!game)return;
  startNew(cfg.slots.slice(0,cfg.n).map((s,i)=>({
    name:(s.name||'').trim()||(s.type==='cpu'?'Komputer '+i:'Pemain '+(i+1)),
    type:s.type,icon:s.icon,img:s.img,color:PCOL[i]})));
});
$('#btnResume').addEventListener('click',()=>{$('#setup').hidden=true;if(game)game.scene.resume('board');});
function openMenu(){
  if(!$('#menu').hidden)return;
  UI.paused=true;if(game)game.scene.pause('board');
  $('#menu').hidden=false;$('#btnMenuResume').focus();
}
function closeMenu(resume){
  $('#menu').hidden=true;UI.paused=false;
  if(resume&&game)game.scene.resume('board');
}
$('#btnMenu').addEventListener('click',openMenu);
$('#btnMenuResume').addEventListener('click',()=>closeMenu(true));
$('#menu').addEventListener('click',e=>{if(e.target.id==='menu')closeMenu(true);});
$('#btnMenuNew').addEventListener('click',()=>{closeMenu(false);openSetup();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#menu').hidden)closeMenu(true);});
function setFlip(v){
  cfg.flip=v;$('#app').classList.toggle('flip',v);
  ['#optFlip','#optFlip2'].forEach(s=>{$(s).checked=v;});
}
['#optFlip','#optFlip2'].forEach(s=>$(s).addEventListener('change',e=>setFlip(e.target.checked)));
setFlip(true);
$('#btnAgain').addEventListener('click',()=>{if(lastPlayers)startNew(lastPlayers);});
$('#btnToMenu').addEventListener('click',()=>{$('#end').hidden=true;inGame=false;openSetup();});

(async function boot(){
  syncSnd();renderSetup();
  try{await Promise.race([document.fonts.load('20px "Lilita One"'),new Promise(r=>setTimeout(r,2500))]);}catch(e){}
  if(!window.Phaser){UI.status('Phaser gagal dimuat. Periksa koneksi lalu muat ulang halaman.');return;}
  game=new Phaser.Game({type:Phaser.AUTO,parent:'stage',width:VW,height:VH,backgroundColor:'#f4b90b',
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},scene:[BoardScene]});
})();
