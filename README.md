# 🏡 EcoHome | Eigenheim Energie- & Verbrauchs-Dashboard

Eine moderne, responsive Web-Anwendung zur Erfassung, Verwaltung, Tarifberechnung und grafischen Auswertung sämtlicher Energie- und Verbrauchsdaten Ihres Eigenheims.

---

## ⚡ Kernfunktionen & Module

### 1. Zählerstandserfassung (Eingabemaske)
- **Stromzähler (Hausanschluss):** Bezug (1.8.0 in kWh) & Einspeisung (2.8.0 in kWh).
- **Photovoltaikanlage (PV):** Erzeugung (kWh), Eigenverbrauch (kWh), Einspeisung (kWh).
- **PV-Stromspeicher (NEU):**
  - Speicherladung / Import in den Akku (kWh)
  - Speicherentladung / Export aus dem Akku (kWh)
  - Ladezustand (SoC in %) zum Ablesezeitpunkt
  - Speicherkapazität (kWh) für Wirkungsgrad- und Zyklenauswertungen
- **Wärmepumpe:** Stromverbrauch (kWh) und erzeugte Nutzwärme/Kälte (kWh für JAZ).
- **Kaltwasserzähler:** Zählerstand (m³).
- **Live-Delta-Vorschau:** Sofortiges Feedback bei der Eingabe (Verbrauch seit letztem Stand, berechnete JAZ, Speicherwirkungsgrad, Plausibilitätswarnungen).

### 2. Tarif- & Kostenverwaltung
- **Strom & PV:**
  - Arbeitspreis (Cent/kWh) & Grundpreis (€/Monat)
  - EEG-Einspeisevergütung (Cent/kWh)
  - MwSt.-Satz & optionale Netzentgelt-Umlagen
  - Berechnung von Autarkiegrad (%) und Eigenverbrauchsanteil (%)
  - Speicher-Wirkungsgradverluste
- **Wärmepumpe:**
  - Separater Wärmepumpentarif (Arbeitspreis & Zähler-Grundpreis) oder Kopplung an den Haupttarif
  - Fortlaufende Berechnung der Jahresarbeitszahl (JAZ = Wärmemenge / Strombedarf)
- **Wasser & Abwasser:**
  - Trinkwasserpreis (€/m³), Kanalgebühren (€/m³), Grundgebühren (€/Monat)
- **CO₂-Einsparungsberechnung (Ökobilanz):**
  - Konfigurierbarer CO₂-Emissionsfaktor für Netzstrom (z. B. 380 g/kWh Bundesmix)
  - Konfigurierbarer Referenz-Emissionsfaktor für alte Öl-/Gasheizung (z. B. 250 g/kWh)
  - Automatische Berechnung der vermiedenen Emissionen (in kg und t) mit anschaulichen Vergleichen (Bäume, PKW-Kilometer, Flüge).
- **Soll/Ist-Abschlagsabgleich:**
  - Gegenüberstellung der realen Energiekosten zu den monatlichen Abschlagszahlungen (Guthaben vs. Nachzahlung).

### 3. Visualisierung & Dashboard
- **KPI-Kacheln:** Gesamtkosten, Autarkiegrad, Speicher-Wirkungsgrad & SoC, Wärmepumpen-JAZ und CO₂-Banner.
- **Interaktive Charts (Chart.js):**
  1. *Energie- & Autarkieverlauf:* Stacked-Bar für Netzbezug, PV-Direkt und Speicherentladung + Autarkielinie.
  2. *PV-Erzeugungsbilanz:* Flussverteilung (Direktverbrauch vs. Speicherladung vs. Einspeisung).
  3. *Kostenaufschlüsselung:* Donut-Diagramm nach Strom, Wärmepumpe, Wasser und Grundgebühren.
  4. *Wärmepumpen-Effizienz:* Monatsverlauf von thermischer Energie, Antriebsstrom und JAZ.
  5. *CO₂-Einsparungsverlauf:* Monatliche und kumulierte Einsparung.
  6. *Wasserverbrauch:* Kubikmeter und Kostenverlauf.

### 4. Daten-Management & Historie
- **Lokale Persistenz:** LocalStorage mit sofort einsatzbereiten, realistischen 12-Monats-Demodaten für 2024.
- **CSV-Export & Import:** Kompatibel mit Excel und Tabellenkalkulationen (deutsch formatiert).
- **CRUD:** Zählerstände bearbeiten, löschen, neue Ablesungen hinzufügen, Filter nach Kalenderjahren.

---

## 🚀 Schnellanleitung (Starten)

1. Navigieren Sie in das Projektverzeichnis:
   ```bash
   cd energie-dashboard
   ```

2. Entwicklungs-Server starten:
   ```bash
   npm run dev
   ```

3. Öffnen Sie die angezeigte URL (standardmäßig `http://localhost:5173`) im Browser.

4. Produktions-Build erstellen:
   ```bash
   npm run build
   ```
