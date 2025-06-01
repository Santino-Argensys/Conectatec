Conectatec
Conectatec es una bolsa de trabajo digital orientada a alumnos de escuelas técnicas y empresas, creada para facilitar la conexión entre jóvenes talentos y oportunidades laborales reales.
Incluye registro y login, panel de alumno, visualización de perfiles y próximamente panel de administración.
📁 Estructura del Proyecto
/backend
  index.js         # Servidor Express y API REST
  db.js            # Configuración de PostgreSQL
  package.json     # Dependencias y scripts
  ...
/frontend
  index.html       # Página principal (listado de alumnos)
  perfil.html      # Panel de perfil del alumno
  acceso.html      # Login y registro de usuario
  style.css        # Estilos globales
  script.js        # Funciones del home
  perfil.js        # Funciones del perfil
  acceso.js        # Funciones de login/registro
  (imágenes, assets)
README.md
🚀 ¿Qué hace Conectatec?
Alumnos pueden registrarse, loguearse, ver y editar su perfil.

Empresas pueden visualizar perfiles de alumnos (próximamente: panel de empresas).

Acceso seguro mediante login/registro.

Panel de administración para gestión de usuarios (próximamente).

Diseño profesional, limpio y adaptado a dispositivos móviles.

Fácil de desplegar en Railway con backend y frontend integrados.
⚙️ Instalación y uso local
Clonar el repositorio:
git clone https://github.com/tuusuario/conectatec.git
cd conectatec
Instalar dependencias en /backend:
cd backend
npm install
Crear el archivo .env en /backend:
PORT=3000
DATABASE_URL=postgres://usuario:contraseña@host:puerto/basededatos
node index.js
Acceder desde el navegador:

http://localhost:3000
(El frontend se sirve automáticamente desde Express)
