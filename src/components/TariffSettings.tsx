import React, { useState } from 'react';
import { TariffConfig } from '../types';
import { DEFAULT_TARIFF } from '../utils/calculations';
import { 
  Zap, 
  Sun, 
  Flame, 
  Droplet, 
  Leaf, 
  Save, 
  RotateCcw, 
  Check, 
  HelpCircle,
  PiggyBank,
  Percent,
  Sliders
} from 'lucide-react';

interface TariffSettingsProps {
  tariff: TariffConfig;
  onSaveTariff: (tariff: TariffConfig) => void;
}

export const TariffSettings: React.FC<TariffSettingsProps> = ({ tariff, onSaveTariff }) => {
  const [formData, setFormData] = useState<TariffConfig>({ ...tariff });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (key: keyof TariffConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    if (window.confirm('Möchten Sie die Tarife wirklich auf die Standardwerte zurücksetzen?')) {
      setFormData({ ...DEFAULT_TARIFF });
      onSaveTariff(DEFAULT_TARIFF);
      triggerSuccess();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTariff(formData);
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Tarife, Kosten & Umweltfaktoren
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Konfigurieren Sie Ihre individuellen Strompreise, Einspeisevergütung, Wärmepumpen- und Wassertarife sowie CO₂-Faktoren
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Standardwerte</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Stromtarif & Photovoltaik */}
        <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Stromtarif (Netzbezug) & Photovoltaik-Vergütung
              </h3>
              <p className="text-xs text-slate-400">
                Kosten für bezogenen Strom und Erlöse aus der Solar-Einspeisung nach EEG
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Arbeitspreis Netzbezug (Cent / kWh) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.electricityWorkingPrice}
                  onChange={(e) => handleChange('electricityWorkingPrice', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">Ct/kWh</span>
              </div>
              <span className="text-[11px] text-slate-400">Aktueller Haushaltsstrompreis</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Grundpreis Strom (€ / Monat) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.electricityBasePrice}
                  onChange={(e) => handleChange('electricityBasePrice', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">€/Mo</span>
              </div>
              <span className="text-[11px] text-slate-400">Zählermiete & Grundgebühr</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PV-Einspeisevergütung (Cent / kWh) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.pvFeedInTariff}
                  onChange={(e) => handleChange('pvFeedInTariff', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">Ct/kWh</span>
              </div>
              <span className="text-[11px] text-slate-400">z.B. 8,11 Ct nach EEG</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                MwSt.-Satz (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={formData.taxRate}
                  onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 19)}
                  className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
              </div>
              <span className="text-[11px] text-slate-400">Standard 19%</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Zusätzliche Netzentgelte/Abgaben (Cent/kWh)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={formData.gridFeeAddon}
                  onChange={(e) => handleChange('gridFeeAddon', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">Ct/kWh</span>
              </div>
              <span className="text-[11px] text-slate-400">Falls nicht im Arbeitspreis inkludiert</span>
            </div>
          </div>
        </div>

        {/* 2. Wärmepumpentarif */}
        <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Wärmepumpentarif (Heizstrom)
                </h3>
                <p className="text-xs text-slate-400">
                  Separater Zähler & Heizstromtarif oder Nutzung des Hauptstromtarifs
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 hidden sm:inline">
                Separater WP-Tarif
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.separateHeatPumpTariff}
                  onChange={(e) => handleChange('separateHeatPumpTariff', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </div>
            </label>
          </div>

          {formData.separateHeatPumpTariff ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Arbeitspreis Wärmepumpe (Cent / kWh) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.heatPumpWorkingPrice}
                    onChange={(e) => handleChange('heatPumpWorkingPrice', parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">Ct/kWh</span>
                </div>
                <span className="text-[11px] text-slate-400">Vergünstigter Heizstrom</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Grundpreis Wärmepumpenzähler (€ / Monat) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.heatPumpBasePrice}
                    onChange={(e) => handleChange('heatPumpBasePrice', parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">€/Mo</span>
                </div>
                <span className="text-[11px] text-slate-400">Zählermiete separater Rundsteuerempfänger</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg">
              Die Wärmepumpe läuft über den regulären Haushaltsstromanschluss mit dem allgemeinen Arbeitspreis von {formData.electricityWorkingPrice} Cent/kWh.
            </p>
          )}
        </div>

        {/* 3. Wasser & Abwasser */}
        <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Wasser- & Kanalgebühren
              </h3>
              <p className="text-xs text-slate-400">
                Kommunale Tarife für Frischwasserbezug und Schmutzwasserentsorgung
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trinkwasserpreis (€ / m³) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.waterPricePerM3}
                  onChange={(e) => handleChange('waterPricePerM3', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">€/m³</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kanal- / Abwasserpreis (€ / m³) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.sewagePricePerM3}
                  onChange={(e) => handleChange('sewagePricePerM3', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">€/m³</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Grundgebühr Wasser/Kanal (€ / Monat) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.waterBasePricePerMonth}
                  onChange={(e) => handleChange('waterBasePricePerMonth', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">€/Mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. CO₂-Emissionsfaktoren & Umwelt */}
        <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                CO₂-Emissionsfaktoren (Ökobilanz)
              </h3>
              <p className="text-xs text-slate-400">
                Faktoren zur automatischen Berechnung der vermiedenen Emissionen durch PV und Wärmepumpe
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Netzstrom CO₂-Faktor (g CO₂ / kWh) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  required
                  value={formData.gridCo2Factor}
                  onChange={(e) => handleChange('gridCo2Factor', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-12 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">g/kWh</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Bundesstrommix Deutschland (UBA-Referenzwert: ca. 380 g/kWh)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Referenz Heizung fossiler Brennstoff (g CO₂ / kWh Wärme) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  required
                  value={formData.heatingReferenceCo2Factor}
                  onChange={(e) => handleChange('heatingReferenceCo2Factor', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-12 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">g/kWh</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Erdgas ~240 g/kWh, Heizöl ~280 g/kWh
              </span>
            </div>
          </div>
        </div>

        {/* 5. Abschlagszahlungen & Umlage */}
        <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monatliche Abschlagszahlungen (Soll/Ist-Vergleich)
              </h3>
              <p className="text-xs text-slate-400">
                Vergleichen Sie die realen Kosten mit den an die Stadtwerke / Versorger gezahlten monatlichen Abschlägen
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monatlicher Strom-Abschlag (€ / Monat) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  required
                  value={formData.monthlyInstallmentElectricity}
                  onChange={(e) => handleChange('monthlyInstallmentElectricity', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">€/Mo</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monatlicher Wasser/Abwasser-Abschlag (€ / Monat) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  required
                  value={formData.monthlyInstallmentWater}
                  onChange={(e) => handleChange('monthlyInstallmentWater', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">€/Mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="text-xs text-slate-500">
            Alle Berechnungen im Dashboard und in den Charts werden sofort mit diesen Parametern neu kalkuliert.
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 animate-pulse">
                <Check className="w-4 h-4" /> Tarife erfolgreich gespeichert!
              </span>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Einstellungen speichern</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
