import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../credenciales';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Ajua.css';

const Ajua = () => {
  const [productos, setProductos] = useState([]);
  const [mostrarActualizacion, setMostrarActualizacion] = useState(false);
  const [productoIdSeleccionado, setProductoIdSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState(0);
  const [nuevaCantidad, setNuevaCantidad] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);
  const contenedoras = useRef(null);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'));
        const productosArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProductos(productosArray.slice(0, 20));
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };

    obtenerProductos();
  }, []);

  const actualizarProducto = async () => {
    try {
      await updateDoc(doc(db, 'productos', productoIdSeleccionado), {
        Nombre: nuevoNombre,
        Precio: nuevoPrecio,
        Cantidad: nuevaCantidad
      });
      toast.success('Producto actualizado', {
        autoClose: 500, // Ajusta el tiempo de cierre del toast según tus necesidades
        onClose: () => {
          contenedoras.current.classList.add('abounce-out');
        },
      });
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
    }
  };

  const abrirContenedorActualizacion = async (id) => {
    setProductoIdSeleccionado(id);
    setLoading(true);
    try {
      const productDoc = await getDoc(doc(db, 'productos', id));
      const productData = productDoc.data();
      setProductoSeleccionado(productData);
      setNuevoNombre(productData.Nombre);
      setNuevoPrecio(productData.Precio);
      setNuevaCantidad(productData.Cantidad);
      setMostrarActualizacion(true);
    } catch (error) {
      console.error('Error al obtener producto:', error);
    }
    setLoading(false);
  };

  

  return (
    <div className="productos-container">
      <h2 className="label-productos">Actualizar Productos</h2>
      <div className="productos-grid">
        {productos.map(producto => (
          <div className="producto" key={producto.id}>
            <img src={producto.ImagenURL} alt={producto.Nombre} />
            <p>Nombre: {producto.Nombre}</p>
            <p>Precio: {producto.Precio}</p>
            <p>Cantidad: {producto.Cantidad}</p>
            <button onClick={() => abrirContenedorActualizacion(producto.id)}>Actualizar Producto</button>
          </div>
        ))}
      </div>
      {mostrarActualizacion && (
        <div ref={contenedoras} className="contenedor-actualizacion">
          {loading ? (
            <div className="progress-bar">Cargando...</div>
          ) : (
            <div className={`actualizacion-zoom-in ${animatingOut ? 'abounce-out' : ''}`}>
              <h3>Actualizar Producto</h3>
              <img src={productoSeleccionado.ImagenURL} alt={productoSeleccionado.Nombre} />
              <label htmlFor="nombre">Nombre:</label>
              <input type="text" id="nombre" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} />
              <label htmlFor="precio">Precio:</label>
              <input type="number" id="precio" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} />
              <label htmlFor="cantidad">Cantidad:</label>
              <input type="number" id="cantidad" value={nuevaCantidad} onChange={(e) => setNuevaCantidad(e.target.value)} />
              <button onClick={actualizarProducto}>Actualizar Producto</button>
            </div>
          )}
        </div>
      )}
      <ToastContainer /> {/* Componente de react-toastify para mostrar los toasts */}
    </div>
  );
};

export default Ajua;
