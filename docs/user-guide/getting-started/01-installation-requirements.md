# Installation & System Requirements

## Übersicht

Willkommen zu ProjectSusi! Diese Anleitung führt Sie durch die Installation und Einrichtung Ihres intelligenten Dokumentenassistenten. ProjectSusi kombiniert modernste KI-Technologie mit lokaler Verarbeitung für maximale Datensicherheit.

## Systemanforderungen

### Mindestanforderungen
- **Betriebssystem**: Windows 10/11, macOS 10.15+, oder Linux (Ubuntu 18.04+)
- **RAM**: 8 GB (16 GB empfohlen für bessere Leistung)
- **Festplatte**: 10 GB freier Speicherplatz
- **CPU**: Intel i5 oder AMD Ryzen 5 (neuere Generation)
- **GPU**: Optional, aber empfohlen für schnellere Verarbeitung

### Empfohlene Spezifikationen
- **RAM**: 32 GB oder mehr
- **GPU**: NVIDIA RTX 3060 oder besser (für GPU-beschleunigte Modelle)
- **SSD**: Für verbesserte Ladezeiten der Dokumente
- **Internetverbindung**: Für initiale Installation und Updates

## Installationsschritte

### 1. Ollama Installation

Ollama ist das Herzstück von ProjectSusi und ermöglicht die lokale Ausführung von KI-Modellen.

#### Windows Installation
```powershell
# Download Ollama für Windows
Invoke-WebRequest -Uri "https://ollama.com/download/windows" -OutFile "ollama-windows.exe"

# Installation ausführen
.\ollama-windows.exe
```

#### macOS Installation
```bash
# Mit Homebrew (empfohlen)
brew install ollama

# Oder direkt herunterladen
curl -fsSL https://ollama.com/install.sh | sh
```

#### Linux Installation
```bash
# Ubuntu/Debian
curl -fsSL https://ollama.com/install.sh | sh

# Oder manuell
wget https://ollama.com/download/linux -O ollama-linux
chmod +x ollama-linux
sudo mv ollama-linux /usr/local/bin/ollama
```

### 2. ProjectSusi Installation

#### Option A: Vorkompilierte Version (Empfohlen)
```bash
# Download der neuesten Version
wget https://github.com/projektSusi/releases/latest/download/projektsusi-linux.tar.gz

# Entpacken
tar -xzf projektsusi-linux.tar.gz

# In Verzeichnis wechseln
cd projektsusi

# Ausführbar machen
chmod +x projektsusi
```

#### Option B: Aus Quellcode kompilieren
```bash
# Repository klonen
git clone https://github.com/projektSusi/projektSusi.git
cd projektSusi

# Abhängigkeiten installieren
npm install

# Build erstellen
npm run build

# Produktionsversion starten
npm run start:prod
```

## Erste Konfiguration

### 1. Umgebungsvariablen einrichten

Erstellen Sie eine `.env` Datei im Hauptverzeichnis:

```env
# Ollama Konfiguration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Anwendungseinstellungen
PORT=3000
NODE_ENV=production

# Dokumentenverarbeitung
MAX_DOCUMENT_SIZE=50MB
SUPPORTED_FORMATS=pdf,docx,txt,md

# Sicherheitseinstellungen
UPLOAD_DIRECTORY=/data/documents
VECTOR_DB_PATH=/data/vectordb
```

### 2. Dienst-Konfiguration

#### Windows (als Dienst)
```powershell
# PowerShell als Administrator
New-Service -Name "ProjectSusi" -BinaryPathName "C:\Path\To\projektsusi.exe" -StartupType Automatic
Start-Service -Name "ProjectSusi"
```

#### Linux (systemd)
```bash
# Service-Datei erstellen
sudo nano /etc/systemd/system/projektsusi.service
```

Inhalt der Service-Datei:
```ini
[Unit]
Description=ProjectSusi Document Assistant
After=network.target

[Service]
Type=simple
User=projektsusi
WorkingDirectory=/opt/projektsusi
ExecStart=/opt/projektsusi/projektsusi
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Service aktivieren und starten
sudo systemctl enable projektsusi
sudo systemctl start projektsusi
```

## Netzwerk-Konfiguration

### Firewall-Einstellungen
```bash
# Linux (UFW)
sudo ufw allow 3000/tcp

# Windows Firewall
netsh advfirewall firewall add rule name="ProjectSusi" dir=in action=allow protocol=TCP localport=3000
```

### Reverse Proxy (Optional)
Für Produktionsumgebungen empfehlen wir Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Sicherheitsüberlegungen

### Datenverarbeitung
- **Lokale Verarbeitung**: Alle Dokumente bleiben auf Ihrem System
- **Keine Cloud-Verbindung**: KI-Modelle laufen vollständig lokal
- **Verschlüsselung**: Dokumente werden verschlüsselt gespeichert

### Zugriffskontrolle
```bash
# Benutzer für ProjectSusi erstellen
sudo useradd -r -s /bin/false projektsusi

# Verzeichnisberechtigungen setzen
sudo chown -R projektsusi:projektsusi /opt/projektsusi
sudo chmod 750 /opt/projektsusi
```

## Troubleshooting

### Häufige Probleme

**Port bereits in Verwendung**
```bash
# Port prüfen
netstat -tulpn | grep :3000

# Prozess beenden
sudo kill -9 $(lsof -t -i:3000)
```

**Ollama-Verbindungsprobleme**
```bash
# Ollama-Status prüfen
ollama list

# Ollama neu starten
sudo systemctl restart ollama
```

**Speicherplatz-Probleme**
```bash
# Festplattennutzung prüfen
df -h

# Temporäre Dateien bereinigen
rm -rf /tmp/projektsusi-*
```

### Log-Dateien
```bash
# Anwendungslogs anzeigen
tail -f /var/log/projektsusi/app.log

# Systemlogs prüfen
journalctl -u projektsusi -f
```

## Nächste Schritte

Nach erfolgreicher Installation können Sie:
1. **Ollama-Modelle konfigurieren** (siehe nächster Abschnitt)
2. **Erste Dokumente hochladen**
3. **Testabfragen durchführen**
4. **Web-Interface erkunden**

Die Installation ist nun abgeschlossen. Fahren Sie mit der Ollama-Konfiguration fort, um die KI-Modelle einzurichten.