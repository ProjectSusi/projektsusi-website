# Ollama Setup & Modell-Konfiguration

## Einführung in Ollama

Ollama ist eine leistungsstarke Plattform zur lokalen Ausführung von Large Language Models (LLMs). Es ermöglicht ProjectSusi, KI-Funktionen vollständig offline und datenschutzfreundlich bereitzustellen.

## Ollama-Grundkonfiguration

### Ollama-Dienst starten

```bash
# Ollama-Dienst starten (automatisch bei Installation)
ollama serve

# Status überprüfen
curl http://localhost:11434/api/tags
```

### Verfügbare Modelle anzeigen
```bash
# Installierte Modelle auflisten
ollama list

# Verfügbare Modelle im Repository anzeigen
ollama search llama
```

## Empfohlene Modelle für ProjectSusi

### Für deutsche Dokumentenanalyse

#### 1. Llama 3.1 (Empfohlen für die meisten Anwender)
```bash
# 8B Modell (8 GB RAM erforderlich)
ollama pull llama3.1:8b

# 70B Modell (für höchste Qualität, 40+ GB RAM erforderlich)
ollama pull llama3.1:70b
```

**Eigenschaften:**
- Ausgezeichnete deutsche Sprachunterstützung
- Gute Balance zwischen Geschwindigkeit und Qualität
- Optimiert für Dokumentenanalyse

#### 2. Mixtral (Für technische Dokumente)
```bash
# Mixtral 8x7B
ollama pull mixtral:8x7b

# Mixtral Instruct (besser für Anweisungen)
ollama pull mixtral:8x7b-instruct
```

**Eigenschaften:**
- Hervorragend für technische Inhalte
- Unterstützt mehrere Sprachen gleichzeitig
- Gute Code-Verständnis-Fähigkeiten

#### 3. Gemma (Ressourcenschonend)
```bash
# Gemma 7B (für schwächere Hardware)
ollama pull gemma:7b

# Gemma 2B (für sehr begrenzte Ressourcen)
ollama pull gemma:2b
```

**Eigenschaften:**
- Geringerer Speicherverbrauch
- Schnelle Antwortzeiten
- Gut für einfache Dokumentenabfragen

### Modell-Größen und Systemanforderungen

| Modell | Parameter | RAM (Min) | RAM (Empf.) | Qualität | Geschwindigkeit |
|--------|-----------|-----------|-------------|----------|----------------|
| Gemma 2B | 2 Milliarden | 4 GB | 8 GB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Gemma 7B | 7 Milliarden | 8 GB | 16 GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Llama3.1 8B | 8 Milliarden | 8 GB | 16 GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Mixtral 8x7B | 47 Milliarden | 24 GB | 48 GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Llama3.1 70B | 70 Milliarden | 40 GB | 64 GB | ⭐⭐⭐⭐⭐ | ⭐⭐ |

## Benutzerdefinierte Modellkonfiguration

### Modelfile erstellen

Erstellen Sie eine Datei namens `Modelfile` für ProjectSusi-spezifische Optimierungen:

```dockerfile
FROM llama3.1:8b

# Systemanweisungen für deutsche Dokumentenanalyse
SYSTEM """Du bist ein KI-Assistent speziell für die Analyse deutscher Dokumente. 
Deine Aufgaben:
1. Präzise Beantwortung von Fragen zu Dokumenteninhalten
2. Bereitstellung genauer Seitenzahlen und Zeilenangaben
3. Zusammenfassung komplexer Inhalte
4. Erkennung von wichtigen Informationen und Zusammenhängen

Antworte immer auf Deutsch und verwende dabei eine klare, professionelle Sprache.
Gib bei jeder Antwort die Quelle im Format "Seite X, Zeile Y" an.
"""

# Parameter für bessere Performance
PARAMETER temperature 0.3
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.1
PARAMETER num_ctx 4096
```

### Benutzerdefiniertes Modell erstellen
```bash
# Modell mit Konfiguration erstellen
ollama create projektsusi-llama3.1 -f Modelfile

# Modell testen
ollama run projektsusi-llama3.1 "Analysiere folgendes Dokument..."
```

## GPU-Beschleunigung konfigurieren

### NVIDIA GPU (CUDA)
```bash
# CUDA-Installation prüfen
nvidia-smi

# Ollama mit GPU-Unterstützung
OLLAMA_GPU=nvidia ollama serve
```

### AMD GPU (ROCm)
```bash
# ROCm-Installation prüfen
rocm-smi

# Ollama mit AMD GPU
OLLAMA_GPU=rocm ollama serve
```

### Umgebungsvariablen für GPU
```bash
# In .env Datei hinzufügen
OLLAMA_GPU_ENABLED=true
OLLAMA_GPU_LAYERS=35  # Anzahl der GPU-Schichten
OLLAMA_GPU_MEMORY=8G  # GPU-Speicher-Limit
```

## Modell-Performance optimieren

### Speicher-Management
```bash
# Modell im Speicher vorhalten
ollama run llama3.1:8b --keepalive 30m

# Modell aus Speicher entfernen
ollama rm llama3.1:8b
```

### Konkurrenzverarbeitung
```json
{
  "ollama": {
    "concurrent_requests": 4,
    "max_context_length": 4096,
    "batch_size": 512
  }
}
```

## Modell-spezifische Einstellungen

### Für juristische Dokumente
```bash
ollama create legal-assistant -f - <<EOF
FROM llama3.1:8b
SYSTEM "Du bist spezialisiert auf deutsche Rechtsdokumente. Analysiere Verträge, Gesetze und juristische Texte mit höchster Präzision."
PARAMETER temperature 0.1
PARAMETER top_p 0.8
EOF
```

### Für technische Dokumentation
```bash
ollama create tech-docs-assistant -f - <<EOF
FROM mixtral:8x7b-instruct
SYSTEM "Du analysierst technische Dokumentationen, Handbücher und Spezifikationen. Erkenne technische Details und Zusammenhänge."
PARAMETER temperature 0.2
PARAMETER num_ctx 8192
EOF
```

### Für wissenschaftliche Arbeiten
```bash
ollama create research-assistant -f - <<EOF
FROM llama3.1:8b
SYSTEM "Du hilfst bei der Analyse wissenschaftlicher Arbeiten. Erkenne Methodologien, Ergebnisse und wissenschaftliche Zusammenhänge."
PARAMETER temperature 0.4
PARAMETER repeat_penalty 1.2
EOF
```

## Modell-Updates und Wartung

### Automatische Updates
```bash
# Update-Script erstellen
cat > update-models.sh << 'EOF'
#!/bin/bash
echo "Aktualisiere Ollama-Modelle..."
ollama pull llama3.1:8b
ollama pull mixtral:8x7b-instruct
ollama pull gemma:7b
echo "Update abgeschlossen."
EOF

chmod +x update-models.sh
```

### Cron-Job für regelmäßige Updates
```bash
# Crontab bearbeiten
crontab -e

# Zeile hinzufügen (wöchentliche Updates am Sonntag 2:00 Uhr)
0 2 * * 0 /path/to/update-models.sh
```

## Debugging und Problemlösung

### Modell-Status überprüfen
```bash
# Detaillierte Modell-Informationen
ollama show llama3.1:8b

# Modell-Performance testen
time ollama run llama3.1:8b "Beschreibe die deutsche Sprache kurz."
```

### Speicher-Probleme
```bash
# Verfügbaren Speicher prüfen
free -h

# Modell-Speicherverbrauch anzeigen
ollama ps
```

### Log-Analyse
```bash
# Ollama-Logs anzeigen
journalctl -u ollama -f

# Detaillierte Logs aktivieren
OLLAMA_DEBUG=1 ollama serve
```

## Erweiterte Konfiguration

### API-Endpoints anpassen
```json
{
  "ollama_config": {
    "host": "0.0.0.0",
    "port": 11434,
    "origins": ["http://localhost:3000"],
    "max_queue_size": 100
  }
}
```

### Sicherheitseinstellungen
```bash
# Zugriff nur von localhost
OLLAMA_HOST=127.0.0.1:11434 ollama serve

# Mit API-Schlüssel (wenn verfügbar)
OLLAMA_API_KEY=your-api-key ollama serve
```

## Nächste Schritte

Nach der Ollama-Konfiguration:
1. **Umgebungsvalidierung** durchführen
2. **Erste Testabfragen** starten
3. **Performance-Monitoring** einrichten
4. **Web-Interface** erkunden

Ihre Ollama-Installation ist nun optimal für ProjectSusi konfiguriert. Fahren Sie mit der Umgebungsvalidierung fort.