import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./Register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cliente"); // Estado para el rol, por defecto "cliente"
  const [errorMessage, setErrorMessage] = useState("");

  // Función para registrar usuario en Firestore
  const registrarUsuarioEnFirestore = async (user) => {
    try {
      const userRef = doc(db, "usuarios", user.uid);
      await setDoc(userRef, {
        email: user.email,
        sueldo: 10000, // Saldo inicial
        puntos: 0, // Puntos iniciales
        role: role, // Guarda el rol seleccionado
      });
      console.log("Usuario guardado en Firestore con rol:", role);
    } catch (error) {
      console.error("Error al guardar el usuario en Firestore:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Usuario registrado");
      await registrarUsuarioEnFirestore(userCredential.user);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="card">
        <h2>Registrarse</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <select
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="cliente">Cliente</option>
              <option value="veterinario">Veterinario</option>
            </select>
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit" className="register-button">
            Registrarse
          </button>
        </form>
        <p className="signin-link">
          Ya tienes una cuenta? <a href="/login">Iniciar Sesion</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
