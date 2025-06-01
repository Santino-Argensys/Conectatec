require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

// ... arriba ya tenés el require y configuración

// Registro de alumno
app.post('/api/alumnos/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(
      'SELECT id, nombre, apellido, email, carrera, descripcion, telefono FROM alumnos WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json({ user: result.rows[0], tipo: "alumno" });
    } else {
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error interno al iniciar sesión" });
  }
});

app.post('/api/alumnos/registro', async (req, res) => {
  const { nombre, apellido, email, password, carrera, descripcion, telefono } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO alumnos (nombre, apellido, email, password, carrera, descripcion, telefono) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [nombre, apellido, email, password, carrera, descripcion, telefono]
    );
    res.status(201).json({ id: result.rows[0].id, message: "Alumno registrado exitosamente" });
  } catch (error) {
    if (error.code === '23505') { // email duplicado
      res.status(409).json({ error: "El email ya está registrado" });
    } else {
      res.status(500).json({ error: "Error interno al registrar alumno" });
    }
  }
});

// Registro de empresa
app.post('/api/empresas/registro', async (req, res) => {
  const { nombre_empresa, email, password, descripcion, telefono } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO empresas (nombre_empresa, email, password, descripcion, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nombre_empresa, email, password, descripcion, telefono]
    );
    res.status(201).json({ id: result.rows[0].id, message: "Empresa registrada exitosamente" });
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: "El email ya está registrado" });
    } else {
      res.status(500).json({ error: "Error interno al registrar empresa" });
    }
  }
});

// Obtener datos de un alumno por ID
app.get('/api/alumnos/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      'SELECT id, nombre, apellido, email, carrera, descripcion, telefono FROM alumnos WHERE id = $1',
      [id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Alumno no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
});

// Actualizar perfil de un alumno
app.put('/api/alumnos/:id', async (req, res) => {
  const id = req.params.id;
  const { nombre, apellido, carrera, descripcion, telefono } = req.body;
  try {
    const result = await db.query(
      `UPDATE alumnos
       SET nombre = $1,
           apellido = $2,
           carrera = $3,
           descripcion = $4,
           telefono = $5
       WHERE id = $6
       RETURNING id, nombre, apellido, email, carrera, descripcion, telefono`,
      [nombre, apellido, carrera, descripcion, telefono, id]
    );
    if (result.rows.length > 0) {
      res.json({ message: "Perfil actualizado", alumno: result.rows[0] });
    } else {
      res.status(404).json({ error: "Alumno no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
});

// Listar todos los alumnos (para empresas)
app.get('/api/alumnos', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nombre, apellido, email, carrera, descripcion, telefono FROM alumnos'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la lista de alumnos" });
  }
});

// Actualizar perfil de alumno
app.put('/api/alumnos/:id', async (req, res) => {
  const { nombre, apellido, carrera, descripcion, telefono } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE alumnos SET nombre=$1, apellido=$2, carrera=$3, descripcion=$4, telefono=$5 WHERE id=$6',
      [nombre, apellido, carrera, descripcion, telefono, id]
    );
    res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});
