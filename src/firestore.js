import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importa la función getFirestore desde la biblioteca de Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLPjzn4KMEckJNvrcwJE7Nu-gBM6YDhjU",
  authDomain: "weba-58862.firebaseapp.com",
  projectId: "weba-58862",
  storageBucket: "weba-58862.appspot.com",
  messagingSenderId: "43965259873",
  appId: "1:43965259873:web:3923aa3d3b58517f078a20",
  measurementId: "G-05NZHXGNL7"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// Inicializa Firestore con la aplicación Firebase
const db = getFirestore(firebaseApp);
export default db;