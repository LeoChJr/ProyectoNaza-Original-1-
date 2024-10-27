import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { getDocs, collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './HistorialClinico.css';

const HistorialClinico = () => {
    const [historiales, setHistoriales] = useState([]);
    const [isVeterinario, setIsVeterinario] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                checkUserRole(currentUser.uid);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const checkUserRole = async (userId) => {
        const usersCollection = collection(db, "usuarios");
        const snapshot = await getDocs(usersCollection);
        snapshot.forEach(doc => {
            if (doc.id === userId && doc.data().rol === 'veterinario') {
                setIsVeterinario(true);
            }
        });
    };

    const fetchHistoriales = async () => {
        const historialCollection = collection(db, "historiales_clinicos");
        const snapshot = await getDocs(historialCollection);
        const historialesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistoriales(historialesData);
    };

    useEffect(() => {
        if (user) {
            fetchHistoriales();
        }
    }, [user]);

    const handleDelete = async (id) => {
        if (!isVeterinario) return;
        try {
            await deleteDoc(doc(db, "historiales_clinicos", id));
            setHistoriales(historiales.filter(historial => historial.id !== id));
        } catch (error) {
            console.error("Error al eliminar el historial:", error);
        }
    };

    const handleEdit = async (id, updatedData) => {
        if (!isVeterinario) return;
        try {
            await updateDoc(doc(db, "historiales_clinicos", id), updatedData);
            setHistoriales(historiales.map(historial => historial.id === id ? { ...historial, ...updatedData } : historial));
        } catch (error) {
            console.error("Error al actualizar el historial:", error);
        }
    };

    return (
        <div className="hc-container">
            <h2 className="hc-title">Historial Clínico de Mascotas</h2>
            {historiales.map((historial) => (
                <div key={historial.id} className="hc-card">
                    <h3>{historial.nombreMascota}</h3>
                    <p><strong>Especie/Raza:</strong> {historial.especieRaza}</p>
                    <p><strong>Sexo y Edad:</strong> {historial.sexoEdad}</p>
                    <p><strong>Motivo de Consulta:</strong> {historial.motivoConsulta}</p>
                    {/* Más campos del historial */}
                    {isVeterinario && (
                        <div className="hc-card-actions">
                            <button onClick={() => handleEdit(historial.id, { /* updatedData aquí */ })}>Editar</button>
                            <button onClick={() => handleDelete(historial.id)}>Eliminar</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default HistorialClinico;
