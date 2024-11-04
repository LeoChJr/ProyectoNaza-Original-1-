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
      historialesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Historiales para veterinario:", historialesData);
    } else {
      historialesData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((historial) => historial.userId === user.uid);
    }
  
    setHistoriales(historialesData);
  };

  // Llama a la función para obtener los historiales una vez que el usuario se autentica.
  useEffect(() => {
    if (user || isVeterinario) { // Cambiado a 'user || isVeterinario' para que se llame también al rol
      fetchHistoriales();
    }
  }, [user, isVeterinario]); // Añadir isVeterinario como dependencia

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

  // Edita un historial clínico en la base de datos y actualiza el estado local con los datos actualizados.
  const handleEdit = async (id, updatedData) => {
    if (!isVeterinario) return;
    try {
      await updateDoc(doc(db, "historiales_clinicos", id), updatedData);
      setHistoriales(
        historiales.map((historial) =>
          historial.id === id ? { ...historial, ...updatedData } : historial
        )
      );
    } catch (error) {
      console.error("Error al actualizar el historial:", error);
    }
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
          {isVeterinario && (
            <div className="hc-card-actions">
              <button
                onClick={() =>
                  handleEdit(historial.id, {
                    /* updatedData aquí */
                  })
                }
              >
                Editar
              </button>
              <button onClick={() => handleDelete(historial.id)}>
                Eliminar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HistorialClinico;
