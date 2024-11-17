import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./HistorialClinico.css";

const HistorialClinico = () => {
  // Estado para almacenar la lista de historiales clínicos.
  const [historiales, setHistoriales] = useState([]);
  // Estado para verificar si el usuario es un veterinario.
  const [isVeterinario, setIsVeterinario] = useState(false);
  // Estado para almacenar el usuario autenticado actual.
  const [user, setUser] = useState(null);
  // Estado para controlar si estamos editando un historial y los datos actuales.
  const [editingHistorial, setEditingHistorial] = useState(null);
  const [formData, setFormData] = useState({
    nombrePersona: "",
    apellidoPersona: "",
    telefono: "",
    email: "",
    direccion: "",
    fechaConsulta: "",
    nombreMascota: "",
    tipoMascota: "",
    raza: "",
    sexo: "",
    tipoConsulta: "",
    precioFinalConDescuento: "",
    diagnostico: "", // Campo adicional
    tratamiento: "", // Campo adicional
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("Usuario autenticado:", currentUser);
        setUser(currentUser);
        checkUserRole(currentUser.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Verifica el rol del usuario autenticado
  const checkUserRole = async (userId) => {
    const usersCollection = collection(db, "usuarios");
    const snapshot = await getDocs(usersCollection);
    snapshot.forEach((doc) => {
      if (doc.id === userId && doc.data().role === "veterinario") {
        console.log("Rol de veterinario confirmado");
        setIsVeterinario(true);
      }
    });
  };

  const fetchHistoriales = async () => {
    const historialCollection = collection(db, "historiales_clinicos");
    const snapshot = await getDocs(historialCollection);

    let historialesData;
    if (isVeterinario) {
      historialesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Historiales para veterinario:", historialesData);
    } else {
      historialesData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((historial) => historial.userId === user.uid);
    }

    setHistoriales(historialesData);
  };

  useEffect(() => {
    if (user || isVeterinario) {
      fetchHistoriales();
    }
  }, [user, isVeterinario]);

  // Elimina un historial clínico de la base de datos y del estado si el usuario tiene permisos de veterinario.
  const handleDelete = async (id) => {
    if (!isVeterinario) return;
    try {
      await deleteDoc(doc(db, "historiales_clinicos", id));
      setHistoriales(historiales.filter((historial) => historial.id !== id));
    } catch (error) {
      console.error("Error al eliminar el historial:", error);
    }
  };

  // Función para manejar la edición de un historial clínico
  const handleEdit = (historial) => {
    setEditingHistorial(historial.id);
    setFormData({
      nombrePersona: historial.nombrePersona,
      apellidoPersona: historial.apellidoPersona,
      telefono: historial.telefono,
      email: historial.email,
      direccion: historial.direccion,
      fechaConsulta: historial.fechaConsulta,
      nombreMascota: historial.nombreMascota,
      tipoMascota: historial.tipoMascota,
      raza: historial.raza,
      sexo: historial.sexo,
      tipoConsulta: historial.tipoConsulta,
      precioFinalConDescuento: historial.precioFinalConDescuento,
      diagnostico: historial.diagnostico || "", // Asegurarse de que el campo se llene correctamente
      tratamiento: historial.tratamiento || "", // Asegurarse de que el campo se llene correctamente
    });
  };

  // Función para actualizar los datos editados
  const handleUpdate = async () => {
    if (!isVeterinario) return;
    try {
      await updateDoc(
        doc(db, "historiales_clinicos", editingHistorial),
        formData
      );
      setHistoriales(
        historiales.map((historial) =>
          historial.id === editingHistorial
            ? { ...historial, ...formData }
            : historial
        )
      );
      setEditingHistorial(null);
    } catch (error) {
      console.error("Error al actualizar el historial:", error);
    }
  };

  // Maneja los cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="hc-container">
      <h2 className="hc-title">Historial Clínico de Mascotas</h2>
      {historiales.map((historial) => (
        <div key={historial.id} className="hc-card">
          <p>
            <strong>Nombre:</strong> {historial.nombrePersona}
          </p>
          <p>
            <strong>Apellido:</strong> {historial.apellidoPersona}
          </p>
          <p>
            <strong>Teléfono:</strong> {historial.telefono}
          </p>
          <p>
            <strong>Email:</strong> {historial.email}
          </p>
          <p>
            <strong>Dirección:</strong> {historial.direccion}
          </p>
          <p>
            <strong>Fecha de Consulta:</strong> {historial.fechaConsulta}
          </p>
          <h3>
            <strong>Nombre del Perro:</strong> {historial.nombreMascota}
          </h3>
          <p>
            <strong>Tipo de Mascota:</strong> {historial.tipoMascota}
          </p>
          <p>
            <strong>Raza:</strong> {historial.raza}
          </p>
          <p>
            <strong>Sexo:</strong> {historial.sexo}
          </p>
          <p>
            <strong>Tipo de Consulta:</strong> {historial.tipoConsulta}
          </p>
          <p>
            <strong>Precio Final con Descuento:</strong> $
            {historial.precioFinalConDescuento}
          </p>

          {/* Mostrar campos adicionales si están disponibles */}
          {historial.diagnostico && (
            <p>
              <strong>Diagnóstico:</strong> {historial.diagnostico}
            </p>
          )}
          {historial.tratamiento && (
            <p>
              <strong>Tratamiento:</strong> {historial.tratamiento}
            </p>
          )}

          {isVeterinario && (
            <div className="hc-card-actions">
              <button onClick={() => handleEdit(historial)}>Editar</button>
              <button onClick={() => handleDelete(historial.id)}>
                Eliminar
              </button>
            </div>
          )}
        </div>
      ))}
      {/* Formulario para editar el historial clínico */}
      {editingHistorial && (
        <div className="edit-form">
          <h3>Editar Historial Clínico</h3>
          {/* Los campos existentes */}
          <input
            type="text"
            name="nombrePersona"
            value={formData.nombrePersona}
            onChange={handleInputChange}
            disabled
          />
          <input
            type="text"
            name="apellidoPersona"
            value={formData.apellidoPersona}
            onChange={handleInputChange}
            disabled
          />
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            disabled
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled
          />
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            disabled
          />
          <input
            type="date"
            name="fechaConsulta"
            value={formData.fechaConsulta}
            onChange={handleInputChange}
            disabled
          />
          <input
            type="text"
            name="nombreMascota"
            value={formData.nombreMascota}
            onChange={handleInputChange}
            disabled
          />
          <input
            type="text"
            name="tipoMascota"
            value={formData.tipoMascota}
            onChange={handleInputChange}
            disabled
          />
          <input
            type="text"
            name="raza"
            value={formData.raza}
            onChange={handleInputChange}
            disabled
          />
          <input
            type="text"
            name="sexo"
            value={formData.sexo}
            onChange={handleInputChange}
            disabled
          />
          <input
            type="text"
            name="tipoConsulta"
            value={formData.tipoConsulta}
            onChange={handleInputChange}
            disabled
          />
          <input
            type="text"
            name="precioFinalConDescuento"
            value={formData.precioFinalConDescuento}
            onChange={handleInputChange}
            disabled
          />

          {/* Campos adicionales */}
          <input
            type="text"
            name="diagnostico"
            value={formData.diagnostico}
            onChange={handleInputChange}
            placeholder="Diagnóstico"
          />
          <input
            type="text"
            name="tratamiento"
            value={formData.tratamiento}
            onChange={handleInputChange}
            placeholder="Tratamiento"
          />
          <button onClick={handleUpdate}>Actualizar</button>
        </div>
      )}
    </div>
  );
};

export default HistorialClinico;
