import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./Register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Usuario registrado");
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
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit" className="register-button">
            Registarse
          </button>
        </form>
        <p className="signin-link">
          Ya tienes una cuenta <a href="/login">Iniciar Sesion</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
