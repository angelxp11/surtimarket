import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDoc, addDoc, query, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseApp from '../credenciales';
import './Perfil.css'; // Importa el archivo de estilos CSS
import defaultProfileImage from './defaultProfileImage.png'; // Importa la imagen de perfil por defecto

const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

const Perfil = ({ mostrarPerfil, togglePerfil }) => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [imagenPerfil, setImagenPerfil] = useState('');
  const [progressBarVisible, setProgressBarVisible] = useState(true); // Inicialmente visible

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        if (auth.currentUser) {
          const correoUsuario = auth.currentUser.email;
          setUsuarioId(correoUsuario);

          const usuarioRef = doc(collection(firebaseApp.firestore(), 'usuarios'), correoUsuario);
          const usuarioSnap = await getDoc(usuarioRef);

          if (usuarioSnap.exists()) {
            const data = usuarioSnap.data();
            setNombreCompleto(data.nombreCompleto || '');
            setDireccion(data.direccion || '');
            setTelefono(data.telefono || '');

            if (data.imagenURL && data.imagenURL.length >= 4) {
              setImagenPerfil(data.imagenURL);
            } else {
              setImagenPerfil(null);
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    };

    setTimeout(() => {
      obtenerUsuario().then(() => setProgressBarVisible(false));
    }, 100); // Retraso de 1 segundo

  }, []);

  const guardarDatosUsuario = async () => {
    try {
      const usuarioDocRef = doc(collection(firebaseApp.firestore(), 'usuarios'), usuarioId);
      await setDoc(usuarioDocRef, {
        nombreCompleto,
        direccion,
        telefono,
        imagenURL: imagenPerfil
      }, { merge: true });

      console.log('Datos de usuario guardados correctamente.');
      setModoEdicion(false);

      const carritoQuery = query(collection(firebaseApp.firestore(), 'carrito'));
      const carritoSnapshot = await getDocs(carritoQuery);

      if (carritoSnapshot.empty) {
        const carritoDocRef = await addDoc(collection(firebaseApp.firestore(), 'carrito'), {});
        console.log('Se creó el documento del carrito con ID:', carritoDocRef.id);

        await setDoc(usuarioDocRef, { carrito: carritoDocRef.id }, { merge: true });
      } else {
        console.log('La colección "carrito" ya tiene documentos.');
      }
    } catch (error) {
      console.error('Error al guardar datos del usuario:', error);
    }
  };

  const handleImageChange = async (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      const storageRef = ref(storage, `perfil/${usuarioId}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImagenPerfil(url);
    }
  };

  return (
    <div className={`perfil-container ${mostrarPerfil ? 'entrada' : 'salida'}`} style={{ width: '500px', height: '550px' }}>
      <h2 className="perfil-title">Perfil de Usuario</h2>
      <div className="salida">
        {progressBarVisible && <div className="progress-bar"><div className="loader"></div></div>}
        {!progressBarVisible && (
          <>
            <div className="perfil-imagen-container">
              {imagenPerfil ? (
                <img src={imagenPerfil} alt="Perfil" className="perfil-imagen" />
              ) : (
                <img src={defaultProfileImage} alt="Perfil" className="perfil-imagen" />
              )}
              {modoEdicion && <input type="file" onChange={handleImageChange} />}
            </div>
            {modoEdicion ? (
              <div>
                <div className="perfil-field">
                  <label htmlFor="nombreCompleto">Nombre Completo:</label>
                  <input type="text" id="nombreCompleto" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} />
                </div>
                <div className="perfil-field">
                  <label htmlFor="direccion">Dirección:</label>
                  <input type="text" id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                </div>
                <div className="perfil-field">
                  <label htmlFor="telefono">Teléfono:</label>
                  <input type="text" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </div>
                <div className="perfil-buttons">
                  <button onClick={guardarDatosUsuario}>Guardar</button>
                </div>
              </div>
            ) : (
              <div className="perfil-info">
                <div>
                  <strong>Nombre Completo:</strong> {nombreCompleto}
                </div>
                <div>
                  <strong>Dirección:</strong> {direccion}
                </div>
                <div>
                  <strong>Teléfono:</strong> {telefono}
                </div>
                <button className="perfil-edit-button" onClick={() => setModoEdicion(true)}>Editar</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Perfil;
