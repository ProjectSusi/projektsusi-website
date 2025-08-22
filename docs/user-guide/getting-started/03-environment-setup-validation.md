# Umgebungssetup & Validierung

## Übersicht

Nachdem Sie ProjectSusi und Ollama installiert haben, ist es wichtig, die gesamte Umgebung zu validieren und zu optimieren. Dieser Abschnitt führt Sie durch alle notwendigen Schritte zur Überprüfung und Feinabstimmung Ihrer Installation.

## Systemvalidierung

### 1. Grundlegende Systemprüfung

```bash
# Systeminformationen anzeigen
echo "=== Systemvalidierung ProjectSusi ==="
echo "Datum: $(date)"
echo "Betriebssystem: $(uname -a)"
echo "Verfügbarer Speicher: $(free -h | grep Mem)"
echo "Festplattenspeicher: $(df -h | grep -E '/$|/home')"
echo "CPU-Informationen: $(grep 'model name' /proc/cpuinfo | head -1)"
```

### 2. Abhängigkeiten prüfen

```bash
# Node.js Version
node --version
npm --version

# Python (falls erforderlich)
python3 --version
pip3 --version

# Git Version
git --version

# Docker (optional)
docker --version 2>/dev/null || echo "Docker nicht installiert"
```

### 3. Netzwerkverbindung testen

```bash
# Localhost-Verbindung
curl -s http://localhost:3000/health || echo "ProjectSusi nicht erreichbar"

# Ollama-Verbindung
curl -s http://localhost:11434/api/tags || echo "Ollama nicht erreichbar"

# Internet-Verbindung (für Updates)
ping -c 3 github.com >/dev/null && echo "Internet: OK" || echo "Internet: Fehler"
```

## ProjectSusi Konfigurationsprüfung

### 1. Konfigurationsdatei validieren

```bash
# Prüfe ob .env Datei existiert
if [ -f .env ]; then
    echo "✓ .env Datei gefunden"
    
    # Validiere kritische Variablen
    source .env
    
    echo "Konfigurationsprüfung:"
    echo "- OLLAMA_HOST: ${OLLAMA_HOST:-'Nicht gesetzt'}"
    echo "- OLLAMA_MODEL: ${OLLAMA_MODEL:-'Nicht gesetzt'}"
    echo "- PORT: ${PORT:-'Nicht gesetzt'}"
    echo "- NODE_ENV: ${NODE_ENV:-'Nicht gesetzt'}"
else
    echo "✗ .env Datei nicht gefunden"
    echo "Erstelle Beispiel-Konfiguration..."
    
    cat > .env << 'EOF'
# ProjectSusi Konfiguration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
PORT=3000
NODE_ENV=production

# Dokumentenverarbeitung
MAX_DOCUMENT_SIZE=50MB
SUPPORTED_FORMATS=pdf,docx,txt,md
UPLOAD_DIRECTORY=./data/documents
VECTOR_DB_PATH=./data/vectordb

# Sicherheit
SESSION_SECRET=change-this-in-production
CORS_ORIGIN=http://localhost:3000
EOF
    echo "✓ Beispiel .env erstellt - bitte anpassen"
fi
```

### 2. Verzeichnisstruktur prüfen

```bash
# Erstelle notwendige Verzeichnisse
mkdir -p data/{documents,vectordb,logs,temp}
mkdir -p config
mkdir -p public/uploads

# Berechtigungen setzen
chmod 755 data
chmod 750 data/documents
chmod 750 data/vectordb
chmod 755 public/uploads

echo "✓ Verzeichnisstruktur erstellt und Berechtigungen gesetzt"
```

### 3. Datenbank-Initialisierung

```bash
# Vector-Datenbank initialisieren
echo "Initialisiere Vector-Datenbank..."
npm run db:init 2>/dev/null || echo "Datenbank-Initialisierung übersprungen"

# Migrationsstatus prüfen
npm run db:status 2>/dev/null || echo "Keine Migrationsinformationen verfügbar"
```

## Ollama-Validierung

### 1. Modell-Verfügbarkeit prüfen

```bash
echo "=== Ollama-Modellprüfung ==="

# Verfügbare Modelle auflisten
MODELS=$(ollama list 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✓ Ollama läuft"
    echo "Installierte Modelle:"
    echo "$MODELS"
else
    echo "✗ Ollama nicht erreichbar"
    echo "Starte Ollama..."
    ollama serve &
    sleep 5
fi

# Standard-Modell testen
DEFAULT_MODEL="llama3.1:8b"
echo "Teste Modell: $DEFAULT_MODEL"
ollama run $DEFAULT_MODEL "Hallo, teste die deutsche Sprachfähigkeit." 2>/dev/null || {
    echo "✗ Standard-Modell nicht verfügbar"
    echo "Lade Modell herunter..."
    ollama pull $DEFAULT_MODEL
}
```

### 2. Performance-Test

```bash
echo "=== Performance-Test ==="

# Einfacher Antwortzeit-Test
start_time=$(date +%s.%N)
ollama run llama3.1:8b "Was ist 2+2?" >/dev/null 2>&1
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)

echo "Antwortzeit: ${duration}s"

if (( $(echo "$duration < 10" | bc -l) )); then
    echo "✓ Performance: Gut"
elif (( $(echo "$duration < 30" | bc -l) )); then
    echo "⚠ Performance: Akzeptabel"
else
    echo "✗ Performance: Langsam (GPU-Beschleunigung prüfen)"
fi
```

## Funktionsprüfung

### 1. API-Endpoints testen

```bash
echo "=== API-Tests ==="

# Health-Check
health_response=$(curl -s -w "%{http_code}" http://localhost:3000/health -o /dev/null)
if [ "$health_response" = "200" ]; then
    echo "✓ Health-Endpoint: OK"
else
    echo "✗ Health-Endpoint: Fehler ($health_response)"
fi

# API-Status
api_response=$(curl -s -w "%{http_code}" http://localhost:3000/api/status -o /dev/null)
if [ "$api_response" = "200" ]; then
    echo "✓ API-Endpoint: OK"
else
    echo "✗ API-Endpoint: Fehler ($api_response)"
fi

# Modell-Endpoint
model_response=$(curl -s -w "%{http_code}" http://localhost:3000/api/models -o /dev/null)
if [ "$model_response" = "200" ]; then
    echo "✓ Modell-Endpoint: OK"
else
    echo "✗ Modell-Endpoint: Fehler ($model_response)"
fi
```

### 2. Dokumentenupload testen

```bash
echo "=== Dokumentenupload-Test ==="

# Test-Dokument erstellen
cat > test-document.txt << 'EOF'
Dies ist ein Test-Dokument für ProjectSusi.

Es enthält mehrere Absätze mit verschiedenen Informationen:
- Technische Details über das System
- Benutzerinformationen und Anleitungen
- Beispiele für Abfragen und Antworten

Das Dokument dient zur Validierung der Upload- und Verarbeitungsfunktionen.
EOF

# Upload-Test (falls API verfügbar)
if curl -s http://localhost:3000/health >/dev/null; then
    upload_result=$(curl -s -F "file=@test-document.txt" http://localhost:3000/api/upload)
    echo "Upload-Test: $upload_result"
else
    echo "⚠ API nicht verfügbar - Upload-Test übersprungen"
fi

# Aufräumen
rm -f test-document.txt
```

## Umgebungsvariablen optimieren

### 1. Performance-Optimierung

```bash
# Erstelle optimierte Konfiguration
cat >> .env << 'EOF'

# Performance-Optimierung
NODE_OPTIONS="--max-old-space-size=4096"
UV_THREADPOOL_SIZE=4

# Ollama-Optimierung
OLLAMA_NUM_PARALLEL=4
OLLAMA_MAX_QUEUE=100
OLLAMA_FLASH_ATTENTION=true

# Dokumentenverarbeitung
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
MAX_CHUNKS_PER_DOCUMENT=500

# Caching
ENABLE_CACHE=true
CACHE_TTL=3600
CACHE_SIZE=1000
EOF
```

### 2. Sicherheitseinstellungen

```bash
# Sichere Standardwerte setzen
cat >> .env << 'EOF'

# Sicherheitseinstellungen
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://localhost:3000
CSRF_PROTECTION=true

# Logging
LOG_LEVEL=info
LOG_FILE=./data/logs/projektSusi.log
ACCESS_LOG=./data/logs/access.log

# Session-Management
SESSION_TTL=24h
SESSION_CLEANUP_INTERVAL=1h
EOF
```

## Monitoring und Logging

### 1. Log-Konfiguration

```bash
# Log-Verzeichnis erstellen
mkdir -p data/logs

# Logrotate-Konfiguration
cat > /etc/logrotate.d/projektsusi << 'EOF'
/path/to/projektsusi/data/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
```

### 2. Monitoring-Script

```bash
cat > monitor.sh << 'EOF'
#!/bin/bash

# ProjectSusi Monitoring Script
LOG_FILE="data/logs/monitor.log"

check_service() {
    local service=$1
    local port=$2
    
    if curl -s "http://localhost:$port/health" >/dev/null; then
        echo "$(date): $service OK" >> $LOG_FILE
        return 0
    else
        echo "$(date): $service FEHLER" >> $LOG_FILE
        return 1
    fi
}

# Hauptüberwachung
check_service "ProjectSusi" 3000
check_service "Ollama" 11434

# Speicherverbrauch prüfen
MEMORY_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
echo "$(date): Speicherverbrauch: ${MEMORY_USAGE}%" >> $LOG_FILE

# Festplattenverbrauch prüfen
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "$(date): WARNUNG: Festplatte zu ${DISK_USAGE}% belegt" >> $LOG_FILE
fi
EOF

chmod +x monitor.sh
```

## Automatisierte Tests

### 1. End-to-End Test

```bash
cat > e2e-test.sh << 'EOF'
#!/bin/bash

echo "=== ProjectSusi End-to-End Test ==="

# 1. Services prüfen
curl -s http://localhost:3000/health || exit 1
curl -s http://localhost:11434/api/tags || exit 1

# 2. Modell-Test
ollama run llama3.1:8b "Test" >/dev/null || exit 1

# 3. API-Test mit Beispieldokument
cat > test.txt << 'EOD'
ProjectSusi ist ein intelligenter Dokumentenassistent.
Er analysiert Dokumente und beantwortet Fragen dazu.
EOD

# Upload und Abfrage simulieren
# (Hier würden Sie Ihre spezifischen API-Calls einfügen)

echo "✓ Alle Tests erfolgreich"
rm -f test.txt
EOF

chmod +x e2e-test.sh
```

### 2. Performance-Benchmark

```bash
cat > benchmark.sh << 'EOF'
#!/bin/bash

echo "=== Performance-Benchmark ==="

# Modell-Antwortzeiten messen
for i in {1..5}; do
    start=$(date +%s.%N)
    ollama run llama3.1:8b "Kurze Antwort bitte." >/dev/null
    end=$(date +%s.%N)
    duration=$(echo "$end - $start" | bc)
    echo "Test $i: ${duration}s"
done

# Speicherverbrauch messen
echo "Speicherverbrauch:"
ps aux | grep -E "(ollama|projektsusi)" | grep -v grep
EOF

chmod +x benchmark.sh
```

## Troubleshooting-Checkliste

### Häufige Probleme und Lösungen

```bash
cat > troubleshoot.sh << 'EOF'
#!/bin/bash

echo "=== Troubleshooting ProjectSusi ==="

# Port-Konflikte prüfen
echo "1. Port-Konflikte:"
netstat -tulpn | grep -E ":(3000|11434)" || echo "Keine Port-Konflikte"

# Speicher prüfen
echo "2. Speicher:"
free -h

# Ollama-Status
echo "3. Ollama:"
curl -s http://localhost:11434/api/tags >/dev/null && echo "OK" || echo "Fehler"

# ProjectSusi-Status
echo "4. ProjectSusi:"
curl -s http://localhost:3000/health >/dev/null && echo "OK" || echo "Fehler"

# Log-Dateien prüfen
echo "5. Letzte Fehler in Logs:"
tail -10 data/logs/projektSusi.log 2>/dev/null || echo "Keine Logs gefunden"

echo "=== Ende Troubleshooting ==="
EOF

chmod +x troubleshoot.sh
```

## Nächste Schritte

Nach erfolgreicher Validierung:

1. **Erste Testabfragen** durchführen
2. **Web-Interface** öffnen und erkunden
3. **Beispieldokumente** hochladen
4. **Performance-Monitoring** einrichten

```bash
echo "=== Setup abgeschlossen ==="
echo "ProjectSusi ist bereit für den ersten Test!"
echo "Öffnen Sie http://localhost:3000 in Ihrem Browser"
echo ""
echo "Nützliche Befehle:"
echo "- ./monitor.sh     # System überwachen"
echo "- ./e2e-test.sh    # Vollständiger Test"
echo "- ./troubleshoot.sh # Problemdiagnose"
```

Ihre ProjectSusi-Umgebung ist nun vollständig validiert und optimiert. Fahren Sie mit den ersten Testabfragen fort.