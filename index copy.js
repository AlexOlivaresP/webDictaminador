import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import serviceAccount from './dictaminador3312-firebase-adminsdk-x5dq4-91a0021b87.json' assert { type: "json" };  // Ruta correcta a tu archivo JSON

// Inicializar Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'dictaminador3312.appspot.com'  // Cambia el nombre del bucket si es necesario
});

const storage = getStorage();
const bucket = storage.bucket();

const app = express();
const port = 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }  // Limita el tamaño del archivo a 10MB
});

// **Nueva ruta raíz para manejar GET en "/"
app.get('/', (req, res) => {
  res.send('Bienvenido al servidor de subida de archivos');
});

// Ruta para subir a 'libros/'
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

// Ruta para subir a 'resumenes/'
app.post('/upload/resumenes', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No se ha subido ningún archivo');
    }

    const blob = bucket.file(`resumenes/${uuidv4()}-${file.originalname}`);
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

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
