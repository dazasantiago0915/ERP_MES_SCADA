/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Pedido, OperationType } from '../types';
import { isRealFirebaseReady, db as firebaseDb } from '../firebase';
import { dbSimulada } from '../utils/simulatedDb';

export function useOTIF() {
  const [otifMensual, setOtifMensual] = useState<number>(87.0);
  const [pedidosEnRiesgo, setPedidosEnRiesgo] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isRealFirebaseReady || !firebaseDb) {
      const cargarSimulado = () => {
        const pedidos = dbSimulada.getPedidos();
        // pedidos en riesgo: otif = false o no calculado (por ejemplo, pendiente/en_curso)
        const enRiesgo = pedidos.filter(p => !p.otif || p.estadoPedido !== 'completada');
        setPedidosEnRiesgo(enRiesgo);

        const resumen = dbSimulada.getResumen();
        setOtifMensual(resumen ? resumen.otifMensual : 87.0);
        setLoading(false);
      };

      cargarSimulado();
      const unsubscribeSim = dbSimulada.subscribe(cargarSimulado);
      return unsubscribeSim;
    }

    setLoading(true);
    let unsubscribePedidos: () => void = () => {};
    let unsubscribeResumen: () => void = () => {};

    const formatPayloadError = (err: unknown, path: string, op: OperationType) => {
      const errInfo = {
        error: err instanceof Error ? err.message : String(err),
        authInfo: { userId: 'firebase-user-otif' },
        operationType: op,
        path
      };
      console.error('Firestore Error in useOTIF: ', JSON.stringify(errInfo));
    };

    const initListeners = async () => {
      const { collection, doc, query, onSnapshot, where, orderBy } = await import('firebase/firestore');

      // 1. Escuchar pedidos donde otif=false o están pendientes/no completados
      const qPedidos = query(
        collection(firebaseDb, 'pedidos'),
        orderBy('fechaCompromiso', 'asc')
      );

      unsubscribePedidos = onSnapshot(qPedidos, (snapshot) => {
        const list: Pedido[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const p = {
            id: doc.id,
            ...data,
            fechaPedido: data.fechaPedido?.toDate ? data.fechaPedido.toDate() : new Date(data.fechaPedido),
            fechaCompromiso: data.fechaCompromiso?.toDate ? data.fechaCompromiso.toDate() : new Date(data.fechaCompromiso),
            fechaEntregaReal: data.fechaEntregaReal?.toDate ? data.fechaEntregaReal.toDate() : data.fechaEntregaReal ? new Date(data.fechaEntregaReal) : undefined
          } as Pedido;
          
          // Filtrar cliente en riesgo: otif === false o sin culminar
          if (p.otif === false || p.estadoPedido !== 'completada') {
            list.push(p);
          }
        });
        setPedidosEnRiesgo(list);
      }, (err) => {
        formatPayloadError(err, 'pedidos', OperationType.LIST);
      });

      // 2. Escuchar la colección de resumen de KPI
      const kpiRef = doc(firebaseDb, 'kpis', 'resumen');
      unsubscribeResumen = onSnapshot(kpiRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setOtifMensual(data.otifMensual || 87.0);
        }
        setLoading(false);
      }, (err) => {
        formatPayloadError(err, 'kpis/resumen', OperationType.GET);
        setLoading(false);
      });
    };

    initListeners();

    return () => {
      unsubscribePedidos();
      unsubscribeResumen();
    };
  }, []);

  return { otifMensual, pedidosEnRiesgo, loading };
}
