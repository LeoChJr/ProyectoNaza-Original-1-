import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; 
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import './MisTurnos.css';

const MisTurnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [editingTurno, setEditingTurno] = useState(null);
  const [nuevoDato, setNuevoDato] = useState('');

  useEffect(() => {
    const fetchTurnos = async () => {
      const user = auth.currentUser;
      if (user) {
        const turnosRef = collection(db, 'turnos');
        const turnosSnapshot = await getDocs(turnosRef);
        const turnosData = turnosSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(turno => turno.userId === user.uid); // Filtrar turnos del usuario

        setTurnos(turnosData);
      }
    };

    fetchTurnos();
  }, []);

  const handleEdit = (turno) => {
    setEditingTurno(turno);
    setNuevoDato(turno.dato); // Supongamos que hay un campo llamado 'dato' que se edita
  };

  const handleUpdate = async () => {
    if (editingTurno) {
      const turnoRef = doc(db, 'turnos', editingTurno.id);
      await updateDoc(turnoRef, { dato: nuevoDato }); // Actualizar el turno
      setTurnos(turnos.map(turno => (turno.id === editingTurno.id ? { ...turno, dato: nuevoDato } : turno)));
      setEditingTurno(null);
      setNuevoDato('');
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'turnos', id)); // Eliminar el turno
    setTurnos(turnos.filter(turno => turno.id !== id));
  };

  return (
    <div className="mis-turnos-container">
      <h1>Mis Turnos</h1>
      {turnos.length === 0 ? (
        <p>No tienes turnos reservados.</p>
      ) : (
        <ul>
          {turnos.map(turno => (
            <li key={turno.id}>
              <span>{turno.dato}</span> {/* Muestra el dato del turno */}
              <button onClick={() => handleEdit(turno)}>Editar</button>
              <button onClick={() => handleDelete(turno.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
      {editingTurno && (
        <div className="edit-turno">
          <h2>Editar Turno</h2>
          <input
            type="text"
            value={nuevoDato}
            onChange={(e) => setNuevoDato(e.target.value)}
          />
          <button onClick={handleUpdate}>Guardar Cambios</button>
          <button onClick={() => setEditingTurno(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default MisTurnos;
