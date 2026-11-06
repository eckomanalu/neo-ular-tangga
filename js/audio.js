/* ===== Audio: music and effects synthesised with WebAudio, no files ===== */
const Sound=(()=>{
  let ctx=null,master,musG,sfxG,noiseBuf,timer=null,step=0,next=0,musicOn=true,sfxOn=true;
  const STEP=60/108/2;
  const CH=[[261.63,329.63,392.0],[220.0,261.63,329.63],[174.61,220.0,261.63],[196.0,246.94,293.66]];
  const ROOT=[130.81,110.0,87.31,98.0];
  const PENTA=[523.25,587.33,659.25,783.99,880.0];
  const MEL=[];
  (function(){let s=11;const r=()=>(s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff;
    for(let i=0;i<32;i++){MEL.push((i%8===0||r()<0.45)?PENTA[Math.floor(r()*5)]:0);}})();

  function init(){
    if(ctx){if(ctx.state==='suspended')ctx.resume();return;}
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    ctx=new AC();
    master=ctx.createGain();master.gain.value=0.9;master.connect(ctx.destination);
    musG=ctx.createGain();musG.gain.value=musicOn?0.5:0;musG.connect(master);
    sfxG=ctx.createGain();sfxG.gain.value=sfxOn?1:0;sfxG.connect(master);
    const n=ctx.sampleRate;noiseBuf=ctx.createBuffer(1,n,n);
    const d=noiseBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
    document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else ctx.resume();});
    if(musicOn)startMusic();
  }
  function tone(f,t,dur,type,vol,dest,f2){
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type||'sine';o.frequency.setValueAtTime(f,t);
    if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.linearRampToValueAtTime(vol,t+Math.min(0.012,dur/4));
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(dest||sfxG);o.start(t);o.stop(t+dur+0.05);
  }
  function noise(t,dur,vol,type,f0,f1,dest,q){
    const s=ctx.createBufferSource();s.buffer=noiseBuf;
    const f=ctx.createBiquadFilter();f.type=type||'bandpass';f.frequency.setValueAtTime(f0,t);
    if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);
    if(q)f.Q.value=q;
    const g=ctx.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(dest||sfxG);s.start(t,Math.random()*0.4);s.stop(t+dur+0.05);
  }
  /* background music: 4-bar loop, bass + arpeggio + pentatonic melody + light drums */
  function playStep(s,t){
    const bar=Math.floor(s/8),i=s%8,ch=CH[bar];
    if(i===0||i===3||i===6)tone(ROOT[bar]*(i===3?2:1),t,STEP*1.6,'triangle',0.30,musG);
    if(i===4)tone(ROOT[bar]*1.5,t,STEP*1.4,'triangle',0.22,musG);
    tone(ch[i%3]*(i>=4?2:1),t,STEP*1.8,'sine',0.11,musG);
    if(MEL[s])tone(MEL[s],t,STEP*1.5,'triangle',0.10,musG);
    if(i%4===0)tone(140,t,0.2,'sine',0.5,musG,45);
    if(i%2===1)noise(t,0.04,0.05,'highpass',7000,null,musG);
    if(i===2||i===6)noise(t,0.12,0.09,'bandpass',1800,900,musG,1.2);
  }
  function sched(){while(next<ctx.currentTime+0.3){playStep(step,next);next+=STEP;step=(step+1)%32;}}
  function startMusic(){if(!ctx||timer)return;step=0;next=ctx.currentTime+0.1;timer=setInterval(sched,60);}
  function stopMusic(){if(timer){clearInterval(timer);timer=null;}}
  function setMusic(on){
    musicOn=on;
    if(ctx){musG.gain.setTargetAtTime(on?0.5:0,ctx.currentTime,0.05);if(on)startMusic();else stopMusic();}
  }
  function setSfx(on){sfxOn=on;if(ctx)sfxG.gain.setTargetAtTime(on?1:0,ctx.currentTime,0.02);}

  const A=()=>ctx&&sfxOn;
  const now=()=>ctx.currentTime;
  const FX={
    click(){if(!A())return;tone(740,now(),0.07,'square',0.1);},
    rattle(total){if(!A())return;const t0=now();let tt=0,gap=0.04;
      while(tt<(total||1.1)){const t=t0+tt;noise(t,0.035,0.3,'bandpass',2200+Math.random()*2800,null,null,3);
        tone(150+Math.random()*120,t,0.04,'square',0.05);tt+=gap;gap*=1.12;}},
    land(){if(!A())return;const t=now();tone(160,t,0.2,'sine',0.5,null,50);noise(t,0.08,0.3,'lowpass',900,300);},
    step(i){if(!A())return;const sc=[392,440,523.25,587.33,659.25,783.99];tone(sc[i%6]*(i>5?2:1),now(),0.11,'triangle',0.2);},
    ladder(dur,n){if(!A())return;const t0=now();
      for(let k=0;k<n;k++){const t=t0+k*(dur/n);tone(250+k*45,t,0.1,'triangle',0.25);noise(t,0.04,0.18,'bandpass',900,null,null,2);}
      [523.25,659.25,783.99,1046.5].forEach((f,k)=>tone(f,t0+dur+k*0.07,0.22,'sine',0.2));},
    hiss(){if(!A())return;noise(now(),0.55,0.35,'highpass',3500,7500);},
    bite(){if(!A())return;const t=now();noise(t,0.25,0.5,'lowpass',1500,200);tone(110,t,0.28,'square',0.3,null,45);},
    slide(){if(!A())return;const t=now();tone(1100,t,1.3,'triangle',0.22,null,130);tone(1108,t,1.3,'sine',0.1,null,135);},
    gift(){if(!A())return;const t=now();[659.25,783.99,987.77,1318.5,1567.98].forEach((f,k)=>tone(f,t+k*0.07,0.3,'sine',0.2));noise(t+0.2,0.4,0.05,'highpass',8000);},
    power(){if(!A())return;const t=now();tone(300,t,0.4,'sawtooth',0.12,null,1200);tone(1200,t+0.35,0.3,'sine',0.2);},
    pew(){if(!A())return;const t=now();tone(1600,t,0.22,'sawtooth',0.18,null,180);},
    boom(){if(!A())return;const t=now();noise(t,0.6,0.7,'lowpass',1400,100);tone(100,t,0.5,'sine',0.6,null,30);},
    shield(){if(!A())return;const t=now();tone(1300,t,0.5,'sine',0.25);tone(1950,t,0.4,'sine',0.15);noise(t,0.05,0.3,'highpass',6000);},
    extra(){if(!A())return;const t=now();[523.25,659.25,783.99].forEach((f,k)=>tone(f,t+k*0.08,0.2,'triangle',0.22));},
    turn(){if(!A())return;const t=now();tone(523.25,t,0.09,'sine',0.14);tone(659.25,t+0.08,0.12,'sine',0.14);},
    fanfare(){if(!A())return;const t=now();
      [[523.25,0],[523.25,0.14],[523.25,0.28],[659.25,0.42],[783.99,0.7],[659.25,0.98],[783.99,1.12],[1046.5,1.4]]
        .forEach(([f,d])=>{tone(f,t+d,0.4,'square',0.12);tone(f/2,t+d,0.4,'triangle',0.2);});}
  };
  return Object.assign({init,setMusic,setSfx,startMusic,isMusic:()=>musicOn,isSfx:()=>sfxOn},FX);
})();
