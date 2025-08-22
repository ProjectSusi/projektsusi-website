# Troubleshooting & Setup-Probleme

## Übersicht

Dieser Abschnitt behandelt die häufigsten Probleme, die während der Installation und ersten Nutzung von ProjectSusi auftreten können. Jedes Problem wird mit spezifischen Diagnoseschritten und Lösungsansätzen behandelt.

## Installationsprobleme

### 1. Ollama-Installation fehlgeschlagen

#### Problem: Ollama startet nicht
```bash
# Symptome prüfen
systemctl status ollama
journalctl -u ollama -n 20
```

**Häufige Ursachen:**
- Unzureichende Berechtigungen
- Port 11434 bereits belegt
- Fehlende Abhängigkeiten

**Lösungsansätze:**

```bash
# Lösung 1: Port-Konflikt beheben
sudo netstat -tulpn | grep :11434
sudo kill -9 $(sudo lsof -t -i:11434)

# Lösung 2: Ollama mit anderem Port starten
OLLAMA_HOST=0.0.0.0:11435 ollama serve

# Lösung 3: Berechtigungen korrigieren
sudo chown -R ollama:ollama /usr/local/bin/ollama
sudo chmod +x /usr/local/bin/ollama

# Lösung 4: Manuelle Installation
curl -fsSL https://ollama.com/install.sh | sh
```

#### Problem: Modelle können nicht heruntergeladen werden
```bash
# Fehlerdiagnose
ollama pull llama3.1:8b --debug

# Netzwerk-Test
curl -I https://ollama.com
ping -c 3 ollama.com
```

**Lösungsansätze:**

```bash
# Proxy-Einstellungen (falls erforderlich)
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
ollama pull llama3.1:8b

# Temporäres Verzeichnis bereinigen
rm -rf ~/.ollama/tmp/*

# Manueller Download mit curl
curl -L https://ollama.com/library/llama3.1:8b/blobs/sha256:... -o model.bin
```

### 2. ProjectSusi-Installation fehlgeschlagen

#### Problem: npm install schlägt fehl
```bash
# Fehleranalyse
npm install --verbose
npm config list
```

**Lösungsansätze:**

```bash
# Node.js Version prüfen und aktualisieren
node --version
nvm install 18.17.0
nvm use 18.17.0

# Cache bereinigen
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Alternativer Package Manager
yarn install
# oder
pnpm install
```

#### Problem: Build-Prozess schlägt fehl
```bash
# Build-Logs analysieren
npm run build 2>&1 | tee build.log
grep -i "error\|failed" build.log
```

**Lösungsansätze:**

```bash
# Speicher erhöhen
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build

# Abhängigkeiten aktualisieren
npm update
npm audit fix

# Development-Build testen
npm run dev
```

## Laufzeit-Probleme

### 1. Anwendung startet nicht

#### Problem: Port bereits in Verwendung
```bash
# Port-Nutzung prüfen
sudo netstat -tulpn | grep :3000
sudo lsof -i :3000
```

**Lösungsansätze:**

```bash
# Prozess beenden
sudo kill -9 $(sudo lsof -t -i:3000)

# Anderen Port verwenden
PORT=3001 npm start

# .env Datei anpassen
echo "PORT=3001" >> .env
```

#### Problem: Umgebungsvariablen fehlen
```bash
# .env Datei prüfen
ls -la .env
cat .env | grep -E "OLLAMA|PORT|NODE_ENV"
```

**Lösung: Vollständige .env erstellen**

```bash
cat > .env << 'EOF'
# Grundkonfiguration
NODE_ENV=production
PORT=3000

# Ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_TIMEOUT=120000

# Dokumentenverarbeitung
MAX_DOCUMENT_SIZE=52428800
UPLOAD_DIRECTORY=./data/documents
VECTOR_DB_PATH=./data/vectordb
SUPPORTED_FORMATS=pdf,docx,txt,md

# Sicherheit
SESSION_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000

# Performance
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
MAX_CHUNKS_PER_DOCUMENT=500

# Logging
LOG_LEVEL=info
LOG_FILE=./data/logs/projektSusi.log
EOF
```

### 2. Ollama-Verbindungsprobleme

#### Problem: "Ollama nicht erreichbar"
```bash
# Verbindung testen
curl -v http://localhost:11434/api/version
telnet localhost 11434
```

**Diagnoseschritte:**

```bash
# Ollama-Status prüfen
ps aux | grep ollama
systemctl status ollama

# Logs untersuchen
journalctl -u ollama -f
tail -f ~/.ollama/logs/server.log
```

**Lösungsansätze:**

```bash
# Ollama neu starten
sudo systemctl restart ollama

# Manuell starten
ollama serve &

# Firewall prüfen
sudo ufw status
sudo iptables -L INPUT | grep 11434

# Firewall-Regel hinzufügen
sudo ufw allow 11434/tcp
```

#### Problem: Modell-Laden dauert zu lange
```bash
# Modell-Status prüfen
ollama ps
ollama show llama3.1:8b
```

**Optimierungsansätze:**

```bash
# Modell im Speicher vorhalten
ollama run llama3.1:8b --keepalive 60m

# GPU-Beschleunigung aktivieren (falls verfügbar)
nvidia-smi
CUDA_VISIBLE_DEVICES=0 ollama serve

# Kleineres Modell verwenden
ollama pull gemma:2b
```

### 3. Dokumentenverarbeitung-Probleme

#### Problem: Upload schlägt fehl
```bash
# Upload-Verzeichnis prüfen
ls -la data/documents/
stat data/documents/

# Berechtigungen überprüfen
ls -la data/
whoami
```

**Lösungsansätze:**

```bash
# Verzeichnisse erstellen und Berechtigungen setzen
mkdir -p data/{documents,vectordb,logs,temp}
sudo chown -R $USER:$USER data/
chmod -R 755 data/

# Festplattenplatz prüfen
df -h
du -sh data/

# Temporäre Dateien bereinigen
find data/temp -type f -mtime +1 -delete
```

#### Problem: PDF-Verarbeitung fehlgeschlagen
```bash
# PDF-Tools prüfen
which pdftotext
which pdf2txt.py
python3 -c "import PyPDF2; print('PyPDF2 OK')"
```

**Lösungsansätze:**

```bash
# PDF-Abhängigkeiten installieren
# Ubuntu/Debian
sudo apt-get install poppler-utils python3-pip
pip3 install PyPDF2 pdfplumber

# macOS
brew install poppler
pip3 install PyPDF2 pdfplumber

# Test PDF-Extraktion
pdftotext test.pdf test.txt
cat test.txt
```

## Performance-Probleme

### 1. Langsame Antwortzeiten

#### Problem: Abfragen dauern über 30 Sekunden
```bash
# Performance-Metriken sammeln
time curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Test"}'
```

**Optimierungsansätze:**

```bash
# System-Ressourcen prüfen
htop
free -h
iostat -x 1 5

# Ollama-Performance optimieren
export OLLAMA_NUM_PARALLEL=4
export OLLAMA_MAX_QUEUE=100
ollama serve

# Kleineres/schnelleres Modell verwenden
ollama pull gemma:2b
# In .env ändern: OLLAMA_MODEL=gemma:2b
```

#### Problem: Hoher Speicherverbrauch
```bash
# Speicherverbrauch analysieren
ps aux --sort=-%mem | head -10
sudo smem -tk | grep -E "(ollama|projektSusi|node)"
```

**Lösungsansätze:**

```bash
# Node.js Speicher begrenzen
export NODE_OPTIONS="--max-old-space-size=2048"

# Swap-Speicher überprüfen/aktivieren
swapon --show
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Modell-Caching optimieren
# In .env hinzufügen:
OLLAMA_MODELS_CACHE_SIZE=2048
```

### 2. Festplattenplatz-Probleme

#### Problem: "Kein Speicherplatz verfügbar"
```bash
# Speicherverbrauch analysieren
df -h
du -sh data/* | sort -hr
du -sh ~/.ollama/models/*
```

**Aufräumungsstrategien:**

```bash
# Temporäre Dateien löschen
find data/temp -type f -mtime +7 -delete
find data/logs -name "*.log" -mtime +30 -delete

# Alte Dokumente archivieren
mkdir -p archive/documents
find data/documents -mtime +90 -exec mv {} archive/documents/ \;

# Ollama-Modelle bereinigen
ollama list
ollama rm old-model:version

# Docker-Images bereinigen (falls verwendet)
docker system prune -f
```

## Netzwerk- und Sicherheitsprobleme

### 1. Firewall-Konfiguration

#### Problem: Zugriff von externen Geräten funktioniert nicht
```bash
# Firewall-Status prüfen
sudo ufw status verbose
sudo iptables -L INPUT -n
```

**Lösungsansätze:**

```bash
# UFW (Ubuntu Firewall)
sudo ufw allow 3000/tcp comment "ProjectSusi Web Interface"
sudo ufw allow from 192.168.1.0/24 to any port 3000

# iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables-save > /etc/iptables/rules.v4

# Windows Firewall
netsh advfirewall firewall add rule name="ProjectSusi" dir=in action=allow protocol=TCP localport=3000
```

### 2. HTTPS/SSL-Probleme

#### Problem: SSL-Zertifikat-Fehler
```bash
# Zertifikat prüfen
openssl s_client -connect localhost:3000 -servername localhost
```

**Selbstsigniertes Zertifikat erstellen:**

```bash
# SSL-Zertifikat generieren
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Express HTTPS konfigurieren
cat >> .env << 'EOF'
HTTPS_ENABLED=true
SSL_CERT_PATH=./cert.pem
SSL_KEY_PATH=./key.pem
EOF
```

## Datenbank- und Speicher-Probleme

### 1. Vector-Datenbank Korruption

#### Problem: "Vector DB not accessible"
```bash
# Vector-DB Status prüfen
ls -la data/vectordb/
file data/vectordb/*
```

**Reparaturansätze:**

```bash
# Backup erstellen
cp -r data/vectordb data/vectordb.backup.$(date +%Y%m%d)

# Datenbank neu initialisieren
rm -rf data/vectordb/*
npm run db:init

# Dokumente neu indizieren
npm run reindex:all
```

### 2. Datenbank-Migration-Probleme

#### Problem: Migrations schlagen fehl
```bash
# Migration-Status prüfen
npm run db:status
```

**Lösungsansätze:**

```bash
# Manuelle Migration
npm run db:migrate:up
npm run db:migrate:down
npm run db:migrate:latest

# Datenbank zurücksetzen (Vorsicht: Datenverlust!)
npm run db:reset
npm run db:seed
```

## Automatisierte Problemdiagnose

### Vollständiges Diagnosescript

```bash
cat > full-diagnosis.sh << 'EOF'
#!/bin/bash

echo "=== ProjectSusi Vollständige Diagnose ==="
echo "Datum: $(date)"
echo "Benutzer: $(whoami)"
echo "System: $(uname -a)"
echo ""

# 1. System-Ressourcen
echo "1. SYSTEM-RESSOURCEN"
echo "RAM: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "Festplatte: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " belegt)"}')"
echo "CPU-Last: $(uptime | awk -F'load average:' '{print $2}')"
echo ""

# 2. Services
echo "2. SERVICE-STATUS"
curl -s http://localhost:3000/health >/dev/null && echo "✓ ProjectSusi: OK" || echo "✗ ProjectSusi: Fehler"
curl -s http://localhost:11434/api/version >/dev/null && echo "✓ Ollama: OK" || echo "✗ Ollama: Fehler"
echo ""

# 3. Ports
echo "3. PORT-STATUS"
netstat -tuln | grep -E ":3000|:11434" || echo "Keine Services auf Standard-Ports"
echo ""

# 4. Verzeichnisse
echo "4. VERZEICHNIS-STATUS"
[ -d "data/documents" ] && echo "✓ Dokumente-Verzeichnis" || echo "✗ Dokumente-Verzeichnis fehlt"
[ -d "data/vectordb" ] && echo "✓ Vector-DB Verzeichnis" || echo "✗ Vector-DB Verzeichnis fehlt"
[ -w "data" ] && echo "✓ Schreibberechtigung" || echo "✗ Keine Schreibberechtigung"
echo ""

# 5. Ollama-Modelle
echo "5. OLLAMA-MODELLE"
ollama list 2>/dev/null || echo "Ollama nicht verfügbar oder keine Modelle"
echo ""

# 6. Logs (letzte Fehler)
echo "6. LETZTE FEHLER"
if [ -f "data/logs/projektSusi.log" ]; then
    grep -i "error\|exception\|fehler" data/logs/projektSusi.log | tail -3
else
    echo "Keine Log-Datei gefunden"
fi
echo ""

# 7. Konfiguration
echo "7. KONFIGURATION"
if [ -f ".env" ]; then
    echo "✓ .env Datei vorhanden"
    echo "Wichtige Einstellungen:"
    grep -E "^(PORT|OLLAMA_HOST|NODE_ENV)" .env 2>/dev/null || echo "Keine Standardvariablen gefunden"
else
    echo "✗ .env Datei fehlt"
fi

echo ""
echo "=== Diagnose abgeschlossen ==="
EOF

chmod +x full-diagnosis.sh
```

### Automatische Fehlerbehebung

```bash
cat > auto-fix.sh << 'EOF'
#!/bin/bash

echo "=== ProjectSusi Auto-Fix ==="

# 1. Verzeichnisse erstellen
mkdir -p data/{documents,vectordb,logs,temp}
chmod -R 755 data/

# 2. Standard .env erstellen (falls nicht vorhanden)
if [ ! -f ".env" ]; then
    echo "Erstelle Standard-.env..."
    cat > .env << 'EOL'
NODE_ENV=production
PORT=3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
MAX_DOCUMENT_SIZE=52428800
UPLOAD_DIRECTORY=./data/documents
VECTOR_DB_PATH=./data/vectordb
LOG_LEVEL=info
LOG_FILE=./data/logs/projektSusi.log
EOL
fi

# 3. Ollama starten (falls nicht läuft)
if ! curl -s http://localhost:11434/api/version >/dev/null; then
    echo "Starte Ollama..."
    ollama serve &
    sleep 5
fi

# 4. Standard-Modell herunterladen (falls nicht vorhanden)
if ! ollama list | grep -q "llama3.1"; then
    echo "Lade Standard-Modell..."
    ollama pull llama3.1:8b
fi

# 5. Log-Rotation einrichten
cat > /etc/logrotate.d/projektsusi << 'EOL'
./data/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
EOL

echo "✓ Auto-Fix abgeschlossen"
EOF

chmod +x auto-fix.sh
```

## Support und Community-Hilfe

### 1. Log-Sammlung für Support

```bash
cat > collect-support-logs.sh << 'EOF'
#!/bin/bash

SUPPORT_DIR="support-$(date +%Y%m%d-%H%M%S)"
mkdir -p $SUPPORT_DIR

# System-Informationen
uname -a > $SUPPORT_DIR/system-info.txt
free -h >> $SUPPORT_DIR/system-info.txt
df -h >> $SUPPORT_DIR/system-info.txt

# Konfiguration (ohne Geheimnisse)
grep -v -E "(SECRET|PASSWORD|TOKEN)" .env > $SUPPORT_DIR/config.txt 2>/dev/null

# Logs
cp data/logs/*.log $SUPPORT_DIR/ 2>/dev/null

# Ollama-Status
ollama list > $SUPPORT_DIR/ollama-models.txt 2>/dev/null
curl -s http://localhost:11434/api/version > $SUPPORT_DIR/ollama-version.txt

# Fehlerbericht erstellen
./full-diagnosis.sh > $SUPPORT_DIR/diagnosis.txt

# Archiv erstellen
tar -czf $SUPPORT_DIR.tar.gz $SUPPORT_DIR/
echo "Support-Paket erstellt: $SUPPORT_DIR.tar.gz"
rm -rf $SUPPORT_DIR/
EOF

chmod +x collect-support-logs.sh
```

### 2. Community-Ressourcen

**Hilfreiche Links:**
- GitHub Issues: [ProjectSusi Issues](https://github.com/projektSusi/issues)
- Dokumentation: [Vollständige Dokumentation](https://projektSusi.de/docs)
- Community Forum: [Diskussionen und Hilfe](https://community.projektSusi.de)
- Discord Server: [Echtzeit-Support](https://discord.gg/projektSusi)

### 3. Häufige Fragen (FAQ)

**Q: Warum sind die Antworten auf Englisch, obwohl ich deutsche Dokumente verwende?**
A: Überprüfen Sie, ob Sie ein deutschsprachiges Modell verwenden. Empfohlen: `llama3.1:8b` mit deutscher Systemnachricht.

**Q: Kann ich ProjectSusi ohne Internet nutzen?**
A: Ja, nach der initialen Installation und dem Modell-Download läuft alles offline.

**Q: Wie kann ich die Performance verbessern?**
A: Verwenden Sie GPU-Beschleunigung, erhöhen Sie den RAM, oder nutzen Sie kleinere Modelle wie `gemma:2b`.

**Q: Sind meine Dokumente sicher?**
A: Ja, alle Daten bleiben lokal auf Ihrem System. Keine Cloud-Übertragung.

```bash
echo "=== Troubleshooting-Guide abgeschlossen ==="
echo "Falls Probleme bestehen bleiben:"
echo "1. Führen Sie ./full-diagnosis.sh aus"
echo "2. Versuchen Sie ./auto-fix.sh"
echo "3. Erstellen Sie Support-Logs mit ./collect-support-logs.sh"
echo "4. Kontaktieren Sie die Community oder erstellen Sie ein GitHub Issue"
```

Dieser umfassende Troubleshooting-Guide sollte die meisten Installationsund Konfigurationsprobleme lösen. Fahren Sie nun mit der detaillierten Web-Interface-Anleitung fort.