import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import serviceAccount from './dictaminador3312-firebase-adminsdk-x5dq4-91a0021b87.json' assert { type: "json" };

// Inicializar Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'dictaminador3312.appspot.com'  // Reemplaza con el nombre de tu bucket
});

const storage = getStorage();
const bucket = storage.bucket();

const app = express();
const port = 3000;

// Crear el equivalente de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Multer para la subida de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }  // Limita el tamaño del archivo a 10MB
});

// Para servir archivos estáticos (como HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Ruta para servir la página de inicio de sesión (login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para manejar la autenticación del login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Autenticación simple (puedes mejorarla con Firebase Auth o tu lógica)
  if (username === 'admin' && password === '1234') {
    return res.status(200).json({ message: 'Inicio de sesión exitoso' });
  } else {
    return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
  }
});

// Ruta para subir un archivo a la carpeta 'libros'
app.post('/upload/libros', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No se ha subido ningún archivo');
    }

    const blob = bucket.file(`libros/${uuidv4()}-${file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      }
    });

    blobStream.on('error', (err) => {
      console.error(err);
      res.status(500).send('Error al subir el archivo');
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).send({ message: 'Archivo subido exitosamente', url: publicUrl });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la solicitud');
  }
});

// Iniciar el servidor en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
