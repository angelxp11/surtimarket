import React, { useState, useEffect } from 'react';
import './Login.css';
import firebaseApp from '../credenciales';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importar íconos de ojo abierto y cerrado desde react-icons/fa

const auth = getAuth(firebaseApp);

const Login = () => {
    const [registrando, setRegistrando] = useState(false);
    const [mostrarContraseña, setMostrarContraseña] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [titulo, setTitulo] = useState("Inicia sesión");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const correo = e.target.email.value;
        const contraseña = e.target.password.value;

        setLoading(true);

        try {
            if (registrando) {
                await createUserWithEmailAndPassword(auth, correo, contraseña);
            } else {
                await signInWithEmailAndPassword(auth, correo, contraseña);
            }
        } catch (error) {
            setLoading(false);
            switch (error.code) {
                case 'auth/invalid-email':
                    setErrorMessage('Esta no es una dirección de correo electrónico válida');
                    break;
                case 'auth/user-not-found':
                    setErrorMessage('El correo electrónico no está registrado. Verifique nuevamente');
                    break;
                case 'auth/wrong-password':
                    setErrorMessage('La contraseña es incorrecta');
                    break;
                default:
                    setErrorMessage('Error de inicio de sesión. Por favor, inténtalo de nuevo');
            }
        }
    };

    const toggleMostrarContraseña = () => {
        setMostrarContraseña(!mostrarContraseña);
    };

    useEffect(() => {
        setTitulo(registrando ? "Regístrate" : "Inicia sesión");
    }, [registrando]);

    return (
        <div className="container">
            <div className={`form-container ${registrando ? 'animate-transition' : ''}`}>
                <h1 className={`form-title ${registrando ? 'animate-transition' : ''}`}>{titulo}</h1>
                <form className="card card-body" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            aria-describedby="emailHelp"
                            placeholder="Enter email"
                            id="email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="password-input-container">
                            <input
                                type={mostrarContraseña ? "text" : "password"}
                                className="form-control"
                                placeholder="Enter password"
                                id="password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={toggleMostrarContraseña}
                            >
                                {mostrarContraseña ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </div>

                    {!loading ? (
                        <button type="submit" className={`submit-btn btn btn-primary animate-transition`}>
                            {registrando ? "Regístrate" : "Iniciar sesión"}
                        </button>
                    ) : (
                        <div className="progress">
                            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: "100%" }}></div>
                        </div>
                    )}
                </form>
            </div>
            <button
                className="btn btn-link register-button"
                onClick={() => setRegistrando(!registrando)}
            >
                {registrando ? "Inicia sesión" : "Regístrate"}
            </button>
        </div>
    );
};

export default Login;
