const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs'); // Nuevo
const https = require('https'); // Nuevo

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443; // Nuevo

// Middleware de seguridad
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión segura
app.use(session({
  secret: process.env.SESSION_SECRET || 'un-secreto-largo-y-aleatorio-que-no-este-en-el-codigo',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 86400000
  }
}));

// Datos en memoria (sin base de datos)
let posts = [
  {
    id: 1,
    title: 'Bienvenido al blog',
    content: 'Este es el primer post del blog vulnerable',
    author: 'admin',
    date: new Date().toISOString()
  }
];

let users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', role: 'user' }
];

let comments = [
  {
    id: 1,
    postId: 1,
    content: 'Gran post!',
    author: 'user',
    date: new Date().toISOString()
  }
];

// Middleware de autenticación y autorización
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
}

// Limitador de intentos de login para prevenir ataques de fuerza bruta
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login desde esta IP. Por favor, intenta de nuevo en un minuto.'
});

// Configuración de multer (asegurando la subida de archivos)
const upload = multer({
  dest: 'public/uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    // CORRECCIÓN: Valida el tipo de archivo
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen.'), false);
    }
  }
});

// Rutas de autenticación
app.post('/api/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // CORRECCIÓN: Guarda el objeto completo del usuario, incluyendo el rol
    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ message: 'Login exitoso', user: req.session.user });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Sesión cerrada' });
});

// Rutas de posts
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Post no encontrado' });
  }
});

app.post('/api/posts', isAuthenticated, (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Título y contenido son obligatorios' });
  }

  // Sanitización del contenido para XSS
  const sanitizedContent = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const newPost = {
    id: posts.length + 1,
    title,
    content: sanitizedContent,
    author: req.session.user.username,
    date: new Date().toISOString()
  };
  
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Rutas de comentarios
app.get('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  const postComments = comments.filter(c => c.postId === postId);
  res.json(postComments);
});

app.post('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'El contenido del comentario es obligatorio' });
  }

  const author = req.session.user ? req.session.user.username : 'anónimo';
  const sanitizedContent = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
  const newComment = {
    id: comments.length + 1,
    postId,
    content: sanitizedContent,
    author,
    date: new Date().toISOString()
  };
  
  comments.push(newComment);
  res.status(201).json(newComment);
});

// Ruta para subir archivos
app.post('/api/upload', isAuthenticated, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
        message: 'Archivo subido exitosamente',
        url: fileUrl
    });
});

// Ruta para obtener información del usuario actual
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'No autenticado' });
  }
});

// Ruta para eliminar posts (corregida y única)
app.delete('/api/posts/:id', isAuthenticated, (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    const postToDelete = posts[postIndex];

    if (req.session.user.username === postToDelete.author || req.session.user.role === 'admin') {
      posts.splice(postIndex, 1);
      comments = comments.filter(c => c.postId !== postId);
      res.json({ message: 'Post eliminado exitosamente' });
    } else {
      res.status(403).json({ error: 'Acceso denegado' });
    }
  } else {
    res.status(404).json({ error: 'Post no encontrado' });
  }
});

// NUEVO: Servidor HTTPS para el puerto 443
const httpsOptions = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};

const httpsServer = https.createServer(httpsOptions, app);

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`Servidor HTTPS corriendo en https://localhost:${HTTPS_PORT}`);
});

// OPCIONAL: Redirigir de HTTP a HTTPS
const httpServer = express();
httpServer.get('*', (req, res) => {
    res.redirect(`https://${req.headers.host}${req.url}`);
});

httpServer.listen(HTTP_PORT, () => {
    console.log(`Servidor HTTP corriendo en http://localhost:${HTTP_PORT}`);
});