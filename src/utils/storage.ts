import { MeterReading, TariffConfig } from '../types';
import { INITIAL_READINGS } from '../data/mockData';
import { DEFAULT_TARIFF } from './calculations';

const READINGS_KEY = 'ecohome_meter_readings_v1';
const TARIFF_KEY = 'ecohome_tariff_config_v1';

export function loadReadings(): MeterReading[] {
  try {
    const raw = localStorage.getItem(READINGS_KEY);
    if (!raw) {
      saveReadings(INITIAL_READINGS);
      return INITIAL_READINGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Fehler beim Laden der Zählerstände:', err);
  }
  return INITIAL_READINGS;
}

export function saveReadings(readings: MeterReading[]): void {
  try {
    localStorage.setItem(READINGS_KEY, JSON.stringify(readings));
  } catch (err) {
    console.error('Fehler beim Speichern der Zählerstände:', err);
  }
}

export function loadTariff(): TariffConfig {
  try {
    const raw = localStorage.getItem(TARIFF_KEY);
    if (!raw) {
      saveTariff(DEFAULT_TARIFF);
      return DEFAULT_TARIFF;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_TARIFF, ...parsed };
  } catch (err) {
    console.error('Fehler beim Laden des Tarifs:', err);
  }
  return DEFAULT_TARIFF;
}

export function saveTariff(tariff: TariffConfig): void {
  try {
    localStorage.setItem(TARIFF_KEY, JSON.stringify(tariff));
  } catch (err) {
    console.error('Fehler beim Speichern des Tarifs:', err);
  }
}

/**
 * Erzeugt CSV-Format mit deutschen Spaltenbezeichnungen und Semikolon als Trenner
 */
export function exportToCsv(readings: MeterReading[]): string {
  const headers = [
    'Datum',
    'Notiz',
    'Netzbezug_kWh',
    'Netzeinspeisung_kWh',
    'PV_Erzeugung_kWh',
    'PV_Direktverbrauch_kWh',
    'PV_Einspeisung_kWh',
    'Speicher_Ladung_kWh',
    'Speicher_Entladung_kWh',
    'Speicher_SoC_Prozent',
    'Speicher_Kapazitaet_kWh',
    'Waermepumpe_Strom_kWh',
    'Waermepumpe_Waerme_kWh',
    'Wasserzaehler_m3',
  ];

  const sorted = [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const rows = sorted.map((r) => [
    r.date,
    `"${(r.note || '').replace(/"/g, '""')}"`,
    r.gridImport,
    r.gridExport,
    r.pvGeneration,
    r.pvSelfConsumption,
    r.pvExport,
    r.batteryCharge,
    r.batteryDischarge,
    r.batterySoc,
    r.batteryCapacity,
    r.heatPumpElectricity,
    r.heatPumpThermal,
    r.waterReading,
  ]);

  return [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');
}

/**
 * Parst CSV (unterstützt sowohl Semikolon als auch Komma als Trennzeichen)
 */
export function importFromCsv(csvText: string): MeterReading[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) {
    throw new Error('CSV-Datei enthält keine Datenzeilen.');
  }

  // Erkennen des Trennzeichens
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(delimiter).map((h) => h.replace(/['"]/g, '').trim());

  const result: MeterReading[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCells = lines[i].split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim());
    if (rawCells.length < 5) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h.toLowerCase()] = rawCells[idx] || '';
    });

    // Hilfsfunktion zum Auslesen mit Fallbacks
    const getNum = (...keys: string[]): number => {
      for (const k of keys) {
        const val = rowObj[k.toLowerCase()];
        if (val !== undefined && val !== '') {
          const parsed = parseFloat(val.replace(',', '.'));
          if (!isNaN(parsed)) return parsed;
        }
      }
      return 0;
    };

    const dateVal =
      rowObj['datum'] ||
      rowObj['date'] ||
      rowObj['ablesedatum'] ||
      new Date().toISOString().split('T')[0];

    const reading: MeterReading = {
      id: `reading_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`,
      date: dateVal,
      note: rowObj['notiz'] || rowObj['note'] || rowObj['bemerkung'] || '',
      gridImport: getNum('netzbezug_kwh', 'gridimport', 'bezug', 'strom_bezug'),
      gridExport: getNum('netzeinspeisung_kwh', 'gridexport', 'einspeisung', 'strom_einspeisung'),
      pvGeneration: getNum('pv_erzeugung_kwh', 'pvgeneration', 'erzeugung', 'pv_erzeugung'),
      pvSelfConsumption: getNum('pv_direktverbrauch_kwh', 'pvselfconsumption', 'eigenverbrauch'),
      pvExport: getNum('pv_einspeisung_kwh', 'pvexport', 'pv_export'),
      batteryCharge: getNum('speicher_ladung_kwh', 'batterycharge', 'speicher_ladung'),
      batteryDischarge: getNum('speicher_entladung_kwh', 'batterydischarge', 'speicher_entladung'),
      batterySoc: getNum('speicher_soc_prozent', 'batterysoc', 'soc'),
      batteryCapacity: getNum('speicher_kapazitaet_kwh', 'batterycapacity', 'kapazitaet') || 10,
      heatPumpElectricity: getNum('waermepumpe_strom_kwh', 'heatpumpelectricity', 'wp_strom'),
      heatPumpThermal: getNum('waermepumpe_waerme_kWh', 'heatpumpthermal', 'wp_waerme'),
      waterReading: getNum('wasserzaehler_m3', 'waterreading', 'wasser'),
    };

    result.push(reading);
  }

  if (result.length === 0) {
    throw new Error('Keine gültigen Zeilen in der CSV-Datei gefunden.');
  }

  return result;
}
