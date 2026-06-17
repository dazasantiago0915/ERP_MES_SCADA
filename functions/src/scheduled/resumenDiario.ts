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
 * Función programada: Corre a medianoche (00:00) para archivar un snapshot diario del OEE de planta
 */
export const resumenDiario = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('America/Bogota')
  .onRun(async (context) => {
    const db = admin.firestore();

    // Consultar el KPI consolidado activo
    const resumoSnap = await db.collection('kpis').doc('resumen').get();
    if (!resumoSnap.exists) {
      functions.logger.log('No existe resumen para archivar hoy.');
      return null;
    }

    const data = resumoSnap.data() || {};
    const hoyStr = new Date().toISOString().split('T')[0];

    // Escribir en el histórico de snapshots diarios
    await db.collection('historico_diario').doc(hoyStr).set({
      ...data,
      tipo: 'historico_diario',
      fechaArchivo: admin.firestore.FieldValue.serverTimestamp()
    });

    functions.logger.log(`✓ Snapshot de KPI guardado para el día: ${hoyStr}`);
    return null;
  });
