import React, { useState, useEffect } from 'react';
import { MeterReading, TariffConfig } from '../types';
import { formatNumber } from '../utils/calculations';
import { 
  Zap, 
  Sun, 
  BatteryCharging, 
  Flame, 
  Droplet, 
  Calendar, 
  Save, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Info
} from 'lucide-react';

interface ReadingFormProps {
  initialData?: MeterReading | null;
  lastReading?: MeterReading | null;
  tariff: TariffConfig;
  onSave: (reading: MeterReading) => void;
  onCancel?: () => void;
}

export const ReadingForm: React.FC<ReadingFormProps> = ({
  initialData,
  lastReading,
  tariff,
  onSave,
  onCancel,
}) => {
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState(initialData?.note || '');

  // 1. Stromzähler
  const [gridImport, setGridImport] = useState<string>(
    initialData ? String(initialData.gridImport) : (lastReading ? String(lastReading.gridImport) : '0')
  );
  const [gridExport, setGridExport] = useState<string>(
    initialData ? String(initialData.gridExport) : (lastReading ? String(lastReading.gridExport) : '0')
  );

  // 2. Photovoltaik
  const [pvGeneration, setPvGeneration] = useState<string>(
    initialData ? String(initialData.pvGeneration) : (lastReading ? String(lastReading.pvGeneration) : '0')
  );
  const [pvSelfConsumption, setPvSelfConsumption] = useState<string>(
    initialData ? String(initialData.pvSelfConsumption) : (lastReading ? String(lastReading.pvSelfConsumption) : '0')
  );
  const [pvExport, setPvExport] = useState<string>(
    initialData ? String(initialData.pvExport) : (lastReading ? String(lastReading.pvExport) : '0')
  );

  // 3. PV-Stromspeicher
  const [batteryCharge, setBatteryCharge] = useState<string>(
    initialData ? String(initialData.batteryCharge) : (lastReading ? String(lastReading.batteryCharge) : '0')
  );
  const [batteryDischarge, setBatteryDischarge] = useState<string>(
    initialData ? String(initialData.batteryDischarge) : (lastReading ? String(lastReading.batteryDischarge) : '0')
  );
  const [batterySoc, setBatterySoc] = useState<string>(
    initialData ? String(initialData.batterySoc) : (lastReading ? String(lastReading.batterySoc) : '50')
  );
  const [batteryCapacity, setBatteryCapacity] = useState<string>(
    initialData ? String(initialData.batteryCapacity) : (lastReading ? String(lastReading.batteryCapacity) : '10.0')
  );

  // 4. Wärmepumpe
  const [heatPumpElectricity, setHeatPumpElectricity] = useState<string>(
    initialData ? String(initialData.heatPumpElectricity) : (lastReading ? String(lastReading.heatPumpElectricity) : '0')
  );
  const [heatPumpThermal, setHeatPumpThermal] = useState<string>(
    initialData ? String(initialData.heatPumpThermal) : (lastReading ? String(lastReading.heatPumpThermal) : '0')
  );

  // 5. Wasser
  const [waterReading, setWaterReading] = useState<string>(
    initialData ? String(initialData.waterReading) : (lastReading ? String(lastReading.waterReading) : '0')
  );

  // Live Deltas gegenüber vorheriger Ablesung berechnen
  const numGridImport = parseFloat(gridImport) || 0;
  const numGridExport = parseFloat(gridExport) || 0;
  const numPvGen = parseFloat(pvGeneration) || 0;
  const numPvSelf = parseFloat(pvSelfConsumption) || 0;
  const numPvExport = parseFloat(pvExport) || 0;
  const numBatCharge = parseFloat(batteryCharge) || 0;
  const numBatDischarge = parseFloat(batteryDischarge) || 0;
  const numBatSoc = parseFloat(batterySoc) || 0;
  const numBatCap = parseFloat(batteryCapacity) || 10;
  const numHpElec = parseFloat(heatPumpElectricity) || 0;
  const numHpHeat = parseFloat(heatPumpThermal) || 0;
  const numWater = parseFloat(waterReading) || 0;

  const deltaGridImport = lastReading ? Math.max(0, numGridImport - lastReading.gridImport) : 0;
  const deltaPvGen = lastReading ? Math.max(0, numPvGen - lastReading.pvGeneration) : 0;
  const deltaBatCharge = lastReading ? Math.max(0, numBatCharge - lastReading.batteryCharge) : 0;
  const deltaBatDischarge = lastReading ? Math.max(0, numBatDischarge - lastReading.batteryDischarge) : 0;
  const deltaHpElec = lastReading ? Math.max(0, numHpElec - lastReading.heatPumpElectricity) : 0;
  const deltaHpHeat = lastReading ? Math.max(0, numHpHeat - lastReading.heatPumpThermal) : 0;
  const deltaWater = lastReading ? Math.max(0, numWater - lastReading.waterReading) : 0;

  // Berechnungen für die Vorschau
  const previewBatEff = deltaBatCharge > 0 ? Math.round((deltaBatDischarge / deltaBatCharge) * 1000) / 10 : 0;
  const previewJaz = deltaHpElec > 0 ? Math.round((deltaHpHeat / deltaHpElec) * 100) / 100 : 0;

  // Warnung bei kleinerem Zählerstand
  const warnings: string[] = [];
  if (lastReading && !initialData) {
    if (numGridImport < lastReading.gridImport) warnings.push('Netzbezug ist geringer als vorheriger Stand.');
    if (numPvGen < lastReading.pvGeneration) warnings.push('PV-Erzeugung ist geringer als vorheriger Stand.');
    if (numWater < lastReading.waterReading) warnings.push('Wasserzähler ist geringer als vorheriger Stand.');
    if (numHpElec < lastReading.heatPumpElectricity) warnings.push('Wärmepumpen-Strom ist geringer als vorheriger Stand.');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reading: MeterReading = {
      id: initialData?.id || `reading_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date,
      note,
      gridImport: numGridImport,
      gridExport: numGridExport,
      pvGeneration: numPvGen,
      pvSelfConsumption: numPvSelf,
      pvExport: numPvExport,
      batteryCharge: numBatCharge,
      batteryDischarge: numBatDischarge,
      batterySoc: numBatSoc,
      batteryCapacity: numBatCap,
      heatPumpElectricity: numHpElec,
      heatPumpThermal: numHpHeat,
      waterReading: numWater,
    };

    onSave(reading);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kopfbereich: Datum & Notiz */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            Ablesedatum *
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Notiz / Bemerkung (optional)
          </label>
          <input
            type="text"
            placeholder="z.B. Monatserfassung, Filterwechsel, Urlaub"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Warnhinweise */}
      {warnings.length > 0 && (
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Mögliche Ableseabweichung:</span>
          </div>
          {warnings.map((w, idx) => (
            <p key={idx} className="pl-5">• {w}</p>
          ))}
        </div>
      )}

      {/* 1. Hauptstromzähler */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              1. Stromzähler (Hausanschluss)
            </h4>
          </div>
          {lastReading && (
            <span className="text-[11px] text-blue-600 dark:text-blue-400">
              +{formatNumber(deltaGridImport, 1)} kWh Bezug seit {lastReading.date}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Zählerstand Bezug (1.8.0) in kWh *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={gridImport}
              onChange={(e) => setGridImport(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {lastReading && (
              <span className="text-[11px] text-slate-400">Vorher: {lastReading.gridImport} kWh</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Zählerstand Einspeisung (2.8.0) in kWh *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={gridExport}
              onChange={(e) => setGridExport(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {lastReading && (
              <span className="text-[11px] text-slate-400">Vorher: {lastReading.gridExport} kWh</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Photovoltaik (PV) */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              2. Photovoltaikanlage (PV-Wechselrichter)
            </h4>
          </div>
          {lastReading && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400">
              +{formatNumber(deltaPvGen, 1)} kWh Solarertrag
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Gesamterzeugung in kWh *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={pvGeneration}
              onChange={(e) => setPvGeneration(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            {lastReading && (
              <span className="text-[11px] text-slate-400">Vorher: {lastReading.pvGeneration} kWh</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Direkter Eigenverbrauch (kWh)
            </label>
            <input
              type="number"
              step="0.1"
              value={pvSelfConsumption}
              onChange={(e) => setPvSelfConsumption(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            {lastReading && (
              <span className="text-[11px] text-slate-400">Vorher: {lastReading.pvSelfConsumption} kWh</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              PV-Einspeisung kumuliert (kWh)
            </label>
            <input
              type="number"
              step="0.1"
              value={pvExport}
              onChange={(e) => setPvExport(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            {lastReading && (
              <span className="text-[11px] text-slate-400">Vorher: {lastReading.pvExport} kWh</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. PV-Stromspeicher (NEU) */}
      <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-indigo-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              3. PV-Batteriespeicher (NEU)
            </h4>
          </div>
          {deltaBatCharge > 0 && (
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
              Wirkungsgrad: {previewBatEff}% (Ladung: +{deltaBatCharge} kWh, Entladung: +{deltaBatDischarge} kWh)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Speicherladung (Import) kWh
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={batteryCharge}
              onChange={(e) => setBatteryCharge(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {lastReading && (
              <span className="text-[11px] text-slate-400">Vorher: {lastReading.batteryCharge} kWh</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Speicherentladung (Export) kWh
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={batteryDischarge}
              onChange={(e) => setBatteryDischarge(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {lastReading && (
              <span className="text-[11px] text-slate-400">Vorher: {lastReading.batteryDischarge} kWh</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Aktueller SoC (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={batterySoc}
              onChange={(e) => setBatterySoc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400">Ladezustand bei Ablesung</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Nennkapazität (kWh)
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={batteryCapacity}
              onChange={(e) => setBatteryCapacity(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400">z.B. 10.0 kWh</span>
          </div>
        </div>
      </div>

      {/* 4. Wärmepumpe */}
      <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              4. Wärmepumpe (Heizung & Warmwasser)
            </h4>
          </div>
          {deltaHpElec > 0 && (
            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
              Intervall-JAZ: {previewJaz} (+{deltaHpHeat} kWh Wärme / +{deltaHpElec} kWh Strom)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Stromverbrauch Wärmepumpe (kWh) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={heatPumpElectricity}
              onChange={(e) => setHeatPumpElectricity(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {lastReading && (
              <span className="text-[11px] text-slate-400">Vorher: {lastReading.heatPumpElectricity} kWh</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Erzeugte Wärmeenergie / thermisch (kWh) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={heatPumpThermal}
              onChange={(e) => setHeatPumpThermal(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {lastReading && (
              <span className="text-[11px] text-slate-400">Vorher: {lastReading.heatPumpThermal} kWh (für JAZ)</span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Kaltwasserzähler */}
      <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-cyan-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              5. Kaltwasserzähler (Trinkwasser)
            </h4>
          </div>
          {lastReading && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400">
              +{formatNumber(deltaWater, 2)} m³ Verbrauch
            </span>
          )}
        </div>

        <div className="w-full sm:w-1/2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Zählerstand Wasser (m³) *
          </label>
          <input
            type="number"
            step="0.001"
            required
            value={waterReading}
            onChange={(e) => setWaterReading(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          {lastReading && (
            <span className="text-[11px] text-slate-400">Vorher: {lastReading.waterReading} m³</span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Abbrechen
          </button>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
        >
          <Save className="w-4 h-4" />
          <span>{initialData ? 'Änderungen speichern' : 'Zählerstand erfassen'}</span>
        </button>
      </div>
    </form>
  );
};
