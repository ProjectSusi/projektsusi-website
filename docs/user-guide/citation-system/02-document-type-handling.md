# Dokumenttyp-spezifische Behandlung & Zitation

## Übersicht der unterstützten Dokumenttypen

ProjectSusi verarbeitet verschiedene Dokumenttypen mit jeweils angepassten Zitations- und Verarbeitungsstrategien. Jeder Dokumenttyp erfordert spezifische Ansätze für die optimale Extraktion und Referenzierung von Inhalten.

## PDF-Dokumente

### 1. PDF-Verarbeitung und -Struktur

**PDF-Charakteristika:**
```
📄 PDF-Eigenschaften:
├─ Seitenzählung: Physische Seiten
├─ Textextraktion: OCR + Text-Layer
├─ Strukturerkennung: Automatische Abschnitte
├─ Metadaten: Titel, Autor, Erstellungsdatum
└─ Besonderheiten: Formulare, Signaturen
```

**PDF-spezifische Zitationsformate:**
```
Standard-PDF:
"Dokument.pdf, Seite 15, Zeile 8"

Mehrseitiger Bereich:
"Dokument.pdf, Seiten 12-15, Abschnitt 3.2"

OCR-erkannter Text:
"Dokument.pdf, Seite 23, Zeile 15 (OCR-erkannt, Vertrauen: 87%)"

Formulardaten:
"Formular.pdf, Feld 'Vertragspartner', Seite 2"
```

### 2. PDF-Strukturerkennung

**Automatische Gliederungserkennung:**
```javascript
const pdfStructure = {
  "headings": [
    { level: 1, text: "§ 1 Vertragsgegenstand", page: 3, line: 5 },
    { level: 2, text: "1.1 Leistungsumfang", page: 3, line: 12 },
    { level: 2, text: "1.2 Spezifikationen", page: 4, line: 8 }
  ],
  "tables": [
    { id: "table_1", page: 8, description: "Preisübersicht" },
    { id: "table_2", page: 15, description: "Zeitplan" }
  ],
  "images": [
    { id: "img_1", page: 12, description: "Prozessdiagramm" }
  ],
  "signatures": [
    { page: 25, type: "digital", valid: true }
  ]
};
```

**PDF-Metadaten-Integration:**
```
📋 PDF-Informationen:
├─ Titel: "Servicevertrag IT-Dienstleistungen"
├─ Autor: "Rechtsabteilung Firma ABC"  
├─ Erstellt: 15.03.2025, 14:23
├─ Geändert: 18.03.2025, 09:45
├─ Seitenzahl: 47 Seiten
├─ Dateigröße: 2.3 MB
├─ PDF-Version: 1.7
└─ Sicherheit: Passwortgeschützt (Nein)

Zitation mit Metadaten:
"Laut Servicevertrag IT-Dienstleistungen (PDF, erstellt 15.03.2025), 
Seite 23, Abschnitt 4.2..."
```

### 3. Spezielle PDF-Herausforderungen

**OCR-Text-Behandlung:**
```
🔍 OCR-Erkennung:

Confidence Level: 94%
Originaltext (geschätzt): "Die Kündigungsfrist beträgt 3 Monate"
OCR-Ergebnis: "Die Kündigungsfrist beträgt 3 Monate"
Abweichungen: Keine erkannt

Zitation:
"Die Kündigungsfrist beträgt 3 Monate (Seite 15, Zeile 8, OCR: 94%)"

Bei niedriger OCR-Qualität (<80%):
"Kündigungsregelung siehe Seite 15, Zeile 8 
(⚠️ OCR-Qualität: 76%, manuelle Verifikation empfohlen)"
```

**Mehrspaltige Layouts:**
```
📊 Spaltenlayout erkannt:

Seite 12: 2-spaltiges Layout
├─ Spalte 1: Zeilen 1-25 (Haupttext)
├─ Spalte 2: Zeilen 1-25 (Anmerkungen)
└─ Fußbereich: Zeilen 26-28 (Seitenzahl, Datum)

Spezifische Zitation:
"Haupttext Seite 12, Spalte 1, Zeile 15"
"Anmerkung siehe Seite 12, Spalte 2, Zeile 8"
```

## Microsoft Word-Dokumente (DOCX)

### 1. DOCX-Strukturextraktion

**Word-spezifische Elemente:**
```
📝 DOCX-Strukturen:
├─ Überschriften (H1-H6)
├─ Nummerierte Listen
├─ Aufzählungen
├─ Tabellen mit Spaltenköpfen
├─ Fußnoten und Endnoten
├─ Kommentare und Änderungsverfolgungs
├─ Textboxen
└─ Eingebettete Objekte
```

**DOCX-Zitationsbeispiele:**
```
Überschrift-basiert:
"Unter Überschrift '4.2 Kündigungsregelungen' (Seite 15) 
wird definiert..."

Listenelement:
"Punkt 3 der Aufzählung auf Seite 8 besagt..."

Tabellenzelle:
"Tabelle 'Kostenübersicht', Zeile 3, Spalte 'Betrag' (Seite 12)"

Fußnote:
"Siehe Fußnote 7 auf Seite 15: 'Ausnahmen gelten nur...'"

Kommentar:
"Kommentar von Max Mustermann (15.03.2025): 'Prüfung erforderlich'"
```

### 2. Versionsverfolgung und Änderungen

**Änderungshistorie-Integration:**
```
📝 Dokumentänderungen:

Version 1.0 → 1.1 (18.03.2025, 14:30):
├─ Seite 15, Zeile 8: "6 Monate" → "3 Monate" (Max Mustermann)
├─ Seite 23: Neue Klausel hinzugefügt (Anna Schmidt)
└─ Seite 8: Tabelle erweitert (Dr. Weber)

Zitation mit Versionshinweis:
"Die Kündigungsfrist beträgt 3 Monate (Seite 15, Zeile 8) 
[Geändert in v1.1 vom 18.03.2025]"
```

**Kommentar-Integration:**
```
💬 Aktive Kommentare:

Seite 15, Zeile 8:
"Max Mustermann (14:23): Ist diese Frist mit HR abgestimmt?"
└─ Anna Schmidt (14:45): "Ja, bestätigt per E-Mail"

Zitation mit Kommentar-Kontext:
"Die Kündigungsfrist beträgt 3 Monate (Seite 15, Zeile 8).
Hinweis: Abstimmung mit HR erfolgt (siehe Kommentar M. Mustermann)"
```

## Textdateien (TXT, Markdown)

### 1. Reine Textdateien (TXT)

**TXT-Verarbeitung:**
```
📝 TXT-Charakteristika:
├─ Keine Formatierung
├─ Zeilennummerierung als Hauptreferenz
├─ Strukturerkennung durch Leerzeilen/Einrückung
├─ Encoding-Erkennung (UTF-8, Latin-1, etc.)
└─ Minimale Metadaten (Dateiname, Änderungsdatum)

TXT-Zitationsformat:
"Dateiname.txt, Zeile 45"
"Dokument.txt, Zeilen 15-18"
"README.txt, Absatz 3 (Zeilen 23-35)"
```

**Strukturerkennung in TXT:**
```
Automatische Abschnittserkennung:

1. EINFÜHRUNG
   ├─ Zeilen 1-15
   
2. HAUPTTEIL
   ├─ 2.1 Grundlagen (Zeilen 16-30)
   ├─ 2.2 Anwendung (Zeilen 31-45)
   
3. ZUSAMMENFASSUNG
   ├─ Zeilen 46-52

Zitation:
"Grundlagen siehe Abschnitt 2.1 (Zeilen 16-30) in Handbuch.txt"
```

### 2. Markdown-Dokumente (MD)

**Markdown-Strukturverarbeitung:**
```markdown
# Markdown-Strukturen:

## Überschriften (H1-H6)
- Automatische Gliederungserkennung
- Anker-Links für Navigation

### Listen und Aufzählungen
- Nummerierte Listen (1., 2., 3.)
- Aufzählungen (-, *, +)
- Verschachtelte Strukturen

### Code-Blöcke
```code
Code-Beispiele mit Syntax-Highlighting
```

### Tabellen
| Spalte 1 | Spalte 2 | Spalte 3 |
|----------|----------|----------|
| Wert 1   | Wert 2   | Wert 3   |

### Links und Referenzen
[Linktext](URL) und ![Alt-Text](Bildpfad)
```

**Markdown-Zitationsbeispiele:**
```
Überschrift-basiert:
"Unter '## 4.2 Kündigungsregelungen' im README.md..."

Code-Block:
"Der Beispielcode in README.md, Zeilen 45-52 zeigt..."

Tabelle:
"Laut Tabelle in Spezifikation.md, Zeile 23, Spalte 'Status'..."

Liste:
"Punkt 3 der Aufzählung in CHANGELOG.md besagt..."
```

## Spezielle Dokumentarten

### 1. Technische Spezifikationen

**API-Dokumentationen:**
```yaml
# API-Spec-Zitation:
openapi: 3.0.0
info:
  title: Project API
  version: 1.0.0
paths:
  /users:
    get:
      summary: "Benutzer abrufen"

Zitation:
"Die Benutzer-API (api-spec.yaml, Pfad '/users', Zeile 12) 
unterstützt GET-Requests..."
```

**Konfigurationsdateien:**
```json
{
  "database": {
    "host": "localhost",
    "port": 5432
  }
}

Zitation:
"Die Datenbank-Konfiguration (config.json, Objekt 'database', 
Zeile 3) definiert..."
```

### 2. Juristische Dokumente

**Vertragsstrukturen:**
```
§ 1 Vertragsgegenstand
§ 2 Leistungsumfang
  (1) Der Auftragnehmer verpflichtet sich...
  (2) Die Leistungen umfassen...
§ 3 Vergütung
  Abs. 1: Grundvergütung
  Abs. 2: Zusatzleistungen

Juristische Zitation:
"Gemäß § 2 Abs. 1 des Vertrags (Seite 5, Zeilen 12-15)..."
"Die Vergütungsregelung in § 3 Abs. 2 (Seite 8) besagt..."
```

### 3. Wissenschaftliche Arbeiten

**Akademische Strukturen:**
```
1 Einleitung
  1.1 Problemstellung
  1.2 Zielsetzung
  1.3 Methodik
2 Stand der Forschung
  2.1 Literatürübersicht
  2.2 Forschungslücke
3 Empirische Untersuchung
  3.1 Hypothesen
  3.2 Datenerhebung
  3.3 Auswertung
4 Ergebnisse
5 Diskussion
6 Fazit

Wissenschaftliche Zitation:
"Die Hypothesen (Kapitel 3.1, Seite 45) postulieren..."
"Die Ergebnisse in Tabelle 4 (Seite 67) zeigen..."
```

## Dokumentqualität und Verarbeitung

### 1. Qualitätsbewertung

**Dokumentqualitäts-Indikatoren:**
```javascript
const documentQuality = {
  "text_quality": {
    "ocr_confidence": 0.94,      // 94% OCR-Genauigkeit
    "formatting_intact": true,    // Formatierung erhalten
    "encoding_correct": true,     // Korrekte Zeichenkodierung
    "special_chars": 0.02        // 2% Sonderzeichen-Probleme
  },
  "structure_recognition": {
    "headings_detected": 0.89,    // 89% Überschriften erkannt
    "tables_parsed": 0.95,        // 95% Tabellen korrekt geparst
    "lists_identified": 0.92,     // 92% Listen identifiziert
    "images_located": 0.87        // 87% Bilder lokalisiert
  },
  "metadata_completeness": {
    "title_available": true,      // Titel verfügbar
    "author_known": true,         // Autor bekannt
    "creation_date": true,        // Erstellungsdatum vorhanden
    "modification_date": true     // Änderungsdatum verfügbar
  }
};
```

### 2. Verarbeitungshinweise

**Qualitätsbasierte Zitationsanpassung:**
```
Hohe Qualität (>90%):
"Standardzitation ohne Einschränkungen"

Mittlere Qualität (70-90%):
"Zitation mit Qualitätshinweis"
Beispiel: "Text siehe Seite 15, Zeile 8 (Dokumentqualität: 85%)"

Niedrige Qualität (<70%):
"Zitation mit Warnhinweis"
Beispiel: "Text siehe ca. Seite 15 (⚠️ Verifikation empfohlen, 
Dokumentqualität: 65%)"
```

**Fehlende Strukturelemente:**
```
Strukturprobleme identifiziert:
├─ Keine Seitenzahlen: Zeilenbasierte Referenz
├─ Unleserliche Bereiche: Approximative Angaben
├─ Beschädigte Tabellen: Textuelle Beschreibung
└─ Fehlende Überschriften: Kontextbasierte Orientierung

Angepasste Zitation:
"Information im mittleren Dokumentbereich (geschätzt Zeilen 450-480) 
⚠️ Originalprüfung empfohlen"
```

## Multi-Format-Kombinationen

### 1. Dokumenten-Sets

**Zusammengehörige Dokumente:**
```
Projekt-Dokumentenset:
├─ Hauptvertrag.pdf (Leitdokument)
├─ Anlage_A_Spezifikation.docx (Detailspezifikation)
├─ Preisliste.xlsx (Kostenaufstellung)
├─ README.md (Projektübersicht)
└─ CHANGELOG.txt (Änderungshistorie)

Set-übergreifende Zitation:
"Die Grundregelung im Hauptvertrag.pdf (Seite 15) wird in 
Anlage_A_Spezifikation.docx (Abschnitt 3.2) konkretisiert 
und in Preisliste.xlsx (Tabelle 'Services') kalkuliert."
```

### 2. Versionsketten

**Dokumentenhistorie:**
```
Versions-Timeline:
Vertrag_v1.0.pdf (15.01.2025) → 
Vertrag_v1.1.docx (18.02.2025) → 
Vertrag_v2.0.pdf (15.03.2025)

Versionsübergreifende Zitation:
"Die ursprüngliche Regelung (Vertrag_v1.0.pdf, Seite 15) 
wurde in v1.1 (Vertrag_v1.1.docx, Seite 12) modifiziert 
und in der aktuellen Version (Vertrag_v2.0.pdf, Seite 14) 
finalisiert."
```

## Best Practices für Dokumenttypen

### 1. Dokumenttyp-optimierte Strategien

**PDF-Optimierung:**
- Hohe Auflösung für bessere OCR
- Textlayer bevorzugen
- Strukturierte PDF-Erstellung
- Metadaten vollständig ausfüllen

**Word-Optimierung:**
- Überschriften-Stile verwenden
- Strukturierte Listen erstellen
- Tabellen mit Kopfzeilen
- Änderungsverfolgung aktivieren

**Text-Optimierung:**
- Konsistente Einrückung
- Klare Abschnittstrennung
- UTF-8-Encoding verwenden
- Strukturelle Markierungen

### 2. Qualitätssicherung

**Dokumentvalidierung:**
```
Vor Upload prüfen:
☑ Vollständigkeit der Inhalte
☑ Korrekte Formatierung
☑ Lesbarkeit aller Textteile
☑ Vollständige Metadaten
☑ Angemessene Dateigröße
☑ Strukturelle Integrität
```

Die dokumenttyp-spezifische Behandlung gewährleistet optimale Verarbeitung und präzise Zitation für alle unterstützten Formate. Fahren Sie mit dem nächsten Abschnitt über Vertrauenswerte und Ähnlichkeitsbewertungen fort.