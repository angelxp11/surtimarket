import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from '../credenciales';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AgregarProducto.css';

const AgregarProducto = ({ onAgregarProducto }) => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [imagen, setImagen] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nombre.trim() === '' || precio.trim() === '' || cantidad.trim() === '' || !imagen) {
      alert('Por favor, complete todos los campos y seleccione una imagen.');
      return;
    }

    try {
      // Subir la imagen a Firebase Storage
      const storageRef = storage.ref();
      const imagenRef = storageRef.child('productos/' + imagen.name);
      await imagenRef.put(imagen);
      const imagenURL = await imagenRef.getDownloadURL();

      // Agregar el producto a Firestore
      const docRef = await addDoc(collection(db, 'productos'), {
        Nombre: nombre,
        Precio: parseFloat(precio),
        Cantidad: parseInt(cantidad),
        ImagenURL: imagenURL // Guardar la URL de la imagen en Firestore
      });

      console.log('Producto agregado con ID: ', docRef.id);

      // Mostrar toast y vaciar los campos del formulario
      toast.success(`${nombre} añadido correctamente!`);
      setNombre('');
      setPrecio('');
      setCantidad('');
      setImagen(null);

      if (onAgregarProducto) {
        onAgregarProducto({
          Nombre: nombre,
          Precio: parseFloat(precio),
          Cantidad: parseInt(cantidad),
          ImagenURL: imagenURL
        });
      }

    } catch (error) {
      console.error('Error al agregar el producto: ', error);
      alert('Error al agregar el producto. Por favor, inténtalo de nuevo.');
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
    }
  };

  return (
    <div className="agregar-producto-container">
      <h2>Agregar Producto</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="form-control"
            placeholder="Ingrese el nombre"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="precio">Precio:</label>
          <input
            type="number"
            id="precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="form-control"
            placeholder="Ingrese el precio"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cantidad">Cantidad:</label>
          <input
            type="number"
            id="cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="form-control"
            placeholder="Ingrese la cantidad"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="imagen">Imagen:</label>
          <input
            type="file"
            id="imagen"
            accept="image/*"
            onChange={handleImagenChange}
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="submit-btn">Agregar</button>
      </form>
      <ToastContainer /> {/* Contenedor para los toasts */}
    </div>
  );
};

export default AgregarProducto;
