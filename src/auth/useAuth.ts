/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { auth, isRealFirebaseReady } from '../firebase';
import { dbSimulada } from '../utils/simulatedDb';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>({
    uid: 'simulated-user-123',
    email: 'dazasantiago0915@gmail.com', // usuario de la metadata en el runtime
    role: dbSimulada.getRole(),
    displayName: 'Santiago Daza',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isRealFirebaseReady || !auth) {
      // Modo simulado descansa sobre nuestra DB simulada
      const unsubscribeSim = dbSimulada.subscribe(() => {
        setUser(prev => prev ? { ...prev, role: dbSimulada.getRole() } : null);
      });
      return unsubscribeSim;
    }

    setLoading(true);
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      if (firebaseUser) {
        // En firebase real, usualmente guardamos roles en una colección de usuarios o leemos custom claims.
        // Simulamos la resolución del claim para mantener el diseño limpio.
        let role: UserRole = 'operador';
        if (firebaseUser.email?.includes('supervisor')) {
          role = 'supervisor';
        } else if (firebaseUser.email?.includes('gerente') || firebaseUser.email?.includes('dazasantiago0915')) {
          role = 'gerente';
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Usuario Industrial',
          role: role,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginConGoogle = async () => {
    if (!isRealFirebaseReady || !auth) {
      // Simular login
      setUser({
        uid: 'simulated-user-123',
        email: 'dazasantiago0915@gmail.com',
        role: dbSimulada.getRole(),
        displayName: 'Santiago Daza',
      });
      return;
    }

    try {
      // Importación dinámica para evitar cargar módulos pesados si no se usa
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('Error de login con Google:', e);
    }
  };

  const logout = async () => {
    if (!isRealFirebaseReady || !auth) {
      setUser(null);
      return;
    }
    
    try {
      await auth.signOut();
    } catch (e) {
      console.error('Error de logout:', e);
    }
  };

  const switchRole = (newRole: UserRole) => {
    dbSimulada.setRole(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return {
    user,
    role: user?.role || 'operador',
    loading,
    loginConGoogle,
    logout,
    switchRole,
  };
}
