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
// ===========================================================
// 1) VARIABLES GLOBALES
// ===========================================================
let alumnosGlobal = [];  
let colegiosGlobal = []; 
let centrosGlobal = [];  

// ===========================================================
// 2) CARGAR COLEGIOS Y CENTROS PARA LOS FILTROS (ALUMNOS)
// ===========================================================
async function cargarColegiosFiltro() {
    try {
        const res = await fetch('/api/colegios');
        if (!res.ok) throw new Error('Error al obtener colegios');
        colegiosGlobal = await res.json();
        // Poblamos el select de registro de alumnos
        const select = document.getElementById('regAlumnoColegio');
        colegiosGlobal.forEach(colegio => {
            const opt = document.createElement('option');
            opt.value = colegio.id;
            opt.textContent = colegio.nombre;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Error cargando colegios:', err);
    }
}

async function cargarCentrosFiltro() {
    try {
        const res = await fetch('/api/centros');
        if (!res.ok) throw new Error('Error al obtener centros');
        centrosGlobal = await res.json();
        // Poblamos el select de registro de alumnos
        const select = document.getElementById('regAlumnoCentro');
        centrosGlobal.forEach(centro => {
            const opt = document.createElement('option');
            opt.value = centro.id;
            opt.textContent = centro.nombre;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Error cargando centros:', err);
    }
}

// ===========================================================
// 3) SWITCH DE PESTAÑAS (Alumno vs Profesor)
// ===========================================================
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar/ocultar: al cargar, dejamos activa la pestaña “Alumno”
    mostrarSolo('Alumno');

    // Cuando el usuario hace clic en la tab “Alumno”
    document.getElementById('tabAlumno').addEventListener('click', () => {
        mostrarSolo('Alumno');
    });

    // Cuando hace clic en la tab “Profesor/Empresa”
    document.getElementById('tabProfesor').addEventListener('click', () => {
        mostrarSolo('Profesor');
    });

    // Cargamos los select de colegios y centros para el registro de alumnos
    cargarColegiosFiltro();
    cargarCentrosFiltro();

    // Asociamos los forms a sus funciones
    inicializarEventosAlumno();
    inicializarEventosProfesor();

    // === Enlaces de ALUMNO (mostrar/ocultar registro) ===
document.getElementById('linkRegistroAlumno')?.addEventListener('click', (e)=>{
  e.preventDefault();
  window.mostrarRegistroAlumno();
});
document.getElementById('linkVolverLoginAlumno')?.addEventListener('click', (e)=>{
  e.preventDefault();
  window.ocultarRegistroAlumno();
});

// === Enlaces de PROFESOR/EMPRESA (mostrar/ocultar registro) ===
document.getElementById('linkRegistroProfesor')?.addEventListener('click', (e)=>{
  e.preventDefault();
  window.mostrarRegistroProfesor();
});
document.getElementById('linkVolverLoginProfesor')?.addEventListener('click', (e)=>{
  e.preventDefault();
  window.ocultarRegistroProfesor();
});

    // Preview de la foto (si el input existe en el HTML)
    const fotoInput = document.getElementById('regAlumnoFoto');
    const fotoPreview = document.getElementById('regAlumnoFotoPreview');
    if (fotoInput && fotoPreview) {
        fotoInput.addEventListener('change', (e) => {
            const f = e.target.files?.[0];
            if (f) {
                fotoPreview.src = URL.createObjectURL(f);
                fotoPreview.style.display = 'block';
            } else {
                fotoPreview.src = '';
                fotoPreview.style.display = 'none';
            }
        });
    }
});

// Función para mostrar solo los bloques que correspondan
function mostrarSolo(tipo) {
    const elements = {
        Alumno: ['loginAlumnoDiv', 'registerAlumnoDiv'],
        Profesor: ['loginProfesorDiv', 'registerProfesorDiv']
    };

    // 1) Ocultamos TODO
    document.getElementById('loginAlumnoDiv').classList.add('hidden');
    document.getElementById('registerAlumnoDiv').classList.add('hidden');
    document.getElementById('loginProfesorDiv').classList.add('hidden');
    document.getElementById('registerProfesorDiv').classList.add('hidden');

    // 2) Desactivamos clases “active” de tabs
    document.getElementById('tabAlumno').classList.remove('active');
    document.getElementById('tabProfesor').classList.remove('active');

    if (tipo === 'Alumno') {
        document.getElementById('loginAlumnoDiv').classList.remove('hidden');
        document.getElementById('tabAlumno').classList.add('active');
    } else {
        document.getElementById('loginProfesorDiv').classList.remove('hidden');
        document.getElementById('tabProfesor').classList.add('active');
    }
}

// ===========================================================
// 4) EVENTOS Y LÓGICA PARA ALUMNOS
// ===========================================================
function inicializarEventosAlumno() {
    // 4.1) Mostrar registro alumno
    window.mostrarRegistroAlumno = function() {
        document.getElementById('loginAlumnoDiv').classList.add('hidden');
        document.getElementById('registerAlumnoDiv').classList.remove('hidden');
        document.getElementById('loginAlumnoMessage').textContent = '';
    };

    // 4.2) Ocultar registro alumno (volver a pantalla de login)
    window.ocultarRegistroAlumno = function() {
        document.getElementById('registerAlumnoDiv').classList.add('hidden');
        document.getElementById('loginAlumnoDiv').classList.remove('hidden');
        document.getElementById('registerAlumnoMessage').textContent = '';
    };

    // 4.3) Registro de alumno (+ subida opcional de foto y CV)
    document.getElementById('registerAlumnoForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre        = document.getElementById('regAlumnoNombre').value.trim();
        const apellido      = document.getElementById('regAlumnoApellido').value.trim();
        const email         = document.getElementById('regAlumnoEmail').value.trim();
        const password      = document.getElementById('regAlumnoPassword').value;
        const selectColegio = document.getElementById('regAlumnoColegio');
        const colegio_id    = selectColegio.value ? Number(selectColegio.value) : null;
        const selectCentro  = document.getElementById('regAlumnoCentro');
        const centro_id     = selectCentro.value ? Number(selectCentro.value) : null;
        const carrera       = document.getElementById('regAlumnoCarrera').value.trim();
        const descripcion   = document.getElementById('regAlumnoDescripcion').value.trim();
        const telefono      = document.getElementById('regAlumnoTelefono').value.trim();
        const mensaje       = document.getElementById('registerAlumnoMessage');
        mensaje.textContent = "";

        if (!nombre || !apellido || !email || !password || !carrera || !colegio_id) {
            mensaje.textContent = "Completá todos los campos obligatorios (incluyendo colegio).";
            mensaje.style.color = "#d00";
            return;
        }

        try {
            // Paso 1: registrar alumno (JSON)
            const response = await fetch('/api/alumnos/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    email,
                    password,
                    carrera,
                    descripcion,
                    telefono,
                    colegio_id,
                    centro_id
                })
            });
            const data = await response.json();
            if (!response.ok) {
                mensaje.textContent = data.error || "Error en el registro.";
                mensaje.style.color = "#d00";
                return;
            }

            // Intentamos obtener el ID del nuevo alumno
            const nuevoId = data?.id ?? data?.user?.id ?? data?.alumnoId;
            // Paso 2 (opcional): si hay archivos, subirlos con FormData a /api/upload
            const fotoFile = document.getElementById('regAlumnoFoto')?.files?.[0] || null;
            const cvFile   = document.getElementById('regAlumnoCV')?.files?.[0] || null;

            if (nuevoId && (fotoFile || cvFile)) {
                const fd = new FormData();
                fd.append('userId', String(nuevoId));
                if (fotoFile) fd.append('foto', fotoFile);
                if (cvFile)   fd.append('cv', cvFile);

                try {
                    const upRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: fd
                    });
                    const upData = await upRes.json();
                    if (!upRes.ok || !upData?.success) {
                        console.warn('Subida de archivos fallida/parcial:', upData);
                    }
                } catch (eUp) {
                    console.warn('No se pudieron subir los archivos:', eUp);
                }
            }

            mensaje.textContent = "¡Registro exitoso! Ya podés iniciar sesión.";
            mensaje.style.color = "#0094d3";
            setTimeout(ocultarRegistroAlumno, 1200);

        } catch (err) {
            mensaje.textContent = "Error de conexión al servidor.";
            mensaje.style.color = "#d00";
            console.error('Error en registro alumno:', err);
        }
    });

    // 4.4) Login de alumno (modal)
    document.getElementById('loginAlumnoForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginAlumnoEmail').value.trim();
        const pass = document.getElementById('loginAlumnoPassword').value;
        const mensaje = document.getElementById('loginAlumnoMessage');
        mensaje.textContent = "";

        try {
            const response = await fetch('/api/alumnos/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('usuarioConectatec', JSON.stringify(data));
                mensaje.textContent = "¡Bienvenido/a!";
                mensaje.style.color = "#0094d3";
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 800);
            } else {
                mensaje.textContent = data.error || "Credenciales incorrectas";
                mensaje.style.color = "#d00";
            }
        } catch (err) {
            mensaje.textContent = "Error de conexión al servidor.";
            mensaje.style.color = "#d00";
            console.error('Error en login alumno:', err);
        }
    });
}

// ===========================================================
// 5) EVENTOS Y LÓGICA PARA PROFESORES/EMPRESAS
// ===========================================================
function inicializarEventosProfesor() {
    // 5.1) Mostrar registro profesor
    window.mostrarRegistroProfesor = function() {
        document.getElementById('loginProfesorDiv').classList.add('hidden');
        document.getElementById('registerProfesorDiv').classList.remove('hidden');
        document.getElementById('loginProfesorMessage').textContent = '';
    };

    // 5.2) Ocultar registro profesor (volver a login profesor)
    window.ocultarRegistroProfesor = function() {
        document.getElementById('registerProfesorDiv').classList.add('hidden');
        document.getElementById('loginProfesorDiv').classList.remove('hidden');
        document.getElementById('registerProfesorMessage').textContent = '';
    };

    // 5.3) Registro de profesor/empresa
    document.getElementById('registerProfesorForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre_completo = document.getElementById('regProfesorNombre').value.trim();
        const email          = document.getElementById('regProfesorEmail').value.trim();
        const password       = document.getElementById('regProfesorPassword').value;
        const institucion    = document.getElementById('regProfesorInstitucion').value.trim();
        const cargo          = document.getElementById('regProfesorCargo').value.trim();
        const telefono       = document.getElementById('regProfesorTelefono').value.trim();
        const mensaje        = document.getElementById('registerProfesorMessage');
        mensaje.textContent = "";

        if (!nombre_completo || !email || !password || !institucion) {
            mensaje.textContent = "Completá todos los campos obligatorios.";
            mensaje.style.color = "#d00";
            return;
        }

        try {
            const response = await fetch('/api/profesores/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_completo,
                    email,
                    password,
                    institucion,
                    cargo,
                    telefono
                })
            });
            const data = await response.json();
            if (response.ok) {
                mensaje.textContent = "¡Registro exitoso! Ya podés iniciar sesión.";
                mensaje.style.color = "#0094d3";
                setTimeout(ocultarRegistroProfesor, 1200);
            } else {
                mensaje.textContent = data.error || "Error en el registro.";
                mensaje.style.color = "#d00";
            }
        } catch (err) {
            mensaje.textContent = "Error de conexión al servidor.";
            mensaje.style.color = "#d00";
            console.error('Error en registro profesor:', err);
        }
    });

    // 5.4) Login de profesor/empresa
    document.getElementById('loginProfesorForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginProfesorEmail').value.trim();
        thePass = document.getElementById('loginProfesorPassword').value;
        const mensaje = document.getElementById('loginProfesorMessage');
        mensaje.textContent = "";

        try {
            const response = await fetch('/api/profesores/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: thePass })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('usuarioConectatec', JSON.stringify(data));
                mensaje.textContent = "¡Bienvenido/a!";
                mensaje.style.color = "#0094d3";
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 800);
            } else {
                mensaje.textContent = data.error || "Credenciales incorrectas";
                mensaje.style.color = "#d00";
            }
        } catch (err) {
            mensaje.textContent = "Error de conexión al servidor.";
            mensaje.style.color = "#d00";
            console.error('Error en login profesor:', err);
        }
    });
}

// ===========================================================
// 6) FUNCIONES PARA MODALES Y LOGOUT
// ===========================================================
function showLogin() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function hideLogin() {
    document.getElementById('loginModal').classList.add('hidden');
}

function showPerfil(alumno) {
    const perfil = `
        <img src="${alumno.img}" alt="Alumno">
        <h3>${alumno.nombre} ${alumno.apellido || ""}</h3>
        <div class="perfil-carrera">${alumno.carrera || ""}</div>
        <div class="perfil-descripcion">${alumno.descripcion || ""}</div>
        <div class="perfil-email">Email: ${alumno.email || ""}</div>
        <div class="perfil-telefono">Tel: ${alumno.telefono || ""}</div>
    `;
    document.getElementById('perfilContent').innerHTML = perfil;
    document.getElementById('perfilModal').classList.remove('hidden');
}

function hidePerfil() {
    document.getElementById('perfilModal').classList.add('hidden');
}

function logout() {
    localStorage.removeItem('usuarioConectatec');
    window.location.href = "acceso.html";
}


