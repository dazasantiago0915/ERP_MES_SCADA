/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ResumenKPIs, OperationType } from '../types';
import { isRealFirebaseReady, db as firebaseDb } from '../firebase';
import { dbSimulada } from '../utils/simulatedDb';

export function useKPIsSecundarios() {
  const [resumen, setResumen] = useState<ResumenKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isRealFirebaseReady || !firebaseDb) {
      const cargarSimulado = () => {
        setResumen(dbSimulada.getResumen());
        setLoading(false);
      };

      cargarSimulado();
      const unsubscribeSim = dbSimulada.subscribe(cargarSimulado);
      return unsubscribeSim;
    }

    setLoading(true);
    let unsubscribe: () => void = () => {};

    const path = 'kpis/resumen';
    const formatPayloadError = (err: unknown) => {
      const errInfo = {
        error: err instanceof Error ? err.message : String(err),
        authInfo: { userId: 'firebase-user-kpis-secundarios' },
        operationType: OperationType.GET,
        path
      };
      console.error('Firestore Error in useKPIsSecundarios: ', JSON.stringify(errInfo));
      setLoading(false);
    };

    const initListener = async () => {
      const { doc, onSnapshot } = await import('firebase/firestore');

      const ref = doc(firebaseDb, 'kpis', 'resumen');
      unsubscribe = onSnapshot(ref, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setResumen({
            ...data,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
          } as ResumenKPIs);
        }
        setLoading(false);
      }, (err) => {
        formatPayloadError(err);
      });
    };

    initListener();

    return () => unsubscribe();
  }, []);

  return { resumen, loading };
}
