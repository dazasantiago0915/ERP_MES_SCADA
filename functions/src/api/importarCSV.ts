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
 * End-Point HTTP: Recibe registros JSON de un CSV uploader externo
 * Valida que el solicitante sea 'gerente' antes de escribir en batch en Firestore
 */
export const importarCSV = functions.https.onRequest(async (req, res) => {
  // CORS simple handler
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  try {
    // 1. Validar autorización de Token de Firebase
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Acceso No Autorizado: Token Bearer faltante o corrupto.' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Verificar claim de rol 'gerente'
    if (decodedToken.role !== 'gerente') {
      res.status(403).json({ error: 'Acceso Denegado: Rol insuficiente para importar registros masivos.' });
      return;
    }

    const { coleccion, registros } = req.body;

    if (!coleccion || !Array.isArray(registros)) {
      res.status(400).json({ error: 'Body mal formado: Requiere "coleccion" y array de "registros".' });
      return;
    }

    const db = admin.firestore();
    const batch = db.batch();
    let importados = 0;

    // Límite de batch de Firestore es de 500 operaciones
    const limiteRegistros = registros.slice(0, 490);

    limiteRegistros.forEach((reg: any, i: number) => {
      // Crear ID único o respetar el que viene
      const id = reg.id || `IMP-${decodedToken.uid.slice(0, 4)}-${Date.now()}-${i}`;
      const docRef = db.collection(coleccion).doc(id);

      batch.set(docRef, {
        ...reg,
        importadoPor: decodedToken.email,
        importadoAt: admin.firestore.FieldValue.serverTimestamp(),
        // Validar formato de fecha
        fechaCompromiso: reg.fechaCompromiso ? admin.firestore.Timestamp.fromDate(new Date(reg.fechaCompromiso)) : admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      importados++;
    });

    // Compilar operación transaccional
    await batch.commit();

    res.status(200).json({
      success: true,
      importados,
      mensaje: `Sincronización masiva para colección [${coleccion}] exitosa.`
    });

  } catch (err: any) {
    functions.logger.error('Error de importación masiva CSV:', err);
    res.status(500).json({ error: 'Fallo crítico del servidor de base de datos.', detalle: err.message });
  }
});
