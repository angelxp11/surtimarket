
import React, { useState } from 'react';

import Home from './components/Home'
import Login from './components/Login'

import firebaseApp from './credenciales'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
const auth = getAuth(firebaseApp)

function App() {

  const [usuario, setUsuario] = useState(null)

  onAuthStateChanged(auth, (usuarioFirebase)=>{
    if(usuarioFirebase){
      setUsuario(usuarioFirebase)
    }
    else{
      setUsuario(null)
    }
  })

  return (
    <>
      {usuario ? <Home correoUsuario ={usuario.email} /> : <Login/>}
    </>
  );
}

export default App;