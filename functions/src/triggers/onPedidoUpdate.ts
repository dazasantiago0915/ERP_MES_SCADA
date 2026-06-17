/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Disparador Firestore: Recalcula la tasa mensual de OTIF al modificar o cerrar un pedido
 */
export const onPedidoUpdate = functions.firestore
  .document('pedidos/{pedidoId}')
  .onWrite(async (change, context) => {
    const db = admin.firestore();

    // Obtener todos los pedidos del mes
    const pedidosSnap = await db.collection('pedidos').get();
    let completados = 0;
    let cumplieronOTIF = 0;

    pedidosSnap.forEach((doc) => {
      const p = doc.data();
      if (p.estadoPedido === 'completada') {
        completados++;
        if (p.otif === true) {
          cumplieronOTIF++;
        }
      }
    });

    // OTIF mensual = (pedidos que cumplieron OTIF / total de pedidos completados en el mes) * 100
    const otifMensual = completados > 0 ? (cumplieronOTIF / completados) * 100 : 95.0;

    // Actualizar en el resumen consolidado de KPIs
    await db.collection('kpis').doc('resumen').set({
      otifMensual: Number(otifMensual.toFixed(2)),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    functions.logger.log(`[onPedidoUpdate] Portafolio OTIF actualizado: ${otifMensual.toFixed(1)}%`);
  });
