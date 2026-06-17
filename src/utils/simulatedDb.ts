/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Linea, Turno, OrdenProduccion, Pedido, Alarma, ResumenKPIs, UserRole } from '../types';
import { calcularOEE, evaluarOTIF } from './formulas';

// Helper de fechas relativas
const haceDias = (n: number, hora = 8): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hora, 0, 0, 0);
  return d;
};

// Generación inicial de datos semilla realistas (PASO 6 - seedData.ts)
const GENERAR_LINEAS = (): Linea[] => [
  { id: 'L1', nombre: 'Línea L1 — Mezclado y envasado (Salsa de tomate 500g)', velocidadNominal: 120, activa: true, turnoActual: 'mañana' },
  { id: 'L2', nombre: 'Línea L2 — Pasteurización y sellado (Jugo de naranja 1L)', velocidadNominal: 90, activa: true, turnoActual: 'tarde' },
];

const GENERAR_TURNOS = (): Turno[] => {
  const turnos: Turno[] = [];
  const tiposTurno: ('mañana' | 'tarde' | 'noche')[] = ['mañana', 'tarde', 'noche'];
  
  // Generar 7 días de turnos para ambas líneas (14 turnos)
  for (let d = 6; d >= 0; d--) {
    const fecha = haceDias(d);
    
    // Línea 1 (OEE deseado entre 70% y 82%)
    // L1 velocidad nominal = 120 ud/hr
    // Turno de 8h (480 min)
    const tPlan1 = 480;
    const tProg1 = Math.floor(Math.random() * 20) + 20; // 20 a 40 min
    const tNoProg1 = Math.floor(Math.random() * 50) + 10; // 10 a 60 min
    const tOperativoHrs1 = (tPlan1 - tProg1 - tNoProg1) / 60;
    // Producción con rendimiento variable
    const velReal1 = 120 * (0.75 + Math.random() * 0.18); // 75% a 93% de nominal
    const prod1 = Math.round(tOperativoHrs1 * velReal1);
    const def1 = Math.round(prod1 * (0.01 + Math.random() * 0.04)); // 1% a 5% defectuosas
    
    const oeeCalculado1 = calcularOEE({
      tiempoPlanificadoMin: tPlan1,
      tiempoParoProgramadoMin: tProg1,
      tiempoParoNoProgramadoMin: tNoProg1,
      unidadesProducidas: prod1,
      unidadesDefectuosas: def1,
      velocidadNominal: 120
    });

    turnos.push({
      id: `L1-T-${d}`,
      lineaId: 'L1',
      fecha: haceDias(d, 6),
      turno: d % 3 === 0 ? 'mañana' : d % 3 === 1 ? 'tarde' : 'noche',
      tiempoPlanificadoMin: tPlan1,
      tiempoParoProgramadoMin: tProg1,
      tiempoParoNoProgramadoMin: tNoProg1,
      unidadesProducidas: prod1,
      unidadesDefectuosas: def1,
      velocidadReal: Number(velReal1.toFixed(2)),
      ...oeeCalculado1,
      estado: d === 0 ? 'activo' : 'cerrado',
      updatedAt: haceDias(d, 14),
    });

    // Línea 2 (OEE deseado entre 75% y 85%)
    // L2 velocidad nominal = 90 ud/hr
    const tPlan2 = 480;
    const tProg2 = Math.floor(Math.random() * 15) + 20; // 20 a 35 min
    const tNoProg2 = Math.floor(Math.random() * 40) + 10; // 10 a 50 min
    const tOperativoHrs2 = (tPlan2 - tProg2 - tNoProg2) / 60;
    const velReal2 = 90 * (0.80 + Math.random() * 0.14); // 80% a 94% de nominal
    const prod2 = Math.round(tOperativoHrs2 * velReal2);
    const def2 = Math.round(prod2 * (0.01 + Math.random() * 0.03)); // 1% a 4% defectuosas

    const oeeCalculado2 = calcularOEE({
      tiempoPlanificadoMin: tPlan2,
      tiempoParoProgramadoMin: tProg2,
      tiempoParoNoProgramadoMin: tNoProg2,
      unidadesProducidas: prod2,
      unidadesDefectuosas: def2,
      velocidadNominal: 90
    });

    turnos.push({
      id: `L2-T-${d}`,
      lineaId: 'L2',
      fecha: haceDias(d, 14),
      turno: d % 3 === 0 ? 'tarde' : d % 3 === 1 ? 'noche' : 'mañana',
      tiempoPlanificadoMin: tPlan2,
      tiempoParoProgramadoMin: tProg2,
      tiempoParoNoProgramadoMin: tNoProg2,
      unidadesProducidas: prod2,
      unidadesDefectuosas: def2,
      velocidadReal: Number(velReal2.toFixed(2)),
      ...oeeCalculado2,
      estado: d === 0 ? 'activo' : 'cerrado',
      updatedAt: haceDias(d, 22),
    });
  }
  return turnos;
};

const GENERAR_ORDENES = (): OrdenProduccion[] => {
  const ordenes: OrdenProduccion[] = [];
  const productos = [
    { id: 'P1', nombre: 'Salsa de tomate 500 g', linea: 'L1' },
    { id: 'P2', nombre: 'Jugo de naranja 1 L', linea: 'L2' }
  ];

  for (let i = 1; i <= 20; i++) {
    const prod = productos[i % 2];
    const diasAtras = Math.floor((20 - i) / 2.5);
    const cantPlan = Math.round(500 + Math.random() * 1500);
    const estado = i === 20 ? 'pendiente' : i === 19 ? 'en_curso' : 'completada';
    const cantProd = estado === 'completada' ? cantPlan : estado === 'en_curso' ? Math.round(cantPlan * 0.6) : 0;
    
    ordenes.push({
      id: `ORD-${1000 + i}`,
      lineaId: prod.linea as 'L1' | 'L2',
      productoId: prod.id,
      nombreProducto: prod.nombre,
      cantidadPlanificada: cantPlan,
      cantidadProducida: cantProd,
      fechaInicio: haceDias(diasAtras, 6),
      fechaFin: estado === 'completada' ? haceDias(diasAtras, 14) : undefined,
      estadoOrden: estado,
      tiempoHoras: estado === 'completada' ? 8 : undefined
    });
  }
  return ordenes;
};

const GENERAR_PEDIDOS = (): Pedido[] => {
  const pedidos: Pedido[] = [];
  const clientes = ['Exito S.A.', 'Cencosud Ltda', 'Supermercados Olimpica', 'Distribuidora del Pacífico', 'Merkur Global', 'Yara S.A.'];
  const productos = [
    { id: 'P1', nombre: 'Salsa de tomate 500 g' },
    { id: 'P2', nombre: 'Jugo de naranja 1 L' }
  ];

  // Generar 30 pedidos que resulten en OTIF global de aproximadamente 87%
  // 30 pedidos -> unos 26 cumplidos, 4 fallados (o 26 OTIF, 4 no OTIF)
  for (let i = 1; i <= 30; i++) {
    const fechaPed = haceDias(30 - i, 8);
    const fechaComp = haceDias(30 - i - (3 + Math.floor(Math.random() * 4)), 17); // 3-7 días de plazo
    
    // Definimos si será un pedido con OTIF exitoso o fallado
    // Supongamos que pedidos con índice i = 5, 12, 17, 24 fallarán de alguna forma para dar ~86.6% OTIF (26/30)
    const esFalla = [5, 12, 17, 24].includes(i);
    const cantSol = Math.round(800 + Math.random() * 2000);
    
    let cantEnt = cantSol;
    let fechaEntReal: Date | undefined = new Date(fechaComp);
    
    if (i > 27) {
      // 3 pedidos pendientes/en producción activos para simular cartera viva
      const estadosActivos: ('pendiente' | 'en_produccion')[] = ['pendiente', 'en_produccion'];
      pedidos.push({
        id: `PED-${5000 + i}`,
        clienteNombre: clientes[i % clientes.length],
        productoId: productos[i % 2].id,
        cantidadSolicitada: cantSol,
        cantidadEntregada: 0,
        fechaPedido: fechaPed,
        fechaCompromiso: fechaComp,
        estadoPedido: estadosActivos[i % 2],
      });
      continue;
    }

    if (esFalla) {
      if (i === 5) {
        // Tarde (Late)
        fechaEntReal = new Date(fechaComp.getTime() + (24 * 60 * 60 * 1000 * 2)); // 2 días de retraso
      } else if (i === 12) {
        // Incompleto (Not full) - menor al 98%
        cantEnt = Math.round(cantSol * 0.94); 
      } else if (i === 17) {
        // Retrasado e incompleto
        fechaEntReal = new Date(fechaComp.getTime() + (24 * 60 * 60 * 1000 * 1));
        cantEnt = Math.round(cantSol * 0.90);
      } else {
        // Tarde pero completo
        fechaEntReal = new Date(fechaComp.getTime() + (24 * 60 * 60 * 1000 * 3));
      }
    } else {
      // Todo bien: a tiempo (o antes) y completo
      fechaEntReal = new Date(fechaComp.getTime() - (Math.floor(Math.random() * 12) * 60 * 60 * 1000)); // unas horas antes
      cantEnt = cantSol; // 100% full
    }

    const { onTime, inFull, otif } = evaluarOTIF({
      fechaCompromiso: fechaComp,
      fechaEntregaReal: fechaEntReal,
      cantidadSolicitada: cantSol,
      cantidadEntregada: cantEnt,
    });

    pedidos.push({
      id: `PED-${5000 + i}`,
      clienteNombre: clientes[i % clientes.length],
      productoId: productos[i % 2].id,
      cantidadSolicitada: cantSol,
      cantidadEntregada: cantEnt,
      fechaPedido: fechaPed,
      fechaCompromiso: fechaComp,
      fechaEntregaReal: fechaEntReal,
      estadoPedido: esFalla && i % 2 === 0 ? 'retrasado' : 'completada',
      onTime,
      inFull,
      otif,
    });
  }
  return pedidos;
};

const GENERAR_ALARMAS = (): Alarma[] => {
  const alarmas: Alarma[] = [];
  const tipos: ('temperatura' | 'presion' | 'velocidad' | 'calidad' | 'mecanico' | 'electrico')[] = [
    'temperatura', 'presion', 'velocidad', 'calidad', 'mecanico', 'electrico'
  ];
  
  const descripciones = {
    temperatura: ['Alta temperatura en tanque mezclador', 'Sobrecalentamiento pasteurizador L2', 'Sensor de temperatura L1 fuera de rango'],
    presion: ['Baja presión en línea de inyección Salsa', 'Pico de presión en boquillas de sellado L2', 'Pérdida de presión de aire comprimido'],
    velocidad: ['Bajo rendimiento nominal por atasco', 'Caída de revoluciones motor principal L1', 'Fricción en cinta transportadora L2'],
    calidad: ['Desviación peso envase 500g', 'Sello térmico incompleto en lote salsa', 'Inspección visual detecta burbujas jugo'],
    mecanico: ['Ruido inusual motor mezclador L1', 'Fallo de rodamientos motor L2', 'Desgaste de correa transportadora'],
    electrico: ['Bajo voltaje de fase L1', 'Fallo de fusible de control de temperatura', 'Fluctuación en variador de frecuencia']
  };

  // Generar 50 alarmas con mezcla de niveles: 60% info (30), 25% advertencia (13), 15% crítica (7)
  for (let i = 1; i <= 50; i++) {
    const nivel: 'info' | 'advertencia' | 'critica' = 
      i <= 7 ? 'critica' : i <= 20 ? 'advertencia' : 'info';
      
    const tipo = tipos[i % tipos.length];
    const listaDesc = descripciones[tipo];
    const desc = listaDesc[i % listaDesc.length];
    const diasAtras = Math.floor((50 - i) / 1.7);
    const resuelta = i > 4; // Las últimas 4 alarmas creadas (i=1, 2, 3, 4) se dejan activas/sin resolver!

    alarmas.push({
      id: `ALM-${3000 + i}`,
      lineaId: i % 2 === 0 ? 'L1' : 'L2',
      tipo,
      nivel,
      descripcion: desc,
      timestamp: haceDias(diasAtras, Math.floor(Math.random() * 12) + 8),
      resuelta,
      tiempoResolucionMin: resuelta ? Math.floor(Math.random() * 45) + 10 : undefined
    });
  }
  return alarmas;
};

/**
 * Motor de Simulación en Tiempo Real
 */
class DB_SIMULADOR {
  private lineas: Linea[] = [];
  private turnos: Turno[] = [];
  private ordenes: OrdenProduccion[] = [];
  private pedidos: Pedido[] = [];
  private alarmas: Alarma[] = [];
  private resumen: ResumenKPIs | null = null;
  private currentRole: UserRole = 'gerente';
  private listeners: Set<() => void> = new Set();
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.cargarDeStorage();
    this.iniciarSimulaciónSensores();
  }

  private cargarDeStorage() {
    try {
      const storedL = localStorage.getItem('scada_lineas');
      const storedT = localStorage.getItem('scada_turnos');
      const storedO = localStorage.getItem('scada_ordenes');
      const storedP = localStorage.getItem('scada_pedidos');
      const storedA = localStorage.getItem('scada_alarmas');
      const storedR = localStorage.getItem('scada_resumen');
      const storedRole = localStorage.getItem('scada_role');

      if (storedL && storedT && storedO && storedP && storedA && storedR) {
        this.lineas = JSON.parse(storedL);
        // Convertir strings de fecha a Date
        this.turnos = JSON.parse(storedT).map((t: any) => ({ ...t, fecha: new Date(t.fecha), updatedAt: new Date(t.updatedAt) }));
        this.ordenes = JSON.parse(storedO).map((o: any) => ({ ...o, fechaInicio: new Date(o.fechaInicio), fechaFin: o.fechaFin ? new Date(o.fechaFin) : undefined }));
        this.pedidos = JSON.parse(storedP).map((p: any) => ({ ...p, fechaPedido: new Date(p.fechaPedido), fechaCompromiso: new Date(p.fechaCompromiso), fechaEntregaReal: p.fechaEntregaReal ? new Date(p.fechaEntregaReal) : undefined }));
        this.alarmas = JSON.parse(storedA).map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) }));
        this.resumen = JSON.parse(storedR);
        this.currentRole = (storedRole as UserRole) || 'gerente';
      } else {
        this.reiniciarDatosSemilla();
      }
    } catch (e) {
      this.reiniciarDatosSemilla();
    }
  }

  public reiniciarDatosSemilla() {
    this.lineas = GENERAR_LINEAS();
    this.turnos = GENERAR_TURNOS();
    this.ordenes = GENERAR_ORDENES();
    this.pedidos = GENERAR_PEDIDOS();
    this.alarmas = GENERAR_ALARMAS();
    this.currentRole = 'gerente';
    this.recalcularResumen();
    this.guardarEnStorage();
    this.notificar();
  }

  private guardarEnStorage() {
    localStorage.setItem('scada_lineas', JSON.stringify(this.lineas));
    localStorage.setItem('scada_turnos', JSON.stringify(this.turnos));
    localStorage.setItem('scada_ordenes', JSON.stringify(this.ordenes));
    localStorage.setItem('scada_pedidos', JSON.stringify(this.pedidos));
    localStorage.setItem('scada_alarmas', JSON.stringify(this.alarmas));
    localStorage.setItem('scada_resumen', JSON.stringify(this.resumen));
    localStorage.setItem('scada_role', this.currentRole);
  }

  private recalcularResumen() {
    // OTIF mensual: completados entregados a tiempo / total pedidos completados mes * 100
    const pedidosCerrados = this.pedidos.filter(p => p.fechaEntregaReal !== undefined);
    const otifExitosis = pedidosCerrados.filter(p => p.otif === true);
    const otifMensual = pedidosCerrados.length > 0 
      ? Number(((otifExitosis.length / pedidosCerrados.length) * 100).toFixed(2))
      : 87.5;

    // Tasa alarmas críticas
    const totalAlarmas = this.alarmas.length;
    const criticas = this.alarmas.filter(a => a.nivel === 'critica').length;
    const alarmasCriticasPct = totalAlarmas > 0 
      ? Number(((criticas / totalAlarmas) * 100).toFixed(2))
      : 14.0;

    // Backlog unidades: cantidad planificada - cantidad producida en pendientes/en_curso
    const backlogUnidades = this.ordenes
      .filter(o => ['pendiente', 'en_curso'].includes(o.estadoOrden))
      .reduce((sum, o) => sum + (o.cantidadPlanificada - o.cantidadProducida), 0);

    // OEE Actuales
    // Buscamos el turno activo más reciente para L1 y L2
    const turnoL1 = this.turnos.find(t => t.lineaId === 'L1' && t.estado === 'activo') || this.turnos.find(t => t.lineaId === 'L1');
    const turnoL2 = this.turnos.find(t => t.lineaId === 'L2' && t.estado === 'activo') || this.turnos.find(t => t.lineaId === 'L2');

    // MTTR / MTBF usando alarmas resueltas
    // MTBF (horas) = Tiempo operacion total / total paros o alarmas resueltas
    // MTTR (minutos) = Suma de tiempos de resolucion / total fallos
    const alarmasResueltasL1 = this.alarmas.filter(a => a.lineaId === 'L1' && a.resuelta && ['temperatura', 'presion', 'mecanico', 'electrico'].includes(a.tipo));
    const alarmasResueltasL2 = this.alarmas.filter(a => a.lineaId === 'L2' && a.resuelta && ['temperatura', 'presion', 'mecanico', 'electrico'].includes(a.tipo));

    const totalResolucionMinsL1 = alarmasResueltasL1.reduce((sum, a) => sum + (a.tiempoResolucionMin || 20), 0);
    const totalResolucionMinsL2 = alarmasResueltasL2.reduce((sum, a) => sum + (a.tiempoResolucionMin || 20), 0);

    const mttrL1Min = alarmasResueltasL1.length > 0 ? Number((totalResolucionMinsL1 / alarmasResueltasL1.length).toFixed(1)) : 18.5;
    const mttrL2Min = alarmasResueltasL2.length > 0 ? Number((totalResolucionMinsL2 / alarmasResueltasL2.length).toFixed(1)) : 22.0;

    const mtbfL1Horas = 124.5; // sintético base estable
    const mtbfL2Horas = 98.0;

    this.resumen = {
      otifMensual,
      otifObjetivo: 95,
      alarmasCriticasPct,
      backlogUnidades,
      oeeL1Actual: turnoL1 ? turnoL1.oee : 76.5,
      oeeL2Actual: turnoL2 ? turnoL2.oee : 81.2,
      mtbfL1Horas,
      mtbfL2Horas,
      mttrL1Min,
      mttrL2Min,
      updatedAt: new Date()
    };
  }

  // Simulación del sensor SCADA enviando pulsos cada 4 segundos
  private iniciarSimulaciónSensores() {
    this.intervalId = setInterval(() => {
      let cambio = false;

      // 1. Simular producción incremental en turnos activos
      this.turnos = this.turnos.map(t => {
        if (t.estado === 'activo') {
          cambio = true;
          // Generar entre 1 y 4 unidades producidas nuevas
          const nuevasUnidades = Math.floor(Math.random() * 4) + 1;
          const defectuosas_chance = Math.random();
          // 4% de probabilidad de que una unidad sea defectuosa
          const defectuosa = defectuosas_chance < 0.04 ? 1 : 0;
          
          const unidadesProducidas = t.unidadesProducidas + nuevasUnidades;
          const unidadesDefectuosas = t.unidadesDefectuosas + defectuosa;

          // Simular fatiga leve de velocidad real
          const linea = this.lineas.find(l => l.id === t.lineaId);
          const velNom = linea ? linea.velocidadNominal : 100;
          const velocidadReal = Number((velNom * (0.75 + Math.random() * 0.18)).toFixed(1));

          // Incrementar levemente el tiempo planificado e inductivo de paros no programados por fricciones (0.1% chance)
          // Simulamos que avanza el tiempo en minutos (un pulso SCADA = 2 minutos de tiempo real simulado)
          const tiempoPlanificadoMin = t.tiempoPlanificadoMin + 2;
          
          let tiempoParoNoProgramadoMin = t.tiempoParoNoProgramadoMin;
          if (Math.random() < 0.05) {
            tiempoParoNoProgramadoMin += Math.floor(Math.random() * 5) + 1; // paros micro-detenciones
          }

          const oeeCalculado = calcularOEE({
            tiempoPlanificadoMin,
            tiempoParoProgramadoMin: t.tiempoParoProgramadoMin,
            tiempoParoNoProgramadoMin,
            unidadesProducidas,
            unidadesDefectuosas,
            velocidadNominal: velNom
          });

          // Sincronizar también con la orden "en curso" que produce esta línea
          this.ordenes = this.ordenes.map(ord => {
            if (ord.lineaId === t.lineaId && ord.estadoOrden === 'en_curso') {
              return {
                ...ord,
                cantidadProducida: ord.cantidadProducida + nuevasUnidades
              };
            }
            return ord;
          });

          return {
            ...t,
            tiempoPlanificadoMin,
            tiempoParoNoProgramadoMin,
            unidadesProducidas,
            unidadesDefectuosas,
            velocidadReal,
            ...oeeCalculado,
            updatedAt: new Date()
          };
        }
        return t;
      });

      // 2. Chance aleatoria de disparar una alarma (1.5% cada pulso)
      if (Math.random() < 0.02) {
        cambio = true;
        const lineasOpt: ('L1' | 'L2')[] = ['L1', 'L2'];
        const linId = lineasOpt[Math.floor(Math.random() * 2)];
        const tipos: ('temperatura' | 'presion' | 'velocidad' | 'calidad' | 'mecanico' | 'electrico')[] = [
          'temperatura', 'presion', 'velocidad', 'calidad'
        ];
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const niveles: ('info' | 'advertencia' | 'critica')[] = ['info', 'advertencia', 'critica'];
        // Tasa ponderada: 60% info (>=0.4), 25% advertencia (0.15-0.4), 15% crítica (<0.15)
        const randNivel = Math.random();
        const nivel = randNivel < 0.15 ? 'critica' : randNivel < 0.40 ? 'advertencia' : 'info';

        const descripcionesSim: Record<string, string> = {
          temperatura: `Sensor SCADA de ${linId} reporta fluctuación de calor`,
          presion: `Presión fluctuante en boquilla Lote ${linId}`,
          velocidad: `Velocidad real de faja transportadora en ${linId} varía drásticamente`,
          calidad: `Descuadre leve detectado por control óptico en ${linId}`
        };

        const nuevaAlarma: Alarma = {
          id: `ALM-${3000 + this.alarmas.length + 1}`,
          lineaId: linId,
          tipo,
          nivel,
          descripcion: descripcionesSim[tipo],
          timestamp: new Date(),
          resuelta: false
        };

        this.alarmas = [nuevaAlarma, ...this.alarmas]; // Añadir al inicio
      }

      if (cambio) {
        this.recalcularResumen();
        this.guardarEnStorage();
        this.notificar();
      }
    }, 4000);
  }

  // API del simulador expuesto para ser idéntico al comportamiento Firebase list/write
  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notificar() {
    this.listeners.forEach(cb => cb());
  }

  public getRole(): UserRole {
    return this.currentRole;
  }

  public setRole(role: UserRole) {
    this.currentRole = role;
    this.guardarEnStorage();
    this.notificar();
  }

  public getLineas(): Linea[] {
    return this.lineas;
  }

  public getTurnos(lineaId: 'L1' | 'L2'): Turno[] {
    return this.turnos.filter(t => t.lineaId === lineaId);
  }

  public getOrdenes(): OrdenProduccion[] {
    return this.ordenes;
  }

  public getPedidos(): Pedido[] {
    return this.pedidos;
  }

  public getAlarmas(): Alarma[] {
    return this.alarmas;
  }

  public getResumen(): ResumenKPIs | null {
    return this.resumen;
  }

  // Acciones de actualización (operador / supervisor / gerente)
  public resolverAlarma(alarmaId: string, tiempoResolucionMin = 15) {
    this.alarmas = this.alarmas.map(a => {
      if (a.id === alarmaId) {
        return { ...a, resuelta: true, tiempoResolucionMin };
      }
      return a;
    });
    this.recalcularResumen();
    this.guardarEnStorage();
    this.notificar();
  }

  public crearAlarma(alarma: Omit<Alarma, 'id' | 'timestamp' | 'resuelta'>) {
    const nueva: Alarma = {
      ...alarma,
      id: `ALM-${3000 + this.alarmas.length + 1}`,
      timestamp: new Date(),
      resuelta: false
    };
    this.alarmas = [nueva, ...this.alarmas];
    this.recalcularResumen();
    this.guardarEnStorage();
    this.notificar();
  }

  public completarOrden(ordenId: string) {
    this.ordenes = this.ordenes.map(ord => {
      if (ord.id === ordenId) {
        // Al completarse, calculamos tiempoHoras y cambiamos el estado
        return {
          ...ord,
          estadoOrden: 'completada',
          fechaFin: new Date(),
          tiempoHoras: 8 // estándar histórico
        };
      }
      return ord;
    });
    this.recalcularResumen();
    this.guardarEnStorage();
    this.notificar();
  }

  public despacharPedido(pedidoId: string, cantEntregada: number) {
    this.pedidos = this.pedidos.map(ped => {
      if (ped.id === pedidoId) {
        const fechaEntregaReal = new Date();
        const { onTime, inFull, otif } = evaluarOTIF({
          fechaCompromiso: ped.fechaCompromiso,
          fechaEntregaReal,
          cantidadSolicitada: ped.cantidadSolicitada,
          cantidadEntregada: cantEntregada
        });

        return {
          ...ped,
          cantidadEntregada: cantEntregada,
          fechaEntregaReal,
          estadoPedido: 'completada',
          onTime,
          inFull,
          otif
        };
      }
      return ped;
    });
    this.recalcularResumen();
    this.guardarEnStorage();
    this.notificar();
  }

  public importarCSVParaSimulador(coleccion: string, registros: any[]) {
    // API de imports masivos
    if (coleccion === 'pedidos') {
      const mapeados = registros.map((r, index) => {
        const pedDate = r.fechaPedido ? new Date(r.fechaPedido) : new Date();
        const compDate = r.fechaCompromiso ? new Date(r.fechaCompromiso) : haceDias(-5);
        const realDate = r.fechaEntregaReal ? new Date(r.fechaEntregaReal) : undefined;
        let isOtif = undefined;
        let isOnTime = undefined;
        let isInFull = undefined;

        if (realDate) {
          const evalRes = evaluarOTIF({
            fechaCompromiso: compDate,
            fechaEntregaReal: realDate,
            cantidadSolicitada: r.cantidadSolicitada || 1000,
            cantidadEntregada: r.cantidadEntregada || 1000
          });
          isOtif = evalRes.otif;
          isOnTime = evalRes.onTime;
          isInFull = evalRes.inFull;
        }

        return {
          id: r.id || `PED-IMP-${5000 + this.pedidos.length + index}`,
          clienteNombre: r.clienteNombre || 'Cliente Importado',
          productoId: r.productoId || 'P1',
          cantidadSolicitada: Number(r.cantidadSolicitada || 1000),
          cantidadEntregada: Number(r.cantidadEntregada || 0),
          fechaPedido: pedDate,
          fechaCompromiso: compDate,
          fechaEntregaReal: realDate,
          estadoPedido: r.estadoPedido || 'pendiente',
          onTime: isOnTime,
          inFull: isInFull,
          otif: isOtif
        };
      });
      this.pedidos = [...mapeados, ...this.pedidos];
    } else if (coleccion === 'alarmas') {
      const mapeados = registros.map((r, index) => ({
        id: r.id || `ALM-IMP-${3000 + this.alarmas.length + index}`,
        lineaId: r.lineaId || 'L1',
        tipo: r.tipo || 'temperatura',
        nivel: r.nivel || 'info',
        descripcion: r.descripcion || 'Alarma Importada',
        timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
        resuelta: r.resuelta === 'true' || r.resuelta === true,
        tiempoResolucionMin: r.tiempoResolucionMin ? Number(r.tiempoResolucionMin) : undefined
      }));
      this.alarmas = [...mapeados, ...this.alarmas];
    } else if (coleccion === 'ordenes') {
      const mapeados = registros.map((r, index) => ({
        id: r.id || `ORD-IMP-${1000 + this.ordenes.length + index}`,
        lineaId: r.lineaId || 'L1',
        productoId: r.productoId || 'P1',
        nombreProducto: r.nombreProducto || 'Salsa de tomate 500 g',
        cantidadPlanificada: Number(r.cantidadPlanificada || 1000),
        cantidadProducida: Number(r.cantidadProducida || 0),
        fechaInicio: r.fechaInicio ? new Date(r.fechaInicio) : new Date(),
        fechaFin: r.fechaFin ? new Date(r.fechaFin) : undefined,
        estadoOrden: r.estadoOrden || 'pendiente',
        tiempoHoras: r.tiempoHoras ? Number(r.tiempoHoras) : undefined
      }));
      this.ordenes = [...mapeados, ...this.ordenes];
    }

    this.recalcularResumen();
    this.guardarEnStorage();
    this.notificar();
    return registros.length;
  }
}

export const dbSimulada = new DB_SIMULADOR();
