// Verificar login
const session = JSON.parse(localStorage.getItem('usuarioConectatec'));
const user = session && session.user;
if (!user || !user.id) {
    window.location.href = "acceso.html";

const form = document.getElementById('perfilForm');
const msg = document.getElementById('perfilMsg');

// Cargar datos actuales
async function cargarPerfil() {
    try {
        const response = await fetch(`https://conectatec-1.onrender.com/api/alumnos/${user.id}`);
        const alumno = await response.json();
        document.getElementById('nombre').value = alumno.nombre || '';
        document.getElementById('apellido').value = alumno.apellido || '';
        document.getElementById('carrera').value = alumno.carrera || '';
        document.getElementById('descripcion').value = alumno.descripcion || '';
        document.getElementById('telefono').value = alumno.telefono || '';
    } catch (e) {
        msg.textContent = "Error al cargar perfil";
        msg.style.color = "#d00";
    }
}
cargarPerfil();

// Guardar cambios
form.addEventListener('submit', async function(e){
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const carrera = document.getElementById('carrera').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    try {
        const response = await fetch(`https://conectatec-1.onrender.com/api/alumnos/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellido, carrera, descripcion, telefono })
        });
        const data = await response.json();
        if (response.ok) {
            msg.textContent = "¡Perfil actualizado!";
            msg.style.color = "#0094d3";
        } else {
            msg.textContent = data.error || "Error al actualizar.";
            msg.style.color = "#d00";
        }
    } catch (err) {
        msg.textContent = "Error de conexión.";
        msg.style.color = "#d00";
    }
})}
