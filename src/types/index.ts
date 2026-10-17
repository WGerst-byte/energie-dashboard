export interface MeterReading {
  id: string;
  date: string; // YYYY-MM-DD
  note?: string;

  // 1. Stromzähler (Hausanschluss)
  gridImport: number; // Zählerstand Bezug (kWh)
  gridExport: number; // Zählerstand Einspeisung (kWh)

  // 2. Photovoltaik (PV)
  pvGeneration: number; // Kumulierte Erzeugung (kWh)
  pvSelfConsumption: number; // Kumulierter direkter Eigenverbrauch (kWh)
  pvExport: number; // Kumulierte PV-Einspeisung (kWh)

  // 3. PV-Stromspeicher
  batteryCharge: number; // Kumulierte Speicherladung / Import in Speicher (kWh)
  batteryDischarge: number; // Kumulierte Speicherentladung / Export aus Speicher (kWh)
  batterySoc: number; // Aktueller Ladezustand / State of Charge (0-100 %)
  batteryCapacity: number; // Nennkapazität (kWh)

  // 4. Wärmepumpe
  heatPumpElectricity: number; // Zählerstand Stromverbrauch WP (kWh)
  heatPumpThermal: number; // Zählerstand erzeugte Wärmeenergie / Kälte (kWh)

  // 5. Kaltwasserzähler
  waterReading: number; // Zählerstand Wasser (m³)
}

export interface TariffConfig {
  // Strom & PV
  electricityWorkingPrice: number; // Cent / kWh (z.B. 31.5)
  electricityBasePrice: number; // € / Monat (z.B. 12.00)
  pvFeedInTariff: number; // Cent / kWh (z.B. 8.2)
  taxRate: number; // MwSt. in % (z.B. 19)
  gridFeeAddon: number; // Netzentgelte/Abgaben zusätzlich in Cent/kWh (optional, default 0)

  // Wärmepumpe
  separateHeatPumpTariff: boolean; // Eigener Wärmepumpentarif aktiv?
  heatPumpWorkingPrice: number; // Cent / kWh (z.B. 24.5)
  heatPumpBasePrice: number; // € / Monat (z.B. 5.00)

  // Wasser & Abwasser
  waterPricePerM3: number; // € / m³ Kaltwasser (z.B. 2.15)
  sewagePricePerM3: number; // € / m³ Kanal / Abwasser (z.B. 2.75)
  waterBasePricePerMonth: number; // € / Monat Grundgebühr Wasser (z.B. 5.50)

  // CO₂ Faktoren
  gridCo2Factor: number; // g CO₂ / kWh Strommix (z.B. 380)
  heatingReferenceCo2Factor: number; // g CO₂ / kWh für alte Heizung (Gas/Öl ca. 240-280)

  // Monatliche Abschlagszahlungen für Soll/Ist-Vergleich
  monthlyInstallmentElectricity: number; // € / Monat
  monthlyInstallmentWater: number; // € / Monat
}

export interface ConsumptionPeriod {
  id: string;
  startDate: string;
  endDate: string;
  days: number;

  // Verbräuche & Erträge in dieser Periode
  gridImportKwh: number;
  gridExportKwh: number;
  
  pvGenerationKwh: number;
  pvSelfConsumptionKwh: number; // Direkter Verbrauch ab Anlage
  pvExportKwh: number;

  batteryChargeKwh: number;
  batteryDischargeKwh: number;
  batteryLossKwh: number; // Speicher-Wandlungsverluste
  batteryEfficiencyPct: number; // Entladung / Ladung in %
  batterySoc: number; // End-SoC

  heatPumpElecKwh: number;
  heatPumpHeatKwh: number;
  heatPumpJaz: number; // JAZ = Wärmemenge / Stromverbrauch

  waterM3: number;

  // Gesamt-Strombedarf des Haushalts
  totalElectricityDemandKwh: number; // Eigenverbrauch (direkt) + Batterieentladung + Netzbezug
  autarkyPct: number; // (Eigenverbrauch direkt + Batterieentladung) / Gesamtstrombedarf * 100
  selfConsumptionPct: number; // (Eigenverbrauch direkt + Batterieladung) / PV-Erzeugung * 100

  // Kostenberechnungen
  costGridImport: number; // €
  incomeGridExport: number; // €
  costHeatPump: number; // €
  costWaterTotal: number; // € (Frischwasser + Abwasser + Grundgebühr)
  baseFeesElectricity: number; // €
  totalEnergyCost: number; // Gesamtkosten Netto/Brutto abzüglich Einspeisevergütung

  // Ersparnisse durch PV & Speicher
  pvSavingsEuro: number; // (Direktverbrauch + Batterieentladung) * Bezugspreis + Einspeisevergütung

  // CO₂ Bilanz
  co2SavedPvDirectKg: number;
  co2SavedPvBatteryKg: number;
  co2SavedPvExportKg: number;
  co2SavedHeatPumpKg: number;
  co2SavedTotalKg: number;
  co2SavedTotalTons: number;

  // Äquivalente
  treeEquivalent: number; // Bäume gepflanzt (ca. 20kg/Jahr)
  carKmEquivalent: number; // Auto km gespart (ca. 140g/km)
}

export interface DashboardSummary {
  periodCount: number;
  firstDate: string;
  lastDate: string;
  
  // Kumuliert
  totalGridImportKwh: number;
  totalGridExportKwh: number;
  totalPvGenerationKwh: number;
  totalPvSelfConsumptionKwh: number;
  totalBatteryChargeKwh: number;
  totalBatteryDischargeKwh: number;
  avgBatteryEfficiencyPct: number;
  totalHeatPumpElecKwh: number;
  totalHeatPumpHeatKwh: number;
  overallHeatPumpJaz: number;
  totalWaterM3: number;

  // Gesamtquoten
  overallAutarkyPct: number;
  overallSelfConsumptionPct: number;

  // Finanzen
  totalCostGridImport: number;
  totalIncomeGridExport: number;
  totalCostHeatPump: number;
  totalCostWater: number;
  totalBaseFees: number;
  totalNetCost: number;
  totalPvSavingsEuro: number;

  // Abschlags-Vergleich
  expectedInstallmentsTotal: number;
  costBalanceEuro: number; // Negativ = Guthaben, Positiv = Nachzahlung

  // CO₂ Gesamt
  totalCo2SavedKg: number;
  totalCo2SavedTons: number;
  totalTreeEquivalent: number;
  totalCarKmEquivalent: number;

  // Hochrechnung aufs ganze Jahr (Prognose)
  projectedYearlyCost: number;
  projectedYearlyCo2SavedTons: number;
  projectedYearlyPvSavings: number;
}
