// Importa las dependencias necesarias de React y Firebase.
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, getDoc, addDoc, collection } from "firebase/firestore";
import "./Accesorios.css";

// Datos estáticos de los accesorios disponibles, cada uno con id, nombre, precio y puntos necesarios para canje.
const accesoriosData = [
  { id: 1, nombre: "Collar", precio: 300, puntos: 30 },
  { id: 2, nombre: "Correa", precio: 500, puntos: 50 },
  { id: 3, nombre: "Placa de identificación", precio: 150, puntos: 15 },
  { id: 4, nombre: "Juguete", precio: 200, puntos: 20 },
  { id: 5, nombre: "Plato", precio: 250, puntos: 25 },
];

// Componente principal para la sección de accesorios.
const Accesorios = () => {
  const [carrito, setCarrito] = useState([]); // Estado para almacenar los accesorios en el carrito de compras.
  const [sueldo, setSueldo] = useState(0); // Estado para almacenar el saldo del usuario.
  const [puntos, setPuntos] = useState(0); // Estado para almacenar los puntos del usuario.
  const [userEmail, setUserEmail] = useState(""); // Estado para almacenar el email del usuario autenticado.
  const [role, setRole] = useState(""); // Estado para almacenar el rol del usuario.
  const [loading, setLoading] = useState(true); // Estado para manejar la carga de datos.

  // useEffect para cargar los datos del usuario cuando se autentica.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email);
        const userRef = doc(db, "usuarios", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSueldo(userData.sueldo || 10000); // Inicializa el sueldo en 10000 si no existe.
          setPuntos(userData.puntos || 0); // Carga los puntos desde la base de datos, o inicia en 0 si no existe.
          setRole(userData.role); // Asigna el rol del usuario.
        } else {
          console.log("No existe el documento del usuario");
        }
      }
      setLoading(false); // Marca la carga como completa.
    });

    return () => unsubscribe();
  }, []);

  // Si aún se están cargando los datos, muestra un mensaje de carga.
  if (loading) {
    return <p>Cargando...</p>;
  }

  // Verifica el rol del usuario para mostrar el contenido correspondiente.
  if (role !== "cliente") {
    return <p>No tienes acceso a esta sección.</p>; // Mensaje de acceso denegado para veterinarios.
  }

  // Función para canjear puntos por un accesorio, si el usuario tiene suficientes puntos.
  const canjearPuntos = async (accesorio) => {
    if (puntos >= accesorio.puntos) {
      const nuevosPuntos = puntos - accesorio.puntos;
      setPuntos(nuevosPuntos);

      try {
        const userRef = doc(db, "usuarios", auth.currentUser.uid);
        // Actualiza los puntos en la base de datos del usuario.
        await updateDoc(userRef, { puntos: nuevosPuntos });
        alert(
          `Has canjeado ${accesorio.nombre} por ${accesorio.puntos} puntos.`
        );
      } catch (error) {
        console.error(
          "Error al actualizar los puntos en la base de datos:",
          error
        );
        alert("Hubo un problema al canjear puntos. Intenta de nuevo.");
      }
    } else {
      alert("No tienes suficientes puntos para canjear este accesorio.");
    }
  };

  // Función para agregar un accesorio al carrito de compras, verificando que no se exceda el sueldo.
  const agregarAlCarrito = (accesorio) => {
    const nuevoCarrito = [...carrito, accesorio];
    const totalCompra = nuevoCarrito.reduce(
      (total, item) => total + item.precio,
      0
    );

    if (totalCompra <= sueldo) {
      setCarrito(nuevoCarrito);
    } else {
      alert("No tienes suficiente dinero para comprar estos accesorios.");
    }
  };

  // Función para eliminar un accesorio del carrito de compras.
  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
  };

  // Calcula el total del carrito de compras sumando los precios de todos los accesorios.
  const totalCarrito = carrito.reduce((total, item) => total + item.precio, 0);

  // Función para realizar la compra de los accesorios en el carrito y actualizar el sueldo y puntos en la base de datos.
  const comprarAccesorios = async () => {
    if (totalCarrito === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (totalCarrito <= sueldo) {
      const nuevoSueldo = sueldo - totalCarrito;
      const nuevosPuntos = puntos + totalCarrito * 0.1; // Calcula el 10% de la compra en puntos.
      setSueldo(nuevoSueldo);
      setPuntos(nuevosPuntos);
      setCarrito([]);

      try {
        const userRef = doc(db, "usuarios", auth.currentUser.uid);

        // Guarda la compra en la colección de "compras_accesorios" en Firebase.
        await addDoc(collection(db, "compras_accesorios"), {
          email: userEmail,
          accesorios: carrito,
          total: totalCarrito,
          sueldoRestante: nuevoSueldo,
          puntosGanados: totalCarrito * 0.1,
          fecha: new Date().toISOString(),
        });

        // Actualiza el sueldo y puntos del usuario en la base de datos.
        await updateDoc(userRef, { sueldo: nuevoSueldo, puntos: nuevosPuntos });

        alert(
          "Compra de accesorios realizada exitosamente! Has ganado puntos."
        );
      } catch (e) {
        console.error("Error al realizar la compra de accesorios: ", e);
        alert("Hubo un problema al realizar la compra. Intenta de nuevo.");
      }
    } else {
      alert("No tienes suficiente dinero para realizar la compra.");
    }
  };

  return (
    <div className="accesorios-container">
      <h1>Accesorios para Mascotas</h1>
      <div className="accesorios-list">
        {accesoriosData.map((accesorio) => (
          <div key={accesorio.id} className="accesorio-card">
            <h2>{accesorio.nombre}</h2>
            <p>Precio: ${accesorio.precio.toFixed(2)}</p>
            <p>Puntos necesarios: {accesorio.puntos}</p>
            <button onClick={() => agregarAlCarrito(accesorio)}>
              Agregar al Carrito
            </button>
            <button onClick={() => canjearPuntos(accesorio)}>
              Canjear por {accesorio.puntos} puntos
            </button>
          </div>
        ))}
      </div>
      <div className="carrito">
        <h2>Carrito de Compras</h2>
        {carrito.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <ul>
            {carrito.map((item, index) => (
              <li key={index}>
                {item.nombre} - ${item.precio.toFixed(2)}
                <button onClick={() => eliminarDelCarrito(index)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <h3>Total: ${totalCarrito.toFixed(2)}</h3>
      <button onClick={comprarAccesorios} className="comprar-button">
        Comprar
      </button>
      <h3>Dinero disponible: ${sueldo.toFixed(2)}</h3>
      <h3>Puntos: {puntos}</h3>
    </div>
  );
};

export default Accesorios;
