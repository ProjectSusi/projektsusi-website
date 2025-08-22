# Web-Interface Navigation & Funktionen

## Übersicht

Das ProjectSusi Web-Interface ist darauf ausgelegt, eine intuitive und effiziente Bedienung zu ermöglichen. Diese Anleitung führt Sie durch alle Bereiche der Benutzeroberfläche und erklärt die verfügbaren Funktionen im Detail.

## Hauptbereiche der Benutzeroberfläche

### 1. Header-Navigation

Der obere Bereich enthält die wichtigsten Navigationselemente:

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] ProjectSusi    [Upload] [Settings] [Help] [Status] │
└─────────────────────────────────────────────────────────────┘
```

**Header-Komponenten:**
- **Logo**: Zurück zur Startseite
- **Upload-Button**: Schneller Dokumentenupload
- **Einstellungen**: Modell- und Systemkonfiguration
- **Hilfe**: Dokumentation und Support
- **Status-Indikator**: Ollama-Verbindung und Systemstatus

### 2. Hauptarbeitsbereich

Der zentrale Bereich ist in drei Hauptsektionen unterteilt:

#### Dokumenten-Panel (Links)
```
┌─────────────────────┐
│ 📁 Meine Dokumente  │
│ ├─ Verträge (3)     │
│ ├─ Handbücher (7)   │
│ ├─ Berichte (12)    │
│ └─ Sonstiges (5)    │
│                     │
│ [+ Dokument hochladen] │
│ [🔍 In Dokumenten suchen] │
└─────────────────────┘
```

**Funktionen:**
- Hierarchische Dokumentenansicht
- Kategorisierung und Filterung
- Schnellsuche in Dokumentennamen
- Drag & Drop Upload-Bereich

#### Abfrage-Zentrum (Mitte)
```
┌─────────────────────────────────────────┐
│ Ihre Frage an ProjectSusi:              │
│ ┌─────────────────────────────────────┐ │
│ │ Was sind die Hauptpunkte des...     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ [🎤] [📎] [⚙️] [📤 Frage stellen]      │
│                                         │
│ 💬 Vorherige Konversationen:           │
│ ├─ "Vertragsdetails Firma XY" (heute)  │
│ ├─ "Technische Spezifikationen" (gestern) │
│ └─ "Compliance-Richtlinien" (2 Tage)   │
└─────────────────────────────────────────┘
```

**Eingabeoptionen:**
- **Texteingabe**: Direkte Frageneingabe
- **Spracheingabe**: Voice-to-Text Funktion
- **Datei-Anhang**: Dokumente zur spezifischen Abfrage
- **Erweiterte Optionen**: Modell- und Parametereinstellungen

#### Antwort-Bereich (Rechts)
```
┌─────────────────────────────────────────┐
│ 🤖 ProjectSusi antwortet:               │
│                                         │
│ Die Hauptpunkte des Vertrags sind:     │
│ 1. Leistungsumfang (Seite 2, Zeile 15) │
│ 2. Vergütung (Seite 3, Zeile 8)        │
│ 3. Laufzeit (Seite 4, Zeile 22)        │
│                                         │
│ 📄 Quellen:                            │
│ • Servicevertrag_XY.pdf (Seiten 2-4)   │
│ • Anlage_A_Spezifikationen.docx        │
│                                         │
│ 📊 Vertrauen: 95% | ⏱️ 2.3s           │
│ [👍] [👎] [📋 Kopieren] [🔗 Teilen]    │
└─────────────────────────────────────────┘
```

### 3. Footer-Bereich

Der untere Bereich zeigt wichtige Systeminformationen:

```
┌─────────────────────────────────────────────────────────────┐
│ 🟢 Ollama: llama3.1:8b | 📊 RAM: 8.2/16GB | 📁 Docs: 127 │
│ ⚡ Letzte Abfrage: 2.3s | 🔒 Lokale Verarbeitung          │
└─────────────────────────────────────────────────────────────┘
```

## Detaillierte Funktionsbeschreibungen

### 1. Dokumentenmanagement

#### Upload-Funktionen

**Standard-Upload:**
1. Klicken Sie auf "Dokument hochladen"
2. Wählen Sie Dateien aus (PDF, DOCX, TXT, MD)
3. Optional: Kategorisierung festlegen
4. Warten Sie auf die Verarbeitungsbestätigung

**Drag & Drop:**
```
┌─────────────────────────────────────┐
│     📁 Dateien hier ablegen         │
│                                     │
│   Unterstützte Formate:             │
│   PDF, DOCX, TXT, Markdown          │
│   Maximale Größe: 50 MB             │
└─────────────────────────────────────┘
```

**Batch-Upload:**
- Mehrere Dateien gleichzeitig auswählen
- Automatische Kategorisierung nach Dateinamen
- Fortschrittsanzeige für jeden Upload

#### Dokumentenorganisation

**Kategorien erstellen:**
```javascript
// Beispiel-Kategoriestruktur
{
  "Rechtsdokumente": {
    "Verträge": ["pdf", "docx"],
    "Compliance": ["pdf", "txt"],
    "Richtlinien": ["pdf", "md"]
  },
  "Technische_Dokumentation": {
    "Handbücher": ["pdf", "docx"],
    "Spezifikationen": ["txt", "md"],
    "API_Docs": ["md", "txt"]
  }
}
```

**Filter und Suche:**
- **Volltextsuche**: Suche in Dokumenteninhalten
- **Metadaten-Filter**: Nach Autor, Datum, Größe
- **Tag-System**: Benutzerdefinierte Schlagwörter

### 2. Abfrage-Interface

#### Frageformulierung

**Effektive Fragetypen:**

1. **Faktenfragen:**
   ```
   "Was ist der Kündigungstermin in Vertrag ABC?"
   "Welche technischen Anforderungen sind definiert?"
   ```

2. **Analytische Fragen:**
   ```
   "Welche Unterschiede gibt es zwischen Vertrag A und B?"
   "Wie haben sich die Anforderungen über die Zeit verändert?"
   ```

3. **Zusammenfassungsfragen:**
   ```
   "Fasse die wichtigsten Punkte des Handbuchs zusammen"
   "Was sind die Kernrisiken in der Compliance-Dokumentation?"
   ```

#### Erweiterte Abfrageoptionen

**Kontext-Einstellungen:**
```
┌─────────────────────────────────────┐
│ ⚙️ Erweiterte Optionen              │
│                                     │
│ 🎯 Fokus:                          │
│ ○ Alle Dokumente                   │
│ ● Nur aktuelle Kategorie           │
│ ○ Ausgewählte Dokumente            │
│                                     │
│ 🧠 Modell:                         │
│ ● llama3.1:8b (Standard)          │
│ ○ mixtral:8x7b (Präzise)          │
│ ○ gemma:7b (Schnell)              │
│                                     │
│ 📏 Antwortlänge:                   │
│ ○ Kurz (1-2 Sätze)                │
│ ● Mittel (1 Absatz)               │
│ ○ Ausführlich (mehrere Absätze)   │
│                                     │
│ 🔍 Quellendetails:                 │
│ ☑ Seitenzahlen anzeigen           │
│ ☑ Relevante Textpassagen          │
│ ☑ Vertrauenswerte                 │
└─────────────────────────────────────┘
```

### 3. Antwort-Interpretation

#### Quellenangaben verstehen

**Format der Quellenangaben:**
```
Beispiel-Antwort:
"Die Kündigungsfrist beträgt 3 Monate zum Quartalsende (Seite 15, Zeile 8-10).
Bei außerordentlicher Kündigung gelten besondere Regelungen (Seite 16, Abschnitt 4.2)."

Quellen:
📄 Mustervertrag_2025.pdf
   ├─ Seite 15, Zeilen 8-10 (Vertrauen: 98%)
   └─ Seite 16, Abschnitt 4.2 (Vertrauen: 95%)
```

**Vertrauenswerte interpretieren:**
- **95-100%**: Hochpräzise, direkter Textbezug
- **85-94%**: Sehr gut, semantische Übereinstimmung
- **70-84%**: Gut, kontextuelle Ableitung
- **50-69%**: Akzeptabel, aber Verifikation empfohlen
- **<50%**: Unsicher, manuelle Prüfung erforderlich

#### Interaktive Quellenverweise

**Klickbare Quellenlinks:**
```html
<!-- Beispiel für interaktive Quellenverlinkung -->
<div class="source-reference">
  <span class="document-name">Vertrag_ABC.pdf</span>
  <a href="#page-15" class="page-link">Seite 15</a>
  <span class="confidence">Vertrauen: 98%</span>
  <button class="view-context">Kontext anzeigen</button>
</div>
```

**Kontext-Preview:**
Bei Klick auf Quellenverweise öffnet sich ein Overlay:
```
┌─────────────────────────────────────┐
│ 📄 Vertrag_ABC.pdf - Seite 15      │
│ ─────────────────────────────────── │
│                                     │
│ ...text davor...                    │
│                                     │
│ ▶ Die Kündigungsfrist beträgt       │
│   drei (3) Monate zum jeweiligen    │
│   Quartalsende. Eine Kündigung      │
│   ist nur schriftlich wirksam.      │
│                                     │
│ ...text danach...                   │
│                                     │
│ [Vollständige Seite] [Schließen]    │
└─────────────────────────────────────┘
```

### 4. Konversationsmanagement

#### Gesprächsverlauf

**Chronologische Ansicht:**
```
┌─────────────────────────────────────┐
│ 📅 Heute, 14:23                    │
│ 👤 "Was sind die Zahlungsbedingungen?" │
│ 🤖 "Die Zahlungsfrist beträgt 30 Tage..." │
│                                     │
│ 📅 Heute, 14:25                    │
│ 👤 "Gibt es Skonto-Möglichkeiten?"    │
│ 🤖 "Bei Zahlung binnen 10 Tagen..."   │
│                                     │
│ 📅 Heute, 14:28                    │
│ 👤 "Wie hoch ist der Skonto-Satz?"    │
│ 🤖 "Der Skonto beträgt 2% (Seite 8)..." │
└─────────────────────────────────────┘
```

**Konversations-Features:**
- **Kontext-Erhaltung**: Folge-Fragen beziehen sich auf vorherige Antworten
- **Thread-Verwaltung**: Gespräche können benannt und gespeichert werden
- **Export-Funktion**: Konversationen als PDF oder Markdown exportieren
- **Favoriten**: Wichtige Antworten markieren und sammeln

#### Session-Management

**Aktive Sessions:**
```
┌─────────────────────────────────────┐
│ 🔄 Aktuelle Sitzungen:              │
│                                     │
│ • Vertragsanalyse Kunde X (aktiv)  │
│   └─ 8 Fragen, letzte: 14:28       │
│                                     │
│ • Compliance-Prüfung (pausiert)    │
│   └─ 12 Fragen, letzte: 12:45      │
│                                     │
│ • Technische Spezifikation         │
│   └─ 5 Fragen, letzte: gestern     │
│                                     │
│ [Neue Sitzung] [Archiv]            │
└─────────────────────────────────────┘
```

### 5. Anpassung und Personalisierung

#### Benutzereinstellungen

**Interface-Anpassungen:**
```json
{
  "display": {
    "theme": "light|dark|auto",
    "language": "de|en",
    "fontSize": "small|medium|large",
    "compactMode": true|false
  },
  "behavior": {
    "autoSave": true,
    "confirmBeforeDelete": true,
    "defaultModel": "llama3.1:8b",
    "maxResults": 10
  },
  "privacy": {
    "storeConversations": true,
    "anonymizeExports": false,
    "logLevel": "info"
  }
}
```

#### Tastaturkürzel

**Wichtige Shortcuts:**
- `Ctrl + U`: Dokumentenupload
- `Ctrl + F`: Suche in Dokumenten
- `Ctrl + Enter`: Frage stellen
- `Ctrl + L`: Neue Konversation
- `Ctrl + S`: Session speichern
- `Ctrl + E`: Einstellungen öffnen
- `F1`: Hilfe anzeigen
- `Esc`: Aktuelle Aktion abbrechen

### 6. Mobile Responsivität

#### Smartphone-Ansicht

**Angepasstes Layout:**
```
┌─────────────────┐
│ ☰ ProjectSusi   │
├─────────────────┤
│ 🔍 Suche...     │
├─────────────────┤
│ 📁 Dokumente    │
│ ├─ Verträge (3) │
│ └─ Berichte (7) │
├─────────────────┤
│ Ihre Frage:     │
│ ┌─────────────┐ │
│ │             │ │
│ └─────────────┘ │
│ [🎤] [📤]      │
├─────────────────┤
│ 🤖 Antwort...   │
└─────────────────┘
```

**Touch-Optimierungen:**
- Große Schaltflächen für Fingersteuerung
- Swipe-Gesten für Navigation
- Optimierte Scrolling-Performance
- Automatische Bildschirmtastatur-Anpassung

## Navigation-Tipps und Best Practices

### 1. Effiziente Arbeitsabläufe

**Dokumentenbasierter Workflow:**
1. Dokumente nach Projekten organisieren
2. Relevante Kategorien verwenden
3. Beschreibende Dateinamen wählen
4. Regelmäßige Archivierung alter Dokumente

**Abfrage-Strategien:**
1. Mit allgemeinen Fragen beginnen
2. Spezifische Nachfragen stellen
3. Kontext aus vorherigen Antworten nutzen
4. Quellenverweise aktiv verfolgen

### 2. Produktivitäts-Features

**Bulk-Operationen:**
```javascript
// Beispiel für Mehrfachaktionen
const bulkActions = {
  "selectAll": "Ctrl + A",
  "deleteSelected": "Delete",
  "moveToCategory": "Ctrl + M",
  "exportSelected": "Ctrl + E",
  "tagSelected": "Ctrl + T"
};
```

**Vorlagen und Snippets:**
```
Häufige Fragenmuster:
• "Zusammenfassung von [Dokument]"
• "Unterschiede zwischen [Doc A] und [Doc B]"
• "Alle Termine in [Zeitraum]"
• "Risiken und Chancen in [Projekt]"
```

Das Web-Interface von ProjectSusi ist darauf ausgelegt, sowohl für Gelegenheitsnutzer als auch für Power-User optimale Bedienbarkeit zu bieten. Fahren Sie mit dem nächsten Abschnitt über Abfrage-Best-Practices fort.