/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { calcularOEE } from '../kpis/calcularOEE';

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Disparador Firestore: Actualiza los promedios globales de OEE en /kpis/resumen al cambiar una orden
 */
export const onOrdenUpdate = functions.firestore
  .document('ordenes/{ordenId}')
  .onWrite(async (change, context) => {
    const db = admin.firestore();

    // Obtener todas las órdenes para recalcular el backlog consolidado
    const ordenesSnap = await db.collection('ordenes').get();
    const ordenes: any[] = [];
    ordenesSnap.forEach(doc => {
      ordenes.push(doc.data());
    });

    const backlogUnidades = ordenes
      .filter(o => ['pendiente', 'en_curso'].includes(o.estadoOrden))
      .reduce((sum, o) => sum + (o.cantidadPlanificada - o.cantidadProducida), 0);

    // Actualizar el KPI resumen consolidados
    await db.collection('kpis').doc('resumen').set({
      backlogUnidades,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    functions.logger.log(`[onOrdenUpdate] Backlog recalculado en ${backlogUnidades} unidades.`);
  });
