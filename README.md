# 💳 Kreditkarten Gebührenvergleich

Eine eigenständige Webseite zum Vergleich von Fremdwährungsgebühren bei Kreditkarten. Perfekt für Reisende, um die beste Karte für internationale Transaktionen zu finden!

## 🎯 Funktionen

- **Gebührenvergleich**: Vergleiche mehrere Kreditkarten basierend auf ihren Fremdwährungsgebühren
- **Wechselkurs-Integration**: Berücksichtige aktuelle Wechselkurse in deinen Berechnungen
- **Kosteneffektivität**: Identifiziere sofort die beste Karte für deine Transaktion
- **Lokaler Speicher**: Deine Kartendaten werden lokal im Browser gespeichert (keine Cloud)
- **Import/Export**: Sichere deine Karteneinstellungen als JSON Datei
- **Responsive Design**: Funktioniert auf Desktop, Tablet und Handy
- **Offline-Fähig**: Arbeitet vollständig offline nach dem ersten Laden

## 🚀 Schnellstart

### Lokal im Browser öffnen

1. Klone das Repository:
```bash
git clone https://github.com/mynimu/Best-FX.git
cd Best-FX
```

2. Öffne `index.html` direkt im Browser:
```bash
# Auf macOS
open index.html

# Auf Linux
xdg-open index.html

# Auf Windows
start index.html
```

Oder nutze einen lokalen Server:
```bash
# Mit Python 3
python -m http.server 8000

# Mit Node.js (http-server)
npx http-server

# Mit PHP
php -S localhost:8000
```

Dann öffne `http://localhost:8000` im Browser.

### Auf GitHub Pages verwenden

Diese App ist auf GitHub Pages gehostet und kann direkt im Browser verwendet werden:

👉 **[Best-FX auf GitHub Pages](https://mynimu.github.io/Best-FX/)**

## 📖 Benutzungsanleitung

### Schritt 1: Deine Kreditkarten hinzufügen

1. Gebe den Namen deiner Karte ein (z.B. "ING DiBa VISA")
2. Gebe die Fremdwährungsgebühr ein (z.B. 0%, 1.5%, 2%)
3. Klicke "+ Karte hinzufügen"

**Wo findest du die Gebühreninfo?**
- **ING DiBa**: https://www.cardcomplete.com/service/umsatznachricht/fremdwaehrungen/
- **N26**: Direktbanking App oder Website
- **Wise (ehemals TransferWise)**: www.wise.com
- **Revolut**: App oder Website
- **Deine Bank**: Kontoauszüge oder Online-Banking

### Schritt 2: Transaktionsdetails eingeben

1. **Transaktionsbetrag**: Gebe den Betrag ein, den du ausgeben möchtest
2. **Von Währung**: Wähle deine Heimatwährung (z.B. EUR)
3. **In Währung**: Wähle die Währung des Landes, in dem du dich befindest
4. **Wechselkurs**: Gebe den aktuellen Wechselkurs ein (z.B. 1 EUR = 1.15 USD)

**Aktuelle Wechselkurse finden:**
- Google: "1 EUR to USD"
- XE.com: https://www.xe.com/
- OANDA: https://www.oanda.com/
- Deine Bank: Online-Banking

### Schritt 3: Ergebnisse vergleichen

Die App zeigt automatisch:
- ✅ Die beste Karte (niedrigste Gesamtkosten)
- 💰 Die Gebühr für jede Karte
- 📊 Eine Tabelle mit allen Kosten

## 💾 Daten speichern & teilen

### Daten exportieren
1. Klicke "📥 Daten exportieren (JSON)"
2. Eine JSON-Datei wird heruntergeladen
3. Teile diese Datei mit Freunden

### Daten importieren
1. Klicke "📤 Daten importieren"
2. Wähle eine zuvor exportierte JSON-Datei
3. Deine Karteneinstellungen werden wiederhergestellt

### Lokal speichern
Die App speichert automatisch alle Kartendaten im LocalStorage deines Browsers. Diese bleiben auch nach dem Neuladen der Seite erhalten.

## 📊 Beispiel: Wie funktioniert die Berechnung?

**Szenario:**
- Du hast 100 EUR und möchtest in USD bezahlen
- Wechselkurs: 1 EUR = 1.15 USD
- Deine Karten: ING DiBa (1.5% Gebühr), Wise (0.5% Gebühr)

**Berechnung:**

| Karte | Gebührsatz | Gebühr | Gesamtbetrag |
|-------|-----------|--------|-------------|
| Wise | 0.5% | 0.50 EUR | 100.50 EUR |
| ING DiBa | 1.5% | 1.50 EUR | 101.50 EUR |

**Ersparnis:** 1.00 EUR = Differenz zwischen bester und teuerster Karte

## 🔧 Technologie

- **HTML5**: Struktur
- **CSS3**: Modernes, responsives Design
- **JavaScript (Vanilla)**: Logik ohne externe Abhängigkeiten
- **LocalStorage API**: Persistente Datenspeicherung
- **GitHub Pages**: Kostenlose Hosting-Lösung

## 📁 Dateistruktur

```
Best-FX/
├── index.html          # Hauptseite
├── styles.css          # Stylesheet
├── app.js              # JavaScript Logik
├── manifest.json       # PWA Manifest
├── sw.js               # Service Worker (offline cache)
├── README.md           # Diese Datei
└── .github/
    └── workflows/      # GitHub Actions (optional)
```

## 🌐 GitHub Pages Einrichtung

Die App läuft bereits auf GitHub Pages. Um sie für dein eigenes Repository zu aktivieren:

1. Gehe zu Repository Settings → Pages
2. Wähle "Deploy from a branch"
3. Wähle Branch: `main` und Folder: `/ (root)`
4. Speichern

Deine App ist dann unter `https://USERNAME.github.io/Best-FX/` erreichbar.

## 📱 PWA (Installierbar auf Mobilgeräten)

Dieses Projekt ist als Progressive Web App (PWA) konfiguriert. Du kannst die Seite installieren, damit sie sich wie eine native App verhält.

Voraussetzungen:
- Die Seite muss über HTTPS laufen (oder `localhost`).
- Ein Service Worker muss registriert werden (wird automatisch gemacht)

Installation (Android Chrome):
1. Öffne die Seite (z.B. `http://localhost:8000` in deinem lokalen Server oder GitHub Pages URL)
2. Chrome zeigt eine Option in der Adresszeile oder im Menü: „Zum Startbildschirm hinzufügen“ oder „Installieren".
3. Nach der Installation startet die App im Fullscreen-Modus.

Für lokale Installation auf dem Android-Handy verwende die Anweisungen in `OFFLINE.md` (Abschnitt Termux — localhost ist eine sichere Quelle für PWA-Installation).

## 📝 Gebühren-Ressourcen

### Deutsche Banken & Fintech:
- **ING DiBa**: https://www.cardcomplete.com/service/umsatznachricht/fremdwaehrungen/
- **Commerzbank**: https://www.commerzbank.de/
- **Sparkasse**: https://www.sparkasse.de/
- **Comdirect**: https://www.comdirect.de/

### Internationale Anbieter:
- **Wise**: https://wise.com/de/
- **Revolut**: https://www.revolut.com/
- **N26**: https://n26.com/
- **Transferwise**: https://wise.com/

## 🤝 Beitragen

Hast du Verbesserungsvorschläge? Erstelle einen Issue oder einen Pull Request!

## 📄 Lizenz

Dieses Projekt ist Open Source und frei nutzbar.

## 💡 Tipps & Tricks

1. **Speichere die Seite lokal**: Nutze deinen Browser zum Speichern (Rechtsklick → Speichern unter), um sie offline zu nutzen
2. **Vergleich über längere Zeit**: Exportiere regelmäßig deine Daten, um Trends zu verfolgen
3. **Neue Karten testen**: Nutze die App, um neue Kreditkarten zu evaluieren
4. **Reisebudget-Planung**: Nutze die App bei der Reisevorbereitung für dein Budget

## ❓ FAQ

**F: Meine Daten sind doch online, richtig?**  
A: Nein! Alles wird lokal in deinem Browser gespeichert. Keine Daten werden an Server übertragen.

**F: Kann ich die App offline nutzen?**  
A: Ja, nach dem ersten Laden funktioniert die App vollständig offline.

**F: Werden meine Kartendaten gespeichert?**  
A: Nur lokal auf deinem Computer im Browser. Du kannst diese jederzeit exportieren oder löschen.

**F: Kann ich mehrere Geräte synchronisieren?**  
A: Exportiere deine Daten als JSON und importiere sie auf einem anderen Gerät.

---

**Viel Erfolg beim Sparen! 💰**
