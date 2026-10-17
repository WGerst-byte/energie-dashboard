import React from 'react';
import { 
  DashboardSummary, 
  ConsumptionPeriod 
} from '../types';
import { 
  formatCurrency, 
  formatNumber 
} from '../utils/calculations';
import { 
  Sun, 
  BatteryCharging, 
  Flame, 
  Droplet, 
  Leaf, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface KpiCardsProps {
  summary: DashboardSummary;
  latestPeriod?: ConsumptionPeriod;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary, latestPeriod }) => {
  // Letzter bekannter Speicherstand (oder Durchschnitt)
  const currentBatterySoc = latestPeriod ? latestPeriod.batterySoc : 50;

  // JAZ Bewertung
  const getJazRating = (jaz: number) => {
    if (jaz >= 4.5) return { text: 'Exzellent', color: 'text-emerald-500' };
    if (jaz >= 4.0) return { text: 'Sehr gut', color: 'text-emerald-400' };
    if (jaz >= 3.5) return { text: 'Gut', color: 'text-teal-400' };
    if (jaz >= 3.0) return { text: 'Akzeptabel', color: 'text-amber-400' };
    return { text: 'Ausbaufähig', color: 'text-rose-400' };
  };

  const jazRating = getJazRating(summary.overallHeatPumpJaz);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {/* 1. Gesamtkosten & Abschlags-Vergleich */}
      <div className="relative overflow-hidden rounded-2xl p-5 border bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Gesamtkosten (Netto)
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(summary.totalNetCost)}
          </span>
          <span className="text-xs text-slate-400">
            ({summary.periodCount} Abschnitte)
          </span>
        </div>

        {/* Prognose & Abschlag */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-3 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
            <span>Hochrechnung Jahr:</span>
            <span className="font-semibold">{formatCurrency(summary.projectedYearlyCost)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Abschlagssaldo:</span>
            <div className={`flex items-center gap-1 font-semibold ${
              summary.costBalanceEuro <= 0 ? 'text-emerald-500' : 'text-amber-500'
            }`}>
              {summary.costBalanceEuro <= 0 ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>{formatCurrency(Math.abs(summary.costBalanceEuro))} Guthaben</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{formatCurrency(summary.costBalanceEuro)} Nachzahlung</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PV Autarkiegrad & Ersparnis */}
      <div className="relative overflow-hidden rounded-2xl p-5 border bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Autarkie & Ersparnis
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sun className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-500 dark:text-amber-400">
            {formatNumber(summary.overallAutarkyPct, 1)}%
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Autarkiegrad
          </span>
        </div>

        {/* Progress bar Autarkie */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-700" 
            style={{ width: `${Math.min(100, Math.max(0, summary.overallAutarkyPct))}%` }}
          />
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
            <span>PV-Ersparnis gesamt:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(summary.totalPvSavingsEuro)}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Eigenverbrauchsquote:</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {formatNumber(summary.overallSelfConsumptionPct, 1)}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Stromspeicher Status & Wirkungsgrad */}
      <div className="relative overflow-hidden rounded-2xl p-5 border bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            PV-Stromspeicher
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <BatteryCharging className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
            {formatNumber(summary.avgBatteryEfficiencyPct, 1)}%
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Wirkungsgrad
          </span>
        </div>

        {/* Battery level visual */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-700" 
              style={{ width: `${Math.min(100, Math.max(0, currentBatterySoc))}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {currentBatterySoc}% SoC
          </span>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex justify-between items-center">
            <span>Ladung / Entladung:</span>
            <span className="font-medium">
              {formatNumber(summary.totalBatteryChargeKwh, 0)} / {formatNumber(summary.totalBatteryDischargeKwh, 0)} kWh
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Wandlungsverluste:</span>
            <span className="font-medium text-amber-500">
              {formatNumber(Math.max(0, summary.totalBatteryChargeKwh - summary.totalBatteryDischargeKwh), 0)} kWh
            </span>
          </div>
        </div>
      </div>

      {/* 4. Wärmepumpen-Effizienz (JAZ) */}
      <div className="relative overflow-hidden rounded-2xl p-5 border bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Wärmepumpen JAZ
          </span>
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-orange-500 dark:text-orange-400">
            {formatNumber(summary.overallHeatPumpJaz, 2)}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 ${jazRating.color}`}>
            {jazRating.text}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mb-3">
          Verhältnis thermische Wärme zu verbrauchtem Strom
        </p>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex justify-between items-center">
            <span>Wärme erzeugt:</span>
            <span className="font-semibold">{formatNumber(summary.totalHeatPumpHeatKwh, 0)} kWh</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Stromverbrauch WP:</span>
            <span className="font-medium">{formatNumber(summary.totalHeatPumpElecKwh, 0)} kWh</span>
          </div>
        </div>
      </div>

      {/* 5. CO₂-Bilanz Banner (Spans full width or highlights) */}
      <div className="sm:col-span-2 lg:col-span-4 rounded-2xl p-5 border bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border-emerald-500/30 text-white shadow-lg shadow-emerald-950/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-emerald-300">
                  Ökologische CO₂-Bilanz Ihres Eigenheims
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Aktiv geschützt
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Erzielt durch PV-Eigenverbrauch, Netzeinspeisung & hocheffiziente Wärmepumpenheizung
              </p>
            </div>
          </div>

          {/* Key CO₂ metrics */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 w-full md:w-auto justify-between md:justify-end">
            <div>
              <span className="text-xs text-slate-400 block">Eingespart</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {formatNumber(summary.totalCo2SavedTons, 2)} <span className="text-emerald-400 text-lg">t CO₂</span>
              </span>
            </div>

            <div className="h-8 w-px bg-slate-700 hidden sm:block" />

            <div>
              <span className="text-xs text-slate-400 block">Entspricht gepflanzt</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-300">
                🌱 ~{formatNumber(summary.totalTreeEquivalent, 0)} <span className="text-xs font-normal text-slate-300">Bäumen/Jahr</span>
              </span>
            </div>

            <div className="h-8 w-px bg-slate-700 hidden sm:block" />

            <div>
              <span className="text-xs text-slate-400 block">Vermiedene PKW-Fahrt</span>
              <span className="text-xl sm:text-2xl font-bold text-teal-300">
                🚗 ~{formatNumber(summary.totalCarKmEquivalent, 0)} <span className="text-xs font-normal text-slate-300">km</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
