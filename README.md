# 🚀 PlannerPioneer

**PlannerPioneer** ist ein modernes, leistungsstarkes Desktop-Tool für intelligentes Projekt- und Feature-Management. Entwickelt mit Fokus auf Performance, Übersichtlichkeit und lokale Datenhaltung, hilft es dir dabei, deine Projekte, Module und Features effizient zu planen, zu tracken und statistisch auszuwerten.

---

## ✨ Features

- **📊 Erweitertes Projekt- und Modulmanagement:** Behalte den kompletten Überblick über alle Projekte, Module und Features mit unserer interaktiven **Master-Tabelle** inklusive intelligenter Suche.
- **📈 Automatisierte Statistiken & Auswertungen:** Integrierte Berechnung von Projektlaufzeiten, Varianzen und Standardabweichungen direkt im Header!
- **🗺️ Interaktive Roadmaps:** Visualisiere Projektfortschritte und Ideen-Workflows mit animierten Timelines (Framer Motion).
- **🌍 Mehrsprachigkeit:** Vollständig lokalisiert in Deutsch und Englisch inklusive dynamischer Spracherkennung.
- **⚡ Local-First & Privacy:** Alle Daten werden blitzschnell und sicher in einer lokalen SQLite-Datenbank auf deinem Gerät gespeichert (via Kysely & Tauri SQL). Keine Cloud-Abhängigkeit!
- **🎨 Modernes UI/UX:** Atemberaubendes, flüssiges Design dank Material UI (MUI) und anpassbaren Themes.

## 🛠️ Tech Stack

Dieses Projekt nutzt modernste Frontend- und Desktop-Technologien, um eine echte native Erfahrung zu bieten:

- **Desktop-Rahmenwerk:** [Tauri 2.0](https://v2.tauri.app/) für extrem performante, plattformübergreifende Desktop-Apps.
- **Frontend:** [React 19](https://react.dev/) gebündelt mit [Vite](https://vitejs.dev/) & stark typisiert mit [TypeScript](https://www.typescriptlang.org/).
- **UI & Komponenten:** [Material UI (MUI) v7](https://mui.com/) & [Material React Table](https://www.material-react-table.com/) für komplexe Datenstrukturen.
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) für leichtgewichtigen, globalen State.
- **Datenbank & ORM:** [Kysely](https://kysely.dev/) für typsichere lokale Datenbankabfragen.
- **Animationen:** [Framer Motion](https://www.framer.com/motion/).
- **Internationalisierung (i18n):** [react-i18next](https://react.i18next.com/).

## 🚀 Erste Schritte (Getting Started)

Um das Projekt lokal auszuführen und daran mitzuentwickeln, befolge diese einfachen Schritte:

### Voraussetzungen
- [Node.js](https://nodejs.org/) (Empfohlen: Aktuelle LTS-Version)
- [Rust](https://www.rust-lang.org/) (Für das performante Tauri Backend)

### Installation

1. **Repository klonen**
   ```bash
   git clone <deine-repo-url>
   cd PlannerPioneer
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **Entwicklungsumgebung starten**
   Dies startet den Vite Dev-Server und öffnet das native Tauri-Fenster:
   ```bash
   npm run tauri dev
   ```

## 📦 Build für die Produktion

Um eine ausführbare Binärdatei (App-Bundle, `.exe`, `.deb` etc.) für dein aktuelles Betriebssystem zu erstellen:

```bash
npm run tauri build
```

Die fertigen, optimierten Binaries findest du anschließend im Verzeichnis `src-tauri/target/release`.

## 📸 Screenshots
*(Füge hier ein paar coole Screenshots der MasterTable oder der Roadmap-Ansicht ein, um das Projekt noch besser in Szene zu setzen!)*

---
*Entwickelt mit ❤️ und bereit, das Planen auf das nächste Level zu heben.*
