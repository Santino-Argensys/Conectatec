// ====== Partículas minimalistas ======
const c = document.getElementById('bg');
const ctx = c.getContext('2d');
let W, H, P = [];

function resize(){
  W = c.width  = window.innerWidth;
  H = c.height = window.innerHeight;
  const n = Math.min(120, Math.floor((W*H)/18000));
  P = Array.from({length:n}, () => ({
    x: Math.random()*W,
    y: Math.random()*H,
    vx: (Math.random()*2-1)*0.25,
    vy: (Math.random()*2-1)*0.25,
    r: Math.random()*1.6+0.4
  }));
}
resize();
window.addEventListener('resize', resize);

function loop(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  P.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0||p.x>W) p.vx*=-1;
    if(p.y<0||p.y>H) p.vy*=-1;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
  });
  ctx.strokeStyle = 'rgba(139,92,246,0.14)';
  for(let i=0;i<P.length;i++){
    for(let j=i+1;j<P.length;j++){
      const a=P[i], b=P[j];
      const dx=a.x-b.x, dy=a.y-b.y, d=dx*dx+dy*dy;
      if(d<150*150){
        ctx.globalAlpha = 1 - d/(150*150);
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(loop);
}
loop();

// ====== Menú hamburguesa ======
const burger = document.querySelector('.hamburger');
const menu   = document.querySelector('.menu');
if (burger && menu){
  burger.addEventListener('click', ()=> menu.classList.toggle('open'));
}

// ====== Reveal on scroll ======
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.style.opacity=1; e.target.style.transform='none'; io.unobserve(e.target);}
  });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

// ====== Suavizar scroll en anchors ======
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length>1){
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({behavior:'smooth', block:'start'});
      menu?.classList.remove('open');
    }
  });
});
