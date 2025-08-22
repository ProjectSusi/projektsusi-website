# Quelldokument-Interaktion & Navigation

## Einführung in die Quelldokument-Funktionen

ProjectSusi bietet umfassende Funktionen zur direkten Interaktion mit den zugrundeliegenden Quelldokumenten. Diese ermöglichen es, Antworten zu verifizieren, zusätzlichen Kontext zu erkunden und ein tieferes Verständnis der Dokumenteninhalte zu entwickeln.

## Integrierter Dokumentenviewer

### 1. Viewer-Interface

Der integrierte Dokumentenviewer öffnet sich automatisch bei Klick auf Quellenverweise:

```
┌─────────────────────────────────────────────────────────┐
│ 📄 Servicevertrag_ABC_2025.pdf | Seite 15 von 47       │
├─────────────────────────────────────────────────────────┤
│ [◀] [▶] [🔍+] [🔍-] [📏] [🎯] [💾] [🖨️] [✖]         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  § 4 Vertragslaufzeit und Kündigung                    │
│  ────────────────────────────────────                  │
│                                                         │
│  4.1 Der Vertrag läuft ab dem 01.01.2025 für eine     │
│  Dauer von 24 Monaten bis zum 31.12.2026.             │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║ 4.2 Die Kündigungsfrist beträgt drei (3) Monate  ║ │ <- Hervorgehoben
│  ║ zum jeweiligen Quartalsende. Eine Kündigung ist   ║ │
│  ║ nur in schriftlicher Form wirksam.                ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  4.3 Bei Nichteinhaltung der Kündigungsfrist          │
│  verlängert sich der Vertrag automatisch um...         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Navigationselemente

**Hauptnavigation:**
- **◀/▶**: Seitenweise Navigation
- **🔍+/🔍-**: Zoom-Kontrolle für bessere Lesbarkeit
- **📏**: Lineal für präzise Positionierung
- **🎯**: Sprung zu spezifischen Seitenzahlen
- **💾**: Dokument herunterladen
- **🖨️**: Druckfunktion
- **✖**: Viewer schließen

**Erweiterte Navigation:**
```
┌─────────────────────────────────────┐
│ 🧭 Schnellnavigation               │
│ ├─ Inhaltsverzeichnis              │
│ ├─ Kapitelübersicht                │
│ ├─ Seitensprung (Eingabe: ___)     │
│ ├─ Suche in Dokument               │
│ └─ Lesezeichen                     │
└─────────────────────────────────────┘
```

## Hervorhebung und Markierungen

### 1. Automatische Quellenmarkierung

ProjectSusi markiert automatisch die referenzierten Textpassagen:

**Farbcodierung:**
- 🟨 **Gelb**: Primäre Quellenreferenz (höchstes Vertrauen)
- 🟦 **Blau**: Sekundäre Referenz (unterstützende Information)
- 🟩 **Grün**: Kontext (umgebender relevanter Text)
- 🟥 **Rot**: Widersprüchliche Information (zur Überprüfung)

**Markierungsdetails:**
```
┌─────────────────────────────────────┐
│ Markierte Passage:                  │
│ ┌─────────────────────────────────┐ │
│ │ Die Kündigungsfrist beträgt     │ │ <- Gelb markiert
│ │ drei (3) Monate zum jeweiligen  │ │
│ │ Quartalsende.                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📊 Vertrauen: 98%                  │
│ 📍 Zeile 8-10 von 15               │
│ 🔗 Referenz aus Antwort #3         │
└─────────────────────────────────────┘
```

### 2. Manuelle Annotations-Funktionen

**Benutzermarkierungen:**
```javascript
const annotationTypes = {
  "wichtig": { color: "orange", icon: "⭐" },
  "frage": { color: "purple", icon: "❓" },
  "pruefen": { color: "red", icon: "⚠️" },
  "notiz": { color: "blue", icon: "📝" },
  "favorit": { color: "green", icon: "💚" }
};
```

**Annotation-Interface:**
```
Textstelle markieren → Rechtsklick → Optionen:
┌─────────────────────────────────────┐
│ 📝 Notiz hinzufügen                │
│ ⭐ Als wichtig markieren            │
│ ❓ Nachfrage erstellen              │
│ 📋 Text kopieren                   │
│ 🔗 Direktlink erstellen            │
│ 📤 Mit Team teilen                 │
└─────────────────────────────────────┘
```

## Kontextuelle Dokumentenanalyse

### 1. Intelligente Querverweise

**Automatische Verlinkung:**
ProjectSusi erkennt automatisch Bezüge zwischen Dokumentteilen:

```
§ 4.2 Kündigungsfristen
├─ Bezug zu § 2.1 "Vertragslaufzeit"          [Klick → Sprung]
├─ Verweis auf Anlage C "Kündigungsformular"  [Klick → Öffnen]
├─ Ergänzung in § 8.3 "Rechtsfolgen"         [Klick → Anzeigen]
└─ Ähnliche Regelung in anderen Verträgen     [Klick → Vergleich]
```

**Cross-Reference-Panel:**
```
┌─────────────────────────────────────┐
│ 🔗 Verwandte Inhalte               │
│                                     │
│ Im aktuellen Dokument:              │
│ • § 2.1 Vertragslaufzeit           │
│ • § 8.3 Rechtsfolgen               │
│ • Anlage C Kündigungsformular      │
│                                     │
│ In anderen Dokumenten:              │
│ • Rahmenvertrag_2024.pdf § 5.2     │
│ • AGB_Standard.docx Punkt 12       │
│ • Kündigungsrichtlinie.pdf S. 3    │
│                                     │
│ [Alle anzeigen] [Filter...]        │
└─────────────────────────────────────┘
```

### 2. Semantische Dokumentennavigation

**Themenbasierte Navigation:**
```
🏷️ Aktuelle Themen im Dokument:
├─ Vertragslaufzeit (7 Erwähnungen)
├─ Kündigungsregelungen (12 Erwähnungen)
├─ Zahlungsbedingungen (5 Erwähnungen)
├─ Gewährleistung (8 Erwähnungen)
└─ Haftungsausschluss (3 Erwähnungen)

Klick auf Thema → Alle relevanten Stellen anzeigen
```

## Multi-Dokument-Vergleich

### 1. Parallele Dokumentenansicht

**Splitscreen-Modus:**
```
┌─────────────────────┬─────────────────────┐
│ Vertrag_2024.pdf    │ Vertrag_2025.pdf    │
│ Seite 15            │ Seite 12            │
├─────────────────────┼─────────────────────┤
│ § 4.2 Kündigung:    │ § 4.2 Kündigung:    │
│ "6 Monate zum       │ "3 Monate zum       │ <- Unterschied markiert
│ Jahresende"         │ Quartalsende"       │
│                     │                     │
│ 🔍 Unterschied      │ 🔍 Unterschied      │
│ erkannt             │ erkannt             │
└─────────────────────┴─────────────────────┘
```

**Vergleichsfunktionen:**
- **Automatische Diff-Erkennung**: Änderungen werden farblich markiert
- **Synchrone Navigation**: Beide Dokumente bewegen sich parallel
- **Thematische Ausrichtung**: Ähnliche Abschnitte werden nebeneinander angezeigt

### 2. Änderungshistorie

**Versionsverfolgung:**
```
📊 Dokumentenhistorie: Servicevertrag

Version 1.0 (Jan 2024)  →  Version 2.0 (Jan 2025)
├─ § 4.2: "6 Monate" → "3 Monate" (Kündigungsfrist)
├─ § 6.1: "50.000 EUR" → "55.000 EUR" (Preisanpassung)
├─ § 8.3: Neue Klausel hinzugefügt (Datenschutz)
└─ Anlage B: Komplett überarbeitet

[Detailansicht] [Export als PDF] [Benachrichtigung]
```

## Erweiterte Suchfunktionen

### 1. Kontextuelle Dokumentensuche

**Suchinterface im Viewer:**
```
┌─────────────────────────────────────┐
│ 🔍 Suche in: Servicevertrag_ABC.pdf │
│ ┌─────────────────────────────────┐ │
│ │ Kündigungsfrist                 │ │
│ └─────────────────────────────────┘ │
│ [🎯 Exakt] [📝 Ähnlich] [🔤 Regex] │
│                                     │
│ Ergebnisse (3):                     │
│ ├─ Seite 15, Zeile 8: "Kündigungs..│
│ ├─ Seite 23, Zeile 15: "...frist...│
│ └─ Seite 31, Fußnote: "...Kündigung│
│                                     │
│ [Vorheriges] [Nächstes] [Alle]     │
└─────────────────────────────────────┘
```

**Erweiterte Suchoptionen:**
- **Fuzzy-Suche**: Findet ähnliche Begriffe und Schreibweisen
- **Regex-Unterstützung**: Komplexe Suchmuster für Profis
- **Themenclustering**: Gruppiert verwandte Suchergebnisse
- **Zeitliche Filterung**: Suche in bestimmten Dokumentbereichen

### 2. Intelligente Begriffssuche

**Synonyme und Varianten:**
```
Suchbegriff: "Kündigung"

Gefundene Varianten:
├─ Kündigung (7 Treffer)
├─ Beendigung (2 Treffer)  
├─ Auflösung (1 Treffer)
├─ Termination (3 Treffer - englische Passagen)
└─ Vertragsende (5 Treffer)

🧠 KI-Vorschlag: Auch nach "Widerruf" suchen?
```

## Export- und Sharing-Funktionen

### 1. Dokumentenexport

**Export-Optionen:**
```
┌─────────────────────────────────────┐
│ 📤 Export-Optionen                 │
│                                     │
│ 📄 PDF (mit Markierungen)          │
│ 📝 Word (editierbar)               │
│ 📊 Excel (Tabellendaten)           │
│ 🖼️ Bilder (Screenshots)            │
│ 🔗 Weblink (teilbar)               │
│                                     │
│ Umfang:                             │
│ ○ Aktueller Ausschnitt             │
│ ○ Markierte Bereiche               │
│ ● Gesamtes Dokument                │
│ ○ Benutzerdefiniert...             │
│                                     │
│ [Export starten] [Abbrechen]       │
└─────────────────────────────────────┘
```

### 2. Kollaborative Funktionen

**Team-Sharing:**
```
👥 Mit Team teilen:

Berechtigungen:
├─ 👀 Nur lesen
├─ 📝 Kommentieren
├─ ✏️ Annotationen hinzufügen
└─ 🔧 Vollzugriff

📧 E-Mail-Einladung:
"Max Mustermann möchte mit Ihnen das Dokument 
'Servicevertrag_ABC_2025.pdf' teilen.
Besonders relevant: Seite 15, § 4.2 Kündigungsregeln"

🔗 Direktlink: https://projektSusi.local/doc/abc123#page=15&line=8
```

## Mobile Dokumenteninteraktion

### 1. Touch-optimierte Bedienung

**Gestensteuerung:**
```
📱 Touch-Gesten:
├─ Einfacher Tap: Text auswählen
├─ Doppel-Tap: Zoom auf Bereich
├─ Pinch: Zoomen
├─ Swipe links/rechts: Seiten wechseln
├─ Swipe hoch/runter: Scrollen
├─ Langes Drücken: Kontextmenü
└─ Zwei-Finger-Tap: Markierungsmodus
```

**Mobile Anpassungen:**
- Große Schaltflächen für Fingersteuerung
- Optimierte Scrollgeschwindigkeit
- Automatische Textgröße bei Zoom
- Vereinfachtes Menüsystem

### 2. Offline-Funktionalität

**Offline-Viewer:**
```
🔄 Offline-Status: Verfügbar

Synchronisiert:
✓ Servicevertrag_ABC_2025.pdf (2.1 MB)
✓ Projektplan_Q1.docx (850 KB)
✓ Spezifikation_v2.txt (120 KB)

Funktionen offline:
✓ Dokumentenanzeige
✓ Suche in Dokumenten
✓ Markierungen hinzufügen
✓ Notizen erstellen
⏸ KI-Abfragen (bei Reconnect verfügbar)
```

## Accessibility und Barrierefreiheit

### 1. Screenreader-Unterstützung

**Strukturierte Navigation:**
```
📢 Screenreader-Ausgabe:
"Dokument: Servicevertrag ABC, Seite 15 von 47.
Überschrift Level 2: Paragraph 4 Punkt 2, Kündigungsregelungen.
Markierter Text: 'Die Kündigungsfrist beträgt drei Monate 
zum jeweiligen Quartalsende.'
Vertrauenswert: 98 Prozent.
Springe zu Quelle: Taste S drücken."
```

### 2. Barrierefreie Bedienung

**Tastaturkürzel:**
```
⌨️ Tastaturnavigation:
├─ Tab: Nächstes Element
├─ Shift+Tab: Vorheriges Element
├─ Enter: Aktivieren/Öffnen
├─ Esc: Schließen/Zurück
├─ Pfeiltasten: Dokumentnavigation
├─ Pos1/Ende: Seitenanfang/-ende
├─ Strg+F: Suche
├─ Strg+Plus/Minus: Zoom
└─ Alt+S: Zur Quelle springen
```

**Visuelle Anpassungen:**
- Hoher Kontrast für bessere Lesbarkeit
- Anpassbare Schriftgrößen
- Farbblindheit-freundliche Markierungen
- Reduzierte Bewegungen für Empfindliche

## Performance und Optimierung

### 1. Intelligentes Laden

**Progressive Loading:**
```
📊 Dokument-Loading:
├─ Seite 15: ████████████ 100% (aktuell)
├─ Seiten 14,16: ████████░░ 80% (Puffer)
├─ Seiten 10-20: ████░░░░░░ 40% (Umgebung)
├─ Inhaltsverzeichnis: ████████████ 100%
└─ Rest: ░░░░░░░░░░ 0% (bei Bedarf)

Speichernutzung: 45 MB / 200 MB verfügbar
```

### 2. Caching-Strategien

**Intelligenter Cache:**
```javascript
const documentCache = {
  "recently_viewed": ["doc1", "doc2", "doc3"], // Letzte 3 Dokumente
  "frequently_accessed": ["doc4", "doc5"],     // Häufig genutzt
  "current_session": ["doc6"],                 // Aktuelle Sitzung
  "preload_hints": ["doc7", "doc8"]          // Wahrscheinlich nächste
};
```

Die umfassenden Quelldokument-Interaktionsfunktionen von ProjectSusi ermöglichen eine tiefe und effiziente Arbeitsweise mit Ihren Dokumenten. Fahren Sie mit dem nächsten Abschnitt über die erweiterten Web-Interface-Features fort.