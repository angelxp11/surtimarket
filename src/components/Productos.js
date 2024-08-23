import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../credenciales';
import { getAuth } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Productos.css';

const Productos = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'));
        const productosArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProductos(productosArray.slice(0, 20)); // Limita a los primeros 20 productos
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };

    obtenerProductos();
  }, []);

  const addToCart = async (productId, productName) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        if (userEmail) {
          const userCartSnapshot = await getDoc(doc(db, "usuarios", userEmail));
          const userCartId = userCartSnapshot.data().carrito;

          if (userCartId) {
            const cartDocRef = doc(db, "carrito", userCartId);
            let i = 1;
            let fieldFound = false;
            while (!fieldFound) {
              const productField = `producto${i}`;
              const cartDocSnapshot = await getDoc(cartDocRef);
              const productValue = cartDocSnapshot.data()[productField];
              if (!productValue) {
                await updateDoc(cartDocRef, {
                  [productField]: productId
                });
                fieldFound = true;
              } else {
                i++;
              }
            }

            // Mostrar un toast con el nombre del producto añadido
            toast.success(`${productName} añadido al carrito correctamente!`);
          }
        }
      }
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
    }
  };

  const agregarAlCarrito = (id, name) => {
    addToCart(id, name);
  };

  return (
    <div className="productos-container">
      <ToastContainer /> {/* Contenedor para los toasts */}
      <h2 class="label-productos">Productos</h2>
      <div className="productos-grid">
        {productos.map(producto => (
          <div className="producto" key={producto.id}>
            <img src={producto.ImagenURL} alt={producto.Nombre} />
            <p>Nombre: {producto.Nombre}</p>
            <p>Precio: {producto.Precio}</p>
            <p>Cantidad: {producto.Cantidad}</p>
            <button onClick={() => agregarAlCarrito(producto.id, producto.Nombre)}>Agregar al carrito</button>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default Productos;
