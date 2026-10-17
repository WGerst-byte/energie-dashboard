import { MeterReading } from '../types';

export const INITIAL_READINGS: MeterReading[] = [
  {
    id: 'read_2024_01_01',
    date: '2024-01-01',
    note: 'Jahresstart 2024 Zählerstände',
    gridImport: 12450.0,
    gridExport: 8120.0,
    pvGeneration: 16800.0,
    pvSelfConsumption: 5100.0,
    pvExport: 8120.0,
    batteryCharge: 3600.0,
    batteryDischarge: 3240.0,
    batterySoc: 35,
    batteryCapacity: 10.0,
    heatPumpElectricity: 4200.0,
    heatPumpThermal: 16380.0,
    waterReading: 324.5,
  },
  {
    id: 'read_2024_02_01',
    date: '2024-02-01',
    note: 'Ablesung Januar (Kalter Wintermonat)',
    gridImport: 12920.0, // +470 kWh
    gridExport: 8140.0,  // +20 kWh
    pvGeneration: 17020.0, // +220 kWh
    pvSelfConsumption: 17180.0 - 16800.0 - 20, // Erzeugung 220, Einspeisung 20, Akku 50, Direkt 150 -> 5250
    pvExport: 8140.0,
    batteryCharge: 3650.0, // +50 kWh
    batteryDischarge: 3284.0, // +44 kWh (88% Wirkungsgrad)
    batterySoc: 25,
    batteryCapacity: 10.0,
    heatPumpElectricity: 4850.0, // +650 kWh
    heatPumpThermal: 18850.0,    // +2470 kWh (JAZ 3.80)
    waterReading: 336.2,         // +11.7 m³
  },
  {
    id: 'read_2024_03_01',
    date: '2024-03-01',
    note: 'Ablesung Februar',
    gridImport: 13310.0, // +390 kWh
    gridExport: 8200.0,  // +60 kWh
    pvGeneration: 17400.0, // +380 kWh
    pvSelfConsumption: 5460.0, // +210 kWh
    pvExport: 8200.0,
    batteryCharge: 3760.0, // +110 kWh
    batteryDischarge: 3383.0, // +99 kWh
    batterySoc: 40,
    batteryCapacity: 10.0,
    heatPumpElectricity: 5390.0, // +540 kWh
    heatPumpThermal: 21064.0,    // +2214 kWh (JAZ 4.10)
    waterReading: 347.4,         // +11.2 m³
  },
  {
    id: 'read_2024_04_01',
    date: '2024-04-01',
    note: 'Ablesung März (Erste kräftige Sonnenstunden)',
    gridImport: 13540.0, // +230 kWh
    gridExport: 8520.0,  // +320 kWh
    pvGeneration: 18220.0, // +820 kWh
    pvSelfConsumption: 5740.0, // +280 kWh
    pvExport: 8520.0,
    batteryCharge: 3980.0, // +220 kWh
    batteryDischarge: 3581.0, // +198 kWh (90% Wirkungsgrad)
    batterySoc: 65,
    batteryCapacity: 10.0,
    heatPumpElectricity: 5760.0, // +370 kWh
    heatPumpThermal: 22622.0,    // +1558 kWh (JAZ 4.21)
    waterReading: 359.1,         // +11.7 m³
  },
  {
    id: 'read_2024_05_01',
    date: '2024-05-01',
    note: 'Ablesung April (Hohe Autarkie)',
    gridImport: 13670.0, // +130 kWh
    gridExport: 9090.0,  // +570 kWh
    pvGeneration: 19280.0, // +1060 kWh
    pvSelfConsumption: 6010.0, // +270 kWh
    pvExport: 9090.0,
    batteryCharge: 4200.0, // +220 kWh
    batteryDischarge: 3780.0, // +199 kWh
    batterySoc: 80,
    batteryCapacity: 10.0,
    heatPumpElectricity: 5970.0, // +210 kWh
    heatPumpThermal: 23567.0,    // +945 kWh (JAZ 4.50)
    waterReading: 370.8,         // +11.7 m³
  },
  {
    id: 'read_2024_06_01',
    date: '2024-06-01',
    note: 'Ablesung Mai (Sonniger Wonnemonat)',
    gridImport: 13735.0, // +65 kWh
    gridExport: 9870.0,  // +780 kWh
    pvGeneration: 20560.0, // +1280 kWh
    pvSelfConsumption: 6250.0, // +240 kWh
    pvExport: 9870.0,
    batteryCharge: 4460.0, // +260 kWh
    batteryDischarge: 4016.0, // +236 kWh (90.8%)
    batterySoc: 92,
    batteryCapacity: 10.0,
    heatPumpElectricity: 6090.0, // +120 kWh (Nur Warmwasser)
    heatPumpThermal: 24143.0,    // +576 kWh (JAZ 4.80)
    waterReading: 382.9,         // +12.1 m³
  },
  {
    id: 'read_2024_07_01',
    date: '2024-07-01',
    note: 'Ablesung Juni (Sommermaximum & Pool)',
    gridImport: 13780.0, // +45 kWh
    gridExport: 10750.0, // +880 kWh
    pvGeneration: 21980.0, // +1420 kWh
    pvSelfConsumption: 6530.0, // +280 kWh
    pvExport: 10750.0,
    batteryCharge: 4720.0, // +260 kWh
    batteryDischarge: 4252.0, // +236 kWh
    batterySoc: 95,
    batteryCapacity: 10.0,
    heatPumpElectricity: 6185.0, // +95 kWh
    heatPumpThermal: 24618.0,    // +475 kWh (JAZ 5.00)
    waterReading: 395.4,         // +12.5 m³
  },
  {
    id: 'read_2024_08_01',
    date: '2024-08-01',
    note: 'Ablesung Juli (Rekord-Autarkie 94%)',
    gridImport: 13820.0, // +40 kWh
    gridExport: 11620.0, // +870 kWh
    pvGeneration: 23370.0, // +1390 kWh
    pvSelfConsumption: 6800.0, // +270 kWh
    pvExport: 11620.0,
    batteryCharge: 4970.0, // +250 kWh
    batteryDischarge: 4479.0, // +227 kWh
    batterySoc: 90,
    batteryCapacity: 10.0,
    heatPumpElectricity: 6275.0, // +90 kWh
    heatPumpThermal: 25068.0,    // +450 kWh (JAZ 5.00)
    waterReading: 408.0,         // +12.6 m³
  },
  {
    id: 'read_2024_09_01',
    date: '2024-09-01',
    note: 'Ablesung August (Urlaubsmonat)',
    gridImport: 13875.0, // +55 kWh
    gridExport: 12410.0, // +790 kWh
    pvGeneration: 24610.0, // +1240 kWh
    pvSelfConsumption: 7040.0, // +240 kWh
    pvExport: 12410.0,
    batteryCharge: 5180.0, // +210 kWh
    batteryDischarge: 4670.0, // +191 kWh
    batterySoc: 85,
    batteryCapacity: 10.0,
    heatPumpElectricity: 6375.0, // +100 kWh
    heatPumpThermal: 25558.0,    // +490 kWh (JAZ 4.90)
    waterReading: 418.8,         // +10.8 m³
  },
  {
    id: 'read_2024_10_01',
    date: '2024-10-01',
    note: 'Ablesung September (Spätsommer)',
    gridImport: 13990.0, // +115 kWh
    gridExport: 12930.0, // +520 kWh
    pvGeneration: 25550.0, // +940 kWh
    pvSelfConsumption: 7300.0, // +260 kWh
    pvExport: 12930.0,
    batteryCharge: 5340.0, // +160 kWh
    batteryDischarge: 4815.0, // +145 kWh
    batterySoc: 60,
    batteryCapacity: 10.0,
    heatPumpElectricity: 6540.0, // +165 kWh
    heatPumpThermal: 26317.0,    // +759 kWh (JAZ 4.60)
    waterReading: 430.2,         // +11.4 m³
  },
  {
    id: 'read_2024_11_01',
    date: '2024-11-01',
    note: 'Ablesung Oktober (Heizperiode startet)',
    gridImport: 14240.0, // +250 kWh
    gridExport: 13130.0, // +200 kWh
    pvGeneration: 26130.0, // +580 kWh
    pvSelfConsumption: 7550.0, // +250 kWh
    pvExport: 13130.0,
    batteryCharge: 5470.0, // +130 kWh
    batteryDischarge: 4931.0, // +116 kWh
    batterySoc: 40,
    batteryCapacity: 10.0,
    heatPumpElectricity: 6890.0, // +350 kWh
    heatPumpThermal: 27822.0,    // +1505 kWh (JAZ 4.30)
    waterReading: 442.0,         // +11.8 m³
  },
  {
    id: 'read_2024_12_01',
    date: '2024-12-01',
    note: 'Ablesung November (Herbst/Neblig)',
    gridImport: 14660.0, // +420 kWh
    gridExport: 13190.0, // +60 kWh
    pvGeneration: 26410.0, // +280 kWh
    pvSelfConsumption: 7720.0, // +170 kWh
    pvExport: 13190.0,
    batteryCharge: 5520.0, // +50 kWh
    batteryDischarge: 4975.0, // +44 kWh
    batterySoc: 25,
    batteryCapacity: 10.0,
    heatPumpElectricity: 7450.0, // +560 kWh
    heatPumpThermal: 30062.0,    // +2240 kWh (JAZ 4.00)
    waterReading: 453.6,         // +11.6 m³
  },
  {
    id: 'read_2025_01_01',
    date: '2025-01-01',
    note: 'Jahresabschluss 2024 / Neujahr',
    gridImport: 15150.0, // +490 kWh
    gridExport: 13215.0, // +25 kWh
    pvGeneration: 26610.0, // +200 kWh
    pvSelfConsumption: 7860.0, // +140 kWh
    pvExport: 13215.0,
    batteryCharge: 5555.0, // +35 kWh
    batteryDischarge: 5006.0, // +31 kWh
    batterySoc: 20,
    batteryCapacity: 10.0,
    heatPumpElectricity: 8120.0, // +670 kWh
    heatPumpThermal: 32608.0,    // +2546 kWh (JAZ 3.80)
    waterReading: 465.5,         // +11.9 m³
  }
];
