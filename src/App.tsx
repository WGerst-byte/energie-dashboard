import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { Charts } from './components/Charts';
import { ReadingModal } from './components/ReadingModal';
import { ReadingForm } from './components/ReadingForm';
import { HistoryTable } from './components/HistoryTable';
import { TariffSettings } from './components/TariffSettings';
import { Co2EcologicalView } from './components/Co2EcologicalView';

import { MeterReading, TariffConfig } from './types';
import { 
  loadReadings, 
  saveReadings, 
  loadTariff, 
  saveTariff 
} from './utils/storage';
import { 
  calculateConsumptionPeriods, 
  calculateDashboardSummary, 
  formatCurrency, 
  formatNumber, 
  formatDate,
  DEFAULT_TARIFF
} from './utils/calculations';
import { INITIAL_READINGS } from './data/mockData';
import { 
  PlusCircle, 
  Sun, 
  BatteryCharging, 
  Flame, 
  Droplet, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export function App() {
  const [readings, setReadings] = useState<MeterReading[]>(() => loadReadings());
  const [tariff, setTariff] = useState<TariffConfig>(() => loadTariff());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<MeterReading | null>(null);

  // Sync dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist readings and tariff
  const handleUpdateReadings = (newReadings: MeterReading[]) => {
    setReadings(newReadings);
    saveReadings(newReadings);
  };

  const handleUpdateTariff = (newTariff: TariffConfig) => {
    setTariff(newTariff);
    saveTariff(newTariff);
  };

  // Verfügbare Jahre ermitteln
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    readings.forEach((r) => {
      if (r.date) {
        const y = r.date.split('-')[0];
        if (y) years.add(y);
      }
    });
    return Array.from(years).sort().reverse();
  }, [readings]);

  // Gefilterte Ablesungen
  const filteredReadings = useMemo(() => {
    if (selectedYear === 'ALL') return readings;
    // Wenn ein Jahr gefiltert wird: Wir brauchen auch den letzten Stand des Vorjahres für das 1. Intervall
    const sorted = [...readings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted.filter((r) => {
      const y = r.date.split('-')[0];
      return y === selectedYear;
    });
  }, [readings, selectedYear]);

  // Berechnete Verbrauchsperioden
  const periods = useMemo(() => {
    return calculateConsumptionPeriods(filteredReadings, tariff);
  }, [filteredReadings, tariff]);

  // Berechnete Zusammenfassung
  const summary = useMemo(() => {
    return calculateDashboardSummary(periods, tariff);
  }, [periods, tariff]);

  // Letzte Ablesung (für Referenzwerte in der Eingabemaske)
  const lastReading = useMemo(() => {
    if (readings.length === 0) return null;
    return [...readings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }, [readings]);

  // Neueste Periode
  const latestPeriod = periods.length > 0 ? periods[periods.length - 1] : undefined;

  // CRUD Handlers
  const handleSaveReading = (reading: MeterReading) => {
    const exists = readings.some((r) => r.id === reading.id);
    let updated: MeterReading[];
    if (exists) {
      updated = readings.map((r) => (r.id === reading.id ? reading : r));
    } else {
      updated = [...readings, reading];
    }
    handleUpdateReadings(updated);
    setEditingReading(null);
  };

  const handleDeleteReading = (id: string) => {
    const updated = readings.filter((r) => r.id !== id);
    handleUpdateReadings(updated);
  };

  const handleResetToDemo = () => {
    if (window.confirm('Möchten Sie die Datenbank wirklich auf die realistischen Demo-Jahresdaten 2024 zurücksetzen?')) {
      handleUpdateReadings(INITIAL_READINGS);
      handleUpdateTariff(DEFAULT_TARIFF);
    }
  };

  const handleOpenEdit = (reading: MeterReading) => {
    setEditingReading(reading);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingReading(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenNewReading={handleOpenNew}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        availableYears={availableYears}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 1. DASHBOARD VIEW */}
        {currentTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Period Alert Bar if filtered */}
            {selectedYear !== 'ALL' && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium flex items-center justify-between">
                <span>Aktive Ansicht gefiltert auf das Jahr {selectedYear}.</span>
                <button
                  onClick={() => setSelectedYear('ALL')}
                  className="underline font-bold hover:text-emerald-500"
                >
                  Gesamten Zeitraum anzeigen
                </button>
              </div>
            )}

            {/* KPI Cards */}
            <KpiCards summary={summary} latestPeriod={latestPeriod} />

            {/* Interactive Charts */}
            <Charts
              periods={periods}
              summary={summary}
              tariff={tariff}
              darkMode={darkMode}
            />

            {/* Quick Actions / Recent Snapshot Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Snapshot letzte Ablesung */}
              <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Letzte Ablesung
                  </span>
                  <span className="text-xs text-slate-500">
                    {lastReading ? formatDate(lastReading.date) : '-'}
                  </span>
                </div>
                {lastReading ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Netzbezug Zähler:</span>
                      <span className="font-semibold">{formatNumber(lastReading.gridImport, 1)} kWh</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">PV-Erzeugung Zähler:</span>
                      <span className="font-semibold text-amber-500">{formatNumber(lastReading.pvGeneration, 1)} kWh</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Speicher Ladezustand:</span>
                      <span className="font-semibold text-indigo-500">{lastReading.batterySoc}% SoC</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Wasserzähler:</span>
                      <span className="font-semibold text-cyan-500">{formatNumber(lastReading.waterReading, 3)} m³</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Keine Daten vorhanden.</p>
                )}
                <button
                  onClick={handleOpenNew}
                  className="w-full mt-2 py-2 text-xs font-bold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
                >
                  Neue Ablesung durchführen
                </button>
              </div>

              {/* Autarkie & Energietipps */}
              <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    System-Gesundheit & Autarkie
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ihr Eigenheim erzielte eine durchschnittliche <strong>Autarkiequote von {formatNumber(summary.overallAutarkyPct, 1)}%</strong>. Der Batteriespeicher arbeitet mit einem Wirkungsgrad von <strong>{formatNumber(summary.avgBatteryEfficiencyPct, 1)}%</strong> im optimalen Betriebsbereich.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setCurrentTab('ecology')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>CO₂-Bilanz & Umweltanalyse ansehen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Kosten-Saldo */}
              <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Jahresprognose
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(summary.projectedYearlyCost)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Erwartete Gesamt-Energiekosten für 12 Monate basierend auf bisherigem Verbrauchsverhalten.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setCurrentTab('tariffs')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Tarif- & Abschlags-Einstellungen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ERFASSUNG TAB (Vollseite) */}
        {currentTab === 'entry' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Zählerstände erfassen
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Tragen Sie Ihre Zählerablesung für Strom, PV, Speicher, Wärmepumpe und Wasser ein
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <ReadingForm
                lastReading={lastReading}
                tariff={tariff}
                onSave={(newReading) => {
                  handleSaveReading(newReading);
                  setCurrentTab('dashboard');
                }}
              />
            </div>
          </div>
        )}

        {/* 3. HISTORIE & EXPORT TAB */}
        {currentTab === 'history' && (
          <div className="animate-fadeIn">
            <HistoryTable
              readings={readings}
              periods={periods}
              tariff={tariff}
              onEditReading={handleOpenEdit}
              onDeleteReading={handleDeleteReading}
              onImportReadings={handleUpdateReadings}
              onResetToDemo={handleResetToDemo}
              onOpenNew={handleOpenNew}
            />
          </div>
        )}

        {/* 4. TARIFE & KOSTEN TAB */}
        {currentTab === 'tariffs' && (
          <div className="animate-fadeIn">
            <TariffSettings
              tariff={tariff}
              onSaveTariff={handleUpdateTariff}
            />
          </div>
        )}

        {/* 5. CO₂ & UMWELT TAB */}
        {currentTab === 'ecology' && (
          <div className="animate-fadeIn">
            <Co2EcologicalView
              summary={summary}
              periods={periods}
              tariff={tariff}
            />
          </div>
        )}
      </main>

      {/* Reading Modal (für Schnell-Erfassung von überall) */}
      <ReadingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReading(null);
        }}
        onSave={handleSaveReading}
        initialData={editingReading}
        lastReading={lastReading}
        tariff={tariff}
      />
    </div>
  );
}

export default App;
