/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Turno, OperationType } from '../types';
import { isRealFirebaseReady, db as firebaseDb } from '../firebase';
import { dbSimulada } from '../utils/simulatedDb';

export function useOEELinea(lineaId: 'L1' | 'L2') {
  const [turnoActual, setTurnoActual] = useState<Turno | null>(null);
  const [historico7dias, setHistorico7dias] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no está listo el Firebase real, usamos la DB simulada reactiva
    if (!isRealFirebaseReady || !firebaseDb) {
      const cargarSimulado = () => {
        const turnos = dbSimulada.getTurnos(lineaId);
        // El primer turno en la lista es el activo/actual, el resto conforma el histórico
        const actual = turnos.find(t => t.estado === 'activo') || turnos[0] || null;
        setTurnoActual(actual);
        setHistorico7dias(turnos.slice(1, 8)); // 7 días históricos precedentes o similares
        setLoading(false);
      };

      cargarSimulado();
      const unsubscribeSim = dbSimulada.subscribe(cargarSimulado);
      return unsubscribeSim;
    }

    setLoading(true);
    let unsubscribe: () => void = () => {};

    const path = `lineas/${lineaId}/turnos`;
    const formatPayloadError = (err: unknown) => {
      const errInfo = {
        error: err instanceof Error ? err.message : String(err),
        authInfo: { userId: 'firebase-auth-active' },
        operationType: OperationType.LIST,
        path
      };
      console.error('Firestore Error: ', JSON.stringify(errInfo));
      setError(JSON.stringify(errInfo));
      setLoading(false);
    };

    try {
      // Importaciones dinámicas del SDK modular v9+ de Firestore
      const initFirestoreListeners = async () => {
        const { collection, query, orderBy, limit, onSnapshot } = await import('firebase/firestore');
        const ref = collection(firebaseDb, 'lineas', lineaId, 'turnos');
        const q = query(ref, orderBy('fecha', 'desc'), limit(15)); // Traemos extras para separar actual de histórico

        unsubscribe = onSnapshot(q, (snapshot) => {
          const list: Turno[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              ...data,
              fecha: data.fecha?.toDate ? data.fecha.toDate() : new Date(data.fecha),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
            } as Turno);
          });

          // Primer resultado es el turno actual
          const actual = list.find(t => t.estado === 'activo') || list[0] || null;
          setTurnoActual(actual);
          // Los históricos de los últimos 7 turnos cerrados
          const historicos = list.filter(t => t.id !== actual?.id).slice(0, 7);
          setHistorico7dias(historicos);
          setLoading(false);
        }, (err) => {
          formatPayloadError(err);
        });
      };

      initFirestoreListeners();
    } catch (err) {
      formatPayloadError(err);
    }

    return () => unsubscribe();
  }, [lineaId]);

  return { turnoActual, historico7dias, loading, error };
}
