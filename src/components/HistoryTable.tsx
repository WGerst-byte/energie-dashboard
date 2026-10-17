import React, { useState, useRef } from 'react';
import { MeterReading, TariffConfig, ConsumptionPeriod } from '../types';
import { 
  formatDate, 
  formatNumber, 
  formatCurrency,
  calculateConsumptionPeriods 
} from '../utils/calculations';
import { 
  exportToCsv, 
  importFromCsv 
} from '../utils/storage';
import { 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Search, 
  FileSpreadsheet, 
  RotateCcw, 
  Plus, 
  Calendar,
  Zap,
  Sun,
  BatteryCharging,
  Flame,
  Droplet,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface HistoryTableProps {
  readings: MeterReading[];
  periods: ConsumptionPeriod[];
  tariff: TariffConfig;
  onEditReading: (reading: MeterReading) => void;
  onDeleteReading: (id: string) => void;
  onImportReadings: (readings: MeterReading[]) => void;
  onResetToDemo: () => void;
  onOpenNew: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  readings,
  periods,
  tariff,
  onEditReading,
  onDeleteReading,
  onImportReadings,
  onResetToDemo,
  onOpenNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chronologisch sortierte Ablesungen absteigend (neueste zuerst)
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredReadings = sortedReadings.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.date.includes(term) ||
      (r.note && r.note.toLowerCase().includes(term))
    );
  });

  const handleExportCsv = () => {
    try {
      const csvContent = exportToCsv(readings);
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ecohome_energie_ablesungen_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showStatus('success', 'CSV-Datei erfolgreich exportiert!');
    } catch (err: any) {
      showStatus('error', 'Fehler beim Exportieren: ' + err.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importFromCsv(text);
        onImportReadings(imported);
        showStatus('success', `${imported.length} Zählerstände erfolgreich aus CSV importiert!`);
      } catch (err: any) {
        showStatus('error', 'Fehler beim CSV-Import: ' + err.message);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Hilfsfunktion: Periode finden, die mit diesem Eintrag endet
  const findPeriodForReading = (reading: MeterReading) => {
    return periods.find((p) => p.endDate === reading.date);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            Historische Zählerstände & Export
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Insgesamt {readings.length} erfasste Zählerablesungen. Bearbeiten, Löschen oder CSV-Datenaustausch.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>CSV Export</span>
          </button>

          {/* CSV Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4 text-blue-500" />
            <span>CSV Import</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv"
            className="hidden"
          />

          {/* Beispieldaten zurücksetzen */}
          <button
            onClick={onResetToDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Standard-Beispieldaten wiederherstellen"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Demo-Daten</span>
          </button>

          {/* Neu erfassen */}
          <button
            onClick={onOpenNew}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Neuer Stand</span>
          </button>
        </div>
      </div>

      {/* Status Alert Toast */}
      {statusMsg && (
        <div className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border ${
          statusMsg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Nach Datum oder Notiz suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Datum & Notiz</th>
                <th className="py-3 px-4">Netzbezug (kWh)</th>
                <th className="py-3 px-4">PV-Erzeugung (kWh)</th>
                <th className="py-3 px-4">Batteriespeicher</th>
                <th className="py-3 px-4">Wärmepumpe & JAZ</th>
                <th className="py-3 px-4">Wasser (m³)</th>
                <th className="py-3 px-4">Autarkie</th>
                <th className="py-3 px-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Keine Zählerstände gefunden.
                  </td>
                </tr>
              ) : (
                filteredReadings.map((reading) => {
                  const period = findPeriodForReading(reading);
                  return (
                    <tr
                      key={reading.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Datum & Notiz */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          {formatDate(reading.date)}
                        </div>
                        {reading.note && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs truncate">
                            {reading.note}
                          </p>
                        )}
                      </td>

                      {/* Stromnetz */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {formatNumber(reading.gridImport, 1)} kWh
                        </div>
                        {period && (
                          <div className="text-[11px] text-blue-600 dark:text-blue-400">
                            +{formatNumber(period.gridImportKwh, 1)} kWh Bezug
                          </div>
                        )}
                      </td>

                      {/* PV */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {formatNumber(reading.pvGeneration, 1)} kWh
                        </div>
                        {period && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400">
                            +{formatNumber(period.pvGenerationKwh, 1)} kWh Ertrag
                          </div>
                        )}
                      </td>

                      {/* Speicher */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400">
                          <BatteryCharging className="w-3.5 h-3.5" />
                          <span>{reading.batterySoc}% SoC</span>
                        </div>
                        {period && (
                          <div className="text-[11px] text-slate-400">
                            Eff: {period.batteryEfficiencyPct}% ({formatNumber(period.batteryDischargeKwh, 0)} kWh)
                          </div>
                        )}
                      </td>

                      {/* Wärmepumpe */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {formatNumber(reading.heatPumpElectricity, 0)} kWh Strom
                        </div>
                        {period && (
                          <div className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                            JAZ: {period.heatPumpJaz} (+{formatNumber(period.heatPumpHeatKwh, 0)} kWh Wärme)
                          </div>
                        )}
                      </td>

                      {/* Wasser */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {formatNumber(reading.waterReading, 3)} m³
                        </div>
                        {period && (
                          <div className="text-[11px] text-cyan-600 dark:text-cyan-400">
                            +{formatNumber(period.waterM3, 1)} m³
                          </div>
                        )}
                      </td>

                      {/* Autarkie */}
                      <td className="py-3.5 px-4">
                        {period ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            period.autarkyPct >= 70
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : period.autarkyPct >= 40
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {formatNumber(period.autarkyPct, 1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Startstand</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditReading(reading)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Ablesung vom ${formatDate(reading.date)} wirklich löschen?`)) {
                                onDeleteReading(reading.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
