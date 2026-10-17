import { MeterReading, TariffConfig, ConsumptionPeriod, DashboardSummary } from '../types';

export const DEFAULT_TARIFF: TariffConfig = {
  electricityWorkingPrice: 31.8, // Cent / kWh
  electricityBasePrice: 12.50, // € / Monat
  pvFeedInTariff: 8.11, // Cent / kWh (EEG 2024 / 2025 Standard)
  taxRate: 19, // % MwSt.
  gridFeeAddon: 0, // Cent / kWh bereits eingerechnet

  separateHeatPumpTariff: true,
  heatPumpWorkingPrice: 23.5, // Cent / kWh
  heatPumpBasePrice: 6.00, // € / Monat

  waterPricePerM3: 2.15, // € / m³ Trinkwasser
  sewagePricePerM3: 2.85, // € / m³ Schmutzwasser/Kanal
  waterBasePricePerMonth: 5.50, // € / Monat Grundpreis Wasser/Kanal

  gridCo2Factor: 380, // g CO₂ / kWh Bundesstrommix Deutschland
  heatingReferenceCo2Factor: 250, // g CO₂ / kWh alte Gas-/Ölheizung

  monthlyInstallmentElectricity: 140, // € / Monat Abschlag
  monthlyInstallmentWater: 38, // € / Monat Abschlag
};

/**
 * Berechnet die Verbrauchsintervalle aus chronologisch sortierten Zählerständen
 */
export function calculateConsumptionPeriods(
  readings: MeterReading[],
  tariff: TariffConfig
): ConsumptionPeriod[] {
  if (readings.length < 2) return [];

  // Sortierung aufsteigend nach Datum
  const sorted = [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const periods: ConsumptionPeriod[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    const d1 = new Date(prev.date);
    const d2 = new Date(curr.date);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    // Differenzen berechnen (Verbräuche/Erträge)
    const gridImportKwh = Math.max(0, curr.gridImport - prev.gridImport);
    const gridExportKwh = Math.max(0, curr.gridExport - prev.gridExport);

    const pvGenerationKwh = Math.max(0, curr.pvGeneration - prev.pvGeneration);
    const pvSelfConsumptionKwh = Math.max(0, curr.pvSelfConsumption - prev.pvSelfConsumption);
    const pvExportKwh = Math.max(0, curr.pvExport - prev.pvExport);

    const batteryChargeKwh = Math.max(0, curr.batteryCharge - prev.batteryCharge);
    const batteryDischargeKwh = Math.max(0, curr.batteryDischarge - prev.batteryDischarge);
    const batteryLossKwh = Math.max(0, batteryChargeKwh - batteryDischargeKwh);
    const batteryEfficiencyPct =
      batteryChargeKwh > 0
        ? Math.min(100, Math.round((batteryDischargeKwh / batteryChargeKwh) * 1000) / 10)
        : 0;

    const heatPumpElecKwh = Math.max(0, curr.heatPumpElectricity - prev.heatPumpElectricity);
    const heatPumpHeatKwh = Math.max(0, curr.heatPumpThermal - prev.heatPumpThermal);
    const heatPumpJaz =
      heatPumpElecKwh > 0
        ? Math.round((heatPumpHeatKwh / heatPumpElecKwh) * 100) / 100
        : 0;

    const waterM3 = Math.max(0, Math.round((curr.waterReading - prev.waterReading) * 1000) / 1000);

    // Gesamter Strombedarf: Was im Haus bezogen und verbraucht wurde
    // Haushalt deckt Strombedarf durch: Netzbezug + direkten PV-Eigenverbrauch + Batterieentladung
    const totalElectricityDemandKwh =
      Math.round((gridImportKwh + pvSelfConsumptionKwh + batteryDischargeKwh) * 10) / 10;

    // Autarkiegrad: Anteil des Gesamtverbrauchs gedeckt durch PV (Direkt + Batterie)
    const selfSuppliedKwh = pvSelfConsumptionKwh + batteryDischargeKwh;
    const autarkyPct =
      totalElectricityDemandKwh > 0
        ? Math.min(100, Math.round((selfSuppliedKwh / totalElectricityDemandKwh) * 1000) / 10)
        : 0;

    // Eigenverbrauchsanteil: Wieviel % der PV-Erzeugung verblieb im Haus (Direktverbrauch + Akkuladung)
    const pvStoredAndUsedKwh = pvSelfConsumptionKwh + batteryChargeKwh;
    const selfConsumptionPct =
      pvGenerationKwh > 0
        ? Math.min(100, Math.round((pvStoredAndUsedKwh / pvGenerationKwh) * 1000) / 10)
        : 0;

    // Kostenberechnung
    const elecPricePerKwh = (tariff.electricityWorkingPrice + tariff.gridFeeAddon) / 100;
    const feedInPricePerKwh = tariff.pvFeedInTariff / 100;
    const hpPricePerKwh = tariff.separateHeatPumpTariff
      ? tariff.heatPumpWorkingPrice / 100
      : elecPricePerKwh;

    const costGridImport = Math.round(gridImportKwh * elecPricePerKwh * 100) / 100;
    const incomeGridExport = Math.round(gridExportKwh * feedInPricePerKwh * 100) / 100;
    
    // Wärmepumpenkosten (sofern separat erfasst)
    const costHeatPump = Math.round(heatPumpElecKwh * hpPricePerKwh * 100) / 100;

    // Wasserkosten (Frischwasser + Kanal)
    const waterUnitCost = tariff.waterPricePerM3 + tariff.sewagePricePerM3;
    const costWaterConsumable = waterM3 * waterUnitCost;

    // Grundgebühren anteilig auf die Tage des Monats/Intervalls (30.4375 Tage pro Monat im Schnitt)
    const monthFraction = days / 30.4375;
    const baseFeesElectricity =
      Math.round(
        (tariff.electricityBasePrice + (tariff.separateHeatPumpTariff ? tariff.heatPumpBasePrice : 0)) *
          monthFraction *
          100
      ) / 100;
    const baseFeesWater = Math.round(tariff.waterBasePricePerMonth * monthFraction * 100) / 100;
    const costWaterTotal = Math.round((costWaterConsumable + baseFeesWater) * 100) / 100;

    // Netto-Gesamtkosten für diesen Zeitraum
    // Wenn Wärmepumpe im Hausnetz/Bezug schon enthalten ist oder separat:
    // Hier standardmäßig: Grid Import Cost + Wasser + Grundgebühren - Einspeiseerlös
    const totalEnergyCost =
      Math.round(
        (costGridImport + (tariff.separateHeatPumpTariff ? costHeatPump : 0) + costWaterTotal + baseFeesElectricity - incomeGridExport) * 100
      ) / 100;

    // Geldersparnis durch PV & Speicher (Verhinderter Netzbezug + Einspeiseerlös)
    const pvSavingsEuro =
      Math.round(((pvSelfConsumptionKwh + batteryDischargeKwh) * elecPricePerKwh + incomeGridExport) * 100) / 100;

    // CO₂ Einsparungen
    // 1. PV Direktverbrauch verhindert Netzbezug
    const co2SavedPvDirectKg = (pvSelfConsumptionKwh * tariff.gridCo2Factor) / 1000;
    // 2. PV Batteriestrom verhindert Netzbezug
    const co2SavedPvBatteryKg = (batteryDischargeKwh * tariff.gridCo2Factor) / 1000;
    // 3. PV Einspeisung verdrängt fossilen Strom im Netz
    const co2SavedPvExportKg = (pvExportKwh * tariff.gridCo2Factor) / 1000;
    // 4. Wärmepumpe spart im Vergleich zu fossiler Heizung (Referenz)
    // Fossile Heizung hätte erzeugt: heatPumpHeatKwh * RefCo2
    // WP hat verbraucht: heatPumpElecKwh * GridCo2 (wobei ein Teil sogar PV sein kann!)
    const fossilCo2Kg = (heatPumpHeatKwh * tariff.heatingReferenceCo2Factor) / 1000;
    const wpElectricityCo2Kg = (heatPumpElecKwh * tariff.gridCo2Factor) / 1000;
    const co2SavedHeatPumpKg = Math.max(0, fossilCo2Kg - wpElectricityCo2Kg);

    const co2SavedTotalKg =
      Math.round((co2SavedPvDirectKg + co2SavedPvBatteryKg + co2SavedPvExportKg + co2SavedHeatPumpKg) * 10) / 10;
    const co2SavedTotalTons = Math.round((co2SavedTotalKg / 1000) * 100) / 100;

    // Äquivalente
    // 1 Baum absorbiert ca. 20 kg CO₂ pro Jahr -> 0.0548 kg/Tag
    const treeEquivalent = Math.round(co2SavedTotalKg / 20);
    // 1 PKW stößt im Schnitt ca. 140 g = 0.140 kg CO₂ / km aus
    const carKmEquivalent = Math.round(co2SavedTotalKg / 0.14);

    periods.push({
      id: `${prev.id}_${curr.id}`,
      startDate: prev.date,
      endDate: curr.date,
      days,
      gridImportKwh,
      gridExportKwh,
      pvGenerationKwh,
      pvSelfConsumptionKwh,
      pvExportKwh,
      batteryChargeKwh,
      batteryDischargeKwh,
      batteryLossKwh,
      batteryEfficiencyPct,
      batterySoc: curr.batterySoc,
      heatPumpElecKwh,
      heatPumpHeatKwh,
      heatPumpJaz,
      waterM3,
      totalElectricityDemandKwh,
      autarkyPct,
      selfConsumptionPct,
      costGridImport,
      incomeGridExport,
      costHeatPump,
      costWaterTotal,
      baseFeesElectricity,
      totalEnergyCost,
      pvSavingsEuro,
      co2SavedPvDirectKg,
      co2SavedPvBatteryKg,
      co2SavedPvExportKg,
      co2SavedHeatPumpKg,
      co2SavedTotalKg,
      co2SavedTotalTons,
      treeEquivalent,
      carKmEquivalent,
    });
  }

  return periods;
}

/**
 * Erzeugt eine zusammenfassende Dashboard-Statistik über alle oder gefilterte Perioden
 */
export function calculateDashboardSummary(
  periods: ConsumptionPeriod[],
  tariff: TariffConfig
): DashboardSummary {
  if (periods.length === 0) {
    return {
      periodCount: 0,
      firstDate: '',
      lastDate: '',
      totalGridImportKwh: 0,
      totalGridExportKwh: 0,
      totalPvGenerationKwh: 0,
      totalPvSelfConsumptionKwh: 0,
      totalBatteryChargeKwh: 0,
      totalBatteryDischargeKwh: 0,
      avgBatteryEfficiencyPct: 0,
      totalHeatPumpElecKwh: 0,
      totalHeatPumpHeatKwh: 0,
      overallHeatPumpJaz: 0,
      totalWaterM3: 0,
      overallAutarkyPct: 0,
      overallSelfConsumptionPct: 0,
      totalCostGridImport: 0,
      totalIncomeGridExport: 0,
      totalCostHeatPump: 0,
      totalCostWater: 0,
      totalBaseFees: 0,
      totalNetCost: 0,
      totalPvSavingsEuro: 0,
      expectedInstallmentsTotal: 0,
      costBalanceEuro: 0,
      totalCo2SavedKg: 0,
      totalCo2SavedTons: 0,
      totalTreeEquivalent: 0,
      totalCarKmEquivalent: 0,
      projectedYearlyCost: 0,
      projectedYearlyCo2SavedTons: 0,
      projectedYearlyPvSavings: 0,
    };
  }

  const totalDays = periods.reduce((acc, p) => acc + p.days, 0);
  const totalGridImportKwh = periods.reduce((acc, p) => acc + p.gridImportKwh, 0);
  const totalGridExportKwh = periods.reduce((acc, p) => acc + p.gridExportKwh, 0);
  const totalPvGenerationKwh = periods.reduce((acc, p) => acc + p.pvGenerationKwh, 0);
  const totalPvSelfConsumptionKwh = periods.reduce((acc, p) => acc + p.pvSelfConsumptionKwh, 0);
  const totalBatteryChargeKwh = periods.reduce((acc, p) => acc + p.batteryChargeKwh, 0);
  const totalBatteryDischargeKwh = periods.reduce((acc, p) => acc + p.batteryDischargeKwh, 0);
  
  const avgBatteryEfficiencyPct =
    totalBatteryChargeKwh > 0
      ? Math.round((totalBatteryDischargeKwh / totalBatteryChargeKwh) * 1000) / 10
      : 0;

  const totalHeatPumpElecKwh = periods.reduce((acc, p) => acc + p.heatPumpElecKwh, 0);
  const totalHeatPumpHeatKwh = periods.reduce((acc, p) => acc + p.heatPumpHeatKwh, 0);
  const overallHeatPumpJaz =
    totalHeatPumpElecKwh > 0
      ? Math.round((totalHeatPumpHeatKwh / totalHeatPumpElecKwh) * 100) / 100
      : 0;

  const totalWaterM3 = Math.round(periods.reduce((acc, p) => acc + p.waterM3, 0) * 10) / 10;

  const totalElectricityDemandKwh = periods.reduce((acc, p) => acc + p.totalElectricityDemandKwh, 0);
  const selfSuppliedKwh = totalPvSelfConsumptionKwh + totalBatteryDischargeKwh;
  const overallAutarkyPct =
    totalElectricityDemandKwh > 0
      ? Math.min(100, Math.round((selfSuppliedKwh / totalElectricityDemandKwh) * 1000) / 10)
      : 0;

  const pvStoredAndUsedKwh = totalPvSelfConsumptionKwh + totalBatteryChargeKwh;
  const overallSelfConsumptionPct =
    totalPvGenerationKwh > 0
      ? Math.min(100, Math.round((pvStoredAndUsedKwh / totalPvGenerationKwh) * 1000) / 10)
      : 0;

  const totalCostGridImport = Math.round(periods.reduce((acc, p) => acc + p.costGridImport, 0) * 100) / 100;
  const totalIncomeGridExport = Math.round(periods.reduce((acc, p) => acc + p.incomeGridExport, 0) * 100) / 100;
  const totalCostHeatPump = Math.round(periods.reduce((acc, p) => acc + p.costHeatPump, 0) * 100) / 100;
  const totalCostWater = Math.round(periods.reduce((acc, p) => acc + p.costWaterTotal, 0) * 100) / 100;
  const totalBaseFees = Math.round(periods.reduce((acc, p) => acc + p.baseFeesElectricity, 0) * 100) / 100;
  const totalNetCost = Math.round(periods.reduce((acc, p) => acc + p.totalEnergyCost, 0) * 100) / 100;
  const totalPvSavingsEuro = Math.round(periods.reduce((acc, p) => acc + p.pvSavingsEuro, 0) * 100) / 100;

  // Abschlags-Vergleich
  const totalMonths = totalDays / 30.4375;
  const monthlyTotalInstallment = tariff.monthlyInstallmentElectricity + tariff.monthlyInstallmentWater;
  const expectedInstallmentsTotal = Math.round(monthlyTotalInstallment * totalMonths * 100) / 100;
  // Ist-Kosten vs Abschlagszahlung: positive = Nachzahlung fällig, negative = Rückerstattung/Guthaben
  const costBalanceEuro = Math.round((totalNetCost - expectedInstallmentsTotal) * 100) / 100;

  // CO₂ Summen
  const totalCo2SavedKg = Math.round(periods.reduce((acc, p) => acc + p.co2SavedTotalKg, 0) * 10) / 10;
  const totalCo2SavedTons = Math.round((totalCo2SavedKg / 1000) * 100) / 100;
  const totalTreeEquivalent = Math.round(totalCo2SavedKg / 20);
  const totalCarKmEquivalent = Math.round(totalCo2SavedKg / 0.14);

  // Hochrechnung auf 365 Tage (Jahresprognose)
  const projectionFactor = totalDays > 0 ? 365 / totalDays : 1;
  const projectedYearlyCost = Math.round(totalNetCost * projectionFactor * 100) / 100;
  const projectedYearlyCo2SavedTons = Math.round(((totalCo2SavedKg * projectionFactor) / 1000) * 100) / 100;
  const projectedYearlyPvSavings = Math.round(totalPvSavingsEuro * projectionFactor * 100) / 100;

  return {
    periodCount: periods.length,
    firstDate: periods[0].startDate,
    lastDate: periods[periods.length - 1].endDate,
    totalGridImportKwh,
    totalGridExportKwh,
    totalPvGenerationKwh,
    totalPvSelfConsumptionKwh,
    totalBatteryChargeKwh,
    totalBatteryDischargeKwh,
    avgBatteryEfficiencyPct,
    totalHeatPumpElecKwh,
    totalHeatPumpHeatKwh,
    overallHeatPumpJaz,
    totalWaterM3,
    overallAutarkyPct,
    overallSelfConsumptionPct,
    totalCostGridImport,
    totalIncomeGridExport,
    totalCostHeatPump,
    totalCostWater,
    totalBaseFees,
    totalNetCost,
    totalPvSavingsEuro,
    expectedInstallmentsTotal,
    costBalanceEuro,
    totalCo2SavedKg,
    totalCo2SavedTons,
    totalTreeEquivalent,
    totalCarKmEquivalent,
    projectedYearlyCost,
    projectedYearlyCo2SavedTons,
    projectedYearlyPvSavings,
  };
}

/**
 * Hilfsfunktionen für Formatierung
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatNumber(num: number, decimals: number = 1): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}
