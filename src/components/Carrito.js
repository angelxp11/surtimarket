import React, { useEffect, useState, useRef } from 'react';
import { collection, getDoc, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../credenciales';
import { getAuth } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Carrito.css';

const auth = getAuth();

const Carrito = () => {
  const [productosCarrito, setProductosCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const [compraRealizada, setCompraRealizada] = useState(false);
  const [metodoPago, setMetodoPago] = useState('');
  const contenedorCarritoRef = useRef(null);

  useEffect(() => {
    const obtenerProductosCarrito = async () => {
      try {
        const correoUsuarioAutenticado = auth.currentUser.email;
        const usuarioDocRef = doc(db, 'usuarios', correoUsuarioAutenticado);
        const usuarioDocSnap = await getDoc(usuarioDocRef);
        if (usuarioDocSnap.exists()) {
          let carritoId = usuarioDocSnap.data().carrito;
  
          // Si el campo 'carrito' no existe o está vacío, lo creamos con una nueva id única
          if (!carritoId) {
            carritoId = generateUniqueID();
            await setDoc(doc(db, 'usuarios', correoUsuarioAutenticado), { carrito: carritoId }, { merge: true });
  
            // Crear un documento vacío en la colección 'carrito' con la nueva id
            await setDoc(doc(db, 'carrito', carritoId), {});
          } else {
            // Verificar si el documento del carrito existe, si no existe, crearlo
            const carritoDocRef = doc(db, 'carrito', carritoId);
            const carritoDocSnap = await getDoc(carritoDocRef);
            if (!carritoDocSnap.exists()) {
              await setDoc(carritoDocRef, {});
            }
          }
  
          // Lógica existente para obtener los productos del carrito...
          const { carrito } = usuarioDocSnap.data();
          const carritoDocRef = doc(db, 'carrito', carrito);
          const carritoDocSnap = await getDoc(carritoDocRef);
          if (carritoDocSnap.exists()) {
            const carritoData = carritoDocSnap.data();
            const productosIds = Object.values(carritoData);
            const productosMap = productosIds.reduce((acc, id) => {
              acc[id] = (acc[id] || 0) + 1;
              return acc;
            }, {});
            const productosArray = await Promise.all(
              Object.keys(productosMap).map(async (productoId) => {
                const productoDocRef = doc(db, 'productos', productoId);
                const productoDocSnap = await getDoc(productoDocRef);
                if (productoDocSnap.exists()) {
                  const productoData = productoDocSnap.data();
                  return {
                    id: productoId,
                    ...productoData,
                    Cantidad: productosMap[productoId]
                  };
                }
                return null;
              })
            );
            setProductosCarrito(productosArray.filter(Boolean));
            calcularTotal(productosArray.filter(Boolean));
          }
        }
      } catch (error) {
        console.error('Error al obtener productos del carrito:', error);
      }
    };
  
    obtenerProductosCarrito();
  }, []);

  const calcularTotal = (productos) => {
    const totalCalculado = productos.reduce((acc, producto) => {
      return acc + producto.Precio * producto.Cantidad;
    }, 0);
    setTotal(totalCalculado);
  };
  const generateUniqueID = () => {
    // Generar una ID única utilizando la fecha actual y un número aleatorio
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${timestamp}-${randomNum}`;
  };
  

  const hacerPedido = async () => {
    try {
      const correoUsuarioAutenticado = auth.currentUser.email;
      const usuarioDocRef = doc(db, 'usuarios', correoUsuarioAutenticado);
      const usuarioDocSnap = await getDoc(usuarioDocRef);
      if (usuarioDocSnap.exists()) {
        const { carrito, direccion, nombreCompleto, telefono } = usuarioDocSnap.data();
        const carritoDocRef = doc(db, 'carrito', carrito);
        const carritoDocSnap = await getDoc(carritoDocRef);
        if (carritoDocSnap.exists()) {
          const pedidoRef = doc(db, 'pedidos', correoUsuarioAutenticado);
          const pedidoDocSnap = await getDoc(pedidoRef);
          const pedidoData = pedidoDocSnap.exists() ? pedidoDocSnap.data() : {};
          const pedidoCount = Object.keys(pedidoData).length;
          const pedidoX = `pedido${pedidoCount + 1}`;
          const pedidoMapa = {};

          const carritoData = carritoDocSnap.data();
          let productoIndex = 1;
          for (const [productoId, cantidad] of Object.entries(carritoData)) {
            pedidoMapa[`producto${productoIndex}`] = cantidad;

            // Actualizar la cantidad en la base de datos si la cantidad en stock es suficiente
            const productoDocRef = doc(db, 'productos', productoId);
            const productoDocSnap = await getDoc(productoDocRef);
            if (productoDocSnap.exists()) {
              const productoData = productoDocSnap.data();
              if (productoData.Cantidad >= cantidad) {
                const nuevaCantidad = productoData.Cantidad - cantidad;
                await updateDoc(productoDocRef, { Cantidad: nuevaCantidad });
              }
            }
            productoIndex++;
          }

          pedidoMapa['nombreCompleto'] = nombreCompleto;
          pedidoMapa['telefono'] = telefono;
          pedidoMapa['direccion'] = direccion;
          pedidoMapa['estado'] = 'procesando';

          pedidoMapa['metodoPago'] = metodoPago;
          pedidoMapa['fecha'] = obtenerFechaActual();
          pedidoMapa['hora'] = obtenerHoraActual();

          await setDoc(pedidoRef, { [pedidoX]: pedidoMapa }, { merge: true });
          await deleteDoc(carritoDocRef);
          await setDoc(doc(db, 'carrito', carrito), {});
          setCompraRealizada(true);
          console.log('Pedido en proceso exitosamente');
          toast.success('Pedido realizado con éxito', {
            autoClose: 2000, // Cierre automático después de 3 segundos
            onClose: () => {
              contenedorCarritoRef.current.classList.add('bounceOut');
            },
          });
        }
      }
    } catch (error) {
      console.error('Error al hacer el pedido:', error);
    }
  };

  const verificarExistencias = async () => {
    try {
      const productosConPocasExistencias = [];

      for (const producto of productosCarrito) {
        const productoDocRef = doc(db, 'productos', producto.id);
        const productoDocSnap = await getDoc(productoDocRef);

        if (productoDocSnap.exists()) {
          const productoData = productoDocSnap.data();

          if (productoData.Cantidad >= producto.Cantidad) {
            const nuevaCantidad = productoData.Cantidad - producto.Cantidad;
            await updateDoc(productoDocRef, { Cantidad: nuevaCantidad });
            continue;
          } else {
            productosConPocasExistencias.push({
              nombre: productoData.Nombre,
              existencias: productoData.Cantidad
            });
          }
        }
      }

      if (productosConPocasExistencias.length > 0) {
        const mensaje = productosConPocasExistencias.map(({ nombre, existencias }) => `${nombre} solo quedan ${existencias}`).join(', ');
        toast.error(mensaje);
      } else {
        hacerPedido();
      }
    } catch (error) {
      console.error('Error al verificar existencias:', error);
    }
  };

  const obtenerFechaActual = () => {
    const currentDate = new Date();
    const dateFormat = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return dateFormat.format(currentDate);
  };

  const obtenerHoraActual = () => {
    const currentDate = new Date();
    const timeFormat = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });
    return timeFormat.format(currentDate);
  };

  return (
    <div className="contenedor-carrito" ref={contenedorCarritoRef}>
      <div className="carrito">
        <h2>Carrito de Compras</h2>
        <ToastContainer />
        <div>
          {productosCarrito.length > 0 ? (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio Unitario</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productosCarrito.map((producto, index) => (
                    <React.Fragment key={producto.id}>
                      <tr>
                        <td>{producto.Nombre}</td>
                        <td>${producto.Precio}</td>
                        <td>{producto.Cantidad}</td>
                        <td>${producto.Precio * producto.Cantidad}</td>
                      </tr>
                      {index !== productosCarrito.length - 1 && (
                        <tr>
                          <td colSpan="4"><hr /></td> {/* Línea de separación */}
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  <tr>
                    <td colSpan="4"><hr /></td> {/* Línea de separación debajo del total */}
                  </tr>
                  <tr>
                    <td colSpan="3">Total:</td>
                    <td>${total}</td>
                  </tr>
                  <tr>
                    <td colSpan="4"><hr /></td> {/* Línea de separación debajo del total */}
                  </tr>
                </tbody>
              </table>
              <div>
                <label htmlFor="metodoPago">Método de Pago:</label>
                <select id="metodoPago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                  <option value="" disabled>Seleccione un método de pago</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Bancolombia">Bancolombia</option>
                </select>
              </div>
              <button onClick={verificarExistencias}>Hacer Pedido</button>
            </div>
          ) : (
            <p>No hay productos en el carrito.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Carrito;

