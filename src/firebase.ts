/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Bandera para saber si el Firebase real está configurado correctamente
export let isRealFirebaseReady = false;

let firebaseApp;
let firestoreDb: any = null;
let firebaseAuth: any = null;

// Validar que el config no sea un placeholder antes de inicializar
const isPlaceholder = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes('YOUR_API_KEY') || 
  firebaseConfig.apiKey === '';

if (!isPlaceholder) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');
    firebaseAuth = getAuth(firebaseApp);
    isRealFirebaseReady = true;
    console.log('[Firebase] Conectado exitosamente al backend de producción.');
  } catch (error) {
    console.warn('[Firebase] Error al iniciar SDK real de Firebase. Activando modo simulado local:', error);
  }
} else {
  console.log('[Firebase] Usando base de datos industrial simulada para visualización en tiempo real.');
}

// Exportamos lo necesario. Si falla o es placeholder, se inyectan nulos para que los hooks carguen el simulador automáticamente.
export const db = firestoreDb;
export const auth = firebaseAuth;
export default firebaseApp;
