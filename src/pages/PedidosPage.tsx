/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useOTIF } from '../hooks/useOTIF';
import { useAuth } from '../auth/useAuth';
import { dbSimulada } from '../utils/simulatedDb';
import { FileSpreadsheet, Upload, CheckCircle, HelpCircle, Truck, AlertCircle } from 'lucide-react';
import TablaPedidos from '../components/tables/TablaPedidos';

export default function PedidosPage() {
  const { role } = useAuth();
  const { otifMensual, pedidosEnRiesgo, loading } = useOTIF();
  const [csvContent, setCsvContent] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Todo el listado de pedidos de la DB simulada, no solo los en riesgo
  const todosLosPedidos = dbSimulada.getPedidos();

  // Función para procesar CSV pegado manualmente
  const procesarCSVImport = () => {
    if (role !== 'gerente') {
      alert('🔒 Privilegios Insuficientes: Sólo los Gerentes pueden realizar importaciones masivas.');
      return;
    }

    if (!csvContent.trim()) {
      alert('Por favor pegue algunas líneas con formato CSV válido.');
      return;
    }

    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('El archivo debe contener al menos la fila de cabecera y una fila de datos.');
      }

      // Ejemplo de cabecera esperada: clienteNombre,productoId,cantidadSolicitada,cantidadEntregada,estadoPedido
      const headers = lines[0].split(',').map(h => h.trim());
      const registros = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((h, index) => {
          row[h] = values[index];
        });

        // Validaciones básicas
        if (!row.clienteNombre || !row.cantidadSolicitada) {
          throw new Error(`Error en línea ${i + 1}: Faltan campos obligatorios.`);
        }

        row.cantidadSolicitada = Number(row.cantidadSolicitada);
        row.cantidadEntregada = Number(row.cantidadEntregada || 0);

        // Añadir fechas sintéticas si no vienen
        const diasAtras = Math.floor(Math.random() * 5) + 2;
        const fechaCompromiso = new Date();
        fechaCompromiso.setDate(fechaCompromiso.getDate() + diasAtras);
        
        row.fechaPedido = new Date().toISOString();
        row.fechaCompromiso = fechaCompromiso.toISOString();
        if (row.estadoPedido === 'completada' && !row.fechaEntregaReal) {
          row.fechaEntregaReal = new Date().toISOString();
        }

        registros.push(row);
      }

      // Importar en bloque en el simulador
      const importadosCount = dbSimulada.importarCSVParaSimulador('pedidos', registros);
      
      setImportStatus(`✓ Exito: Se importaron ${importadosCount} pedidos en batch exitosamente.`);
      setCsvContent('');
      setTimeout(() => setImportStatus(null), 8000);
    } catch (e: any) {
      alert(`Fallo en parsing: ${e.message}`);
    }
  };

  const cargarEjemplo = () => {
    const ejemplo = `clienteNombre,productoId,cantidadSolicitada,cantidadEntregada,estadoPedido
Supermercados Carulla,P1,1500,1500,completada
Distribuciones Exito,P2,900,900,completada
Tiendas Ara,P1,3000,0,pendiente
D1 Tiendas,P2,1100,1080,completada`;
    setCsvContent(ejemplo);
  };

  return (
    <div className="flex-1 bg-[#0F1117] p-6 space-y-6 overflow-y-auto font-sans">
      {/* CABECERA */}
      <div className="flex items-center justify-between border-b border-[#2A2D3A] pb-4">
        <div>
          <span className="text-[10px] text-blue-400 font-mono font-bold block uppercase tracking-widest">
            LOGÍSTICA MES / ERP DE CLIENTES
          </span>
          <h1 className="text-xl font-extrabold text-white">
            Pedidos, Despachos e Indicador OTIF
          </h1>
        </div>
        <div className="text-right font-mono text-xs">
          <span>OTIF Actual: <strong className="text-[#A78BFA] text-base">{otifMensual.toFixed(1)}%</strong></span>
        </div>
      </div>

      {role === 'gerente' && (
        /* PANEL DE CARGA INDUSTRIAL */
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" />
              Importador Masivo de Pedidos (API HTTP CSV Proxy)
            </h3>
            <button
              onClick={cargarEjemplo}
              className="text-[10.5px] font-mono text-blue-400 hover:underline cursor-pointer"
            >
              Cargar Ejemplo de Plantilla CSV
            </button>
          </div>

          <p className="text-[11px] font-mono text-gray-400 leading-relaxed mb-4">
            Copie y pegue registros separados por comas para simular un volcado masivo desde el software ERP central de Alimentos del valle S.A.S. El sistema validará claims de seguridad y recalculará tasas OTIF en batch.
          </p>

          <textarea
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            rows={4}
            placeholder="Pegue aquí el contenido CSV o cargue la plantilla..."
            className="w-full bg-[#11131E] border border-[#2A2D3A] rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500 mb-3"
          />

          <div className="flex justify-between items-center">
            <span className="text-[10.5px] font-mono text-gray-500">
              Campos requeridos: <code className="text-slate-300">clienteNombre,productoId,cantidadSolicitada,cantidadEntregada,estadoPedido</code>
            </span>
            <button
              onClick={procesarCSVImport}
              className="bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold py-1.5 px-5 rounded-md text-xs cursor-pointer transition-colors shadow-lg"
            >
              Ejecutar Carga Masiva (Batch)
            </button>
          </div>

          {importStatus && (
            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-md text-xs text-emerald-400 font-mono">
              {importStatus}
            </div>
          )}
        </div>
      )}

      {/* DETALLES DE TABLA GENERAL DE DESPACHO */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
          Bitácora Integral de Pedidos Activos e Históricos ({todosLosPedidos.length})
        </h3>
        <TablaPedidos pedidos={todosLosPedidos} />
      </div>
    </div>
  );
}
