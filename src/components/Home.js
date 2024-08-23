import React, { useState, useEffect } from 'react';
import { signOut, getAuth } from 'firebase/auth'; 
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseApp from '../credenciales';
import Ajua from './Ajua.js'; // Importa el componente Ajua
import Carrito from './Carrito';
import AgregarProducto from './AgregarProducto';
import Productos from './Productos';
import Pedidos from './Pedidos.js'; // Importa el componente Pedidos
import Perfil from './Perfil'; 

import logotipo from '../image/carrito.png';
import productosIcono from '../image/productos.png';
import perfilIcono from '../image/ingresar.png'; // Esta línea la cambiarás más adelante
import outIcono from '../image/out.png';
import logotipoImg from '../image/logotipo.png';
import holaIcono from '../image/hola.png';
import pedidosIcono from '../image/pedidos.png';

import './Home.css'; 

const Home = ({ correoUsuario }) => {
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    const [mostrarCarrito, setMostrarCarrito] = useState(false);
    const [mostrarAgregarProducto, setMostrarAgregarProducto] = useState(false);
    const [mostrarProductos, setMostrarProductos] = useState(false);
    const [mostrarPerfil, setMostrarPerfil] = useState(false);
    const [mostrarAgregarCantidades, setMostrarAgregarCantidades] = useState(false);
    const [mostrarPedidos, setMostrarPedidos] = useState(false);
    const [imagenPerfil, setImagenPerfil] = useState(null); // Estado para almacenar la imagen de perfil del usuario

    useEffect(() => {
        const obtenerImagenPerfil = async () => {
            try {
                const docSnap = await getDoc(doc(firestore, 'usuarios', correoUsuario)); // Suponiendo que la colección de usuarios se llama 'usuarios'
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data && data.imagenURL) {
                        setImagenPerfil(data.imagenURL);
                    }
                }
            } catch (error) {
                console.error('Error al obtener la imagen de perfil:', error);
            }
        };

        obtenerImagenPerfil();
    }, [firestore, correoUsuario]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const toggleCarrito = () => {
        setMostrarCarrito(!mostrarCarrito);
    };

    const toggleAgregarProducto = () => {
        setMostrarAgregarProducto(!mostrarAgregarProducto);
        setMostrarCarrito(false);
        setMostrarProductos(false);
        setMostrarAgregarCantidades(false);
        setMostrarPerfil(false);
        setMostrarPedidos(false);
    };

    const toggleProductos = () => {
        setMostrarProductos(!mostrarProductos);
        setMostrarAgregarProducto(false);
        setMostrarAgregarCantidades(false);
        setMostrarPerfil(false);
        setMostrarPedidos(false);
    };

    const togglePerfil = () => {
        setMostrarPerfil(!mostrarPerfil);
        setMostrarCarrito(false);
        setMostrarAgregarProducto(false);
        setMostrarProductos(false);
        setMostrarAgregarCantidades(false);
        setMostrarPedidos(false);
    };

    const toggleAgregarCantidades = () => {
        setMostrarAgregarCantidades(!mostrarAgregarCantidades);
        setMostrarCarrito(false);
        setMostrarAgregarProducto(false);
        setMostrarProductos(false);
        setMostrarPerfil(false);
        setMostrarPedidos(false);
    };

    const togglePedidos = () => {
        setMostrarPerfil(false);
        setMostrarPedidos(!mostrarPedidos);
        setMostrarCarrito(false);
        setMostrarAgregarProducto(false);
        setMostrarProductos(false);
        setMostrarAgregarCantidades(false);
    };


    return (
        <div className="container">
            <div className="logo-container" onClick={toggleProductos}>
                <img src={logotipoImg} alt="Logotipo" className="logo" />
            </div>
            <h1 className="label-home">
                {/* <img src={logotipo} alt="Logotipo" className="logo" /> */}
            </h1>
            <p className="welcome-text">{correoUsuario}</p>
            <button className="agregar-btn" onClick={toggleAgregarProducto}>
                <div className="agregar-circle">
                    <img src={productosIcono} alt="Agregar Producto" />
                </div>
            </button>
            <button className="perfil-btn" onClick={togglePerfil}>
                <div className="perfil-circle">
                    {imagenPerfil ? (
                        <img src={imagenPerfil} alt="Perfil" />
                    ) : (
                        <img src={perfilIcono} alt="Perfil" />
                    )}
                </div>
            </button>
            <button className="logout-btn" onClick={handleLogout}>
                <div className="logout-circle">
                    <img src={outIcono} alt="Cerrar Sesión" />
                </div>
            </button>
            <button className="carrito-btn" onClick={toggleCarrito}>
                <div className="carrito-circle">
                    <img src={logotipo} alt="Carrito" />
                </div>
            </button>
    
            <button className="agregar-cantidades-btn" onClick={toggleAgregarCantidades}>
                <div className="agregar-cantidades-circle">
                    <img src={holaIcono} alt="Agregar Cantidades" />
                </div>
            </button>
    
            <button className="pedidos-btn" onClick={togglePedidos}>
                <div className="pedidos-circle">
                    <img src={pedidosIcono} alt="Pedidos" />
                </div>
            </button>
    
            {!mostrarCarrito && !mostrarAgregarProducto && !mostrarPerfil && !mostrarAgregarCantidades && !mostrarPedidos && (
            <React.Fragment>
                <Productos />
                {mostrarCarrito && <Carrito />}
            </React.Fragment>
        )}

        {mostrarCarrito && <Carrito />}
        {mostrarAgregarProducto && <AgregarProducto />}
        {mostrarPerfil && <Perfil />}
        {mostrarAgregarCantidades && <Ajua />}
        {mostrarPedidos && <Pedidos />}
        </div>
    );
};

export default Home;
