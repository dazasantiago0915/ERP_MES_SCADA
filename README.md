# ERP · MES · SCADA — Dashboard Industrial en Tiempo Real
## Alimentos del Valle S.A.S.

Aplicación web de monitoreo industrial que unifica en un único tablero 
de control los tres niveles de automatización de una planta de alimentos:
el nivel de campo (SCADA), el nivel de ejecución (MES) y el nivel de 
gestión (ERP).

---

## ¿Qué hace esta aplicación?

Permite a operadores, supervisores y gerentes de planta visualizar en 
tiempo real el desempeño de dos líneas de producción (Mezclado/Envasado 
y Pasteurización/Sellado) a través de los siguientes indicadores clave:

**OEE — Overall Equipment Effectiveness**
Calcula la eficiencia global del equipo descompuesta en sus tres factores:
- Disponibilidad (A): tiempo operativo vs. tiempo planificado
- Rendimiento (P): velocidad real vs. velocidad nominal de diseño
- Calidad (Q): unidades buenas vs. unidades totales producidas
El semáforo OEE clasifica el resultado en cuatro niveles:
Crítico (<65%) · Por mejorar (65–75%) · Aceptable (75–85%) · World Class (≥85%)

**OTIF — On Time In Full**
Mide el cumplimiento de pedidos de clientes considerando entrega 
a tiempo (fecha real ≤ fecha compromiso) y cantidad completa 
(con tolerancia del 2%). Objetivo: ≥ 95%.

**KPIs complementarios**
Tasa de alarmas críticas, backlog de producción, MTBF, MTTR 
y velocidad de manufactura por producto.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Lenguaje principal | **TypeScript 99.8%** (strict mode) |
| Frontend | **React 18** + Vite + Tailwind CSS |
| Gráficos | Recharts + SVG animado (gauge OEE) |
| Backend / Lógica | **Firebase Functions** (Node.js 20 / TypeScript) |
| Base de datos | **Cloud Firestore** (listeners en tiempo real con onSnapshot) |
| Autenticación | Firebase Auth con custom claims por rol |
| IA generativa | **Google Gemini API** (Google AI Studio) |
| Despliegue | **Vercel** (hosting) + Firebase (functions + Firestore) |
| Seguridad | Firestore Rules por rol: operador · supervisor · gerente |

---

## Arquitectura

La aplicación sigue una arquitectura serverless de tres capas:

1. **Capa de campo (SCADA):** Ingesta de eventos de alarmas y 
   telemetría de sensores por línea de producción.

2. **Capa de ejecución (MES):** Gestión de órdenes de producción, 
   cálculo automático de OEE por turno mediante Firebase Functions 
   disparadas al actualizar cada orden.

3. **Capa de gestión (ERP):** Control de pedidos de clientes, 
   cálculo de OTIF mensual y generación de resúmenes diarios 
   mediante funciones programadas (Scheduled Functions).

---

## Generado con Google AI Studio

Este proyecto fue diseñado e implementado con asistencia de 
**Gemini 2.5 Pro** a través de Google AI Studio, utilizando 
prompts de ingeniería de software especializados en sistemas 
industriales (metodología RCI: Rol · Contexto · Indicación).

🔗 Ver en AI Studio: https://ai.studio/apps/b6a13e62-f14e-4520-a8c8-475874901f57
🔗 Repositorio: https://github.com/dazasantiago0915/ERP_MES_SCADA

---

## Ejecución local

Prerrequisitos: Node.js 20+

\```bash
npm install
# Configura GEMINI_API_KEY en .env.local
npm run dev
\```

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b6a13e62-f14e-4520-a8c8-475874901f57

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
