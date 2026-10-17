import React, { useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import '../utils/chartSetup';
import { ConsumptionPeriod, DashboardSummary, TariffConfig } from '../types';
import { formatCurrency, formatNumber, formatDate } from '../utils/calculations';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Sun, 
  Flame, 
  Droplet, 
  Leaf,
  Layers
} from 'lucide-react';

interface ChartsProps {
  periods: ConsumptionPeriod[];
  summary: DashboardSummary;
  tariff: TariffConfig;
  darkMode: boolean;
}

export const Charts: React.FC<ChartsProps> = ({ periods, summary, tariff, darkMode }) => {
  const [activeTab, setActiveTab] = useState<'energy' | 'pv' | 'cost' | 'heatpump' | 'water' | 'co2'>('energy');

  // Chart text & grid colors based on dark mode
  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
  const tooltipBg = darkMode ? '#0f172a' : '#ffffff';
  const tooltipText = darkMode ? '#f8fafc' : '#0f172a';
  const tooltipBorder = darkMode ? '#334155' : '#e2e8f0';

  // Labels (Date strings: e.g. "01.01.24 - 01.02.24" or month name)
  const labels = periods.map((p) => {
    const end = new Date(p.endDate);
    return end.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
  });

  // 1. Energiebilanz: Strombedarf gedeckt durch Netzbezug, PV-Direkt, Speicher
  const energyFlowData = {
    labels,
    datasets: [
      {
        label: 'Netzbezug (kWh)',
        data: periods.map((p) => p.gridImportKwh),
        backgroundColor: '#3b82f6', // blue
        borderRadius: 4,
        stack: 'demand',
      },
      {
        label: 'PV-Direktverbrauch (kWh)',
        data: periods.map((p) => p.pvSelfConsumptionKwh),
        backgroundColor: '#eab308', // yellow
        borderRadius: 4,
        stack: 'demand',
      },
      {
        label: 'Speicherentladung (kWh)',
        data: periods.map((p) => p.batteryDischargeKwh),
        backgroundColor: '#10b981', // green
        borderRadius: 4,
        stack: 'demand',
      },
      {
        label: 'Autarkiegrad (%)',
        data: periods.map((p) => p.autarkyPct),
        type: 'line' as const,
        borderColor: '#f97316', // orange
        backgroundColor: '#f97316',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'yAutarky',
        tension: 0.3,
      },
    ],
  };

  // 2. PV & Speicher Aufteilung (Erzeugung = Direktverbrauch + Speicherladung + Einspeisung)
  const pvSplitData = {
    labels,
    datasets: [
      {
        label: 'Direkter Eigenverbrauch (kWh)',
        data: periods.map((p) => p.pvSelfConsumptionKwh),
        backgroundColor: '#eab308', // yellow
        borderRadius: 4,
      },
      {
        label: 'Speicherladung (kWh)',
        data: periods.map((p) => p.batteryChargeKwh),
        backgroundColor: '#6366f1', // indigo
        borderRadius: 4,
      },
      {
        label: 'Netz-Einspeisung (kWh)',
        data: periods.map((p) => p.pvExportKwh),
        backgroundColor: '#06b6d4', // cyan
        borderRadius: 4,
      },
    ],
  };

  // 3. Kostenaufschlüsselung (Donut Chart)
  const costDonutData = {
    labels: ['Strom (Netzbezug)', 'Wärmepumpe', 'Wasser & Abwasser', 'Grundgebühren'],
    datasets: [
      {
        data: [
          Math.max(0, summary.totalCostGridImport),
          Math.max(0, summary.totalCostHeatPump),
          Math.max(0, summary.totalCostWater),
          Math.max(0, summary.totalBaseFees),
        ],
        backgroundColor: ['#3b82f6', '#f97316', '#06b6d4', '#8b5cf6'],
        borderWidth: 2,
        borderColor: darkMode ? '#1e293b' : '#ffffff',
      },
    ],
  };

  // 4. Wärmepumpen-Effizienz & JAZ Verlauf
  const heatPumpData = {
    labels,
    datasets: [
      {
        label: 'Produzierte Wärme (kWh)',
        data: periods.map((p) => p.heatPumpHeatKwh),
        backgroundColor: 'rgba(249, 115, 22, 0.7)',
        borderRadius: 4,
        yAxisID: 'yHeat',
      },
      {
        label: 'Stromverbrauch WP (kWh)',
        data: periods.map((p) => p.heatPumpElecKwh),
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
        borderRadius: 4,
        yAxisID: 'yHeat',
      },
      {
        label: 'JAZ (Arbeitszahl)',
        data: periods.map((p) => p.heatPumpJaz),
        type: 'line' as const,
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'yJaz',
        tension: 0.3,
      },
    ],
  };

  // 5. CO₂-Einsparungsverlauf (Monatlich & Kumuliert)
  let runningCo2 = 0;
  const cumulativeCo2Data = periods.map((p) => {
    runningCo2 += p.co2SavedTotalKg;
    return Math.round(runningCo2);
  });

  const co2Data = {
    labels,
    datasets: [
      {
        label: 'Monatlich eingespart (kg CO₂)',
        data: periods.map((p) => p.co2SavedTotalKg),
        backgroundColor: 'rgba(16, 185, 129, 0.65)',
        borderRadius: 4,
        yAxisID: 'yMonthly',
      },
      {
        label: 'Kumuliert gesamt (kg CO₂)',
        data: cumulativeCo2Data,
        type: 'line' as const,
        borderColor: '#059669',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'yCum',
        tension: 0.3,
      },
    ],
  };

  // 6. Wasserverbrauch (m³)
  const waterData = {
    labels,
    datasets: [
      {
        label: 'Wasserverbrauch (m³)',
        data: periods.map((p) => p.waterM3),
        backgroundColor: '#06b6d4',
        borderRadius: 6,
      },
      {
        label: 'Wasserkosten (€)',
        data: periods.map((p) => p.costWaterTotal),
        type: 'line' as const,
        borderColor: '#0284c7',
        backgroundColor: '#0284c7',
        borderWidth: 2,
        pointRadius: 4,
        yAxisID: 'yCost',
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Chart Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl border bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 shadow-sm">
        {[
          { id: 'energy', label: 'Energie- & Autarkieverlauf', icon: BarChart3 },
          { id: 'pv', label: 'PV- & Speicher-Bilanz', icon: Sun },
          { id: 'cost', label: 'Kostenaufschlüsselung', icon: PieChartIcon },
          { id: 'heatpump', label: 'Wärmepumpen Effizienz (JAZ)', icon: Flame },
          { id: 'co2', label: 'CO₂-Einsparungsverlauf', icon: Leaf },
          { id: 'water', label: 'Wasser & Abwasser', icon: Droplet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Chart View */}
      <div className="rounded-2xl border p-5 sm:p-6 bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 shadow-sm">
        {/* 1. Energie- und Autarkieverlauf */}
        {activeTab === 'energy' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Monatlicher Strombedarf & Deckung
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aufteilung des Hausstrombedarfs auf Netzbezug, direkten PV-Eigenverbrauch und Batteriespeicher mit Autarkiegrad
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-3 h-3 rounded-full bg-blue-500" /> Netzbezug
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" /> PV Direkt
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Speicher
                </span>
              </div>
            </div>

            <div className="h-80 sm:h-96">
              <Bar
                data={energyFlowData as any}
                options={{
                  ...commonOptions,
                  scales: {
                    x: {
                      stacked: true,
                      grid: { color: gridColor },
                      ticks: { color: textColor },
                    },
                    y: {
                      stacked: true,
                      grid: { color: gridColor },
                      ticks: { color: textColor },
                      title: { display: true, text: 'Energie (kWh)', color: textColor },
                    },
                    yAutarky: {
                      position: 'right',
                      grid: { drawOnChartArea: false },
                      min: 0,
                      max: 100,
                      ticks: {
                        color: '#f97316',
                        callback: (v) => `${v}%`,
                      },
                      title: { display: true, text: 'Autarkie (%)', color: '#f97316' },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* 2. PV- & Speicher-Bilanz */}
        {activeTab === 'pv' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  PV-Erzeugung & Flussverteilung
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Wohin fließt der Solarstrom: Direkter Eigenverbrauch vs. Akkuladung vs. Netzeinspeisung
                </p>
              </div>
            </div>

            <div className="h-80 sm:h-96">
              <Bar
                data={pvSplitData}
                options={{
                  ...commonOptions,
                  scales: {
                    x: {
                      stacked: true,
                      grid: { color: gridColor },
                      ticks: { color: textColor },
                    },
                    y: {
                      stacked: true,
                      grid: { color: gridColor },
                      ticks: { color: textColor },
                      title: { display: true, text: 'Solar-Erzeugung (kWh)', color: textColor },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* 3. Kostenaufschlüsselung (Donut) */}
        {activeTab === 'cost' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Kostenaufteilung im Erfassungszeitraum
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prozentuale und absolute Anteile der Gesamtkosten von {formatCurrency(summary.totalNetCost)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-72 sm:h-80 flex items-center justify-center">
                <Doughnut
                  data={costDonutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: textColor,
                          font: { size: 12 },
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => {
                            const val = ctx.raw as number;
                            const total = summary.totalNetCost || 1;
                            const pct = Math.round((val / total) * 100);
                            return ` ${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
                          },
                        },
                      },
                    },
                    cutout: '68%',
                  }}
                />
              </div>

              {/* Cost Breakdown Details */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-md bg-blue-500" />
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Strom (Netzbezug)</span>
                      <p className="text-xs text-slate-400">Arbeitspreis für bezogene kWh</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalCostGridImport)}</span>
                </div>

                <div className="p-3.5 rounded-xl border border-orange-500/30 bg-orange-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-md bg-orange-500" />
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Wärmepumpen-Strom</span>
                      <p className="text-xs text-slate-400">Heizstrom & Warmwasserbereitung</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalCostHeatPump)}</span>
                </div>

                <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-md bg-cyan-500" />
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Wasser & Abwasser</span>
                      <p className="text-xs text-slate-400">{summary.totalWaterM3} m³ Verbrauch inkl. Kanalgebühren</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalCostWater)}</span>
                </div>

                <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-md bg-purple-500" />
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Fixe Grundgebühren</span>
                      <p className="text-xs text-slate-400">Zählermiete, Messstellenbetrieb & Grundpreise</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalBaseFees)}</span>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-emerald-400">Abzüglich Einspeisevergütung</span>
                    <p className="text-xs text-slate-400">Vergütung nach EEG für Solar-Einspeisung</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">-{formatCurrency(summary.totalIncomeGridExport)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Wärmepumpen-Effizienz */}
        {activeTab === 'heatpump' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Wärmepumpen Effizienz & JAZ Monatsverlauf
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verhältnis von bereitgestellter Heizenergie zu aufgewendetem Antriebsstrom
                </p>
              </div>
            </div>

            <div className="h-80 sm:h-96">
              <Bar
                data={heatPumpData as any}
                options={{
                  ...commonOptions,
                  scales: {
                    x: {
                      grid: { color: gridColor },
                      ticks: { color: textColor },
                    },
                    yHeat: {
                      type: 'linear',
                      position: 'left',
                      grid: { color: gridColor },
                      ticks: { color: textColor },
                      title: { display: true, text: 'Wärme / Strom (kWh)', color: textColor },
                    },
                    yJaz: {
                      type: 'linear',
                      position: 'right',
                      min: 0,
                      max: 6,
                      grid: { drawOnChartArea: false },
                      ticks: { color: '#10b981' },
                      title: { display: true, text: 'JAZ (Effizienz)', color: '#10b981' },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* 5. CO₂-Einsparungsverlauf */}
        {activeTab === 'co2' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Monatliche & Kumulierte CO₂-Einsparung
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Berechnung basierend auf PV-Eigenstrom, Netzeinspeisung und Wärmepumpe gegenüber Referenz
                </p>
              </div>
            </div>

            <div className="h-80 sm:h-96">
              <Bar
                data={co2Data as any}
                options={{
                  ...commonOptions,
                  scales: {
                    x: {
                      grid: { color: gridColor },
                      ticks: { color: textColor },
                    },
                    yMonthly: {
                      type: 'linear',
                      position: 'left',
                      grid: { color: gridColor },
                      ticks: { color: textColor },
                      title: { display: true, text: 'Monatlich (kg CO₂)', color: textColor },
                    },
                    yCum: {
                      type: 'linear',
                      position: 'right',
                      grid: { drawOnChartArea: false },
                      ticks: { color: '#059669' },
                      title: { display: true, text: 'Kumuliert (kg CO₂)', color: '#059669' },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* 6. Wasser & Abwasser */}
        {activeTab === 'water' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Kaltwasser- & Abwasserverbrauch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kubikmeter (m³) Wasserverbrauch und daraus resultierende Kosten je Ableseintervall
                </p>
              </div>
            </div>

            <div className="h-80 sm:h-96">
              <Bar
                data={waterData as any}
                options={{
                  ...commonOptions,
                  scales: {
                    x: {
                      grid: { color: gridColor },
                      ticks: { color: textColor },
                    },
                    y: {
                      grid: { color: gridColor },
                      ticks: { color: textColor },
                      title: { display: true, text: 'Wasser (m³)', color: textColor },
                    },
                    yCost: {
                      position: 'right',
                      grid: { drawOnChartArea: false },
                      ticks: { color: '#0284c7', callback: (v) => `${v} €` },
                      title: { display: true, text: 'Kosten (€)', color: '#0284c7' },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
