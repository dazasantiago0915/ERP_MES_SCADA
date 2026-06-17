# Guía de Despliegue en Producción — Firebase Cloud Run

Esta guía detalla los pasos para realizar la compilación y despliegue del sistema de **Control Industrial OEE y OTIF** en un entorno de producción real utilizando **Google Firebase**.

---

## 1. Requisitos Previos

Antes de comenzar, asegúrese de contar con las siguientes herramientas instaladas localmente en su máquina de desarrollo:

- **Node.js**: Versión 20 (Recomendada).
- **Git**: Para control de versiones.
- **Firebase CLI**: Consola de comandos para desplegar reglas, funciones y hosting. Instálelo con:
  ```bash
  npm install -g firebase-tools
  ```

---

## 2. Configuración en la Consola de Firebase

1. Vaya a la [Consola de Firebase](https://console.firebase.google.com/) y haga clic en **Agregar Proyecto**.
2. Nombre su proyecto (ej. `alimentos-del-valle-sas`) y cree el recurso.
3. Active los siguientes servicios:
   - **Firestore Database**: Créela en modo de producción y elija la zona de servidor regional más cercana (ej. `southamerica-east1` o `us-east1`).
   - **Authentication**: Habilite los proveedores **Correo electrónico/Contraseña** y **Google Sign-In**.
   - **Hosting**: Habilite hosting para el despliegue del cliente web estático.
   - **Cloud Functions**: Habilite el plan **Blaze** (pago por uso, incluye cuota gratuita) para poder correr funciones v2 de Node JS.

---

## 3. Vincular el Proyecto Localmente

Abra su terminal en la raíz del proyecto y autentíquese con su cuenta de Google creadora del proyecto de Firebase:

```bash
# 1. Autenticarse
firebase login

# 2. Vincular el alias por defecto con su ID real de proyecto creado en la Consola
firebase use --add [SU-PROJECT-ID]
```

---

## 4. Compilación del Cliente Web (Vite + React)

Compile los recursos estáticos optimizados para producción. Esto generará la carpeta `/dist` en la raíz del proyecto:

```bash
# Instalar dependencias si no lo ha hecho
npm install

# Compilar assets estáticos
npm run build
```

---

## 5. Compilación del Backend (Cloud Functions)

Navegue a la carpeta de funciones, instale sus librerías e inicie el pre-compilado de TypeScript a ES6:

```bash
cd functions

# Instalar librerías
npm install

# Compilar código de TypeScript a JavaScript CommonJS
npm run build

# Regrese a la raíz del proyecto
cd ..
```

---

## 6. Despliegue Consolidado de Firebase

Para desplegar simultáneamente las Reglas de Firestore, los índices compuestos de consulta, las funciones de cálculo automático en la nube y el Front-End en Hosting, ejecute:

```bash
firebase deploy
```

Si desea realizar despliegues selectivos, puede usar las banderas dedicadas del CLI:

```bash
# Desplegar sólo reglas de seguridad e índices
firebase deploy --only firestore

# Desplegar sólo el Front-End al Hosting CDN
firebase deploy --only hosting

# Desplegar sólo las funciones en la nube (Ingesta CSV, triggers)
firebase deploy --only functions
```

---

## 7. Registro de Claims de Seguridad para un Usuario Administrativo

Para que las reglas de `/firestore.rules` habiliten a un usuario de planta a realizar operaciones, usted debe registrar su claim de rol (`operador`, `supervisor` o `gerente`). Puede hacerlo rápidamente corriendo un script de Node admin o mediante la utilidad de Firebase Functions:

```typescript
// Ejemplo de script rápido para adjudicar claim mediante firebase-admin SDK:
import * as admin from 'firebase-admin';

admin.initializeApp();

async function setRole(uid: string, role: 'operador' | 'supervisor' | 'gerente') {
  await admin.auth().setCustomUserClaims(uid, { role });
  console.log(`✓ Claim [${role}] adjudicado al usuario [${uid}] exitosamente.`);
}

setRole("UID-DEL-USUARIO-REGISTRADO", "gerente");
```

---

## 8. Verificación de Funcionamiento

Una vez completado el despliegue de hosting, el Firebase CLI le proporcionará la URL CDN de producción del tipo:
`https://alimentos-del-valle-sas.web.app`

Toda la comunicación de los sockets de Firestore con la aplicación pasará automáticamente por encriptación SSL estándar de producción. Los logs de comportamiento de sensores quedarán guardados de forma duradera en la consola de Google Cloud Logging asociada a su tenant.
