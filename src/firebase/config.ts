// Importa las funciones necesarias de Firebase SDK
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Tu configuración de Firebase (del lado del cliente)
// Puedes encontrar esto en la configuración de tu proyecto en la consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCMkqWIKd-H7TxpAljCs_-OfTqmR3TfLhU",
  authDomain: "rastreo-a983f.firebaseapp.com",
  projectId: "rastreo-a983f",
  storageBucket: "rastreo-a983f.firebasestorage.app",
  messagingSenderId: "924951798569",
  appId: "1:924951798569:web:2969dd29fbc9b04c7d8d38"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta las instancias de los servicios que necesitas
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };