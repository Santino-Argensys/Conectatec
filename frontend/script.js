// Función para obtener los alumnos desde el backend y mostrarlos
async function fetchAlumnos() {
    try {
        const response = await fetch('https://conectatec-1.onrender.com/api/alumnos');
        if (!response.ok) throw new Error('Error al obtener alumnos');
        const alumnos = await response.json();

        // Si tu backend devuelve alumnos sin foto, agregamos una imagen genérica
        const alumnosConFoto = alumnos.map((alumno, idx) => ({
            ...alumno,
            img: alumno.img || (idx % 2 === 0 ? "student_placeholder_male.svg" : "student_placeholder_female.svg")
        }));

        renderAlumnosGrid(alumnosConFoto);
    } catch (err) {
        document.getElementById('alumnosGrid').innerHTML = `<p style="color:#a00">No se pudo cargar la lista de alumnos.</p>`;
    }
}

// Renderiza las tarjetas
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

// Busca alumnos según input
function buscarAlumnos(alumnos, val) {
    return alumnos.filter(alumno =>
        (alumno.nombre + " " + (alumno.apellido || "")).toLowerCase().includes(val) ||
        (alumno.carrera || "").toLowerCase().includes(val)
    );
}

// Login real con backend
document.addEventListener('DOMContentLoaded', () => {
    fetchAlumnos();

    // Búsqueda
    let alumnosGlobal = [];
    document.getElementById('busquedaAlumno').addEventListener('input', async (e) => {
        const val = e.target.value.toLowerCase();
        if (!alumnosGlobal.length) {
            try {
                const response = await fetch('https://conectatec-1.onrender.com/api/alumnos');
                alumnosGlobal = await response.json();
            } catch { return; }
        }
        renderAlumnosGrid(buscarAlumnos(alumnosGlobal, val));
    });

    // Modal de login
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
                // Guardar sesión/token si tenés login persistente
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

function showLogin() {
    document.getElementById('loginModal').classList.remove('hidden');
}
function hideLogin() {
    document.getElementById('loginModal').classList.add('hidden');
}

// Perfil modal
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
