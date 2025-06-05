// ======================================================
// 1) AL CARGAR LA PÁGINA: poblar los <select> de colegios y centros
// ======================================================
async function cargarColegios() {
    try {
        const res = await fetch('https://conectatec-1.onrender.com/api/colegios');
        if (!res.ok) throw new Error('Error al obtener colegios');
        const colegios = await res.json();
        const selectColegio = document.getElementById('regColegio');
        colegios.forEach(colegio => {
            const option = document.createElement('option');
            option.value = colegio.id;
            option.textContent = colegio.nombre;
            selectColegio.appendChild(option);
        });
    } catch (err) {
        console.error('Error cargando colegios:', err);
        // En caso de error, podrías mostrar un mensaje en pantalla si lo deseas
    }
}

async function cargarCentros() {
    try {
        const res = await fetch('https://conectatec-1.onrender.com/api/centros');
        if (!res.ok) throw new Error('Error al obtener centros');
        const centros = await res.json();
        const selectCentro = document.getElementById('regCentro');
        centros.forEach(centro => {
            const option = document.createElement('option');
            option.value = centro.id;
            option.textContent = centro.nombre;
            selectCentro.appendChild(option);
        });
    } catch (err) {
        console.error('Error cargando centros:', err);
        // En caso de error, podrías mostrar un mensaje en pantalla si lo deseas
    }
}

window.addEventListener('DOMContentLoaded', () => {
    cargarColegios();
    cargarCentros();
});

// ======================================================
// 2) Lógica de LOGIN
// ======================================================
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    const mensaje = document.getElementById('loginMessage');
    mensaje.textContent = "";

    console.log("Intentando login con:", { email, pass });

    try {
        const response = await fetch('https://conectatec-1.onrender.com/api/alumnos/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });
        console.log("Respuesta recibida del backend:", response);

        const data = await response.json();
        console.log("Body JSON recibido:", data);

        if (response.ok) {
            // Guardar sesión en localStorage (o cookie) si querés
            localStorage.setItem('usuarioConectatec', JSON.stringify(data));
            // Redirigir a la landing o a donde corresponda
            window.location.href = "index.html";
        } else {
            mensaje.textContent = data.error || "Credenciales incorrectas";
            mensaje.style.color = "#d00";
        }
    } catch (err) {
        console.error("Error en fetch login:", err);
        mensaje.textContent = "Error de conexión al servidor.";
        mensaje.style.color = "#d00";
    }
});

// ======================================================
// 3) Mostrar / Ocultar sección de Registro
// ======================================================
function mostrarRegistro() {
    document.getElementById('registerDiv').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('loginMessage').textContent = '';
}

function ocultarRegistro() {
    document.getElementById('registerDiv').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerMessage').textContent = '';
}

// ======================================================
// 4) Lógica de REGISTRO DE ALUMNO (con colegio_id y centro_id)
// ======================================================
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre       = document.getElementById('regNombre').value.trim();
    const apellido     = document.getElementById('regApellido').value.trim();
    const email        = document.getElementById('regEmail').value.trim();
    const password     = document.getElementById('regPassword').value;
    const selectColegio = document.getElementById('regColegio');
    const colegio_id   = selectColegio.value ? Number(selectColegio.value) : null;
    const selectCentro = document.getElementById('regCentro');
    const centro_id    = selectCentro.value ? Number(selectCentro.value) : null;
    const carrera      = document.getElementById('regCarrera').value.trim();
    const descripcion  = document.getElementById('regDescripcion').value.trim();
    const telefono     = document.getElementById('regTelefono').value.trim();
    const mensaje      = document.getElementById('registerMessage');
    mensaje.textContent = "";

    console.log("Intentando registrar:", { nombre, apellido, email, password, carrera, descripcion, telefono, colegio_id, centro_id });

    // Validaciones
    if (!nombre || !apellido || !email || !password || !carrera || !colegio_id) {
        mensaje.textContent = "Completá todos los campos obligatorios (incluyendo colegio).";
        mensaje.style.color = "#d00";
        return;
    }

    try {
        const response = await fetch('https://conectatec-1.onrender.com/api/alumnos/registro', {
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
        console.log("Respuesta recibida del backend en registro:", response);

        const data = await response.json();
        console.log("Body JSON recibido en registro:", data);

        if (response.ok) {
            mensaje.textContent = "¡Registro exitoso! Ya podés iniciar sesión.";
            mensaje.style.color = "#0094d3";
            setTimeout(() => {
                ocultarRegistro();
            }, 1200);
        } else {
            mensaje.textContent = data.error || "Error en el registro.";
            mensaje.style.color = "#d00";
        }
    } catch (err) {
        console.error("Error en fetch registro:", err);
        mensaje.textContent = "Error de conexión al servidor.";
        mensaje.style.color = "#d00";
    }
});
