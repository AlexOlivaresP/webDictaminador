import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Inicializar Firebase Admin SDK
const serviceAccount = require('C:\Users\jalex\Documents\TESIS\webDictaminador\webDictaminador\dictaminador3312-firebase-adminsdk-x5dq4-91a0021b87.json'); // Cambia a la ruta correcta de tu archivo JSON

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'dictaminador3312.appspot.com' // Nombre de tu bucket
});

const storage = getStorage();
const bucket = storage.bucket();

// Configurar Express y Multer para la subida de archivos
const app = express();
const port = 3000;

// Configurar Multer para manejar los archivos
const upload = multer({
  storage: multer.memoryStorage(), // Almacenamos el archivo en memoria antes de subirlo
  limits: { fileSize: 10 * 1024 * 1024 } // Tamaño máximo: 10MB
});

// Ruta para subir el archivo a la carpeta 'libros/'
app.post('/libros', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send('No se ha subido ningún archivo');
    }

    // Generamos un nombre único para el archivo y lo guardamos en la carpeta 'libros/'
    const blob = bucket.file(`libros/${uuidv4()}-${file.originalname}`);
    
    // Crear un stream para subir el archivo a Firebase Storage
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
      // El archivo se subió correctamente
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).send({ message: 'Archivo subido exitosamente', url: publicUrl });
    });

    // Escribimos el archivo subido en el bucket de Firebase Storage
    blobStream.end(file.buffer);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la solicitud');
  }
});

// Ruta para subir el archivo a la carpeta 'resumenes/'
app.post('/resumenes', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send('No se ha subido ningún archivo');
    }

    // Generamos un nombre único para el archivo y lo guardamos en la carpeta 'resumenes/'
    const blob = bucket.file(`resumenes/${uuidv4()}-${file.originalname}`);
    
    // Crear un stream para subir el archivo a Firebase Storage
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
      // El archivo se subió correctamente
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).send({ message: 'Archivo subido exitosamente', url: publicUrl });
    });

    // Escribimos el archivo subido en el bucket de Firebase Storage
    blobStream.end(file.buffer);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la solicitud');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
