// LOGIN
document.getElementById('loginForm').addEventListener('submit', async function(e){
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    const mensaje = document.getElementById('loginMessage');
    mensaje.textContent = "";

    console.log("Intentando login con:", { email, pass }); // LOG: datos enviados

    try {
        const response = await fetch('https://conectatec-1.onrender.com/api/alumnos/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });
        console.log("Respuesta recibida del backend:", response); // LOG: response crudo

        const data = await response.json();
        console.log("Body JSON recibido:", data); // LOG: body de la respuesta

        if (response.ok) {
            // Guardar sesión
            localStorage.setItem('usuarioConectatec', JSON.stringify(data));
            window.location.href = "index.html";
        } else {
            mensaje.textContent = data.error || "Credenciales incorrectas";
            mensaje.style.color = "#d00";
        }
    } catch (err) {
        console.error("Error en fetch login:", err); // LOG: error de red o fetch
        mensaje.textContent = "Error de conexión al servidor.";
        mensaje.style.color = "#d00";
    }
});

// MOSTRAR/OCULTAR registro
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

// REGISTRO
document.getElementById('registerForm').addEventListener('submit', async function(e){
    e.preventDefault();
    const nombre = document.getElementById('regNombre').value.trim();
    const apellido = document.getElementById('regApellido').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const carrera = document.getElementById('regCarrera').value.trim();
    const descripcion = document.getElementById('regDescripcion').value.trim();
    const telefono = document.getElementById('regTelefono').value.trim();
    const mensaje = document.getElementById('registerMessage');
    mensaje.textContent = "";

    console.log("Intentando registrar:", { nombre, apellido, email, password, carrera, descripcion, telefono });

    if (!nombre || !apellido || !email || !password || !carrera) {
        mensaje.textContent = "Completá todos los campos obligatorios.";
        mensaje.style.color = "#d00";
        return;
    }

    try {
        const response = await fetch('https://conectatec-1.onrender.com/api/alumnos/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellido, email, password, carrera, descripcion, telefono })
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
