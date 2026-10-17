import React from 'react';
import { DashboardSummary, ConsumptionPeriod, TariffConfig } from '../types';
import { formatNumber } from '../utils/calculations';
import { 
  Leaf, 
  Trees, 
  Car, 
  Plane, 
  Zap, 
  Sun, 
  BatteryCharging, 
  Flame, 
  TrendingUp, 
  Award,
  Sparkles,
  Compass
} from 'lucide-react';

interface Co2EcologicalViewProps {
  summary: DashboardSummary;
  periods: ConsumptionPeriod[];
  tariff: TariffConfig;
}

export const Co2EcologicalView: React.FC<Co2EcologicalViewProps> = ({
  summary,
  periods,
  tariff,
}) => {
  // Anteile der CO2-Einsparung nach Quellen berechnen
  const co2PvDirect = periods.reduce((sum, p) => sum + p.co2SavedPvDirectKg, 0);
  const co2PvBattery = periods.reduce((sum, p) => sum + p.co2SavedPvBatteryKg, 0);
  const co2PvExport = periods.reduce((sum, p) => sum + p.co2SavedPvExportKg, 0);
  const co2HeatPump = periods.reduce((sum, p) => sum + p.co2SavedHeatPumpKg, 0);
  const totalKg = Math.max(1, summary.totalCo2SavedKg);

  const pctDirect = Math.round((co2PvDirect / totalKg) * 100);
  const pctBattery = Math.round((co2PvBattery / totalKg) * 100);
  const pctExport = Math.round((co2PvExport / totalKg) * 100);
  const pctHeatPump = Math.round((co2HeatPump / totalKg) * 100);

  // Vergleichs-Äquivalente
  const treeCount = Math.round(totalKg / 20); // 1 Baum bindet ~20 kg CO2 / Jahr
  const carKm = Math.round(totalKg / 0.14); // 140 g / km Benziner / Diesel
  const flightsMalle = Math.round(totalKg / 360); // Flug FFM -> PMI ca. 360 kg CO2 p.P.
  const smartphoneCharges = Math.round((totalKg * 1000) / 8.2); // ~8.2 g CO2 pro Akkuladung

  // Langzeit-Prognose (10 & 20 Jahre)
  const yearlyTons = summary.projectedYearlyCo2SavedTons;
  const tenYearsTons = Math.round(yearlyTons * 10 * 10) / 10;
  const twentyYearsTons = Math.round(yearlyTons * 20 * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 border-emerald-500/40 text-white shadow-xl shadow-emerald-950/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ganzheitliche Ökobilanz Ihres Zuhauses</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {formatNumber(summary.totalCo2SavedTons, 2)} Tonnen CO₂ vermieden
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Durch die Kombination Ihrer Photovoltaikanlage, des Batteriespeichers und der Wärmepumpe haben Sie im erfassten Zeitraum signifikant zur Entlastung des Weltklimas beigetragen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <Trees className="w-6 h-6 text-emerald-300 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">{formatNumber(treeCount, 0)}</div>
              <div className="text-[11px] text-slate-300">Bäume gepflanzt (Jahresleistung)</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <Car className="w-6 h-6 text-teal-300 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">{formatNumber(carKm, 0)}</div>
              <div className="text-[11px] text-slate-300">vermiedene PKW-km</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Säulen der Einsparung */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-500" />
          Die 4 Säulen Ihrer CO₂-Einsparung
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Direkter PV-Eigenverbrauch */}
          <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-500">{pctDirect}% Anteil</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Direkter PV-Strom</h4>
              <p className="text-xs text-slate-400 mt-0.5">Ersetzt Netzbezug bei Sonnenschein</p>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatNumber(co2PvDirect, 0)} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pctDirect}%` }} />
            </div>
          </div>

          {/* 2. PV-Stromspeicher */}
          <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-indigo-500">{pctBattery}% Anteil</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">PV-Stromspeicher</h4>
              <p className="text-xs text-slate-400 mt-0.5">Verschiebt Sonnenstrom in die Nacht</p>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatNumber(co2PvBattery, 0)} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pctBattery}%` }} />
            </div>
          </div>

          {/* 3. Netzeinspeisung */}
          <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-cyan-500">{pctExport}% Anteil</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Netzeinspeisung</h4>
              <p className="text-xs text-slate-400 mt-0.5">Verdrängt Kohlestrom im Netz</p>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatNumber(co2PvExport, 0)} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${pctExport}%` }} />
            </div>
          </div>

          {/* 4. Wärmepumpe */}
          <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-orange-500">{pctHeatPump}% Anteil</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Wärmepumpe vs. Gas/Öl</h4>
              <p className="text-xs text-slate-400 mt-0.5">Effiziente Umweltwärme</p>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatNumber(co2HeatPump, 0)} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full" style={{ width: `${pctHeatPump}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Plastische Vergleiche & Langzeit-Klimaauswirkung */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anschauliche Vergleiche */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Was bedeuten {formatNumber(summary.totalCo2SavedTons, 2)} Tonnen CO₂ konkret?
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Trees className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Ein Wald mit {treeCount} Buchen
                </span>
                <p className="text-xs text-slate-400">
                  müsste ein ganzes Jahr lang wachsen, um die gleiche Menge CO₂ aus der Luft zu filtern.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatNumber(carKm, 0)} Kilometer Autofahrt
                </span>
                <p className="text-xs text-slate-400">
                  mit einem herkömmlichen Benzin- oder Dieselfahrzeug wurden kompensiert ({formatNumber(carKm / 40075, 1)}x um die Erde).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {flightsMalle} Urlaubsflüge
                </span>
                <p className="text-xs text-slate-400">
                  von Frankfurt nach Mallorca (Hin- und Rückflug) an CO₂-Ausstoß eingespart.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Langzeitprognose (10 & 20 Jahre) */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Langzeit-Auswirkung (10 bis 20 Jahre)
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Basierend auf Ihrer aktuellen Jahresleistung spart Ihre Eigenheim-Technik über die typische Lebensdauer:
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Über 10 Jahre
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {formatNumber(tenYearsTons, 1)} t
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                entspricht ~{formatNumber(tenYearsTons * 50, 0)} Bäumen
              </p>
            </div>

            <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/20 text-center">
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Über 20 Jahre
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {formatNumber(twentyYearsTons, 1)} t
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Lebensdauer-Klimaschutz
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800">
            <strong>Klimainfo:</strong> Ein durchschnittlicher Bürger in Deutschland verursacht ca. 10,5 Tonnen CO₂ pro Jahr. Mit Ihrem energetisch optimierten Haus kompensieren Sie einen erheblichen Teil Ihres persönlichen Fußabdrucks direkt vor Ort.
          </div>
        </div>
      </div>
    </div>
  );
};
