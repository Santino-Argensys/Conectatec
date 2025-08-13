// ===========================================================
// 1) VARIABLES GLOBALES
// ===========================================================
let alumnosGlobal = [];  // lista completa
let colegiosGlobal = [];
let centrosGlobal  = [];

// Helpers de imagen
function photoUrlFor(alumno) {
  // Endpoint del backend que sirve la foto desde Postgres (BYTEA)
  return `/api/users/${alumno.id}/photo`;
}
function placeholderFor(alumno) {
  // Alterna por id para variedad
  return (Number(alumno.id) % 2 === 0)
    ? "img/student_placeholder_male.svg"
    : "img/student_placeholder_female.svg";
}

// ===========================================================
// 2) CARGAR COLEGIOS Y CENTROS PARA LOS FILTROS
// ===========================================================
async function cargarColegiosFiltro() {
  try {
    const res = await fetch('/api/colegios');
    if (!res.ok) throw new Error('Error al obtener colegios');
    colegiosGlobal = await res.json();
    const select = document.getElementById('filtroColegio');
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
    const select = document.getElementById('filtroCentro');
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
// 3) OBTENER Y RENDERIZAR ALUMNOS
// ===========================================================
async function fetchAlumnos() {
  try {
    const response = await fetch('/api/alumnos');
    if (!response.ok) throw new Error('Error al obtener alumnos');
    const alumnos = await response.json();

    // Guardamos tal cual vienen; resolvemos foto/placeholder al renderizar
    alumnosGlobal = alumnos;

    actualizarListado();
  } catch (err) {
    document.getElementById('alumnosGrid').innerHTML =
      `<p style="color:#a00">No se pudo cargar la lista de alumnos.</p>`;
    console.error(err);
  }
}

// ===========================================================
// 4) FILTRADO Y RENDER
// ===========================================================
function filterAlumnos() {
  const filtroColegio  = document.getElementById('filtroColegio').value;
  const filtroCentro   = document.getElementById('filtroCentro').value;
  const textoBusqueda  = document.getElementById('busquedaAlumno').value.trim().toLowerCase();

  return alumnosGlobal.filter(alumno => {
    if (filtroColegio && String(alumno.colegio_id) !== filtroColegio) return false;
    if (filtroCentro  && String(alumno.centro_id)  !== filtroCentro)  return false;

    if (textoBusqueda) {
      const nombreCompleto = (alumno.nombre + " " + (alumno.apellido || "")).toLowerCase();
      const carrera = (alumno.carrera || "").toLowerCase();
      if (!nombreCompleto.includes(textoBusqueda) && !carrera.includes(textoBusqueda)) {
        return false;
      }
    }
    return true;
  });
}

function actualizarListado() {
  const filtrados = filterAlumnos();
  renderAlumnosGrid(filtrados);
}

function renderAlumnosGrid(list) {
  const grid = document.getElementById('alumnosGrid');
  grid.innerHTML = "";
  if (!list.length) {
    grid.innerHTML = "<p>No se encontraron alumnos.</p>";
    return;
  }

  list.forEach((alumno) => {
    const card = document.createElement('div');
    card.className = "alumno-card";

    // Usamos la URL del backend y fallback por onerror
    const imgUrl = photoUrlFor(alumno);
    const fallback = placeholderFor(alumno);

    card.innerHTML = `
      <img src="${imgUrl}"
           alt="Alumno"
           onerror="this.onerror=null; this.src='${fallback}';" />
      <div class="alumno-nombre">${alumno.nombre} ${alumno.apellido || ""}</div>
      <div class="alumno-carrera">${alumno.carrera || ""}</div>
      <div class="alumno-descripcion">${alumno.descripcion || ""}</div>
      <button class="ver-perfil-btn">Ver perfil</button>
    `;

    card.querySelector('.ver-perfil-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      showPerfil(alumno);
    });

    grid.appendChild(card);
  });
}

// ===========================================================
// 5) EVENTOS AL CARGAR
// ===========================================================
document.addEventListener('DOMContentLoaded', () => {
  cargarColegiosFiltro();
  cargarCentrosFiltro();
  fetchAlumnos();

  document.getElementById('filtroColegio').addEventListener('change', actualizarListado);
  document.getElementById('filtroCentro').addEventListener('change', actualizarListado);
  document.getElementById('busquedaAlumno').addEventListener('input', actualizarListado);

  document.getElementById('loginForm').addEventListener('submit', async function(e){
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass  = document.getElementById('loginPassword').value;
    const mensaje = document.getElementById('loginMessage');
    mensaje.textContent = "";

    try {
      const response = await fetch('/api/alumnos/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await response.json();

      if (response.ok) {
        mensaje.textContent = "¡Bienvenido/a!";
        mensaje.style.color = "#0094d3";
        setTimeout(hideLogin, 1200);
      } else {
        mensaje.textContent = data.error || "Credenciales incorrectas";
        mensaje.style.color = "#d00";
      }
    } catch (err) {
      mensaje.textContent = "Error de conexión al servidor.";
      mensaje.style.color = "#d00";
    }
  });
});

// ===========================================================
// 6) MODALES, PERFIL Y LOGOUT
// ===========================================================
function showLogin() {
  document.getElementById('loginModal').classList.remove('hidden');
}
function hideLogin() {
  document.getElementById('loginModal').classList.add('hidden');
}

function showPerfil(alumno) {
  const imgUrl = photoUrlFor(alumno);
  const fallback = placeholderFor(alumno);
  const cvUrl = `/api/users/${alumno.id}/cv`; // link al CV si existe en backend

  const perfil = `
    <img src="${imgUrl}" alt="Alumno"
         onerror="this.onerror=null; this.src='${fallback}';">
    <h3>${alumno.nombre} ${alumno.apellido || ""}</h3>
    <div class="perfil-carrera">${alumno.carrera || ""}</div>
    <div class="perfil-descripcion">${alumno.descripcion || ""}</div>
    <div class="perfil-email">Email: ${alumno.email || ""}</div>
    <div class="perfil-telefono">Tel: ${alumno.telefono || ""}</div>
    <div class="perfil-cv">
      <a href="${cvUrl}" target="_blank" rel="noreferrer">Ver/Descargar CV (PDF)</a>
    </div>
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
