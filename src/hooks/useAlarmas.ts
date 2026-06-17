/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Alarma, OperationType } from '../types';
import { isRealFirebaseReady, db as firebaseDb } from '../firebase';
import { dbSimulada } from '../utils/simulatedDb';

export function useAlarmas() {
  const [alarmasActivas, setAlarmasActivas] = useState<Alarma[]>([]);
  const [alarmasCriticas, setAlarmasCriticas] = useState<number>(0);
  const [tasaCriticidad, setTasaCriticidad] = useState<number>(14.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isRealFirebaseReady || !firebaseDb) {
      const cargarSimulado = () => {
        const alarmas = dbSimulada.getAlarmas();
        const activas = alarmas.filter(a => !a.resuelta);
        setAlarmasActivas(activas);

        const criticasCount = activas.filter(a => a.nivel === 'critica').length;
        setAlarmasCriticas(criticasCount);

        const resumen = dbSimulada.getResumen();
        setTasaCriticidad(resumen ? resumen.alarmasCriticasPct : 14.0);
        setLoading(false);
      };

      cargarSimulado();
      const unsubscribeSim = dbSimulada.subscribe(cargarSimulado);
      return unsubscribeSim;
    }

    setLoading(true);
    let unsubscribe: () => void = () => {};

    const path = 'alarmas';
    const formatPayloadError = (err: unknown) => {
      const errInfo = {
        error: err instanceof Error ? err.message : String(err),
        authInfo: { userId: 'firebase-user-alarmas' },
        operationType: OperationType.LIST,
        path
      };
      console.error('Firestore Error in useAlarmas: ', JSON.stringify(errInfo));
      setLoading(false);
    };

    const initListener = async () => {
      const { collection, query, where, orderBy, limit, onSnapshot } = await import('firebase/firestore');

      const q = query(
        collection(firebaseDb, 'alarmas'),
        where('resuelta', '==', false),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Alarma[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
          } as Alarma);
        });

        setAlarmasActivas(list);
        const critList = list.filter(a => a.nivel === 'critica').length;
        setAlarmasCriticas(critList);

        // Intentar deducir tasa de criticidad si es posible
        setLoading(false);
      }, (err) => {
        formatPayloadError(err);
      });
    };

    initListener();

    return () => unsubscribe();
  }, []);

  return { alarmasActivas, alarmasCriticas, tasaCriticidad, loading };
}
