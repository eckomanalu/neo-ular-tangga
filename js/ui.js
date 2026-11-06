
/* ===== UI: tray, toasts, setup sheet, bootstrap ===== */
const $=s=>document.querySelector(s);
let game=null,inGame=false,lastPlayers=null;
const UI={
  _roll:null,
  render(){
    const box=$('#players');box.textContent='';
    G.players.forEach(p=>{
      const d=document.createElement('div');d.className='chip'+(G.cur===p.i&&!G.over?' on':'');
      const im=document.createElement('img');im.src=p.avUrl;im.alt='';
      const w=document.createElement('div');w.className='who';
      const nm=document.createElement('div');nm.className='nm';nm.textContent=p.name;
      const sq=document.createElement('div');sq.className='sq';sq.textContent='Kotak '+p.pos+(p.type==='cpu'?' \u00b7 komputer':'');
      const pl=document.createElement('div');pl.className='pills';
      [['dbl','d','Dobel'],['ss','s','Anti-ular'],['ts','t','Anti-tembak']].forEach(([k,c,l])=>{
        if(p[k]>0){const s=document.createElement('span');s.className='pill '+c;s.textContent=l+' '+p[k];pl.appendChild(s);}});
      w.append(nm,sq,pl);d.append(im,w);box.appendChild(d);
    });
    this.btns();
  },
  btns(){
    const p=G.players[G.cur],mine=!!(p&&p.type==='human'&&!G.over&&this._roll);
    $('#btnRoll').disabled=!mine;
    const b=$('#btnDbl');b.classList.toggle('armed',!!(p&&p.armed));
    b.disabled=!(mine&&p.dbl>0&&!p.armed);
    b.textContent=p&&p.armed?'Dobel aktif':'Dobel Giliran'+(p&&p.type==='human'&&p.dbl>0?' ×'+p.dbl:'');
  },
  status(t){$('#status').textContent=t;},
  turn(p){
    this.render();
    this.status(p.type==='human'?p.name+', giliranmu. Lempar dadunya!':p.name+' sedang bermain...');
  },
  waitRoll(){return new Promise(res=>{this._roll=res;this.btns();});},
  lock(){this._roll=null;this.btns();},
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
$('#btnRoll').addEventListener('click',()=>{const r=UI._roll;if(r){UI._roll=null;Sound.click();UI.btns();r();}});
$('#btnDbl').addEventListener('click',()=>{if(UI._roll)G.scene.armDouble(G.players[G.cur]);});
document.addEventListener('keydown',e=>{
  if(e.code==='Space'&&$('#setup').hidden&&$('#end').hidden&&UI._roll&&document.activeElement.tagName!=='INPUT'){e.preventDefault();$('#btnRoll').click();}
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
  lastPlayers=players;inGame=true;$('#setup').hidden=true;$('#end').hidden=true;
  const sc=game.scene.getScene('board');game.scene.resume('board');sc.scene.restart({players});
}
$('#btnGo').addEventListener('click',()=>{
  if(!game)return;
  startNew(cfg.slots.slice(0,cfg.n).map((s,i)=>({
    name:(s.name||'').trim()||(s.type==='cpu'?'Komputer '+i:'Pemain '+(i+1)),
    type:s.type,icon:s.icon,img:s.img,color:PCOL[i]})));
});
$('#btnResume').addEventListener('click',()=>{$('#setup').hidden=true;if(game)game.scene.resume('board');});
$('#btnMenu').addEventListener('click',openSetup);
$('#btnMap').addEventListener('click',()=>{G.overview=!G.overview;$('#btnMap').setAttribute('aria-pressed',String(G.overview));if(G.scene&&G.scene.toks&&G.scene.toks.length)G.scene.setView();});
$('#btnAgain').addEventListener('click',()=>{if(lastPlayers)startNew(lastPlayers);});
$('#btnToMenu').addEventListener('click',()=>{$('#end').hidden=true;inGame=false;openSetup();});

(async function boot(){
  syncSnd();renderSetup();
  try{await Promise.race([document.fonts.load('20px "Lilita One"'),new Promise(r=>setTimeout(r,2500))]);}catch(e){}
  if(!window.Phaser){UI.status('Phaser gagal dimuat. Periksa koneksi lalu muat ulang halaman.');return;}
  game=new Phaser.Game({type:Phaser.AUTO,parent:'stage',width:VIEW,height:VIEW,backgroundColor:'#4a2f17',
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},scene:[BoardScene]});
})();
