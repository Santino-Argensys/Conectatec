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

<!-- PONER ESTO ANTES DE </body> (después de tu JS actual) -->
<script>
(() => {
  // ====== Robot que sigue al mouse (cabeza recortada) ======
  const robot = document.getElementById('robot');
  const head  = document.getElementById('robotHead');
  if (!robot || !head) return; // si aún no está en el DOM, salimos

  let targetRX = 0, targetRY = 0;
  let rx = 0, ry = 0;

  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const lerp  = (a,b,t) => a + (b - a) * t;

  // Lee límites desde CSS custom properties (--max-yaw / --max-pitch)
  const cssDeg = (name, fallback) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v.endsWith('deg') ? parseFloat(v) : fallback;
  };
  let MAX_YAW   = cssDeg('--max-yaw', 20);
  let MAX_PITCH = cssDeg('--max-pitch', 10);

  // Actualiza si cambian media queries
  new ResizeObserver(() => {
    MAX_YAW   = cssDeg('--max-yaw', 20);
    MAX_PITCH = cssDeg('--max-pitch', 10);
  }).observe(document.documentElement);

  // Throttle sutil del mousemove (mejor perf que disparar cada evento)
  let rafId = 0, pendingEvt = null;
  function onPointerMove(e){
    pendingEvt = e;
    if (!rafId) rafId = requestAnimationFrame(applyPointer);
  }
  function applyPointer(){
    rafId = 0;
    if (!pendingEvt) return;
    const e = pendingEvt; pendingEvt = null;

    const r = robot.getBoundingClientRect();
    const cx = r.left + r.width/2;
    const cy = r.top  + r.height/2;

    const nx = (e.clientX - cx) / (r.width/2);   // -1..1
    const ny = (e.clientY - cy) / (r.height/2);  // -1..1

    targetRY = clamp(nx * MAX_YAW,   -MAX_YAW,   MAX_YAW);
    targetRX = clamp(-ny * MAX_PITCH,-MAX_PITCH, MAX_PITCH);
  }

  function animate(){
    rx = lerp(rx, targetRX, 0.12);
    ry = lerp(ry, targetRY, 0.12);
    head.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    requestAnimationFrame(animate);
  }

  window.addEventListener('mousemove', onPointerMove, { passive:true });
  window.addEventListener('touchmove', ev => {
    const t = ev.touches && ev.touches[0];
    if (!t) return;
    onPointerMove({ clientX: t.clientX, clientY: t.clientY });
  }, { passive:true });

  animate();
})();
</script>


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
