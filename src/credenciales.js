import firebase from "firebase/compat/app";
import 'firebase/compat/firestore';
import 'firebase/compat/storage'; // Importa el módulo de almacenamiento de Firebase

const firebaseConfig = {
  apiKey: "AIzaSyCLPjzn4KMEckJNvrcwJE7Nu-gBM6YDhjU",
  authDomain: "weba-58862.firebaseapp.com",
  projectId: "weba-58862",
  storageBucket: "weba-58862.appspot.com",
  messagingSenderId: "43965259873",
  appId: "1:43965259873:web:3923aa3d3b58517f078a20",
  measurementId: "G-05NZHXGNL7"
};

// Inicializa Firebase con la configuración
const firebaseAppInstance = firebase.initializeApp(firebaseConfig);
const db = firebaseAppInstance.firestore();
const storage = firebaseAppInstance.storage(); // Obtiene una referencia al módulo de almacenamiento

export default firebaseAppInstance;
export { db, storage }; // Exporta la instancia de Firebase y el módulo de almacenamiento


