import React, { useEffect, useState,useRef } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../credenciales';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Pedidos.css';

const DetallesPedido = () => {
  const [pedidos, setPedidos] = useState([]);
  const [mostrarActualizacion, setMostrarActualizacion] = useState(false); // Estado para mostrar/ocultar el contenedor de actualización
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [productosPedido, setProductosPedido] = useState([]);
  const contenedoroorr = useRef(null);

  useEffect(() => {
    const obtenerPedidos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pedidos'));
        const pedidosArray = [];

        querySnapshot.forEach(docSnapshot => {
          const pedidosData = docSnapshot.data();
          Object.keys(pedidosData).forEach(pedidoKey => {
            const pedido = pedidosData[pedidoKey];
            pedidosArray.push({
              id: docSnapshot.id,
              pedidoKey,
              ...pedido
            });
          });
        });

        setPedidos(pedidosArray);
      } catch (error) {
        console.error('Error al obtener pedidos:', error);
      }
    };

    obtenerPedidos();
  }, []);

  const abrirActualizacion = (pedido) => {
    setMostrarActualizacion(true);
    setPedidoSeleccionado(pedido);
    setNuevoEstado(pedido.estado);
  };

  const obtenerProductosPedido = async () => {
    if (!pedidoSeleccionado) return;
  
    try {
      const productosArray = [];
  
      const productosIds = Object.keys(pedidoSeleccionado)
        .filter(key => key.startsWith('product'));
  
      for (const productoId of productosIds) {
        const productoData = pedidoSeleccionado[productoId];
        // En lugar de almacenar solo el ID del producto, ahora almacenamos todo el objeto del producto
        productosArray.push(productoData);
      }
  
      setProductosPedido(productosArray);
    } catch (error) {
      console.error('Error al obtener los productos del pedido:', error);
    }
  };
  
  const renderProductosTabla = () => {
    return (
      <table className="productos-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {productosPedido.map((producto, index) => (
            <tr key={index}>
              {/* Utilizamos las propiedades del objeto producto para mostrar los detalles */}
              <td>{producto.nombre}</td>
              <td>{producto.precio}</td>
              <td>{producto.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  

  useEffect(() => {
    obtenerProductosPedido();
  }, [pedidoSeleccionado]);

  const actualizarEstadoPedido = async () => {
    if (!pedidoSeleccionado) return;

    setLoading(true);
    try {
      const pedidoDocRef = doc(db, 'pedidos', pedidoSeleccionado.id);
      const pedidoDocSnap = await getDoc(pedidoDocRef);
      if (pedidoDocSnap.exists()) {
        const pedidoData = pedidoDocSnap.data();
        pedidoData[pedidoSeleccionado.pedidoKey].estado = nuevoEstado;

        await updateDoc(pedidoDocRef, pedidoData);

        setPedidos(prevPedidos =>
          prevPedidos.map(pedido =>
            pedido.id === pedidoSeleccionado.id && pedido.pedidoKey === pedidoSeleccionado.pedidoKey
              ? { ...pedido, estado: nuevoEstado }
              : pedido
          )
        );

        toast.success('Estado del pedido actualizado', {
          autoClose: 500, // Ajusta el tiempo de cierre del toast según tus necesidades
          onClose: () => {
            if (contenedoroorr.current) {
              contenedoroorr.current.classList.add('abounce-out');
            }
          },
        });
        
      }
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      toast.error('Error al actualizar estado del pedido');
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="pedidos-container">
      <h2 class="label-productos">Mis Pedidos</h2>
      <div className="pedidos-grid">
        {pedidos.map(pedido => (
          <div className="pedido" key={`${pedido.id}-${pedido.pedidoKey}`}>
            <div className="pedido-header">
              <span className="pedido-nombre">{pedido.pedidoKey}</span>
              <span className="pedido-estado">{pedido.estado}</span>
            </div>
            <div className="pedido-body">
              <p>Hora: {pedido.hora}</p>
              <p>Fecha: {pedido.fecha}</p>
            </div>
            <div className="pedido-footer">
              <button onClick={() => abrirActualizacion(pedido)}>Actualizar Pedido</button>
            </div>
          </div>
        ))}
      </div>
      {mostrarActualizacion && (
        <div className="overlay">
          <div className="contenedor-actualizacion">
            {loading ? (
              <div className="progress-bar">Cargando...</div>
            ) : (
              <div className="actualizacion-zoom-in">
                <h3>Actualizar Estado de Pedido</h3>
                <p><strong>Nombre Completo:</strong> {pedidoSeleccionado.nombreCompleto}</p>
                <p><strong>Dirección:</strong> {pedidoSeleccionado.direccion}</p>
                <p><strong>Estado:</strong> {pedidoSeleccionado.estado}</p>
                <p><strong>Fecha:</strong> {pedidoSeleccionado.fecha}</p>
                <p><strong>Hora:</strong> {pedidoSeleccionado.hora}</p>
                <p><strong>Método de Pago:</strong> {pedidoSeleccionado.metodoPago}</p>
                <p><strong>Teléfono:</strong> {pedidoSeleccionado.telefono}</p>
                {renderProductosTabla()}
                <label htmlFor="estado">Nuevo Estado:</label>
                <input
                  type="text"
                  id="estado"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                />
                <button onClick={actualizarEstadoPedido}>Actualizar Estado</button>
                <button onClick={() => setMostrarActualizacion(false)}>Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default DetallesPedido;
