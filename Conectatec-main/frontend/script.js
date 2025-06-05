// ===========================================================
// 1) VARIABLES GLOBALES
// ===========================================================
let alumnosGlobal = [];  // Guardaremos la lista completa de alumnos aquí
let colegiosGlobal = []; // Lista de colegios para poblar el select
let centrosGlobal = [];  // Lista de centros para poblar el select

// ===========================================================
// 2) CARGAR COLEGIOS Y CENTROS PARA LOS FILTROS
// ===========================================================
async function cargarColegiosFiltro() {
    try {
        const res = await fetch('https://conectatec-1.onrender.com/api/colegios');
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
        // Podrías mostrar un mensaje en pantalla, si lo deseas
    }
}

async function cargarCentrosFiltro() {
    try {
        const res = await fetch('https://conectatec-1.onrender.com/api/centros');
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
        // Podrías mostrar un mensaje en pantalla, si lo deseas
    }
}

// ===========================================================
// 3) OBTENER Y RENDERIZAR ALUMNOS
// ===========================================================
async function fetchAlumnos() {
    try {
        const response = await fetch('https://conectatec-1.onrender.com/api/alumnos');
        if (!response.ok) throw new Error('Error al obtener alumnos');
        const alumnos = await response.json();

        // Agregar una imagen placeholder si no tienen "img" en el objeto
        alumnosGlobal = alumnos.map((alumno, idx) => ({
            ...alumno,
            img: alumno.img || (idx % 2 === 0
                ? "img/student_placeholder_male.svg"
                : "img/student_placeholder_female.svg")
        }));

        // Mostrar inicialmente todos los alumnos
        actualizarListado();
    } catch (err) {
        document.getElementById('alumnosGrid').innerHTML =
          `<p style="color:#a00">No se pudo cargar la lista de alumnos.</p>`;
        console.error(err);
    }
}

// ===========================================================
// 4) FUNCIONES DE FILTRADO Y RENDERIZADO
// ===========================================================

function filterAlumnos() {
    const filtroColegio = document.getElementById('filtroColegio').value;
    const filtroCentro = document.getElementById('filtroCentro').value;
    const textoBusqueda = document.getElementById('busquedaAlumno').value.trim().toLowerCase();

    return alumnosGlobal.filter(alumno => {
        // Filtrar por colegio_id si se seleccionó uno
        if (filtroColegio && String(alumno.colegio_id) !== filtroColegio) {
            return false;
        }
        // Filtrar por centro_id si se seleccionó uno
        if (filtroCentro && String(alumno.centro_id) !== filtroCentro) {
            return false;
        }
        // Filtrar por texto (nombre + apellido o carrera)
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

// Renderiza las tarjetas de alumnos en el grid
function renderAlumnosGrid(list) {
    const grid = document.getElementById('alumnosGrid');
    grid.innerHTML = "";
    if (!list.length) {
        grid.innerHTML = "<p>No se encontraron alumnos.</p>";
        return;
    }
    list.forEach((alumno, idx) => {
        const card = document.createElement('div');
        card.className = "alumno-card";
        card.innerHTML = `
            <img src="${alumno.img}" alt="Alumno">
            <div class="alumno-nombre">${alumno.nombre} ${alumno.apellido || ""}</div>
            <div class="alumno-carrera">${alumno.carrera || ""}</div>
            <div class="alumno-descripcion">${alumno.descripcion || ""}</div>
            <button class="ver-perfil-btn" data-idx="${idx}">Ver perfil</button>
        `;
        card.querySelector('.ver-perfil-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showPerfil(alumno);
        });
        grid.appendChild(card);
    });
}

// ===========================================================
// 5) EVENTOS AL CARGAR EL DOCUMENTO
// ===========================================================
document.addEventListener('DOMContentLoaded', () => {
    // 5.1) Cargar filtros de colegios y centros
    cargarColegiosFiltro();
    cargarCentrosFiltro();

    // 5.2) Obtener y mostrar todos los alumnos
    fetchAlumnos();

    // 5.3) Listener: cada vez que cambie el select "Colegio" o "Centro", actualizar lista
    document.getElementById('filtroColegio').addEventListener('change', actualizarListado);
    document.getElementById('filtroCentro').addEventListener('change', actualizarListado);

    // 5.4) Listener: al tipear en el buscador, actualizar lista
    document.getElementById('busquedaAlumno').addEventListener('input', actualizarListado);

    // 5.5) Lógica de login dentro del modal
    document.getElementById('loginForm').addEventListener('submit', async function(e){
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        const mensaje = document.getElementById('loginMessage');
        mensaje.textContent = "";

        try {
            const response = await fetch('https://conectatec-1.onrender.com/api/alumnos/login', {
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
