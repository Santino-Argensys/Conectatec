require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

/*
  ===================================================================
  1) SERVIR TU “LANDING” ESTÁTICA DE INFORMACIÓN (conectatecINFO/)
  ===================================================================
*/
// Estructura esperada:
//   /conectatec
//     /conectatec-main
//       /backend      ← estamos aquí
//       /frontend     ← tu antigua carpeta con acceso.html, etc.
//     /conectatecINFO
//       /index.html
//       /style.css
//       /script.js
//       / ...otras imágenes y assets...

// __dirname === '/…/conectatec/conectatec-main/backend'
const rutaInfo = path.join(__dirname, '../../conectatecINFO');
app.use(express.static(rutaInfo));
// Ahora:
//  - GET  /index.html       => servirá conectatecINFO/index.html
//  - GET  /style.css        => servirá conectatecINFO/style.css
//  - GET  /script.js        => servirá conectatecINFO/script.js
//  - GET  /hero_background.png, etc.  => servirá esos assets directamente

/*
  ===================================================================
  2) RUTAS DE LA API (/api/...)
  ===================================================================
*/

// 2.1) Login de alumno
app.post('/api/alumnos/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(
      `SELECT 
         id,
         nombre,
         apellido,
         email,
         carrera,
         descripcion,
         telefono,
         colegio_id,
         centro_id
       FROM alumnos
       WHERE email = $1 AND password = $2;`,
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json({ user: result.rows[0], tipo: "alumno" });
    } else {
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  } catch (error) {
    console.error('Error en POST /api/alumnos/login:', error);
    res.status(500).json({ error: "Error interno al iniciar sesión" });
  }
});

// 2.2) Registro de alumno (ahora con colegio_id y centro_id)
app.post('/api/alumnos/registro', async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    password,
    carrera,
    descripcion,
    telefono,
    colegio_id,   // requerido
    centro_id     // opcional
  } = req.body;

  // Validación mínima de campos obligatorios
  if (!nombre || !apellido || !email || !password || !carrera || !colegio_id) {
    return res.status(400).json({
      error: "Faltan datos obligatorios (nombre, apellido, email, password, carrera y colegio)."
    });
  }

  try {
    // Validar que el colegio existe
    const checkColegio = await db.query(
      'SELECT 1 FROM colegios WHERE id = $1;',
      [colegio_id]
    );
    if (checkColegio.rowCount === 0) {
      return res.status(400).json({ error: "El colegio seleccionado no existe." });
    }

    // Si viene centro_id, validar que exista
    if (centro_id) {
      const checkCentro = await db.query(
        'SELECT 1 FROM centros_formacion WHERE id = $1;',
        [centro_id]
      );
      if (checkCentro.rowCount === 0) {
        return res.status(400).json({ error: "El centro de formación seleccionado no existe." });
      }
    }

    // Insertar el alumno en la tabla
    const result = await db.query(
      `INSERT INTO alumnos
         (nombre, apellido, email, password, carrera, descripcion, telefono, colegio_id, centro_id)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id;`,
      [
        nombre,
        apellido,
        email,
        password,
        carrera,
        descripcion || null,
        telefono || null,
        colegio_id,
        centro_id || null
      ]
    );

    res.status(201).json({
      id: result.rows[0].id,
      message: "Alumno registrado exitosamente"
    });
  } catch (error) {
    console.error('Error en POST /api/alumnos/registro:', error);
    if (error.code === '23505') {
      // Violación de restricción UNIQUE (email duplicado)
      res.status(409).json({ error: "El email ya está registrado" });
    } else {
      res.status(500).json({ error: "Error interno al registrar alumno" });
    }
  }
});

// 2.3) Registro de empresa
app.post('/api/empresas/registro', async (req, res) => {
  const { nombre_empresa, email, password, descripcion, telefono } = req.body;

  if (!nombre_empresa || !email || !password) {
    return res.status(400).json({
      error: "Faltan datos obligatorios (nombre_empresa, email, password)."
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO empresas
         (nombre_empresa, email, password, descripcion, telefono)
       VALUES
         ($1, $2, $3, $4, $5)
       RETURNING id;`,
      [nombre_empresa, email, password, descripcion || null, telefono || null]
    );
    res.status(201).json({
      id: result.rows[0].id,
      message: "Empresa registrada exitosamente"
    });
  } catch (error) {
    console.error('Error en POST /api/empresas/registro:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: "El email ya está registrado" });
    } else {
      res.status(500).json({ error: "Error interno al registrar empresa" });
    }
  }
});

// 2.4) Obtener datos de un alumno por ID (incluyendo nombres de colegio/centro)
app.get('/api/alumnos/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      `SELECT
         a.id,
         a.nombre,
         a.apellido,
         a.email,
         a.carrera,
         a.descripcion,
         a.telefono,
         a.colegio_id,
         c.nombre AS colegio,
         a.centro_id,
         f.nombre AS centro,
         a.fecha_registro
       FROM alumnos a
       LEFT JOIN colegios c ON a.colegio_id = c.id
       LEFT JOIN centros_formacion f ON a.centro_id = f.id
       WHERE a.id = $1;`,
      [id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Alumno no encontrado" });
    }
  } catch (error) {
    console.error('Error en GET /api/alumnos/:id:', error);
    res.status(500).json({ error: "Error al obtener el perfil del alumno" });
  }
});

// 2.5) Actualizar perfil de un alumno (sin cambiar colegio ni centro aquí)
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
       RETURNING id, nombre, apellido, email, carrera, descripcion, telefono, colegio_id, centro_id;`,
      [nombre, apellido, carrera, descripcion, telefono, id]
    );
    if (result.rows.length > 0) {
      res.json({ message: "Perfil actualizado", alumno: result.rows[0] });
    } else {
      res.status(404).json({ error: "Alumno no encontrado" });
    }
  } catch (error) {
    console.error('Error en PUT /api/alumnos/:id:', error);
    res.status(500).json({ error: "Error al actualizar el perfil del alumno" });
  }
});

// 2.6) Listar alumnos filtrados (colegio_id y/o centro_id opcionales)
app.get('/api/alumnos', async (req, res) => {
  try {
    const { colegio_id, centro_id } = req.query;

    let sql = `
      SELECT
        a.id,
        a.nombre,
        a.apellido,
        a.email,
        a.carrera,
        a.descripcion,
        a.telefono,
        a.colegio_id,
        c.nombre AS colegio,
        a.centro_id,
        f.nombre AS centro,
        a.fecha_registro
      FROM alumnos a
      LEFT JOIN colegios c ON a.colegio_id = c.id
      LEFT JOIN centros_formacion f ON a.centro_id = f.id
    `;
    const params = [];
    const conditions = [];

    if (colegio_id) {
      params.push(colegio_id);
      conditions.push(`a.colegio_id = $${params.length}`);
    }
    if (centro_id) {
      params.push(centro_id);
      conditions.push(`a.centro_id = $${params.length}`);
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY a.fecha_registro DESC;';

    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/alumnos (filtrado):', error);
    res.status(500).json({ error: "Error al obtener la lista de alumnos" });
  }
});

// 2.7) Obtener lista de colegios
app.get('/api/colegios', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, nombre FROM colegios ORDER BY nombre ASC;'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/colegios:', error);
    res.status(500).json({ error: "Error al obtener la lista de colegios" });
  }
});

// 2.8) Obtener lista de centros de formación
app.get('/api/centros', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, nombre FROM centros_formacion ORDER BY nombre ASC;'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/centros:', error);
    res.status(500).json({ error: "Error al obtener la lista de centros de formación" });
  }
});

// ————————————————————————————————————————————————
// RUTA 1: Registro de profesor/empresa
// ————————————————————————————————————————————————
app.post('/api/profesores/registro', async (req, res) => {
  const { nombre_completo, email, password, institucion, cargo, telefono } = req.body;

  // Validación mínima
  if (!nombre_completo || !email || !password) {
    return res.status(400).json({ error: "Faltan datos obligatorios (nombre_completo, email, password)." });
  }

  try {
    const result = await db.query(
      `INSERT INTO profesores 
         (nombre_completo, email, password, institucion, cargo, telefono) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id;`,
      [nombre_completo, email, password, institucion || null, cargo || null, telefono || null]
    );
    res.status(201).json({
      id: result.rows[0].id,
      message: "Profesor/Empresa registrado exitosamente"
    });
  } catch (error) {
    console.error('Error en POST /api/profesores/registro:', error);
    if (error.code === '23505') {
      // Email duplicado
      res.status(409).json({ error: "El email ya está registrado" });
    } else {
      res.status(500).json({ error: "Error interno al registrar profesor/empresa" });
    }
  }
});

// ————————————————————————————————————————————————
// RUTA 2: Login de profesor/empresa
// ————————————————————————————————————————————————
app.post('/api/profesores/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Faltan datos (email, password)." });
  }

  try {
    const result = await db.query(
      `SELECT id, nombre_completo, email, institucion, cargo, telefono 
       FROM profesores 
       WHERE email = $1 AND password = $2;`,
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json({ user: result.rows[0], tipo: "profesor" });
    } else {
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  } catch (error) {
    console.error('Error en POST /api/profesores/login:', error);
    res.status(500).json({ error: "Error interno al iniciar sesión de profesor/empresa" });
  }
});

/*
  =========================================================================
  3) RUTA ESPECIAL PARA SERVIR EL “ANTIGUO FRONTEND” (/bolsa/…)
     - Carpeta en: /conectatec-main/frontend
     - Se montará bajo el path "/bolsa"
  =========================================================================
*/
const rutaBolsa = path.join(__dirname, '../frontend');
app.use('/bolsa', express.static(rutaBolsa));
// Ahora:
//  - GET  /bolsa/acceso.html      => sirva connectatec-main/frontend/acceso.html
//  - GET  /bolsa/style.css        => sirva connectatec-main/frontend/style.css
//  - GET  /bolsa/js/…             => sirva connectatec-main/frontend/js/…
//  - etc. para todos los assets de la carpeta frontend

/*
  =========================================================================
  4) LOG DE PETICIONES (opcional, para debugging)
  =========================================================================
*/
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/*
  =========================================================================
  5) CATCH-ALL PARA RUTAS NO-API Y NO-ES /bolsa/…
     - Cualquier ruta que NO comience con "/api" ni con "/bolsa"
       devolverá la landing informativa (conectatecINFO/index.html).
  =========================================================================
*/
app.get(/^\/(?!api|bolsa).*/, (req, res) => {
  res.sendFile(path.join(rutaInfo, 'index.html'));
});

/*
  =========================================================================
  6) LEVANTAR EL SERVIDOR
  =========================================================================
*/
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
