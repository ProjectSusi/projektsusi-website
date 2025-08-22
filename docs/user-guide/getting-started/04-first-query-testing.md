# Erste Abfragen & Verifikation

## Übersicht

Nachdem Sie ProjectSusi erfolgreich installiert und konfiguriert haben, ist es Zeit für die ersten praktischen Tests. Dieser Abschnitt führt Sie durch verschiedene Testszenarien, um sicherzustellen, dass alle Funktionen ordnungsgemäß arbeiten.

## Grundlegende Funktionstests

### 1. System-Readiness Check

Bevor Sie mit Dokumentenabfragen beginnen, stellen Sie sicher, dass alle Komponenten bereit sind:

```bash
# Vollständiger Systemcheck
echo "=== ProjectSusi Readiness Check ==="

# 1. Services verfügbar?
curl -s http://localhost:3000/health | jq . || echo "ProjectSusi API nicht bereit"
curl -s http://localhost:11434/api/tags | jq . || echo "Ollama nicht bereit"

# 2. Modelle geladen?
ollama list | grep -E "(llama3.1|mixtral|gemma)" || echo "Standard-Modelle nicht verfügbar"

# 3. Verzeichnisse zugänglich?
ls -la data/documents/ >/dev/null && echo "✓ Dokumentenverzeichnis OK" || echo "✗ Dokumentenverzeichnis Problem"
ls -la data/vectordb/ >/dev/null && echo "✓ Vector-DB Verzeichnis OK" || echo "✗ Vector-DB Problem"

echo "=== Readiness Check abgeschlossen ==="
```

### 2. Web-Interface Test

Öffnen Sie Ihren Browser und navigieren Sie zu `http://localhost:3000`

**Erwartete Elemente:**
- Willkommensseite mit ProjectSusi-Logo
- Upload-Bereich für Dokumente
- Abfrage-Eingabefeld
- Modell-Auswahlmöglichkeiten
- Status-Anzeigen für Ollama-Verbindung

## Erste Testdokumente

### 1. Einfaches Test-Dokument erstellen

```bash
# Erstelle ein grundlegendes Testdokument
mkdir -p test-documents

cat > test-documents/einfuehrung-projektSusi.txt << 'EOF'
ProjectSusi - Intelligenter Dokumentenassistent

Einführung:
ProjectSusi ist ein KI-gestützter Assistent zur Analyse und Durchsuchung von Dokumenten.
Das System wurde entwickelt, um große Mengen an Textdokumenten effizient zu durchsuchen
und präzise Antworten auf Benutzerfragen zu liefern.

Hauptfunktionen:
1. Dokumentenupload und -verarbeitung
2. Intelligente Textanalyse mit KI-Modellen
3. Präzise Quellenangaben mit Seiten- und Zeilennummern
4. Unterstützung für deutsche Sprache und Fachtermini
5. Lokale Verarbeitung für maximalen Datenschutz

Technische Details:
- Basiert auf Ollama für lokale KI-Verarbeitung
- Unterstützt PDF, DOCX, TXT und Markdown-Dateien
- Vector-basierte Suche für semantische Ähnlichkeit
- Web-Interface für einfache Bedienung

Anwendungsbereiche:
- Rechtsdokumente und Verträge
- Technische Dokumentationen
- Wissenschaftliche Arbeiten
- Firmeninterne Handbücher
- Compliance-Dokumentation

Installationsdatum: 21. August 2025
Version: 2.0.0
Lizenz: MIT
EOF

echo "✓ Test-Dokument erstellt: test-documents/einfuehrung-projektSusi.txt"
```

### 2. Technisches Test-Dokument

```bash
cat > test-documents/technische-spezifikation.txt << 'EOF'
Technische Spezifikation ProjectSusi v2.0.0

Systemarchitektur:
Die Anwendung besteht aus drei Hauptkomponenten:
1. Frontend (React/Next.js) - Zeile 5
2. Backend API (Node.js/Express) - Zeile 6  
3. KI-Engine (Ollama) - Zeile 7

Datenflow:
Dokument → Upload → Preprocessing → Vektorisierung → Speicherung
Abfrage → Embedding → Ähnlichkeitssuche → KI-Analyse → Antwort

Unterstützte Dateiformate:
- PDF (Adobe Acrobat, bis 50MB)
- DOCX (Microsoft Word 2010+)
- TXT (UTF-8 Kodierung)
- MD (Markdown mit CommonMark)

Performance-Kennzahlen:
- Verarbeitungszeit: 2-5 Sekunden pro Dokument
- Abfragezeit: 1-3 Sekunden
- Maximale Dokumentgröße: 50 MB
- Unterstützte Sprachen: Deutsch, Englisch

Sicherheitsfeatures:
- Lokale Datenverarbeitung (keine Cloud)
- Verschlüsselte Dokumentenspeicherung
- Session-basierte Zugriffskontrolle
- Audit-Logging aller Aktionen

Konfigurationsparameter:
- CHUNK_SIZE: 1000 Zeichen
- OVERLAP: 200 Zeichen  
- VECTOR_DIMENSIONS: 384
- MAX_CONTEXT_LENGTH: 4096 Token
EOF

echo "✓ Technisches Test-Dokument erstellt"
```

### 3. Juristisches Test-Dokument

```bash
cat > test-documents/muster-vertrag.txt << 'EOF'
Muster-Servicevertrag

Vertragsparteien:
Auftraggeber: Musterfirma GmbH, Musterstraße 123, 12345 Musterstadt
Auftragnehmer: ServiceProvider AG, Serviceweg 456, 67890 Serviceort

§ 1 Vertragsgegenstand
Der Auftragnehmer verpflichtet sich zur Erbringung von IT-Dienstleistungen
gemäß der in Anlage A definierten Spezifikationen.

§ 2 Leistungsumfang  
Die Leistungen umfassen:
a) Installation und Konfiguration der Software
b) Schulung von bis zu 10 Mitarbeitern
c) Support während der Geschäftszeiten (Mo-Fr, 8-18 Uhr)

§ 3 Vergütung
Die Vergütung beträgt 50.000 EUR netto und ist binnen 30 Tagen
nach Rechnungsstellung fällig.

§ 4 Vertragslaufzeit
Der Vertrag beginnt am 1. September 2025 und endet am 31. August 2026.
Eine Verlängerung um jeweils ein Jahr ist möglich.

§ 5 Gewährleistung
Der Auftragnehmer gewährleistet die ordnungsgemäße Funktion der
Software für 24 Monate ab Abnahme.

§ 6 Datenschutz
Beide Parteien verpflichten sich zur Einhaltung der DSGVO und
zur vertraulichen Behandlung aller Geschäftsdaten.

Musterstadt, den 21. August 2025

________________________              ________________________
(Auftraggeber)                        (Auftragnehmer)
EOF

echo "✓ Juristisches Test-Dokument erstellt"
```

## Dokumentenupload-Tests

### 1. Upload über Web-Interface

1. Öffnen Sie `http://localhost:3000`
2. Klicken Sie auf "Dokument hochladen"
3. Wählen Sie `test-documents/einfuehrung-projektSusi.txt`
4. Warten Sie auf die Verarbeitungsbestätigung
5. Überprüfen Sie die Statusmeldung

**Erwartete Ausgabe:**
```
✓ Dokument erfolgreich hochgeladen
✓ Text extrahiert (1,247 Zeichen)
✓ In 3 Chunks aufgeteilt
✓ Vektorisierung abgeschlossen
✓ Bereit für Abfragen
```

### 2. Upload über API (Optional)

```bash
# API-Upload testen
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test-documents/einfuehrung-projektSusi.txt" \
  -H "Content-Type: multipart/form-data"

# Erwartete Antwort:
# {
#   "success": true,
#   "documentId": "doc_123456",
#   "filename": "einfuehrung-projektSusi.txt",
#   "chunks": 3,
#   "processed": true
# }
```

## Erste Testabfragen

### 1. Grundlegende Abfragen

Führen Sie diese Abfragen über das Web-Interface durch:

#### Test 1: Einfache Faktenfrage
```
Abfrage: "Was ist ProjectSusi?"
Erwartete Antwort: "ProjectSusi ist ein KI-gestützter Assistent zur Analyse und Durchsuchung von Dokumenten..."
Quellenverweis: "Seite 1, Zeile 3-5"
```

#### Test 2: Spezifische Details
```
Abfrage: "Welche Dateiformate werden unterstützt?"
Erwartete Antwort: "ProjectSusi unterstützt PDF, DOCX, TXT und Markdown-Dateien..."
Quellenverweis: "Seite 1, Zeile 15-18"
```

#### Test 3: Technische Informationen
```
Abfrage: "Wie groß dürfen hochgeladene Dokumente sein?"
Erwartete Antwort: "Die maximale Dokumentgröße beträgt 50 MB..."
Quellenverweis: "Seite 1, Zeile 20"
```

### 2. Erweiterte Abfragen

#### Test 4: Kontextuelle Analyse
```
Abfrage: "Welche Vorteile bietet die lokale Verarbeitung?"
Erwartete Antwort: Analyse der Datenschutz- und Sicherheitsaspekte
```

#### Test 5: Vergleichsabfrage
```
Abfrage: "Was unterscheidet ProjectSusi von Cloud-basierten Lösungen?"
Erwartete Antwort: Fokus auf lokale Verarbeitung und Datenschutz
```

### 3. Mehrfach-Dokument Abfragen

Nach Upload aller Testdokumente:

#### Test 6: Dokumentenübergreifend
```
Abfrage: "Welche technischen Spezifikationen sind in den Dokumenten erwähnt?"
Erwartete Antwort: Zusammenfassung aus allen technischen Dokumenten
```

#### Test 7: Juristische Inhalte
```
Abfrage: "Welche Vertragslaufzeiten sind in den Dokumenten definiert?"
Erwartete Antwort: Verweis auf den Muster-Vertrag, § 4
```

## Antwortqualität bewerten

### 1. Bewertungskriterien

Für jede Testabfrage bewerten Sie:

```bash
# Bewertungsbogen erstellen
cat > test-results.txt << 'EOF'
ProjectSusi Test-Ergebnisse

Test #1: Was ist ProjectSusi?
- Antwort korrekt: [✓/✗]
- Quellenangabe vorhanden: [✓/✗]  
- Seitenzahl korrekt: [✓/✗]
- Antwortzeit: [X] Sekunden
- Relevanz (1-5): [X]
- Vollständigkeit (1-5): [X]

Test #2: Unterstützte Dateiformate
- Antwort korrekt: [✓/✗]
- Quellenangabe vorhanden: [✓/✗]
- Seitenzahl korrekt: [✓/✗]
- Antwortzeit: [X] Sekunden
- Relevanz (1-5): [X]
- Vollständigkeit (1-5): [X]

[Weitere Tests...]

Gesamtbewertung:
- Erfolgreiche Tests: X/Y
- Durchschnittliche Antwortzeit: X Sekunden
- Durchschnittliche Relevanz: X/5
- Empfehlung: [Produktionsreif/Weitere Tests erforderlich]
EOF
```

### 2. Performance-Metriken

```bash
# Performance-Test Script
cat > performance-test.sh << 'EOF'
#!/bin/bash

echo "=== Performance-Test ProjectSusi ==="

# Test-Abfragen definieren
queries=(
    "Was ist ProjectSusi?"
    "Welche Dateiformate werden unterstützt?"
    "Wie funktioniert die Vektorsuche?"
    "Welche Sicherheitsfeatures gibt es?"
    "Was kostet die Nutzung?"
)

total_time=0
successful_queries=0

for i in "${!queries[@]}"; do
    query="${queries[$i]}"
    echo "Test $((i+1)): $query"
    
    start_time=$(date +%s.%N)
    
    # API-Abfrage (anpassen an Ihre API)
    response=$(curl -s -X POST http://localhost:3000/api/query \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" \
        -w "HTTPSTATUS:%{http_code}")
    
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc)
    
    http_status=$(echo $response | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    
    if [ "$http_status" = "200" ]; then
        echo "  ✓ Erfolgreich ($duration s)"
        successful_queries=$((successful_queries + 1))
        total_time=$(echo "$total_time + $duration" | bc)
    else
        echo "  ✗ Fehler (HTTP $http_status)"
    fi
done

if [ $successful_queries -gt 0 ]; then
    avg_time=$(echo "scale=2; $total_time / $successful_queries" | bc)
    echo ""
    echo "Ergebnisse:"
    echo "- Erfolgreiche Abfragen: $successful_queries/${#queries[@]}"
    echo "- Durchschnittliche Antwortzeit: ${avg_time}s"
    echo "- Gesamtzeit: ${total_time}s"
fi
EOF

chmod +x performance-test.sh
```

## Problemdiagnose

### 1. Häufige Probleme bei ersten Tests

```bash
# Diagnose-Script für Erstnutzung
cat > diagnose-first-use.sh << 'EOF'
#!/bin/bash

echo "=== Diagnose für erste Nutzung ==="

# 1. Können Dokumente hochgeladen werden?
echo "1. Upload-Test:"
test_file="test-upload.txt"
echo "Dies ist ein Test" > $test_file

upload_result=$(curl -s -w "%{http_code}" -F "file=@$test_file" http://localhost:3000/api/upload -o /dev/null)
if [ "$upload_result" = "200" ]; then
    echo "  ✓ Upload funktioniert"
else
    echo "  ✗ Upload-Problem (HTTP $upload_result)"
    echo "    Prüfen Sie Upload-Verzeichnis Berechtigungen"
fi
rm -f $test_file

# 2. Läuft Ollama korrekt?
echo "2. Ollama-Test:"
ollama_test=$(curl -s http://localhost:11434/api/tags)
if echo "$ollama_test" | grep -q "models"; then
    echo "  ✓ Ollama läuft und hat Modelle"
else
    echo "  ✗ Ollama-Problem"
    echo "    Führen Sie aus: ollama serve"
fi

# 3. Sind Modelle verfügbar?
echo "3. Modell-Test:"
if ollama list | grep -q "llama3.1"; then
    echo "  ✓ Standard-Modell verfügbar"
else
    echo "  ✗ Kein Standard-Modell"
    echo "    Führen Sie aus: ollama pull llama3.1:8b"
fi

# 4. Funktioniert die Vektorsuche?
echo "4. Vector-DB Test:"
if [ -d "data/vectordb" ] && [ -w "data/vectordb" ]; then
    echo "  ✓ Vector-DB Verzeichnis OK"
else
    echo "  ✗ Vector-DB Verzeichnis Problem"
    echo "    Führen Sie aus: mkdir -p data/vectordb && chmod 755 data/vectordb"
fi

echo "=== Diagnose abgeschlossen ==="
EOF

chmod +x diagnose-first-use.sh
```

### 2. Log-Analyse für Debugging

```bash
# Log-Analyser für häufige Probleme
cat > analyze-logs.sh << 'EOF'
#!/bin/bash

echo "=== Log-Analyse ==="

LOG_FILE="data/logs/projektSusi.log"

if [ -f "$LOG_FILE" ]; then
    echo "Letzte Fehler:"
    grep -i "error\|fehler\|exception" "$LOG_FILE" | tail -5
    
    echo ""
    echo "Upload-Aktivitäten:"
    grep -i "upload\|file" "$LOG_FILE" | tail -5
    
    echo ""
    echo "Ollama-Verbindungen:"
    grep -i "ollama\|model" "$LOG_FILE" | tail -5
else
    echo "Keine Log-Datei gefunden bei: $LOG_FILE"
    echo "Überprüfen Sie die Logging-Konfiguration"
fi

# System-Logs prüfen
echo ""
echo "System-Logs (letzte 10 Zeilen):"
journalctl -u projektsusi -n 10 --no-pager 2>/dev/null || echo "Kein systemd Service gefunden"
EOF

chmod +x analyze-logs.sh
```

## Erfolgreiche Validierung

### Checkliste für erfolgreiche Tests

Nach Abschluss aller Tests sollten Sie bestätigen können:

- [ ] ✓ ProjectSusi Web-Interface lädt korrekt
- [ ] ✓ Ollama ist erreichbar und antwortet
- [ ] ✓ Mindestens ein KI-Modell ist installiert
- [ ] ✓ Dokumente können hochgeladen werden
- [ ] ✓ Dokumentenverarbeitung funktioniert
- [ ] ✓ Abfragen liefern relevante Antworten
- [ ] ✓ Quellenangaben sind korrekt
- [ ] ✓ Antwortzeiten sind akzeptabel (< 10s)
- [ ] ✓ Deutsche Sprache wird korrekt verstanden
- [ ] ✓ Fachbegriffe werden erkannt

### Nächste Schritte

Nach erfolgreichen ersten Tests:

1. **Web-Interface detailliert erkunden**
2. **Eigene Dokumente hochladen**
3. **Erweiterte Abfragetechniken lernen**
4. **Produktive Nutzung beginnen**

```bash
echo "=== Erste Tests abgeschlossen ==="
echo "ProjectSusi ist einsatzbereit!"
echo ""
echo "Empfohlene nächste Schritte:"
echo "1. Laden Sie Ihre ersten echten Dokumente hoch"
echo "2. Experimentieren Sie mit verschiedenen Abfragetypen"
echo "3. Erkunden Sie das Web-Interface im Detail"
echo "4. Lesen Sie die Web-Interface Anleitung"
```

Ihre ProjectSusi-Installation ist nun vollständig getestet und einsatzbereit. Fahren Sie mit der detaillierten Web-Interface-Anleitung fort.